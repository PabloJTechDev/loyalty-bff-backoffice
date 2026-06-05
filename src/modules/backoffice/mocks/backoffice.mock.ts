import type { BackofficeDashboardResponseDto } from '../dto/backoffice-dashboard.dto';

export const backofficeDashboardMock: Omit<BackofficeDashboardResponseDto, 'source' | 'generatedAt'> = {
  kpis: [
    { label: 'Open cases', value: '18', trend: '-2 vs yesterday' },
    { label: 'Orders flagged', value: '5', trend: '+1 last hour' },
    { label: 'Customers monitored', value: '42', trend: '+6 this week' },
  ],
  queues: [
    { id: 'support', title: 'Support queue', pending: 9, sla: '< 30 min' },
    { id: 'risk', title: 'Risk review', pending: 3, sla: '< 15 min' },
    { id: 'ops', title: 'Operations follow-up', pending: 6, sla: '< 60 min' },
  ],
  customerSnapshots: [
    {
      customerId: 'cust_001',
      fullName: 'María Pérez',
      tier: 'Gold',
      status: 'active',
      availablePoints: 18200,
      lastOrderId: 'ord_mock_002',
    },
    {
      customerId: 'cust_002',
      fullName: 'Juan Soto',
      tier: 'Silver',
      status: 'password-reset-pending',
      availablePoints: 6400,
      lastOrderId: 'ord_mock_001',
    },
  ],
  recentOrders: [
    {
      orderId: 'ord_mock_002',
      customerId: 'cust_001',
      status: 'placed',
      payableUsd: 109,
      reservedPoints: 2000,
      createdAt: '2026-06-05T10:30:00.000Z',
    },
    {
      orderId: 'ord_mock_001',
      customerId: 'cust_002',
      status: 'placed',
      payableUsd: 44,
      reservedPoints: 1500,
      createdAt: '2026-06-04T18:00:00.000Z',
    },
  ],
};
