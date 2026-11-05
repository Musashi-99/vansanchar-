import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NavLink, Outlet, useLocation, useNavigate, Navigate, Link } from 'react-router-dom';
import { Home, Map as MapIcon, Plus, BarChart3, GraduationCap, User, Bell, Menu, WifiOff, Sun, Moon, FileText, ScanSearch, TrendingUp, Award, Users, Bug, Bot, BookOpen, Shield, HelpCircle, Lock, ScrollText, Download, LogOut, LayoutDashboard, Siren, Plane, Trophy, BadgeCheck, Send, FileBarChart, Settings, Globe, Building2, Languages, FlaskConical, Leaf, Stethoscope, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import { useReveal } from '../neon/motion';
import { toast } from 'sonner';
import { useStore } from '../lib/store';
import { useUI, useOnline, useInstallPrompt } from '../lib/hooks';
import { useT, LANGS } from '../lib/i18n';
import { cn } from '../lib/utils';
import { Modal, Button, Select, Switch } from './ui';
import ReportForm from './ReportForm';
import { SOSButton, SOSFlow } from './SOS';
import type { Role } from '../lib/types';
import { TopNav } from '../neon/Shells';

export function Logo({ size = 36, text = true, light }: { size?: number; text?: boolean; light?: boolean }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <img src="/icon.svg" width={size} height={size} alt="" className="shrink-0 rounded-xl" />
      {text && <span className="min-w-0"><span className={cn('block truncate text-lg font-extrabold leading-tight tracking-tight', light ? 'text-white' : 'text-primary')}>VanSanchar</span></span>}
    </span>
  );
}

export function useBoot() {
  const theme = useStore((s) => s.theme);
  const { rtl, lang } = useT();
  const online = useOnline();
  const user = useStore((s) => s.user);
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); document.querySelector('meta[name=theme-color]')?.setAttribute('content', theme === 'dark' ? '#132215' : '#2D5016'); }, [theme]);
  useEffect(() => { document.documentElement.dir = rtl ? 'rtl' : 'ltr'; document.documentElement.lang = lang === 'raj' ? 'hi' : lang; }, [rtl, lang]);
  useEffect(() => { useStore.getState().refreshPending(); }, [user?.uid]);
  // auto sync on reconnect / on resume
  useEffect(() => {
    const run = () => { if (useStore.getState().isOnline()) useStore.getState().syncNow().then((n) => n && toast.success(`${n} offline item(s) synced`)); };
    if (online) run();
    const vis = () => document.visibilityState === 'visible' && run();
    document.addEventListener('visibilitychange', vis);
    return () => document.removeEventListener('visibilitychange', vis);
  }, [online]);
}

export function ThemeLangControls() {
  const { theme, setTheme, lang, setLang } = useStore();
  return (
    <div className="space-y-3">
      <Switch label="Dark mode" checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
      <label className="block text-sm font-medium"><span className="mb-1 flex items-center gap-1"><Languages className="h-4 w-4" />Language</span>
        <Select value={lang} onChange={(e) => setLang(e.target.value)}>{LANGS.map((l) => <option key={l.code} value={l.code}>{l.native} ({l.name})</option>)}</Select>
      </label>
      {lang !== 'en' && lang !== 'bn' && lang !== 'hi' && <p className="text-xs text-muted">Demo: this language shows translated navigation; other text falls back to English. Medical and safety text is not machine-translated.</p>}
    </div>
  );
}

function OfflineBar() {
  const online = useOnline();
  const pending = useStore((s) => s.pendingCount);
  const syncNow = useStore((s) => s.syncNow);
  const [busy, setBusy] = useState(false);
  if (online && !pending) return null;
  return (
    <div className={cn('flex items-center justify-between gap-2 px-4 py-2 text-xs sm:text-sm', online ? 'bg-blue-600 text-white' : 'bg-amber-500 text-black')}>
      <span className="flex min-w-0 items-center gap-2"><WifiOff className="h-4 w-4 shrink-0" /><span className="min-w-0">{online ? `${pending} item(s) waiting to sync` : `Offline${pending ? ` · ${pending} saved on device` : ''} · SOS and reports are saved locally`}</span></span>
      {online && <button disabled={busy} onClick={async () => { setBusy(true); const n = await syncNow(); setBusy(false); toast.success(`${n} item(s) synced`); }} className="shrink-0 rounded-full bg-white/20 px-3 py-1 font-medium">Sync now</button>}
    </div>
  );
}

