import { useState } from 'react';
import { useRun } from '../actions';
import { useStore } from '../../lib/store';
import { Layers, Users, ShieldCheck, Mountain, Trees, Map as MapIcon, Plus, Zap, UserCog, Route, Pencil, BarChart3, CalendarDays, Check, MapPin, Shield, Crown } from 'lucide-react';
import { Banner, Kpi, KpiRow, Panel, PTitle, Pills, ViewAll, Check2, Tag, DroneIcon, Select2, img, TableWrap } from '../kit';
import NeonMap, { MapLabel, Heat, ReserveLabel } from '../NeonMap';

const teams = [
  ['GOS-01', 'Gosaba Range', 'Patrol & Monitoring', 'Active', 8, 1], ['SAJ-02', 'Sajnekhali Sector', 'Anti-Poaching', 'Active', 10, 2], ['PAK-03', 'Pakhirala Range', 'Habitat Protection', 'On Duty', 8, 1],
  ['NAM-04', 'Namkhana Range', 'Community Outreach', 'Active', 7, 1], ['BAS-05', 'Basanti Division', 'Incident Response', 'Standby', 9, 1],
] as const;
const units = [
  [1, 'Sundarbans Tiger Reserve', 'Protected Area', '2,585.9', 24, 186], [2, 'Gosaba Range', 'Range', '312.4', 7, 52], [3, 'Sajnekhali Sector', 'Sector', '284.7', 6, 48],
  [4, 'Pakhirala Range', 'Range', '276.9', 4, 36], [5, 'Namkhana Range', 'Range', '248.3', 5, 40], [6, 'Basanti Division', 'Division', '512.1', 5, 44],
] as const;
const quick = [[Plus, 'Create Jurisdiction'], [Users, 'Form New Team'], [Route, 'Assign Coverage Area'], [DroneIcon, 'Allocate Drones / Assets'], [Pencil, 'Update Team Members'], [BarChart3, 'View Team Performance']] as const;

const Zone = ({ n, t }: { n: string; t: number }) => <span className="flex flex-col items-center text-center text-[13px] font-bold leading-tight text-white [text-shadow:0_1px_3px_#000]">{n}<span className="mt-0.5 flex items-center gap-1 text-[12px] font-medium"><Users className="h-3.5 w-3.5 text-[var(--nf-lime)]" />{t} Teams</span></span>;
const Hot = () => <span className="relative flex h-6 w-6 items-center justify-center"><i className="nf-pulse absolute inset-0 rounded-full bg-red-500/60" /><i className="h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600" /></span>;

