import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

import { TokenService } from '../../../auth/token.service';
import { AttackTablePort } from '../../application/ports/attack-table.port';

@Injectable()
export class ApiAttackTableAdapter implements AttackTablePort {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  async getAttackTables(): Promise<string[]> {
    const token = await this.tokenService.getToken();
    const apiCoreUri = this.configService.get('RMU_API_ATTACK_TABLES_URI') as string;
    const uri = `${apiCoreUri}/attack-tables`;
    const response = await axios.get(uri, { headers: { Authorization: `Bearer ${token}` } });
    return response.data as string[];
  }
}
