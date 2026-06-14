import { Inject, Injectable } from '@nestjs/common';
import { DASHBOARD_REPOSITORY } from '../domain/ports/dashboard.repository';
import type { IDashboardRepository } from '../domain/ports/dashboard.repository';

@Injectable()
export class GetDashboardUseCase {
  constructor(
    @Inject(DASHBOARD_REPOSITORY) private readonly dashboard: IDashboardRepository,
  ) {}

  async execute() {
    return this.dashboard.getDashboard();
  }
}
