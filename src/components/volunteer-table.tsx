import type { Volunteer, VolunteerStatus } from "../db/schema";
import { formatAffiliation, formatDate } from "../lib/volunteers";
import { StatusBadge } from "./layout";

type Props = {
  rows: Volunteer[];
  total: number;
  q: string;
  status?: VolunteerStatus;
};

export function VolunteerTable({ rows, total, q, status }: Props) {
  const hasFilter = Boolean(q || status);

  return (
    <div
      id="volunteer-table"
      hx-get="/admin/volunteers/table"
      hx-trigger="refresh"
      hx-include="#volunteer-filters"
      hx-swap="outerHTML"
    >
      <div class="flex items-center justify-between gap-4 border-b border-line py-3">
        <p class="text-[13px] text-muted">
          총 <span class="font-mono text-ink">{total}</span>명
          {hasFilter ? <span class="ml-1.5 text-muted">(조건 적용)</span> : null}
        </p>
        {hasFilter ? (
          <a
            href="/admin/volunteers"
            class="text-[13px] text-muted underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
          >
            필터 초기화
          </a>
        ) : null}
      </div>

      <div class="overflow-x-auto">
        <table class="w-full border-collapse text-left text-sm md:min-w-[640px]">
          <thead>
            <tr class="border-b border-line text-[12px] text-muted">
              <th scope="col" class="py-2.5 pr-4 font-medium">봉사자</th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium md:table-cell">전문분야</th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium xl:table-cell">활동지역</th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium sm:table-cell">연락처</th>
              <th scope="col" class="hidden py-2.5 pr-4 font-medium xl:table-cell">가입일</th>
              <th scope="col" class="py-2.5 pr-4 font-medium">상태</th>
              <th scope="col" class="py-2.5 text-right font-medium">
                <span class="sr-only">관리</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr class="border-b border-line/60 transition-colors hover:bg-olive-soft/40">
                <td class="py-3.5 pr-4 align-top">
                  <p class="font-medium text-ink">{row.name}</p>
                  <p class="mt-0.5 text-[12px] leading-5 text-muted">
                    {formatAffiliation(row.rank, row.affiliation)}
                  </p>
                </td>
                <td class="hidden py-3.5 pr-4 align-top text-[13px] text-ink-soft md:table-cell">
                  {row.specialty || "—"}
                </td>
                <td class="hidden py-3.5 pr-4 align-top text-[13px] text-ink-soft xl:table-cell">
                  {row.region || "—"}
                </td>
                <td class="hidden py-3.5 pr-4 align-top sm:table-cell">
                  {row.phone ? (
                    <a
                      href={`tel:${row.phone.replace(/[^0-9+]/g, "")}`}
                      class="font-mono text-[12px] text-ink-soft hover:text-ink"
                    >
                      {row.phone}
                    </a>
                  ) : (
                    <span class="text-muted">—</span>
                  )}
                </td>
                <td class="hidden py-3.5 pr-4 align-top xl:table-cell">
                  <span class="font-mono text-[12px] text-ink-soft">{formatDate(row.joinedAt)}</span>
                </td>
                <td class="py-3.5 pr-4 align-top">
                  <StatusBadge status={row.status} />
                </td>
                <td class="py-3.5 align-top text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-3">
                    <button
                      type="button"
                      hx-get={`/admin/volunteers/${row.id}/edit`}
                      hx-target="#form-slot"
                      hx-swap="innerHTML"
                      aria-label={`${row.name} 정보 수정`}
                      class="text-[13px] text-ink-soft underline decoration-line underline-offset-2 hover:text-ink hover:decoration-ink"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      hx-delete={`/admin/volunteers/${row.id}`}
                      hx-confirm={`${row.name} 봉사자를 명부에서 삭제할까요?`}
                      hx-disabled-elt="this"
                      aria-label={`${row.name} 삭제`}
                      class="text-[13px] text-alert underline decoration-alert/30 underline-offset-2 hover:decoration-alert"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 ? (
              <tr>
                <td colspan={7} class="px-4 py-16 text-center">
                  <p class="text-sm text-ink-soft">
                    {hasFilter
                      ? "조건에 맞는 봉사자가 없습니다."
                      : "아직 등록된 봉사자가 없습니다."}
                  </p>
                  <p class="mt-1 text-[13px] text-muted">
                    {hasFilter
                      ? "검색어나 상태 필터를 바꿔보세요."
                      : "첫 봉사자를 등록하면 이곳에 편성 명부가 나타납니다."}
                  </p>
                  <div class="mt-5 flex justify-center">
                    {hasFilter ? (
                      <a href="/admin/volunteers" class="btn btn-ghost">
                        전체 명부 보기
                      </a>
                    ) : (
                      <button
                        type="button"
                        hx-get="/admin/volunteers/new"
                        hx-target="#form-slot"
                        hx-swap="innerHTML"
                        class="btn btn-primary"
                      >
                        봉사자 등록
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
