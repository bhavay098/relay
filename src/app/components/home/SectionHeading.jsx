export function SectionHeading({ eyebrow, title, body, align = "left" }) {
  const isCentered = align === "center";
  const alignment = isCentered ? "mx-auto flex flex-col items-center text-center" : "";
  const headingClass = isCentered
    ? "mx-auto max-w-3xl text-balance font-[family:var(--font-inter)] text-[clamp(2.2rem,3.5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--color-app-text)]"
    : "max-w-3xl text-balance font-[family:var(--font-inter)] text-[clamp(2.2rem,3.5vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-[var(--color-app-text)]";
  const bodyClass = isCentered
    ? "mx-auto max-w-2xl text-base leading-8 text-[var(--color-app-text-muted)] sm:text-[1.05rem]"
    : "max-w-2xl text-base leading-8 text-[var(--color-app-text-muted)] sm:text-[1.05rem]";

  return (
    <div className={`space-y-4 ${alignment}`}>
      <p className="font-[family:var(--font-inter)] text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--color-app-accent)] sm:text-[13px]">
        {eyebrow}
      </p>
      <h2 className={headingClass}>{title}</h2>
      {body ? <p className={bodyClass}>{body}</p> : null}
    </div>
  );
}
