export const CUSTOMERS_REPOSITORY = Symbol('ICustomersRepository');

export interface CustomerSnapshotData {
  customerId: string;
  fullName: string;
  tier: string;
  status: string;
  availablePoints: number;
  lastOrderId: string;
}

export interface CustomerDetailData extends CustomerSnapshotData {
  customerEmailHash?: string;
  enrollmentStatus?: string;
  enrollmentTransactionId?: string;
  passwordChangeStatus?: string;
  passwordChangeRequestId?: string;
  lastLoginId?: string;
  lastLoginAt?: string;
  source?: string;
  stage?: string;
  updatedAt?: string;
}

export interface CustomerPointsData {
  customerId: string;
  source: string;
  balance: {
    customerId: string;
    balancePoints: number;
    lifetimeAccrued: number;
    lifetimeRedeemed: number;
    updatedAt: string;
  };
  transactions: CustomerTransactionData[];
}

export interface CustomerTransactionData {
  transactionId: string;
  customerId: string;
  type: 'accrue' | 'redeem';
  points: number;
  referenceId: string;
  source: string;
  description: string;
  createdAt: string;
}

export interface ICustomersRepository {
  getCustomerSnapshot(customerId: string): Promise<{
    source: 'mock' | 'live';
    item: CustomerDetailData;
    integrations: { corePoints: { available: boolean; mode: string; baseUrl?: string; checkedAt: string; error?: string } };
  }>;
  getCustomerPoints(customerId: string): Promise<CustomerPointsData>;
}
