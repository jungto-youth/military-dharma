import {
  availabilityOf,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  formatClock,
  formatDayMonth,
  formatEventDate,
  formatWeekday,
  groupShiftDays,
  kstDateKey,
  splitEvents,
  stayNights,
  VENUE,
  type EventWithCount,
} from "../lib/baraji";
import { PublicLayout, PublicSection } from "./public-layout";

type Props = {
  events: EventWithCount[];
  now?: Date;
};

const PREPARE_ITEMS = [
  {
    title: "세면도구",
    body: "샴푸나 클렌징폼 등 세안 용품 사용은 지양합니다.",
  },
  {
    title: "수행 용품",
    body: "108염주와 기도포를 챙겨주세요.",
  },
  {
    title: "복장",
    body: "상의는 검정 또는 짙은 색의 단정한 차림, 하의는 자유입니다. 법복은 입지 않습니다.",
  },
  {
    title: "생활 용품",
    body: "텀블러, 손수건, 뒷물수건을 준비해주세요.",
  },
  {
    title: "침구",
    body: "침낭 또는 이불을 가져오세요.",
  },
  {
    title: "준비되어 있는 것",
    body: "앞치마와 머리수건은 회관에서 준비합니다.",
  },
];

const FAQ = [
  {
    question: "처음인데, 아무것도 몰라도 참여할 수 있나요?",
    answer:
      "괜찮습니다. 특별한 경험보다 ‘가볍게 잘 쓰이겠다’는 마음이면 충분합니다. 공양 봉사는 멈춤과 살핌 명상과 함께 안내합니다.",
  },
  {
    question: "숙박하지 않고 다녀올 수 있나요?",
    answer:
      "숙박형 신청 시 숙박 여부를 선택할 수 있습니다. 일일(파트) 봉사는 숙박 없이 선택한 시간대만 참여합니다.",
  },
  {
    question: "일부 일정만 참여해도 되나요?",
    answer:
      "됩니다. 일일 공양 봉사는 날짜와 시간대를 골라 여러 개 선택할 수 있습니다. 다만 일일 봉사는 바라지 프로그램에 포함되지 않습니다.",
  },
  {
    question: "신청 후 어떻게 안내받나요?",
    answer:
      "접수 순서대로 확인한 뒤 텔레그램 소통방으로 초대합니다. 신청 완료 화면의 접수번호를 보관해주세요.",
  },
];

