import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from 'react';
import { countUp } from './motion';
import { Search, SlidersHorizontal, Check, ChevronDown, Bell, ChevronRight, Home } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn, fmtDate } from '../lib/utils';
import { useStore } from '../lib/store';

export const img = (n: string) => `/img/${n}`;

/** Quad-rotor drone glyph (lucide has none). */
export function DroneIcon({ className, size = 24 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="9" y="9.5" width="6" height="5" rx="1.5" /><circle cx="12" cy="12" r=".6" fill="currentColor" />
      <path d="M9 10 5.5 6.5M15 10l3.5-3.5M9 14l-3.5 3.5M15 14l3.5 3.5" />
      <ellipse cx="4.5" cy="5.5" rx="2.6" ry="1" /><ellipse cx="19.5" cy="5.5" rx="2.6" ry="1" /><ellipse cx="4.5" cy="18.5" rx="2.6" ry="1" /><ellipse cx="19.5" cy="18.5" rx="2.6" ry="1" />
    </svg>
  );
}

export function Panel({ children, className, tone, style }: { children: ReactNode; className?: string; tone?: 'red' | 'amber' | 'hl'; style?: CSSProperties }) {
  return <div style={style} className={cn('nf-panel', tone, className)}>{children}</div>;
}

export function PTitle({ icon, children, right, sub }: { icon?: ReactNode; children: ReactNode; right?: ReactNode; sub?: ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="flex min-w-0 items-center gap-2 text-[15px] font-bold">
        {icon && <span className="shrink-0 text-[var(--nf-lime)]">{icon}</span>}
        <span className="min-w-0 truncate">{children}</span>{sub && <span className="font-normal text-[var(--muted)]">{sub}</span>}
      </h3>
      {right && <div className="shrink-0 text-xs">{right}</div>}
    </div>
  );
}

export const ViewAll = ({ to, children = 'View All' }: { to?: string; children?: ReactNode }) => {
  const c = <span className="inline-flex items-center gap-1 font-semibold text-[var(--nf-lime)] underline-offset-2 hover:underline">{children} <span aria-hidden>→</span></span>;
  return to ? <Link to={to}>{c}</Link> : c;
};

