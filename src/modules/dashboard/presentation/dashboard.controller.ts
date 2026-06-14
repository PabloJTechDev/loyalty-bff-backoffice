import { Controller, Get } from '@nestjs/common';
import { GetDashboardUseCase } from '../application/get-dashboard.use-case';

@Controller('v1/backoffice')
export class DashboardController {
  constructor(private readonly getDashboardUseCase: GetDashboardUseCase) {}

  @Get('dashboard')
  async dashboard() {
    return this.getDashboardUseCase.execute();
  }
}
