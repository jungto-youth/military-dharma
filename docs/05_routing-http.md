# 05. 라우팅과 HTTP

## 응답 규약

| 상황 | 상태 | 본문/헤더 |
| --- | --- | --- |
| 일반 페이지 | 200 | 전체 HTML |
| HTMX 파셜 | 200 | 조각 HTML |
| 등록/수정/삭제 성공 (HTMX) | 204 또는 200 | `HX-Trigger` 헤더, 필요 시 파셜 |
| 등록/수정/삭제 성공 (일반) | 302/303 | 목록 또는 완료 페이지로 이동 |
| 폼 검증 실패 | 200 | 폼 HTML (오류 포함) |
| 인증 없음 | 302 | `/login` |
| 인증 없음 (HTMX) | 401 | `HX-Redirect: /login` |
| 없는 리소스 | 404 | 안내 HTML |
| 서버 오류 | 500 | 안내 HTML |

HTMX 요청 여부는 `HX-Request: true` 헤더로 판별합니다.

## 공개 라우트

| Method | Path | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/` | 공개 | 2026년 11월 바라지 모집 안내 |
| GET | `/apply` | 공개 | 신청 폼. `?type=stay\|shift`, `?event=ID` 프리필 |
| POST | `/apply` | 공개 | 신청 제출 |
| GET | `/apply/complete/:token` | 공개(토큰) | 접수 완료/신청 내용 확인 |

### `GET /`

- `listEventsWithCounts`로 일정과 활성 신청 수 조회
- 정원, 모집 여부, 시작 시각으로 잔여 자리 계산
- `Cache-Control: no-store`
- 마감된 일정은 신청 링크를 숨기고 상태만 표시

### `GET /apply`

쿼리:

| 이름 | 설명 |
| --- | --- |
| `type` | `stay` 또는 `shift`. 없으면 `stay` |
| `event` | 미리 선택할 일정 ID. 모집중인 일정만 반영 |

- 참여 방식에 따라 숙박형/일일 패널을 CSS `:has()`로 전환
- `event`가 마감이면 선택하지 않음

### `POST /apply`

`application/x-www-form-urlencoded` 필드:

| 필드 | 필수 | 설명 |
| --- | --- | --- |
| `type` | 예 | `stay` / `shift` |
| `eventIds` | 예 | 일정 ID. 여러 개 가능 |
| `name` | 예 | 이름 |
| `phone` | 예 | 연락처 |
| `affiliation` | 예 | 소속 |
| `membership` | 예 | `jeonbeop` / `general` / `other` |
| `membershipOther` | 조건부 | `membership=other`일 때 |
| `gender` | 예 | `female` / `male` |
| `lodging` | 조건부 | 숙박형이면 `yes` / `no` |
| `telegram` | - | 텔레그램 ID |
| `motivation` | - | 신청 동기 |
| `privacy` | 예 | `on` |
| `website` | - | 허니팟. 비어 있어야 함 |

성공:

- `303 /apply/complete/:accessToken`

검증 실패:

- `200` + 오류가 포함된 신청 폼
- 선택한 일정과 입력값 유지

추가 검증:

- 일정 존재, 참여 방식 일치, 모집중, 시작 전, 정원 여유
- 같은 연락처의 같은 일정 중복 신청 차단
- 허니팟 필드가 채워지면 봇으로 간주

### `GET /apply/complete/:token`

- `access_token`으로 신청 조회
- 없으면 404 안내
- `Cache-Control: no-store`, `X-Robots-Tag: noindex`
- 접수번호, 상태, 일정, 다음 안내 표시

## 인증 라우트

| Method | Path | 인증 | 설명 |
| --- | --- | --- | --- |
| GET | `/login` | 공개 | 로그인 화면 |
| GET | `/auth/google` | 공개 | Google OAuth 시작 |
| GET | `/auth/google/callback` | 공개 | OAuth 콜백 |
| GET | `/auth/dev` | 개발 전용 | 개발용 로그인 |
| POST | `/auth/logout` | 공개 | 세션 쿠키 삭제 |

- 로그인 성공 후 `/admin`으로 이동합니다.
- 이미 로그인되어 있으면 `/login`은 `/admin`으로 리다이렉트합니다.

## 관리자 라우트

모든 `/admin/*` 경로는 `requireAuth`를 적용합니다. `/admin/emails`는 추가로 `isAdmin` 검사를 합니다.

| Method | Path | 설명 |
| --- | --- | --- |
| GET | `/admin` | 대시보드 |
| GET | `/admin/applications` | 신청 목록 |
| GET | `/admin/applications/table` | 신청 표 파셜 |
| GET | `/admin/applications/export.csv` | CSV 내려받기 |
| GET | `/admin/applications/:id` | 신청 상세 파셜 |
| POST | `/admin/applications/:id/status` | 상태 변경 |
| GET | `/admin/schedules` | 일정·정원 설정 |
| POST | `/admin/schedules/:id` | 일정 정원/모집 상태 저장 |
| GET | `/admin/volunteers` | 봉사자 명부 |
| GET | `/admin/volunteers/table` | 명부 표 파셜 |
| GET | `/admin/volunteers/new` | 등록 폼 |
| POST | `/admin/volunteers` | 봉사자 생성 |
| GET | `/admin/volunteers/:id/edit` | 수정 폼 |
| PUT | `/admin/volunteers/:id` | 봉사자 수정 (HTMX) |
| POST | `/admin/volunteers/:id` | 봉사자 수정 (폼 fallback) |
| DELETE | `/admin/volunteers/:id` | 봉사자 삭제 |
| GET | `/admin/emails` | 허용 이메일 관리 (관리자) |
| POST | `/admin/emails` | 예외 이메일 추가 (관리자) |
| DELETE | `/admin/emails/:id` | 예외 이메일 삭제 (관리자) |

`GET /volunteers`는 이전 주소 호환을 위해 `/admin/volunteers`로 301 리다이렉트합니다.

### `GET /admin`

- 신청 상태별 건수와 최근 신청 5건
- 일정별 정원/신청 인원
- 봉사자 상태별 편성과 최근 등록 5명

### `GET /admin/applications`

쿼리:

| 이름 | 설명 |
| --- | --- |
| `q` | 이름/연락처/소속/접수번호 검색. 최대 80자 |
| `status` | `received`, `confirmed`, `waitlist`, `cancelled` |
| `type` | `stay`, `shift` |
| `event` | 일정 ID |

- 최신 접수순
- `#application-table`이 `refresh` 이벤트를 수신해 필터 변경/상태 변경 후 갱신

### `GET /admin/applications/:id`

- `HX-Request: true`이면 상세 파셜
- 아니면 접수번호 검색 결과 페이지로 리다이렉트
- 상세에는 연락처, 소속, 회원구분, 성별, 숙박, 텔레그램, 일정, 동기, 동의 시각 표시

### `POST /admin/applications/:id/status`

필드:

| 이름 | 설명 |
| --- | --- |
| `status` | `received`, `confirmed`, `waitlist`, `cancelled` |

- `confirmed`이면 필요 시 봉사자 명부에 자동 등록
- HTMX: 상세 파셜 + `HX-Trigger: application:changed`
- 일반: `/admin/applications?saved=1`로 302

### `GET /admin/applications/export.csv`

- 현재 필터를 그대로 적용
- UTF-8 BOM 포함, Excel 한글 호환
- 수식 삽입 방지를 위해 `=`, `+`, `-`, `@`로 시작하는 값을 이스케이프

### `POST /admin/schedules/:id`

필드:

| 이름 | 설명 |
| --- | --- |
| `capacity` | 0 이상 정수. 비우려면 `unlimited` 사용 |
| `unlimited` | `on`이면 정원 `NULL` |
| `isOpen` | `on`이면 모집중 |

- HTMX: `#schedules-panel` 파셜
- 일반: `/admin/schedules?saved=1`로 302
- 정원이 현재 신청 인원보다 적으면 경고를 표시하지만 저장은 허용

### 봉사자 명부

기존 규약을 유지하며 경로만 `/admin/volunteers`로 이동했습니다.

- `GET /admin/volunteers`: 검색·상태 필터
- `GET /admin/volunteers/table`: 표 파셜
- `POST /admin/volunteers`: 생성
- `PUT/POST /admin/volunteers/:id`: 수정
- `DELETE /admin/volunteers/:id`: 삭제

성공 시 `HX-Trigger: {"volunteer:changed":{"message":"..."}}`를 반환합니다.

## HTMX 관련 헤더

### 성공 이벤트

```http
HTTP/1.1 204 No Content
HX-Trigger: {"volunteer:changed":{"message":"봉사자를 등록했습니다."}}
```

```http
HTTP/1.1 200 OK
HX-Trigger: {"application:changed":{"message":"홍길동 신청을 확정하고 명부에 등록했습니다."}}
```

한글 메시지는 HTTP 헤더에 안전하도록 `\uXXXX`로 이스케이프합니다.

### 인증 만료

```http
HTTP/1.1 401 Unauthorized
HX-Redirect: /login
```

### 권한 없음

```http
HTTP/1.1 403 Forbidden
HX-Redirect: /admin
```

## 캐시

- 공개 모집·신청·완료 페이지: `Cache-Control: no-store`
- 관리자 페이지: `requireAuth`가 `no-store` 설정
- 정적 Assets: Cloudflare 기본 캐시