export default function AdminJurisdictions() {
  const run = useRun();
  const liveTeams = useStore((s) => s.teams);
  const [tab, setTab] = useState('overview');
  const [layers, setLayers] = useState([true, true, true, true, true]);
  const legend = [['Jurisdiction Boundary', <i key="a" className="h-3 w-5 rounded-full border border-[#e8ff4a]" />], ['Team Deployment', <Users key="b" className="h-4 w-4 text-[var(--nf-lime)]" />], ['Patrol Route', <i key="c" className="w-5 border-t-2 border-dashed border-white" />], ['Hotspot / Incident', <i key="d" className="h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600" />], ['Protected Area', <Trees key="e" className="h-4 w-4 text-[var(--nf-lime)]" />]] as const;
  return (
    <>
      <Banner icon={<MapIcon />} title="Jurisdictions &" accent="Teams" crumbs={['Admin', 'Jurisdictions & Teams']} sub="Manage forest jurisdictions, field teams, patrol units, and their coverage areas." />
      <KpiRow cols={6}>
        <Kpi icon={<Layers />} value="6" label="Jurisdictions" /><Kpi icon={<Users />} value={liveTeams.length} label="Field Teams" /><Kpi icon={<ShieldCheck />} value={liveTeams.reduce((a, t) => a + t.members, 0)} label="Members on teams" />
        <Kpi icon={<Users />} value="732" label="Assigned Officials" /><Kpi icon={<Mountain />} value="3,420 km²" label="Total Coverage" /><Kpi icon={<Trees />} value="12" label="Protected Areas" sub="(2 National Parks)" />
      </KpiRow>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'overview', label: 'Overview' }, { id: 'j', label: 'Jurisdictions' }, { id: 't', label: 'Teams' }, { id: 'p', label: 'Patrol Units' }, { id: 'c', label: 'Coverage & Allocation' }, { id: 'perf', label: 'Team Performance' }]} />
        <Select2 icon={<CalendarDays className="h-4 w-4" />}>This Month</Select2>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.05fr_1fr]">
        <Panel className="p-3"><PTitle icon={<MapIcon />}>Jurisdiction Map &amp; Team Deployment</PTitle>
          <NeonMap height={330} zoom={8.5} center={[88.7, 22.0]} items={[
            { lng: 88.45, lat: 22.4, node: <Zone n="Sajnekhali Division" t={6} /> }, { lng: 88.85, lat: 22.35, node: <Zone n="Basanti Division" t={5} /> }, { lng: 88.4, lat: 22.0, node: <Zone n="Pakhirala Range" t={4} /> },
            { lng: 88.45, lat: 21.78, node: <Zone n="Namkhana Range" t={5} /> }, { lng: 89.05, lat: 21.85, node: <Zone n="Gosaba Range" t={7} /> }, { lng: 88.85, lat: 22.0, node: <ReserveLabel /> },
            { lng: 88.52, lat: 22.12, node: <Hot />, z: 3 }, { lng: 88.72, lat: 21.82, node: <Hot />, z: 3 },
          ]} routes={[{ pts: [[88.4, 22.3], [88.55, 22.15], [88.7, 22.0], [88.6, 21.85]], color: '#fff' }]}>
            <div className="absolute right-12 top-3 w-[150px] rounded-xl border border-[var(--nf-line)] bg-[#0a2411]/90 p-2 text-[11px]">{legend.map(([n, ic], i) => <label key={n as string} className="flex cursor-pointer items-center gap-1.5 py-[3px]" onClick={() => setLayers((l) => l.map((x, j) => (j === i ? !x : x)))}><Check2 on={layers[i]} className="!h-4 !w-4" /><span className="flex w-5 justify-center">{ic}</span>{n as string}</label>)}</div>
          </NeonMap></Panel>
        <Panel className="p-3"><PTitle icon={<Users />} right={<span className="flex items-center gap-3"><ViewAll /><button onClick={() => run('Create Team')} className="nf-btn !py-2"><Plus className="h-4 w-4" />Create Team</button></span>}>Teams ({liveTeams.length})</PTitle>
          <ul className="space-y-1.5">{liveTeams.map((t, i) => {
            const id = t.id; const area = t.jurisdiction; const role = t.capabilities[0] ?? 'Patrol'; const st = t.availability === 'busy' ? 'On Duty' : t.availability === 'available' ? 'Active' : 'Standby'; const n = t.members; const d = 0;
            return (
            <li key={id} className="flex items-center gap-3 rounded-xl border border-white/5 bg-[#0f321a]/60 p-1.5">
              <img src={img(`team-${(i % 5) + 1}.jpg`)} alt="" className="h-[46px] w-[84px] shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1 leading-tight"><div className="font-bold">Team {id}</div><div className="truncate text-[12.5px] text-[#d4e4cc]">{area} • {role}</div></div>
              <Tag c={st === 'Active' ? 'green' : st === 'On Duty' ? 'blue' : 'gray'} className="!rounded-lg !px-3 !py-1 text-[12.5px] !font-medium">{st}</Tag>
              <span className="flex w-10 items-center gap-1"><Users className="h-4 w-4" />{n}</span><span className="px-1 text-lg leading-none">{t.assignment ? '•' : ''}</span></li>); })}</ul></Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.45fr_1fr_0.62fr]">
        <Panel className="p-3"><PTitle icon={<Layers />} right={<ViewAll />}>Jurisdiction Units (24)</PTitle>
          <TableWrap><table className="w-full text-[13.5px]"><thead><tr className="nf-th text-left"><th className="py-1.5">#</th><th>Jurisdiction / Unit</th><th>Type</th><th>Area (km²)</th><th>Teams</th><th>Officials</th><th>Status</th></tr></thead>
            <tbody>{units.map(([i, n, t, a, tm, o]) => <tr key={i} className={`border-t border-white/5 ${i === 1 ? 'bg-[#3a4a10]/50 outline outline-1 outline-[#c5d92a]' : ''}`}><td className="py-1.5 pl-1">{i}</td><td><span className="flex items-center gap-2">{i === 1 ? <Trees className="h-4 w-4 text-[var(--nf-lime)]" /> : <MapPin className="h-4 w-4 text-[var(--nf-lime)]" />}{n}</span></td><td><span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">{t}</span></td><td>{a}</td><td>{tm}</td><td>{o}</td><td><Tag c="green" className="!rounded-md !bg-[#58b51a] !text-white !px-3">Active</Tag></td></tr>)}</tbody></table></TableWrap></Panel>
        <Panel className="p-3"><PTitle icon={<Route />}>Team Structure &amp; Allocation</PTitle>
          <div className="flex flex-col items-center gap-0 text-center text-[12.5px] leading-tight">
            <div className="flex items-center gap-2 rounded-lg border border-[var(--nf-lime)] bg-[#0f321a] px-3 py-1.5"><Shield className="h-8 w-8 text-[var(--nf-lime)]" /><span className="text-left">Divisional Forest Officer (DFO)<br /><span className="text-[#cfe3c4]">Sundarbans Division</span></span></div>
            <i className="h-4 w-px bg-[var(--nf-lime)]" /><i className="h-px w-[78%] bg-[var(--nf-lime)]" />
            <div className="grid w-full grid-cols-3 gap-2 pt-0"><div className="flex flex-col items-center"><i className="h-3 w-px bg-[var(--nf-lime)]" /><span className="w-full rounded-lg border border-[var(--nf-lime)] bg-[#0f321a] p-1.5"><Mountain className="mx-auto h-5 w-5 text-[var(--nf-lime)]" />Range Officers (4)</span></div><div className="flex flex-col items-center"><i className="h-3 w-px bg-[var(--nf-lime)]" /><span className="w-full rounded-lg border border-[var(--nf-lime)] bg-[#0f321a] p-1.5"><Users className="mx-auto h-5 w-5 text-[var(--nf-lime)]" />Sector Teams (8)</span></div><div className="flex flex-col items-center"><i className="h-3 w-px bg-[var(--nf-lime)]" /><span className="w-full rounded-lg border border-[var(--nf-lime)] bg-[#0f321a] p-1.5"><DroneIcon size={20} className="mx-auto text-[var(--nf-lime)]" />Special Units<br /><span className="text-[11px]">(Drone, Rapid, SOS)</span></span></div></div>
            <i className="h-3 w-px bg-[var(--nf-lime)]" />
            <div className="flex w-full items-center justify-center gap-3 rounded-lg border border-[var(--nf-lime)] bg-[#0f321a] p-2"><Users className="h-8 w-8 text-[var(--nf-lime)]" /><span className="text-left"><b className="text-[14px]">Field Teams (86)</b><br />Patrol • Monitoring • Response • Outreach</span></div></div></Panel>
        <Panel className="p-3"><PTitle icon={<Zap />}>Quick Actions</PTitle>
          <div className="space-y-1.5">{quick.map(([I, t]) => <button key={t} onClick={() => run(t)} className="nf-btn ghost w-full !justify-start !rounded-lg !border-[#5aa02a] !py-2 !text-[13px]"><I className="h-[18px] w-[18px] text-[var(--nf-lime)]" size={18} />{t}</button>)}</div></Panel>
      </div>
    </>
  );
}
