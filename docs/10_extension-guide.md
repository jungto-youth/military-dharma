# 10. 확장 가이드

기초 CRUD 위에 기능을 추가할 때의 절차와 제안 설계입니다. 실제 요구사항이 확정되면 이 문서를 갱신하세요.

## 원칙

1. 기존 계층 경계를 유지합니다. 라우트는 HTTP, `lib/`은 도메인, `db/`는 스키마.
2. 스키마 변경은 항상 마이그레이션으로 남깁니다.
3. 새 화면도 “전체 페이지 + HTMX 파셜” 두 경로를 고려합니다.
4. 검증은 서버에서 수행하고, 같은 규칙을 폼에도 반영합니다.
5. 개인정보가 늘어날수록 접근 제어와 감사 로그를 함께 설계합니다.

## 필드 하나 추가하기

예: `volunteers`에 `activityHours`(활동 시간) 추가.

1. 스키마 수정

```ts
// src/db/schema.ts
export const volunteers = sqliteTable("volunteers", {
  // ...
  activityHours: integer("activity_hours").notNull().default(0),
});
```

2. 마이그레이션 생성/적용

```bash
npm run db:generate
npm run db:local
```

3. 폼 값 타입과 기본값 수정

```ts
// src/lib/volunteers.ts
export type VolunteerFormValues = {
  // ...
  activityHours: number;
};
```

4. `parseVolunteerForm`에서 파싱·검증
5. `toFormValues`, `emptyValues` 수정
6. `VolunteerForm`에 입력 필드 추가
7. 표/대시보드에 표시할지 결정
8. `npm run typecheck`
9. 배포 전 `npm run db:remote`

> 문자열 필드가 아니라면 `parseBody`에서 `Number()` 변환과 범위 검증을 명시적으로 수행하세요.

## 화면 하나 추가하기

예: “활동 일지” 메뉴.

1. `src/routes/activities.tsx` 생성
2. `requireAuth` 적용
3. `src/index.tsx`에 `app.route("/activities", activityRoutes)`
4. `components/layout.tsx`의 `NAV`와 `NavKey`에 항목 추가
5. 목록/등록/수정/삭제 라우트 구현
6. HTMX 파셜이 필요하면 `isHtmx(c)` 분기
7. 디자인은 기존 표/폼/대화상자 패턴 재사용
8. 사이드바 활성 상태 전달

## 제안 1. 활동 일지 (`activities`)

봉사자가 어떤 활동을 언제, 몇 시간 했는지 기록합니다.

