# fullstack-study-app

Next.js App Router 기반의 관리자 계정 관리 예제입니다. 계정은 회원가입이 아니라 관리자가 생성하며, 로그인 세션과 사용자 권한은 서버에서 확인합니다.

## 기능

- 로그인 및 로그아웃
- 대시보드에서 사용자 정보 확인
- 관리자 전용 계정 목록 조회 및 사용자 생성
- JWT 세션 쿠키와 PostgreSQL 기반 사용자 저장
- Vitest 단위 테스트와 Storybook UI 개발 환경

홈(`/`)은 현재 Next.js 시작 화면입니다.

## 시작하기

필요 환경: Node.js와 npm, 로컬 PostgreSQL 실행을 위한 Docker. Dockerfile은 Node.js 24를 사용합니다.

1. 의존성을 설치합니다.

   ```bash
   npm install
   ```

2. `.env.example`을 `.env.local`로 복사한 뒤 값을 설정합니다. PowerShell에서는 `Copy-Item .env.example .env.local`, Bash에서는 `cp .env.example .env.local`을 사용할 수 있습니다.

   - `SESSION_SECRET`: `openssl rand -base64 32`로 생성한 세션 서명 키
   - `DATABASE_URL`: 기본값은 로컬 Docker PostgreSQL 연결 주소
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`: 초기 관리자 계정 정보. 비밀번호는 10자 이상이어야 합니다.
   - `ADMIN_NAME`: 선택 항목. 생략하면 `관리자`를 사용합니다.

3. 로컬 데이터베이스를 시작하고 마이그레이션을 적용합니다.

   ```bash
   docker compose up -d
   npm run db:migrate
   ```

4. 초기 관리자 계정을 만들고 개발 서버를 실행합니다.

   ```bash
   npm run db:seed
   npm run dev
   ```

앱은 [http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다. `db:seed`는 동일 이메일의 계정이 이미 있으면 변경하지 않습니다.

## 주요 경로

- `/login`: 로그인
- `/dashboard`: 로그인한 사용자의 대시보드
- `/admin/users`: 관리자 전용 계정 목록 및 계정 생성
- `/example`: UI 예제

## 명령어

| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run start` | 빌드 결과 실행 |
| `npm run lint` | ESLint 실행 |
| `npx tsc --noEmit` | TypeScript 타입 검사 |
| `npm run test` | Vitest watch 모드 |
| `npm run test:run` | Vitest 전체 테스트 1회 실행 |
| `npm run storybook` | Storybook 실행 (`http://localhost:6006`) |
| `npm run build-storybook` | Storybook 정적 빌드 |
| `npm run db:generate` | Prisma Client 생성 |
| `npm run db:migrate` | 개발 마이그레이션 생성 및 적용 |
| `npm run db:deploy` | 기존 마이그레이션 적용 |
| `npm run db:seed` | 초기 관리자 계정 생성 |

## 프로젝트 구조

- `src/app/`: App Router 페이지와 Server Actions
- `src/components/`: 앱 컴포넌트 및 `src/components/ui/`의 UI 컴포넌트
- `src/lib/auth.ts`: DB 기준 현재 사용자 및 관리자 확인
- `src/lib/session.ts`: 세션 쿠키 생성·검증·삭제
- `src/proxy.ts`: 보호 경로의 세션 기반 낙관적 검사
- `prisma/schema.prisma`: PostgreSQL 사용자 및 역할 스키마
- `prisma/seed.ts`: 초기 관리자 생성
- `__tests__/`: Vitest 테스트

## 인증과 권한

- 공개 회원가입은 없습니다. 첫 관리자는 `.env.local` 설정 후 `npm run db:seed`로 만듭니다.
- 비밀번호는 bcrypt로 해시합니다. 비밀번호, 해시, 세션 토큰을 로그나 클라이언트 응답에 노출하지 마세요.
- Proxy 검사는 빠른 라우트 보호용입니다. 실제 사용자와 관리자 권한은 서버에서 DB를 기준으로 확인하며, Server Action도 각자 권한 검사를 수행해야 합니다.
- 운영 환경에서는 `.env.local` 대신 배포 환경의 비밀 변수로 `SESSION_SECRET`, `DATABASE_URL` 등 필요한 값을 주입하세요.