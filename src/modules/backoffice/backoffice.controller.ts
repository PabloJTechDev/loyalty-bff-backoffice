import { Controller, Get, Param } from '@nestjs/common';
import { BackofficeService } from './backoffice.service';
import type { BackofficeDashboardResponseDto } from './dto/backoffice-dashboard.dto';

@Controller('v1/backoffice')
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Get('dashboard')
  getDashboard(): BackofficeDashboardResponseDto {
    return this.backofficeService.getDashboard();
  }

  @Get('customers/:customerId')
  getCustomerSnapshot(@Param('customerId') customerId: string) {
    return this.backofficeService.getCustomerSnapshot(customerId);
  }

  @Get('orders/:orderId')
  getOrderSnapshot(@Param('orderId') orderId: string) {
    return this.backofficeService.getOrderSnapshot(orderId);
  }
}
