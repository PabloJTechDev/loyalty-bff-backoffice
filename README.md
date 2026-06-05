# loyalty-bff-backoffice

BFF del backoffice de la loyalty platform.

## Propósito
Exponer payloads operativos orientados a backoffice.
Actualmente agrega dashboard mock local y lectura real desde `loyalty-core-backoffice` cuando está disponible.
También debe integrarse más adelante con:
- `loyalty-core-points`

## Estado
Bootstrap funcional con fallback seguro y primera integración real hacia `core-backoffice`.

## Endpoints actuales
- GET /api/health
- GET /api/ready
- GET /api/metrics
- GET /api/v1/backoffice/dashboard
- GET /api/v1/backoffice/customers/:customerId
- GET /api/v1/backoffice/orders/:orderId
