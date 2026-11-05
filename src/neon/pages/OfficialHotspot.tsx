import { useState } from 'react';
import { useRun } from '../actions';
import { useStore } from '../../lib/store';
import { MapPin, Flame, TriangleAlert, Route, Users, BarChart3, CalendarDays, Layers, Truck, Home, Check, ChevronRight, Radio, Plus, Maximize2, Target, Trophy } from 'lucide-react';
import { Banner, KpiRow, Kpi, Panel, PTitle, Check2, Dot, Meter, Select2, ViewAll, DroneIcon } from '../kit';
import NeonMap, { MapLabel, ReserveLabel, Heat } from '../NeonMap';
import { Lines } from '../charts';

const Tower = () => <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--nf-lime)] bg-[#0b2a14] text-[var(--nf-lime)]"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M7 3h10l-1 5H8zM8 8l-2 13M16 8l2 13M7 14h10M6.5 19h11" /></svg></span>;
const Team = ({ id }: { id: string }) => <span className="flex items-center gap-1.5 rounded-lg border border-[var(--nf-lime)] bg-[#0b2a14] px-2 py-0.5 text-[12px] font-bold"><Truck className="h-4 w-4 text-[var(--nf-lime)]" />{id}</span>;
const Hot = ({ r = 34 }: { r?: number }) => <Heat r={r} core={<i className="block h-4 w-4 rounded-full border-2 border-white bg-red-600" />} />;
const trend = [{ x: '6 Oct', v: 1 }, { x: '', v: 2 }, { x: '10 Oct', v: 8 }, { x: '', v: 9 }, { x: '14 Oct', v: 11 }, { x: '', v: 7 }, { x: '18 Oct', v: 11 }, { x: '22 Oct', v: 8 }, { x: '26 Oct', v: 14 }, { x: '', v: 17 }, { x: '30 Oct', v: 14 }, { x: '4 Nov', v: 13 }];

export default function OfficialHotspot() {
  const run = useRun();
  const hotspots = useStore((s) => s.hotspots);
  const teams = useStore((s) => s.teams);
  const reports = useStore((s) => s.reports.filter((r) => !r.withdrawn));
  const [area, setArea] = useState('Gosaba Range');
  const [on, setOn] = useState([true, true, true, true, true, true, false]);
  const layers = [['Conflict Hotspots (Heatmap)', <i key="1" className="block h-4 w-4 rounded-full bg-red-500 shadow-[0_0_8px_#f00]" />], ['Incident Locations', <i key="2" className="block h-2.5 w-2.5 rounded-full bg-[#ffd93a]" />], ['Patrol Routes', <i key="3" className="block w-5 border-t-2 border-dashed border-white" />], ['Field Team (Live)', <Truck key="4" className="h-4 w-4 text-[var(--nf-lime)]" />], ['Watchtowers / Outposts', <Radio key="5" className="h-4 w-4 text-[var(--nf-lime)]" />], ['Reserve Boundary', <i key="6" className="block h-3.5 w-5 rounded-md border-2 border-[#e8ff4a]" />], ['Villages / Settlements', <Home key="7" className="h-4 w-4 text-[var(--nf-lime)]" />]] as const;
  return (
    <>
      <Banner icon={<MapPin />} title="Hotspot &" accent="Patrol Map" crumbs={['Dashboard', 'Hotspot & Patrol Map']} sub="View conflict hotspots, patrol coverage, and plan field operations across the Sundarbans." />
      <KpiRow cols={6}><Kpi tone="red" icon={<Flame />} value={hotspots.filter((h) => h.risk === 'high' || h.risk === 'critical').length} label="High-Risk Hotspots" /><Kpi color="amber" icon={<TriangleAlert />} value={hotspots.filter((h) => h.risk === 'medium').length} label="Medium-Risk Areas" /><Kpi icon={<MapPin />} value={reports.length} label="Mapped Reports" /><Kpi icon={<Users />} value={teams.length} label="Field Teams" /><Kpi icon={<Route />} value={teams.filter((t) => t.availability !== 'off_duty').length} label="Teams on duty" /><Kpi icon={<BarChart3 />} value={hotspots.reduce((a, h) => a + h.count, 0)} label="Hotspot incidents" /></KpiRow>
      <div className="grid gap-3 xl:grid-cols-[2.05fr_1fr]">
        <Panel className="p-3"><PTitle icon={<MapPin />} right={<Select2 icon={<CalendarDays className="h-4 w-4" />} className="!py-1 text-xs">Last 7 Days</Select2>}>Sundarbans Patrol &amp; Hotspot Map</PTitle>
          <NeonMap height={520} zoom={8.7} center={[88.75, 22.05]} items={[
            { lng: 88.67, lat: 22.34, node: <MapLabel>Canning</MapLabel> }, { lng: 88.97, lat: 22.2, node: <MapLabel>Basanti</MapLabel> }, { lng: 88.82, lat: 22.05, node: <MapLabel>Gosaba</MapLabel> }, { lng: 88.5, lat: 21.98, node: <MapLabel>Pakhirala</MapLabel> }, { lng: 88.3, lat: 21.8, node: <MapLabel>Namkhana</MapLabel> }, { lng: 88.45, lat: 21.62, node: <MapLabel>Bakkhali</MapLabel> }, { lng: 89.12, lat: 22.0, node: <MapLabel>Sajnekhali<br />Range</MapLabel> }, { lng: 89.0, lat: 21.82, node: <ReserveLabel /> },
            ...hotspots.map((h) => ({ lng: h.lng, lat: h.lat, z: 1, node: h.risk === 'low' ? <Heat r={22} c="#ffd93a" /> : h.risk === 'medium' ? <Heat r={28} c="#ffa41c" /> : <Hot r={36 + h.count} /> })),
            { lng: 88.45, lat: 22.2, node: <Tower /> }, { lng: 88.8, lat: 22.28, node: <Tower /> }, { lng: 88.52, lat: 22.02, node: <Tower /> }, { lng: 88.85, lat: 21.9, node: <Tower /> }, { lng: 89.03, lat: 22.3, node: <Tower /> },
            { lng: 88.78, lat: 22.2, node: <Team id="T-03" />, z: 3 }, { lng: 88.34, lat: 22.0, node: <Team id="T-01" />, z: 3 }, { lng: 88.52, lat: 21.86, node: <Team id="T-08" />, z: 3 }, { lng: 88.98, lat: 21.84, node: <Team id="T-06" />, z: 3 },
          ]} routes={[{ pts: [[88.45, 22.3], [88.4, 22.1], [88.35, 21.95], [88.5, 21.85], [88.7, 21.78]], color: '#fff' }, { pts: [[88.75, 22.3], [88.7, 22.1], [88.62, 21.95]], color: '#fff' }, { pts: [[89.05, 22.3], [88.95, 22.1], [88.88, 21.9]], color: '#fff' }]} />
          <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11.5px] leading-tight"><span className="flex items-center gap-1.5"><Dot c="#ff3b3b" /><span>High Risk<br />(≥ 5 incidents)</span></span><span className="flex items-center gap-1.5"><Dot c="#ffa41c" /><span>Medium Risk<br />(2 – 4 incidents)</span></span><span className="flex items-center gap-1.5"><Dot c="#ffd93a" /><span>Low Risk<br />(1 incident)</span></span><span className="flex items-center gap-1.5"><i className="w-6 border-t-2 border-dashed border-white" /><span>Patrol Route<br />(Active)</span></span><span className="flex items-center gap-1.5"><i className="h-3 w-5 rounded-md border-2 border-[#e8ff4a]" />Reserve Boundary</span><span className="flex items-center gap-1.5"><Radio className="h-4 w-4 text-[var(--nf-lime)]" /><span>Patrol Outpost /<br />Watchtower</span></span></div></Panel>

        <div className="space-y-3 min-w-0">
          <Panel className="p-3"><PTitle icon={<Layers />}>Map Layers</PTitle><ul className="space-y-1.5">{layers.map(([n, ic], i) => <li key={n}><button onClick={() => setOn((o) => o.map((x, j) => (j === i ? !x : x)))} className="flex w-full items-center gap-3 text-[13.5px]"><Check2 on={on[i]} /><span className="flex w-6 justify-center">{ic}</span>{n}</button></li>)}</ul></Panel>
          <Panel className="p-3"><PTitle icon={<Truck />} right={<ViewAll />}>Patrol Teams (Live)</PTitle>
            <ul className="divide-y divide-white/5 text-[13.5px]">{teams.map((t) => { const c = t.availability === 'available' ? '#58e05b' : t.availability === 'busy' ? '#ffd93a' : '#9aa5a0'; const s = t.availability === 'busy' ? 'Assigned' : t.availability === 'available' ? 'Available' : 'Off duty'; return <li key={t.id} className="grid grid-cols-[1fr_auto] items-center gap-2 py-2"><span className="min-w-0"><b className="block truncate">{t.name}</b><span className="text-xs text-[#cfe3c4]">{t.jurisdiction}</span></span><span className="flex items-center gap-1.5 text-[12.5px]" style={{ color: c }}><Dot c={c} />{s}</span></li>; })}</ul></Panel>
          <Panel className="p-3"><PTitle icon={<CalendarDays />}>Patrol Planning</PTitle>
            <div className="text-[13px]">Select Area</div>
            <select aria-label="Area" value={area} onChange={(e) => setArea(e.target.value)} className="mt-1 w-full rounded-xl border border-[var(--nf-line)] bg-[#0b2113] px-3 py-2.5 text-sm">{['Gosaba Range', 'Sajnekhali Range', 'Basanti Range', 'Canning Range', 'Namkhana Range'].map((a) => <option key={a}>{a}</option>)}</select>
            <div className="mt-2 text-[13px]">Date</div><span className="nf-pill mt-1 !flex !w-full !justify-start !gap-2 !rounded-xl !py-2.5"><CalendarDays className="h-4 w-4" />05 Nov 2026</span>
            <button onClick={() => run('Plan Patrol Route')} className="nf-btn mt-3 w-full !py-3"><Route className="h-4 w-4" />Plan patrol · {area}</button></Panel>
        </div>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1.15fr_1fr_1.1fr]">
        <Panel className="p-3"><PTitle icon={<BarChart3 />} right={<Select2 className="!py-1 text-xs">Last 30 Days</Select2>}>Hotspot Trends</PTitle><Lines area data={trend} keys={[{ k: 'v', c: '#8fdc2f' }]} height={150} /></Panel>
        <Panel className="p-3"><PTitle icon={<Flame />}>Top Hotspot Zones</PTitle>
          <ul className="space-y-3">{[...hotspots].sort((a, b) => b.count - a.count).slice(0, 4).map((h, i) => { const max = Math.max(...hotspots.map((x) => x.count), 1); const c = h.risk === 'high' || h.risk === 'critical' ? 'linear-gradient(90deg,#ff3b3b,#ff7a3b)' : h.risk === 'medium' ? 'linear-gradient(90deg,#ffa41c,#ff8a2a)' : 'linear-gradient(90deg,#ffd93a,#ffc21a)'; return <li key={h.id} className="grid grid-cols-[26px_1fr] items-center gap-3"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-[var(--nf-lime)] text-xs">{i + 1}</span><div><div className="flex justify-between text-[13.5px]"><span>{h.name}</span><span>{h.count} incidents</span></div><Meter pct={Math.round((h.count / max) * 100)} color={c} h={6} className="mt-1" /><p className="text-[11.5px] text-[#cfe3c4]">{h.advisory}</p></div></li>; })}</ul></Panel>
        <Panel className="p-3"><PTitle icon={<Target />}>Patrol Coverage</PTitle>
          <div className="flex flex-wrap items-center gap-4"><div className="relative h-[120px] w-[120px] shrink-0"><svg width="120" height="120" className="-rotate-90"><circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,.12)" strokeWidth="10" /><circle cx="60" cy="60" r="50" fill="none" stroke="#a8f43a" strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 50 * 0.87} 999`} /></svg><div className="absolute inset-0 flex flex-col items-center justify-center text-center leading-tight"><b className="text-[24px]">87%</b><span className="text-[11px]">Area Covered</span></div></div>
            <ul className="space-y-2 text-[13px]"><li className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-[var(--nf-lime)]" />Covered<b className="ml-3">732 km</b></li><li className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm bg-white/40" />Pending<b className="ml-2">109 km</b></li><li className="pt-1.5">Total Area<b className="ml-4">841 km</b></li></ul></div></Panel>
      </div>
    </>
  );
}
void [Check, Plus, Maximize2, Trophy, DroneIcon];
