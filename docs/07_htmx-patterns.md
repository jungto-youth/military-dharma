# 07. HTMX 패턴

이 프로젝트의 상호작용은 대부분 HTMX 속성으로 정의됩니다. 직접 작성한 JavaScript는 모달, 토스트, 포커스, 스크롤 잠금 정도입니다.

## 기본 원칙

1. **서버가 HTML을 반환한다** — JSON API를 별도로 만들지 않습니다.
2. **갱신 범위를 좁힌다** — 표, 폼 슬롯 등 필요한 조각만 교체합니다.
3. **성공은 204 + 이벤트** — swap할 본문이 없으면 이벤트로 후속 동작을 지시합니다.
4. **실패는 HTML** — 검증 오류는 폼 자체를 다시 렌더링합니다.
5. **URL과 폼이 상태** — 검색어/상태 필터는 쿼리로 유지합니다.

## 패턴 1. 실시간 검색과 필터

```html
<form id="volunteer-filters"
      hx-get="/admin/volunteers/table"
      hx-target="#volunteer-table"
      hx-swap="outerHTML"
      hx-trigger="input changed delay:250ms, change, submit">
  <input type="search" name="q" value="김" />
  <select name="status">...</select>
  <button type="submit">검색</button>
</form>
```

- `input changed delay:250ms`: 타이핑 중 250ms마다 요청
- `change`: 셀렉트 변경 즉시
- `submit`: Enter/검색 버튼
- `hx-target`은 표 전체(`#volunteer-table`)이고 `outerHTML`로 통째로 교체
- 표 파셜이 같은 속성을 다시 포함하므로 교체 후에도 동작이 유지됨

`hx-include`를 쓰는 이유:

```html
<div id="volunteer-table"
     hx-get="/admin/volunteers/table"
     hx-trigger="refresh"
     hx-include="#volunteer-filters"
     hx-swap="outerHTML">
```

저장 후 표를 새로고침할 때 현재 검색어/상태를 함께 보내기 위해서입니다.

## 패턴 2. 저장 후 표 새로고침

서버는 204와 이벤트만 반환합니다.

```http
204 No Content
HX-Trigger: {"volunteer:changed":{"message":"..."}}
```

클라이언트:

```js
document.body.addEventListener("volunteer:changed", function (event) {
  var table = document.getElementById("volunteer-table");
  if (table && window.htmx) {
    window.htmx.trigger(table, "refresh");
  }
  showToast(event.detail.message);
});
```

표는 `hx-trigger="refresh"`로 이 이벤트를 기다립니다. 이렇게 하면 서버가 표 HTML을 직접 반환하지 않아도 최신 상태로 갱신됩니다.

## 패턴 3. 재사용 대화상자

등록/수정 모두 같은 `#volunteer-dialog`와 `#form-slot`을 사용합니다.

```html
<dialog id="volunteer-dialog" aria-labelledby="volunteer-form-title">
  <div id="form-slot"></div>
</dialog>
```

열기:

```html
<a href="/admin/volunteers/new"
   hx-get="/admin/volunteers/new"
   hx-target="#form-slot"
   hx-swap="innerHTML">봉사자 등록</a>
```

- JavaScript가 있으면 HTMX가 가로채 파셜을 넣음
- 없으면 `/admin/volunteers/new` 전체 페이지로 이동 (progressive enhancement)

`htmx:afterSwap`에서 `#form-slot`이 갱신됐는지 확인하고 `showModal()`을 호출합니다.

### `_context` 히든 필드

폼은 같은 마크업을 모달과 전체 페이지에서 사용합니다.

```html
<input type="hidden" name="_context" value="dialog" />
```

검증 실패 시 서버가 “모달용 폼”인지 “전체 페이지용 폼”인지 판단하는 데 사용합니다.

## 패턴 4. 성공/실패 처리

### 성공

```ts
c.header("HX-Trigger", asciiJson({
  "volunteer:changed": { message: "봉사자를 등록했습니다." },
}));
return c.body(null, 204);
```

- 204는 swap할 본문이 없음을 의미
- `HX-Trigger` 이벤트가 `document.body`로 버블링
- app.js가 모달을 닫고, 표를 새로고침하고, 토스트를 표시

### 검증 실패

