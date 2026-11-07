import { html } from "hono/html";
import { SITE_NAME, SITE_TAGLINE } from "../lib/site";
import { BrandMark } from "./brand";

type Props = {
  configured: boolean;
  devLogin: boolean;
  error?: string;
};

export function LoginPage({ configured, devLogin, error }: Props) {
  return html`<!DOCTYPE html>${(
    <html lang="ko" class="h-full">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content="light" />
        <meta name="robots" content="noindex, nofollow" />
        <title>로그인 · {SITE_NAME}</title>
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
        <div class="grid min-h-screen lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <section class="login-grid relative hidden flex-col justify-between bg-olive-deep p-10 text-paper lg:flex xl:p-14">
            <div class="flex items-center gap-3">
              <span class="grid size-10 place-items-center border border-brass/70 text-brass">
                <BrandMark class="size-7" />
              </span>
              <div>
                <p class="text-[15px] font-semibold tracking-tight">{SITE_NAME}</p>
                <p class="mt-0.5 text-[11px] text-paper/55">{SITE_TAGLINE}</p>
              </div>
            </div>

            <div class="max-w-md">
              <div class="mb-6 h-px w-16 bg-brass/70"></div>
              <h1 class="text-[40px] leading-[1.18] font-semibold tracking-[-0.03em] xl:text-[46px]">
                바라지 운영을
                <br />
                한 곳에서
              </h1>
              <p class="mt-5 max-w-sm text-sm leading-7 text-paper/65">
                신청 접수와 일정별 정원, 봉사자 명부를 함께 관리합니다. 접수된
                신청을 확인하고 필요한 정보를 빠르게 찾으세요.
              </p>
            </div>

            <p class="text-[12px] text-paper/60">승인된 사용자만 이용할 수 있습니다.</p>
          </section>

          <section class="flex items-center justify-center px-5 py-10 sm:px-10">
            <div class="w-full max-w-sm">
              <div class="mb-8 flex items-center gap-2.5 lg:hidden">
                <span class="grid size-9 place-items-center border border-olive/40 text-olive">
                  <BrandMark class="size-6" tone="light" />
                </span>
                <span class="text-[15px] font-semibold tracking-tight">{SITE_NAME}</span>
              </div>

              <h2 class="text-[22px] font-semibold tracking-[-0.02em]">로그인</h2>
              <p class="mt-2 text-sm leading-6 text-muted">
                Google 계정으로 인증한 뒤 신청 접수와 명부를 관리할 수 있습니다.
              </p>

              {error ? (
                <div
                  role="alert"
                  class="mt-5 border-l-2 border-alert bg-alert/5 px-3.5 py-2.5 text-[13px] leading-5 text-alert"
                >
                  {error}
                </div>
              ) : null}

              {configured ? (
                <a href="/auth/google" class="btn-google mt-6">
                  <GoogleIcon />
                  Google 계정으로 계속
                </a>
              ) : (
                <div class="mt-6 border border-line bg-paper-soft p-4 text-[13px] leading-6 text-ink-soft">
                  <p class="font-medium text-ink">Google OAuth 설정이 필요합니다.</p>
                  <p class="mt-2">
                    <code class="font-mono text-[12px]">.dev.vars.example</code>을{" "}
                    <code class="font-mono text-[12px]">.dev.vars</code>로 복사하고
                    클라이언트 ID와 시크릿을 채우세요.
                  </p>
                  <p class="mt-2 text-[12px] text-muted">
                    리디렉션 URI: <span class="font-mono">/auth/google/callback</span>
                  </p>
                </div>
              )}

              {devLogin ? (
                <div class="mt-4 border border-dashed border-line px-3.5 py-2.5 text-[12px] leading-5 text-muted">
                  개발용 로그인이 켜져 있습니다.{" "}
                  <a
                    href="/auth/dev"
                    class="font-medium text-ink underline decoration-line underline-offset-2"
                  >
                    개발 계정으로 계속
                  </a>
                </div>
              ) : null}

              <p class="mt-8 text-[11px] leading-5 text-muted">
                접근 권한이 없다면 운영 담당자에게 이메일 등록을 요청하세요.
              </p>
            </div>
          </section>
        </div>
      </body>
    </html>
  )}`;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 18 18" class="size-4.5" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}
