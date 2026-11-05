import { useEffect, useRef, useState } from 'react';
import { useReveal } from './motion';
import { NavLink, Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { Home, FileText, Siren, Truck, MapPin, BarChart3, Trophy, Award, Users, ShieldCheck, Download, Phone, Settings, Megaphone, Database, Server, Brain, Layers, UserCog, KeyRound, ScrollText, Menu, X, Check, LogOut, Map as MapIcon, BookOpen, PawPrint } from 'lucide-react';
import { useStore } from '../lib/store';
import { cn } from '../lib/utils';
import { useBoot } from '../components/Layouts';
import { DroneIcon, img } from './kit';

export function Brand({ portal }: { portal?: string }) {
  return (
    <div className="px-4 pt-4">
      <Link to="/" className="flex items-center gap-2"><img src="/icon.svg" width={42} height={42} alt="" className="rounded-full" />
        <span className="leading-tight"><span className="block text-[22px] font-extrabold tracking-tight">VanSanchar</span><span className="block text-[10.5px] text-[#cfe3c4]">Bridging Communities &amp; Wildlife</span></span></Link>
      {portal && <span className="mx-auto mt-2 block w-fit rounded-full bg-[#2c5b1f] px-4 py-1 text-sm font-medium text-[#d6f59a]">{portal}</span>}
    </div>
  );
}

type Item = { to: string; icon: typeof Home; label: string; badge?: number; sub?: { to: string; label: string }[] };

export const OFFICIAL_NAV: Item[] = [
  { to: '/official/overview', icon: Home, label: 'Dashboard' },
  { to: '/official/reports', icon: FileText, label: 'Incident Reports', badge: 12 },
  { to: '/official/sos', icon: Siren, label: 'SOS Management', badge: 3 },
  { to: '/official/dispatch', icon: Truck, label: 'Dispatch & Response' },
  { to: '/official/hotspot', icon: MapPin, label: 'Hotspot & Patrol Map' },
  { to: '/official/drone', icon: DroneIcon as never, label: 'Drone Patrol' },
  { to: '/official/volunteers', icon: Users, label: 'Volunteers (Van Mitra)' },
  { to: '/official/analytics', icon: BarChart3, label: 'Analytics & Trends', sub: [{ to: '/official/analytics', label: 'Predictive Heatmap' }, { to: '/official/analytics/incidents', label: 'Incident Analytics' }, { to: '/official/analytics/movement', label: 'Wildlife Movement' }, { to: '/official/analytics/models', label: 'Model Insights' }] },
  { to: '/official/leaderboard', icon: Trophy, label: 'Leaderboard' },
  { to: '/official/certificates', icon: Award, label: 'Certificates' },
];
export const OFFICIAL_UTIL: Item[] = [
  { to: '/official/resources', icon: ShieldCheck, label: 'Resources' }, { to: '/official/emergency-contacts', icon: Phone, label: 'Emergency Contacts' },
  { to: '/official/downloads', icon: Download, label: 'Downloads (CSV)' }, { to: '/official/settings', icon: Settings, label: 'Settings' },
];
export const ADMIN_NAV: Item[] = [
  { to: '/admin/dashboard', icon: Home, label: 'Admin Dashboard' }, { to: '/admin/users', icon: Users, label: 'User & Official Accounts' },
  { to: '/admin/roles', icon: KeyRound, label: 'Roles & Permissions' }, { to: '/admin/config', icon: Settings, label: 'System Configuration' },
  { to: '/admin/content', icon: BookOpen, label: 'Content & Species DB' }, { to: '/admin/ai-models', icon: Brain, label: 'AI & Model Management' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports & Analytics' }, { to: '/admin/integrations', icon: DroneIcon as never, label: 'Integrations (Drone / GIS)' },
  { to: '/admin/data', icon: Database, label: 'Data Management' }, { to: '/admin/audit', icon: ShieldCheck, label: 'Security & Audit Logs' },
  { to: '/admin/announcements', icon: Megaphone, label: 'Announcements' }, { to: '/admin/jurisdictions', icon: MapIcon, label: 'Jurisdictions & Teams' },
  { to: '/admin/settings', icon: Settings, label: 'Platform Settings' },
];

function NavList({ items, onNav }: { items: Item[]; onNav?: () => void }) {
  const loc = useLocation();
  const pending = useStore((s) => s.reports.filter((r) => !r.withdrawn && (r.status === 'pending' || r.status === 'under_review')).length);
  const activeSos = useStore((s) => s.sos.filter((x) => !x.cancelled && x.responseStatus !== 'resolved' && x.responseStatus !== 'cancelled').length);
  return (
    <ul className="space-y-0.5">
      {items.map((n) => {
        const open = n.sub && loc.pathname.startsWith(n.to);
        return (
          <li key={n.to + n.label}>
            <NavLink to={n.to} onClick={onNav} end={!!n.sub}
              className={({ isActive }) => cn('flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[14.5px] transition', (isActive || open) ? 'border-[#6fae2a] bg-[#2a5a1c]/80 font-bold text-white shadow-[0_0_14px_rgba(126,211,33,.25)]' : 'border-transparent text-[#e4f2dc] hover:bg-white/5')}>
              <n.icon className="h-[22px] w-[22px] shrink-0 text-[var(--nf-lime)]" size={22} /><span className="min-w-0 flex-1 truncate">{n.label}</span>
              {(() => { const b = n.to.endsWith('/reports') ? pending : n.to.endsWith('/sos') ? activeSos : 0; return b > 0 ? <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#e5242b] px-1.5 text-xs font-bold text-white">{b}</span> : null; })()}
            </NavLink>
            {open && n.sub && (
              <ul className="my-1 ml-3 space-y-0.5 rounded-xl bg-[#17391f]/70 p-1.5">
                {n.sub.map((s) => <li key={s.to}><NavLink to={s.to} end onClick={onNav} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-1.5 text-sm', isActive ? 'bg-[#2a5a1c] font-semibold' : 'text-[#dcebd3]')}><i className="h-1.5 w-1.5 rounded-full bg-[var(--nf-lime)]" />{s.label}</NavLink></li>)}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function Sidebar({ admin, onNav }: { admin?: boolean; onNav?: () => void }) {
  const user = useStore((s) => s.user);
  const logout = useStore((s) => s.logout);
  const nav = useNavigate();
  return (
    <div className="flex h-full flex-col bg-[#071a0e]/85">
      <Brand portal={admin ? 'Admin Portal' : 'Official Portal'} />
      <nav className="nf-scroll mt-4 flex-1 overflow-y-auto px-3 pb-3" aria-label={admin ? 'Admin' : 'Official'}>
        <NavList items={admin ? ADMIN_NAV : OFFICIAL_NAV} onNav={onNav} />
        {!admin && <><div className="my-3 border-t border-white/10" /><NavList items={OFFICIAL_UTIL} onNav={onNav} /></>}
      </nav>
      <button onClick={() => { logout(); nav('/login?role=' + (admin ? 'admin' : 'official')); }} title="Log out" className="mx-3 mb-4 flex items-center gap-3 rounded-2xl border border-[var(--nf-line)] bg-[#12341b] p-3 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2a5a1c] text-sm font-bold">{(user?.name ?? 'VS').split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
        <span className="min-w-0 flex-1 leading-tight"><span className="block truncate font-bold">{user?.name ?? (admin ? 'System Admin' : 'Forest Official')}</span><span className="block truncate text-[11.5px] text-[#cfe3c4]">{user?.designation ?? user?.jurisdiction ?? 'South 24 Parganas'}</span></span>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#58e05b] text-black"><Check className="h-3.5 w-3.5" strokeWidth={4} /></span>
      </button>
    </div>
  );
}

export function SidebarShell({ admin }: { admin?: boolean }) {
  useBoot();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  useReveal(mainRef, loc.pathname);
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [loc.pathname]);
  return (
    <div className="nf min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-white/10 lg:block"><Sidebar admin={admin} /></aside>
      <div className="lg:pl-[260px]">
        <button onClick={() => setMenu(true)} aria-label="Open menu" className="fixed left-3 top-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nf-line)] bg-black/60 lg:hidden"><Menu className="h-5 w-5" /></button>
        <main ref={mainRef} className="mx-auto w-full max-w-[1500px] space-y-3 p-3 pb-16 sm:p-4"><Outlet /></main>
      </div>
      {menu && <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-black/60" onClick={() => setMenu(false)} />
        <div className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] shadow-2xl"><button aria-label="Close menu" onClick={() => setMenu(false)} className="absolute right-2 top-2 z-10 rounded-full p-2"><X className="h-5 w-5" /></button><Sidebar admin={admin} onNav={() => setMenu(false)} /></div></div>}
    </div>
  );
}

/* ---------------- Citizen / public top navigation ---------------- */
export const TOP_NAV = [
  { to: '/app/home', label: 'Home' }, { to: '/app/report', label: 'Report' }, { to: '/app/map', label: 'Map' },
  { to: '/app/education', label: 'Learn' }, { to: '/app/volunteer', label: 'Volunteer' }, { to: '/app/analytics', label: 'Analytics' },
];

export function TopNav({ guest }: { guest?: boolean }) {
  const loc = useLocation();
  const p = loc.pathname;
  const extra = p.startsWith('/app/sos') ? { to: '/app/sos', label: 'SOS', red: true } : p.startsWith('/app/ai-detection') ? { to: '/app/ai-detection', label: 'AI Detect' } : null;
  const items = guest ? [{ to: '/', label: 'Home' }, { to: '/app/report', label: 'Report' }, { to: '/app/map', label: 'Map' }, { to: '/app/education', label: 'Learn' }, { to: '/app/volunteer', label: 'Volunteer' }, { to: '/app/analytics', label: 'Analytics' }] : TOP_NAV;
  const list = extra ? [...items.slice(0, 3), extra, ...items.slice(3)] : items;
  const unread = useStore((s) => s.notifs.filter((n) => n.recipient === 'citizen' && !n.read && !n.dismissed).length);
  const user = useStore((s) => s.user);
  const lang = useStore((s) => s.lang);
  const setLang = useStore((s) => s.setLang);
  const [langOpen, setLangOpen] = useState(false);
  const [mnav, setMnav] = useState(false);
  return (
    <div className="mx-auto flex h-[66px] w-full max-w-[1500px] items-center justify-between gap-3 px-4 sm:px-8">
      <Link to={guest ? '/' : '/app/home'} className="flex shrink-0 items-center gap-2"><img src="/icon.svg" width={44} height={44} alt="" className="rounded-full" />
        <span className="leading-tight"><span className="block text-[22px] font-extrabold tracking-tight">VanSanchar</span><span className="hidden text-[11px] text-[#cfe3c4] sm:block">Bridging Communities &amp; Wildlife</span></span></Link>
      <nav className="hidden items-center gap-9 text-[15.5px] md:flex" aria-label="Primary">
        {list.map((n) => <NavLink key={n.to + n.label} to={n.to} end className={({ isActive }) => cn('relative py-1 font-medium', isActive ? ('red' in n && n.red ? 'text-[#ff4040]' : 'text-[var(--nf-lime)]') : 'text-[#f1f8ec] hover:text-white')}>
          {({ isActive }) => <>{n.label}{isActive && <i className={cn('absolute -bottom-1 left-0 h-0.5 w-full rounded', 'red' in n && n.red ? 'bg-[#ff4040]' : 'bg-[var(--nf-lime)]')} />}</>}</NavLink>)}
      </nav>
      <div className="flex shrink-0 items-center gap-2">
        <span className="relative">
          <button type="button" onClick={() => setLangOpen(!langOpen)} className="nf-pill !rounded-xl !py-1.5" aria-haspopup="listbox" aria-expanded={langOpen}>{(lang || 'en').toUpperCase()} ▾</button>
          {langOpen && <><button type="button" aria-label="Close languages" className="fixed inset-0 z-30 cursor-default" onClick={() => setLangOpen(false)} /><ul role="listbox" className="absolute right-0 z-40 mt-1 max-h-64 w-40 overflow-auto rounded-xl border border-[var(--nf-line)] bg-[#0b2113] py-1 text-sm shadow-xl">{[{ code: 'en', native: 'English' }, { code: 'bn', native: 'বাংলা' }, { code: 'hi', native: 'हिन्दी' }].map((l) => <li key={l.code}><button type="button" onClick={() => { setLang(l.code); setLangOpen(false); }} className={cn('block w-full px-3 py-1.5 text-left hover:bg-white/10', lang === l.code && 'font-bold text-[var(--nf-lime)]')}>{l.native}</button></li>)}</ul></>}
        </span>
        <button type="button" aria-label="Open menu" onClick={() => setMnav(true)} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nf-line)] md:hidden"><Menu className="h-5 w-5" /></button>
        {guest && !user
          ? <Link to="/login" className="nf-btn !px-5">Login / Sign Up</Link>
          : <>
            <Link to="/app/notifications" aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nf-line)] bg-black/30"><BellSvg />{unread > 0 && <i className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-red-500" />}</Link>
            <Link to="/app/profile" aria-label="Profile" className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--nf-line)] bg-black/30"><UserSvg /></Link></>}
      </div>
      {mnav && <div className="fixed inset-0 z-[80] md:hidden"><button type="button" aria-label="Close menu" className="absolute inset-0 bg-black/60" onClick={() => setMnav(false)} /><nav className="absolute inset-y-0 right-0 w-[min(84vw,320px)] space-y-1 bg-[#071a0e] p-4 pt-14">{list.map((n) => <NavLink key={n.to + n.label} to={n.to} onClick={() => setMnav(false)} className="block rounded-xl px-3 py-3 text-lg hover:bg-white/5">{n.label}</NavLink>)}{guest && <Link to="/login" onClick={() => setMnav(false)} className="nf-btn mt-3 w-full">Login / Sign Up</Link>}</nav></div>}
    </div>
  );
}
const BellSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>;
const UserSvg = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0z" /></svg>;
export { LogOut, Layers, UserCog, ScrollText, Server };
