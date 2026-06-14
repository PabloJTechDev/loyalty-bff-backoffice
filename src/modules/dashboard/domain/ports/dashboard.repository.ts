export const DASHBOARD_REPOSITORY = Symbol('IDashboardRepository');

export interface KpiData {
  label: string;
  value: string;
  trend: string;
}

export interface QueueData {
  id: string;
  title: string;
  pending: number;
  sla: string;
}

export interface CustomerSnapshotData {
  customerId: string;
  fullName: string;
  tier: string;
  status: string;
  availablePoints: number;
  lastOrderId: string;
}

export interface OrderSnapshotData {
  orderId: string;
  customerId: string;
  status: string;
  payableUsd: number;
  reservedPoints: number;
  createdAt: string;
}

export interface PointsTraceData {
  type: 'enrollment' | 'password_change' | 'login';
  referenceId: string;
  customerEmailHash: string;
  stage: string;
  source: string;
  happenedAt: string;
}

export interface IntegrationStatusData {
  available: boolean;
  mode: string;
  baseUrl?: string;
  checkedAt: string;
  error?: string;
}

export interface DashboardData {
  source: 'mock' | 'live';
  generatedAt: string;
  kpis: KpiData[];
  queues: QueueData[];
  customerSnapshots: CustomerSnapshotData[];
  recentOrders: OrderSnapshotData[];
  capabilities: unknown[];
  operationalAlerts: unknown[];
  recentPointFlows: PointsTraceData[];
  integrations: {
    coreBackoffice?: IntegrationStatusData;
    corePoints?: IntegrationStatusData;
  };
}

export interface IDashboardRepository {
  getDashboard(): Promise<DashboardData>;
}
