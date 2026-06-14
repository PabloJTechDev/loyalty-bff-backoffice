import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CUSTOMERS_REPOSITORY } from './domain/ports/customers.repository';
import { CoreBackofficeCustomersAdapter } from './infrastructure/adapters/core-backoffice-customers.adapter';
import { GetCustomerSnapshotUseCase } from './application/get-customer-snapshot.use-case';
import { GetCustomerPointsUseCase } from './application/get-customer-points.use-case';
import { CustomersController } from './presentation/customers.controller';
import { CorePointsClient } from '../../shared/infrastructure/core-points.client';

@Module({
  imports: [HttpModule],
  providers: [
    CorePointsClient,
    { provide: CUSTOMERS_REPOSITORY, useClass: CoreBackofficeCustomersAdapter },
    GetCustomerSnapshotUseCase,
    GetCustomerPointsUseCase,
  ],
  controllers: [CustomersController],
})
export class CustomersModule {}