const MORE = [
  { to: '/app/reports', icon: FileText, label: 'My Reports' }, { to: '/app/ai-detection', icon: ScanSearch, label: 'AI Species Detection' },
  { to: '/app/predictions', icon: TrendingUp, label: 'Predictive Heatmap' }, { to: '/app/achievements', icon: Award, label: 'Achievements' },
  { to: '/app/volunteer', icon: Users, label: 'Van Mitra Volunteers' }, { to: '/app/sarpa', icon: Bug, label: 'SARPA Snake Help' },
  { to: '/app/assistant', icon: Bot, label: 'AI Assistant' }, { to: '/app/offline-guides', icon: BookOpen, label: 'Offline Guides' },
  { to: '/app/notifications', icon: Bell, label: 'Notifications' }, { to: '/help', icon: HelpCircle, label: 'Help' },
  { to: '/privacy', icon: Lock, label: 'Privacy' }, { to: '/terms', icon: ScrollText, label: 'Terms' },
];

function MoreMenu() {
  const open = useUI((s) => s.moreOpen);
  const close = () => useUI.getState().set({ moreOpen: false });
  const logout = useStore((s) => s.logout);
  const nav = useNavigate();
  const { canInstall, install } = useInstallPrompt();
  return (
    <Modal open={open} onClose={close} title="More">
      <div className="grid grid-cols-2 gap-2">
        {MORE.map((m) => (
          <Link key={m.to} to={m.to} onClick={close} className="flex min-w-0 items-center gap-2 rounded-xl2 border border-line bg-card p-3 text-sm font-medium hover:bg-secondary">
            <m.icon className="h-5 w-5 shrink-0 text-primary" /><span className="min-w-0 break-words">{m.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-4 space-y-3 rounded-xl2 border border-line p-3"><ThemeLangControls /></div>
      <div className="mt-3 space-y-2">
        {canInstall && <Button full variant="outline" onClick={install}><Download className="h-4 w-4" />Install app</Button>}
        <Button full variant="soft" onClick={() => { close(); nav('/official/login'); }}><Shield className="h-4 w-4" />Forest Official Portal</Button>
        <Button full variant="outline" onClick={() => { logout(); close(); nav('/'); }}><LogOut className="h-4 w-4" />Log out</Button>
      </div>
    </Modal>
  );
}

const OFFICIAL_ROLES: Role[] = ['forest_guard', 'range_officer', 'deputy_ranger', 'dfo', 'platform_admin'];
export function homeFor(role: Role) {
  if (role === 'platform_admin') return '/admin/dashboard';
  if (OFFICIAL_ROLES.includes(role)) return '/official/overview';
  return '/app/home';
}

export function RequireAuth({ roles, children }: { roles: 'citizen' | 'official' | 'admin'; children: ReactNode }) {
  const user = useStore((s) => s.user);
  const loc = useLocation();
  if (!user) return <Navigate to={`/login?role=${roles}`} state={{ from: loc.pathname }} replace />;
  const isOff = OFFICIAL_ROLES.includes(user.role);
  const ok = roles === 'citizen' ? !isOff : roles === 'admin' ? user.role === 'platform_admin' : isOff;
  if (!ok) return <Unauthorized />;
  return <>{children}</>;
}
export function Unauthorized() {
  return (
    <div className="mesh flex min-h-dvh flex-col items-center justify-center gap-3 p-6 text-center">
      <Lock className="h-12 w-12 text-danger" /><h1 className="text-xl font-bold">Not authorised</h1>
      <p className="max-w-xs text-sm text-muted">Your account role does not have access to this area.</p>
      <Link to="/" className="rounded-xl2 bg-primary px-4 py-2 text-primary-fg">Go to start</Link>
    </div>
  );
}

const NAV = [
  { to: '/app/home', icon: Home, key: 'nav.home' }, { to: '/app/map', icon: MapIcon, key: 'nav.map' }, { to: 'report', icon: Plus, key: 'nav.report' },
  { to: '/app/analytics', icon: BarChart3, key: 'nav.analytics' }, { to: '/app/education', icon: GraduationCap, key: 'nav.education' }, { to: '/app/profile', icon: User, key: 'nav.profile' },
];

export function CitizenLayout() {
  useBoot();
  const { t } = useT();
  const loc = useLocation();
  const nav = useNavigate();
  const unread = useStore((s) => s.notifs.filter((n) => n.recipient === 'citizen' && !n.read && !n.dismissed).length);
  const set = useUI((s) => s.set);
  useEffect(() => {
    const a = new URLSearchParams(loc.search).get('action');
    if (a === 'report') set({ reportOpen: true }); if (a === 'sos') set({ sosOpen: true });
    if (a) nav(loc.pathname, { replace: true });
  }, [loc.search]); // eslint-disable-line
  useEffect(() => { window.scrollTo(0, 0); }, [loc.pathname]);

  const hideSOS = loc.pathname.startsWith('/app/sos');
  const mainRef = useRef<HTMLElement>(null);
  useReveal(mainRef, loc.pathname);
  const neon = ['/app/home', '/app/report', '/app/map', '/app/sos', '/app/ai-detection'].some((p) => loc.pathname.startsWith(p));
  return (
    <div className="nf min-h-dvh">
      <header className="sticky top-0 z-[1000] border-b border-white/10 bg-[#06150b]/90 backdrop-blur safe-t">
        <TopNav />
        <OfflineBar />
      </header>
      <main ref={mainRef} className={cn('mx-auto w-full pb-28 md:pb-10', neon ? 'max-w-none px-0 pt-0' : 'max-w-4xl px-4 pt-4')}>
        <motion.div key={loc.pathname} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}><Outlet /></motion.div>
      </main>
      {!hideSOS && <div className={neon ? 'md:hidden' : ''}><SOSButton /></div>}
      <nav className="fixed inset-x-0 bottom-0 z-[1050] border-t border-line bg-card/95 backdrop-blur safe-b md:hidden" aria-label="Primary">
        <ul className="mx-auto grid max-w-4xl grid-cols-6 px-1">
          {NAV.map((n) => (
            <li key={n.to} className="min-w-0">
              {n.to === 'report' ? (
                <button onClick={() => nav('/app/report')} className="-mt-5 flex w-full flex-col items-center gap-0.5 pb-1.5" aria-label="Report wildlife conflict">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-fg shadow-lg ring-4 ring-bg"><Plus className="h-6 w-6" /></span>
                  <span className="max-w-full truncate text-[10px] font-medium">{t(n.key)}</span>
                </button>
              ) : (
                <NavLink to={n.to} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium', isActive ? 'text-primary' : 'text-muted')}>
                  <n.icon className="h-5 w-5" /><span className="max-w-full truncate px-0.5">{t(n.key)}</span>
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
      <MoreMenu /><ReportForm /><SOSFlow />
    </div>
  );
}

// ------------------------------ Official / Admin ------------------------------
const OFF_NAV = [
  { to: '/official/overview', icon: LayoutDashboard, label: 'Overview' }, { to: '/official/reports', icon: FileText, label: 'Reports' },
  { to: '/official/verification', icon: BadgeCheck, label: 'Verification' }, { to: '/official/sos', icon: Siren, label: 'SOS Alerts' },
  { to: '/official/dispatch', icon: Send, label: 'Dispatch' }, { to: '/official/drone', icon: Plane, label: 'Drone Patrol' },
  { to: '/official/volunteers', icon: Users, label: 'Volunteers' }, { to: '/official/analytics', icon: FileBarChart, label: 'Analytics' },
  { to: '/official/leaderboard', icon: Trophy, label: 'Leaderboard' }, { to: '/official/certificates', icon: Award, label: 'Certificates' },
];
const ADM_NAV = [
  { to: '/admin/users', icon: Users, label: 'Users' }, { to: '/admin/officials', icon: Shield, label: 'Officials' }, { to: '/admin/jurisdictions', icon: Globe, label: 'Jurisdictions' },
  { to: '/admin/content', icon: ClipboardList, label: 'Content' }, { to: '/admin/translations', icon: Languages, label: 'Translations' }, { to: '/admin/hospitals', icon: Stethoscope, label: 'Hospitals' },
  { to: '/admin/emergency-contacts', icon: Building2, label: 'Emergency contacts' }, { to: '/admin/integrations', icon: FlaskConical, label: 'Integrations' },
  { to: '/admin/audit', icon: ScrollText, label: 'Audit log' }, { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

export function OfficialLayout({ admin }: { admin?: boolean }) {
  useBoot();
  const user = useStore((s) => s.user)!;
  const logout = useStore((s) => s.logout);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const unread = useStore((s) => s.notifs.filter((n) => n.recipient === 'official' && !n.read && !n.dismissed).length);
  const loc = useLocation();
  const nav = useNavigate();
  const [menu, setMenu] = useState(false);
  const items = admin ? ADM_NAV : OFF_NAV;
  useEffect(() => { window.scrollTo(0, 0); setMenu(false); }, [loc.pathname]);
  const cur = items.find((i) => loc.pathname.startsWith(i.to))?.label ?? '';
  return (
    <div className="official-mesh min-h-dvh">
      <header className="sticky top-0 z-[1000] border-b border-amber-700/30 bg-gradient-to-r from-amber-600 to-orange-600 text-white safe-t">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between gap-2 px-4">
          <button onClick={() => setMenu(true)} aria-label="Open menu" className="rounded-full p-2 hover:bg-white/15 lg:hidden"><Menu className="h-5 w-5" /></button>
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Shield className="h-6 w-6 shrink-0" />
            <div className="min-w-0 leading-tight"><div className="truncate text-sm font-bold">{admin ? 'Administration' : 'Forest Official Portal'}</div>
              <div className="truncate text-[11px] opacity-90">{user.name} · {user.officialId} · {user.designation}</div></div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {!admin && <Link to="/official/overview" aria-label="Alerts" className="relative rounded-full p-2 hover:bg-white/15"><Bell className="h-5 w-5" />{unread > 0 && <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-red-700">{unread}</span>}</Link>}
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme" className="rounded-full p-2 hover:bg-white/15"><Sun className="hidden h-5 w-5 dark:block" /><Moon className="h-5 w-5 dark:hidden" /></button>
            <button onClick={() => { logout(); nav('/official/login'); }} aria-label="Log out" className="rounded-full p-2 hover:bg-white/15"><LogOut className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="border-t border-white/15 bg-black/10 px-4 py-1 text-[11px]"><div className="mx-auto max-w-[1400px] truncate">Jurisdiction: {user.jurisdiction} · Duty: On duty · <span className="font-semibold">DEMO DATA</span></div></div>
      </header>
      <div className="mx-auto flex max-w-[1400px]">
        <aside className="sticky top-[84px] hidden h-[calc(100dvh-84px)] w-60 shrink-0 overflow-y-auto border-r border-line p-3 lg:block">
          <OfficialNavList items={items} admin={admin} role={user.role} />
        </aside>
        <main className="min-w-0 flex-1 px-4 pb-24 pt-4">
          <div className="mb-3 flex items-center justify-between gap-2 lg:hidden"><div className="min-w-0 truncate text-sm font-semibold text-amber-800 dark:text-amber-300">{cur}</div></div>
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-[1050] border-t border-line bg-card/95 backdrop-blur safe-b lg:hidden" aria-label="Official">
        <ul className="no-scrollbar flex overflow-x-auto px-1">
          {items.slice(0, 5).map((n) => (
            <li key={n.to} className="min-w-[72px] flex-1">
              <NavLink to={n.to} className={({ isActive }) => cn('flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium', isActive ? 'text-amber-700 dark:text-amber-400' : 'text-muted')}>
                <n.icon className="h-5 w-5" /><span className="max-w-full truncate px-0.5">{n.label}</span></NavLink>
            </li>
          ))}
          <li className="min-w-[72px] flex-1"><button onClick={() => setMenu(true)} className="flex w-full flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-muted"><Menu className="h-5 w-5" />More</button></li>
        </ul>
      </nav>
      <Modal open={menu} onClose={() => setMenu(false)} title="Menu"><OfficialNavList items={items} admin={admin} role={user.role} /></Modal>
    </div>
  );
}

function OfficialNavList({ items, admin, role }: { items: typeof OFF_NAV; admin?: boolean; role: Role }) {
  return (
    <div className="space-y-1">
      {items.map((n) => (
        <NavLink key={n.to} to={n.to} className={({ isActive }) => cn('flex items-center gap-3 rounded-xl2 px-3 py-2.5 text-sm font-medium', isActive ? 'bg-amber-600 text-white' : 'hover:bg-secondary')}>
          <n.icon className="h-5 w-5 shrink-0" /><span className="min-w-0 truncate">{n.label}</span>
        </NavLink>
      ))}
      {role === 'platform_admin' && <NavLink to={admin ? '/official/overview' : '/admin/users'} className="mt-3 flex items-center gap-3 rounded-xl2 border border-line px-3 py-2.5 text-sm font-medium hover:bg-secondary"><Leaf className="h-5 w-5 shrink-0" />{admin ? 'Back to official portal' : 'Administration'}</NavLink>}
    </div>
  );
}
