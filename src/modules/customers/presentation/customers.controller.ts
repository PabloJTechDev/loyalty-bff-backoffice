import { Controller, Get, Param } from '@nestjs/common';
import { GetCustomerSnapshotUseCase } from '../application/get-customer-snapshot.use-case';
import { GetCustomerPointsUseCase } from '../application/get-customer-points.use-case';

@Controller('v1/backoffice/customers')
export class CustomersController {
  constructor(
    private readonly getCustomerSnapshotUseCase: GetCustomerSnapshotUseCase,
    private readonly getCustomerPointsUseCase: GetCustomerPointsUseCase,
  ) {}

  @Get(':customerId')
  getCustomerSnapshot(@Param('customerId') customerId: string) {
    return this.getCustomerSnapshotUseCase.execute(customerId);
  }

  @Get(':customerId/points')
  getCustomerPoints(@Param('customerId') customerId: string) {
    return this.getCustomerPointsUseCase.execute(customerId);
  }
}
