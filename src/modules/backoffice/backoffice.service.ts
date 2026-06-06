import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  BackofficeCustomerDetailDto,
  BackofficeCustomerSnapshotDto,
  BackofficeDashboardResponseDto,
  BackofficeKpiDto,
  BackofficeQueueDto,
  BackofficePointsTraceDto,
} from './dto/backoffice-dashboard.dto';
import { backofficeDashboardMock } from './mocks/backoffice.mock';
import { CoreBackofficeClient } from './clients/core-backoffice.client';
import { CorePointsClient, type CorePointsProfileSummaryDto, type CorePointsStatsDto } from './clients/core-points.client';

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

    const [capabilities, operationalAlerts, customerSnapshots, recentPointFlows, kpis, queues] = await Promise.all([
      this.getCapabilities(coreBackoffice.available),
      this.getOperationalAlerts(coreBackoffice.available),
      this.getCustomerSnapshots(corePoints.available),
      this.getRecentPointFlows(corePoints.available),
      this.getKpis(corePoints.available),
      this.getQueues(corePoints.available),
    ]);

    return {
      ...backofficeDashboardMock,
      source: corePoints.available ? 'live' : 'mock',
      generatedAt: new Date().toISOString(),
      kpis,
      queues,
      customerSnapshots,
      capabilities,
      operationalAlerts,
      recentPointFlows,
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

  async getCustomerPoints(customerId: string) {
    const [balance, transactions] = await Promise.all([
      this.corePointsClient.getCustomerBalance(customerId),
      this.corePointsClient.getCustomerTransactions(customerId),
    ]);
    return {
      customerId,
      source: balance ? 'core-points' : 'not_found',
      balance: balance ?? { customerId, balancePoints: 0, lifetimeAccrued: 0, lifetimeRedeemed: 0, updatedAt: new Date().toISOString() },
      transactions,
    };
  }

  private async getKpis(enabled: boolean): Promise<BackofficeKpiDto[]> {
    if (!enabled) return backofficeDashboardMock.kpis;
    try {
      const stats = await this.corePointsClient.getStats();
      return [
        { label: 'Total enrollments', value: String(stats.totalEnrollments), trend: `${stats.pendingEnrollments} pending` },
        { label: 'Total logins', value: String(stats.totalLogins), trend: 'all time' },
        { label: 'Password changes', value: String(stats.totalPasswordChanges), trend: `${stats.pendingPasswordChanges} pending` },
      ];
    } catch {
      return backofficeDashboardMock.kpis;
    }
  }

  private async getQueues(enabled: boolean): Promise<BackofficeQueueDto[]> {
    if (!enabled) return backofficeDashboardMock.queues;
    try {
      const stats = await this.corePointsClient.getStats();
      return [
        { id: 'enrollments', title: 'Enrollment queue', pending: stats.pendingEnrollments, sla: '< 60 min' },
        { id: 'password-changes', title: 'Password reset queue', pending: stats.pendingPasswordChanges, sla: '< 30 min' },
      ];
    } catch {
      return backofficeDashboardMock.queues;
    }
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


  private async getRecentPointFlows(enabled: boolean): Promise<BackofficePointsTraceDto[]> {
    if (!enabled) return [];

    try {
      const [enrollments, passwordChanges, logins] = await Promise.all([
        this.corePointsClient.listEnrollments(),
        this.corePointsClient.listPasswordChanges(),
        this.corePointsClient.listLogins(),
      ]);

      return [
        ...enrollments.map((item) => ({
          type: 'enrollment' as const,
          referenceId: item.transactionId,
          customerEmailHash: item.customerEmailHash,
          stage: item.stage,
          source: item.source,
          happenedAt: item.receivedAt,
        })),
        ...passwordChanges.map((item) => ({
          type: 'password_change' as const,
          referenceId: item.requestId,
          customerEmailHash: item.customerEmailHash,
          stage: item.stage,
          source: item.source,
          happenedAt: item.requestedAt,
        })),
        ...logins.map((item) => ({
          type: 'login' as const,
          referenceId: item.loginId,
          customerEmailHash: item.customerEmailHash,
          stage: item.stage,
          source: item.source,
          happenedAt: item.authenticatedAt,
        })),
      ].sort((a, b) => b.happenedAt.localeCompare(a.happenedAt)).slice(0, 6);
    } catch {
      return [];
    }
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
