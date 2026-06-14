import { Injectable, NotFoundException } from '@nestjs/common';
import {
  IOperationsRepository,
  OrderDetailData,
  OrderDetailResult,
} from '../../domain/ports/operations.repository';

const recentOrdersMock: OrderDetailData[] = [
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
];

@Injectable()
export class CoreBackofficeOperationsAdapter implements IOperationsRepository {
  async getOrderById(orderId: string): Promise<OrderDetailResult> {
    const order = recentOrdersMock.find((item) => item.orderId === orderId);
    if (!order) throw new NotFoundException(`Backoffice order ${orderId} not found`);
    return { source: 'mock', item: order };
  }
}
