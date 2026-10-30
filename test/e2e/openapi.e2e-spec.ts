import type { OpenAPIObject } from '@nestjs/swagger';
import { buildOpenApiDocument } from '../../src/bootstrap/openapi.js';
import { startApp, type E2eApp } from './support/app.js';

type Operation = { security?: unknown[]; responses: Record<string, { description?: string; content?: unknown }> };
type Schema = { properties?: Record<string, { type?: string; items?: { type?: string; $ref?: string }; description?: string }> };

let e2e: E2eApp;
let document: OpenAPIObject;

beforeAll(async () => {
  e2e = await startApp();
  document = buildOpenApiDocument(e2e.app);
});

afterAll(async () => {
  await e2e?.stop();
});

const operation = (path: string, method: string) => (document.paths[path] as Record<string, Operation>)[method];
const schema = (name: string) => document.components!.schemas![name] as Schema;

describe('OpenAPI', () => {
  it('documents the public paths without security', () => {
    expect(operation('/v1/health', 'get').security).toBeUndefined();
    expect(operation('/v1/npcs', 'get').security).toEqual([{ oauth2: [], 'access-token': [] }]);
  });

  it('documents the content of a page as an array of NPCs', () => {
    expect(schema('NpcPageDto').properties!.content).toMatchObject({ type: 'array', items: { $ref: '#/components/schemas/NpcDto' } });
  });

  it('documents 201 for the creation', () => {
    expect(Object.keys(operation('/v1/npcs', 'post').responses)).toContain('201');
    expect(Object.keys(operation('/v1/npcs', 'post').responses)).not.toContain('200');
  });

  it('documents the attacks as structured objects', () => {
    expect(schema('CreateNpcDto').properties!.attacks).toMatchObject({
      type: 'array',
      items: { $ref: '#/components/schemas/NpcAttackDto' },
    });
    expect(schema('UpdateNpcDto').properties!.realmId).toBeUndefined();
  });

  it('uses examples of NPCs in the error format', () => {
    expect(JSON.stringify(schema('ErrorDto'))).toMatch(/\/v1\/npcs\//);
  });
});
