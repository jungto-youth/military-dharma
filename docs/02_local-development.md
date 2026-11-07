# 02. 로컬 개발

## 요구 사항

- Node.js 20 이상 (개발 환경은 Node 26에서 확인)
- npm
- Google Cloud 프로젝트 (Google 로그인을 실제로 시험할 때만 필요)
- Cloudflare 계정 (배포할 때만 필요)

로컬 실행에는 Cloudflare 로그인이 필요하지 않습니다. Wrangler가 로컬에서 Workerd와 D1을 실행합니다.

## 처음 설치

```bash
npm install
```

`postinstall`에서 `wrangler types`가 자동 실행되어 `worker-configuration.d.ts`가 생성됩니다. 이 파일은 Git에 포함하지 않습니다.

```bash
cp .dev.vars.example .dev.vars
openssl rand -base64 32
```

출력된 값을 `.dev.vars`의 `SESSION_SECRET`에 넣습니다.

```dotenv
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
SESSION_SECRET="발급받은-값"
ALLOWED_EMAILS=""
ALLOW_DEV_LOGIN="true"
```

로컬 D1에 마이그레이션을 적용합니다.

```bash
npm run db:local
```

개발 서버를 실행합니다.

```bash
npm run dev
```

<http://localhost:8787> 으로 접속합니다. 로그인 화면에서 **개발 계정으로 계속**을 누르거나 <http://localhost:8787/auth/dev> 로 바로 이동합니다.

> 현재 개발 머신의 `.dev.vars`에는 개발용 시크릿과 `ALLOW_DEV_LOGIN=true`가 설정되어 있을 수 있습니다. `.dev.vars`는 Git에 포함되지 않습니다.

## 환경 변수

`.dev.vars`는 Wrangler 로컬 개발용 시크릿 파일입니다. 배포 환경에서는 `wrangler secret put`으로 등록합니다.

| 변수 | 필수 | 설명 |
| --- | --- | --- |
| `GOOGLE_CLIENT_ID` | Google 로그인 시 | Google OAuth 웹 클라이언트 ID |
| `GOOGLE_CLIENT_SECRET` | Google 로그인 시 | Google OAuth 클라이언트 시크릿 |
| `SESSION_SECRET` | 항상 | 세션 쿠키 HMAC 서명 키. 충분히 긴 랜덤 값 |
| `ALLOWED_EMAILS` | 운영 시 권장 | 로그인 허용 이메일. 쉼표/공백 구분. 비우면 전부 거부, `*`는 전체 허용, `@도메인`은 해당 도메인 전체 허용 |
| `ALLOW_DEV_LOGIN` | 로컬만 | `"true"`일 때 `/auth/dev` 활성화. 배포 금지 |

`ALLOWED_EMAILS`는 대소문자를 구분하지 않습니다.

## 스크립트

| 명령 | 설명 |
| --- | --- |
| `npm run dev` | Tailwind watch + Wrangler 로컬 서버 |
| `npm run dev:css` | Tailwind CSS만 watch |
| `npm run dev:worker` | Wrangler만 실행 |
| `npm run build` | CSS minify 빌드 |
| `npm run deploy` | CSS 빌드 후 Cloudflare 배포 |
| `npm run db:generate` | 스키마 변경으로 마이그레이션 생성 |
| `npm run db:local` | 로컬 D1에 마이그레이션 적용 |
| `npm run db:remote` | 원격 D1에 마이그레이션 적용 |
| `npm run typecheck` | TypeScript 검사 |
| `npm run types` | Wrangler 바인딩 타입 재생성 |

## 로컬 D1

- 저장 위치: `.wrangler/state/v3/d1`
- 바인딩 이름: `DB`
- 스키마: `src/db/schema.ts`
- 마이그레이션: `drizzle/`

스키마를 바꾼 뒤:

```bash
npm run db:generate
npm run db:local
```

로컬 DB를 완전히 비우려면:

```bash
rm -rf .wrangler/state/v3/d1
npm run db:local
```

> 로컬 데이터가 모두 삭제됩니다. 원격 D1에는 영향을 주지 않습니다.

직접 확인:

```bash
npx wrangler d1 execute DB --local --command "SELECT id, name, status FROM volunteers"
```

## Google 로그인 설정

1. [Google Cloud Console → 사용자 인증 정보](https://console.cloud.google.com/apis/credentials)에서 **OAuth 클라이언트 ID → 웹 애플리케이션**을 만듭니다.
2. 승인된 리디렉션 URI에 추가합니다.
   - `http://localhost:8787/auth/google/callback`
   - 배포 도메인 사용 시 `https://<도메인>/auth/google/callback`
3. `.dev.vars`에 클라이언트 ID/시크릿을 넣고 서버를 재시작합니다.
4. `ALLOWED_EMAILS`에 본인 이메일을 추가합니다. 전체 허용은 `*`, 도메인 전체 허용은 `@도메인`.

Google 로그인 없이 UI를 확인하려면 `ALLOW_DEV_LOGIN="true"`만 있으면 됩니다.

## CSS 작업

`src/styles.css`가 유일한 소스입니다.

- 개발: `npm run dev`가 자동으로 `public/assets/app.css`를 갱신
- 배포: `npm run build`가 minify
- 새 Tailwind 클래스를 추가하면 watch가 자동 감지

CSS 파일을 직접 수정하지 마세요. `public/assets/app.css`는 빌드 결과입니다.

## 타입

Wrangler 바인딩 타입은 `wrangler.jsonc`에서 생성됩니다.

```bash
npm run types
```

`worker-configuration.d.ts`는 `.gitignore`에 포함되어 있으며, `npm install` 시 자동 생성됩니다.

## 브랜딩 변경

사이트 이름과 부제는 [`src/lib/site.ts`](../src/lib/site.ts)에서 수정합니다.

```ts
export const SITE_NAME = "전법봉사단";
export const SITE_TAGLINE = "군인 전법활동 봉사자 관리";
```

로그인 화면 문구는 [`src/components/login.tsx`](../src/components/login.tsx), 파비콘은 `public/favicon.svg`를 수정합니다.

## 다음 문서

- 인증 흐름: [04. 인증과 권한](04_authentication.md)
- 오류 해결: [11. 문제 해결](11_troubleshooting.md)
