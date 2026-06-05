import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  BackofficeCustomerDetailDto,
  BackofficeCustomerSnapshotDto,
  BackofficeDashboardResponseDto,
} from './dto/backoffice-dashboard.dto';
import { backofficeDashboardMock } from './mocks/backoffice.mock';
import { CoreBackofficeClient } from './clients/core-backoffice.client';
import { CorePointsClient, type CorePointsProfileSummaryDto } from './clients/core-points.client';

@Injectable()
export class BackofficeService {
  constructor(
    private readonly coreBackofficeClient: CoreBackofficeClient,
    private readonly corePointsClient: CorePointsClient,
  ) {}

  async getStatusSummary() {
    const [coreBackoffice, corePoints] = await Promise.all([
      this.coreBackofficeClient.getHealth(),
      this.corePointsClient.getHealth(),
    ]);

    return {
      domain: 'backoffice' as const,
      mode: coreBackoffice.available || corePoints.available ? ('live' as const) : ('fallback' as const),
      monitoredCustomers: backofficeDashboardMock.customerSnapshots.length,
      recentOrders: backofficeDashboardMock.recentOrders.length,
      coreBackoffice,
      corePoints,
    };
  }

  async getDashboard(): Promise<BackofficeDashboardResponseDto> {
    const [coreBackoffice, corePoints] = await Promise.all([
      this.coreBackofficeClient.getHealth(),
      this.corePointsClient.getHealth(),
    ]);

    const [capabilities, operationalAlerts, customerSnapshots] = await Promise.all([
      this.getCapabilities(coreBackoffice.available),
      this.getOperationalAlerts(coreBackoffice.available),
      this.getCustomerSnapshots(corePoints.available),
    ]);

    return {
      ...backofficeDashboardMock,
      source: 'mock',
      generatedAt: new Date().toISOString(),
      customerSnapshots,
      capabilities,
      operationalAlerts,
      integrations: {
        coreBackoffice,
        corePoints,
      },
    };
  }

  async getCustomerSnapshot(customerId: string) {
    const customer = backofficeDashboardMock.customerSnapshots.find((item) => item.customerId === customerId);
    if (!customer) throw new NotFoundException(`Backoffice customer ${customerId} not found`);

    const corePoints = await this.corePointsClient.getHealth();
    if (!corePoints.available) {
      return { source: 'mock' as const, item: this.toCustomerDetail(customer), integrations: { corePoints } };
    }

    try {
      const profile = await this.corePointsClient.getCustomerProfileSummary(customerId);
      return {
        source: 'mock' as const,
        item: this.mergeCustomerDetail(customer, profile),
        integrations: { corePoints },
      };
    } catch {
      return { source: 'mock' as const, item: this.toCustomerDetail(customer), integrations: { corePoints } };
    }
  }

  async getOrderSnapshot(orderId: string) {
    const order = backofficeDashboardMock.recentOrders.find((item) => item.orderId === orderId);
    if (!order) throw new NotFoundException(`Backoffice order ${orderId} not found`);
    return { source: 'mock' as const, item: order };
  }

  private async getCapabilities(enabled: boolean) {
    if (!enabled) return [];
    const capabilities = await this.coreBackofficeClient.getCapabilities();
    return capabilities.items;
  }

  private async getOperationalAlerts(enabled: boolean) {
    if (!enabled) return [];
    const operationalAlerts = await this.coreBackofficeClient.getOperationalAlerts();
    return operationalAlerts.items;
  }

  private async getCustomerSnapshots(enabled: boolean): Promise<BackofficeCustomerSnapshotDto[]> {
    if (!enabled) return backofficeDashboardMock.customerSnapshots;

    const mergedSnapshots = await Promise.all(
      backofficeDashboardMock.customerSnapshots.map(async (customer) => {
        try {
          const profile = await this.corePointsClient.getCustomerProfileSummary(customer.customerId);
          return this.mergeCustomerSnapshot(customer, profile);
        } catch {
          return customer;
        }
      }),
    );

    return mergedSnapshots;
  }

  private mergeCustomerSnapshot(customer: BackofficeCustomerSnapshotDto, profile: CorePointsProfileSummaryDto): BackofficeCustomerSnapshotDto {
    return {
      ...customer,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      tier: profile.loyaltyTier || customer.tier,
      status: profile.passwordChangeStatus === 'pending'
        ? 'password-reset-pending'
        : profile.enrollmentStatus || profile.stage || customer.status,
    };
  }

  private toCustomerDetail(customer: BackofficeCustomerSnapshotDto): BackofficeCustomerDetailDto {
    return {
      ...customer,
    };
  }

  private mergeCustomerDetail(customer: BackofficeCustomerSnapshotDto, profile: CorePointsProfileSummaryDto): BackofficeCustomerDetailDto {
    const base = this.mergeCustomerSnapshot(customer, profile);
    return {
      ...base,
      customerEmailHash: profile.customerEmailHash,
      enrollmentStatus: profile.enrollmentStatus,
      enrollmentTransactionId: profile.enrollmentTransactionId,
      passwordChangeStatus: profile.passwordChangeStatus,
      passwordChangeRequestId: profile.passwordChangeRequestId,
      lastLoginId: profile.lastLoginId,
      lastLoginAt: profile.lastLoginAt,
      source: profile.source,
      stage: profile.stage,
      updatedAt: profile.updatedAt,
    };
  }
}
