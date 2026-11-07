import type { BarajiEvent } from "../db/schema";
import { formatEventRange, formatTimestampKst } from "../lib/baraji";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_META,
  APPLICATION_TYPE_META,
  GENDERS,
  MEMBERSHIPS,
  applicationEventSummary,
  formatPhone,
  type ApplicationWithEvents,
} from "../lib/applications";
import { PageHeader } from "./layout";

type FilterState = {
  q: string;
  status?: string;
  type?: string;
  eventId?: number;
};

function exportHref(filters: FilterState): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.status) params.set("status", filters.status);
  if (filters.type) params.set("type", filters.type);
  if (filters.eventId) params.set("event", String(filters.eventId));
  const query = params.toString();
  return `/admin/applications/export.csv${query ? `?${query}` : ""}`;
}

export function ApplicationsView({
  rows,
  total,
  filters,
  events,
  message,
}: {
  rows: ApplicationWithEvents[];
  total: number;
  filters: FilterState;
  events: BarajiEvent[];
  message?: string;
}) {
  return (
    <div class="pt-6">
      <PageHeader
        title="신청 접수"
        description="바라지 신청을 확인하고 상태를 관리합니다. 확정하면 봉사자 명부에 자동으로 등록됩니다."
        actions={
          <a href="/" target="_blank" rel="noreferrer" class="btn btn-ghost">
            모집 페이지 보기
          </a>
        }
      />

      <div class="mt-6">
        <ApplicationTable
          rows={rows}
          total={total}
          filters={filters}
          events={events}
          message={message}
        />
      </div>

      <dialog
        id="application-dialog"
        class="dialog"
        aria-labelledby="application-detail-title"
      >
        <div id="application-slot"></div>
      </dialog>
    </div>
  );
}

