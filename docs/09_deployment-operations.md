# 09. 배포와 운영

## 배포 전 확인

- [ ] Cloudflare 계정과 Wrangler 로그인
- [ ] 원격 D1 데이터베이스 생성
- [ ] `wrangler.jsonc`의 `database_id` 교체
- [ ] 원격 마이그레이션 적용
- [ ] Google OAuth 클라이언트에 배포 도메인 콜백 등록
- [ ] 시크릿 등록 (`SESSION_SECRET`, `GOOGLE_CLIENT_*`, `ALLOWED_EMAILS`)
- [ ] `ALLOW_DEV_LOGIN` 미설정 확인

## 1. 로그인

```bash
npx wrangler login
```

## 2. D1 데이터베이스 생성

```bash
npx wrangler d1 create military-dharma
```

출력에 표시되는 `database_id`를 `wrangler.jsonc`에 넣습니다.

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "military-dharma",
      "database_id": "실제-UUID",
      "migrations_dir": "./migrations"
    }
  ]
}
```

바인딩 이름 `DB`는 코드의 `c.env.DB`와 일치해야 합니다.

## 3. 원격 마이그레이션

```bash
npm run db:remote
```

내부적으로 실행되는 명령:

```bash
wrangler d1 migrations apply DB --remote
```

스키마를 변경했다면 배포 전에 반드시 실행합니다.

## 4. 시크릿 등록

```bash
npx wrangler secret put SESSION_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
npx wrangler secret put ALLOWED_EMAILS
```

각 명령은 값을 입력받습니다. `SESSION_SECRET`은 다음처럼 생성합니다.

```bash
openssl rand -base64 32
```

`ALLOWED_EMAILS` 예:

```text
admin@example.com,staff@example.com
```

- 도메인 전체 허용: `@example.com`
- 비워두면 모든 Google 로그인 거부
- `*`는 모든 계정 허용 (운영 비권장)

> `ALLOW_DEV_LOGIN`은 원격에 등록하지 않습니다. 등록하면 인증 우회 경로가 열립니다.

## 5. 배포

```bash
npm run deploy
```

이 명령은:

1. `tailwindcss`로 `public/assets/app.css` minify 빌드
2. `wrangler deploy`로 Worker와 Assets 업로드

배포 후 Wrangler가 출력하는 URL로 접속합니다.

```text
https://military-dharma.<subdomain>.workers.dev
```

## 6. 도메인 연결

Cloudflare 대시보드 → Workers & Pages → 해당 Worker → Settings → Domains & Routes에서 커스텀 도메인을 추가합니다.

이후 Google Cloud Console의 **승인된 리디렉션 URI**에 추가합니다.

```text
https://<도메인>/auth/google/callback
```

기존 `workers.dev` 주소도 함께 등록해두면 테스트에 편합니다.

## 7. 배포 후 스모크 테스트

### 공개

1. `/`에서 일정, 준비물, FAQ가 표시되는지 확인
2. `/apply`에서 숙박형/일일 전환이 되는지 확인
3. 테스트 신청 제출 → 접수번호와 완료 페이지 확인
4. 같은 연락처로 같은 일정 재신청 시 중복 안내 확인
5. 관리자에서 정원을 1로 낮춘 뒤 마감 표시 확인

### 관리자

1. `/login` 접속 → Google 로그인 버튼 표시
2. 허용된 계정으로 로그인 → `/admin` 이동
3. 대시보드 신청 현황, 일정별 정원, 최근 신청 표시
4. 신청 상세 → 확정 → 봉사자 명부 자동 등록 확인
5. 신청 필터, CSV 내려받기 확인
6. 일정·정원 저장 → 공개 페이지 잔여 자리 반영 확인
7. 봉사자 등록/수정/삭제 동작
8. 새 시크릿/비공개 창에서 세션 유지 확인
9. 허용되지 않은 계정으로 로그인 시 거부 메시지 확인
8. 모바일에서 레이아웃 확인

## 환경 차이

| 항목 | 로컬 | 운영 |
| --- | --- | --- |
| DB | 로컬 D1 시뮬레이션 | 원격 D1 |
| 시크릿 | `.dev.vars` | Wrangler secrets |
| 인증 | `ALLOW_DEV_LOGIN` 사용 가능 | Google OAuth만 |
| CSS | watch 빌드 | `npm run build` 결과 |
| 로그 | 터미널 | `wrangler tail` / Observability |
| HTTPS | http://localhost | Cloudflare HTTPS |

## 백업

D1 내보내기:

```bash
npx wrangler d1 export DB --remote --output backup-$(date +%Y%m%d).sql
```

복구는 신중하게 진행합니다. 먼저 별도 DB에서 복구를 연습하고, 운영 DB에는 필요한 범위만 적용하세요.

```bash
npx wrangler d1 execute DB --remote --file backup-20260101.sql
```

정기 백업은 Cloudflare Cron Trigger + R2 저장, 또는 외부 백업 작업으로 자동화할 수 있습니다. 현재 코드에는 백업 자동화가 없습니다.

## 로그와 모니터링

- `wrangler.jsonc`의 `observability.enabled: true`
- 실시간 로그:

```bash
npx wrangler tail
```

- Cloudflare 대시보드에서 요청 수, 오류율, CPU 시간 확인
- `console.error`는 `src/index.tsx`의 `onError`에서 기록

개인정보가 로그에 남지 않도록 주의하세요. 현재 코드는 요청 본문을 로그로 남기지 않습니다.

## 롤백

```bash
npx wrangler deployments list
npx wrangler rollback <deployment-id>
```

주의:

- Worker 코드만 이전 버전으로 돌아갑니다.
- **D1 마이그레이션은 자동 롤백되지 않습니다.**
- 스키마를 깨는 변경은 “확장 → 데이터 이전 → 정리” 순서로 배포하세요.

## 시크릿 교체

### `SESSION_SECRET`

교체하면 기존 세션이 모두 무효화됩니다. 모든 사용자가 다시 로그인해야 합니다. 긴급 로그아웃 수단으로 사용할 수 있습니다.

```bash
npx wrangler secret put SESSION_SECRET
```

### Google 클라이언트 시크릿

Google Console에서 재발급 후:

```bash
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

### 허용 목록 변경

```bash
npx wrangler secret put ALLOWED_EMAILS
```

변경 즉시 새 로그인에 적용됩니다. 이미 발급된 세션은 만료 전까지 유지됩니다.

## 비용

현재 구성은 Cloudflare Workers 무료/유료 플랜과 D1 사용량에 따릅니다.

- 정적 자산은 Assets로 제공
- 요청마다 D1 쿼리 2~3회
- 별도 KV, R2, Queues, Cron 없음

사용량이 늘면 D1 읽기/쓰기와 Worker 요청 수를 모니터링하세요.

## 보안 체크리스트

- [ ] `ALLOW_DEV_LOGIN`이 원격에 없다.
- [ ] `ALLOWED_EMAILS`가 명시되어 있다.
- [ ] `SESSION_SECRET`이 32바이트 이상이다.
- [ ] Google OAuth 동의 화면이 적절히 제한되어 있다.
- [ ] HTTPS만 사용한다.
- [ ] D1 백업이 존재한다.
- [ ] `.dev.vars`, `.wrangler/`가 Git에 없다.
- [ ] 오류 로그에 개인정보가 남지 않는다.

## 관련 문서

- 로컬 설정: [02. 로컬 개발](02_local-development.md)
- 인증: [04. 인증과 권한](04_authentication.md)
- 배포 오류: [11. 문제 해결](11_troubleshooting.md)
