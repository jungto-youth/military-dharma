# 000. 참고 자료 색인 (refs)

군청년 프로그램 "바라지" 운영 관련 원본 자료를 정리한 폴더입니다.
파일명은 `NNN_슬러그.md` 규칙을 따릅니다. (`docs/`의 `NN_이름.md`와 같은 방식, 자릿수만 3자리)

## 문서 목록

| 번호 | 문서 | 원본 | 접근 |
| --- | --- | --- | --- |
| 001 | [바라지 모집 공고](001_baraji-recruitment.md) | [Google 문서](https://docs.google.com/document/d/1d9pVV-3tyoBwhj374q-3jEmuWxOmAvVHUvkDxGKnDnQ/edit?tab=t.0) | 공개 |
| 002 | [일일봉사자 신청폼](002_volunteer-form.md) | [Google 폼](https://docs.google.com/forms/d/e/1FAIpQLSc1OHdO2lPN4juwsE4HnxZJPqEZF5DTJloVtI3xbOpJnHnYNw/viewform) | 공개 |
| 003 | [봉사자 명부 시트](003_volunteer-roster.md) | [Google 시트](https://docs.google.com/spreadsheets/d/10C3p8DWr0vTf_lapagfL-Fa8Pi4zuPiPc9-v6cTbQIU/edit?gid=523619722) | **비공개** |

## 한눈에 보기

- **성격**: 정토사회문화회관 자원봉사 프로그램. 군청년 프로그램(서울여행·행복학교) 운영을 돕는 "바라지" 봉사자 모집.
- **모집 대상**: 청년·일반 대중 누구나. 특별한 경험보다 "가볍게 쓰이겠다"는 마음.
- **기간**: 2026년 11월 12일 ~ 11월 20일 (1박 2일 / 2박 3일 / 부분 참여)
- **소임**: 공양 봉사는 하루 한 끼. 나머지는 프로그램 참관·법사님 간담회·명상·산책.
- **신청**: Google 폼 제출 → 선착순 마감 → 텔레그램 소통방 초대.
- **문의**: 군전법 담당 010-6665-7601

## 일정 요약

| 구분 | 일정 | 비고 |
| --- | --- | --- |
| 서울여행 | 11/12 (목) 13:30 ~ 11/13 (금) 14:30 | 1박 2일 |
| 행복학교 | 11/18 (수) 13:30 ~ 11/19 (목) 14:30 | 1박 2일 |
| 행복학교 | 11/19 (목) 13:30 ~ 11/20 (금) 14:30 | 1박 2일 |
| 행복학교 | 11/18 (수) 13:30 ~ 11/20 (금) 14:30 | 2박 3일 |

일일(파트) 공양봉사는 11/12, 11/13, 11/18, 11/19, 11/20에 점심·저녁 시간대로 나뉘어 있습니다. 상세는 [001](001_baraji-recruitment.md), [002](002_volunteer-form.md) 참고.

## 이 사이트와의 연결

- 신청폼 문항(소속·회원구분·성별·참여 일정·숙박 여부)은 `volunteers` 테이블 컬럼 설계의 참고가 됩니다.
- 참여 일정 구분(전일/부분)은 향후 `activities` 또는 `participations` 테이블로 확장할 수 있습니다.
- 명부 시트는 기존 봉사자 데이터의 원본일 가능성이 큽니다. 공유 권한을 확보하면 CSV로 내려받아 D1에 이관하는 절차를 정리하면 됩니다.

## 원본 재확인 방법

```bash
# Google 문서 → 텍스트
curl -L "https://docs.google.com/document/d/<문서-ID>/export?format=txt"

# Google 문서 → HTML (표 구조 보존)
curl -L "https://docs.google.com/document/d/<문서-ID>/export?format=html"

# Google 시트 → CSV (공유 설정이 "링크가 있는 모든 사용자"일 때만)
curl -L "https://docs.google.com/spreadsheets/d/<시트-ID>/export?format=csv&gid=<gid>"
```
