# 08. 디자인 시스템

## 방향

**“야전 편성판”** — 군 편성표/근무 일지의 질서감을 현대적인 관리 도구로 옮긴 스타일입니다.

- 종이 같은 그린 그레이 배경
- 짙은 올리브 레일과 선명한 규칙선
- 숫자·날짜·연락처는 모노스페이스
- 카드 남발 대신 표와 구분선으로 정보 구조화
- 강조는 한 곳(편성 막대)에만 집중
- 장식은 최소화하고, 정보 자체가 시각적 특징이 되게

## 색상 토큰

`src/styles.css`의 `@theme`에 정의되어 있습니다.

| 토큰 | HEX | 용도 |
| --- | --- | --- |
| `paper` | `#EEF0E8` | 기본 배경 |
| `paper-soft` | `#F6F7F1` | 패널, 대화상자 |
| `paper-deep` | `#DDE1D3` | 막대 배경, 음영 |
| `ink` | `#1A221A` | 기본 텍스트, 진한 버튼 |
| `ink-soft` | `#3C493C` | 보조 본문 |
| `muted` | `#626F5C` | 캡션, 설명, 비활성 |
| `line` | `#C7CDBB` | 규칙선, 입력 테두리 |
| `olive` | `#3D5135` | 기본 액션, 포커스 |
| `olive-deep` | `#222D1F` | 레일, 로그인 좌측 |
| `olive-soft` | `#E0E5D4` | hover 배경 |
| `brass` | `#B08A4A` | 드문 강조(브랜드 마크, 활성 네비 선) |
| `alert` | `#A1382A` | 오류, 삭제 |
| `active` | `#3F6B38` | 활동중 점/막대 |
| `standby` | `#B08432` | 대기 점/막대 |
| `idle` | `#8A917F` | 휴면 점/막대 |

### 대비 참고

| 조합 | 비율 | 용도 |
| --- | --- | --- |
| `muted` on `paper` | 4.63:1 | 작은 설명 텍스트 |
| `ink-soft` on `paper` | 8.26:1 | 본문 |
| `paper` on `olive` | 7.53:1 | 주요 버튼 |
| `alert` on `paper` | 5.86:1 | 오류 |
| `active` on `paper` | 5.42:1 | 활동중 점/막대 |
| `brass` on `olive-deep` | 4.50:1 | 브랜드 마크 |

`standby`, `idle`은 점과 막대에만 사용하고, 텍스트 라벨은 기본 `ink` 색을 사용합니다. 색만으로 상태를 구분하지 않습니다.

## 로고

마크는 **편성 표식**입니다. 각진 사각 프레임(편성판) 안에 45°로 세운 브라스 다이아몬드와 중심점을 두어, 명부 위에서 한 사람을 정확히 짚는 표식을 나타냅니다. 브라스는 마크와 활성 내비 선에만 쓰는 규칙을 그대로 따릅니다.

| 파일 | 용도 |
| --- | --- |
| `public/favicon.svg` | 파비콘. 16px에서도 읽히도록 선을 굵게 조정한 버전 |
| `public/logo.svg` | 타일형 마크. 앱 아이콘, 문서 표지 |
| `public/logo-lockup.svg` | 가로 조합(마크 + 이름). 밝은 배경용 |
| `public/logo-lockup-inverse.svg` | 가로 조합. 짙은 배경용 |

- 앱 안에서는 [`src/components/brand.tsx`](../src/components/brand.tsx)의 `BrandMark`를 씁니다. 다이아몬드는 `currentColor`, 중심점은 `tone`에 따라 `fill-paper`(짙은 배경) 또는 `fill-ink`(밝은 배경)입니다.
- 마크 주위 여백은 마크 높이의 1/4 이상 둡니다.
- 마크를 회전하거나 늘리고, 브라스 외의 색으로 바꾸지 않습니다.

## 타이포그래피

### 글꼴

| 역할 | 글꼴 | 대체 |
| --- | --- | --- |
| 본문/관리자 제목 | IBM Plex Sans KR | Pretendard, 시스템 한글 폰트 |
| 공개 사이트 제목/인용 | Gowun Batang | Nanum Myeongjo, 시스템 명조 |
| 숫자/날짜/연락처/코드 | IBM Plex Mono | ui-monospace, Menlo |

- 관리자 화면은 IBM Plex Sans KR 중심입니다.
- 공개 사이트 히어로와 섹션 제목, 인용문은 Gowun Batang을 씁니다.
- Google Fonts에서 산스 400/500/600/700, 모노 400/500/600, 명조 400/700을 불러옵니다. CSP는 `fonts.googleapis.com`과 `fonts.gstatic.com`만 허용합니다.

### 크기

| 용도 | 크기/굵기 | 비고 |
| --- | --- | --- |
| 페이지 제목 | 26px → 30px (`sm`) | semibold, 자간 -0.02em |
| 섹션 제목 | 15~18px | semibold |
| 본문 | 14px | line-height 1.6~1.75 |
| 표 본문 | 14px | 보조 12px |
| 라벨 | 13px | medium |
| 캡션/메타 | 11~12px | muted |
| 편성 총계 | 46px | mono, tabular |
| 상태 인원 | 22px | mono |

숫자는 `font-mono`와 `tabular-nums`를 사용해 자리수가 흔들리지 않게 합니다.

## 레이아웃 규칙

- 레일: 272px, `lg` 이상에서 고정
- 본문 최대 폭: 1152px (`max-w-6xl`)
- 모서리 반경: 2px (버튼, 입력, 패널, 대화상자)
- 그림자: 사용하지 않음 (대화상자 backdrop 제외)
- 구분: 1px `line` 실선, 섹션 사이 32~40px
- 정렬: 좌측 정렬 기본, 숫자/상태/액션은 우측 정렬 가능
- 정보 밀도: 표 행 높이 52~70px, 모바일에서도 과도한 여백 금지

