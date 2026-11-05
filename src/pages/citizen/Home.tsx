import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Droplets, Wind, Thermometer, MapPin, Share2, ShieldCheck, Coins, FileText, Users, CheckCircle2, Bell, Siren, Heart, ScanSearch, TrendingUp, Bot, BookOpen, Bug, Award, Cloud, UserRound, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, tokenBalance, levelFor } from '../../lib/store';
import { useUI } from '../../lib/hooks';
import { useT } from '../../lib/i18n';
import { Card, SevBadge, Badge, DemoNote, SectionTitle, Stat, Empty } from '../../components/ui';
import { ANIMALS, ago, publicIncident, fmtDay, SEV_HEX } from '../../lib/utils';

const TIPS = ['Travel in groups and avoid creek banks at dusk and dawn.', 'Never approach wildlife for a photo. Zoom from a safe place.', 'Keep a torch and whistle when moving after dark.', 'Report sightings promptly so neighbours can be warned.', 'Do not catch or kill snakes. Call the rescue unit.'];

export function Footer() {
  return (
    <footer className="mt-10 border-t border-line pt-5 text-center text-xs text-muted">
      <div className="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-1">
        {[['About', '/help'], ['Privacy', '/privacy'], ['Contact', '/help'], ['Help', '/help'], ['Accessibility', '/help'], ['Terms', '/terms']].map(([l, to]) => <Link key={l} to={to} className="underline">{l}</Link>)}
      </div>
      <p className="flex items-center justify-center gap-1"><PawPrint className="h-3.5 w-3.5" />Protect people, respect wildlife. Never harm the animals of the Sundarbans.</p>
      <p className="mt-1">VanSanchar - Bridging Communities &amp; Wildlife · Demonstration build</p>
    </footer>
  );
}

