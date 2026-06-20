# 14 - DevOps & CI/CD

## Repositorios recomendados

```text
financial-tracker-mobile
financial-tracker-api
financial-tracker-infra
```

O monorepo:

```text
financial-tracker/
├── apps/mobile
├── apps/api
├── packages/shared-contracts
├── infra
└── docs
```

## Pipeline Backend

Etapas:

1. Install dependencies
2. Lint
3. Unit tests
4. Build
5. Security scan
6. Docker build
7. Push image
8. Deploy dev
9. Run migrations
10. Smoke test

## Pipeline Mobile

Etapas:

1. Flutter pub get
2. Analyze
3. Test
4. Build Android APK/AAB
5. Build iOS archive
6. Upload artifacts
7. Publicación manual controlada

## Docker Compose local

Servicios:

- api
- postgres
- redis
- worker
- mailhog opcional

## Variables sensibles

- DATABASE_URL
- JWT_SECRET
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- MICROSOFT_CLIENT_ID
- MICROSOFT_CLIENT_SECRET
- TOKEN_ENCRYPTION_KEY
- REDIS_URL

## Ambientes

- local
- dev
- qa
- prod

## Migraciones

Usar Prisma Migrate o TypeORM migrations.

## Observabilidad

- Logs JSON
- Health checks
- Metrics endpoint
- Error tracking
- Audit logs
