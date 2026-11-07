# 전법봉사단

군인 전법활동 봉사자 명부를 관리하는 사이트입니다. 서버에서 HTML을 그리고, 화면 갱신은 HTMX로 처리합니다.

- **런타임**: Cloudflare Workers
- **프레임워크**: Hono + Hono JSX
- **DB**: Cloudflare D1 + Drizzle ORM
- **스타일**: Tailwind CSS 4
- **상호작용**: HTMX 2 (로컬 번들)
- **인증**: Google OAuth + 서명 세션 쿠키

## 문서

상세 문서는 [`docs/`](docs/00_overview.md)에 정리되어 있습니다.

| 문서 | 내용 |
| --- | --- |
| [00. 개요](docs/00_overview.md) | 목적, 범위, 기술 스택 |
| [01. 아키텍처](docs/01_architecture.md) | 요청 흐름, 구조, 설계 결정 |
| [02. 로컬 개발](docs/02_local-development.md) | 설치, 환경 변수, 스크립트 |
| [03. 데이터 모델](docs/03_data-model.md) | 스키마, 검증, 마이그레이션 |
| [04. 인증과 권한](docs/04_authentication.md) | OAuth, 세션, 접근 제어 |
| [05. 라우팅과 HTTP](docs/05_routing-http.md) | 라우트, 응답 규약, 예시 |
| [06. 화면과 컴포넌트](docs/06_ui-components.md) | 페이지 구성, 반응형 |
| [07. HTMX 패턴](docs/07_htmx-patterns.md) | 부분 갱신, 이벤트, 모달 |
| [08. 디자인 시스템](docs/08_design-system.md) | 색상, 타이포, 클래스 |
| [09. 배포와 운영](docs/09_deployment-operations.md) | D1, 시크릿, 배포, 백업 |
| [10. 확장 가이드](docs/10_extension-guide.md) | 기능 추가 절차, 제안 스키마 |
| [11. 문제 해결](docs/11_troubleshooting.md) | 오류별 해결 방법 |

## 구현된 기능

- Google 계정 로그인, 허용 이메일 목록 제한
- 관리자 페이지에서 예외 허용 이메일 등록·삭제
- 대시보드: 상태별 편성 인원과 비율, 최근 등록 봉사자
- 봉사자 명부: 검색(이름·소속·전문분야·지역), 상태 필터
- 봉사자 등록·수정·삭제 (HTMX 모달 폼, 부분 갱신)
- 데스크톱·모바일 반응형 레이아웃

## 빠른 시작

요구 사항: Node.js 20 이상

```bash
npm install
cp .dev.vars.example .dev.vars
```

`.dev.vars`의 `SESSION_SECRET`을 채웁니다.

```bash
openssl rand -base64 32
```

로컬 D1에 마이그레이션을 적용하고 개발 서버를 실행합니다.

```bash
npm run db:local
npm run dev
```

<http://localhost:8787> 에서 확인할 수 있습니다.

### Google 로그인 없이 확인하기

`.dev.vars`에서 `ALLOW_DEV_LOGIN="true"`로 두면 로그인 화면에 **개발 계정으로 계속** 링크가 나타납니다. 이 링크는 `/auth/dev`로 연결됩니다.

> `ALLOW_DEV_LOGIN`은 로컬 개발 전용입니다. 배포 환경에서는 절대 켜지 마세요.

## Google OAuth 설정

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials)에서 **사용자 인증 정보 만들기 → OAuth 클라이언트 ID → 웹 애플리케이션**을 만듭니다.
2. **승인된 리디렉션 URI**에 아래 주소를 추가합니다.
   - `http://localhost:8787/auth/google/callback`
   - `https://<배포-도메인>/auth/google/callback`
3. 클라이언트 ID와 시크릿을 `.dev.vars`에 넣습니다.

```dotenv
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
SESSION_SECRET="..."
ALLOWED_EMAILS="admin@example.com,staff@example.com"
```

`ALLOWED_EMAILS`는 **관리자** 목록입니다. 쉼표로 구분해 넣으며, 여기에 포함된 계정은 모든 기능과 허용 이메일 관리 페이지에 접근할 수 있습니다. 도메인 전체를 허용하려면 `@`로 시작하는 도메인을, 모든 계정을 관리자로 허용하려면 `*`를 지정합니다.

```dotenv
ALLOWED_EMAILS="admin@example.com,staff@example.com"
ALLOWED_EMAILS="@example.com"
```