const KTONE = { green: 'text-[var(--nf-lime)]', red: 'text-[#ff5a5a]', amber: 'text-[var(--nf-amber)]', yellow: 'text-[var(--nf-yellow)]', blue: 'text-[#4aa8ff]', purple: 'text-[#b27cff]' } as const;
function Num({ n }: { n: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => (ref.current ? countUp(ref.current, n) : undefined), [n]);
  return <span ref={ref}>{n.toLocaleString('en-IN')}</span>;
}
export function Kpi({ icon, value, label, delta, tone, color = 'green', sub }: { icon: ReactNode; value: ReactNode; label: ReactNode; delta?: string; tone?: 'red' | 'amber'; color?: keyof typeof KTONE; sub?: ReactNode }) {
  const down = delta?.startsWith('▼');
  return (
    <Panel tone={tone} className="flex min-w-0 items-center gap-3 px-3.5 py-3">
      <span className={cn('shrink-0 [&>svg]:h-9 [&>svg]:w-9', KTONE[tone === 'red' ? 'red' : color])}>{icon}</span>
      <div className="min-w-0 leading-tight">
        <div className="text-[26px] font-bold leading-none">{typeof value === 'number' ? <Num n={value} /> : value}</div>
        <div className="mt-0.5 text-[13px]">{label}</div>
        {sub && <div className="text-[12px] text-[var(--muted)]">{sub}</div>}
        {delta && <div className={cn('text-[12.5px] font-semibold', down ? 'text-[#ff6a6a]' : 'text-[#58e05b]')}>{delta.startsWith('▲') || down ? delta : `▲ ${delta}`}</div>}
      </div>
    </Panel>
  );
}
export const KpiRow = ({ children, cols = 6 }: { children: ReactNode; cols?: 4 | 5 | 6 | 7 }) => (
  <div className={cn('grid gap-3 grid-cols-2 sm:grid-cols-3', { 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6', 7: 'lg:grid-cols-7' }[cols])}>{children}</div>
);

export function Pills<T extends string>({ items, value, onChange, className }: { items: { id: T; label: ReactNode }[]; value: T; onChange?: (v: T) => void; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)} role="tablist">
      {items.map((i) => <button key={i.id} role="tab" aria-selected={value === i.id} onClick={() => onChange?.(i.id)} className={cn('nf-pill', value === i.id && 'on')}>{i.label}</button>)}
    </div>
  );
}
export const SearchBox = ({ placeholder, value, onChange, className }: { placeholder: string; value?: string; onChange?: (v: string) => void; className?: string }) => (
  <label className={cn('nf-pill !rounded-xl !py-2 min-w-0 flex-1 sm:max-w-[420px]', className)}><Search className="h-4 w-4 shrink-0 text-[var(--muted)]" />
    <input value={value} onChange={(e) => onChange?.(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--muted)]" style={{ fontSize: 14 }} /></label>
);
/** Dropdown menu button. Pass options + onChange to drive data; without options it still opens a menu (range / sort presets). */
export function Select2({ children, icon, className, options, value, onChange }: { children?: ReactNode; icon?: ReactNode; className?: string; options?: string[]; value?: string; onChange?: (v: string) => void }) {
  const label = typeof children === 'string' ? children : '';
  const opts = options ?? (/Days|Week|Month/i.test(label) ? ['Last 7 Days', 'Last 30 Days', 'Last 90 Days'] : /Latest|Newest|Sort/i.test(label) ? ['Latest', 'Oldest', 'Highest severity'] : label ? [label] : []);
  const [open, setOpen] = useState(false);
  const [local, setLocal] = useState<string | undefined>();
  const cur = value ?? local ?? (opts.includes(label) ? label : opts[0]);
  return (
    <span className="relative inline-block">
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className={cn('nf-pill !rounded-xl !py-2', className)}>{icon}{opts.length ? cur : children}<ChevronDown className="h-4 w-4" /></button>
      {open && <>
        <span className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
        <ul role="listbox" className="absolute right-0 z-40 mt-1 min-w-full overflow-hidden rounded-xl border border-[var(--nf-line)] bg-[#0b2113] py-1 text-sm shadow-xl">
          {opts.map((o) => <li key={o}><button type="button" role="option" aria-selected={o === cur} onClick={() => { setLocal(o); onChange?.(o); setOpen(false); }} className={cn('block w-full whitespace-nowrap px-3 py-1.5 text-left hover:bg-white/10', o === cur && 'font-bold text-[var(--nf-lime)]')}>{o}</button></li>)}
        </ul></>}
    </span>
  );
}
export function FilterBtn({ options, value, onChange }: { options?: string[]; value?: string; onChange?: (v: string) => void }) {
  return <Select2 icon={<SlidersHorizontal className="h-4 w-4" />} options={options ?? ['All', 'High severity', 'Medium severity', 'Low severity']} value={value} onChange={onChange}>Filters</Select2>;
}

export function Tag({ c = 'green', children, className }: { c?: 'high' | 'med' | 'low' | 'green' | 'blue' | 'gray' | 'pend' | 'red' | 'amber' | 'yellow'; children: ReactNode; className?: string }) {
  return <span className={cn('nf-tag', c, className)}>{children}</span>;
}
export const Dot = ({ c }: { c: string }) => <span className="nf-dot" style={{ background: c }} />;

export function Check2({ on, className }: { on?: boolean; className?: string }) {
  return <span className={cn('inline-flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border', on ? 'border-[var(--nf-lime)] bg-[var(--nf-lime)] text-black' : 'border-[var(--nf-line)] bg-[#0a2111]', className)}>{on && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}</span>;
}

export function Meter({ pct, color = 'var(--nf-lime)', h = 8, className }: { pct: number; color?: string; h?: number; className?: string }) {
  return <div className={cn('overflow-hidden rounded-full bg-white/10', className)} style={{ height: h }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>;
}

/** Donut: segments in %, drawn clockwise from 12 o'clock. */
export function Donut({ seg, size = 150, stroke = 20, children }: { seg: { v: number; c: string }[]; size?: number; stroke?: number; children?: ReactNode }) {
  const r = (size - stroke) / 2, C = 2 * Math.PI * r, tot = seg.reduce((a, s) => a + s.v, 0);
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.08)" strokeWidth={stroke} />
        {seg.map((s, i) => { const len = (s.v / tot) * C; const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.c} strokeWidth={stroke} strokeDasharray={`${Math.max(len - 2, 0)} ${C}`} strokeDashoffset={-acc} />; acc += len; return el; })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight">{children}</div>
    </div>
  );
}

