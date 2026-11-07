import type { Volunteer } from "../db/schema";
import { STATUSES, STATUS_META } from "../lib/status";
import { formatAffiliation, formatDate, today, type StatusCounts } from "../lib/volunteers";
import { PageHeader, StatusBadge } from "./layout";

type Props = {
  counts: StatusCounts;
  recent: Volunteer[];
};

export function DashboardView({ counts, recent }: Props) {
  return (
    <div class="space-y-10 pt-6">
      <PageHeader
        title="편성 현황"
        description="봉사자 편성과 최근 등록 현황을 한눈에 확인합니다."
        actions={
          <a href="/volunteers/new" class="btn btn-primary">
            봉사자 등록
          </a>
        }
      />

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

      <section aria-labelledby="recent-title">
        <div class="flex items-baseline justify-between gap-4 border-b border-ink/15 pb-3">
          <h2 id="recent-title" class="text-[15px] font-semibold text-ink">
            최근 등록
          </h2>
          <a
            href="/volunteers"
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
          <div class="border border-dashed border-line px-6 py-12 text-center">
            <p class="text-sm text-ink-soft">등록된 봉사자가 없습니다.</p>
            <p class="mt-1 text-[13px] text-muted">
              첫 봉사자를 등록하면 최근 등록 목록이 나타납니다.
            </p>
            <a href="/volunteers/new" class="btn btn-primary mt-5">
              봉사자 등록
            </a>
          </div>
        )}
      </section>
    </div>
  );
}

