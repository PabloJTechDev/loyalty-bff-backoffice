import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  BackofficeCustomerSnapshotDto,
  BackofficeDashboardResponseDto,
} from './dto/backoffice-dashboard.dto';
import { backofficeDashboardMock } from './mocks/backoffice.mock';
import { CoreBackofficeClient } from './clients/core-backoffice.client';
import { CorePointsClient, type CorePointsProfileSummaryDto } from './clients/core-points.client';
import { CoreEcommerceClient, type CoreEcommerceOrderDto } from './clients/core-ecommerce.client';

@Injectable()
export class BackofficeService {
  constructor(
    private readonly coreBackofficeClient: CoreBackofficeClient,
    private readonly corePointsClient: CorePointsClient,
    private readonly coreEcommerceClient: CoreEcommerceClient,
  ) {}

  async getStatusSummary() {
    const [coreBackoffice, corePoints, coreEcommerce] = await Promise.all([
      this.coreBackofficeClient.getHealth(),
      this.corePointsClient.getHealth(),
      this.coreEcommerceClient.getHealth(),
    ]);

    return {
      domain: 'backoffice' as const,
      mode: coreBackoffice.available || corePoints.available || coreEcommerce.available ? ('live' as const) : ('fallback' as const),
      monitoredCustomers: backofficeDashboardMock.customerSnapshots.length,
      recentOrders: backofficeDashboardMock.recentOrders.length,
      coreBackoffice,
      corePoints,
      coreEcommerce,
    };
  }

  async getDashboard(): Promise<BackofficeDashboardResponseDto> {
    const [coreBackoffice, corePoints, coreEcommerce] = await Promise.all([
      this.coreBackofficeClient.getHealth(),
      this.corePointsClient.getHealth(),
      this.coreEcommerceClient.getHealth(),
    ]);

    const [capabilities, operationalAlerts, customerSnapshots, recentOrders] = await Promise.all([
      this.getCapabilities(coreBackoffice.available),
      this.getOperationalAlerts(coreBackoffice.available),
      this.getCustomerSnapshots(corePoints.available),
      this.getRecentOrders(coreEcommerce.available),
    ]);

    return {
      ...backofficeDashboardMock,
      source: 'mock',
      generatedAt: new Date().toISOString(),
      customerSnapshots,
      capabilities,
      operationalAlerts,
      recentOrders,
      integrations: {
        coreBackoffice,
        corePoints,
        coreEcommerce,
      },
    };
  }

  async getCustomerSnapshot(customerId: string) {
    const customer = backofficeDashboardMock.customerSnapshots.find((item) => item.customerId === customerId);
    if (!customer) throw new NotFoundException(`Backoffice customer ${customerId} not found`);

    const corePoints = await this.corePointsClient.getHealth();
    if (!corePoints.available) {
      return { source: 'mock' as const, item: customer, integrations: { corePoints } };
    }

    try {
      const profile = await this.corePointsClient.getCustomerProfileSummary(customerId);
      return {
        source: 'mock' as const,
        item: this.mergeCustomerSnapshot(customer, profile),
        integrations: { corePoints },
      };
    } catch {
      return { source: 'mock' as const, item: customer, integrations: { corePoints } };
    }
  }

  async getOrderSnapshot(orderId: string) {
    const mockOrder = backofficeDashboardMock.recentOrders.find((item) => item.orderId === orderId);
    const coreEcommerce = await this.coreEcommerceClient.getHealth();

    if (coreEcommerce.available) {
      try {
        const liveOrders = await this.coreEcommerceClient.getOrders();
        const liveOrder = liveOrders.find((item) => item.orderId === orderId);
        if (liveOrder) {
          return {
            source: 'mock' as const,
            item: this.mergeOrderSnapshot(mockOrder, liveOrder),
            integrations: { coreEcommerce },
          };
        }
      } catch {
        if (mockOrder) {
          return { source: 'mock' as const, item: mockOrder, integrations: { coreEcommerce } };
        }
      }
    }

    if (!mockOrder) throw new NotFoundException(`Backoffice order ${orderId} not found`);
    return { source: 'mock' as const, item: mockOrder, integrations: { coreEcommerce } };
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

  private async getRecentOrders(enabled: boolean) {
    if (!enabled) return backofficeDashboardMock.recentOrders;

    try {
      const liveOrders = await this.coreEcommerceClient.getOrders();
      return liveOrders.map((order) => this.mergeOrderSnapshot(
        backofficeDashboardMock.recentOrders.find((item) => item.orderId === order.orderId),
        order,
      ));
    } catch {
      return backofficeDashboardMock.recentOrders;
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

  private mergeOrderSnapshot(mockOrder: BackofficeDashboardResponseDto['recentOrders'][number] | undefined, liveOrder: CoreEcommerceOrderDto) {
    return {
      orderId: liveOrder.orderId,
      customerId: mockOrder?.customerId ?? 'unassigned',
      status: liveOrder.status || mockOrder?.status || 'placed',
      payableUsd: liveOrder.summary?.payableUsd ?? mockOrder?.payableUsd ?? 0,
      reservedPoints: liveOrder.summary?.reservedPoints ?? mockOrder?.reservedPoints ?? 0,
      createdAt: liveOrder.createdAt ?? mockOrder?.createdAt ?? new Date().toISOString(),
    };
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
}
