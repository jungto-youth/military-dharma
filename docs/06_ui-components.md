# 06. 화면과 컴포넌트

## 레이아웃

```text
┌────────────────────┬────────────────────────────────────────────┐
│ 레일 272px          │ 모바일 헤더 (lg 미만)                        │
│                    ├────────────────────────────────────────────┤
│ 브랜드              │ main                                       │
│ 네비게이션           │   PageHeader                               │
│                    │   페이지 콘텐츠                              │
│ 사용자 / 로그아웃    │                                            │
│                    ├────────────────────────────────────────────┤
│                    │ footer                                     │
└────────────────────┴────────────────────────────────────────────┘
```

- `lg`(1024px) 이상: 왼쪽 레일 고정, 오른쪽 콘텐츠
- `lg` 미만: 상단 짙은 헤더 + 세로 콘텐츠
- 본문 최대 폭: `max-w-6xl` (1152px)
- 바깥 여백: 모바일 `px-5`, `sm` `px-8`, `lg` `px-12`

## 페이지 구성

### 공개 사이트

| 경로 | 레이아웃 | 본문 컴포넌트 |
| --- | --- | --- |
| `/` | `PublicLayout` | `LandingView` |
| `/apply` | `PublicLayout` | `ApplyPage` |
| `/apply/complete/:token` | `PublicLayout` | `ApplyCompletePage` |
| 404/500 | 독립형 | `NoticePage` |

### 관리자 사이트

| 경로 | 레이아웃 | 본문 컴포넌트 |
| --- | --- | --- |
| `/login` | 독립형 2분할 | `LoginPage` |
| `/admin` | `Layout` | `DashboardView` |
| `/admin/applications` | `Layout` | `ApplicationsView` |
| `/admin/schedules` | `Layout` | `SchedulesView` |
| `/admin/volunteers` | `Layout` | `VolunteersView` |
| `/admin/emails` | `Layout` | `AllowedEmailsView` |

## 컴포넌트 목록

| 파일 | 컴포넌트 | 역할 |
| --- | --- | --- |
| `components/public-layout.tsx` | `PublicLayout` | 공개 사이트 헤더, 푸터, 모바일 신청 바 |
| | `PublicSection` | 공고문형 좌측 라벨 + 우측 본문 섹션 |
| `components/landing.tsx` | `LandingView` | 히어로, 일정 달력, 준비물, FAQ |
| `components/apply-form.tsx` | `ApplyPage` | 참여 방식/일정/신청자 정보/동의 폼 |
| `components/apply-complete.tsx` | `ApplyCompletePage` | 접수번호와 다음 안내 |
| `components/layout.tsx` | `Layout` | 관리자 레일, 모바일 헤더, 푸터, 토스트 영역 |
| | `PageHeader` | 페이지 제목, 설명, 액션 |
| | `StatusBadge` | 상태 점 + 라벨 |
| `components/login.tsx` | `LoginPage` | 로그인 2분할 화면 |
| `components/notice.tsx` | `NoticePage` | 404/500 안내 |
| `components/dashboard-view.tsx` | `DashboardView` | 신청 현황, 일정별 정원, 최근 신청·등록 |
| `components/applications-view.tsx` | `ApplicationsView` | 신청 목록, 필터, 표, 상세 대화상자 |
| | `ApplicationTable` | 표 파셜 |
| | `ApplicationDetail` | 상세 파셜 |
| `components/schedules-view.tsx` | `SchedulesView` | 일정별 정원/모집 상태 |
| | `SchedulesPanel` | 설정 패널 파셜 |
| `components/volunteers-view.tsx` | `VolunteersView` | 명부 페이지, 필터, 대화상자 |
| `components/volunteer-table.tsx` | `VolunteerTable` | 표 파셜, 빈 상태 |
| `components/volunteer-form.tsx` | `VolunteerForm` | 등록/수정 폼 |
| `components/allowed-emails-view.tsx` | `AllowedEmailsView` | 예외 이메일 관리 |

## 공개 사이트

### 랜딩

`LandingView`는 한 페이지 안에서 모집 정보를 모두 전달합니다.

