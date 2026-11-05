import { ShieldCheck, FileText, TriangleAlert, PersonStanding, Users, PawPrint, MapPin, ListFilter, CalendarDays, Zap, Siren, BadgeCheck, Megaphone, ChevronRight, Truck, Activity, Clock } from 'lucide-react';
import { useRun } from '../actions';
import { Link } from 'react-router-dom';
import { Banner, Kpi, Panel, PTitle, ViewAll, Dot, Donut, Meter, DroneIcon, img } from '../kit';
import NeonMap, { MapLabel, ReserveLabel, Heat } from '../NeonMap';
import { Bars } from '../charts';
import { useStore } from '../../lib/store';
import type { Animal, Report } from '../../lib/types';

const THUMB: Partial<Record<Animal, string>> = { tiger: 'inc-tiger.jpg', crocodile: 'inc-croc.jpg', elephant: 'inc-elephant.jpg', boar: 'inc-boar.jpg', snake: 'th-snake.jpg', leopard: 'th-leopard.jpg' };
const SPEC: [Animal, string, string][] = [['tiger', 'Tiger', '#3fae3f'], ['crocodile', 'Crocodile', '#ffd93a'], ['snake', 'Snake', '#ff8a2a'], ['elephant', 'Elephant', '#a35cff'], ['boar', 'Wild Boar', '#3f95ff']];
const ago = (iso: string) => { const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const sevLabel = (r: Report) => (r.severity === 'high' || r.severity === 'critical' ? 'High Risk' : r.severity === 'medium' ? 'Medium' : 'Low');
const sevColor = (r: Report) => (r.severity === 'high' || r.severity === 'critical' ? '#ff3b3b' : r.severity === 'medium' ? '#ffa41c' : '#ffd93a');

export default function OfficialDashboard() {
  const run = useRun();
  const reports = useStore((s) => s.reports.filter((r) => !r.withdrawn));
  const sos = useStore((s) => s.sos);
  const users = useStore((s) => s.users);
  const activeSos = sos.filter((x) => !x.cancelled && !['resolved', 'cancelled'].includes(x.responseStatus));
  const pending = reports.filter((r) => r.status === 'pending' || r.status === 'under_review');
  const high = reports.filter((r) => r.severity === 'high' || r.severity === 'critical');
  const vols = users.filter((u) => u.role === 'approved_volunteer' && u.status === 'active');
  const species = new Set(reports.map((r) => r.animal)).size;
  const resolved = reports.filter((r) => r.status === 'resolved').length;
  const progress = reports.filter((r) => r.status === 'verified' || r.assignedTeam).length;
  const total = reports.length || 1;
  const counts = SPEC.map(([a]) => reports.filter((r) => r.animal === a).length);
  const other = Math.max(0, reports.length - counts.reduce((a, b) => a + b, 0));
  const seg = [...counts, other];
  const recent = [...reports].sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt)).slice(0, 4);
  const trend = (() => {
    const bins = 8;
    const arr = Array.from({ length: bins }, () => 0);
    reports.forEach((r) => { const age = (Date.now() - +new Date(r.submittedAt)) / 864e5; if (age >= 0 && age <= 30) arr[Math.min(bins - 1, Math.floor((30 - age) / (30 / bins)))]++; });
    return arr.map((v, i) => ({ x: i % 2 === 0 ? `${30 - Math.round(i * (30 / bins))}d` : '', v }));
  })();
  const bars = [
    [BadgeCheck, 'Resolved', resolved, Math.round((resolved / total) * 100), '#58e05b'],
    [Clock, 'Verified / assigned', progress, Math.round((progress / total) * 100), '#ffd93a'],
    [TriangleAlert, 'Pending verification', pending.length, Math.round((pending.length / total) * 100), '#ff4040'],
  ] as const;

  return (
    <>
      <Banner icon={<ShieldCheck />} title="Official" accent="Dashboard" crumbs={['Dashboard']} sub="Incident management, response coordination & wildlife conflict monitoring." />
      <div className="flex flex-wrap items-center gap-3"><span className="nf-pill !rounded-xl"><MapPin className="h-4 w-4 text-[var(--nf-lime)]" />Sundarbans, South 24 Parganas</span><span className="nf-pill !rounded-xl"><CalendarDays className="h-4 w-4" />Seeded reports, last 30 days</span></div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi icon={<FileText />} value={reports.length} label="Total Reports" />
        <Kpi tone="red" icon={<TriangleAlert />} value={high.length} label="High Risk" />
        <Kpi icon={<PersonStanding />} value={activeSos.length} label="Active SOS" />
        <Kpi icon={<Users />} value={vols.length} label="Active Volunteers" />
        <Kpi icon={<PawPrint />} value={species} label="Species Involved" />
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.55fr_1fr_0.82fr]">
        <Panel className="p-3"><PTitle icon={<MapPin />} right={<Link to="/official/hotspot" className="nf-pill !py-1 text-xs">View Full Map →</Link>}>Live Incident Map</PTitle>
          <NeonMap height={296} zoom={8.5} center={[88.7, 22.0]} items={[
            { lng: 88.67, lat: 22.31, node: <MapLabel>Canning</MapLabel> }, { lng: 88.88, lat: 22.2, node: <MapLabel>Basanti</MapLabel> }, { lng: 88.8, lat: 22.05, node: <MapLabel>Gosaba</MapLabel> }, { lng: 88.45, lat: 21.95, node: <MapLabel>Pakhirala</MapLabel> },
            { lng: 88.25, lat: 21.78, node: <MapLabel>Namkhana</MapLabel> }, { lng: 89.0, lat: 22.05, node: <MapLabel>Sajnekhali</MapLabel> }, { lng: 88.95, lat: 21.85, node: <ReserveLabel /> },
            ...reports.filter((r) => r.severity !== 'low').slice(0, 8).map((r) => ({ lng: r.location.lng, lat: r.location.lat, node: <Heat r={r.severity === 'medium' ? 26 : 34} c={sevColor(r)} core={r.severity !== 'medium' ? <i className="block h-4 w-4 rounded-full border-2 border-white bg-red-600" /> : undefined} /> })),
          ]}>
            <div className="absolute bottom-2 left-24 flex items-center gap-4 rounded-lg bg-black/60 px-3 py-1.5 text-[12px]"><span className="flex items-center gap-1.5"><Dot c="#ff3b3b" />High Risk</span><span className="flex items-center gap-1.5"><Dot c="#ffa41c" />Medium</span><span className="flex items-center gap-1.5"><Dot c="#ffd93a" />Low</span></div>
          </NeonMap></Panel>
        <Panel className="p-3"><PTitle icon={<ListFilter />} right={<ViewAll to="/official/reports" />}>Recent Reports</PTitle>
          <ul className="divide-y divide-white/5">{recent.map((r) => <li key={r.id}><Link to="/official/reports" className="flex items-center gap-3 py-2"><img src={img(THUMB[r.animal] ?? 'th-crop.jpg')} alt="" className="h-[50px] w-[60px] shrink-0 rounded-lg object-cover" /><span className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[14px] font-semibold capitalize">{r.animal} · {r.location.label}</span><span className="mt-1 flex items-center gap-1.5 text-[12px]"><span className="flex items-center gap-1 rounded-full px-1.5 py-px" style={{ background: sevColor(r) === '#ff3b3b' ? '#c92a2a' : '#6b5d12' }}><Dot c={sevColor(r)} />{sevLabel(r)}</span>• {ago(r.submittedAt)}</span></span><ChevronRight className="h-4 w-4 shrink-0" /></Link></li>)}</ul></Panel>
        <Panel className="p-3"><PTitle icon={<Zap />}>Action Center</PTitle>
          <div className="space-y-2.5">
            <Link to="/official/sos" className="nf-btn !justify-start !rounded-xl border border-[#ff3b3b] !bg-[#5a1010]/70 !font-medium !text-white"><Siren className="h-5 w-5 text-[#ff6a6a]" /><span className="flex-1 text-left">SOS Requests ({activeSos.length})</span>→</Link>
            <Link to="/official/reports" className="nf-btn ghost !justify-start !rounded-xl !border-[#5aa02a]"><BadgeCheck className="h-5 w-5 text-[var(--nf-lime)]" /><span className="flex-1 text-left">Verify Reports ({pending.length})</span>→</Link>
            <Link to="/official/dispatch" className="nf-btn ghost !justify-start !rounded-xl !border-[#5aa02a]"><Users className="h-5 w-5 text-[var(--nf-lime)]" /><span className="flex-1 text-left">Assign Field Team</span>→</Link>
            <Link to="/official/drone" className="nf-btn ghost !justify-start !rounded-xl !border-[#5aa02a]"><DroneIcon size={20} className="text-[var(--nf-lime)]" /><span className="flex-1 text-left">Drone Patrol</span></Link>
            <button onClick={() => run('Broadcast Alert')} className="nf-btn ghost w-full !justify-start !rounded-xl !border-[#5aa02a]"><Megaphone className="h-5 w-5 text-[var(--nf-lime)]" /><span className="flex-1 text-left">Broadcast Alert</span></button></div></Panel>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr_1fr]">
        <Panel className="p-3"><PTitle icon={<Activity />}>Incident Trends</PTitle><Bars data={trend} height={190} /></Panel>
        <Panel className="p-3"><PTitle icon={<PawPrint />}>Species-wise Reports</PTitle>
          <div className="flex flex-wrap items-center gap-4"><Donut size={158} stroke={18} seg={seg.map((v, i) => ({ v: v || 0.01, c: [...SPEC.map((s) => s[2]), '#9aa5a0'][i] }))}><b className="text-[24px]">{reports.length}</b><span className="text-xs">Reports</span></Donut>
            <ul className="space-y-1.5 text-[13px]">{SPEC.map(([, n, c], i) => <li key={n} className="flex items-center gap-2"><Dot c={c} /><span className="w-[84px]">{n}</span><span>{reports.length ? Math.round((counts[i] / reports.length) * 100) : 0}%</span></li>)}<li className="flex items-center gap-2"><Dot c="#9aa5a0" /><span className="w-[84px]">Others</span><span>{reports.length ? Math.round((other / reports.length) * 100) : 0}%</span></li></ul></div></Panel>
        <Panel className="p-3"><PTitle icon={<Truck />}>Response Status</PTitle>
          <ul className="space-y-4 pt-1">{bars.map(([I, n, v, w, c]) => <li key={n} className="grid grid-cols-[34px_1fr_auto] items-center gap-3"><I className="h-7 w-7" style={{ color: c }} /><div><div className="text-[14px]">{n}</div><Meter pct={w} color={c} h={6} className="mt-1.5" /></div><div className="text-right leading-tight"><b className="text-[17px]">{v}</b> <span className="text-xs">({w}%)</span></div></li>)}</ul></Panel>
      </div>
    </>
  );
}