export function ApplicationTable({
  rows,
  total,
  filters,
  events,
  message,
}: {
  rows: ApplicationWithEvents[];
  total: number;
  filters: FilterState;
  events: BarajiEvent[];
  message?: string;
}) {
  const hasFilter = Boolean(filters.q || filters.status || filters.type || filters.eventId);

  return (
    <div id="application-table">
      {message ? (
        <div
          role="status"
          class="mb-4 border-l-2 border-active bg-active/5 px-3.5 py-2.5 text-[13px] leading-5 text-active"
        >
          {message}
        </div>
      ) : null}

      <form
        id="application-filters"
        class="flex flex-col gap-3 pb-3 sm:flex-row sm:flex-wrap sm:items-center"
        hx-get="/admin/applications/table"
        hx-target="#application-table"
        hx-swap="outerHTML"
        hx-trigger="input changed delay:250ms, change, submit"
      >
        <div class="relative min-w-0 flex-1">
          <svg
            viewBox="0 0 20 20"
            class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="M13 13l4 4" />
          </svg>
          <input
            type="search"
            name="q"
            value={filters.q}
            placeholder="이름, 연락처, 소속, 접수번호 검색"
            aria-label="신청 검색"
            autocomplete="off"
            class="input pl-9"
          />
        </div>

        <select name="status" aria-label="상태 필터" class="input sm:w-32">
          <option value="" selected={!filters.status}>
            전체 상태
          </option>
          {APPLICATION_STATUSES.map((status) => (
            <option value={status} selected={filters.status === status}>
              {APPLICATION_STATUS_META[status].label}
            </option>
          ))}
        </select>

        <select name="type" aria-label="참여 방식 필터" class="input sm:w-32">
          <option value="" selected={!filters.type}>
            전체 방식
          </option>
          <option value="stay" selected={filters.type === "stay"}>
            숙박형
          </option>
          <option value="shift" selected={filters.type === "shift"}>
            일일
          </option>
        </select>

        <select name="event" aria-label="일정 필터" class="input sm:w-56">
          <option value="" selected={!filters.eventId}>
            전체 일정
          </option>
          {events.map((event) => (
            <option value={event.id} selected={filters.eventId === event.id}>
              {event.title} · {event.startsAt.slice(5, 10)}
            </option>
          ))}
        </select>

        <button type="submit" class="btn btn-ghost sm:hidden">
          검색
        </button>
      </form>

      <div class="flex items-center justify-between gap-4 border-b border-line py-3">
        <p class="text-[13px] text-muted">
          총 <span class="font-mono text-ink">{total}</span>건
          {hasFilter ? <span class="ml-1.5 text-muted">(조건 적용)</span> : null}
        </p>
        <div class="flex items-center gap-3">
          {hasFilter ? (
            <a
              href="/admin/applications"
              class="text-[13px] text-muted underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
            >
              필터 초기화
            </a>
          ) : null}
          <a
            href={exportHref(filters)}
            class="text-[13px] text-ink-soft underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
          >
            CSV 내려받기
          </a>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm md:min-w-[760px]">
          <thead>
            <tr class="border-b border-line text-[12px] text-muted">
              <th scope="col" class="py-2.5 pr-4 font-medium">신청자</th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium sm:table-cell">
                참여 일정
              </th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium lg:table-cell">
                방식
              </th>
              <th scope="col" class="py-2.5 pr-4 font-medium">상태</th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium xl:table-cell">
                접수
              </th>
              <th scope="col" class="py-2.5 text-right font-medium">
                <span class="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const meta = APPLICATION_STATUS_META[row.status];
              return (
                <tr class="border-b border-line/60 transition-colors hover:bg-olive-soft/40">
                  <td class="py-3.5 pr-4 align-top">
                    <p class="font-medium text-ink">{row.name}</p>
                    <p class="mt-0.5 font-mono text-[11px] text-muted">
                      {row.reference} · {formatPhone(row.phone)}
                    </p>
                    <p class="mt-0.5 text-[12px] text-muted sm:hidden">
                      {applicationEventSummary(row.events)}
                    </p>
                  </td>
                  <td class="hidden py-3.5 pr-4 align-top sm:table-cell">
                    <p class="text-[13px] leading-5 text-ink-soft">
                      {applicationEventSummary(row.events)}
                    </p>
                    <p class="mt-0.5 text-[11px] text-muted">
                      {row.affiliation}
                      {row.membership === "other"
                        ? ` · ${row.membershipOther}`
                        : ` · ${MEMBERSHIPS[row.membership]}`}
                    </p>
                  </td>
                  <td class="hidden py-3.5 pr-4 align-top text-[12px] text-ink-soft lg:table-cell">
                    {APPLICATION_TYPE_META[row.type]}
                  </td>
                  <td class="py-3.5 pr-4 align-top">
                    <span class="inline-flex items-center gap-1.5 text-[12px] whitespace-nowrap text-ink">
                      <span class={`size-1.5 rounded-full ${meta.dot}`}></span>
                      {meta.label}
                    </span>
                  </td>
                  <td class="hidden py-3.5 pr-4 align-top xl:table-cell">
                    <span class="font-mono text-[11px] text-ink-soft">
                      {formatTimestampKst(row.createdAt)}
                    </span>
                  </td>
                  <td class="py-3.5 align-top text-right whitespace-nowrap">
                    <button
                      type="button"
                      hx-get={`/admin/applications/${row.id}`}
                      hx-target="#application-slot"
                      hx-swap="innerHTML"
                      aria-label={`${row.name} 신청 상세`}
                      class="text-[13px] text-ink-soft underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
                    >
                      상세
                    </button>
                  </td>
                </tr>
              );
            })}

            {rows.length === 0 ? (
              <tr>
                <td colspan={6} class="px-4 py-16 text-center">
                  <p class="text-sm text-ink-soft">
                    {hasFilter ? "조건에 맞는 신청이 없습니다." : "아직 접수된 신청이 없습니다."}
                  </p>
                  <p class="mt-1 text-[13px] text-muted">
                    {hasFilter
                      ? "검색어나 필터를 바꿔보세요."
                      : "모집 페이지에서 신청이 들어오면 이곳에 표시됩니다."}
                  </p>
                  {hasFilter ? (
                    <a href="/admin/applications" class="btn btn-ghost mt-5">
                      전체 신청 보기
                    </a>
                  ) : (
                    <a href="/" target="_blank" rel="noreferrer" class="btn btn-primary mt-5">
                      모집 페이지 보기
                    </a>
                  )}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ApplicationDetail({
  application,
}: {
  application: ApplicationWithEvents;
}) {
  const meta = APPLICATION_STATUS_META[application.status];
  const isStay = application.type === "stay";

  return (
    <div class="p-5 sm:p-7">
      <div class="flex items-start justify-between gap-4 border-b border-line pb-4">
        <div>
          <p class="font-mono text-[11px] text-muted">{application.reference}</p>
          <h2
            id="application-detail-title"
            class="mt-1 text-lg font-semibold tracking-tight text-ink"
          >
            {application.name}
          </h2>
          <p class="mt-1 flex items-center gap-1.5 text-[12px] text-ink-soft">
            <span class={`size-1.5 rounded-full ${meta.dot}`}></span>
            {meta.label}
            <span class="text-muted">· {APPLICATION_TYPE_META[application.type]}</span>
          </p>
        </div>
        <button
          type="button"
          data-close-dialog
          aria-label="닫기"
          class="grid size-8 shrink-0 place-items-center border border-line text-muted transition-colors hover:border-ink/30 hover:text-ink"
        >
          <svg viewBox="0 0 16 16" class="size-3.5" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
            <path d="M3 3l10 10M13 3L3 13" />
          </svg>
        </button>
      </div>

      <dl class="mt-5 grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <Detail term="연락처" value={formatPhone(application.phone)} mono />
        <Detail term="소속" value={application.affiliation} />
        <Detail
          term="회원구분"
          value={
            application.membership === "other"
              ? `기타 · ${application.membershipOther}`
              : MEMBERSHIPS[application.membership]
          }
        />
        <Detail term="성별" value={GENDERS[application.gender]} />
        <Detail
          term="숙박"
          value={
            isStay
              ? application.lodging === "yes"
                ? "숙박"
                : "숙박하지 않음(통근)"
              : "일일 봉사"
          }
        />
        <Detail term="텔레그램" value={application.telegram || "—"} />
        <Detail
          term="접수 시각"
          value={formatTimestampKst(application.createdAt)}
          mono
        />
        <Detail
          term="개인정보 동의"
          value={formatTimestampKst(application.privacyAgreedAt)}
          mono
        />
      </dl>

      <div class="mt-6 border-t border-line pt-4">
        <p class="text-[11px] text-muted">참여 일정</p>
        <ul class="mt-2 space-y-2">
          {application.events.map((event) => (
            <li class="border-l-2 border-olive/25 pl-3">
              <p class="text-[13px] font-medium text-ink">{event.title}</p>
              <p class="mt-0.5 font-mono text-[11px] text-muted">
                {formatEventRange(event)}
              </p>
            </li>
          ))}
        </ul>
      </div>

      {application.motivation ? (
        <div class="mt-6 border-t border-line pt-4">
          <p class="text-[11px] text-muted">신청 동기</p>
          <p class="mt-2 text-[13px] leading-6 whitespace-pre-wrap text-ink-soft">
            {application.motivation}
          </p>
        </div>
      ) : null}

      <div class="mt-6 border-t border-line pt-4">
        <form
          method="post"
          action={`/admin/applications/${application.id}/status`}
          hx-post={`/admin/applications/${application.id}/status`}
          hx-target="#application-slot"
          hx-swap="innerHTML"
          hx-disabled-elt="button[type='submit']"
          class="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label class="min-w-0 flex-1">
            <span class="field-label">상태 변경</span>
            <select name="status" class="input h-9">
              {APPLICATION_STATUSES.map((status) => (
                <option value={status} selected={application.status === status}>
                  {APPLICATION_STATUS_META[status].label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" class="btn btn-primary h-9">
            상태 저장
          </button>
        </form>

        <p class="mt-2 text-[11px] leading-5 text-muted">
          {application.status === "confirmed"
            ? "확정된 신청입니다. 봉사자 명부에 연결되어 있습니다."
            : "확정으로 바꾸면 봉사자 명부에 자동으로 등록됩니다."}
        </p>

        {application.volunteerId ? (
          <a
            href={`/admin/volunteers?q=${encodeURIComponent(application.name)}`}
            class="mt-3 inline-block text-[12px] text-olive underline decoration-olive/30 underline-offset-2 hover:decoration-olive"
          >
            연결된 봉사자 명부 보기
          </a>
        ) : null}
      </div>
    </div>
  );
}

function Detail({
  term,
  value,
  mono = false,
}: {
  term: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <dt class="text-[11px] text-muted">{term}</dt>
      <dd class={`mt-0.5 text-[13px] leading-6 text-ink ${mono ? "font-mono" : ""}`}>
        {value}
      </dd>
    </div>
  );
}
