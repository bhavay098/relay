export function CardGrid({ items }) {
  return (
    <div className="mt-12 grid gap-4 md:grid-cols-3">
      {items.map((item) => (
        <article
          key={item.title}
          className="home-panel home-card-hover rounded-[28px] p-5"
        >
          <h3 className="font-[family:var(--font-inter)] text-[18px] font-semibold leading-tight text-[var(--color-app-text)]">
            {item.title}
          </h3>
          <p className="mt-3 text-sm leading-7 text-[var(--color-app-text-muted)]">
            {item.body}
          </p>
        </article>
      ))}
    </div>
  );
}
