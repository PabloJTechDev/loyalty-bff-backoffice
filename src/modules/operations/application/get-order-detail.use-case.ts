import { Inject, Injectable } from '@nestjs/common';
import { OPERATIONS_REPOSITORY } from '../domain/ports/operations.repository';
import type { IOperationsRepository } from '../domain/ports/operations.repository';

@Injectable()
export class GetOrderDetailUseCase {
  constructor(
    @Inject(OPERATIONS_REPOSITORY) private readonly operations: IOperationsRepository,
  ) {}

  async execute(orderId: string) {
    return this.operations.getOrderById(orderId);
  }
}
