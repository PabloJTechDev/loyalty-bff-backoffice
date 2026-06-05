export interface BackofficeKpiDto {
  label: string;
  value: string;
  trend: string;
}

export interface BackofficeQueueDto {
  id: string;
  title: string;
  pending: number;
  sla: string;
}

export interface BackofficeCustomerSnapshotDto {
  customerId: string;
  fullName: string;
  tier: string;
  status: string;
  availablePoints: number;
  lastOrderId: string;
}

export interface BackofficeOrderSnapshotDto {
  orderId: string;
  customerId: string;
  status: string;
  payableUsd: number;
  reservedPoints: number;
  createdAt: string;
}

export interface BackofficeDashboardResponseDto {
  source: 'mock';
  generatedAt: string;
  kpis: BackofficeKpiDto[];
  queues: BackofficeQueueDto[];
  customerSnapshots: BackofficeCustomerSnapshotDto[];
  recentOrders: BackofficeOrderSnapshotDto[];
}
