import {
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  VENUE,
} from "../lib/baraji";
import {
  APPLICATION_STATUS_META,
  APPLICATION_TYPE_META,
  applicationEventDetail,
  formatPhone,
  type ApplicationWithEvents,
} from "../lib/applications";
import { PublicLayout } from "./public-layout";

export function ApplyCompletePage({
  application,
}: {
  application: ApplicationWithEvents;
}) {
  const status = APPLICATION_STATUS_META[application.status];

  return (
    <PublicLayout
      title="신청이 접수되었습니다"
      description="바라지 신청 접수 완료. 접수번호와 선택 일정을 확인하세요."
      active="apply"
      noindex
      showMobileCta={false}
    >
      <div class="mx-auto w-full max-w-3xl px-5 py-12 sm:px-8 lg:py-16">
        <div class="border-t-2 border-ink pt-6">
          <p class="font-mono text-[11px] text-brass">접수 완료</p>
          <h1 class="mt-2 font-serif text-[30px] leading-tight font-bold tracking-[-0.03em] text-ink sm:text-[36px]">
            신청이 접수되었습니다
          </h1>
          <p class="mt-3 max-w-xl text-[14px] leading-7 text-ink-soft">
            남겨주신 내용을 확인한 뒤 텔레그램 소통방으로 초대합니다. 아래 접수번호를
            보관해주세요.
          </p>
        </div>

        <div class="mt-8 border border-line bg-paper-soft">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <div>
              <p class="text-[11px] text-muted">접수번호</p>
              <p class="mt-0.5 font-mono text-[20px] font-medium tracking-[0.02em] text-ink">
                {application.reference}
              </p>
            </div>
            <span class="inline-flex items-center gap-1.5 text-[12px] text-ink-soft">
              <span class={`size-1.5 rounded-full ${status.dot}`}></span>
              {status.label}
            </span>
          </div>

          <dl class="divide-y divide-line/70">
            <Row term="이름" value={application.name} />
            <Row term="연락처" value={formatPhone(application.phone)} mono />
            <Row term="참여 방식" value={APPLICATION_TYPE_META[application.type]} />
            <Row term="일정" value={applicationEventDetail(application.events)} />
            {application.type === "stay" ? (
              <Row
                term="숙박"
                value={application.lodging === "yes" ? "숙박" : "숙박하지 않음(통근)"}
              />
            ) : null}
            <Row term="장소" value={VENUE} />
          </dl>
        </div>

        <div class="mt-8">
          <h2 class="text-[14px] font-semibold text-ink">다음 안내</h2>
          <ol class="mt-3 space-y-3 border-t border-line pt-4 text-[13px] leading-6 text-ink-soft">
            <li class="flex gap-3">
              <span class="font-mono text-[11px] text-brass">01</span>
              운영 담당자가 신청 내용을 확인합니다.
            </li>
            <li class="flex gap-3">
              <span class="font-mono text-[11px] text-brass">02</span>
              확정된 분들을 텔레그램 소통방에 초대합니다.
            </li>
            <li class="flex gap-3">
              <span class="font-mono text-[11px] text-brass">03</span>
              준비물과 도착 시간을 안내받은 뒤 참여해주세요.
            </li>
          </ol>
        </div>

        <div class="mt-8 flex flex-col gap-4 border border-line px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p class="text-[11px] text-muted">문의</p>
            <a href={CONTACT_PHONE_HREF} class="mt-1 block font-mono text-[16px] text-ink hover:text-olive">
              {CONTACT_PHONE}
            </a>
          </div>
          <div class="flex flex-wrap gap-2">
            <a href="/" class="btn btn-ghost">
              모집 안내로
            </a>
            <a href={`/apply/complete/${application.accessToken}`} class="btn btn-primary">
              신청 내용 다시 보기
            </a>
          </div>
        </div>

        <p class="mt-6 text-[11px] leading-5 text-muted">
          이 주소는 신청 내용을 다시 확인할 수 있는 개인 링크입니다. 다른 사람과
          공유하지 마세요.
        </p>
      </div>
    </PublicLayout>
  );
}

function Row({
  term,
  value,
  mono = false,
}: {
  term: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div class="grid gap-1 px-5 py-3 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-4">
      <dt class="text-[11px] text-muted sm:pt-0.5">{term}</dt>
      <dd class={`text-[13px] leading-6 text-ink ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
