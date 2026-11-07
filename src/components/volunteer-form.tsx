import type { FieldErrors, VolunteerFormValues } from "../lib/volunteers";
import { STATUSES, STATUS_META } from "../lib/status";
import type { VolunteerStatus } from "../db/schema";

type Props = {
  values: VolunteerFormValues;
  errors?: FieldErrors;
  volunteerId?: number;
  context?: "dialog" | "page";
};

export function VolunteerForm({ values, errors = {}, volunteerId, context = "dialog" }: Props) {
  const isEdit = typeof volunteerId === "number";
  const action = isEdit ? `/volunteers/${volunteerId}` : "/volunteers";

  return (
    <form
      id="volunteer-form"
      method="post"
      action={action}
      hx-post={isEdit ? undefined : action}
      hx-put={isEdit ? action : undefined}
      hx-target="#form-slot"
      hx-swap="innerHTML"
      hx-disabled-elt="button[type='submit']"
      class="space-y-7"
    >
      <input type="hidden" name="_context" value={context} />
      {context === "dialog" ? (
        <div class="flex items-start justify-between gap-4 border-b border-line pb-4">
          <div>
            <h2 id="volunteer-form-title" class="text-lg font-semibold tracking-tight text-ink">
              {isEdit ? "봉사자 정보 수정" : "봉사자 등록"}
            </h2>
            <p class="mt-1 text-[13px] leading-5 text-muted">
              {isEdit
                ? "필요한 항목만 수정하고 저장하세요."
                : "이름은 필수입니다. 나머지 항목은 등록 후에도 채울 수 있습니다."}
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
      ) : null}

      <div class="grid gap-x-5 gap-y-5 sm:grid-cols-2">
        <Field
          name="name"
          label="이름"
          value={values.name}
          error={errors.name}
          placeholder="홍길동"
          autocomplete="name"
          maxlength={60}
          required
        />
        <Field
          name="rank"
          label="신분"
          value={values.rank}
          placeholder="예비역 대위"
          maxlength={40}
        />
        <Field
          name="affiliation"
          label="소속"
          value={values.affiliation}
          placeholder="○○부대 / ○○협회"
          maxlength={80}
        />
        <Field
          name="specialty"
          label="전문분야"
          value={values.specialty}
          placeholder="전술, 리더십, 안전교육"
          maxlength={80}
        />
        <Field
          name="region"
          label="활동지역"
          value={values.region}
          placeholder="서울·경기"
          maxlength={60}
        />
        <Field
          name="joinedAt"
          label="가입일"
          value={values.joinedAt}
          error={errors.joinedAt}
          type="date"
        />
        <Field
          name="phone"
          label="연락처"
          value={values.phone}
          error={errors.phone}
          placeholder="010-0000-0000"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          maxlength={30}
        />
        <Field
          name="email"
          label="이메일"
          value={values.email}
          error={errors.email}
          placeholder="name@example.com"
          type="email"
          inputmode="email"
          autocomplete="email"
          maxlength={120}
        />
        <div>
          <label for="field-status" class="field-label">활동 상태</label>
          <select
            id="field-status"
            name="status"
            class="input"
            aria-invalid={errors.status ? "true" : undefined}
          >
            {STATUSES.map((status: VolunteerStatus) => (
              <option value={status} selected={values.status === status}>
                {STATUS_META[status].label}
              </option>
            ))}
          </select>
          {errors.status ? <p class="field-error">{errors.status}</p> : null}
        </div>
        <div class="sm:col-span-2">
          <label for="field-notes" class="field-label">메모</label>
          <textarea
            id="field-notes"
            name="notes"
            rows={3}
            maxlength={2000}
            placeholder="활동 가능 일정, 자격, 특이사항"
            class={`input h-auto py-2.5 leading-6 ${errors.notes ? "input-error" : ""}`}
          >{values.notes}</textarea>
          {errors.notes ? <p class="field-error">{errors.notes}</p> : null}
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 border-t border-line pt-5">
        {context === "dialog" ? (
          <button type="button" data-close-dialog class="btn btn-ghost">
            취소
          </button>
        ) : (
          <a href="/volunteers" class="btn btn-ghost">
            명부로
          </a>
        )}
        <button type="submit" class="btn btn-primary">
          {isEdit ? "변경 저장" : "명부에 등록"}
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  name: keyof VolunteerFormValues;
  label: string;
  value: string;
  error?: string;
  type?: string;
  placeholder?: string;
  autocomplete?: string;
  inputmode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
  maxlength?: number;
  required?: boolean;
};

function Field(props: FieldProps) {
  const id = `field-${props.name}`;
  const errorId = `${id}-error`;

  return (
    <div>
      <label for={id} class="field-label">
        {props.label}
        {props.required ? <span class="ml-1 text-alert">*</span> : null}
      </label>
      <input
        id={id}
        name={props.name}
        value={props.value}
        type={props.type ?? "text"}
        placeholder={props.placeholder}
        autocomplete={props.autocomplete}
        inputmode={props.inputmode}
        maxlength={props.maxlength}
        required={props.required}
        aria-invalid={props.error ? "true" : undefined}
        aria-describedby={props.error ? errorId : undefined}
        class={`input ${props.error ? "input-error" : ""}`}
      />
      {props.error ? (
        <p id={errorId} class="field-error">
          {props.error}
        </p>
      ) : null}
    </div>
  );
}
