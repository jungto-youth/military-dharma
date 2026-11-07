import type { Child } from "hono/jsx";
import type { BarajiEvent } from "../db/schema";
import {
  availabilityOf,
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  formatClock,
  formatEventDate,
  stayNights,
  VENUE,
  type Availability,
  type EventWithCount,
  type ShiftDay,
} from "../lib/baraji";
import {
  AFFILIATIONS,
  GENDERS,
  MEMBERSHIPS,
  type ApplicationFieldErrors,
  type ApplicationFormValues,
} from "../lib/applications";
import { PublicLayout } from "./public-layout";

type Props = {
  stay: EventWithCount[];
  shift: EventWithCount[];
  days: ShiftDay[];
  values: ApplicationFormValues;
  selectedEventIds: number[];
  errors: ApplicationFieldErrors;
  now?: Date;
};

const ERROR_ORDER: Array<keyof ApplicationFieldErrors> = [
  "type",
  "events",
  "name",
  "phone",
  "affiliation",
  "membership",
  "membershipOther",
  "gender",
  "lodging",
  "motivation",
  "privacy",
];

export function ApplyPage({
  stay,
  shift,
  days,
  values,
  selectedEventIds,
  errors,
  now = new Date(),
}: Props) {
  const selected = new Set(selectedEventIds);
  const hasErrors = Object.keys(errors).length > 0;
  const errorMessages = ERROR_ORDER.map((key) => errors[key]).filter(
    (message): message is string => Boolean(message),
  );

  return (
    <PublicLayout
      title="바라지 신청"
      description="2026 군청년 바라지 봉사자 신청서. 참여 일정과 연락처를 남겨주세요."
      active="apply"
      showMobileCta={false}
    >
      <div class="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-12 lg:py-14">
        <div class="min-w-0">
          <header class="border-b border-ink/15 pb-6">
            <a href="/" class="text-[12px] text-muted hover:text-olive">
              ← 모집 안내로
            </a>
            <h1 class="mt-4 font-serif text-[30px] leading-tight font-bold tracking-[-0.03em] text-ink sm:text-[36px]">
              바라지 신청
            </h1>
            <p class="mt-3 max-w-xl text-[14px] leading-7 text-ink-soft">
              2026년 11월 12일부터 20일까지, 함께할 수 있는 날을 골라주세요.
              신청은 선착순으로 마감됩니다.
            </p>
          </header>

          {hasErrors ? (
            <div
              role="alert"
              class="mt-6 border-l-2 border-alert bg-alert/5 px-4 py-3.5"
            >
              <p class="text-[13px] font-medium text-alert">
                신청서를 다시 확인해주세요.
              </p>
              <ul class="mt-2 space-y-1">
                {errorMessages.map((message) => (
                  <li class="text-[12px] leading-5 text-alert">{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <form
            method="post"
            action="/apply"
            class="apply-form mt-8 space-y-10"
            novalidate
          >
            <input
              type="text"
              name="website"
              value={values.website}
              class="absolute -left-[9999px] size-px opacity-0"
              tabindex={-1}
              autocomplete="off"
              aria-hidden="true"
            />

            <FormSection
              number="01"
              title="참여 방식"
              description="숙박형은 프로그램과 함께 머무는 회차이고, 일일은 공양 봉사만 하는 파트 일정입니다."
            >
              <div class="grid gap-3 sm:grid-cols-2">
                <TypeOption
                  value="stay"
                  current={values.type}
                  title="숙박형"
                  description="1박 2일 또는 2박 3일로 머물며 공양 봉사와 프로그램에 함께합니다."
                />
                <TypeOption
                  value="shift"
                  current={values.type}
                  title="일일(파트)"
                  description="선택한 날짜와 시간대에만 공양 봉사를 돕고 돌아갑니다."
                />
              </div>
              {errors.type ? <FieldError>{errors.type}</FieldError> : null}
            </FormSection>

            <FormSection
              number="02"
              title="일정 선택"
              description="참여 방식을 먼저 선택하면 해당 일정만 표시됩니다."
            >
              <div id="schedule-options" class="space-y-8">
                <div data-type-panel="stay">
                  <div class="flex items-baseline justify-between gap-3 border-b border-ink/15 pb-2.5">
                    <h3 class="text-[14px] font-semibold text-ink">숙박형 회차</h3>
                    <p class="text-[11px] text-muted">한 회차만 선택</p>
                  </div>

                  {stay.length > 0 ? (
                    <div class="mt-3 space-y-2">
                      {stay.map((event) => (
                        <StayOption
                          key={event.id}
                          event={event}
                          checked={selected.has(event.id)}
                          now={now}
                        />
                      ))}
                    </div>
                  ) : (
                    <p class="mt-4 text-[13px] text-muted">등록된 숙박형 일정이 없습니다.</p>
                  )}
                </div>

                <div data-type-panel="shift">
                  <div class="flex items-baseline justify-between gap-3 border-b border-ink/15 pb-2.5">
                    <h3 class="text-[14px] font-semibold text-ink">일일 공양 타임</h3>
                    <p class="text-[11px] text-muted">여러 개 선택 가능</p>
                  </div>

                  {days.length > 0 ? (
                    <div class="mt-3">
                      {days.map((day) => (
                        <div class="grid gap-3 border-b border-line/70 py-3 sm:grid-cols-[96px_minmax(0,1fr)] sm:items-center">
                          <div class="flex items-baseline gap-2 sm:block">
                            <p class="font-mono text-[13px] text-ink">{day.dateLabel}</p>
                            <p class="text-[11px] text-muted">{day.weekday}</p>
                          </div>
                          <div class="grid grid-cols-2 gap-2">
                            <ShiftOption
                              label="점심"
                              event={day.lunch}
                              checked={day.lunch ? selected.has(day.lunch.id) : false}
                              now={now}
                            />
                            <ShiftOption
                              label="저녁"
                              event={day.dinner}
                              checked={day.dinner ? selected.has(day.dinner.id) : false}
                              now={now}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p class="mt-4 text-[13px] text-muted">등록된 일일 일정이 없습니다.</p>
                  )}

                  <p class="mt-3 border-l-2 border-line pl-3 text-[11px] leading-5 text-muted">
                    일일(파트) 봉사는 숙박과 바라지 프로그램에 포함되지 않습니다.
                  </p>
                </div>
              </div>

              {errors.events ? <FieldError>{errors.events}</FieldError> : null}
            </FormSection>

            <FormSection number="03" title="신청자 정보">
              <div class="grid gap-5 sm:grid-cols-2">
                <TextField
                  name="name"
                  label="이름"
                  value={values.name}
                  error={errors.name}
                  placeholder="홍길동"
                  autocomplete="name"
                  maxlength={40}
                  required
                />
                <TextField
                  name="phone"
                  label="연락처"
                  value={values.phone}
                  error={errors.phone}
                  placeholder="010-1234-5678"
                  type="tel"
                  inputmode="tel"
                  autocomplete="tel"
                  maxlength={30}
                  required
                />
                <SelectField
                  name="affiliation"
                  label="소속"
                  value={values.affiliation}
                  error={errors.affiliation}
                  required
                >
                  <option value="">소속을 선택하세요</option>
                  {AFFILIATIONS.map((affiliation) => (
                    <option value={affiliation} selected={values.affiliation === affiliation}>
                      {affiliation}
                    </option>
                  ))}
                </SelectField>
                <SelectField
                  name="membership"
                  label="회원구분"
                  value={values.membership}
                  error={errors.membership}
                  required
                >
                  <option value="">회원구분을 선택하세요</option>
                  {Object.entries(MEMBERSHIPS).map(([value, label]) => (
                    <option value={value} selected={values.membership === value}>
                      {label}
                    </option>
                  ))}
                </SelectField>

                <div class="membership-other sm:col-span-2">
                  <TextField
                    name="membershipOther"
                    label="기타 회원구분"
                    value={values.membershipOther}
                    error={errors.membershipOther}
                    placeholder="소속이나 구분을 적어주세요"
                    maxlength={40}
                  />
                </div>

                <fieldset class="sm:col-span-2">
                  <legend class="field-label">
                    성별<span class="ml-1 text-alert">*</span>
                  </legend>
                  <div class="flex items-center gap-2">
                    {Object.entries(GENDERS).map(([value, label]) => (
                      <label class="inline-flex h-10 cursor-pointer items-center gap-2 border border-line bg-white px-4 text-[13px] text-ink transition-colors has-[:checked]:border-olive has-[:checked]:bg-olive-soft/60">
                        <input
                          type="radio"
                          name="gender"
                          value={value}
                          checked={values.gender === value}
                          class="accent-olive"
                          required
                        />
                        {label}
                      </label>
                    ))}
                  </div>
                  <p class="mt-1.5 text-[11px] text-muted">숙소 배정 참고용입니다.</p>
                  {errors.gender ? <FieldError>{errors.gender}</FieldError> : null}
                </fieldset>

                <div data-lodging class="sm:col-span-2">
                  <fieldset>
                    <legend class="field-label">
                      숙박 여부<span class="ml-1 text-alert">*</span>
                    </legend>
                    <div class="flex flex-wrap items-center gap-2">
                      {[
                        { value: "yes", label: "숙박" },
                        { value: "no", label: "숙박하지 않음(통근)" },
                      ].map((option) => (
                        <label class="inline-flex h-10 cursor-pointer items-center gap-2 border border-line bg-white px-4 text-[13px] text-ink transition-colors has-[:checked]:border-olive has-[:checked]:bg-olive-soft/60">
                          <input
                            type="radio"
                            name="lodging"
                            value={option.value}
                            checked={values.lodging === option.value}
                            class="accent-olive"
                          />
                          {option.label}
                        </label>
                      ))}
                    </div>
                    {errors.lodging ? <FieldError>{errors.lodging}</FieldError> : null}
                  </fieldset>
                </div>

                <div class="sm:col-span-2">
                  <TextField
                    name="telegram"
                    label="텔레그램 ID (선택)"
                    value={values.telegram}
                    error={errors.telegram}
                    placeholder="@username"
                    maxlength={40}
                    help="소통방 초대에 사용합니다. 없으면 연락처로 안내드립니다."
                  />
                </div>
              </div>
            </FormSection>

            <FormSection
              number="04"
              title="마음과 동의"
              description="짧게라도 좋습니다. 신청 동기를 남겨주시면 운영에 참고하겠습니다."
            >
              <div>
                <label for="field-motivation" class="field-label">
                  신청 동기 (선택)
                </label>
                <textarea
                  id="field-motivation"
                  name="motivation"
                  rows={4}
                  maxlength={1000}
                  placeholder="바라지에 함께하고 싶은 마음을 적어주세요."
                  class={`input h-auto py-2.5 leading-6 ${errors.motivation ? "input-error" : ""}`}
                >
                  {values.motivation}
                </textarea>
                {errors.motivation ? <FieldError>{errors.motivation}</FieldError> : null}
              </div>

              <div class="mt-6 border border-line bg-paper-soft px-4 py-4">
                <p class="text-[12px] font-medium text-ink">개인정보 수집·이용 안내</p>
                <dl class="mt-2 space-y-1.5 text-[11px] leading-5 text-muted">
                  <div class="flex gap-2">
                    <dt class="shrink-0 text-ink-soft">수집 항목</dt>
                    <dd>이름, 연락처, 소속, 회원구분, 성별, 숙박 여부, 텔레그램 ID(선택)</dd>
                  </div>
                  <div class="flex gap-2">
                    <dt class="shrink-0 text-ink-soft">이용 목적</dt>
                    <dd>바라지 신청 접수, 일정 안내, 텔레그램 소통방 초대</dd>
                  </div>
                  <div class="flex gap-2">
                    <dt class="shrink-0 text-ink-soft">보관 기간</dt>
                    <dd>프로그램 종료 후 3개월 내 파기</dd>
                  </div>
                </dl>

                <label class="mt-3 flex cursor-pointer items-start gap-2.5 border-t border-line pt-3">
                  <input
                    type="checkbox"
                    name="privacy"
                    value="on"
                    checked={values.privacyAgreed}
                    class="mt-0.5 size-4 accent-olive"
                  />
                  <span class="text-[12px] leading-5 text-ink-soft">
                    개인정보 수집·이용에 동의합니다.
                    <span class="ml-1 text-alert">*</span>
                  </span>
                </label>
                {errors.privacy ? <FieldError>{errors.privacy}</FieldError> : null}
              </div>
            </FormSection>

            <div class="flex flex-col gap-3 border-t border-ink/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p class="text-[11px] leading-5 text-muted">
                제출 후 접수번호가 발급됩니다. 선착순 마감 시 조기 종료될 수 있습니다.
              </p>
              <button type="submit" class="btn btn-primary h-11 shrink-0 px-6">
                신청서 제출
              </button>
            </div>
          </form>
        </div>

        <aside class="mt-10 lg:mt-0">
          <div class="lg:sticky lg:top-24">
            <div class="border border-line bg-paper-soft px-5 py-5">
              <p class="text-[12px] font-medium text-ink">신청 전 확인</p>
              <ul class="mt-3 space-y-3 text-[12px] leading-5 text-ink-soft">
                <li class="border-t border-line/70 pt-3">신청은 선착순으로 마감됩니다.</li>
                <li class="border-t border-line/70 pt-3">
                  접수 후 텔레그램 소통방으로 초대합니다.
                </li>
                <li class="border-t border-line/70 pt-3">
                  일일(파트) 봉사는 숙박과 프로그램에 포함되지 않습니다.
                </li>
                <li class="border-t border-line/70 pt-3">
                  문의는 군전법 담당에게 연락해주세요.
                </li>
              </ul>
              <a
                href={CONTACT_PHONE_HREF}
                class="mt-4 block border-t border-line pt-3 font-mono text-[15px] text-ink hover:text-olive"
              >
                {CONTACT_PHONE}
              </a>
            </div>

            <div class="mt-4 border border-line px-5 py-4">
              <p class="text-[11px] text-muted">장소</p>
              <p class="mt-1 text-[13px] text-ink">{VENUE}</p>
              <p class="mt-3 text-[11px] text-muted">기간</p>
              <p class="mt-1 font-mono text-[13px] text-ink">2026. 11. 12 – 11. 20</p>
            </div>
          </div>
        </aside>
      </div>
    </PublicLayout>
  );
}

function FormSection(props: {
  number: string;
  title: string;
  description?: string;
  children?: Child;
}) {
  return (
    <section aria-labelledby={`section-${props.number}`}>
      <div class="flex items-baseline gap-3 border-b border-ink/15 pb-3">
        <span class="font-mono text-[11px] text-brass">{props.number}</span>
        <h2 id={`section-${props.number}`} class="text-[16px] font-semibold text-ink">
          {props.title}
        </h2>
      </div>
      {props.description ? (
        <p class="mt-2.5 max-w-xl text-[12px] leading-5 text-muted">{props.description}</p>
      ) : null}
      <div class="mt-5">{props.children}</div>
    </section>
  );
}

function TypeOption(props: {
  value: "stay" | "shift";
  current: string;
  title: string;
  description: string;
}) {
  const checked = props.current === props.value;

  return (
    <label
      class={`flex cursor-pointer gap-3 border px-4 py-4 transition-colors ${
        checked
          ? "border-olive bg-olive-soft/50"
          : "border-line bg-white hover:border-olive/40"
      }`}
    >
      <input
        type="radio"
        name="type"
        value={props.value}
        checked={checked}
        class="mt-0.5 size-4 shrink-0 accent-olive"
        required
      />
      <span>
        <span class="block text-[14px] font-medium text-ink">{props.title}</span>
        <span class="mt-1 block text-[12px] leading-5 text-muted">{props.description}</span>
      </span>
    </label>
  );
}

function StayOption({
  event,
  checked,
  now,
}: {
  event: EventWithCount;
  checked: boolean;
  now: Date;
}) {
  const availability = availabilityOf(event, now);
  const disabled = availability.state !== "open";

  return (
    <label
      class={`flex gap-3 border px-4 py-3.5 transition-colors ${
        disabled
          ? "cursor-not-allowed border-line/60 bg-paper-deep/20 opacity-65"
          : checked
            ? "cursor-pointer border-olive bg-olive-soft/50"
            : "cursor-pointer border-line bg-white hover:border-olive/40"
      }`}
    >
      <input
        type="radio"
        name="eventIds"
        value={event.id}
        checked={checked}
        disabled={disabled}
        class="mt-0.5 size-4 shrink-0 accent-olive"
      />
      <span class="min-w-0 flex-1">
        <span class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span class="text-[14px] font-medium text-ink">{event.title}</span>
          <SeatLabel availability={availability} />
        </span>
        <span class="mt-1 block font-mono text-[11px] leading-5 text-muted">
          {formatEventDate(event.startsAt)} {formatClock(event.startsAt)} →{" "}
          {formatEventDate(event.endsAt)} {formatClock(event.endsAt)}
        </span>
        <span class="mt-0.5 block text-[11px] text-muted">{stayNights(event)}</span>
      </span>
    </label>
  );
}

function ShiftOption({
  label,
  event,
  checked,
  now,
}: {
  label: string;
  event?: BarajiEvent;
  checked: boolean;
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

  const withCount = event as EventWithCount;
  const availability = availabilityOf(withCount, now);
  const disabled = availability.state !== "open";

  return (
    <label
      class={`flex cursor-pointer items-start gap-2 border px-3 py-2.5 transition-colors ${
        disabled
          ? "cursor-not-allowed border-line/60 bg-paper-deep/20 opacity-65"
          : checked
            ? "border-olive bg-olive-soft/50"
            : "border-line bg-white hover:border-olive/40"
      }`}
    >
      <input
        type="checkbox"
        name="eventIds"
        value={event.id}
        checked={checked}
        disabled={disabled}
        class="mt-0.5 size-4 shrink-0 accent-olive"
      />
      <span class="min-w-0 flex-1">
        <span class="flex items-baseline justify-between gap-2">
          <span class="text-[11px] text-muted">{label}</span>
          <SeatLabel availability={availability} compact />
        </span>
        <span class="mt-0.5 block font-mono text-[11px] text-ink">
          {formatClock(event.startsAt)}–{formatClock(event.endsAt)}
        </span>
      </span>
    </label>
  );
}

function SeatLabel({
  availability,
  compact = false,
}: {
  availability: Availability;
  compact?: boolean;
}) {
  const open = availability.state === "open";

  return (
    <span
      class={`inline-flex items-center gap-1 whitespace-nowrap ${
        compact ? "text-[10px]" : "text-[11px]"
      } ${open ? "text-active" : "text-muted"}`}
    >
      <span class={`size-1.5 rounded-full ${open ? "bg-active" : "bg-idle"}`}></span>
      {availability.label}
    </span>
  );
}

function TextField(props: {
  name: keyof ApplicationFormValues;
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  type?: string;
  autocomplete?: string;
  inputmode?: "text" | "tel" | "email" | "numeric";
  maxlength?: number;
  required?: boolean;
  help?: string;
}) {
  const id = `field-${props.name}`;
  const helpId = `${id}-help`;

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
        aria-describedby={props.help ? helpId : undefined}
        class={`input ${props.error ? "input-error" : ""}`}
      />
      {props.help ? (
        <p id={helpId} class="mt-1 text-[11px] leading-5 text-muted">
          {props.help}
        </p>
      ) : null}
      {props.error ? <FieldError>{props.error}</FieldError> : null}
    </div>
  );
}

function SelectField(props: {
  name: string;
  label: string;
  value: string;
  error?: string;
  required?: boolean;
  children?: Child;
}) {
  const id = `field-${props.name}`;

  return (
    <div>
      <label for={id} class="field-label">
        {props.label}
        {props.required ? <span class="ml-1 text-alert">*</span> : null}
      </label>
      <select
        id={id}
        name={props.name}
        aria-invalid={props.error ? "true" : undefined}
        class={`input ${props.error ? "input-error" : ""}`}
      >
        {props.children}
      </select>
      {props.error ? <FieldError>{props.error}</FieldError> : null}
    </div>
  );
}

function FieldError(props: { children: string }) {
  return <p class="field-error">{props.children}</p>;
}
