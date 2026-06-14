import { Injectable } from '@nestjs/common';
import { CoreBackofficeClient } from './shared/infrastructure/core-backoffice.client';
import { CorePointsClient } from './shared/infrastructure/core-points.client';

const MONITORED_CUSTOMERS = 2;
const RECENT_ORDERS = 2;

@Injectable()
export class AppService {
  constructor(
    private readonly coreBackofficeClient: CoreBackofficeClient,
    private readonly corePointsClient: CorePointsClient,
  ) {}

  getHealth() {
    return {
      status: 'ok',
      service: 'bff-backoffice',
      domain: 'backoffice',
    };
  }

  async getReadiness() {
    const [coreBackoffice, corePoints] = await Promise.all([
      this.coreBackofficeClient.getHealth(),
      this.corePointsClient.getHealth(),
    ]);

    const mode = coreBackoffice.available || corePoints.available ? 'live' : 'fallback';

    return {
      status: 'ready',
      service: 'bff-backoffice',
      domain: 'backoffice',
      checkedAt: new Date().toISOString(),
      integrations: {
        backofficeEngine: {
          available: true,
          mode,
        },
        coreBackoffice,
        corePoints,
      },
      capabilities: {
        monitoredCustomers: MONITORED_CUSTOMERS,
        recentOrders: RECENT_ORDERS,
        supportDashboard: true,
      },
    };
  }
}
