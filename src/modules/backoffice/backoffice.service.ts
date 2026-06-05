import { Injectable, NotFoundException } from '@nestjs/common';
import type { BackofficeDashboardResponseDto } from './dto/backoffice-dashboard.dto';
import { backofficeDashboardMock } from './mocks/backoffice.mock';
import { CoreBackofficeClient } from './clients/core-backoffice.client';

@Injectable()
export class BackofficeService {
  constructor(private readonly coreBackofficeClient: CoreBackofficeClient) {}

  async getStatusSummary() {
    const coreBackoffice = await this.coreBackofficeClient.getHealth();

    return {
      domain: 'backoffice' as const,
      mode: coreBackoffice.available ? ('live' as const) : ('fallback' as const),
      monitoredCustomers: backofficeDashboardMock.customerSnapshots.length,
      recentOrders: backofficeDashboardMock.recentOrders.length,
      coreBackoffice,
    };
  }

  async getDashboard(): Promise<BackofficeDashboardResponseDto> {
    const coreBackoffice = await this.coreBackofficeClient.getHealth();

    if (coreBackoffice.available) {
      const [capabilities, operationalAlerts] = await Promise.all([
        this.coreBackofficeClient.getCapabilities(),
        this.coreBackofficeClient.getOperationalAlerts(),
      ]);

      return {
        ...backofficeDashboardMock,
        source: 'mock',
        generatedAt: new Date().toISOString(),
        capabilities: capabilities.items,
        operationalAlerts: operationalAlerts.items,
        integrations: {
          coreBackoffice,
        },
      };
    }

    return {
      ...backofficeDashboardMock,
      source: 'mock',
      generatedAt: new Date().toISOString(),
      capabilities: [],
      operationalAlerts: [],
      integrations: {
        coreBackoffice,
      },
    };
  }

  async getCustomerSnapshot(customerId: string) {
    const customer = backofficeDashboardMock.customerSnapshots.find((item) => item.customerId === customerId);
    if (!customer) throw new NotFoundException(`Backoffice customer ${customerId} not found`);
    return { source: 'mock' as const, item: customer };
  }

  async getOrderSnapshot(orderId: string) {
    const order = backofficeDashboardMock.recentOrders.find((item) => item.orderId === orderId);
    if (!order) throw new NotFoundException(`Backoffice order ${orderId} not found`);
    return { source: 'mock' as const, item: order };
  }
}
