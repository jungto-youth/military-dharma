import { html } from "hono/html";
import { SITE_NAME, SITE_TAGLINE } from "../lib/site";
import { BrandMark } from "./brand";

export function NoticePage(props: {
  title: string;
  description: string;
  code?: string;
}) {
  return html`<!DOCTYPE html>${(
    <html lang="ko" class="h-full">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <title>{props.title} · {SITE_NAME}</title>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap"
        />
        <link rel="stylesheet" href="/assets/app.css" />
      </head>
      <body class="min-h-full bg-paper text-ink antialiased">
        <main class="mx-auto flex min-h-screen w-full max-w-xl flex-col justify-center px-5 py-12 sm:px-8">
          <div class="flex items-center gap-3">
            <span class="grid size-10 place-items-center border border-olive/40 text-olive">
              <BrandMark class="size-7" tone="light" />
            </span>
            <div>
              <p class="text-[15px] font-semibold tracking-tight">{SITE_NAME}</p>
              <p class="mt-0.5 text-[11px] text-muted">{SITE_TAGLINE}</p>
            </div>
          </div>

          <div class="mt-10 border-t-2 border-ink pt-6">
            {props.code ? (
              <p class="font-mono text-[12px] text-muted">{props.code}</p>
            ) : null}
            <h1 class="mt-1 text-[24px] font-semibold tracking-[-0.02em]">{props.title}</h1>
            <p class="mt-3 text-sm leading-6 text-muted">{props.description}</p>
            <a href="/" class="btn btn-primary mt-7">
              편성 현황으로
            </a>
          </div>
        </main>
      </body>
    </html>
  )}`;
}
