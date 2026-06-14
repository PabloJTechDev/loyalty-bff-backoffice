export const OPERATIONS_REPOSITORY = Symbol('IOperationsRepository');

export interface OrderDetailData {
  orderId: string;
  customerId: string;
  status: string;
  payableUsd: number;
  reservedPoints: number;
  createdAt: string;
}

export interface OrderDetailResult {
  source: 'mock';
  item: OrderDetailData;
}

export interface IOperationsRepository {
  getOrderById(orderId: string): Promise<OrderDetailResult>;
}
