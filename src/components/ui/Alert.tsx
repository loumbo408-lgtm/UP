import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, { wrap: string; Icon: typeof Info }> = {
  info: { wrap: 'border-status-info/30 bg-status-info/10 text-status-info', Icon: Info },
  success: {
    wrap: 'border-status-success/30 bg-status-success/10 text-status-success',
    Icon: CheckCircle2,
  },
  warning: {
    wrap: 'border-status-warning/30 bg-status-warning/10 text-status-warning',
    Icon: AlertTriangle,
  },
  danger: {
    wrap: 'border-status-danger/30 bg-status-danger/10 text-status-danger',
    Icon: AlertTriangle,
  },
};

export function Alert({
  tone = 'info',
  children,
}: {
  tone?: Tone;
  children: React.ReactNode;
}) {
  const { wrap, Icon } = TONES[tone];
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${wrap}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div className="leading-relaxed">{children}</div>
    </div>
  );
}
