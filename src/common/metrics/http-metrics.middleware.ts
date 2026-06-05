import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import {
  httpRequestDurationSeconds,
  httpRequestsTotal,
  normalizeRoute,
  statusClass,
} from './http-metrics';

@Injectable()
export class HttpMetricsMiddleware implements NestMiddleware {
  use(request: Request, response: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    response.on('finish', () => {
      const durationSeconds = Number(process.hrtime.bigint() - start) / 1_000_000_000;
      const route = normalizeRoute(request.originalUrl || request.url);
      const labels = {
        method: request.method,
        route,
        status_class: statusClass(response.statusCode),
        status_code: String(response.statusCode),
      };

      httpRequestsTotal.inc(labels);
      httpRequestDurationSeconds.observe(labels, durationSeconds);
    });

    next();
  }
}
