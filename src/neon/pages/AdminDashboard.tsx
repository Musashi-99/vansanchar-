import { useState } from 'react';
import { useRun } from '../actions';
import { Settings, Users, UserRound, MapPin, Database, Brain, Server, UserPlus, ShieldCheck, Megaphone, PawPrint, Cpu, FileText, Trees, TriangleAlert, Leaf, Layers, SatelliteDish, CloudUpload, Check, Activity, HardDrive, Cloud, Map as MapIcon, CalendarDays, Siren, Binoculars, Bell } from 'lucide-react';
import { Banner, Kpi, KpiRow, Panel, PTitle, Pills, Donut, Dot, Meter, DroneIcon, Select2 } from '../kit';
import { useStore } from '../../lib/store';
import { OFFICIALS } from '../../lib/seed';
import { fmtDate } from '../../lib/utils';
import NeonMap, { ReserveLabel, Pin, Dotm } from '../NeonMap';
import { AreaTwo } from '../charts';

const act = [{ x: '6 Oct', a: 2000, r: 1000 }, { x: '8', a: 2600, r: 1500 }, { x: '10 Oct', a: 3200, r: 1900 }, { x: '12', a: 3500, r: 2300 }, { x: '14 Oct', a: 4600, r: 3100 }, { x: '16', a: 4000, r: 2200 }, { x: '18 Oct', a: 4100, r: 2400 }, { x: '22 Oct', a: 5000, r: 3000 }, { x: '26 Oct', a: 6000, r: 3500 }, { x: '30 Oct', a: 6600, r: 4000 }, { x: '4 Nov', a: 8200, r: 5000 }];

const health = [[Server, 'Application Server'], [Database, 'Database'], [Cpu, 'AI Inference (Species ID)'], [DroneIcon, 'Drone Integration'], [MapIcon, 'GIS / Map Services']] as const;
const acts = [['AI model v2.6 deployed', '10:24 AM'], ['New volunteer batch (42) approved', '09:51 AM'], ['Drone DRN-03 added to fleet', '08:37 AM'], ['Species database updated (12 new)', 'Yesterday'], ['System backup completed', 'Yesterday']];
const cats = [[PawPrint, 'Animal Sighting', 248, '33.9%', 100, '#8fdc2f'], [Trees, 'Habitat Threat', 171, '23.4%', 70, '#ffd93a'], [TriangleAlert, 'Poaching / Illegal Activity', 96, '13.1%', 39, '#ff8a2a'], [Leaf, 'Human–Wildlife Conflict', 87, '11.9%', 35, '#ff4fa3'], [Layers, 'Other', 130, '17.8%', 52, '#b27cff']] as const;
const integ = [[DroneIcon, 'Drone', '(6 Active)'], [Layers, 'GIS Map', '(Live)'], [SatelliteDish, 'Satellite', '(Online)'], [CloudUpload, 'ISRO/Bhuvan', '(Connected)'], [Settings, 'External APIs', '(3 Connected)']] as const;

