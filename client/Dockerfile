FROM node:22-alpine AS builder
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@11.8.0 --activate

WORKDIR /app
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json .npmrc ./
COPY client/package.json ./client/
RUN pnpm install --frozen-lockfile --filter @taskflow/client

COPY client/ ./client/

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/client
RUN pnpm build

FROM nginx:alpine AS production
COPY --from=builder /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
