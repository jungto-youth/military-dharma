# 05. 라우팅과 HTTP

## 응답 규약

| 상황 | 상태 | 본문/헤더 |
| --- | --- | --- |
| 일반 페이지 | 200 | 전체 HTML |
| HTMX 파셜 | 200 | 조각 HTML |
| 등록/수정/삭제 성공 (HTMX) | 204 | `HX-Trigger` 헤더 |
| 등록/수정/삭제 성공 (일반) | 302 | `/volunteers`로 이동 |
| 폼 검증 실패 | 200 | 폼 HTML (오류 포함) |
| 인증 없음 | 302 | `/login` |
| 인증 없음 (HTMX) | 401 | `HX-Redirect: /login` |
| 없는 리소스 | 404 | 안내 HTML |
| 서버 오류 | 500 | 안내 HTML |

HTMX 요청 여부는 `HX-Request: true` 헤더로 판별합니다.

## 전체 라우트

| Method | Path | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/login` | 공개 | 로그인 화면 |
| GET | `/auth/google` | 공개 | Google OAuth 시작 |
| GET | `/auth/google/callback` | 공개 | OAuth 콜백 |
| GET | `/auth/dev` | 개발 전용 | 개발용 로그인 |
| POST | `/auth/logout` | 공개 | 세션 쿠키 삭제 |
| GET | `/` | 필요 | 편성 현황 |
| GET | `/volunteers` | 필요 | 봉사자 명부 페이지 |
| GET | `/volunteers/table` | 필요 | 명부 표 파셜 |
| GET | `/volunteers/new` | 필요 | 등록 폼 (전체 페이지 또는 파셜) |
| POST | `/volunteers` | 필요 | 봉사자 생성 |
| GET | `/volunteers/:id/edit` | 필요 | 수정 폼 (전체 페이지 또는 파셜) |
| PUT | `/volunteers/:id` | 필요 | 봉사자 수정 (HTMX) |
| POST | `/volunteers/:id` | 필요 | 봉사자 수정 (JavaScript 없는 폼 fallback) |
| DELETE | `/volunteers/:id` | 필요 | 봉사자 삭제 (HTMX) |

`GET /volunteers/:id` 상세 페이지는 아직 없습니다. 잘못된 ID는 404입니다.

## 인증 라우트

### `GET /login`

- 이미 로그인되어 있고 `?error=`가 없으면 `/`로 리다이렉트
- Google 설정이 완료되지 않았으면 설정 안내 박스 표시
- `ALLOW_DEV_LOGIN=true`이면 개발 로그인 링크 표시
- `?error=` 코드에 따라 메시지 표시
- `Cache-Control: no-store` 설정

### `GET /auth/google`

- 설정 누락 시 `/login?error=config`
- `oauth_flow` 쿠키 설정 후 Google로 302

### `GET /auth/google/callback`

- `code`, `state`, `oauth_flow` 검증
- Google 토큰 교환 및 UserInfo 조회
- 허용 목록 통과 시 세션 쿠키 설정 후 `/`로 302

### `GET /auth/dev`

- `ALLOW_DEV_LOGIN !== "true"`이면 404
- `?email=`, `?name=` 선택
- 세션 발급 후 `/`로 302

### `POST /auth/logout`

- 세션 쿠키 만료
- `/login`으로 302

## 대시보드

### `GET /`

- 보호 라우트
- 상태별 인원 집계, 최근 등록 5명 조회
- `DashboardView` 렌더링

## 봉사자 명부

### `GET /volunteers`

쿼리:

| 이름 | 설명 |
| --- | --- |
| `q` | 검색어. 이름/소속/전문분야/지역. 최대 80자 |
| `status` | `active`, `standby`, `inactive` 중 하나 |

- 조건에 맞는 전체 목록과 건수 조회
- 정렬: 활동 상태 우선, 같은 상태에서는 이름순
- 전체 페이지 렌더링

### `GET /volunteers/table`

- `GET /volunteers`와 같은 쿼리 사용
- 표 영역(`#volunteer-table`)만 렌더링
- 검색/상태 필터, 저장 후 새로고침에 사용

