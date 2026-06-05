import { Injectable, NotFoundException } from '@nestjs/common';
import type { BackofficeDashboardResponseDto } from './dto/backoffice-dashboard.dto';
import { backofficeDashboardMock } from './mocks/backoffice.mock';

@Injectable()
export class BackofficeService {
  getStatusSummary() {
    return {
      domain: 'backoffice' as const,
      mode: 'mock' as const,
      monitoredCustomers: backofficeDashboardMock.customerSnapshots.length,
      recentOrders: backofficeDashboardMock.recentOrders.length,
    };
  }

  getDashboard(): BackofficeDashboardResponseDto {
    return {
      ...backofficeDashboardMock,
      source: 'mock',
      generatedAt: new Date().toISOString(),
    };
  }

  getCustomerSnapshot(customerId: string) {
    const customer = backofficeDashboardMock.customerSnapshots.find((item) => item.customerId === customerId);
    if (!customer) throw new NotFoundException(`Backoffice customer ${customerId} not found`);
    return { source: 'mock' as const, item: customer };
  }

  getOrderSnapshot(orderId: string) {
    const order = backofficeDashboardMock.recentOrders.find((item) => item.orderId === orderId);
    if (!order) throw new NotFoundException(`Backoffice order ${orderId} not found`);
    return { source: 'mock' as const, item: order };
  }
}
