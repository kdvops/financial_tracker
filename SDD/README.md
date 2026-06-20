# Financial Tracker - Spec Driven Development

## Objetivo

Desarrollar una aplicación Android/iOS para seguimiento automático de gastos bancarios, tarjetas de crédito, pagos, presupuestos y alertas, evitando el registro manual de transacciones.

## Stack propuesto

- App móvil: Flutter
- Android: Flutter + módulo nativo Kotlin para NotificationListenerService
- iOS: Flutter + integración OAuth con Gmail/Outlook
- Backend API: NestJS
- Base de datos: PostgreSQL
- Jobs/colas: BullMQ + Redis
- IA/categorización: motor híbrido de reglas + modelo IA opcional
- Autenticación: JWT + OAuth externo
- Infraestructura recomendada: Docker, Kubernetes, CI/CD con Azure DevOps o GitHub Actions

## Documentos incluidos

1. `01-product-requirements.md`
2. `02-architecture.md`
3. `03-mobile-app-spec.md`
4. `04-backend-api-spec.md`
5. `05-email-ingestion-spec.md`
6. `06-android-notification-reader-spec.md`
7. `07-transaction-normalizer-spec.md`
8. `08-ai-categorization-spec.md`
9. `09-card-reconciliation-spec.md`
10. `10-database-model.md`
11. `11-security-privacy.md`
12. `12-api-contracts.md`
13. `13-testing-strategy.md`
14. `14-devops-ci-cd.md`
15. `15-roadmap.md`
16. `AGENTS.md`
