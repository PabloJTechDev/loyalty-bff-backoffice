import { Counter, Histogram, Registry, collectDefaultMetrics } from 'prom-client';

export const metricsRegistry = new Registry();
collectDefaultMetrics({ register: metricsRegistry, prefix: 'loyalty_backoffice_bff_' });

export const httpRequestsTotal = new Counter({
  name: 'loyalty_backoffice_bff_http_requests_total',
  help: 'Total HTTP requests handled by the backoffice BFF',
  labelNames: ['method', 'route', 'status_class', 'status_code'] as const,
  registers: [metricsRegistry],
});

export const httpRequestDurationSeconds = new Histogram({
  name: 'loyalty_backoffice_bff_http_request_duration_seconds',
  help: 'HTTP request latency in seconds for the backoffice BFF',
  labelNames: ['method', 'route', 'status_class', 'status_code'] as const,
  buckets: [0.01, 0.025, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1, 1.5, 2, 3, 5],
  registers: [metricsRegistry],
});

export function normalizeRoute(path: string): string {
  if (!path) return 'unknown';

  return path
    .replace(/\/api\/v1\/backoffice\/customers\/[^/]+/g, '/api/v1/backoffice/customers/:customerId')
    .replace(/\/api\/v1\/backoffice\/orders\/[^/]+/g, '/api/v1/backoffice/orders/:orderId');
}

export function statusClass(statusCode: number): string {
  return `${Math.floor(statusCode / 100)}xx`;
}