```ts
// src/db/schema.ts — volunteers 아래에 추가
import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const activities = sqliteTable("activities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  volunteerId: integer("volunteer_id")
    .notNull()
    .references(() => volunteers.id, { onDelete: "cascade" }),
  activityDate: text("activity_date").notNull(),
  title: text("title").notNull(),
  category: text("category").notNull().default(""),
  hours: integer("hours").notNull().default(0),
  participants: integer("participants").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

화면:

- 봉사자 수정 대화상자에 “활동 일지” 섹션
- 또는 `/admin/volunteers/:id` 상세 페이지 신설
- 대시보드에 월별 활동 시간 합계

주의:

- D1/SQLite 외래 키 동작과 `PRAGMA foreign_keys`를 확인하세요. `onDelete: "cascade"`가 항상 자동 적용된다고 가정하지 마세요.
- 시간은 분 단위 정수로 저장하는 편이 집계에 유리합니다. 예: `minutes`.

## 제안 2. 상담 신청·배정 (`support_requests`)

외부/내부에서 상담을 신청하고 봉사자에게 배정합니다.

```ts
export const supportRequests = sqliteTable("support_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  requesterName: text("requester_name").notNull(),
  requesterEmail: text("requester_email").notNull().default(""),
  requesterPhone: text("requester_phone").notNull().default(""),
  unit: text("unit").notNull().default(""),
  topic: text("topic").notNull().default(""),
  detail: text("detail").notNull().default(""),
  preferredDate: text("preferred_date").notNull().default(""),
  status: text("status", {
    enum: ["received", "assigned", "done", "cancelled"],
  })
    .notNull()
    .default("received"),
  assignedVolunteerId: integer("assigned_volunteer_id")
    .references(() => volunteers.id),
  assignedAt: text("assigned_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

권장 흐름:

1. 신청 접수 (`received`)
2. 봉사자 배정 (`assigned`) + 배정 시각
3. 완료 (`done`) + 활동 일지 연결
4. 취소 (`cancelled`)

상태 전이는 서버에서 검증합니다. 예를 들어 `done`에서 `received`로 되돌리는 것을 막을지 정책을 정하세요.

## 제안 3. 공지 (`notices`)

```ts
export const notices = sqliteTable("notices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  pinned: integer("pinned", { mode: "boolean" }).notNull().default(false),
  authorEmail: text("author_email").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

- 대시보드 상단에 고정 공지 노출
- 본문은 평문으로 저장하고 JSX에서 이스케이프
- HTML을 허용해야 한다면 sanitize 라이브러리를 반드시 사용

## 제안 4. 사용자와 역할 (`users`)

현재는 허용 이메일 목록만 있습니다. 역할 분리가 필요하면 Google `sub`를 키로 사용자 테이블을 만듭니다.

```ts
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  googleSub: text("google_sub").notNull().unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull().default(""),
  role: text("role", { enum: ["admin", "viewer"] })
    .notNull()
    .default("viewer"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: text("last_login_at").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

적용 순서:

1. 로그인 콜백에서 `googleSub`로 사용자 조회
2. 없으면 거부하거나 `viewer`로 자동 생성
3. `requireAuth` 뒤에 역할 미들웨어 추가
4. 쓰기 라우트는 `admin`만 허용
5. 최초 관리자는 D1에 수동으로 INSERT

`ALLOWED_EMAILS`는 초기 부트스트랩용으로 유지하고, 사용자 테이블이 자리 잡으면 제거해도 됩니다.

## 제안 5. 봉사자 참여 일정 (`participations`)

2026년 바라지(군청년 프로그램 자원봉사) 신청폼을 기준으로 정리한 요구사항입니다. 봉사자 1명이 전일·부분 일정을 **중복 선택**하고 숙박 여부를 따로 고르는 구조라서, 현재 `volunteers` 한 테이블로는 표현할 수 없습니다. 일정은 별도 테이블로 분리합니다.

```ts
export const participations = sqliteTable("participations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  volunteerId: integer("volunteer_id")
    .notNull()
    .references(() => volunteers.id, { onDelete: "cascade" }),
  program: text("program").notNull().default(""),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  kind: text("kind", { enum: ["full", "part"] }).notNull().default("part"),
  lodging: integer("lodging", { mode: "boolean" }).notNull().default(false),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
```

- `program`: 행사 회차 이름. 예: `서울여행`, `행복학교`
- `kind`: 전일(`full`) / 부분(`part`)
- `lodging`: 숙박 신청 여부. 일정 단위로 볼지 신청 단위로 볼지는 정책 결정이 필요합니다.
- 날짜·시간은 `YYYY-MM-DDTHH:mm` 형태의 문자열로 저장하면 타임존 영향을 피할 수 있습니다.

봉사자 프로필에 함께 검토할 항목:

| 신청폼 항목 | 제안 컬럼 | 비고 |
| --- | --- | --- |
| 회원구분 | `member_type` | `전법` / `일반` / `기타` |
| 성별 | `gender` | 현재 스키마에 없음 |
| 소속 | `affiliation` | 기존 컬럼 사용 |
| 숙박 여부 | `participations.lodging` | 일정별 관리 |

소속 선택지는 2026년 기준 13개입니다. 서울북부, 서울남부, 서울서부, 서울동부, 경기북부, 경기남부, 경기동부, 경기서부, 대구경북, 부산경남, 대전광주, 충청, 불교대·경전대. 회차마다 바뀔 수 있으므로 폼에 하드코딩하지 말고 코드 상수나 별도 마스터 테이블로 관리하세요.

> 출처: [00. 개요의 원본 자료](00_overview.md#원본-자료)

## 봉사자 명부 시트 이관

2026-11-07 기준 원본 명부 시트는 비공개(401)라 내용을 확인하지 못했습니다. 권한을 받은 뒤 아래 순서로 진행합니다.

1. Google 시트 → 파일 → 다운로드 → CSV 또는 xlsx
2. 컬럼을 `volunteers` 스키마와 대조해 매핑표 작성
3. 필요하면 `npx wrangler d1 execute DB --remote --file`용 SQL 생성
4. 개인정보가 있으므로 내려받은 파일은 저장소에 커밋하지 않음

확인할 것: 컬럼 구성, 현재 봉사자 수와 상태 구분 기준, 신청폼 응답 시트와 명부 시트가 같은 문서인지.

## 페이지네이션

현재는 전체 행을 렌더링합니다. 데이터가 늘면:

- 쿼리: `page`(1부터), `perPage`(20)
- `COUNT(*)`로 전체 건수 계산
- `LIMIT/OFFSET` 적용
- 표 파셜에 “이전/다음” 링크 추가
- 링크는 `hx-get` + 현재 `q`, `status` 유지
- URL에도 `page`를 반영해 새로고침/공유 가능하게

권장 쿼리 파라미터:

```text
/admin/volunteers?q=김&status=active&page=2
```

`OFFSET`이 커지면 느려질 수 있으므로 정렬 키 기반 커서 페이지네이션도 고려할 수 있습니다.

## 검색 개선

현재는 `LIKE '%q%'`로 이름/소속/전문분야/지역만 검색합니다.

- 연락처/이메일 검색 추가
- 초성 검색(ㄱ, ㄴ) 필요 여부 검토
- 데이터가 많아지면 SQLite FTS5 가상 테이블
- 검색어 하이라이트는 서버에서 안전하게 처리

## 파일과 알림

- 첨부 파일: R2 바인딩 추가, 메타데이터만 D1에 저장
- 이메일 알림: 외부 메일 API 사용, Workers에서 `fetch`
- 알림 실패가 원본 요청을 실패시키지 않도록 분리
- 개인정보가 포함된 파일은 접근 만료 시간과 다운로드 권한을 설계

## 테스트

현재는 수동 확인과 `npm run typecheck`만 있습니다.

권장:

- **단위 테스트**: `parseVolunteerForm`, 세션 토큰 생성/검증
- **E2E**: Playwright로 로그인 → 등록 → 수정 → 삭제 → 필터
- **CI**: `npm ci`, `npm run typecheck`, 테스트, `npm run build`
- **마이그레이션 검증**: 임시 D1에 `db:local` 적용 후 스모크 테스트

예시 Playwright 흐름:

```ts
await page.goto("/auth/dev");
await page.goto("/admin/volunteers");
await page.locator("a[href='/admin/volunteers/new']").click();
await page.fill("#field-name", "테스트");
await page.click("#volunteer-form button[type='submit']");
await expect(page.locator(".toast")).toContainText("등록했습니다");
```

## 배포 순서

기능 추가 시:

```bash
npm run typecheck
npm run build
npm run db:generate     # 스키마 변경 시
npm run db:local        # 로컬 확인
npm run db:remote       # 운영 반영
npm run deploy
```

스키마 파괴적 변경(컬럼 삭제/이름 변경)은 한 번에 배포하지 말고, 이전 컬럼 유지 → 데이터 이전 → 정리 순서로 진행하세요.

## 관련 문서

- 데이터 모델: [03. 데이터 모델](03_data-model.md)
- 라우팅: [05. 라우팅과 HTTP](05_routing-http.md)
- HTMX: [07. HTMX 패턴](07_htmx-patterns.md)
