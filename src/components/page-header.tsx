export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="px-5 pb-4 pt-8">
      {eyebrow ? (
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-up-700">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="font-display text-2xl font-semibold text-[#1D0F24]">
        {title}
      </h1>
      {subtitle ? (
        <p className="mt-1 text-sm text-[#6B5D73]">{subtitle}</p>
      ) : null}
    </header>
  );
}
