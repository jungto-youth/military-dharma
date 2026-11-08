# 00. 개요

> 군청년 바라지의 공개 모집 사이트와 운영 관리 도구입니다.

- 공개 사이트: 2026년 11월 바라지 모집 안내와 신청
- 관리자 사이트: 신청 접수, 일정·정원, 봉사자 명부
- 저장소 성격: 공개 모집 + 내부 운영 관리
- 현재 단계: 모집 랜딩, 자체 신청 폼, 관리자 접수 화면까지 구현된 MVP

## 무엇을 하는가

### 공개 사이트

- 2026년 11월 12일 ~ 20일 바라지 모집 안내
- 숙박형 4개 회차와 일일 공양 7개 타임 안내
- 일정별 정원과 잔여 자리 표시, 자동 마감
- 참여 일정 선택과 신청서 제출
- 접수번호와 무작위 토큰으로 신청 내용 재확인

### 관리자 사이트

- 신청 현황과 일정별 정원 대시보드
- 신청 검색·필터·상세·상태 변경
- 일정별 정원과 모집 상태 설정
- 신청 확정 시 봉사자 명부 자동 등록
- 봉사자 명부 CRUD
- CSV 내보내기
- 허용된 Google 계정만 접근

## 현재 구현 범위

| 구분 | 상태 | 설명 |
| --- | --- | --- |
| 공개 모집 랜딩 | 구현됨 | 일정, 준비물, 신청 안내, FAQ |
| 신청 폼 | 구현됨 | 숙박형/일일 선택, 서버 검증, 중복 방지 |
| 접수 완료 | 구현됨 | 접수번호, 토큰 링크, 다음 안내 |
| 일정·정원 | 구현됨 | 일정별 정원, 제한 없음, 수동 마감 |
| 신청 관리 | 구현됨 | 검색, 필터, 상세, 상태 변경, CSV |
| 명부 자동 등록 | 구현됨 | 확정 시 연락처 기준 중복 확인 후 등록 |
| Google 로그인 | 구현됨 | OAuth 2.0 + PKCE, 허용 이메일 목록 |
| 세션 | 구현됨 | HMAC 서명 쿠키, 7일 |
| 봉사자 명부 | 구현됨 | 검색, 상태 필터, 정렬 |
| 봉사자 CRUD | 구현됨 | HTMX 모달 폼 |
| 반응형 UI | 구현됨 | 320px ~ 데스크톱 |
| 텔레그램 알림 | 미구현 | 확정 안내는 수동 |
| 대기자 자동 승격 | 미구현 | 상태 `waitlist`는 수동 관리 |
| 결제·회비 | 해당 없음 | - |

## 기술 스택

| 계층 | 선택 | 버전 | 역할 |
| --- | --- | --- | --- |
| 런타임 | Cloudflare Workers | Wrangler 4.158 | 서버 실행 |
| 프레임워크 | Hono | 4.13 | 라우팅, 미들웨어, JSX SSR |
| 뷰 | Hono JSX | - | 서버 렌더링 HTML |
| 상호작용 | HTMX | 2.0.11 | 관리자 부분 갱신, 모달 |
| 스타일 | Tailwind CSS | 4.3 | 유틸리티 + `@theme` 토큰 |
| DB | Cloudflare D1 | - | SQLite 기반 관리형 DB |
| ORM | Drizzle ORM | 0.45 | 스키마, 쿼리, 마이그레이션 |
| 인증 | Google OAuth 2.0 | - | 관리자 로그인 |
| 언어 | TypeScript | 5.9 | strict 모드 |

Node.js 20 이상이 필요합니다. 로컬 개발은 Node.js + Wrangler로 진행하고, 배포는 Cloudflare Workers에서 실행됩니다.

## 문서 지도

| 문서 | 내용 |
| --- | --- |
| [00. 개요](00_overview.md) | 프로젝트 목적, 범위, 기술 스택 |
| [01. 아키텍처](01_architecture.md) | 요청 흐름, 디렉터리 구조, 설계 결정 |
| [02. 로컬 개발](02_local-development.md) | 설치, 환경 변수, 실행, 스크립트 |
| [03. 데이터 모델](03_data-model.md) | 스키마, 검증 규칙, 마이그레이션 |
| [04. 인증과 권한](04_authentication.md) | Google OAuth, 세션, 접근 제어 |
| [05. 라우팅과 HTTP](05_routing-http.md) | 전체 라우트, 응답 규약, 예시 |
| [06. 화면과 컴포넌트](06_ui-components.md) | 페이지 구성, 컴포넌트, 반응형 |
| [07. HTMX 패턴](07_htmx-patterns.md) | 검색, 모달, 이벤트, 부분 갱신 규칙 |
| [08. 디자인 시스템](08_design-system.md) | 색상, 타이포그래피, 컴포넌트 클래스 |
| [09. 배포와 운영](09_deployment-operations.md) | D1, 시크릿, 배포, 백업, 점검 |
| [10. 확장 가이드](10_extension-guide.md) | 기능 추가 절차, 제안 스키마 |
| [11. 문제 해결](11_troubleshooting.md) | 자주 겪는 오류와 해결 방법 |

