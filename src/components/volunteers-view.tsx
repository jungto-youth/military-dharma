import type { Volunteer, VolunteerStatus } from "../db/schema";
import { STATUSES, STATUS_META } from "../lib/status";
import { PageHeader } from "./layout";
import { VolunteerTable } from "./volunteer-table";

type Props = {
  rows: Volunteer[];
  total: number;
  q: string;
  status?: VolunteerStatus;
};

export function VolunteersView({ rows, total, q, status }: Props) {
  return (
    <div class="pt-6">
      <PageHeader
        title="봉사자 명부"
        description="등록된 봉사자를 검색하고 활동 상태를 관리합니다."
        actions={
          <a
            href="/volunteers/new"
            hx-get="/volunteers/new"
            hx-target="#form-slot"
            hx-swap="innerHTML"
            class="btn btn-primary"
          >
            봉사자 등록
          </a>
        }
      />

      <form
        id="volunteer-filters"
        class="mt-5 flex flex-col gap-3 pb-1 sm:flex-row sm:items-center"
        hx-get="/volunteers/table"
        hx-target="#volunteer-table"
        hx-swap="outerHTML"
        hx-trigger="input changed delay:250ms, change, submit"
      >
        <div class="relative flex-1">
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
            value={q}
            placeholder="이름, 소속, 전문분야, 지역 검색"
            aria-label="봉사자 검색"
            autocomplete="off"
            class="input pl-9"
          />
        </div>

        <select name="status" aria-label="활동 상태 필터" class="input sm:w-40">
          <option value="" selected={!status}>
            전체 상태
          </option>
          {STATUSES.map((value) => (
            <option value={value} selected={status === value}>
              {STATUS_META[value].label}
            </option>
          ))}
        </select>

        <button type="submit" class="btn btn-ghost self-end sm:w-20 sm:self-auto">
          검색
        </button>
      </form>

      <VolunteerTable rows={rows} total={total} q={q} status={status} />

      <dialog id="volunteer-dialog" class="dialog" aria-labelledby="volunteer-form-title">
        <div id="form-slot" class="p-5 sm:p-7"></div>
      </dialog>
    </div>
  );
}
