import { NotFoundException } from '@nestjs/common';
import { BackofficeService } from './backoffice.service';

describe('BackofficeService', () => {
  let service: BackofficeService;
  const liveCoreClient = {
    getHealth: jest.fn().mockResolvedValue({ available: true, mode: 'live', baseUrl: 'http://localhost:3005', checkedAt: '2026-06-05T00:00:00Z' }),
    getCapabilities: jest.fn().mockResolvedValue({ total: 1, items: [{ capabilityId: 'support-dashboard', title: 'Support dashboard', description: 'desc', dependsOn: ['loyalty-core-points'], status: 'planned' }] }),
    getOperationalAlerts: jest.fn().mockResolvedValue({ total: 1, items: [{ alertId: 'alert_points_sync', severity: 'medium', title: 'Points sync pending', description: 'desc', domain: 'points', status: 'open' }] }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BackofficeService(liveCoreClient as any);
  });

  it('returns dashboard payload enriched from core when available', async () => {
    const response = await service.getDashboard();
    expect(response.source).toBe('mock');
    expect(response.kpis.length).toBeGreaterThan(0);
    expect(response.capabilities?.length).toBe(1);
    expect(response.operationalAlerts?.length).toBe(1);
    expect(response.integrations?.coreBackoffice?.available).toBe(true);
  });

  it('returns a customer snapshot', async () => {
    const response = await service.getCustomerSnapshot('cust_001');
    expect(response.item.fullName).toBe('María Pérez');
  });

  it('returns an order snapshot', async () => {
    const response = await service.getOrderSnapshot('ord_mock_002');
    expect(response.item.status).toBe('placed');
  });

  it('throws for missing customer or order', async () => {
    await expect(service.getCustomerSnapshot('missing')).rejects.toThrow(NotFoundException);
    await expect(service.getOrderSnapshot('missing')).rejects.toThrow(NotFoundException);
  });

  it('falls back when core-backoffice is unavailable', async () => {
    const fallbackService = new BackofficeService({
      getHealth: jest.fn().mockResolvedValue({ available: false, mode: 'fallback', baseUrl: 'http://localhost:3005', checkedAt: '2026-06-05T00:00:00Z', error: 'connection refused' }),
    } as any);

    const response = await fallbackService.getDashboard();
    expect(response.capabilities).toEqual([]);
    expect(response.operationalAlerts).toEqual([]);
    expect(response.integrations?.coreBackoffice?.available).toBe(false);
  });
});
