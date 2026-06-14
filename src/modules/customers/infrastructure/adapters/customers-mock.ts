import type { CustomerSnapshotData } from '../../domain/ports/customers.repository';

export const customersSnapshotsMock: CustomerSnapshotData[] = [
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
];
