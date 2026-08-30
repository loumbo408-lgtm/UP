interface BadgeProps {
  children: React.ReactNode;
  /** Classes de teinte, typiquement issues de BOOKING_STATUS_META. */
  tone?: string;
  className?: string;
}

export function Badge({ children, tone, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'text-[11px] font-medium uppercase tracking-wide whitespace-nowrap',
        tone ?? 'bg-night-raised text-ink-muted border-night-border',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  );
}
