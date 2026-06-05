import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { IntegrationStatusDto } from '../../../common/dto/integration-status.dto';

export interface CoreEcommerceOrderDto {
  source?: string;
  orderId: string;
  reservationId?: string;
  status: string;
  currency?: string;
  createdAt: string;
  summary?: {
    itemCount: number;
    subtotalUsd: number;
    requestedPoints: number;
    reservedPoints: number;
    coveredUsd: number;
    payableUsd: number;
  };
}

@Injectable()
export class CoreEcommerceClient {
  private readonly baseUrl = process.env.CORE_ECOMMERCE_BASE_URL?.trim() || 'http://localhost:3006';

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
        error: error instanceof Error ? error.message : 'core-ecommerce unavailable',
      };
    }
  }

  async getOrders(): Promise<CoreEcommerceOrderDto[]> {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/orders`, { timeout: 1500 }));
    return (response.data?.items ?? []) as CoreEcommerceOrderDto[];
  }
}
