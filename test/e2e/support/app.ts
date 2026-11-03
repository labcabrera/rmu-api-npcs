import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import type { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import request from 'supertest';
import { configureHttp } from '../../../src/bootstrap/http.js';
import { REALM_PORT, type Realm, type RealmPort, type RealmAccessLevel } from '../../../src/modules/npcs/application/ports/realm.port.js';
import { RealmAccessService } from '../../../src/modules/npcs/application/services/realm-access.service.js';
import { BadGatewayError } from '../../../src/modules/shared/domain/errors/errors.js';
import { KafkaProducerService } from '../../../src/modules/shared/infrastructure/messaging/kafka-producer.service.js';
import { AUDIENCE, ISSUER, LocalJwks } from './jwks.js';

export type Server = Parameters<typeof request>[0];

/** The users of the suite, by the Keycloak groups in their token. */
export const USERS = {
  admin: { sub: 'e2e-admin', groups: ['rmu-admin'] },
  /** Owns e2e-realm: core answers `manage`. */
  owner: { sub: 'e2e-owner', groups: ['rmu-user'] },
  /** e2e-realm is shared with them with `write`. */
  writer: { sub: 'e2e-writer', groups: ['rmu-user'] },
  /** e2e-realm is shared with them with `read`. */
  reader: { sub: 'e2e-reader', groups: ['rmu-user'] },
  /** A stranger to e2e-realm: core leaves it out. */
  other: { sub: 'e2e-other', groups: ['rmu-user'] },
  noRole: { sub: 'e2e-guest', groups: [] as string[] },
} as const;

export type UserName = keyof typeof USERS;

/** A message the API sent to Kafka. */
export type SentEvent = { topic: string; message: { eventType: string; producer: string; data: { id: string } & Record<string, unknown> } };

/**
 * The realms core knows about in the suite; any other id answers 404 (null). e2e-realm is a private realm of the owner,
 * e2e-public-realm a public one (as the generic realms of spec 055), which everyone reads.
 */
export const REALMS = new Map<string, Realm>([
  ['e2e-realm', { id: 'e2e-realm', name: 'E2E realm' }],
  ['e2e-public-realm', { id: 'e2e-public-realm', name: 'E2E public realm' }],
]);

/** What core answers for `realmId:userId` before REALM_ACCESS (spec 073); a missing pair is `none`. */
const DEFAULT_ACCESS: Record<string, RealmAccessLevel> = {
  'e2e-realm:e2e-owner': 'manage',
  'e2e-realm:e2e-writer': 'write',
  'e2e-realm:e2e-reader': 'read',
  'e2e-public-realm:e2e-owner': 'manage',
};

/** Overrides of what core answers for `realmId:userId`. Tests set it, then call `resetRealmAccess`. */
export const REALM_ACCESS = new Map<string, RealmAccessLevel>();

/** While true, the fake core fails the realm access map as the HttpClient would: a 502. */
export const CORE_DOWN = { value: false };

/** The level core answers for a user on a realm, as a non-admin. */
export function realmLevel(realmId: string, userId: string): RealmAccessLevel {
  const key = `${realmId}:${userId}`;
  return REALM_ACCESS.get(key) ?? DEFAULT_ACCESS[key] ?? (realmId === 'e2e-public-realm' ? 'read' : 'none');
}

export type E2eApp = {
  app: NestExpressApplication;
  server: Server;
  jwks: LocalJwks;
  /** Every message sent to Kafka, in order. */
  events: SentEvent[];
  /** The realm ids the realm port was asked for, in order. */
  realmLookups: string[];
  /** The users whose realm access map was asked to core, in order. */
  accessLookups: string[];
  /** Empties the cache of realm access, so the next request asks the fake core again (after changing REALM_ACCESS). */
  clearAccessCache: () => void;
  /** Empties REALM_ACCESS and the cache of realm access. */
  resetRealmAccess: () => void;
  auth: (user: UserName) => string;
  connection: Connection;
  stop: () => Promise<void>;
};

/**
 * Boots the whole AppModule as main.ts does (configureHttp) against an in-memory Mongo and a local JWKS. The Kafka
 * producer records what it would send (so the topics are checked), and the realm port of core answers from REALMS.
 * AppModule is imported after setting the environment, because ConfigModule.forRoot() reads it when the module is
 * evaluated.
 */
export async function startApp(env: Record<string, string> = {}): Promise<E2eApp> {
  const mongo = await MongoMemoryServer.create();
  const jwks = new LocalJwks();
  await jwks.start();
  Object.assign(process.env, {
    RMU_MONGO_NPCS_URI: mongo.getUri('rmu-npcs-e2e'),
    RMU_API_CORE_URI: 'http://localhost:1/v1',
    RMU_IAM_JWK_URI: jwks.uri,
    RMU_IAM_ISSUER_URI: ISSUER,
    RMU_IAM_AUDIENCE: AUDIENCE,
    RMU_IAM_TOKEN_URI: 'http://localhost:1/token',
    RMU_IAM_CLIENT_ID: 'rmu-api-npcs-e2e',
    RMU_IAM_CLIENT_SECRET: 'e2e',
    RMU_KAFKA_BROKERS: 'localhost:9092',
    RMU_KAFKA_CLIENT_ID: 'rmu-api-npcs-e2e',
    RMU_KAFKA_CONSUMER_GROUP_ID: 'rmu-api-npcs-e2e',
    RMU_THROTTLE_LIMIT: '0',
    RMU_CORS_ORIGINS: '',
    ...env,
  });

  const events: SentEvent[] = [];
  const realmLookups: string[] = [];
  const accessLookups: string[] = [];
  const realmPort: RealmPort = {
    fetchRealmById: (realmId: string) => {
      realmLookups.push(realmId);
      return Promise.resolve(REALMS.get(realmId) ?? null);
    },
    fetchUserAccessMap: (userId: string) => {
      accessLookups.push(userId);
      if (CORE_DOWN.value) return Promise.reject(new BadGatewayError('rmu-api-core is not available (ECONNREFUSED)'));
      const levels = [...REALMS.keys()].map(realmId => ({ realmId, level: realmLevel(realmId, userId) }));
      return Promise.resolve(levels.filter(entry => entry.level !== 'none'));
    },
  };
  const { AppModule } = await import('../../../src/app.module.js');
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(KafkaProducerService)
    .useValue({
      emit: (topic: string, message: SentEvent['message']) => {
        events.push({ topic, message: JSON.parse(JSON.stringify(message)) as SentEvent['message'] });
        return Promise.resolve();
      },
    })
    .overrideProvider(REALM_PORT)
    .useValue(realmPort)
    .compile();
  const app = moduleRef.createNestApplication<NestExpressApplication>({ logger: ['error'] });
  configureHttp(app);
  await app.init();

  return {
    app,
    server: app.getHttpServer() as Server,
    jwks,
    events,
    realmLookups,
    accessLookups,
    clearAccessCache: () => app.get(RealmAccessService).clear(),
    resetRealmAccess: () => {
      REALM_ACCESS.clear();
      app.get(RealmAccessService).clear();
    },
    auth: user => `Bearer ${jwks.token(USERS[user])}`,
    connection: app.get<Connection>(getConnectionToken()),
    stop: async () => {
      await app.close();
      await jwks.stop();
      await mongo.stop();
    },
  };
}

/** The ids of a page response. */
export const ids = (body: unknown) => (body as { content: { id: string }[] }).content.map(item => item.id);