1. 히어로: 제목, 인용문, 신청 CTA, 아홉 날의 편성 패널
2. 모집 요약 띠: 기간, 장소, 대상, 문의
3. 바라지란: 일과 수행, 함께하는 마음, 이어지는 인연
4. 함께하는 시간: 공양, 참관, 간담회, 산책
5. 일정: 숙박형 회차 목록 + 일일 공양 달력
6. 준비물: 체크리스트
7. 신청 안내: 4단계 + FAQ + 문의
8. 마지막 CTA

- 섹션은 `PublicSection`으로 좌측 라벨과 우측 본문을 나눕니다.
- 일정은 `availabilityOf`로 잔여 자리/마감을 계산합니다.
- 마감된 일정은 링크 대신 상태만 표시합니다.
- 모바일 하단 고정 신청 바는 랜딩에만 표시합니다.

준비물 체크리스트(원본 공고 기준):

| 구분 | 내용 |
| --- | --- |
| 세면도구 | 샴푸·클렌징폼 등 세안 용품 사용은 지양 |
| 수행 용품 | 108염주, 기도포 |
| 복장 | 상의는 검정(짙은)색 단정한 차림, 하의는 자유 |
| 생활 용품 | 텀블러, 손수건, 뒷물수건 |
| 침구 | 침낭 또는 이불 |
| 지급 물품 | 앞치마, 머리수건은 회관에서 준비 |

### 신청 폼

`ApplyPage`는 네 구역으로 구성됩니다.

1. 참여 방식: 숙박형 / 일일
2. 일정 선택: 숙박형 라디오 또는 일일 체크박스
3. 신청자 정보: 이름, 연락처, 소속, 회원구분, 성별, 숙박, 텔레그램
4. 마음과 동의: 신청 동기, 개인정보 안내와 동의

- 참여 방식에 따라 다른 일정 패널은 CSS `:has()`로 숨깁니다. JavaScript 없이도 동작합니다.
- 회원구분이 `기타`일 때만 기타 입력란을 표시합니다.
- 일일을 선택하면 숙박 여부를 숨깁니다.
- 오류는 상단 요약과 각 필드에 함께 표시합니다.
- 제출 중에는 버튼을 비활성화합니다(`public.js`).

### 완료

`ApplyCompletePage`:

- 접수번호, 상태, 이름, 연락처, 참여 방식, 일정, 숙박, 장소
- 다음 안내 3단계
- 신청 내용 다시 보기 링크
- 개인 링크이므로 공유하지 말라는 안내

## 레이아웃 세부

### 레일

- 브랜드 마크 `전` + 사이트 이름/부제
- 네비게이션: 편성 현황, 신청 접수, 일정·정원, 봉사자 명부, 허용 이메일
- 하단: 사용자 이니셜, 이름, 이메일, 로그아웃
- 배경: `--color-olive-deep` + 52px 격자 패턴
- 활성 항목: 왼쪽 2px 황동색 선 + `bg-white/5`

### 모바일 헤더

- `lg` 미만에서만 표시
- 브랜드 + 가로 네비게이션
- 이메일/로그아웃은 모바일 푸터에 표시

### 푸터

- 사이트 이름 + 연도
- 모바일: 사용자 이메일 + 로그아웃
- 데스크톱: “승인된 사용자 전용”

### 토스트

`Layout` 마지막에 `#toast-region`이 있습니다.

- 위치: 모바일 하단 전체, `sm` 이상 우측 하단
- `aria-live="polite"`, `aria-atomic="true"`
- `app.js`가 `.toast` 요소를 추가하고 3.2초 뒤 제거

## 대시보드

`DashboardView`는 두 섹션으로 구성됩니다.

### 상태별 편성

- 전체 인원을 큰 모노 숫자로 표시
- 활동중/대기/휴면 인원
- 상태별 누적 막대
- 막대 위에 10% 간격 눈금(`.gauge-track`)
- 데이터가 없으면 안내 문구

### 최근 등록

- 최신 ID 기준 5명
- 이름, 신분/소속, 상태, 등록일
- 데이터가 없으면 등록 유도

## 명부 페이지

`VolunteersView` 구성:

1. `PageHeader` + “봉사자 등록” 링크
2. `#volunteer-filters` 검색 폼
3. `VolunteerTable`
4. `#volunteer-dialog` 대화상자

### 검색 폼

- 검색어 입력: `input` 이벤트 250ms 디바운스
- 상태 셀렉트: `change`
- 폼 제출: `submit`
- 결과는 `#volunteer-table` 바깥만 교체

### 표

