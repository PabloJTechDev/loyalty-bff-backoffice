import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';

describe('BackofficeController', () => {
  let controller: BackofficeController;

  beforeEach(() => {
    const backofficeService = {
      getDashboard: jest.fn().mockReturnValue({ source: 'mock', kpis: [] }),
      getCustomerSnapshot: jest.fn().mockImplementation((customerId: string) => ({ source: 'mock', item: { customerId } })),
      getOrderSnapshot: jest.fn().mockImplementation((orderId: string) => ({ source: 'mock', item: { orderId } })),
    } as unknown as BackofficeService;

    controller = new BackofficeController(backofficeService);
  });

  it('returns dashboard', () => {
    expect(controller.getDashboard()).toEqual({ source: 'mock', kpis: [] });
  });

  it('returns customer snapshot', () => {
    expect(controller.getCustomerSnapshot('cust_001')).toEqual({ source: 'mock', item: { customerId: 'cust_001' } });
  });

  it('returns order snapshot', () => {
    expect(controller.getOrderSnapshot('ord_mock_002')).toEqual({ source: 'mock', item: { orderId: 'ord_mock_002' } });
  });
});
