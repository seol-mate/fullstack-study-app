# syntax=docker/dockerfile:1

# 멀티 스테이지: deps → builder → (migrate | runner)
# 기본 타깃(마지막 스테이지)은 운영 실행용 runner.
# DB 마이그레이션용 이미지는 `docker build --target migrate` 로 만든다.

FROM node:24-bookworm-slim AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
# postinstall(prisma generate)이 스키마와 설정을 필요로 한다.
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# .dockerignore로 로컬의 생성물은 제외되므로 여기서 Prisma Client를 다시 만든다.
RUN npx prisma generate
# 빌드 검증용 더미 값(이미지에 남지 않도록 RUN 한 줄에서만 지정). 실제 값은 실행 시 주입한다.
RUN NEXT_OUTPUT=standalone \
    NEXT_TELEMETRY_DISABLED=1 \
    SESSION_SECRET=docker-build-only-secret \
    DATABASE_URL=postgresql://postgres:postgres@localhost:5432/my_app \
    npm run build

# prisma migrate deploy 전용. Prisma 스키마 엔진이 openssl을 필요로 한다.
FROM builder AS migrate
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
CMD ["npx", "prisma", "migrate", "deploy"]

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