export default function Home() {
  const { t } = useT();
  const { user, reports, ledger, contacts } = useStore();
  const set = useUI((s) => s.set);
  const tokens = tokenBalance(ledger);
  const lvl = levelFor(tokens);
  const mine = reports.filter((r) => r.reporterId === user?.uid);
  const alerts = useMemo(() => reports.filter((r) => r.status === 'verified' || r.status === 'resolved').slice(0, 5).map(publicIncident), [reports]);
  const now = Date.now();
  const active24 = reports.filter((r) => now - +new Date(r.submittedAt) < 864e5).length;
  const verified = reports.filter((r) => r.status === 'verified' || r.status === 'resolved').length;
  const resolved = reports.filter((r) => r.status === 'resolved').length;
  const rate = verified ? Math.round((resolved / verified) * 100) : 0;
  const tip = TIPS[new Date().getDate() % TIPS.length];

  const share = async (a: ReturnType<typeof publicIncident>) => {
    const text = `VanSanchar advisory: verified ${ANIMALS[a.animal]} activity near ${a.area}. Stay alert, avoid the area after dusk. (Approximate area only)`;
    try { if (navigator.share) await navigator.share({ title: 'VanSanchar advisory', text }); else { await navigator.clipboard.writeText(text); toast.success('Advisory copied'); } } catch { /* cancelled */ }
  };

  const quick = [
    { to: '/app/ai-detection', i: ScanSearch, l: 'AI Detection', c: 'text-purple-600' }, { to: '/app/predictions', i: TrendingUp, l: 'Predictions', c: 'text-blue-600' },
    { to: '/app/assistant', i: Bot, l: 'AI Assistant', c: 'text-indigo-600' }, { to: '/app/sarpa', i: Bug, l: 'SARPA', c: 'text-orange-600' },
    { to: '/app/volunteer', i: Users, l: 'Van Mitra', c: 'text-emerald-600' }, { to: '/app/achievements', i: Award, l: 'Achievements', c: 'text-amber-600' },
    { to: '/app/offline-guides', i: BookOpen, l: 'Offline Guides', c: 'text-teal-600' }, { to: '/app/reports', i: FileText, l: 'My Reports', c: 'text-primary' },
  ];

  return (
    <div className="space-y-4">
      {/* Hero */}
      <Card className="!bg-gradient-to-br from-[#2D5016] to-[#4a7a2c] !border-0 !p-5 text-white">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm opacity-80">{t('hello')},</div>
            <h1 className="truncate text-2xl font-bold">{user?.name}</h1>
            <div className="mt-1 flex items-center gap-1 text-xs opacity-90"><MapPin className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{user?.region}, Sundarbans</span></div>
          </div>
          <div className="shrink-0 rounded-xl bg-white/15 px-3 py-2 text-right"><div className="flex items-center justify-end gap-1 text-lg font-bold"><Coins className="h-4 w-4" />{tokens}</div><div className="text-[11px] opacity-90">{lvl.name}</div></div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="min-w-0 rounded-lg bg-white/10 p-2"><Heart className="mx-auto mb-0.5 h-4 w-4" /><div className="truncate font-semibold">{user?.blood ?? '--'}</div><div className="opacity-80">Blood</div></div>
          <div className="min-w-0 rounded-lg bg-white/10 p-2"><FileText className="mx-auto mb-0.5 h-4 w-4" /><div className="font-semibold">{mine.length}</div><div className="opacity-80">My reports</div></div>
          <div className="min-w-0 rounded-lg bg-white/10 p-2"><UserRound className="mx-auto mb-0.5 h-4 w-4" /><div className="truncate font-semibold">{user?.emergency?.name.split(' ')[0] ?? '--'}</div><div className="opacity-80">Emergency</div></div>
        </div>
        <p className="mt-3 text-[11px] opacity-80">Community safety initiative demo. Not an official government service.</p>
      </Card>

      {/* Big report button */}
      <button onClick={() => set({ reportOpen: true })} className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-red-600 to-orange-500 p-4 text-left text-white shadow-lg transition active:scale-[.98]">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20"><Siren className="h-7 w-7" /></span>
        <span className="min-w-0"><span className="block text-lg font-bold leading-tight">{t('home.report')}</span><span className="block text-sm opacity-90">{t('home.reportSub')}</span></span>
      </button>

      <DemoNote>Dashboard numbers come from seeded sample data in this demo, not live measurements.</DemoNote>

      {/* Weather */}
      <Card>
        <div className="mb-2 flex items-center justify-between gap-2"><div className="flex items-center gap-2 font-semibold"><Cloud className="h-5 w-5 text-blue-600" />{t('home.weather')}</div><Badge className="bg-purple-100 text-purple-800">Sample data</Badge></div>
        <div className="grid grid-cols-3 gap-2 text-center text-sm">
          <div><Thermometer className="mx-auto h-5 w-5 text-orange-500" /><div className="font-bold">31 °C</div><div className="text-xs text-muted">Humid, hazy</div></div>
          <div><Droplets className="mx-auto h-5 w-5 text-blue-500" /><div className="font-bold">78%</div><div className="text-xs text-muted">Humidity</div></div>
          <div><Wind className="mx-auto h-5 w-5 text-teal-500" /><div className="font-bold">14 km/h</div><div className="text-xs text-muted">Wind</div></div>
        </div>
        <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Advisory (rule-based, not a validated prediction): high tide and low visibility near creeks. Avoid boat travel at dusk.</p>
        <p className="mt-1 text-[11px] text-muted">Sample values · a live provider would show &quot;updated&quot; time and a stale-data label.</p>
      </Card>

      {/* Impact */}
      <div className="grid grid-cols-2 gap-3">
        <Stat icon={<Users className="h-4 w-4" />} label="Active reports (24 h)" value={active24} sub="submitted in last 24 hours" />
        <Stat icon={<ShieldCheck className="h-4 w-4" />} label="Verified conflicts" value={verified} tone="text-green-600" sub="status verified/resolved" />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Resolution rate" value={`${rate}%`} sub="resolved ÷ verified" />
        <Stat icon={<Bell className="h-4 w-4" />} label="Alerts for you" value={useStore.getState().notifs.filter((n) => n.recipient === 'citizen').length} sub="in-app notifications" />
      </div>

      {/* Quick actions */}
      <SectionTitle>{t('home.quick')}</SectionTitle>
      <div className="grid grid-cols-4 gap-2">
        {quick.map((q) => (
          <Link key={q.to} to={q.to} className="flex min-w-0 flex-col items-center gap-1 rounded-xl2 border border-line bg-card px-1 py-3 text-center transition hover:-translate-y-0.5 hover:shadow">
            <q.i className={`h-6 w-6 ${q.c}`} /><span className="w-full break-words text-[11px] font-medium leading-tight">{q.l}</span>
          </Link>
        ))}
      </div>

      {/* Alerts */}
      <SectionTitle action={<Link to="/app/map" className="text-sm text-primary underline">Map</Link>}>{t('home.alerts')}</SectionTitle>
      {alerts.length === 0 ? <Empty title="No verified alerts" hint="Only officially verified incidents appear here." /> : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <Card key={a.id} className="!p-3">
              <div className="flex gap-3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: SEV_HEX[a.severity] }}><PawPrint className="h-8 w-8" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5"><span className="font-semibold">{ANIMALS[a.animal]}</span><SevBadge s={a.severity} /><Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3" />Verified</Badge></div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">Around {a.area} (approx.)</span></div>
                  <div className="text-xs text-muted">{ago(a.at)} · {fmtDay(a.at)}</div>
                </div>
                <button onClick={() => share(a)} aria-label="Share advisory" className="h-9 w-9 shrink-0 self-start rounded-full hover:bg-secondary"><Share2 className="mx-auto h-4 w-4" /></button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Emergency numbers */}
      <SectionTitle>{t('home.emergency')}</SectionTitle>
      <div className="space-y-2">
        {contacts.map((c) => (
          <a key={c.id} href={`tel:${c.phone}`} className="flex items-center gap-3 rounded-xl2 border border-line bg-card p-3 active:scale-[.99]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700"><Phone className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1"><span className="block truncate font-medium">{c.name}</span><span className="block truncate text-xs text-muted">{c.area} · verified {fmtDay(c.verifiedAt)}</span></span>
            <span className="shrink-0 font-bold text-primary">{c.phone}</span>
          </a>
        ))}
        <p className="text-xs text-muted">Opening the dialer does not guarantee a call is connected. {t('safe.call')}</p>
      </div>

      <SectionTitle>{t('home.tips')}</SectionTitle>
      <Card className="!bg-secondary"><p className="text-sm">{tip}</p><Link to="/app/education" className="mt-2 inline-block text-sm text-primary underline">More safety education</Link></Card>
      <Footer />
    </div>
  );
}