### `GET /volunteers/new`

- `HX-Request: true`이면 폼 파셜만 반환 (모달용)
- 아니면 전체 페이지

### `POST /volunteers`

`application/x-www-form-urlencoded` 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `_context` | - | `dialog` 또는 `page`. 오류 응답 형태 결정 |
| `name` | 예 | 이름 |
| `affiliation` | - | 소속 |
| `rank` | - | 신분/계급 |
| `specialty` | - | 전문분야 |
| `region` | - | 활동지역 |
| `phone` | - | 연락처 |
| `email` | - | 이메일 |
| `status` | - | 활동 상태 |
| `joinedAt` | - | `YYYY-MM-DD` |
| `notes` | - | 메모 |

성공:

- HTMX: `204` + `HX-Trigger`
- 일반: `302 /volunteers`

검증 실패:

- HTMX: 폼 HTML 200
- 일반: 전체 페이지 폼 HTML 200

### `GET /volunteers/:id/edit`

- ID가 숫자가 아니거나 없으면 404
- HTMX면 폼 파셜, 아니면 전체 페이지

### `PUT /volunteers/:id`

- 수정 성공 시 204 + `HX-Trigger`
- 일반 요청은 `/volunteers`로 302

### `POST /volunteers/:id`

- `PUT`과 같은 핸들러
- HTML 폼은 PUT을 보낼 수 없으므로 JavaScript 없는 환경의 fallback

### `DELETE /volunteers/:id`

- 삭제 성공 시 204 + `HX-Trigger`
- 일반 요청은 `/volunteers`로 302
- 실제 삭제 전 확인은 브라우저 `hx-confirm`으로 수행

## HTMX 관련 헤더

### 성공 이벤트

```http
HTTP/1.1 204 No Content
HX-Trigger: {"volunteer:changed":{"message":"\ubd09\uc0ac\uc790\ub97c \ub4f1\ub85d\ud588\uc2b5\ub2c8\ub2e4."}}
```

- 이벤트 이름: `volunteer:changed`
- `detail.message`: 토스트 문구
- 한글은 ASCII `\uXXXX`로 이스케이프
- 수신 측: `public/assets/app.js`

### 인증 만료

```http
HTTP/1.1 401 Unauthorized
HX-Redirect: /login
```

### 캐시

보호된 HTML 응답은 `Cache-Control: no-store`입니다. 로그인 페이지도 동일합니다.

## curl 예시

### 개발 로그인 + 세션 저장

```bash
curl -c cookies.txt http://localhost:8787/auth/dev
```

### 명부 조회

```bash
curl -b cookies.txt "http://localhost:8787/volunteers?status=active"
```

### HTMX 등록

```bash
curl -b cookies.txt \
  -H "HX-Request: true" \
  -X POST http://localhost:8787/volunteers \
  --data-urlencode "_context=dialog" \
  --data-urlencode "name=홍길동" \
  --data-urlencode "rank=예비역 대위" \
  --data-urlencode "status=active"
```

응답은 `204`이며 `HX-Trigger` 헤더에 이벤트가 담깁니다.

### 필터 파셜

```bash
curl -b cookies.txt "http://localhost:8787/volunteers/table?q=김&status=standby"
```

## 오류 화면

- 404: `NoticePage`로 “페이지를 찾을 수 없습니다” 안내
- 500: 서버 로그에 스택 출력, 사용자에게는 일반 안내
- HTMX 404/500: 빈 본문 + 상태 코드 (불필요한 HTML swap 방지)

## 관련 문서

- HTMX 규약 상세: [07. HTMX 패턴](07_htmx-patterns.md)
- 인증: [04. 인증과 권한](04_authentication.md)
- 검증 규칙: [03. 데이터 모델](03_data-model.md)
