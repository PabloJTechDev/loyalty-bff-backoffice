# loyalty-bff-backoffice

BFF del backoffice de la loyalty platform.

## Propósito
Exponer payloads operativos orientados a backoffice.
Debe integrarse más adelante con:
- `loyalty-core-backoffice`
- `loyalty-core-points`

## Estado
Bootstrap funcional con engine mock para dashboard operativo.

## Endpoints actuales
- GET /api/health
- GET /api/ready
- GET /api/metrics
- GET /api/v1/backoffice/dashboard
- GET /api/v1/backoffice/customers/:customerId
- GET /api/v1/backoffice/orders/:orderId
