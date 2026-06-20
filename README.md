# financial_tracker

Monorepo base for the Financial Tracker project.

## Workspaces

- `apps/api`: NestJS + Prisma backend
- `apps/mobile`: Flutter mobile app
- `packages/shared-contracts`: shared domain contracts

## Quick start

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Start infrastructure with `docker compose up -d postgres redis`.
4. Run database migrations with `npm run prisma:migrate:deploy --workspace @financial-tracker/api`.
5. Start the API with `npm run dev:api`.

## Docker

- Start full stack: `docker compose up --build`
- API health: `http://localhost:3000/api/health`