export default function AdminDashboard() {
  const run = useRun();
  const [tab, setTab] = useState('overview');
  const users = useStore((s) => s.users);
  const reports = useStore((s) => s.reports.filter((r) => !r.withdrawn));
  const drones = useStore((s) => s.drones);
  const audit = useStore((s) => s.audit);
  const vols = users.filter((u) => u.role === 'approved_volunteer').length;
  const officials = OFFICIALS.filter((o) => o.role !== 'platform_admin').length + users.filter((u) => ['forest_guard', 'range_officer', 'deputy_ranger', 'dfo'].includes(u.role)).length;
  const high = reports.filter((r) => r.severity === 'high' || r.severity === 'critical').length;
  const med = reports.filter((r) => r.severity === 'medium').length;
  const low = reports.filter((r) => r.severity === 'low').length;
  const show = (id: string) => tab === 'overview' || tab === id;
  return (
    <>
      <Banner icon={<Settings />} title="Admin" accent="Dashboard" crumbs={['Admin', 'Admin Dashboard']} sub="Platform control, operations, and system health for VanSanchar." />
      <KpiRow cols={7}>
        <Kpi tone="red" icon={<Users />} value={users.length + officials} label="Accounts" />
        <Kpi icon={<UserRound />} value={vols} label="Volunteers" />
        <Kpi icon={<MapPin />} value={reports.length} label="Incidents" />
        <Kpi icon={<DroneIcon />} value={drones.length} label="Drones" sub={`Airborne ${drones.filter((d) => d.status === 'patrolling').length}`} />
        <Kpi icon={<Database />} value={reports.length + users.length} label="Live records" />
        <Kpi icon={<Brain />} value="Local" label="Species assist" sub="Demo rules" />
        <Kpi icon={<Server />} value="Browser" label="Data store" sub="This device" />
      </KpiRow>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'overview', label: 'Overview' }, { id: 'users', label: 'Users' }, { id: 'ops', label: 'Operations' }, { id: 'ai', label: 'AI Models' }, { id: 'data', label: 'Data & Integrations' }, { id: 'health', label: 'System Health' }]} />
        <Select2 icon={<CalendarDays className="h-4 w-4" />}>Last 30 Days</Select2>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.32fr_1fr_1.1fr]">
        <Panel className="p-3"><PTitle icon={<Activity />} right={<Select2 className="!py-1 text-xs">Daily</Select2>}>Platform Activity</PTitle>
          <AreaTwo data={act} keys={[{ k: 'a', c: '#8fdc2f' }, { k: 'r', c: '#ffd93a' }]} yTicks={[0, 2000, 4000, 6000, 8000, 10000]} fmt={(n) => (n ? `${n / 1000}K` : '0')} height={170} />
          <div className="mt-1 flex justify-center gap-6 text-[12px]"><span className="flex items-center gap-1.5"><Dot c="#8fdc2f" />Active Users</span><span className="flex items-center gap-1.5"><Dot c="#ffd93a" />Reports / Incidents</span></div></Panel>
        <Panel className="p-3"><PTitle icon={<FileText />}>Incident Overview</PTitle>
          <div className="flex flex-wrap items-center justify-center gap-4 py-2">
            <Donut size={150} stroke={22} seg={[{ v: high || 0.01, c: '#ff4040' }, { v: med || 0.01, c: '#ffd93a' }, { v: low || 0.01, c: '#8fdc2f' }]}><b className="text-[26px]">{reports.length}</b><span className="text-xs">Total<br />Incidents</span></Donut>
            <ul className="space-y-2 text-[13.5px]">{[['#ff4040', 'High', high], ['#ffd93a', 'Medium', med], ['#8fdc2f', 'Low', low]].map(([c, n, v]) => <li key={n as string} className="flex items-center gap-3"><Dot c={c as string} /><span className="w-14">{n as string}</span><span>{v as number} ({reports.length ? Math.round((Number(v) / reports.length) * 100) : 0}%)</span></li>)}</ul></div></Panel>
        <Panel className="p-3"><PTitle icon={<Bell className="h-5 w-5" />}>Quick Actions</PTitle>
          <div className="grid grid-cols-3 gap-2">{[[UserPlus, 'Add User'], [ShieldCheck, 'Assign Role'], [Megaphone, 'Create Announcement'], [PawPrint, 'Update Species DB'], [Cpu, 'Retrain AI Model'], [Settings, 'System Settings']].map(([I, t]) => { const Ic = I as typeof Users; return <button key={t as string} onClick={() => run(t as string)} className="flex h-[84px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-1 text-center text-[13px] leading-tight hover:border-[var(--nf-lime)]"><Ic className="h-6 w-6 text-[var(--nf-lime)]" />{t as string}</button>; })}</div></Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr_1.05fr]">
        <Panel className="p-3"><PTitle icon={<MapIcon />}>Live Operations Map</PTitle>
          <NeonMap height={226} zoom={8.5} center={[88.78, 22.05]} items={[
            { lng: 88.52, lat: 22.2, node: <Pin c="#e5242b" size={30}><Siren className="h-4 w-4" /></Pin> },
            { lng: 88.7, lat: 22.28, node: <Pin c="#2f7d2a" size={30}><PawPrint className="h-4 w-4" /></Pin> }, { lng: 88.82, lat: 22.4, node: <Pin c="#1c4a1c" size={32}><DroneIcon size={18} /></Pin> },
            { lng: 88.6, lat: 22.05, node: <Pin c="#2f7d2a" size={30}><Binoculars className="h-4 w-4" /></Pin> }, { lng: 88.97, lat: 22.0, node: <ReserveLabel /> }, { lng: 88.8, lat: 22.3, node: <Dotm /> },
          ]} />
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px]"><span className="flex items-center gap-1"><Dot c="#ff3b3b" />High Incident</span><span className="flex items-center gap-1"><Dot c="#ffa41c" />Medium</span><span className="flex items-center gap-1"><Dot c="#8fdc2f" />Patrol / Team</span><span className="flex items-center gap-1"><DroneIcon size={14} />Drone</span><span className="flex items-center gap-1"><i className="h-2.5 w-4 rounded-sm border border-dashed border-[#e8ff4a]" />Reserve Boundary</span></div></Panel>
        <Panel className="p-3"><PTitle icon={<Activity />}>System Health</PTitle>
          <ul className="space-y-1">{health.map(([I, n]) => <li key={n} className="flex items-center justify-between gap-2 py-1.5 text-[13.5px]"><span className="flex min-w-0 items-center gap-3"><I className="h-5 w-5 shrink-0 text-[var(--nf-lime)]" size={20} /><span className="truncate">{n}</span></span><span className="flex items-center gap-1.5 text-[#58e05b]"><Dot c="#58e05b" />Healthy</span></li>)}
            <li className="flex items-center justify-between gap-3 py-1.5 text-[13.5px]"><span className="flex items-center gap-3"><Cloud className="h-5 w-5 text-[var(--nf-lime)]" />Storage (1.2 TB)</span><span className="w-[38%]"><span className="block text-right text-xs">72% Used</span><Meter pct={72} h={6} /></span></li></ul></Panel>
        <Panel className="p-3"><PTitle icon={<HardDrive />}>Recent Admin Activities</PTitle>
          <ul className="divide-y divide-white/5">{audit.slice(0, 5).map((a) => <li key={a.id} className="flex items-center justify-between gap-2 py-2 text-[13px]"><span className="flex min-w-0 items-center gap-3"><FileText className="h-5 w-5 shrink-0 text-[#d6e8cc]" /><span className="truncate">{a.action} · {a.target}</span></span><span className="shrink-0 text-[12.5px]">{fmtDate(a.at)}</span></li>)}{audit.length === 0 && <li className="py-3 text-sm text-[var(--muted)]">No admin activity yet.</li>}</ul></Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr_1.5fr_1.5fr]">
        <Panel className="p-3"><PTitle icon={<Users />}>User Summary</PTitle>
          <div className="flex flex-wrap items-center gap-4"><Donut size={142} stroke={16} seg={[{ v: officials || 0.01, c: '#ffd93a' }, { v: vols || 0.01, c: '#ffcf1f' }, { v: users.filter((u) => u.role === 'citizen').length || 0.01, c: '#3f95ff' }]}><Users className="mb-0.5 h-5 w-5 text-[var(--nf-lime)]" /><b className="text-[22px]">{users.length + officials}</b><span className="text-[11px]">Accounts</span></Donut>
            <ul className="space-y-2 text-[13px]">{[['#ffd93a', 'Officials', officials], ['#ffcf1f', 'Volunteers', vols], ['#3f95ff', 'Citizens', users.filter((u) => u.role === 'citizen').length]].map(([c, n, v]) => <li key={n as string} className="flex items-center gap-2"><Dot c={c as string} /><span className="w-[84px]">{n as string}</span><span>{v as number}</span></li>)}</ul></div></Panel>
        <Panel className="p-3"><PTitle icon={<TriangleAlert />}>Top Incident Categories</PTitle>
          <ul className="space-y-2">{cats.map(([I, n, v, p, w, c]) => <li key={n} className="grid grid-cols-[22px_1.2fr_1fr_auto] items-center gap-2.5 text-[13px]"><I className="h-[18px] w-[18px] text-[var(--nf-lime)]" /><span className="truncate">{n}</span><Meter pct={w} color={c} h={7} /><span className="w-[92px] text-right">{v} ({p})</span></li>)}</ul></Panel>
        <Panel className="p-3"><PTitle icon={<Layers />}>Integrations &amp; Data Sources</PTitle>
          <div className="grid grid-cols-5 gap-2">{integ.map(([I, n, s]) => <div key={n} className="relative flex flex-col items-center rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-1 pb-3.5 pt-3 text-center text-[11.5px] leading-tight"><I className="mb-2 h-7 w-7 text-[var(--nf-lime)]" size={28} />{n}<br />{s}<span className="absolute -bottom-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#58e05b] text-black"><Check className="h-3.5 w-3.5" strokeWidth={4} /></span></div>)}</div></Panel>
      </div>
    </>
  );
}
