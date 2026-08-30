import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'gold' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  gold: 'bg-gold text-night font-semibold hover:bg-gold-soft active:bg-gold-deep shadow-gold',
  outline: 'border border-gold/40 text-gold hover:bg-gold-dim active:bg-gold/20',
  ghost: 'text-ink-muted hover:text-ink hover:bg-night-raised',
  danger: 'border border-status-danger/40 text-status-danger hover:bg-status-danger/10',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm rounded-lg',
  md: 'h-12 px-5 text-[15px] rounded-xl',
  lg: 'h-14 px-6 text-base rounded-xl',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'gold', size = 'md', loading = false, fullWidth = false, className = '', children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={[
        'inline-flex items-center justify-center gap-2 transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50',
        VARIANTS[variant],
        SIZES[size],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});
