import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="up-card flex flex-col items-center gap-3 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-dim">
        <Icon className="h-6 w-6 text-gold" aria-hidden />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      <p className="max-w-xs text-sm leading-relaxed text-ink-muted">{description}</p>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
