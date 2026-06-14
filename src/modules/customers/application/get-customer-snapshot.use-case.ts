import { Inject, Injectable } from '@nestjs/common';
import { CUSTOMERS_REPOSITORY } from '../domain/ports/customers.repository';
import type { ICustomersRepository } from '../domain/ports/customers.repository';

@Injectable()
export class GetCustomerSnapshotUseCase {
  constructor(
    @Inject(CUSTOMERS_REPOSITORY) private readonly customers: ICustomersRepository,
  ) {}

  async execute(customerId: string) {
    return this.customers.getCustomerSnapshot(customerId);
  }
}
