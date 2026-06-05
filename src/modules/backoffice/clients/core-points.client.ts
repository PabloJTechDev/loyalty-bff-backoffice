import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import type { IntegrationStatusDto } from '../../../common/dto/integration-status.dto';

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
}
