import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { IntegrationStatusDto } from '../dto/integration-status.dto';

@Injectable()
export class CoreBackofficeClient {
  private readonly baseUrl = process.env.CORE_BACKOFFICE_BASE_URL?.trim() || 'http://localhost:3005';

  constructor(private readonly httpService: HttpService) {}

  async getHealth(): Promise<IntegrationStatusDto> {
    const checkedAt = new Date().toISOString();

    try {
      await firstValueFrom(this.httpService.get(`${this.baseUrl}/health`, { timeout: 1200 }));
      return {
        available: true,
        mode: 'live',
        baseUrl: this.baseUrl,
        checkedAt,
      };
    } catch (error) {
      return {
        available: false,
        mode: 'fallback',
        baseUrl: this.baseUrl,
        checkedAt,
        error: error instanceof Error ? error.message : 'core-backoffice unavailable',
      };
    }
  }

  async getCapabilities() {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/backoffice-capabilities`, { timeout: 1500 }));
    return response.data as { total: number; items: Array<{ capabilityId: string; title: string; description: string; dependsOn: string[]; status: string }> };
  }

  async getOperationalAlerts() {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/operational-alerts`, { timeout: 1500 }));
    return response.data as { total: number; items: Array<{ alertId: string; severity: string; title: string; description: string; domain: string; status: string }> };
  }
}
