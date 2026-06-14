import { Module } from '@nestjs/common';
import { OPERATIONS_REPOSITORY } from './domain/ports/operations.repository';
import { CoreBackofficeOperationsAdapter } from './infrastructure/adapters/core-backoffice-operations.adapter';
import { GetOrderDetailUseCase } from './application/get-order-detail.use-case';
import { OperationsController } from './presentation/operations.controller';

@Module({
  providers: [
    { provide: OPERATIONS_REPOSITORY, useClass: CoreBackofficeOperationsAdapter },
    GetOrderDetailUseCase,
  ],
  controllers: [OperationsController],
})
export class OperationsModule {}
