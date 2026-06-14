import { Injectable } from '@nestjs/common';
import {
  IDashboardRepository,
  DashboardData,
  KpiData,
  QueueData,
  CustomerSnapshotData,
  PointsTraceData,
} from '../../domain/ports/dashboard.repository';
import { CoreBackofficeClient } from '../../../../shared/infrastructure/core-backoffice.client';
import { CorePointsClient } from '../../../../shared/infrastructure/core-points.client';
import type { CorePointsProfileSummaryDto } from '../../../../shared/infrastructure/core-points.client';
import { backofficeDashboardMock } from './backoffice-dashboard.mock';

@Injectable()
export class CoreBackofficeAdapter implements IDashboardRepository {
  constructor(
    private readonly coreBackoffice: CoreBackofficeClient,
    private readonly corePoints: CorePointsClient,
  ) {}

  async getDashboard(): Promise<DashboardData> {
    const [coreBackoffice, corePoints] = await Promise.all([
      this.coreBackoffice.getHealth(),
      this.corePoints.getHealth(),
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

  private async getKpis(enabled: boolean): Promise<KpiData[]> {
    if (!enabled) return backofficeDashboardMock.kpis;
    try {
      const stats = await this.corePoints.getStats();
      const inCirculation = stats.totalPointsInCirculation ?? 0;
      const lifetimeAccrued = stats.totalLifetimeAccrued ?? 0;
      const lifetimeRedeemed = stats.totalLifetimeRedeemed ?? 0;
      const activeAccounts = stats.totalActiveAccounts ?? 0;
      return [
        { label: 'Total enrollments', value: String(stats.totalEnrollments), trend: `${stats.pendingEnrollments} pending` },
        { label: 'Total logins', value: String(stats.totalLogins), trend: 'all time' },
        { label: 'Password changes', value: String(stats.totalPasswordChanges), trend: `${stats.pendingPasswordChanges} pending` },
        { label: 'Points in circulation', value: inCirculation.toLocaleString('en-US'), trend: `${activeAccounts} active accounts` },
        { label: 'Lifetime accrued', value: lifetimeAccrued.toLocaleString('en-US'), trend: `${lifetimeRedeemed.toLocaleString('en-US')} redeemed` },
      ];
    } catch {
      return backofficeDashboardMock.kpis;
    }
  }

  private async getQueues(enabled: boolean): Promise<QueueData[]> {
    if (!enabled) return backofficeDashboardMock.queues;
    try {
      const stats = await this.corePoints.getStats();
      return [
        { id: 'enrollments', title: 'Enrollment queue', pending: stats.pendingEnrollments, sla: '< 60 min' },
        { id: 'password-changes', title: 'Password reset queue', pending: stats.pendingPasswordChanges, sla: '< 30 min' },
      ];
    } catch {
      return backofficeDashboardMock.queues;
    }
  }

  private async getCapabilities(enabled: boolean): Promise<unknown[]> {
    if (!enabled) return [];
    const capabilities = await this.coreBackoffice.getCapabilities();
    return capabilities.items;
  }

  private async getOperationalAlerts(enabled: boolean): Promise<unknown[]> {
    if (!enabled) return [];
    const operationalAlerts = await this.coreBackoffice.getOperationalAlerts();
    return operationalAlerts.items;
  }

  private async getRecentPointFlows(enabled: boolean): Promise<PointsTraceData[]> {
    if (!enabled) return [];

    try {
      const [enrollments, passwordChanges, logins] = await Promise.all([
        this.corePoints.listEnrollments(),
        this.corePoints.listPasswordChanges(),
        this.corePoints.listLogins(),
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

  private async getCustomerSnapshots(enabled: boolean): Promise<CustomerSnapshotData[]> {
    if (!enabled) return backofficeDashboardMock.customerSnapshots;

    const mergedSnapshots = await Promise.all(
      backofficeDashboardMock.customerSnapshots.map(async (customer) => {
        try {
          const profile = await this.corePoints.getCustomerProfileSummary(customer.customerId);
          return this.mergeCustomerSnapshot(customer, profile);
        } catch {
          return customer;
        }
      }),
    );

    return mergedSnapshots;
  }

  private mergeCustomerSnapshot(
    customer: CustomerSnapshotData,
    profile: CorePointsProfileSummaryDto,
  ): CustomerSnapshotData {
    return {
      ...customer,
      fullName: `${profile.firstName} ${profile.lastName}`.trim(),
      tier: profile.loyaltyTier || customer.tier,
      status:
        profile.passwordChangeStatus === 'pending'
          ? 'password-reset-pending'
          : profile.enrollmentStatus || profile.stage || customer.status,
    };
  }
}
