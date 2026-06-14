import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpMetricsMiddleware } from './shared/metrics/http-metrics.middleware';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { CustomersModule } from './modules/customers/customers.module';
import { OperationsModule } from './modules/operations/operations.module';
import { CoreBackofficeClient } from './shared/infrastructure/core-backoffice.client';
import { CorePointsClient } from './shared/infrastructure/core-points.client';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    HttpModule,
    DashboardModule,
    CustomersModule,
    OperationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, CoreBackofficeClient, CorePointsClient],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpMetricsMiddleware).forRoutes('*path');
  }
}
