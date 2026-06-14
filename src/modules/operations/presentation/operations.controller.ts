import { Controller, Get, Param } from '@nestjs/common';
import { GetOrderDetailUseCase } from '../application/get-order-detail.use-case';

@Controller('v1/backoffice')
export class OperationsController {
  constructor(private readonly getOrderDetailUseCase: GetOrderDetailUseCase) {}

  @Get('orders/:orderId')
  getOrder(@Param('orderId') orderId: string) {
    return this.getOrderDetailUseCase.execute(orderId);
  }
}
