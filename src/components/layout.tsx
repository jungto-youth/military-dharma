import type { Child } from "hono/jsx";
import { html } from "hono/html";
import type { SessionUser } from "../types";
import type { VolunteerStatus } from "../db/schema";
import { SITE_NAME, SITE_TAGLINE } from "../lib/site";
import { STATUS_META } from "../lib/status";
import { BrandMark } from "./brand";

export type NavKey = "dashboard" | "volunteers" | "emails";

const NAV: Array<{
  key: NavKey;
  href: string;
  label: string;
  adminOnly?: boolean;
}> = [
  { key: "dashboard", href: "/", label: "편성 현황" },
  { key: "volunteers", href: "/volunteers", label: "봉사자 명부" },
  { key: "emails", href: "/admin/emails", label: "허용 이메일", adminOnly: true },
];

type LayoutProps = {
  title: string;
  user: SessionUser;
  active: NavKey;
  isAdmin?: boolean;
  children?: Child;
};

export function Layout({ title, user, active, isAdmin = false, children }: LayoutProps) {
  const nav = NAV.filter((item) => !item.adminOnly || isAdmin);

  return html`<!DOCTYPE html>${(
    <html lang="ko" class="h-full">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <title>{title} · {SITE_NAME}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="/assets/app.css" />
        <script src="/assets/htmx.min.js" defer></script>
        <script src="/assets/app.js" defer></script>
      </head>
      <body class="min-h-full overflow-x-clip bg-paper text-ink antialiased">
        <div class="min-h-screen lg:grid lg:grid-cols-[272px_minmax(0,1fr)]">
          <aside class="rail hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
            <div class="border-b border-paper/15 px-6 pt-7 pb-6">
              <a href="/" class="flex items-center gap-3">
                <span class="grid size-10 shrink-0 place-items-center border border-brass/70 text-brass">
                  <BrandMark class="size-7" />
                </span>
                <span class="min-w-0">
                  <span class="block text-[15px] font-semibold tracking-tight text-paper">{SITE_NAME}</span>
                  <span class="mt-0.5 block text-[11px] leading-4 text-paper/55">{SITE_TAGLINE}</span>
                </span>
              </a>
            </div>

            <nav class="flex-1 px-3 py-6" aria-label="주요 메뉴">
              <ul class="space-y-0.5">
                {nav.map((item) => (
                  <li>
                    <a
                      href={item.href}
                      aria-current={active === item.key ? "page" : undefined}
                      class={`block border-l-2 px-3 py-2.5 text-sm transition-colors ${
                        active === item.key
                          ? "border-brass bg-white/5 text-paper"
                          : "border-transparent text-paper/65 hover:border-paper/25 hover:text-paper"
                      }`}
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div class="border-t border-paper/15 p-4">
              <div class="flex items-center gap-3">
                <span class="grid size-8 shrink-0 place-items-center rounded-full bg-paper/10 text-[12px] font-semibold text-paper">
                  {user.name.trim().charAt(0) || "?"}
                </span>
                <div class="min-w-0 flex-1">
                  <p class="truncate text-[13px] font-medium text-paper">{user.name}</p>
                  <p class="truncate font-mono text-[11px] text-paper/60">{user.email}</p>
                </div>
              </div>
              <form method="post" action="/auth/logout" class="mt-3">
                <button type="submit" class="w-full border border-paper/20 px-3 py-1.5 text-left text-[12px] text-paper/70 transition-colors hover:border-paper/40 hover:text-paper">
                  로그아웃
                </button>
              </form>
            </div>
          </aside>

          <div class="flex min-h-screen flex-col">
            <header class="bg-olive-deep text-paper lg:hidden">
              <div class="flex items-center justify-between gap-4 px-5 py-3.5">
                <a href="/" class="flex items-center gap-2.5">
                  <span class="grid size-8 place-items-center border border-brass/70 text-brass">
                    <BrandMark class="size-6" />
                  </span>
                  <span class="text-[14px] font-semibold tracking-tight">{SITE_NAME}</span>
                </a>
                <nav aria-label="주요 메뉴">
                  <ul class="flex items-center gap-4 text-[13px]">
                    {nav.map((item) => (
                      <li>
                        <a
                          href={item.href}
                          aria-current={active === item.key ? "page" : undefined}
                          class={active === item.key ? "text-paper" : "text-paper/60"}
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>
            </header>

            <main class="flex-1 px-5 py-7 sm:px-8 lg:px-12 lg:py-10">
              <div class="mx-auto w-full max-w-6xl">{children}</div>
            </main>

            <footer class="border-t border-line px-5 py-4 sm:px-8 lg:px-12">
              <div class="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 text-[12px] text-muted">
                <p>{SITE_NAME} · {new Date().getFullYear()}</p>
                <div class="flex items-center gap-3 lg:hidden">
                  <span class="max-w-[160px] truncate font-mono text-[11px]">{user.email}</span>
                  <form method="post" action="/auth/logout">
                    <button type="submit" class="underline decoration-line underline-offset-2 hover:text-ink">
                      로그아웃
                    </button>
                  </form>
                </div>
                <p class="hidden text-[11px] text-muted lg:block">승인된 사용자 전용</p>
              </div>
            </footer>
          </div>
        </div>
        <div
          id="toast-region"
          aria-live="polite"
          aria-atomic="true"
          class="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:items-end"
        ></div>
      </body>
    </html>
  )}`;
}

export function PageHeader(props: {
  title: string;
  description?: string;
  actions?: Child;
}) {
  return (
    <div class="flex flex-col gap-4 border-b border-ink/15 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 class="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-ink sm:text-[30px]">
          {props.title}
        </h1>
        {props.description ? (
          <p class="mt-2 max-w-xl text-sm leading-6 text-muted">{props.description}</p>
        ) : null}
      </div>
      {props.actions ? <div class="flex shrink-0 items-center gap-2">{props.actions}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: VolunteerStatus }) {
  const meta = STATUS_META[status];
  return (
    <span class="inline-flex items-center gap-1.5 text-[13px] whitespace-nowrap">
      <span class={`size-1.5 rounded-full ${meta.dot}`}></span>
      {meta.label}
    </span>
  );
}
