import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { IntegrationStatusDto } from '../dto/integration-status.dto';

export interface CorePointsProfileSummaryDto {
  customerId: string;
  customerEmailHash: string;
  firstName: string;
  lastName: string;
  loyaltyTier: string;
  enrollmentStatus: string;
  enrollmentTransactionId: string;
  passwordChangeStatus: string;
  passwordChangeRequestId: string;
  lastLoginId: string;
  lastLoginAt: string;
  source: string;
  stage: string;
  updatedAt: string;
}

export interface CorePointsEnrollmentTraceDto {
  transactionId: string;
  customerEmailHash: string;
  receivedAt: string;
  source: string;
  stage: string;
}

export interface CorePointsPasswordChangeTraceDto {
  requestId: string;
  transactionId: string;
  customerEmailHash: string;
  requestedAt: string;
  source: string;
  stage: string;
}

export interface CorePointsStatsDto {
  totalEnrollments: number;
  totalPasswordChanges: number;
  totalLogins: number;
  pendingEnrollments: number;
  pendingPasswordChanges: number;
  totalPointsInCirculation: number;
  totalLifetimeAccrued: number;
  totalLifetimeRedeemed: number;
  totalActiveAccounts: number;
}

export interface CorePointsBalanceDto {
  customerId: string;
  balancePoints: number;
  lifetimeAccrued: number;
  lifetimeRedeemed: number;
  updatedAt: string;
}

export interface CorePointsTransactionDto {
  transactionId: string;
  customerId: string;
  type: 'accrue' | 'redeem';
  points: number;
  referenceId: string;
  source: string;
  description: string;
  createdAt: string;
}

export interface CorePointsLoginTraceDto {
  loginId: string;
  requestId: string;
  transactionId: string;
  customerEmailHash: string;
  authenticatedAt: string;
  source: string;
  stage: string;
}

@Injectable()
export class CorePointsClient {
  private readonly baseUrl = process.env.CORE_POINTS_BASE_URL?.trim() || 'http://localhost:3001';

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
        error: error instanceof Error ? error.message : 'core-points unavailable',
      };
    }
  }

  async getCustomerProfileSummary(customerId: string): Promise<CorePointsProfileSummaryDto> {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/customers/${customerId}/profile-summary`, { timeout: 1500 }));
    return response.data as CorePointsProfileSummaryDto;
  }

  async listEnrollments(): Promise<CorePointsEnrollmentTraceDto[]> {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/customer-enrollments`, { timeout: 1500 }));
    return (response.data?.items ?? []) as CorePointsEnrollmentTraceDto[];
  }

  async listPasswordChanges(): Promise<CorePointsPasswordChangeTraceDto[]> {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/customer-password-changes`, { timeout: 1500 }));
    return (response.data?.items ?? []) as CorePointsPasswordChangeTraceDto[];
  }

  async listLogins(): Promise<CorePointsLoginTraceDto[]> {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/customer-logins`, { timeout: 1500 }));
    return (response.data?.items ?? []) as CorePointsLoginTraceDto[];
  }

  async getStats(): Promise<CorePointsStatsDto> {
    const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/stats`, { timeout: 1500 }));
    return response.data as CorePointsStatsDto;
  }

  async getCustomerBalance(customerId: string): Promise<CorePointsBalanceDto | null> {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/points/${encodeURIComponent(customerId)}/balance`, { timeout: 1500 }));
      return response.data as CorePointsBalanceDto;
    } catch {
      return null;
    }
  }

  async getCustomerTransactions(customerId: string): Promise<CorePointsTransactionDto[]> {
    try {
      const response = await firstValueFrom(this.httpService.get(`${this.baseUrl}/v1/points/${encodeURIComponent(customerId)}/transactions`, { timeout: 1500 }));
      return (response.data?.items ?? []) as CorePointsTransactionDto[];
    } catch {
      return [];
    }
  }
}
