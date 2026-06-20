# AGENTS.md - Development Rules for AI Coding Agents

## Project

Financial Tracker App

## Goal

Build a Flutter mobile application and NestJS backend to automatically track credit card and banking expenses using Android notifications and email ingestion via Gmail/Outlook OAuth.

## General Rules

- Follow spec-driven development.
- Do not implement features not described in the specs without updating the spec first.
- Prioritize security and privacy.
- Never log OAuth tokens, JWTs, financial raw bodies, or sensitive user data.
- All backend resources must be scoped by user_id.
- All parsers must include tests.
- All transaction transformations must be traceable to raw_message_id.
- Prefer deterministic rules before AI categorization.
- Never assume iOS can read third-party notifications.

## Backend Rules

- Use NestJS modular architecture.
- Use DTOs with validation decorators.
- Use OpenAPI decorators.
- Use PostgreSQL as source of truth.
- Use Redis/BullMQ for async processing.
- Use migrations for schema changes.
- Use structured logs.
- Include correlation IDs.
- Do not store full email bodies unless explicitly configured.
- Encrypt OAuth tokens at rest.

## Mobile Rules

- Use Flutter.
- Use secure storage for tokens.
- Android notification capture must be implemented with Kotlin native service.
- iOS must not attempt notification capture.
- All permission screens must clearly explain what data is captured.
- Implement offline queue for Android notification events.

## Testing Rules

- Add unit tests for every parser.
- Add tests for duplicate detection.
- Add tests for card reconciliation.
- Add API integration tests for core flows.
- Mock Gmail/Outlook APIs in tests.
- Use fixture files for sample bank messages.

## Security Rules

- No secrets in repository.
- No sensitive data in logs.
- Redact card numbers except last4.
- Redact email body in error reporting.
- Use least-privilege OAuth scopes.
- Implement delete account flow.

## Definition of Done

A feature is done only when:

- Spec is updated.
- Code is implemented.
- Tests are added.
- Security impact is reviewed.
- API contract is documented.
- Errors are handled.
- Logs are safe.
