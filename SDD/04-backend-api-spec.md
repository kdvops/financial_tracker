# 04 - Backend API Spec

## Tecnología

- NestJS
- PostgreSQL
- Prisma ORM
- Redis
- BullMQ
- JWT
- OAuth2
- OpenAPI/Swagger

## Decisión ORM

Se adopta Prisma por:

- Tipado fuerte en TypeScript.
- Esquema explícito y migraciones mantenibles.
- Buena velocidad de desarrollo para el MVP.
- Integración clara con PostgreSQL y flujos backend en NestJS.

## Módulos NestJS

```text
src/
|-- auth/
|-- users/
|-- oauth/
|-- email-sync/
|-- notifications-ingestion/
|-- bank-parsers/
|-- transactions/
|-- cards/
|-- categories/
|-- budgets/
|-- alerts/
|-- reconciliation/
|-- duplicate-detector/
|-- audit/
`-- common/
```

## APIs principales

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`

### OAuth

- `GET /oauth/google/start`
- `GET /oauth/google/callback`
- `GET /oauth/microsoft/start`
- `GET /oauth/microsoft/callback`
- `DELETE /oauth/:provider/disconnect`

### Ingesta Android

- `POST /ingestion/notifications`
- `POST /ingestion/notifications/batch`

### Transacciones

- `GET /transactions`
- `GET /transactions/:id`
- `PATCH /transactions/:id`
- `DELETE /transactions/:id`
- `POST /transactions/:id/mark-duplicate`
- `POST /transactions/:id/reprocess`

### Tarjetas

- `GET /cards`
- `POST /cards`
- `PATCH /cards/:id`
- `DELETE /cards/:id`
- `GET /cards/:id/statement-summary`

### Categorías

- `GET /categories`
- `POST /categories/rules`
- `PATCH /categories/rules/:id`

### Presupuestos

- `GET /budgets`
- `POST /budgets`
- `PATCH /budgets/:id`
- `DELETE /budgets/:id`

### Alertas

- `GET /alerts`
- `PATCH /alerts/:id/read`

## Procesamiento asíncrono

Colas:

- `email-sync`
- `message-parsing`
- `transaction-normalization`
- `duplicate-detection`
- `categorization`
- `reconciliation`
- `alerts`

## Estados de transacción

```text
RAW_RECEIVED
PARSED
NORMALIZED
DUPLICATE_SUSPECTED
CATEGORIZED
RECONCILED
NEEDS_REVIEW
FAILED
```

## Observabilidad

- Logs estructurados JSON
- Correlation ID por request
- Auditoría de cambios financieros
- Métricas por parser
- Métricas de duplicados
- Métricas de precisión de categorización