## 원본 자료

2026년 11월 모집의 원본 문서입니다. 문구·정책 대조용으로만 쓰고, 현재 동작은 이 저장소의 앱과 문서를 기준으로 합니다.

| 자료 | 링크 | 비고 |
| --- | --- | --- |
| 모집 공고 | [Google 문서](https://docs.google.com/document/d/1d9pVV-3tyoBwhj374q-3jEmuWxOmAvVHUvkDxGKnDnQ/edit?tab=t.0) | 공개 |
| 신청 폼 | [Google 폼](https://docs.google.com/forms/d/e/1FAIpQLSc1OHdO2lPN4juwsE4HnxZJPqEZF5DTJloVtI3xbOpJnHnYNw/viewform) | 공개 |
| 봉사자 명부 | [Google 시트](https://docs.google.com/spreadsheets/d/10C3p8DWr0vTf_lapagfL-Fa8Pi4zuPiPc9-v6cTbQIU/edit?gid=523619722) | **비공개** — 접근 권한 필요 |

문의: 군전법 담당 010-6665-7601 (`src/lib/baraji.ts`의 `CONTACT_PHONE`).

원본을 다시 내려받아 대조할 때:

```bash
curl -L "https://docs.google.com/document/d/<문서-ID>/export?format=txt"
curl -L "https://docs.google.com/document/d/<문서-ID>/export?format=html"
curl -L "https://docs.google.com/spreadsheets/d/<시트-ID>/export?format=csv&gid=<gid>"
```

> 명부 시트는 비공개이므로 시트 내보내기는 공유 설정이 "링크가 있는 모든 사용자"일 때만 동작합니다. 이관 절차는 [10. 확장 가이드](10_extension-guide.md)를 참고하세요.

## 용어

| 용어 | 의미 |
| --- | --- |
| 바라지 | 정토사회문화회관 자원봉사 프로그램. 군청년 프로그램 운영을 돕는 봉사 |
| 숙박형 | 1박 2일 또는 2박 3일로 머물며 공양 봉사와 프로그램에 함께하는 참여 방식 |
| 일일(파트) | 선택한 날짜와 시간대에만 공양 봉사를 돕는 참여 방식 |
| 회차 | 숙박형 프로그램 일정 단위. 예: 서울여행 1박 2일 |
| 타임 | 일일 공양 봉사의 점심/저녁 시간 단위 |
| 정원 | 일정별로 관리자가 설정하는 최대 신청 인원 |
| 접수 | 신청이 들어온 기본 상태 |
| 확정 | 운영 담당자가 참여를 확정한 상태. 봉사자 명부에 자동 등록 |
| 대기 | 정원이 찼거나 운영상 대기 중인 상태 |
| 취소 | 신청이 취소된 상태. 정원 집계에서 제외 |

## 설계 원칙

1. **서버가 진실의 원천** — 화면 상태는 URL과 DB에서 결정합니다.
2. **공개와 관리를 분리** — `/`는 공개, `/admin` 이하는 로그인 필수입니다.
3. **명시적인 HTTP 규약** — 성공 303/204 + 이벤트, 검증 실패 200 + 폼, 인증 만료 401 + `HX-Redirect`.
4. **정보 밀도** — 카드 남발 대신 표와 규칙선으로 정보를 구조화합니다.
5. **기본은 닫힘** — 허용 이메일 목록이 비어 있으면 관리자 로그인을 거부합니다.
6. **작은 스크립트** — 공개 폼은 서버 검증, 관리자는 HTMX로 부분 갱신합니다.

## 관련 파일

- 진입점: [`src/index.tsx`](../src/index.tsx)
- 공개 라우트: [`src/routes/public.tsx`](../src/routes/public.tsx)
- 신청 도메인: [`src/lib/applications.ts`](../src/lib/applications.ts)
- 일정 도메인: [`src/lib/baraji.ts`](../src/lib/baraji.ts)
- DB 스키마: [`src/db/schema.ts`](../src/db/schema.ts)
- 디자인 토큰: [`src/styles.css`](../src/styles.css)
- 배포 설정: [`wrangler.jsonc`](../wrangler.jsonc)