## 컴포넌트 클래스

`src/styles.css`의 `@layer components`에 정의됩니다.

### 버튼

| 클래스 | 설명 |
| --- | --- |
| `.btn` | 기본 높이 40px, 13px, 2px 반경 |
| `.btn-primary` | 올리브 배경, 밝은 텍스트 |
| `.btn-ghost` | 투명 배경, 테두리 |
| `.btn-google` | 흰 배경 Google 로그인 버튼 |
| `.btn:disabled` | `cursor-wait`, 투명도 |

파괴적 액션(삭제)은 버튼 대신 붉은 텍스트 링크로 표현합니다.

### 입력

| 클래스 | 설명 |
| --- | --- |
| `.input` | 높이 40px, 흰 배경, 1px 테두리 |
| `.input:focus` | 올리브 테두리 + 3px 소프트 링 |
| `.input-error` | 붉은 테두리 |
| `.field-label` | 13px medium 라벨 |
| `.field-error` | 12px 붉은 오류 문구 |

### 대화상자/토스트

| 클래스 | 설명 |
| --- | --- |
| `.dialog` | 최대 680px, 90vh, 내부 스크롤 |
| `.dialog::backdrop` | 짙은 반투명 |
| `.toast` | 짙은 배경, 하단 우측, 페이드 인 |
| `.toast.is-visible` | 표시 상태 |

### 레이아웃 장식

| 클래스 | 설명 |
| --- | --- |
| `.rail` | 관리자 레일 배경 + 52px 격자 |
| `.login-grid` | 로그인 좌측 76px 격자 |
| `.public-grid` | 공개 히어로 64px 격자, 아래로 페이드 |
| `.apply-form` | 신청 폼. 참여 방식에 따라 일정 패널 전환 |
| `.membership-other` | 회원구분이 기타일 때만 표시 |
| `.gauge-track` | 편성 막대 위 10% 눈금 |

### 유틸리티

Tailwind 기본 유틸리티를 우선 사용합니다. 반복되는 조합만 컴포넌트 클래스로 승격합니다.

## 상태 표현

```html
<span class="inline-flex items-center gap-1.5 text-[13px]">
  <span class="size-1.5 rounded-full bg-active"></span>
  활동중
</span>
```

- 점 크기 6px
- 라벨은 텍스트 그대로
- 표, 대시보드, 필터에서 같은 정의 사용

## 시각적 원칙

### 한다

- 규칙선과 정렬로 정보를 구조화
- 숫자/날짜는 모노스페이스
- 중요한 정보는 크기와 위치로 위계 설정
- 강조색은 정말 필요한 곳에만

### 하지 않는다

- 모든 콘텐츠를 동일한 둥근 카드로 쪼개기
- 그림자로 떠 있는 느낌 내기
- 알약형 배지 남발
- 의미 없는 아이콘/이모지
- 페이지마다 다른 강조색
- 제목 위에 장식용 영문 라벨 붙이기

## 공개 사이트 확장

공개 모집 사이트는 “야전 편성판”의 규칙선과 모노 숫자를 유지하면서, 인쇄된 모집 공고문의 호흡을 더했습니다.

- 히어로: 짙은 올리브 + 64px 격자 + 브라스 라벨
- 큰 제목과 인용: Gowun Batang
- 날짜·시간·잔여 자리: IBM Plex Mono
- 섹션: 왼쪽 라벨 + 오른쪽 본문의 2단 공고문 구조
- 일정: 숙박형은 행 목록, 일일은 5일 × 점심/저녁 달력
- 카드 대신 규칙선과 여백으로 구분
- 모바일: 하단 고정 신청 바, 섹션 라벨은 본문 위로 이동

### 신청 폼의 CSS 상태 전환

JavaScript 없이 `:has()`로 참여 방식에 따라 패널을 바꿉니다.

```css
.apply-form:has(input[name="type"][value="stay"]:checked) [data-type-panel="shift"],
.apply-form:has(input[name="type"][value="shift"]:checked) [data-type-panel="stay"] {
  display: none;
}

.apply-form:has(input[name="type"][value="shift"]:checked) [data-lodging] {
  display: none;
}

.apply-form:has(select[name="membership"] option[value="other"]:checked) .membership-other {
  display: block;
}
```

### 공개 사이트 접근성

- 라디오/체크박스는 실제 입력 요소를 사용하고 라벨 전체를 클릭 영역으로 둡니다.
- 마감 상태는 색뿐 아니라 `모집중`, `잔여 n`, `마감` 텍스트로 표시합니다.
- 오류는 상단 요약과 필드 아래에 함께 표시합니다.
- 완료 페이지는 `noindex`이며 개인 링크임을 안내합니다.

## 테마 변경

색을 바꾸려면 `src/styles.css`의 `@theme` 값만 수정합니다.

```css
@theme {
  --color-paper: #eef0e8;
  --color-olive: #3d5135;
  --color-brass: #b08a4a;
}
```

수정 후:

```bash
npm run build:css
```

개발 중에는 `npm run dev`의 watch가 자동 반영합니다.

## 접근성

- 본문/캡션 대비 4.5:1 이상 유지
- 포커스는 2px 올리브 윤곽선
- 입력 오류는 색 + 문구 + `aria-invalid`
- 대화상자 제목 연결
- 모션 최소화 설정 존중
- 모바일 320px까지 가로 스크롤 없음
- 표의 액션 버튼에 봉사자 이름을 포함한 `aria-label`

## 관련 문서

- 컴포넌트 사용처: [06. 화면과 컴포넌트](06_ui-components.md)
- CSS 빌드: [02. 로컬 개발](02_local-development.md)
