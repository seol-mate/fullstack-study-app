# my-app

TypeScript + Next.js (App Router) 프로젝트.

## 명령어

- `npm run dev` — 개발 서버 (http://localhost:3000)
- `npm run build` — 프로덕션 빌드
- `npm run start` — 빌드 결과 실행
- `npm run lint` — ESLint
- `npx tsc --noEmit` — 타입 체크
- `npm run storybook` — Storybook (http://localhost:6006)
- `npm run build-storybook` — Storybook 정적 빌드
- `docker compose up -d` — 로컬 Postgres 실행 (Docker Desktop 필요)
- `npm run db:migrate` — 스키마 변경 후 마이그레이션 생성/적용 (`prisma migrate dev`)
- `npm run db:seed` — 첫 관리자 계정 생성 (이미 있으면 변경 없음)
- `npm run db:generate` — Prisma Client 생성 (`npm install` 시 postinstall로 자동 실행)
- `npm run db:deploy` — 운영 DB에 마이그레이션 적용

## 구조

- `src/app/` — App Router (라우트, 레이아웃, 페이지)
- `src/components/ui/` — shadcn/ui 컴포넌트 (`*.stories.tsx` 포함)
- `src/atoms/` — Jotai atom
- `prisma/schema.prisma` — DB 스키마 (Postgres, `User`/`Role`), `prisma/seed.ts` — 관리자 시드, `prisma.config.ts` — Prisma 설정(`.env.local` 로드)
- `src/generated/prisma/` — 생성된 Prisma Client (git 제외, 직접 수정 금지)
- `src/lib/db.ts` — Prisma Client 싱글톤 (`db`), `src/lib/session.ts` — JWT(jose) 세션
- `src/lib/auth.ts` — `getCurrentUser()`, `requireAdmin()` (DB 기준으로 사용자/권한 확인)
- `src/app/actions/` — Server Action (`auth.ts` 로그인/로그아웃, `users.ts` 관리자 계정 생성)
- `src/proxy.ts` — 세션 쿠키 기반 낙관적 라우트 보호 (`/dashboard`, `/admin`)
- `public/` — 정적 파일
- import alias: `@/*` → `src/*`
- 환경변수: `.env.example` 참고 (`SESSION_SECRET`, `DATABASE_URL`, `ADMIN_*`는 `.env.local`에 설정)

## 인증/계정

- 회원가입 없음. 계정은 관리자(`/admin/users`)만 만든다. 첫 관리자는 `.env.local`의 `ADMIN_*`로 `npm run db:seed` 실행.
- 비밀번호는 bcrypt(cost 12)로 해시한다. 비밀번호/해시를 로그·응답·클라이언트에 노출하지 않는다.
- 권한 확인은 토큰의 값이 아니라 항상 DB 기준(`requireAdmin()`). Server Action은 직접 호출될 수 있으므로 각 action 안에서 다시 확인한다.

## 규칙

- TypeScript strict 모드 유지, `any` 사용 지양
- 기본은 Server Component, 상호작용이 필요할 때만 `"use client"` 사용
- 스타일은 Tailwind CSS(+ shadcn/ui) 기본, 유틸리티로 부족할 때만 CSS Modules (`*.module.css`) 사용
- 세션(`cookies()`)을 읽는 컴포넌트는 반드시 `<Suspense>` 안에 둔다 (`cacheComponents` 활성화)
- 커밋 전 `npm run lint`와 `npx tsc --noEmit` 통과 확인
- 이 Next.js 버전은 기존 지식과 다를 수 있음 — 코드 작성 전 `node_modules/next/dist/docs/`의 관련 문서를 먼저 확인 (`AGENTS.md` 참고)
