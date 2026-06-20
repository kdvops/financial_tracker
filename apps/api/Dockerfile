FROM node:24-alpine AS base
WORKDIR /app

COPY package.json package-lock.json tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-contracts/package.json packages/shared-contracts/package.json

RUN npm ci

COPY . .

RUN npm run build --workspace @financial-tracker/shared-contracts \
  && npm run prisma:generate --workspace @financial-tracker/api \
  && npm run build --workspace @financial-tracker/api

EXPOSE 3000

CMD ["npm", "run", "start", "--workspace", "@financial-tracker/api"]