export function Avatar({ src, size = 40, ring, className }: { src: string; size?: number; ring?: boolean; className?: string }) {
  return <img src={img(src)} alt="" width={size} height={size} style={{ width: size, height: size }} className={cn('shrink-0 rounded-full object-cover', ring && 'ring-2 ring-[var(--nf-lime)]', className)} />;
}

function BannerTools() {
  const loc = useLocation();
  const nav = useNavigate();
  const user = useStore((s) => s.user);
  const notifs = useStore((s) => s.notifs);
  const markRead = useStore((s) => s.markRead);
  const logout = useStore((s) => s.logout);
  const [open, setOpen] = useState<'n' | 'u' | null>(null);
  const audience = loc.pathname.startsWith('/app') ? 'citizen' : 'official';
  const list = notifs.filter((n) => n.recipient === audience && !n.dismissed).slice(0, 6);
  const unread = list.filter((n) => !n.read).length;
  const initials = (user?.name ?? 'VS').split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <span className="relative flex items-center gap-2">
      <button type="button" aria-label="Notifications" onClick={() => { setOpen(open === 'n' ? null : 'n'); list.filter((n) => !n.read).forEach((n) => markRead(n.id)); }} className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nf-line)] bg-black/40"><Bell className="h-5 w-5" />{unread > 0 && <i className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />}</button>
      <button type="button" aria-label="Account" onClick={() => setOpen(open === 'u' ? null : 'u')} className="flex h-10 items-center gap-1 rounded-full border border-[var(--nf-line)] bg-black/40 px-1.5"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a5a1c] text-[11px] font-bold">{initials}</span><ChevronDown className="h-4 w-4" /></button>
      {open && <button type="button" aria-label="Close menu" className="fixed inset-0 z-30 cursor-default" onClick={() => setOpen(null)} />}
      {open === 'n' && <div className="absolute right-0 top-12 z-40 w-[min(92vw,320px)] rounded-xl border border-[var(--nf-line)] bg-[#0b2113] p-2 text-left text-sm shadow-xl">{list.length === 0 && <p className="p-3 text-[var(--muted)]">No notifications.</p>}{list.map((n) => <button type="button" key={n.id} onClick={() => { setOpen(null); if (n.link && (audience === 'citizen' ? n.link.startsWith('/app') : true)) nav(n.link); }} className="block w-full rounded-lg px-2 py-2 text-left hover:bg-white/10"><b className="block truncate">{n.title}</b><span className="line-clamp-2 text-xs text-[#cfe3c4]">{n.body}</span><span className="text-[11px] text-[var(--muted)]">{fmtDate(n.createdAt)}</span></button>)}</div>}
      {open === 'u' && <div className="absolute right-0 top-12 z-40 w-56 rounded-xl border border-[var(--nf-line)] bg-[#0b2113] p-2 text-left text-sm shadow-xl"><div className="px-2 py-1.5"><b className="block truncate">{user?.name ?? 'Signed out'}</b><span className="text-xs capitalize text-[var(--muted)]">{(user?.designation ?? user?.role ?? '').replace(/_/g, ' ')}</span></div><button type="button" className="mt-1 w-full rounded-lg px-2 py-2 text-left hover:bg-white/10" onClick={() => { logout(); setOpen(null); nav('/login'); }}>Log out</button></div>}
    </span>
  );
}

