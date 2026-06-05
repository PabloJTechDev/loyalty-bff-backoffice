import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';

describe('BackofficeController', () => {
  let controller: BackofficeController;

  beforeEach(() => {
    const backofficeService = {
      getDashboard: jest.fn().mockResolvedValue({ source: 'mock', kpis: [] }),
      getCustomerSnapshot: jest.fn().mockResolvedValue({ source: 'mock', item: { customerId: 'cust_001' } }),
      getOrderSnapshot: jest.fn().mockResolvedValue({ source: 'mock', item: { orderId: 'ord_mock_002' } }),
    } as unknown as BackofficeService;

    controller = new BackofficeController(backofficeService);
  });

  it('returns dashboard', async () => {
    await expect(controller.getDashboard()).resolves.toEqual({ source: 'mock', kpis: [] });
  });

  it('returns customer snapshot', async () => {
    await expect(controller.getCustomerSnapshot('cust_001')).resolves.toEqual({ source: 'mock', item: { customerId: 'cust_001' } });
  });

  it('returns order snapshot', async () => {
    await expect(controller.getOrderSnapshot('ord_mock_002')).resolves.toEqual({ source: 'mock', item: { orderId: 'ord_mock_002' } });
  });
});
