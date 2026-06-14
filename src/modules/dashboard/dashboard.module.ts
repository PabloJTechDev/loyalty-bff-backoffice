import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DASHBOARD_REPOSITORY } from './domain/ports/dashboard.repository';
import { CoreBackofficeAdapter } from './infrastructure/adapters/core-backoffice.adapter';
import { GetDashboardUseCase } from './application/get-dashboard.use-case';
import { DashboardController } from './presentation/dashboard.controller';
import { CoreBackofficeClient } from '../../shared/infrastructure/core-backoffice.client';
import { CorePointsClient } from '../../shared/infrastructure/core-points.client';

@Module({
  imports: [HttpModule],
  providers: [
    CoreBackofficeClient,
    CorePointsClient,
    { provide: DASHBOARD_REPOSITORY, useClass: CoreBackofficeAdapter },
    GetDashboardUseCase,
  ],
  controllers: [DashboardController],
})
export class DashboardModule {}