export function LandingView({ events, now = new Date() }: Props) {
  const { stay, shift } = splitEvents(events);
  const days = groupShiftDays(shift);
  const openEvents = events.filter(
    (event) => availabilityOf(event, now).state === "open",
  );
  const hasOpen = openEvents.length > 0;

  const programForDay = (key: string): string => {
    const match = stay.find(
      (event) =>
        kstDateKey(event.startsAt) <= key && kstDateKey(event.endsAt) >= key,
    );
    return match?.program || "바라지";
  };

  return (
    <PublicLayout
      title="2026 전국 모집"
      description="정토사회문화회관 자원봉사 프로그램, 군청년 바라지. 2026년 11월 12일부터 20일까지 함께할 봉사자를 모집합니다."
    >
      <section class="relative overflow-hidden bg-olive-deep text-paper">
        <div class="public-grid absolute inset-0" aria-hidden="true"></div>

        <div class="relative mx-auto w-full max-w-6xl px-5 pt-14 pb-12 sm:px-8 lg:pt-20 lg:pb-16">
          <div class="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16">
            <div>
              <p class="font-mono text-[11px] tracking-[0.08em] text-brass">
                2026 전국 모집
              </p>
              <h1 class="mt-5 max-w-xl font-serif text-[38px] leading-[1.22] font-bold tracking-[-0.03em] text-paper sm:text-[48px] lg:text-[54px]">
                군청년 곁에서,
                <br />
                함께 서는 아홉 날
              </h1>
              <p class="mt-6 max-w-lg text-[14px] leading-7 text-paper/70 sm:text-[15px]">
                청년지부는 군청년 프로그램을 기획하고 운영합니다. 일과 수행의 조화
                속에서 나를 찾아가는 자원봉사, 바라지에 함께해주세요.
              </p>
              <p class="mt-6 border-l-2 border-brass/70 pl-4 font-serif text-[17px] leading-7 text-paper/90">
                “나라 지키는 군인들은 우리가 지킨다”
              </p>

              <div class="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href={hasOpen ? "/apply" : "#schedule"}
                  class="btn h-11 border-brass bg-brass px-5 text-[13px] text-olive-deep hover:border-paper hover:bg-paper"
                >
                  {hasOpen ? "바라지 신청하기" : "일정 확인하기"}
                </a>
                <a
                  href="#schedule"
                  class="inline-flex h-11 items-center px-1 text-[13px] text-paper/70 underline decoration-paper/30 underline-offset-4 transition-colors hover:text-paper hover:decoration-paper"
                >
                  일정과 잔여 자리 보기
                </a>
              </div>
            </div>

            <aside class="border border-paper/20 bg-paper/[0.04]">
              <div class="flex items-baseline justify-between gap-4 border-b border-paper/15 px-5 py-4">
                <p class="text-[12px] text-paper/65">아홉 날의 편성</p>
                <p class="font-mono text-[11px] text-brass">11.12 – 11.20</p>
              </div>

              <ul class="divide-y divide-paper/10">
                {days.map((day) => (
                  <li class="flex items-center justify-between gap-4 px-5 py-2.5">
                    <span class="font-mono text-[12px] text-paper/65">
                      {day.dateLabel} {day.weekday}
                    </span>
                    <span class="text-[13px] text-paper/85">{programForDay(day.key)}</span>
                  </li>
                ))}
              </ul>

              <div class="border-t border-paper/15 px-5 py-4">
                <p class="text-[12px] leading-5 text-paper/65">
                  숙박형 {stay.length}개 회차 · 일일 공양 {shift.length}개 타임
                </p>
                <p class="mt-1.5 text-[12px] leading-5 text-paper/55">
                  신청은 선착순으로 마감됩니다.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      <dl class="border-b border-line bg-paper-soft">
        <div class="mx-auto grid w-full max-w-6xl grid-cols-2 px-5 sm:px-8 lg:grid-cols-4">
          {[
            { term: "기간", value: "11. 12 – 11. 20", mono: true },
            { term: "장소", value: VENUE, mono: false },
            { term: "대상", value: "청년 · 일반 대중", mono: false },
            { term: "문의", value: CONTACT_PHONE, mono: true, href: CONTACT_PHONE_HREF },
          ].map((item, index) => (
            <div
              class={`py-5 ${index % 2 === 1 ? "border-l border-line pl-5" : ""} ${
                index > 1 ? "border-t border-line lg:border-t-0" : ""
              } ${index > 0 ? "lg:border-l lg:pl-5" : ""}`}
            >
              <dt class="text-[11px] text-muted">{item.term}</dt>
              <dd class={`mt-1.5 text-[13px] ${item.mono ? "font-mono" : ""} text-ink`}>
                {item.href ? (
                  <a href={item.href} class="hover:text-olive">
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </div>
      </dl>

      <PublicSection
        id="about"
        label="바라지란"
        title="일과 수행 사이에서, 내 마음을 살피는 시간"
        description="바라지는 정토사회문화회관의 자원봉사 프로그램입니다. 단순히 일만 하는 것이 아니라 군용사 공양 바라지, 군청년 프로그램 참관, 법사님과의 만남을 함께하며 마음을 돌아봅니다."
      >
        <div class="grid gap-6 sm:grid-cols-3">
          {[
            {
              title: "일과 수행",
              body: "공양 봉사는 하루 한 끼. 멈춤과 살핌 명상과 함께 몸과 마음을 쓰는 시간입니다.",
            },
            {
              title: "함께하는 마음",
              body: "군청년 프로그램을 곁에서 돕고, 법사님 간담회와 산책으로 서로의 이야기를 나눕니다.",
            },
            {
              title: "이어지는 인연",
              body: "전역 이후에도 청년전법으로 인연을 이어갈 수 있도록 운영을 지원합니다.",
            },
          ].map((item) => (
            <div class="border-t-2 border-olive/25 pt-4">
              <h3 class="text-[14px] font-semibold text-ink">{item.title}</h3>
              <p class="mt-2 text-[13px] leading-6 text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
      </PublicSection>

      <PublicSection
        id="together"
        label="함께하는 시간"
        title="공양 한 끼와 만남, 산책이 하루를 이룹니다"
        tone="soft"
      >
        <div class="grid gap-x-10 gap-y-7 sm:grid-cols-2">
          {[
            {
              title: "공양 봉사",
              body: "하루 한 끼, 군용사 공양을 준비합니다. 멈춤과 살핌 명상이 함께합니다.",
            },
            {
              title: "프로그램 참관",
              body: "유수스님 일문일답, 군청년 소감문 발표 등 군청년 프로그램을 곁에서 지켜봅니다.",
            },
            {
              title: "법사님 간담회",
              body: "법사님과 마주 앉아 이야기를 나누고, 궁금한 것을 묻는 시간입니다.",
            },
            {
              title: "대성사 산책 · 명상",
              body: "회관을 둘러보고 대성사를 산책하며 스스로를 정돈합니다.",
            },
          ].map((item) => (
            <div class="border-t border-line pt-4">
              <h3 class="text-[15px] font-semibold text-ink">{item.title}</h3>
              <p class="mt-1.5 text-[13px] leading-6 text-ink-soft">{item.body}</p>
            </div>
          ))}
        </div>
        <p class="mt-8 border-l-2 border-brass/60 pl-4 text-[13px] leading-6 text-muted">
          소임(공양 봉사)은 하루에 한 끼만 합니다. 나머지 시간은 바라지 프로그램으로
          진행됩니다.
        </p>
      </PublicSection>

      <PublicSection
        id="schedule"
        label="일정"
        title="함께할 수 있는 날을 골라주세요"
        description="숙박형은 프로그램과 함께 머무는 회차이고, 일일은 공양 봉사만 하는 파트 일정입니다. 남은 자리는 실시간으로 반영됩니다."
      >
        <div class="space-y-12">
          <div>
            <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
              <h3 class="text-[15px] font-semibold text-ink">숙박형</h3>
              <p class="text-[12px] text-muted">프로그램 참관 · 간담회 · 산책 포함</p>
            </div>

            {stay.length > 0 ? (
              <ul class="divide-y divide-line/70">
                {stay.map((event) => (
                  <StayRow key={event.id} event={event} now={now} />
                ))}
              </ul>
            ) : (
              <p class="py-6 text-[13px] text-muted">등록된 숙박형 일정이 없습니다.</p>
            )}
          </div>

          <div>
            <div class="flex flex-wrap items-baseline justify-between gap-3 border-b border-ink/20 pb-3">
              <h3 class="text-[15px] font-semibold text-ink">일일(파트) 공양 봉사</h3>
              <p class="text-[12px] text-muted">선택한 시간대만 참여</p>
            </div>

            {days.length > 0 ? (
              <div>
                {days.map((day) => (
                  <div class="grid gap-3 border-b border-line/70 py-4 sm:grid-cols-[104px_minmax(0,1fr)] sm:gap-6">
                    <div class="flex items-baseline gap-2 sm:block">
                      <p class="font-mono text-[13px] text-ink">{day.dateLabel}</p>
                      <p class="text-[12px] text-muted">{day.weekday}</p>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                      <ShiftCell label="점심" event={day.lunch} now={now} />
                      <ShiftCell label="저녁" event={day.dinner} now={now} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p class="py-6 text-[13px] text-muted">등록된 일일 일정이 없습니다.</p>
            )}

            <p class="mt-4 border-l-2 border-line pl-4 text-[12px] leading-5 text-muted">
              일일(파트) 봉사 일정은 바라지 프로그램에 포함되지 않습니다.
            </p>
          </div>
        </div>

        {hasOpen ? (
          <div class="mt-10 flex flex-col gap-3 border border-line bg-paper-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p class="text-[13px] text-ink-soft">
              원하는 일정을 골랐다면 신청서에서 한 번에 접수할 수 있습니다.
            </p>
            <a href="/apply" class="btn btn-primary shrink-0">
              신청서 작성
            </a>
          </div>
        ) : (
          <div class="mt-10 border border-line bg-paper-soft px-5 py-4">
            <p class="text-[13px] leading-6 text-ink-soft">
              지금은 모든 일정이 마감되었습니다. 다음 모집은 문의로 안내받을 수 있습니다.
            </p>
            <a href={CONTACT_PHONE_HREF} class="mt-1 inline-block font-mono text-[13px] text-olive underline underline-offset-2">
              {CONTACT_PHONE}
            </a>
          </div>
        )}
      </PublicSection>

      <PublicSection
        id="prepare"
        label="준비물"
        title="가볍게, 그러나 필요한 것은 챙겨주세요"
        tone="soft"
      >
        <ul class="grid gap-x-10 gap-y-0 sm:grid-cols-2">
          {PREPARE_ITEMS.map((item) => (
            <li class="flex gap-3 border-b border-line/70 py-4">
              <span class="mt-0.5 font-mono text-[13px] text-brass" aria-hidden="true">
                □
              </span>
              <div>
                <p class="text-[14px] font-medium text-ink">{item.title}</p>
                <p class="mt-1 text-[13px] leading-6 text-ink-soft">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div class="mt-8 border border-line bg-paper px-5 py-4">
          <p class="text-[13px] leading-6 text-ink-soft">
            세안 용품은 사용을 지양합니다. 앞치마와 머리수건은 회관에 준비되어 있습니다.
          </p>
        </div>
      </PublicSection>

      <PublicSection
        id="guide"
        label="신청 안내"
        title="신청은 선착순으로 마감됩니다"
        description="신청서를 남겨주시면 접수 순서대로 확인한 뒤 텔레그램 소통방으로 초대합니다."
      >
        <ol class="grid gap-6 sm:grid-cols-2">
          {[
            {
              title: "신청서 작성",
              body: "참여 방식과 일정, 연락처를 남겨주세요. 계정은 필요하지 않습니다.",
            },
            {
              title: "접수 확인",
              body: "운영 담당자가 신청 내용을 확인합니다. 접수번호를 보관해주세요.",
            },
            {
              title: "텔레그램 초대",
              body: "확정된 분들을 텔레그램 소통방에 초대하고 준비 사항을 안내합니다.",
            },
            {
              title: "바라지 참여",
              body: "안내된 시간에 회관에 도착해 공양 봉사와 프로그램에 함께합니다.",
            },
          ].map((item, index) => (
            <li class="border-t-2 border-olive/25 pt-4">
              <p class="font-mono text-[11px] text-brass">0{index + 1}</p>
              <h3 class="mt-1.5 text-[15px] font-semibold text-ink">{item.title}</h3>
              <p class="mt-1.5 text-[13px] leading-6 text-ink-soft">{item.body}</p>
            </li>
          ))}
        </ol>

        <div class="mt-10 border-t border-line pt-8">
          <h3 class="text-[15px] font-semibold text-ink">자주 묻는 질문</h3>
          <div class="mt-2 divide-y divide-line/70">
            {FAQ.map((item) => (
              <details class="group py-4">
                <summary class="flex cursor-pointer list-none items-start justify-between gap-4 text-[14px] font-medium text-ink [&::-webkit-details-marker]:hidden">
                  <span>{item.question}</span>
                  <span class="mt-0.5 shrink-0 font-mono text-[16px] leading-none text-muted transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p class="mt-3 max-w-2xl text-[13px] leading-6 text-ink-soft">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>

        <div class="mt-10 flex flex-col gap-4 border border-line bg-paper-soft px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[12px] text-muted">문의</p>
            <a href={CONTACT_PHONE_HREF} class="mt-1 block font-mono text-[18px] text-ink hover:text-olive">
              {CONTACT_PHONE}
            </a>
            <p class="mt-1 text-[11px] text-muted">군전법 담당</p>
          </div>
          <a href="/apply" class="btn btn-primary shrink-0">
            바라지 신청하기
          </a>
        </div>
      </PublicSection>

      <section class="relative overflow-hidden bg-olive-deep text-paper">
        <div class="public-grid absolute inset-0" aria-hidden="true"></div>
        <div class="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-14 sm:px-8 sm:flex-row sm:items-end sm:justify-between lg:py-16">
          <div>
            <p class="font-mono text-[11px] text-brass">2026. 11. 12 – 11. 20</p>
            <h2 class="mt-3 max-w-lg font-serif text-[28px] leading-[1.35] font-bold tracking-[-0.02em] sm:text-[34px]">
              함께 서는 아홉 날,
              <br />
              바라지에서 만나요.
            </h2>
            <p class="mt-3 text-[13px] leading-6 text-paper/60">
              청년 · 일반 대중 누구나, 가볍게 잘 쓰이겠다는 마음이면 충분합니다.
            </p>
          </div>
          <a
            href="/apply"
            class="btn h-11 shrink-0 border-brass bg-brass px-6 text-olive-deep hover:border-paper hover:bg-paper"
          >
            신청서 작성하기
          </a>
        </div>
      </section>
    </PublicLayout>
  );
}

function StayRow({ event, now }: { event: EventWithCount; now: Date }) {
  const availability = availabilityOf(event, now);
  const open = availability.state === "open";

  return (
    <li class="grid gap-3 py-5 sm:grid-cols-[132px_minmax(0,1fr)_92px_100px] sm:items-center sm:gap-5">
      <div>
        <p class="font-mono text-[13px] text-ink">{formatDayMonth(event.startsAt)}</p>
        <p class="mt-0.5 text-[11px] text-muted">
          {formatWeekday(event.startsAt)} → {formatDayMonth(event.endsAt)}{" "}
          {formatWeekday(event.endsAt)}
        </p>
      </div>

      <div class="min-w-0">
        <p class="text-[15px] font-medium text-ink">{event.title}</p>
        <p class="mt-0.5 font-mono text-[12px] text-muted">
          {formatEventDate(event.startsAt)} {formatClock(event.startsAt)} →{" "}
          {formatEventDate(event.endsAt)} {formatClock(event.endsAt)}
        </p>
      </div>

      <div class="text-[12px] text-ink-soft">{stayNights(event)}</div>

      <div class="flex items-center justify-between gap-3 sm:justify-end">
        <AvailabilityLabel availability={availability} />
        {open ? (
          <a
            href={`/apply?type=stay&event=${event.id}`}
            class="text-[13px] font-medium text-olive underline decoration-olive/30 underline-offset-2 hover:decoration-olive"
          >
            신청
          </a>
        ) : (
          <span class="text-[13px] text-muted">—</span>
        )}
      </div>
    </li>
  );
}

function ShiftCell({
  label,
  event,
  now,
}: {
  label: string;
  event?: EventWithCount;
  now: Date;
}) {
  if (!event) {
    return (
      <div class="border border-dashed border-line/80 px-3 py-2.5">
        <p class="text-[11px] text-muted">{label}</p>
        <p class="mt-1 text-[12px] text-muted">해당 없음</p>
      </div>
    );
  }

  const availability = availabilityOf(event, now);
  const open = availability.state === "open";

  const content = (
    <>
      <div class="flex items-baseline justify-between gap-2">
        <p class="text-[11px] text-muted">{label}</p>
        <AvailabilityLabel availability={availability} compact />
      </div>
      <p class="mt-1 font-mono text-[12px] text-ink">
        {formatClock(event.startsAt)}–{formatClock(event.endsAt)}
      </p>
    </>
  );

  if (!open) {
    return <div class="border border-line bg-paper-deep/30 px-3 py-2.5 opacity-70">{content}</div>;
  }

  return (
    <a
      href={`/apply?type=shift&event=${event.id}`}
      class="block border border-line bg-white px-3 py-2.5 transition-colors hover:border-olive/50 hover:bg-olive-soft/40"
    >
      {content}
    </a>
  );
}

function AvailabilityLabel({
  availability,
  compact = false,
}: {
  availability: ReturnType<typeof availabilityOf>;
  compact?: boolean;
}) {
  const open = availability.state === "open";

  return (
    <span
      class={`inline-flex items-center gap-1.5 whitespace-nowrap ${compact ? "text-[10px]" : "text-[12px]"} ${open ? "text-active" : "text-muted"}`}
    >
      <span class={`size-1.5 rounded-full ${open ? "bg-active" : "bg-idle"}`}></span>
      {availability.label}
    </span>
  );
}
