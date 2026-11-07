import type { AllowedEmail } from "../db/schema";
import { formatTimestamp } from "../lib/access";
import { PageHeader } from "./layout";

export type AllowedEmailsState = {
  error?: string;
  message?: string;
  values?: { email: string; memo: string };
};

type Props = AllowedEmailsState & {
  rows: AllowedEmail[];
  selfEmail: string;
};

export function AllowedEmailsView({ rows, selfEmail, ...state }: Props) {
  return (
    <div class="pt-6">
      <PageHeader
        title="허용 이메일"
        description="관리자가 아닌 사용자를 예외적으로 허용합니다. 등록된 이메일은 Google 로그인 후 명부를 조회하고 관리할 수 있습니다."
      />
      <div class="mt-6">
        <AllowedEmailsPanel rows={rows} selfEmail={selfEmail} {...state} />
      </div>
    </div>
  );
}

export function AllowedEmailsPanel({ rows, selfEmail, error, message, values }: Props) {
  return (
    <div id="allowed-emails-panel" class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section class="min-w-0">
        {message ? (
          <div
            role="status"
            class="mb-4 border-l-2 border-active bg-active/5 px-3.5 py-2.5 text-[13px] leading-5 text-active"
          >
            {message}
          </div>
        ) : null}

        <div class="border border-line bg-paper-soft">
          <div class="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
            <h2 class="text-[13px] font-medium text-ink">등록된 예외 이메일</h2>
            <span class="font-mono text-[12px] text-muted">{rows.length}건</span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left text-sm">
              <thead>
                <tr class="border-b border-line text-[12px] text-muted">
                  <th scope="col" class="py-2.5 pr-4 pl-4 font-medium">이메일</th>
                  <th scope="col" class="hidden py-2.5 pr-4 font-medium sm:table-cell">
                    메모
                  </th>
                  <th scope="col" class="hidden py-2.5 pr-4 font-medium md:table-cell">
                    등록
                  </th>
                  <th scope="col" class="py-2.5 pr-4 text-right font-medium">
                    <span class="sr-only">관리</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr class="border-b border-line/60 transition-colors hover:bg-olive-soft/40">
                    <td class="py-3.5 pr-4 pl-4 align-top">
                      <span class="font-mono text-[13px] break-all text-ink">{row.email}</span>
                    </td>
                    <td class="hidden py-3.5 pr-4 align-top text-[13px] text-ink-soft sm:table-cell">
                      {row.memo || "—"}
                    </td>
                    <td class="hidden py-3.5 pr-4 align-top md:table-cell">
                      <p class="font-mono text-[12px] text-ink-soft">
                        {formatTimestamp(row.createdAt)}
                      </p>
                      <p class="mt-0.5 font-mono text-[11px] text-muted">
                        {row.createdBy || "—"}
                      </p>
                    </td>
                    <td class="py-3.5 pr-4 align-top text-right whitespace-nowrap">
                      <button
                        type="button"
                        hx-delete={`/admin/emails/${row.id}`}
                        hx-target="#allowed-emails-panel"
                        hx-swap="outerHTML"
                        hx-confirm={`${row.email}을(를) 예외 목록에서 삭제할까요? 삭제하면 이 사용자는 더 이상 로그인할 수 없습니다.`}
                        hx-disabled-elt="this"
                        aria-label={`${row.email} 예외 허용 삭제`}
                        class="text-[13px] text-alert underline decoration-alert/30 underline-offset-2 hover:decoration-alert"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}

                {rows.length === 0 ? (
                  <tr>
                    <td colspan={4} class="px-4 py-14 text-center">
                      <p class="text-sm text-ink-soft">등록된 예외 이메일이 없습니다.</p>
                      <p class="mt-1 text-[13px] text-muted">
                        오른쪽 양식에서 허용할 이메일을 등록하세요.
                      </p>
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <aside class="min-w-0">
        <form
          method="post"
          action="/admin/emails"
          hx-post="/admin/emails"
          hx-target="#allowed-emails-panel"
          hx-swap="outerHTML"
          hx-disabled-elt="button[type='submit']"
          class="border border-line bg-paper-soft p-5"
        >
          <h2 class="text-[15px] font-semibold tracking-tight text-ink">예외 이메일 등록</h2>
          <p class="mt-1.5 text-[12px] leading-5 text-muted">
            개별 이메일만 등록할 수 있습니다. 도메인 전체 허용이 필요하면 운영 담당자에게
            문의하세요.
          </p>

          <div class="mt-4">
            <label for="allowed-email" class="field-label">
              이메일 <span class="ml-0.5 text-alert">*</span>
            </label>
            <input
              id="allowed-email"
              name="email"
              type="email"
              inputmode="email"
              autocomplete="off"
              required
              maxlength={254}
              value={values?.email ?? ""}
              placeholder="user@example.com"
              aria-invalid={error ? "true" : undefined}
              aria-describedby={error ? "allowed-email-error" : undefined}
              class={`input ${error ? "input-error" : ""}`}
            />
            {error ? (
              <p id="allowed-email-error" class="field-error">
                {error}
              </p>
            ) : null}
          </div>

          <div class="mt-4">
            <label for="allowed-memo" class="field-label">
              메모 <span class="font-normal text-muted">(선택)</span>
            </label>
            <input
              id="allowed-memo"
              name="memo"
              maxlength={100}
              value={values?.memo ?? ""}
              placeholder="예: 2분대 협조 요청"
              class="input"
            />
          </div>

          <button type="submit" class="btn btn-primary mt-4 w-full">
            등록
          </button>
        </form>

        <div class="mt-4 border border-dashed border-line px-3.5 py-3 text-[12px] leading-5 text-muted">
          <p>
            현재 관리자: <span class="font-mono text-ink-soft">{selfEmail}</span>
          </p>
          <p class="mt-1.5">
            관리자는 <code class="font-mono text-[11px]">ALLOWED_EMAILS</code> 환경 변수로
            지정합니다. 예외 목록에 등록된 사용자는 관리자 페이지에 접근할 수 없습니다.
          </p>
        </div>
      </aside>
    </div>
  );
}
