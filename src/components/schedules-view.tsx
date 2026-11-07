import type { EventWithCount } from "../lib/baraji";
import { availabilityOf, formatEventRange } from "../lib/baraji";
import { PageHeader } from "./layout";

type Props = {
  stay: EventWithCount[];
  shift: EventWithCount[];
  message?: string;
  error?: string;
};

export function SchedulesView({ stay, shift, message, error }: Props) {
  return (
    <div class="pt-6">
      <PageHeader
        title="일정·정원"
        description="회차와 일일 타임별 정원을 설정하고 모집 상태를 관리합니다. 정원을 비우고 제한 없음을 선택하면 자리 제한 없이 접수됩니다."
        actions={
          <a href="/" target="_blank" rel="noreferrer" class="btn btn-ghost">
            모집 페이지 보기
          </a>
        }
      />

      <div class="mt-6">
        <SchedulesPanel stay={stay} shift={shift} message={message} error={error} />
      </div>
    </div>
  );
}

export function SchedulesPanel({ stay, shift, message, error }: Props) {
  return (
    <div id="schedules-panel" class="space-y-8">
      {message ? (
        <div
          role="status"
          class="border-l-2 border-active bg-active/5 px-3.5 py-2.5 text-[13px] leading-5 text-active"
        >
          {message}
        </div>
      ) : null}
      {error ? (
        <div
          role="alert"
          class="border-l-2 border-alert bg-alert/5 px-3.5 py-2.5 text-[13px] leading-5 text-alert"
        >
          {error}
        </div>
      ) : null}

      <Group title="숙박형 회차" events={stay} />
      <Group title="일일 공양 타임" events={shift} />
    </div>
  );
}

function Group({ title, events }: { title: string; events: EventWithCount[] }) {
  return (
    <section class="border border-line bg-paper-soft">
      <div class="flex items-center justify-between gap-4 border-b border-line px-4 py-3">
        <h2 class="text-[13px] font-medium text-ink">{title}</h2>
        <span class="font-mono text-[12px] text-muted">{events.length}개</span>
      </div>

      {events.length > 0 ? (
        <div class="divide-y divide-line/60">
          {events.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p class="px-4 py-8 text-center text-[13px] text-muted">
          등록된 일정이 없습니다. 마이그레이션으로 일정을 추가하세요.
        </p>
      )}
    </section>
  );
}

function EventRow({ event }: { event: EventWithCount }) {
  const availability = availabilityOf(event);
  const unlimited = event.capacity === null;
  const overCapacity =
    event.capacity !== null && event.activeCount > event.capacity;

  return (
    <form
      method="post"
      action={`/admin/schedules/${event.id}`}
      hx-post={`/admin/schedules/${event.id}`}
      hx-target="#schedules-panel"
      hx-swap="outerHTML"
      hx-disabled-elt="button[type='submit']"
      class="grid gap-4 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_150px_120px_84px_76px] lg:items-center"
    >
      <div class="min-w-0">
        <p class="text-[14px] font-medium text-ink">{event.title}</p>
        <p class="mt-0.5 font-mono text-[11px] leading-5 text-muted">
          {formatEventRange(event)}
        </p>
        <p class="mt-1 text-[11px] text-muted">
          현재 신청 <span class="font-mono text-ink-soft">{event.activeCount}</span>명 ·
          <span class={`ml-1 ${availability.state === "open" ? "text-active" : "text-alert"}`}>
            {availability.label}
          </span>
        </p>
      </div>

      <label class="block">
        <span class="field-label">정원</span>
        <input
          type="number"
          name="capacity"
          min="0"
          step="1"
          value={event.capacity ?? ""}
          placeholder="예: 10"
          class={`input h-9 ${overCapacity ? "input-error" : ""}`}
          aria-invalid={overCapacity ? "true" : undefined}
        />
        {overCapacity ? (
          <span class="mt-1 block text-[11px] text-alert">
            현재 신청 인원보다 적습니다.
          </span>
        ) : null}
      </label>

      <label class="flex items-center gap-2 pt-1 text-[13px] text-ink-soft lg:pt-5">
        <input
          type="checkbox"
          name="unlimited"
          value="on"
          checked={unlimited}
          class="size-4 accent-olive"
        />
        제한 없음
      </label>

      <label class="flex items-center gap-2 pt-1 text-[13px] text-ink-soft lg:pt-5">
        <input
          type="checkbox"
          name="isOpen"
          value="on"
          checked={event.isOpen}
          class="size-4 accent-olive"
        />
        모집중
      </label>

      <button type="submit" class="btn btn-ghost h-9 lg:justify-self-end">
        저장
      </button>
    </form>
  );
}