- 상태 코드 **200**으로 폼 HTML 반환
- 이유: HTMX는 기본적으로 4xx 응답을 swap하지 않음
- `#form-slot`이 폼으로 교체되고 오류 문구가 표시됨
- 실패 후 첫 `.input-error`에 포커스

### 일반 폼 요청

`HX-Request`가 없으면:

- 성공: 302 `/admin/volunteers`
- 실패: 전체 페이지 HTML

## 패턴 5. 삭제

```html
<button hx-delete="/admin/volunteers/7"
        hx-confirm="홍길동 봉사자를 명부에서 삭제할까요?"
        hx-disabled-elt="this">삭제</button>
```

- `hx-confirm`: 브라우저 기본 confirm
- `hx-disabled-elt`: 요청 중 버튼 비활성화
- 서버는 삭제 후 204 + `volunteer:changed`
- app.js가 표를 새로고침

## 패턴 6. 세션 만료

```http
401 Unauthorized
HX-Redirect: /login
```

HTMX는 `HX-Redirect`를 보고 전체 페이지를 이동합니다. 부분 갱신 도중 세션이 만료되어도 로그인 화면으로 안내됩니다.

## 패턴 7. 전체 페이지 vs 파셜

```ts
function isHtmx(c: Context<AppEnv>): boolean {
  return c.req.header("HX-Request") === "true";
}
```

- `GET /admin/volunteers/new`: HTMX면 폼 파셜, 아니면 전체 페이지
- `GET /admin/volunteers/:id/edit`: 동일
- 폼 제출 오류: `_context`와 `HX-Request`로 응답 형태 결정

## ASCII 헤더 규칙

HTTP 헤더에 한글을 그대로 넣으면 브라우저에서 깨지거나 예외가 날 수 있습니다. `HX-Trigger`의 메시지는 ASCII JSON으로 이스케이프합니다.

```ts
function asciiJson(value: unknown): string {
  return JSON.stringify(value).replace(/[\u0080-\uffff]/g, (char) => {
    return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
  });
}
```

결과:

```json
{"volunteer:changed":{"message":"\ub4f1\ub85d\ud588\uc2b5\ub2c8\ub2e4."}}
```

브라우저는 JSON을 파싱해 원래 한글을 복원합니다.

## 자주 하는 실수

| 실수 | 결과 | 해결 |
| --- | --- | --- |
| 422로 검증 오류 반환 | HTMX가 swap하지 않음 | 200으로 폼 반환 |
| 한글을 헤더에 직접 | 토스트 깨짐/예외 | `asciiJson` |
| 전체 HTML을 파셜 타깃에 반환 | 레이아웃이 표 안에 들어감 | `HX-Request`로 분기 |
| `hx-include` 누락 | 새로고침 시 필터 초기화 | 대상 폼 지정 |
| ID 중복 | 잘못된 요소 교체 | 파셜마다 ID 하나 |
| 204에 본문 포함 | 무시되거나 오류 | 204는 빈 본문 |
| 모달 닫힌 뒤 슬롯 잔존 | 다음 열기에서 이전 폼 노출 | `close` 이벤트에서 비우기 |
| 배경 스크롤 | 모바일에서 뒤 페이지 스크롤 | `body overflow hidden` |

## 디버깅

브라우저 콘솔:

```js
htmx.logAll();
```

확인할 것:

1. 요청에 `HX-Request: true`가 있는가
2. 응답 상태와 `HX-Trigger`/`HX-Redirect` 헤더
3. `hx-target` 요소가 응답 HTML에 존재하는가
4. CSP 콘솔 오류 (스크립트 차단 여부)
5. `dialog.open` 상태와 `#form-slot` 내용

서버 로그는 `wrangler dev` 터미널에 표시됩니다.

## 향후 확장

- **OOB swap**: 여러 영역을 한 번에 갱신할 때 `hx-swap-oob="true"` 사용
- **페이지네이션**: `?page=`와 “이전/다음” 링크를 `hx-get`으로 연결
- **낙관적 UI**: 현재는 서버 왕복 후 갱신. 필요할 때만 도입
- **폼 자동 저장**: `hx-trigger="change delay:1s"`로 초안 저장 가능

## 관련 문서

- 라우트별 응답: [05. 라우팅과 HTTP](05_routing-http.md)
- 컴포넌트 구조: [06. 화면과 컴포넌트](06_ui-components.md)
