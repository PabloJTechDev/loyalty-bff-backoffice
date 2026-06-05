import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BackofficeController } from './backoffice.controller';
import { BackofficeService } from './backoffice.service';
import { CoreBackofficeClient } from './clients/core-backoffice.client';
import { CorePointsClient } from './clients/core-points.client';
import { CoreEcommerceClient } from './clients/core-ecommerce.client';

@Module({
  imports: [HttpModule],
  controllers: [BackofficeController],
  providers: [BackofficeService, CoreBackofficeClient, CorePointsClient, CoreEcommerceClient],
  exports: [BackofficeService],
})
export class BackofficeModule {}
