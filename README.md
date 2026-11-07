# 군청년 바라지

정토사회문화회관 자원봉사 프로그램 **군청년 바라지**의 공개 모집 사이트와 운영 관리 도구입니다. 공개 페이지에서 신청을 받고, 관리자는 신청 접수·정원·봉사자 명부를 한 곳에서 관리합니다.

- **런타임**: Cloudflare Workers
- **프레임워크**: Hono + Hono JSX
- **DB**: Cloudflare D1 + Drizzle ORM
- **스타일**: Tailwind CSS 4
- **상호작용**: HTMX 2 (관리자), 최소 JavaScript (공개 폼)
- **인증**: Google OAuth + 서명 세션 쿠키

## 공개 사이트

| 경로 | 설명 |
| --- | --- |
| `/` | 2026년 11월 바라지 모집 안내 |
| `/apply` | 참여 일정 선택과 신청서 작성 |
| `/apply/complete/:token` | 접수번호와 신청 내용 확인 |

- 숙박형 4개 회차와 일일 공양 7개 타임을 달력형으로 안내합니다.
- 일정별 정원과 잔여 자리를 실시간으로 표시합니다.
- 정원이 차거나 일정이 시작되면 자동으로 마감됩니다.
- 신청 완료 시 무작위 토큰 링크로 접수 내용을 다시 확인할 수 있습니다.

## 관리자 사이트

| 경로 | 설명 |
| --- | --- |
| `/admin` | 신청 현황, 일정별 정원, 최근 신청·등록 |
| `/admin/applications` | 신청 검색·필터·상세·상태 변경·CSV |
| `/admin/schedules` | 일정별 정원과 모집 상태 설정 |
| `/admin/volunteers` | 봉사자 명부 CRUD |
| `/admin/emails` | 예외 허용 이메일 관리 (관리자 전용) |

신청을 **확정**하면 같은 연락처의 봉사자를 찾아 연결하고, 없으면 명부에 새로 등록합니다.

## 문서

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

원본 모집 공고와 신청 폼은 [`refs/`](refs/000_index.md)에 정리되어 있습니다.

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

- 공개 사이트: <http://localhost:8787>
- 관리자: <http://localhost:8787/admin>

### Google 로그인 없이 관리자 확인하기

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
ALLOWED_EMAILS="@example.com"
```

관리자가 아닌 사용자를 예외적으로 허용하려면 로그인 후 **허용 이메일**(`/admin/emails`) 페이지에서 개별 이메일을 등록합니다. 예외 사용자는 명부와 신청을 조회·관리할 수 있지만 관리자 페이지에는 접근할 수 없습니다.

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

```text
src/
  index.tsx                    # 앱 진입점, 보안 헤더, 404/500
  middleware/auth.ts           # 세션 확인, 허용 목록 확인, 관리자 여부
  routes/
    public.tsx                 # 공개 모집 페이지, 신청, 완료
    auth.tsx                   # Google OAuth, 세션, 로그아웃
    dashboard.tsx              # /admin 대시보드
    applications.tsx           # 신청 목록, 상세, 상태, CSV
    schedules.tsx              # 일정별 정원 설정
    volunteers.tsx             # 명부 CRUD + HTMX 부분 응답
    admin.tsx                  # 예외 허용 이메일 관리
  components/
    public-layout.tsx          # 공개 사이트 헤더/푸터
    landing.tsx                # 모집 안내 페이지
    apply-form.tsx             # 신청 폼
    apply-complete.tsx         # 접수 완료
    applications-view.tsx      # 신청 목록/상세
    schedules-view.tsx         # 일정·정원 설정
    layout.tsx                 # 관리자 레일/헤더/푸터
    dashboard-view.tsx
    volunteer-table.tsx
    volunteer-form.tsx
    allowed-emails-view.tsx
    login.tsx
    notice.tsx
    brand.tsx
  lib/
    baraji.ts                  # 일정, 정원, 포맷
    applications.ts            # 신청 검증, 쿼리, 상태, CSV
    session.ts                 # HMAC 서명 세션 쿠키
    encoding.ts                # base64url, 랜덤 문자열
    access.ts                  # 관리자·예외 허용 이메일 확인과 쿼리
    volunteers.ts              # 봉사자 검증, 쿼리, 날짜 포맷
    status.ts                  # 활동 상태 정의
  db/
    schema.ts                  # Drizzle 스키마
    client.ts
  styles.css                   # Tailwind 4 테마와 컴포넌트 스타일
drizzle/                       # D1 마이그레이션
public/
  assets/                      # htmx, 앱 스크립트, 빌드된 CSS
  favicon.svg
  logo*.svg
```

## 데이터 모델

| 테이블 | 설명 |
| --- | --- |
| `volunteers` | 봉사자 명부 |
| `allowed_emails` | 예외 허용 이메일 |
| `baraji_events` | 숙박형 회차와 일일 공양 타임, 정원 |
| `applications` | 바라지 신청 |
| `application_events` | 신청과 일정의 다대다 연결 |

`volunteers` 주요 컬럼: 이름, 신분, 소속, 전문분야, 지역, 연락처, 이메일, 상태(`active`/`standby`/`inactive`), 가입일, 메모.

`applications` 주요 컬럼: 접수번호, 접근 토큰, 참여 방식(`stay`/`shift`), 이름, 연락처, 소속, 회원구분, 성별, 숙박 여부, 텔레그램, 신청 동기, 상태(`received`/`confirmed`/`waitlist`/`cancelled`), 연결된 봉사자 ID.

`baraji_events` 주요 컬럼: 구분(`stay`/`shift`), 프로그램, 제목, 시작·종료 시각, 정원(`NULL`이면 제한 없음), 모집 여부, 정렬 순서.

## 다음 확장 지점

- **추가 모집 회차**: `round` 필드를 활용해 다음 달 일정을 추가
- **알림**: 확정 시 텔레그램 봇 또는 문자 발송
- **대기자 자동 승격**: 취소 발생 시 대기 순번으로 자동 전환
- **활동 일지**: `activities` 테이블(봉사자 FK, 일자, 시간, 내용)
- **권한 분리**: `users` 테이블과 역할(관리자/조회자)
- **목록 확장**: 페이지네이션, 정렬, CSV 내보내기

스키마를 바꾼 뒤에는 `npm run db:generate` → `npm run db:local` 순서로 적용하면 됩니다.
