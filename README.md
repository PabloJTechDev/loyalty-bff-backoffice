# loyalty-bff-backoffice

BFF del backoffice de la loyalty platform.

## Propósito
Exponer payloads operativos orientados a backoffice.
Actualmente agrega dashboard mock local y lectura real desde:
- `loyalty-core-backoffice` para capacidades y alertas operativas
- `loyalty-core-points` para perfiles/snapshots de cliente
- `loyalty-core-ecommerce` para órdenes recientes y order detail operativo vía `GET /v1/orders` y `GET /v1/orders/:orderId`

## Estado
Bootstrap funcional con fallback seguro y primeras integraciones reales cross-core.
Backoffice ya consume datos reales de ecommerce para recent orders y order detail cuando el core está disponible.

## Endpoints actuales
- GET /api/health
- GET /api/ready
- GET /api/metrics
- GET /api/v1/backoffice/dashboard
- GET /api/v1/backoffice/customers/:customerId
- GET /api/v1/backoffice/orders/:orderId
