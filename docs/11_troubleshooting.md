# 11. 문제 해결

## 로컬 개발

### 포트 8787이 이미 사용 중

```bash
lsof -ti tcp:8787 | xargs kill
```

그래도 안 되면 다른 포트로 실행합니다.

```bash
npm run dev:worker -- --port 8788
```

이 경우 Google OAuth의 리디렉션 URI도 `http://localhost:8788/auth/google/callback`으로 맞춰야 합니다.

### `SQLITE_BUSY` / `database is locked`

원인: 이전 Wrangler/Workerd 프로세스가 로컬 D1 파일을 잡고 있는 경우가 많습니다. 특히 여러 터미널에서 동시에 `wrangler dev`를 실행했을 때 발생합니다.

```bash
lsof -ti tcp:8787 | xargs kill
pkill -f 'workerd serve'
pkill -f 'wrangler dev'
ps aux | grep -E 'workerd|wrangler dev' | grep -v grep
```

프로세스가 모두 사라진 것을 확인한 뒤 다시 실행합니다.

```bash
npm run dev
```

그래도 반복되면 로컬 상태를 재생성합니다. **로컬 데이터가 삭제됩니다.**

```bash
rm -rf .wrangler/state/v3/d1
npm run db:local
```

### `worker-configuration.d.ts`가 없어 타입 오류

```bash
npm run types
```

`npm install` 시 `postinstall`로 자동 생성됩니다. 생성 파일은 Git에 포함되지 않습니다.

### CSS 변경이 반영되지 않음

- `npm run dev`가 실행 중인지 확인 (Tailwind watch 포함)
- 브라우저 강력 새로고침
- `public/assets/app.css`가 최신인지 확인

```bash
npm run build:css
```

CSS는 `src/styles.css`만 수정합니다. `public/assets/app.css`는 빌드 산출물입니다.

### 로그인 화면에 “Google OAuth 설정이 필요합니다”가 표시됨

다음 세 가지가 모두 있어야 Google 로그인 버튼이 나타납니다.

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

`.dev.vars`를 수정한 뒤 Wrangler를 재시작하세요.

### 개발용 로그인이 404

`ALLOW_DEV_LOGIN="true"`인지 확인합니다. 값은 정확히 문자열 `true`여야 합니다.

### 로그인 후 계속 `/login`으로 돌아감

- `SESSION_SECRET`이 바뀌지 않았는지 확인
- 브라우저 쿠키의 `session` 삭제 후 재로그인
- HTTPS가 아닌데 Secure 쿠키를 요구하지 않는지 확인 (현재 코드는 프로토콜에 따라 자동)
- 서버 시계 확인

### “이 Google 계정은 접근 허용 목록에 없습니다”

`ALLOWED_EMAILS`에 이메일을 추가합니다.

```dotenv
ALLOWED_EMAILS="me@example.com"
```

- 쉼표 또는 공백 구분
- 대소문자 무시
- 비어 있으면 전부 거부
- 테스트 중 전체 허용은 `*`

### `redirect_uri_mismatch`

Google Console의 승인된 리디렉션 URI와 실제 접속 주소가 정확히 같아야 합니다.

- `http://localhost:8787/auth/google/callback`
- `https://<도메인>/auth/google/callback`

`localhost`와 `127.0.0.1`은 서로 다른 URI입니다. trailing slash도 다르게 취급됩니다.

### 로그인 후 “Google 인증에 실패했습니다”

- 클라이언트 ID/시크릿 오타
- OAuth 클라이언트 유형이 “웹 애플리케이션”인지 확인
- 서버 로그 확인 (`wrangler dev` 터미널)
- Google Cloud 프로젝트의 OAuth 동의 화면 게시 상태 확인

### 대화상자가 열리지 않음