export function Banner({ title, accent, sub, icon, crumbs, bg = 'banner-sunset.jpg', actions }: { title: string; accent?: string; sub: string; icon: ReactNode; crumbs?: string[]; bg?: string; actions?: ReactNode }) {
  return (
    <header className="nf-banner -mx-3 -mt-3 mb-3 px-4 pb-4 pt-3 sm:-mx-4 sm:-mt-4 sm:px-6" style={{ ['--banner' as string]: `url(/img/${bg})` }}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <nav className="flex min-w-0 items-center gap-2 text-sm text-[#d9ead0]" aria-label="Breadcrumb">
          <Home className="h-4 w-4 shrink-0" />{(crumbs ?? []).map((c, i) => <span key={i} className="flex min-w-0 items-center gap-2 truncate"><ChevronRight className="h-3 w-3 shrink-0 opacity-60" />{c}</span>)}
        </nav>
        <div className="flex shrink-0 items-center gap-2">
          {actions}
          <BannerTools />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="shrink-0 text-[var(--nf-lime)] [&>svg]:h-10 [&>svg]:w-10">{icon}</span>
        <div className="min-w-0">
          <h1 className="nf-title text-[30px] leading-tight sm:text-[38px]">{title}{accent && <> <em>{accent}</em></>}</h1>
          <p className="max-w-[640px] text-[15px] text-[#e4f2dc]">{sub}</p>
        </div>
      </div>
    </header>
  );
}

export function Timeline({ steps }: { steps: { t: string; time?: string; sub?: string; state: 'done' | 'now' | 'todo' }[] }) {
  return (
    <ol className="relative">
      {steps.map((s, i) => (
        <li key={i} className="relative flex gap-3 pb-3 last:pb-0">
          {i < steps.length - 1 && <span className={cn('absolute left-[10px] top-6 h-[calc(100%-14px)] w-px', s.state === 'done' ? 'bg-[var(--nf-lime)]' : 'bg-white/20')} />}
          <span className={cn('z-[1] mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2', s.state === 'done' ? 'border-[#58e05b] bg-[#58e05b] text-black' : s.state === 'now' ? 'border-[var(--nf-yellow)] bg-transparent' : 'border-[#8a9a8a] bg-transparent')}>
            {s.state === 'done' && <Check className="h-3 w-3" strokeWidth={4} />}{s.state === 'now' && <i className="h-2 w-2 rounded-full bg-[var(--nf-yellow)]" />}</span>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2 text-sm"><div className="min-w-0"><div className={s.state === 'todo' ? 'text-[#c8d8c0]' : 'font-medium'}>{s.t}</div>{s.sub && <div className="text-xs text-[var(--muted)]">{s.sub}</div>}</div>
            {s.time && <span className={cn('shrink-0 text-[13px]', s.state === 'todo' ? 'text-[var(--muted)]' : '')}>{s.time}</span>}</div>
        </li>
      ))}
    </ol>
  );
}

/** Simple responsive scroll-x table wrapper */
export const TableWrap = ({ children }: { children: ReactNode }) => <div className="nf-scroll overflow-x-auto"><div className="min-w-[640px]">{children}</div></div>;

/** Key/value rows used in detail panels */
export const KV = ({ k, v }: { k: string; v: ReactNode }) => (
  <div className="grid grid-cols-[110px_1fr] items-start gap-2 border-b border-white/5 py-1 text-[13px] last:border-0"><span className="text-[#bcd2b0]">{k}</span><span className="font-medium">{v}</span></div>
);

export const TabsLine = ({ items, value, onChange }: { items: string[]; value: string; onChange?: (v: string) => void }) => (
  <div className="flex gap-5 border-b border-white/10 text-sm">
    {items.map((i) => <button key={i} onClick={() => onChange?.(i)} className={cn('-mb-px border-b-2 pb-1.5 pt-1', value === i ? 'border-[var(--nf-lime)] font-semibold text-[var(--nf-lime)]' : 'border-transparent text-[#d4e4cc]')}>{i}</button>)}
  </div>
);

export const Chip = ({ children, icon, className }: { children: ReactNode; icon?: ReactNode; className?: string }) => <span className={cn('nf-pill', className)}>{icon}{children}</span>;
