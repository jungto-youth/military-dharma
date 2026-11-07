type BrandMarkProps = {
  class?: string;
  /** `dark`(기본)은 짙은 배경, `light`는 밝은 배경에서 중심점을 어둡게 그립니다. */
  tone?: "dark" | "light";
};

/** 사이트 이름과 함께 쓰는 장식용 마크. 낱개로 쓸 때는 `public/logo.svg`를 사용합니다. */
export function BrandMark({ class: className, tone = "dark" }: BrandMarkProps) {
  return (
    <svg viewBox="0 0 96 96" class={className} aria-hidden="true" focusable="false">
      <path d="M48 18 L78 48 L48 78 L18 48 Z" fill="none" stroke="currentColor" stroke-width="5" />
      <circle cx="48" cy="48" r="6.6" class={tone === "light" ? "fill-ink" : "fill-paper"} />
    </svg>
  );
}
