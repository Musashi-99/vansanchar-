import { useEffect, type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, Inbox, FlaskConical } from 'lucide-react';
import { cn, SEV_STYLE, STATUS_STYLE, label } from '../lib/utils';
import type { Severity } from '../lib/types';

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'amber' | 'soft'; size?: 'sm' | 'md' | 'lg'; loading?: boolean; full?: boolean };
export function Button({ variant = 'primary', size = 'md', loading, full, className, children, disabled, ...p }: BtnProps) {
  const v = {
    primary: 'bg-primary text-primary-fg hover:opacity-90',
    outline: 'border border-line bg-card text-fg hover:bg-secondary',
    ghost: 'text-fg hover:bg-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    amber: 'bg-amber-600 text-white hover:bg-amber-700',
    soft: 'bg-secondary text-fg hover:bg-accent',
  }[variant];
  const s = { sm: 'h-9 px-3 text-sm', md: 'h-11 px-4 text-sm', lg: 'h-12 px-5 text-base' }[size];
  return (
    <button {...p} disabled={disabled || loading}
      className={cn('inline-flex items-center justify-center gap-2 rounded-xl2 font-medium transition active:scale-[.97] disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-w-0', v, s, full && 'w-full', className)}>
      {loading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
      {children}
    </button>
  );
}

export function Card({ children, className, onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  return <div onClick={onClick} className={cn('rounded-xl2 border border-line bg-card p-4 shadow-sm min-w-0', onClick && 'cursor-pointer transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]', className)}>{children}</div>;
}

export function Badge({ children, className }: { children: ReactNode; className?: string }) {
  return <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap', className ?? 'bg-secondary text-fg')}>{children}</span>;
}
export const SevBadge = ({ s }: { s: Severity }) => <Badge className={SEV_STYLE[s]}>{label(s)}</Badge>;
export const StatusBadge = ({ s }: { s: string }) => <Badge className={STATUS_STYLE[s] ?? 'bg-secondary'}>{label(s)}</Badge>;

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', k);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', k); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className={cn('relative flex max-h-[92dvh] w-full flex-col rounded-t-2xl bg-card shadow-2xl animate-fadeup sm:rounded-2xl', wide ? 'sm:max-w-2xl' : 'sm:max-w-md')}>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
          <h2 className="min-w-0 truncate text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 hover:bg-secondary"><X className="h-5 w-5" /></button>
        </div>
        <div className="overflow-y-auto p-4 safe-b">{children}</div>
      </div>
    </div>, document.body);
}

export function Tabs<T extends string>({ tabs, value, onChange, tone = 'green' }: { tabs: { id: T; label: string; badge?: number }[]; value: T; onChange: (v: T) => void; tone?: 'green' | 'amber' }) {
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1" role="tablist">
      {tabs.map((t) => (
        <button key={t.id} role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}
          className={cn('shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition', value === t.id ? (tone === 'amber' ? 'border-amber-600 bg-amber-600 text-white' : 'border-primary bg-primary text-primary-fg') : 'border-line bg-card hover:bg-secondary')}>
          {t.label}{t.badge ? <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-[11px] text-white">{t.badge}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Field({ label: l, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1 block text-sm font-medium">{l}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-danger" role="alert">{error}</span>}
    </label>
  );
}
const inputCls = 'h-11 w-full min-w-0 rounded-xl2 border border-line bg-input px-3 text-fg placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-ring';
export const Input = (p: InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const Select = (p: SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, 'pr-8', p.className)} />;
export const Textarea = (p: TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(inputCls, 'h-auto min-h-[88px] py-2', p.className)} />;

export function Switch({ checked, onChange, label: l, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0"><div className="text-sm font-medium">{l}</div>{hint && <div className="text-xs text-muted">{hint}</div>}</div>
      <button role="switch" aria-checked={checked} aria-label={l} onClick={() => onChange(!checked)}
        className={cn('relative h-7 w-12 shrink-0 rounded-full transition', checked ? 'bg-primary' : 'bg-accent')}>
        <span className={cn('absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
      </button>
    </div>
  );
}

export function Progress({ value, className }: { value: number; className?: string }) {
  return <div className={cn('h-2 w-full overflow-hidden rounded-full bg-accent', className)}><div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} /></div>;
}

export function Empty({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl2 border border-dashed border-line px-4 py-10 text-center">
      <Inbox className="h-10 w-10 text-muted" /><div className="font-medium">{title}</div>
      {hint && <div className="max-w-xs text-sm text-muted">{hint}</div>}{action}
    </div>
  );
}

export function Stat({ icon, label: l, value, tone = 'text-primary', sub }: { icon?: ReactNode; label: string; value: ReactNode; tone?: string; sub?: string }) {
  return (
    <Card className="!p-3">
      <div className="flex items-center gap-2 text-xs text-muted">{icon}<span className="min-w-0 truncate">{l}</span></div>
      <div className={cn('mt-1 text-2xl font-bold leading-tight', tone)}>{value}</div>
      {sub && <div className="text-[11px] text-muted">{sub}</div>}
    </Card>
  );
}

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="mb-3 mt-6 flex items-center justify-between gap-2"><h2 className="min-w-0 text-lg font-semibold">{children}</h2>{action}</div>;
}

/** Clear separation of demo data from production data */
export function DemoNote({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-xl2 border border-purple-300/60 bg-purple-50 p-3 text-xs text-purple-900 dark:border-purple-400/30 dark:bg-purple-950/40 dark:text-purple-200">
      <FlaskConical className="mt-0.5 h-4 w-4 shrink-0" /><div className="min-w-0">{children ?? 'Demonstration data: no live backend is connected.'}</div>
    </div>
  );
}

export function Spinner() { return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>; }