관리자가 아닌 사용자를 예외적으로 허용하려면 로그인 후 **허용 이메일**(`/admin/emails`) 페이지에서 개별 이메일을 등록합니다. 예외 사용자는 명부를 조회·관리할 수 있지만 관리자 페이지에는 접근할 수 없습니다. 예외 목록에서 삭제하면 해당 사용자의 세션은 다음 요청부터 무효화됩니다.

## 주요 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Tailwind watch + Wrangler 로컬 서버 |
| `npm run build` | Tailwind CSS 빌드 |
| `npm run deploy` | 빌드 후 Cloudflare 배포 |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 생성 |
| `npm run db:local` | 로컬 D1에 마이그레이션 적용 |
| `npm run db:remote` | 원격 D1에 마이그레이션 적용 |
| `npm run typecheck` | TypeScript 검사 |
| `npm run types` | Wrangler 바인딩 타입 생성 |

## 배포

```bash
npx wrangler login
npx wrangler d1 create military-dharma
```

출력된 `database_id`를 `wrangler.jsonc`의 `d1_databases[0].database_id`에 넣습니다. 그다음:

```bash
npm run db:remote
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put SESSION_SECRET
npx wrangler secret put ALLOWED_EMAILS
npm run deploy
```

배포 후 Cloudflare 대시보드에서 커스텀 도메인을 연결하고, Google OAuth의 승인된 리디렉션 URI에 배포 도메인의 콜백 주소를 추가하세요.

`ALLOW_DEV_LOGIN`은 원격 환경에 설정하지 않습니다. `.dev.vars`는 `.gitignore`에 포함되어 있습니다.

## 프로젝트 구조

```
src/
  index.tsx               # 앱 진입점, 보안 헤더, 404/500
  middleware/auth.ts      # 세션 확인, 허용 목록 확인, 관리자 여부 설정
  routes/
    auth.tsx              # Google OAuth, 세션, 로그아웃
    dashboard.tsx         # 편성 현황
    volunteers.tsx        # 명부 CRUD + HTMX 부분 응답
    admin.tsx             # 예외 허용 이메일 관리 (관리자 전용)
  components/
    layout.tsx            # 레일/헤더/푸터, 상태 배지
    brand.tsx             # 브랜드 마크 (인라인 SVG)
    dashboard-view.tsx
    volunteers-view.tsx
    volunteer-table.tsx
    volunteer-form.tsx
    allowed-emails-view.tsx
    login.tsx
    notice.tsx
  lib/
    session.ts            # HMAC 서명 세션 쿠키
    encoding.ts           # base64url, 랜덤 문자열
    access.ts             # 관리자·예외 허용 이메일 확인과 쿼리
    volunteers.ts         # 검증, 쿼리, 날짜 포맷
    status.ts             # 활동 상태 정의
  db/
    schema.ts             # Drizzle 스키마
    client.ts
  styles.css              # Tailwind 4 테마와 컴포넌트 스타일
drizzle/                  # D1 마이그레이션
public/
  assets/                 # htmx, 앱 스크립트, 빌드된 CSS
  favicon.svg             # 파비콘
  logo.svg                # 타일형 로고
  logo-lockup.svg         # 가로 로고 (밝은 배경)
  logo-lockup-inverse.svg # 가로 로고 (짙은 배경)
```

## 데이터 모델

`volunteers` 테이블:

| 컬럼 | 설명 |
| --- | --- |
| `name` | 이름 (필수) |
| `rank` | 신분/계급 (예: 예비역 대위) |
| `affiliation` | 소속 |
| `specialty` | 전문분야 |
| `region` | 활동지역 |
| `phone`, `email` | 연락처 |
| `status` | `active` 활동중, `standby` 대기, `inactive` 휴면 |
| `joined_at` | 가입일 |
| `notes` | 메모 |

`allowed_emails` 테이블 (관리자가 등록하는 예외 허용 목록):

| 컬럼 | 설명 |
| --- | --- |
| `email` | 허용할 Google 계정 (소문자, 고유) |
| `memo` | 등록 사유 |
| `created_by` | 등록한 관리자 이메일 |
| `created_at` | 등록 시각 (UTC) |

## 다음 확장 지점

기능 범위가 정해지면 아래를 붙이기 좋습니다.

- **활동 일지**: `activities` 테이블(봉사자 FK, 일자, 시간, 내용)
- **상담 신청·배정**: `requests` 테이블과 배정 상태
- **공지·게시판**: 간단한 `notices` 테이블
- **권한 분리**: `users` 테이블과 역할(관리자/조회자)
- **목록 확장**: 페이지네이션, 정렬, CSV 내보내기

스키마를 바꾼 뒤에는 `npm run db:generate` → `npm run db:local` 순서로 적용하면 됩니다.
