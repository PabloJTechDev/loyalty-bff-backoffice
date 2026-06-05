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

export interface BackofficeOrderLineDto {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPriceUsd: number;
  lineSubtotalUsd: number;
  categoryId: string;
  categoryName: string;
}

export interface BackofficeOrderSummaryDto {
  itemCount: number;
  subtotalUsd: number;
  requestedPoints: number;
  reservedPoints: number;
  coveredUsd: number;
  payableUsd: number;
}

export interface BackofficeOrderSnapshotDto {
  orderId: string;
  customerId: string;
  reservationId?: string;
  status: string;
  currency?: string;
  payableUsd: number;
  reservedPoints: number;
  createdAt: string;
  lines?: BackofficeOrderLineDto[];
  summary?: BackofficeOrderSummaryDto;
}

export interface BackofficeDashboardResponseDto {
  source: 'mock';
  generatedAt: string;
  kpis: BackofficeKpiDto[];
  queues: BackofficeQueueDto[];
  customerSnapshots: BackofficeCustomerSnapshotDto[];
  recentOrders: BackofficeOrderSnapshotDto[];
  capabilities?: BackofficeCapabilityDto[];
  operationalAlerts?: BackofficeOperationalAlertDto[];
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
    coreEcommerce?: {
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
