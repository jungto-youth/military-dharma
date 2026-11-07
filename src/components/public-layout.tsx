import type { Child } from "hono/jsx";
import { html } from "hono/html";
import {
  CONTACT_PHONE,
  CONTACT_PHONE_HREF,
  PUBLIC_SITE_NAME,
  PUBLIC_SITE_TAGLINE,
  VENUE,
} from "../lib/baraji";
import { BrandMark } from "./brand";

type Props = {
  title: string;
  description: string;
  active?: "home" | "apply";
  noindex?: boolean;
  showMobileCta?: boolean;
  children?: Child;
};

const NAV = [
  { href: "/#about", label: "바라지란" },
  { href: "/#schedule", label: "일정" },
  { href: "/#prepare", label: "준비물" },
  { href: "/#guide", label: "신청 안내" },
];

export function PublicLayout({
  title,
  description,
  active = "home",
  noindex = false,
  showMobileCta = true,
  children,
}: Props) {
  return html`<!DOCTYPE html>${(
    <html lang="ko" class="h-full scroll-smooth">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <title>{title} · {PUBLIC_SITE_NAME}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={PUBLIC_SITE_NAME} />
        <meta property="og:title" content={`${title} · ${PUBLIC_SITE_NAME}`} />
        <meta property="og:description" content={description} />
        <meta name="twitter:card" content="summary" />
        {noindex ? <meta name="robots" content="noindex, nofollow" /> : null}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="/assets/app.css" />
        <script src="/assets/public.js" defer></script>
      </head>
      <body class="min-h-full bg-paper text-ink antialiased">
        <header class="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
          <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-5 py-3 sm:px-8">
            <a href="/" class="flex items-center gap-3" aria-label={`${PUBLIC_SITE_NAME} 홈`}>
              <span class="grid size-9 shrink-0 place-items-center border border-olive/40 text-olive">
                <BrandMark class="size-6" tone="light" />
              </span>
              <span class="min-w-0">
                <span class="block text-[15px] font-semibold tracking-tight text-ink">
                  {PUBLIC_SITE_NAME}
                </span>
                <span class="mt-0.5 hidden text-[10px] leading-4 text-muted sm:block">
                  {PUBLIC_SITE_TAGLINE}
                </span>
              </span>
            </a>

            <nav class="hidden items-center gap-6 md:flex" aria-label="주요 메뉴">
              {NAV.map((item) => (
                <a
                  href={item.href}
                  class="text-[13px] text-ink-soft transition-colors hover:text-olive"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={active === "apply" ? "/#schedule" : "/apply"}
                class="btn btn-primary h-9 px-4"
              >
                {active === "apply" ? "일정 보기" : "신청하기"}
              </a>
            </nav>

            <a
              href={active === "apply" ? "/#schedule" : "/apply"}
              class="btn btn-primary h-9 px-4 md:hidden"
            >
              {active === "apply" ? "일정" : "신청"}
            </a>
          </div>
        </header>

        <main>{children}</main>

        <footer class="border-t border-line bg-paper-soft">
          <div class="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
            <div class="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <div class="flex items-center gap-3">
                <span class="grid size-10 shrink-0 place-items-center border border-olive/40 text-olive">
                  <BrandMark class="size-7" tone="light" />
                </span>
                <div>
                  <p class="text-[14px] font-semibold tracking-tight text-ink">{PUBLIC_SITE_NAME}</p>
                  <p class="mt-0.5 text-[11px] text-muted">{PUBLIC_SITE_TAGLINE}</p>
                </div>
              </div>

              <dl class="grid grid-cols-2 gap-x-8 gap-y-3 text-[12px] sm:text-right">
                <div>
                  <dt class="text-muted">문의</dt>
                  <dd class="mt-0.5">
                    <a href={CONTACT_PHONE_HREF} class="font-mono text-[13px] text-ink hover:text-olive">
                      {CONTACT_PHONE}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt class="text-muted">장소</dt>
                  <dd class="mt-0.5 text-ink-soft">{VENUE}</dd>
                </div>
              </dl>
            </div>

            <div class="mt-8 flex flex-col gap-2 border-t border-line pt-5 text-[11px] text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>{PUBLIC_SITE_NAME} · 청년지부</p>
              <p>2026년 11월 모집</p>
            </div>
          </div>
        </footer>

        {showMobileCta ? (
          <>
            <div class="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-5 py-3 backdrop-blur md:hidden">
              <a href="/apply" class="btn btn-primary w-full">
                바라지 신청하기
              </a>
            </div>
            <div class="h-16 md:hidden" aria-hidden="true"></div>
          </>
        ) : null}
      </body>
    </html>
  )}`;
}

export function PublicSection(props: {
  id: string;
  label: string;
  title?: string;
  description?: string;
  children?: Child;
  tone?: "paper" | "soft";
}) {
  return (
    <section
      id={props.id}
      class={`scroll-mt-20 border-t border-line ${props.tone === "soft" ? "bg-paper-soft" : ""}`}
    >
      <div class="mx-auto w-full max-w-6xl px-5 py-14 sm:px-8 lg:grid lg:grid-cols-[168px_minmax(0,1fr)] lg:gap-14 lg:py-20">
        <div class="lg:pt-1">
          <h2 class="text-[12px] font-medium tracking-[0.02em] text-muted">{props.label}</h2>
        </div>

        <div class="mt-5 min-w-0 lg:mt-0">
          {props.title ? (
            <h3 class="max-w-2xl font-serif text-[26px] leading-[1.35] font-bold tracking-[-0.02em] text-ink sm:text-[30px]">
              {props.title}
            </h3>
          ) : null}
          {props.description ? (
            <p class="mt-4 max-w-2xl text-[14px] leading-7 text-ink-soft">{props.description}</p>
          ) : null}
          <div class={props.title || props.description ? "mt-8" : ""}>{props.children}</div>
        </div>
      </div>
    </section>
  );
}
