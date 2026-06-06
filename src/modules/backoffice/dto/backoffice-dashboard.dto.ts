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

export interface BackofficePointsTraceDto {
  type: 'enrollment' | 'password_change' | 'login';
  referenceId: string;
  customerEmailHash: string;
  stage: string;
  source: string;
  happenedAt: string;
}

export interface BackofficeCustomerSnapshotDto {
  customerId: string;
  fullName: string;
  tier: string;
  status: string;
  availablePoints: number;
  lastOrderId: string;
}

export interface BackofficeCustomerDetailDto extends BackofficeCustomerSnapshotDto {
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

export interface BackofficeOrderSnapshotDto {
  orderId: string;
  customerId: string;
  status: string;
  payableUsd: number;
  reservedPoints: number;
  createdAt: string;
}

export interface BackofficeDashboardResponseDto {
  source: 'mock' | 'live';
  generatedAt: string;
  kpis: BackofficeKpiDto[];
  queues: BackofficeQueueDto[];
  customerSnapshots: BackofficeCustomerSnapshotDto[];
  recentOrders: BackofficeOrderSnapshotDto[];
  capabilities?: BackofficeCapabilityDto[];
  operationalAlerts?: BackofficeOperationalAlertDto[];
  recentPointFlows?: BackofficePointsTraceDto[];
  integrations?: {
    coreBackoffice?: {
      available: boolean;
      mode: string;
      baseUrl?: string;
      checkedAt: string;
      error?: string;
    };
    corePoints?: {
      available: boolean;
      mode: string;
      baseUrl?: string;
      checkedAt: string;
      error?: string;
    };
  };
}

export interface BackofficeCapabilityDto {
  capabilityId: string;
  title: string;
  description: string;
  dependsOn: string[];
  status: string;
}

export interface BackofficeOperationalAlertDto {
  alertId: string;
  severity: string;
  title: string;
  description: string;
  domain: string;
  status: string;
}