1. 브라우저 콘솔에 CSP/스크립트 오류가 있는지 확인
2. `public/assets/htmx.min.js`와 `app.js`가 200으로 로드되는지 Network 탭 확인
3. `#volunteer-dialog`와 `#form-slot`이 페이지에 있는지 확인
4. `htmx:afterSwap`에서 `target.id === "form-slot"`인지 확인

### 토스트 문구가 깨짐

`HX-Trigger`에 한글을 직접 넣으면 발생합니다. 현재는 `asciiJson`으로 이스케이프합니다. 새 이벤트를 추가할 때도 같은 방식을 사용하세요.

```ts
c.header("HX-Trigger", asciiJson({
  "volunteer:changed": { message: "저장했습니다." },
}));
```

### HTMX 요청이 401로 실패

세션이 만료된 정상 동작입니다. `HX-Redirect: /login`을 확인하고 다시 로그인하세요. 개발 중 반복되면 `SESSION_SECRET` 변경 여부를 확인합니다.

### 한글 검색이 안 됨

현재 검색 대상은 이름, 소속, 전문분야, 활동지역입니다. 연락처/이메일은 검색하지 않습니다. `q`는 최대 80자로 잘립니다.

### 샘플 데이터가 보임

로컬 D1은 Git에 포함되지 않으며, 개발 머신에만 데이터가 남습니다. 비우려면:

```bash
npx wrangler d1 execute DB --local --command "DELETE FROM volunteers"
```

전체를 초기화하려면 `.wrangler/state/v3/d1`을 삭제하고 `npm run db:local`을 다시 실행합니다.

## 배포

### 배포는 됐는데 500

```bash
npx wrangler tail
```

확인할 것:

- D1 바인딩 이름이 `DB`인지
- `database_id`가 실제 ID인지
- 원격 마이그레이션이 적용됐는지 (`npm run db:remote`)
- 시크릿이 등록됐는지

### 로그인 화면은 뜨는데 Google 버튼이 없음

원격 시크릿 3종이 모두 있는지 확인합니다.

```bash
npx wrangler secret list
```

### Google 로그인 후 500 또는 거부

- 원격 `ALLOWED_EMAILS` 확인
- `SESSION_SECRET` 존재 확인
- 배포 도메인의 콜백 URI 등록 확인
- Google Console의 테스트 사용자/게시 상태 확인

### 정적 파일 404

- `public/assets/app.css`가 빌드되어 있는지
- `wrangler.jsonc`의 `assets.directory`가 `./public`인지
- `npm run deploy`가 CSS 빌드 후 실행됐는지

```bash
npm run build
ls public/assets
```

### CSS가 예전 스타일로 보임

Cloudflare 엣지 캐시 또는 브라우저 캐시일 수 있습니다. 강력 새로고침 후 확인합니다. 배포마다 파일 내용이 바뀌면 ETag가 갱신됩니다.

### 마이그레이션을 운영에 적용하지 않음

코드만 배포하고 `db:remote`를 잊으면 D1 쿼리에서 “no such column/table” 오류가 납니다. 스키마 변경 시 반드시 배포 전에 적용합니다.

### 롤백했는데 DB 오류

Worker 코드만 롤백되고 D1 스키마는 그대로입니다. 이전 코드와 현재 스키마의 호환성을 확인하고, 필요하면 별도 마이그레이션으로 되돌립니다.

## 유용한 명령

```bash
# 로컬 D1 확인
npx wrangler d1 execute DB --local --command "SELECT * FROM volunteers LIMIT 5"

# 원격 D1 확인
npx wrangler d1 execute DB --remote --command "SELECT COUNT(*) FROM volunteers"

# 타입 생성
npm run types

# 타입 검사
npm run typecheck

# CSS 빌드
npm run build

# 로그
npx wrangler tail

# 배포 목록
npx wrangler deployments list
```

## 관련 문서

- 로컬 설정: [02. 로컬 개발](02_local-development.md)
- 인증: [04. 인증과 권한](04_authentication.md)
- 배포: [09. 배포와 운영](09_deployment-operations.md)
