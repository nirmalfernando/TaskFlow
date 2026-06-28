FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY server/package.json ./server/
RUN CI=true pnpm install --frozen-lockfile --filter @taskflow/server

COPY server/ ./server/
WORKDIR /app/server
RUN npx prisma generate
RUN pnpm build

FROM node:22-alpine AS production
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY server/package.json ./server/
RUN CI=true pnpm install --frozen-lockfile --filter @taskflow/server

COPY server/prisma ./server/prisma/
WORKDIR /app/server
RUN npx prisma generate

COPY --from=builder /app/server/dist ./dist/

EXPOSE 5000
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
