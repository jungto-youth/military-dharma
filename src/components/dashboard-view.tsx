import type { Volunteer } from "../db/schema";
import { STATUSES, STATUS_META } from "../lib/status";
import {
  availabilityOf,
  formatEventRange,
  formatTimestampKst,
  type EventWithCount,
} from "../lib/baraji";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_META,
  applicationEventSummary,
  type ApplicationStatusCounts,
  type ApplicationWithEvents,
} from "../lib/applications";
import {
  formatAffiliation,
  formatDate,
  today,
  type StatusCounts,
} from "../lib/volunteers";
import { PageHeader, StatusBadge } from "./layout";

type Props = {
  counts: StatusCounts;
  recent: Volunteer[];
  applicationCounts: ApplicationStatusCounts;
  recentApplications: ApplicationWithEvents[];
  events: EventWithCount[];
};

export function DashboardView({
  counts,
  recent,
  applicationCounts,
  recentApplications,
  events,
}: Props) {
  return (
    <div class="space-y-10 pt-6">
      <PageHeader
        title="편성 현황"
        description="바라지 신청과 봉사자 편성, 일정별 정원을 한눈에 확인합니다."
        actions={
          <>
            <a href="/admin/applications" class="btn btn-ghost">
              신청 접수
            </a>
            <a href="/admin/volunteers/new" class="btn btn-primary">
              봉사자 등록
            </a>
          </>
        }
      />

      <section class="border border-line bg-paper-soft" aria-labelledby="applications-title">
        <div class="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-7">
          <h2 id="applications-title" class="text-[13px] font-medium text-ink-soft">
            바라지 신청
          </h2>
          <a
            href="/admin/applications"
            class="text-[12px] text-muted underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
          >
            전체 보기
          </a>
        </div>

        <div class="flex flex-col gap-8 px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-[13px] text-muted">전체 신청</p>
            <p class="mt-1 flex items-baseline gap-1.5">
              <span class="font-mono text-[46px] leading-none font-medium tracking-[-0.04em] text-ink">
                {applicationCounts.total}
              </span>
              <span class="text-[13px] text-muted">건</span>
            </p>
          </div>

          <dl class="grid grid-cols-2 gap-5 sm:grid-cols-4 sm:gap-8">
            {APPLICATION_STATUSES.map((status) => (
              <div key={status}>
                <dt class="flex items-center gap-1.5 text-[12px] text-muted">
                  <span class={`size-1.5 rounded-full ${APPLICATION_STATUS_META[status].dot}`}></span>
                  {APPLICATION_STATUS_META[status].label}
                </dt>
                <dd class="mt-1.5 font-mono text-[22px] leading-none font-medium text-ink">
                  {applicationCounts[status]}
                  <span class="ml-1 font-sans text-[12px] font-normal text-muted">건</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div class="px-5 pb-6 sm:px-7">
          <div
            class="gauge-track flex h-2.5 w-full overflow-hidden bg-paper-deep"
            role="img"
            aria-label={APPLICATION_STATUSES.map(
              (status) =>
                `${APPLICATION_STATUS_META[status].label} ${applicationCounts[status]}건`,
            ).join(", ")}
          >
            {applicationCounts.total > 0
              ? APPLICATION_STATUSES.map((status) =>
                  applicationCounts[status] > 0 ? (
                    <span
                      class={APPLICATION_STATUS_META[status].dot}
                      style={`width: ${(applicationCounts[status] / applicationCounts.total) * 100}%`}
                    ></span>
                  ) : null,
                )
              : null}
          </div>
          <p class="mt-3 text-[12px] text-muted">
            {applicationCounts.total > 0
              ? "막대는 신청 상태별 비율입니다."
              : "모집 페이지에서 신청이 들어오면 현황이 표시됩니다."}
          </p>
        </div>
      </section>

      <section aria-labelledby="capacity-title">
        <div class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
          <h2 id="capacity-title" class="text-[15px] font-semibold text-ink">
            일정별 정원
          </h2>
          <a
            href="/admin/schedules"
            class="text-[13px] text-muted underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
          >
            정원 설정
          </a>
        </div>

        {events.length > 0 ? (
          <div class="grid gap-x-10 gap-y-8 lg:grid-cols-2">
            <CapacityGroup
              title="숙박형 회차"
              events={events.filter((event) => event.kind === "stay")}
            />
            <CapacityGroup
              title="일일 공양 타임"
              events={events.filter((event) => event.kind === "shift")}
            />
          </div>
        ) : (
          <div class="border border-dashed border-line px-6 py-10 text-center text-[13px] text-muted">
            등록된 일정이 없습니다.
          </div>
        )}
      </section>

      <div class="grid gap-10 xl:grid-cols-2">
        <section aria-labelledby="recent-applications-title">
          <div class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
            <h2 id="recent-applications-title" class="text-[15px] font-semibold text-ink">
              최근 신청
            </h2>
            <a
              href="/admin/applications"
              class="text-[13px] text-muted underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              신청 전체 보기
            </a>
          </div>

          {recentApplications.length > 0 ? (
            <ul class="divide-y divide-line/60">
              {recentApplications.map((application) => {
                const meta = APPLICATION_STATUS_META[application.status];
                return (
                  <li class="flex items-center justify-between gap-4 py-3.5">
                    <div class="min-w-0">
                      <p class="truncate text-sm font-medium text-ink">
                        {application.name}
                        <span class="ml-2 font-mono text-[10px] font-normal text-muted">
                          {application.reference}
                        </span>
                      </p>
                      <p class="mt-0.5 truncate text-[12px] text-muted">
                        {applicationEventSummary(application.events)} · {application.affiliation}
                      </p>
                    </div>
                    <div class="flex shrink-0 items-center gap-3">
                      <span class="inline-flex items-center gap-1.5 text-[12px] whitespace-nowrap text-ink">
                        <span class={`size-1.5 rounded-full ${meta.dot}`}></span>
                        {meta.label}
                      </span>
                      <span class="hidden font-mono text-[10px] text-muted sm:block">
                        {formatTimestampKst(application.createdAt)}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div class="border border-dashed border-line px-6 py-10 text-center">
              <p class="text-sm text-ink-soft">아직 접수된 신청이 없습니다.</p>
              <a href="/" target="_blank" rel="noreferrer" class="btn btn-ghost mt-4">
                모집 페이지 보기
              </a>
            </div>
          )}
        </section>

        <section aria-labelledby="recent-title">
          <div class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
            <h2 id="recent-title" class="text-[15px] font-semibold text-ink">
              최근 등록 봉사자
            </h2>
            <a
              href="/admin/volunteers"
              class="text-[13px] text-muted underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              명부 전체 보기
            </a>
          </div>

          {recent.length > 0 ? (
            <ul class="divide-y divide-line/60">
              {recent.map((volunteer) => (
                <li class="flex items-center justify-between gap-4 py-3.5">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-ink">{volunteer.name}</p>
                    <p class="mt-0.5 truncate text-[12px] text-muted">
                      {formatAffiliation(volunteer.rank, volunteer.affiliation)}
                    </p>
                  </div>
                  <div class="flex shrink-0 items-center gap-4">
                    <StatusBadge status={volunteer.status} />
                    <span class="hidden font-mono text-[11px] text-muted sm:block">
                      {formatDate(volunteer.createdAt.slice(0, 10))}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div class="border border-dashed border-line px-6 py-10 text-center">
              <p class="text-sm text-ink-soft">등록된 봉사자가 없습니다.</p>
              <a href="/admin/volunteers/new" class="btn btn-primary mt-4">
                봉사자 등록
              </a>
            </div>
          )}
        </section>
      </div>

      <section class="border border-line bg-paper-soft" aria-labelledby="strength-title">
        <div class="flex items-center justify-between gap-4 border-b border-line px-5 py-3 sm:px-7">
          <h2 id="strength-title" class="text-[13px] font-medium text-ink-soft">
            상태별 편성
          </h2>
          <p class="font-mono text-[11px] text-muted">{formatDate(today())} 기준</p>
        </div>

        <div class="flex flex-col gap-8 px-5 py-6 sm:px-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p class="text-[13px] text-muted">전체 봉사자</p>
            <p class="mt-1 flex items-baseline gap-1.5">
              <span class="font-mono text-[46px] leading-none font-medium tracking-[-0.04em] text-ink">
                {counts.total}
              </span>
              <span class="text-[13px] text-muted">명</span>
            </p>
          </div>

          <dl class="grid grid-cols-3 gap-5 sm:gap-10">
            {STATUSES.map((status) => (
              <div key={status}>
                <dt class="flex items-center gap-1.5 text-[12px] text-muted">
                  <span class={`size-1.5 rounded-full ${STATUS_META[status].dot}`}></span>
                  {STATUS_META[status].label}
                </dt>
                <dd class="mt-1.5 font-mono text-[22px] leading-none font-medium text-ink">
                  {counts[status]}
                  <span class="ml-1 font-sans text-[12px] font-normal text-muted">명</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div class="px-5 pb-6 sm:px-7">
          <div
            class="gauge-track flex h-2.5 w-full overflow-hidden bg-paper-deep"
            role="img"
            aria-label={STATUSES.map(
              (status) => `${STATUS_META[status].label} ${counts[status]}명`,
            ).join(", ")}
          >
            {counts.total > 0
              ? STATUSES.map((status) =>
                  counts[status] > 0 ? (
                    <span
                      class={STATUS_META[status].dot}
                      style={`width: ${(counts[status] / counts.total) * 100}%`}
                    ></span>
                  ) : null,
                )
              : null}
          </div>
          <p class="mt-3 text-[12px] text-muted">
            {counts.total > 0
              ? "막대는 활동 상태별 인원 비율입니다."
              : "봉사자를 등록하면 상태별 편성 비율이 표시됩니다."}
          </p>
        </div>
      </section>
    </div>
  );
}

function CapacityGroup({
  title,
  events,
}: {
  title: string;
  events: EventWithCount[];
}) {
  return (
    <div>
      <h3 class="text-[12px] font-medium text-muted">{title}</h3>
      {events.length > 0 ? (
        <div class="mt-1">
          {events.map((event) => (
            <CapacityRow key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p class="border-b border-line/60 py-4 text-[12px] text-muted">
          등록된 일정이 없습니다.
        </p>
      )}
    </div>
  );
}

function CapacityRow({ event }: { event: EventWithCount }) {
  const availability = availabilityOf(event);
  const ratio =
    event.capacity === null
      ? 0
      : Math.min(100, (event.activeCount / Math.max(1, event.capacity)) * 100);
  const full = availability.state !== "open";

  return (
    <div class="border-b border-line/60 py-3.5">
      <div class="flex items-baseline justify-between gap-4">
        <div class="min-w-0">
          <p class="truncate text-[13px] font-medium text-ink">{event.title}</p>
          <p class="mt-0.5 truncate font-mono text-[10px] text-muted">
            {formatEventRange(event)}
          </p>
        </div>
        <p class="shrink-0 text-[12px] whitespace-nowrap text-muted">
          <span class={`font-mono ${full ? "text-alert" : "text-ink"}`}>{event.activeCount}</span>
          <span class="font-mono"> / {event.capacity ?? "∞"}</span>
          {event.capacity !== null ? (
            <span class={`ml-2 text-[11px] ${full ? "text-alert" : "text-active"}`}>
              {availability.label}
            </span>
          ) : (
            <span class="ml-2 text-[11px] text-muted">제한 없음</span>
          )}
        </p>
      </div>
      <div class="mt-2 h-1.5 w-full bg-paper-deep">
        {event.capacity !== null ? (
          <div
            class={`h-full ${full ? "bg-alert" : "bg-active"}`}
            style={`width: ${ratio}%`}
          ></div>
        ) : (
          <div class="h-full w-full bg-olive/25"></div>
        )}
      </div>
    </div>
  );
}
