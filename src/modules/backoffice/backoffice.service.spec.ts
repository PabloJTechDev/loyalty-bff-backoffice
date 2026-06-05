import { NotFoundException } from '@nestjs/common';
import { BackofficeService } from './backoffice.service';

describe('BackofficeService', () => {
  let service: BackofficeService;

  beforeEach(() => {
    service = new BackofficeService();
  });

  it('returns dashboard payload', () => {
    const response = service.getDashboard();
    expect(response.source).toBe('mock');
    expect(response.kpis.length).toBeGreaterThan(0);
    expect(response.customerSnapshots.length).toBeGreaterThan(0);
    expect(response.recentOrders.length).toBeGreaterThan(0);
  });

  it('returns a customer snapshot', () => {
    const response = service.getCustomerSnapshot('cust_001');
    expect(response.item.fullName).toBe('María Pérez');
  });

  it('returns an order snapshot', () => {
    const response = service.getOrderSnapshot('ord_mock_002');
    expect(response.item.status).toBe('placed');
  });

  it('throws for missing customer or order', () => {
    expect(() => service.getCustomerSnapshot('missing')).toThrow(NotFoundException);
    expect(() => service.getOrderSnapshot('missing')).toThrow(NotFoundException);
  });
});