- `#volunteer-table`이 자체적으로 `refresh` 이벤트를 수신
- `hx-include="#volunteer-filters"`로 현재 필터 유지
- 행 hover, 규칙선, 상태 배지
- 빈 상태: 필터 유무에 따라 다른 안내와 액션

### 열 표시 기준

| 열 | 표시 조건 |
| --- | --- |
| 봉사자 | 항상 |
| 전문분야 | `md` (768px) 이상 |
| 연락처 | `sm` (640px) 이상 |
| 활동지역 | `xl` (1280px) 이상 |
| 가입일 | `xl` (1280px) 이상 |
| 상태 | 항상 |
| 관리 | 항상 |

`md` 미만에서는 표에 `min-width`를 주지 않아 가로 스크롤을 만들지 않습니다. `md` 이상에서는 `min-w-[640px]`입니다.

## 등록/수정 폼

`VolunteerForm`은 두 맥락에서 사용됩니다.

| `context` | 사용처 | 차이 |
| --- | --- | --- |
| `dialog` | 명부 페이지 모달 | 제목/닫기 버튼, “취소” 버튼 |
| `page` | `/admin/volunteers/new` 직접 방문 | 페이지 헤더 사용, “명부로” 링크 |

필드 구성:

- 이름(필수), 신분, 소속, 전문분야, 활동지역
- 가입일, 연락처, 이메일
- 활동 상태
- 메모

오류가 있으면:

- 입력 테두리 `input-error`
- `aria-invalid="true"`
- `aria-describedby`로 오류 문구 연결
- 오류 문구 `field-error`

## 대화상자 생명주기

```text
[봉사자 등록 클릭]
  → hx-get /admin/volunteers/new
  → #form-slot에 폼 파셜 삽입
  → htmx:afterSwap
  → dialog.showModal()
  → 첫 입력에 포커스

[검증 실패]
  → 서버가 폼 HTML 200 반환
  → #form-slot innerHTML 교체
  → 대화상자는 열린 상태 유지
  → 첫 오류 필드에 포커스

[저장 성공]
  → 204 + HX-Trigger
  → app.js: dialog.close()
  → #volunteer-table에 refresh 이벤트
  → 토스트 표시

[취소/Escape/배경 클릭]
  → dialog.close()
  → 슬롯 비우기
```

신청 상세도 같은 패턴을 씁니다.

- `#application-dialog` + `#application-slot`
- `application:changed` 이벤트가 오면 `#application-table`만 새로고침하고 상세는 열어 둡니다.
- `app.js`는 `*-slot` id를 가진 교체 대상의 가장 가까운 `<dialog>`를 찾아 엽니다.

## 반응형 기준

| 브레이크포인트 | 값 | 변화 |
| --- | --- | --- |
| `sm` | 640px | 연락처 열 표시, 검색 버튼 폭 고정 |
| `md` | 768px | 전문분야 열 표시, 표 최소 폭 적용 |
| `lg` | 1024px | 레일 표시, 모바일 헤더 숨김 |
| `xl` | 1280px | 활동지역/가입일 열 표시 |

320px에서도 가로 스크롤이 생기지 않도록 확인되어 있습니다.

## 접근성

- 모든 입력에 `<label for>` 연결
- 오류 필드 `aria-invalid`, `aria-describedby`
- 대화상자 `aria-labelledby`
- 현재 네비게이션 `aria-current="page"`
- 관리 열 헤더는 화면에는 숨기고 `sr-only`로 제공
- 상태는 색 점만이 아니라 텍스트 라벨 병행
- `:focus-visible` 윤곽선
- `prefers-reduced-motion`에서 전환 최소화
- 토스트 `aria-live="polite"`

## 새 페이지를 추가할 때

1. `src/routes/`에 라우트 추가
2. `src/components/`에 뷰 컴포넌트 추가
3. `Layout`의 `active` 값과 `NAV` 배열 갱신
4. 인증이 필요하면 해당 라우터에 `requireAuth` 적용
5. HTMX 파셜이 필요하면 전체 페이지와 파셜을 분기
6. CSS는 Tailwind 유틸리티와 기존 컴포넌트 클래스 우선 사용

## 관련 문서

- HTMX 동작: [07. HTMX 패턴](07_htmx-patterns.md)
- 색/타이포: [08. 디자인 시스템](08_design-system.md)
