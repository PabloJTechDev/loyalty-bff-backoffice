import { Injectable } from '@nestjs/common';
import { BackofficeService } from './modules/backoffice/backoffice.service';

@Injectable()
export class AppService {
  constructor(private readonly backofficeService: BackofficeService) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'bff-backoffice',
      domain: 'backoffice',
    };
  }

  getReadiness() {
    const summary = this.backofficeService.getStatusSummary();

    return {
      status: 'ready',
      service: 'bff-backoffice',
      domain: 'backoffice',
      checkedAt: new Date().toISOString(),
      integrations: {
        backofficeEngine: {
          available: true,
          mode: summary.mode,
        },
        coreBackoffice: {
          available: false,
          mode: 'pending',
        },
        corePoints: {
          available: false,
          mode: 'pending',
        },
      },
      capabilities: {
        monitoredCustomers: summary.monitoredCustomers,
        recentOrders: summary.recentOrders,
        supportDashboard: true,
      },
    };
  }
}
