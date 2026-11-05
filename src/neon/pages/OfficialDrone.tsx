import { useState } from 'react';
import { useRun } from '../actions';
import { MapPin, Binoculars, TriangleAlert, Gauge, BatteryMedium, Signal, Clipboard, Route, Zap, CalendarDays, Maximize2, PawPrint } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, KpiRow, Kpi, Panel, PTitle, Pills, Dot, Meter, Select2, DroneIcon, img, TableWrap } from '../kit';
import NeonMap, { MapLabel, ReserveLabel, Heat } from '../NeonMap';
import { useStore } from '../../lib/store';
import type { Drone } from '../../lib/types';

const ST: Record<Drone['status'], string> = { patrolling: 'Patrolling', returning: 'Returning', charging: 'Charging', offline: 'Offline', maintenance: 'Maintenance' };

export default function OfficialDrone() {
  const run = useRun();
  const drones = useStore((s) => s.drones);
  const missions = useStore((s) => s.missions);
  const reports = useStore((s) => s.reports);
  const setDrone = useStore((s) => s.setDrone);
  const [tab, setTab] = useState('live');
  const [id, setId] = useState(drones.find((d) => d.status === 'patrolling')?.id ?? drones[0]?.id ?? '');
  const d = drones.find((x) => x.id === id) ?? drones[0];
  const air = drones.filter((x) => x.status === 'patrolling' || x.status === 'returning');
  const activeM = missions.filter((m) => m.status === 'in_progress');
  const day = reports.filter((r) => Date.now() - +new Date(r.submittedAt) < 864e5);
  const high = reports.filter((r) => (r.severity === 'high' || r.severity === 'critical') && Date.now() - +new Date(r.submittedAt) < 864e5);
  const avgBat = drones.length ? Math.round(drones.reduce((a, x) => a + x.battery, 0) / drones.length) : 0;
  const shown = tab === 'hist' ? missions.filter((m) => m.status === 'completed') : tab === 'plan' ? missions.filter((m) => m.status !== 'completed') : missions;

  return (
    <>
      <Banner icon={<DroneIcon />} title="Drone" accent="Patrol" crumbs={['Dashboard', 'Drone Patrol']} sub="Aerial monitoring, real-time detection, and rapid assessment for wildlife conflict prevention." />
      <KpiRow cols={6}>
        <Kpi icon={<DroneIcon />} value={drones.length} label={`Fleet (airborne ${air.length})`} />
        <Kpi icon={<MapPin />} value={activeM.length} label="Active Missions" />
        <Kpi icon={<Binoculars />} value={day.length} label="Reports (24h)" />
        <Kpi tone="red" icon={<TriangleAlert />} value={high.length} label="High-Risk (24h)" />
        <Kpi icon={<TriangleAlert />} value={`${Math.min(100, air.length * 23)}%`} label="Ranges with a drone" />
        <Kpi icon={<BatteryMedium />} value={`${avgBat}%`} label="Avg. Battery" />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'live', label: 'Live Patrol' }, { id: 'plan', label: 'Mission Planner' }, { id: 'fleet', label: 'Drone Fleet' }, { id: 'ai', label: 'Linked Reports' }, { id: 'hist', label: 'Completed' }]} />
        <div className="ml-auto"><Select2 icon={<MapPin className="h-4 w-4 text-[var(--nf-lime)]" />} options={drones.map((x) => x.name)} value={d?.name} onChange={(n) => { const next = drones.find((x) => x.name === n)?.id; if (next) setId(next); }} /></div>
      </div>
      {d && (tab === 'live' || tab === 'ai') && (
        <div className="grid gap-3 xl:grid-cols-[1.22fr_1fr]">
          <Panel className="p-3"><PTitle icon={<Dot c={d.status === 'patrolling' ? '#58e05b' : '#ffd93a'} />} right={<span className="flex items-center gap-2">{d.recording && <span className="rounded-md bg-[#d62a2a] px-3 py-0.5 text-xs font-bold">LIVE</span>}<Maximize2 className="h-4 w-4" /></span>}>Feed · {d.name}</PTitle>
            <div className="relative overflow-hidden rounded-xl"><img src={img('drone-feed.jpg')} alt={`${d.name} camera over ${d.zone}`} className="block w-full" />
              <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs">{d.zone} · {ST[d.status]}</span></div></Panel>
          <Panel className="p-3"><PTitle icon={<TriangleAlert />}>Patrol View</PTitle>
            <NeonMap height={284} zoom={9.3} center={[d.lng, d.lat]} items={[
              { lng: 88.78, lat: 22.28, node: <MapLabel>Gosaba</MapLabel> }, { lng: 89.15, lat: 22.14, node: <MapLabel>Sajnekhali</MapLabel> }, { lng: 89.0, lat: 21.82, node: <ReserveLabel /> },
              { lng: d.lng, lat: d.lat, z: 3, node: <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#ffd93a] bg-[#0b2a14] text-[#ffd93a]"><DroneIcon size={20} /></span> },
              ...reports.filter((r) => r.severity !== 'low').slice(0, 4).map((r) => ({ lng: r.location.lng, lat: r.location.lat, node: <Heat r={22} core={<i className="block h-3 w-3 rounded-full border-2 border-white bg-red-600" />} /> })),
            ]} /></Panel>
        </div>
      )}
      {d && tab === 'live' && (
        <div className="grid gap-3 xl:grid-cols-[1fr_1.22fr]">
          <Panel className="p-3"><PTitle icon={<DroneIcon />}>Telemetry · {d.name}</PTitle>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[[`${d.battery}%`, 'Battery', BatteryMedium], [`${d.altitude} m`, 'Altitude', TriangleAlert], [`${(d.speed / 3.6).toFixed(1)} m/s`, 'Speed', Gauge], [`${d.signal}%`, 'Link', Signal]].map(([v, l, I]) => { const Ic = I as typeof Gauge; return <div key={l as string} className="flex items-center gap-2"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-[var(--nf-lime)] text-[var(--nf-lime)]"><Ic className="h-5 w-5" /></span><div className="leading-tight"><b className="block text-[16px]">{v as string}</b><span className="text-[12px]">{l as string}</span></div></div>; })}</div></Panel>
          <Panel className="p-3"><PTitle icon={<PawPrint />}>Reports near this patrol</PTitle>
            <ul className="space-y-1 text-[13px]">{reports.slice(0, 4).map((r) => <li key={r.id} className="flex items-center justify-between gap-2 rounded-lg border border-[var(--nf-line)] px-2 py-1.5"><span className="capitalize">{r.animal} · {r.location.label}</span><b className="capitalize">{r.severity}</b></li>)}</ul></Panel>
        </div>
      )}
      {tab === 'fleet' && (
        <Panel className="p-3"><PTitle icon={<DroneIcon />}>Fleet</PTitle>
          <ul className="divide-y divide-white/10">{drones.map((x) => <li key={x.id} className="flex flex-wrap items-center gap-2 py-2 text-sm"><button onClick={() => { setId(x.id); setTab('live'); }} className="min-w-0 flex-1 text-left"><b>{x.name}</b> · {x.zone}<div className="text-xs text-[var(--muted)]">{ST[x.status]} · battery {x.battery}%</div></button>
            <Meter pct={x.battery} h={6} className="w-24" />
            {x.status !== 'patrolling' && x.status !== 'maintenance' && <button className="nf-btn !py-1 !text-xs" onClick={() => { setDrone(x.id, { status: 'patrolling', altitude: 80, speed: 24, recording: true }); toast.success(`${x.name} launched over ${x.zone}`); }}>Launch</button>}
            {x.status === 'patrolling' && <button className="nf-btn ghost !py-1 !text-xs" onClick={() => { setDrone(x.id, { status: 'returning', recording: false, speed: 30 }); toast.success(`${x.name} returning`); }}>Recall</button>}
          </li>)}</ul></Panel>
      )}
      {(tab === 'plan' || tab === 'hist' || tab === 'live') && (
        <div className="grid gap-3 xl:grid-cols-[1.75fr_0.85fr]">
          <Panel className="p-3"><PTitle icon={<Clipboard />}>{tab === 'hist' ? 'Completed missions' : 'Missions'} ({shown.length})</PTitle>
            <TableWrap><table className="w-full text-[13px]"><thead><tr className="nf-th text-left"><th>ID</th><th>Area</th><th>Objective</th><th>Drone</th><th>Status</th><th>Progress</th></tr></thead>
              <tbody>{shown.map((m) => <tr key={m.id} className="border-t border-white/5"><td className="py-2">{m.id}</td><td>{m.area}</td><td>{m.objective}</td><td>{drones.find((x) => x.id === m.droneId)?.name ?? m.droneId}</td><td className="capitalize">{m.status.replace('_', ' ')}</td><td><span className="flex items-center gap-2"><Meter pct={m.progress} h={5} className="w-20" />{m.progress}%</span></td></tr>)}</tbody></table></TableWrap></Panel>
          <Panel className="p-3"><PTitle icon={<Zap />}>Quick Actions</PTitle>
            <div className="space-y-2"><button onClick={() => run('Plan New Mission')} className="nf-btn w-full !py-2.5"><Route className="h-4 w-4" />Plan New Mission</button><button onClick={() => run('Launch Drone')} className="nf-btn ghost w-full !border-[#5aa02a] !py-2.5"><DroneIcon size={18} className="text-[var(--nf-lime)]" />Launch Drone</button><button onClick={() => run('Emergency Recon')} className="nf-btn ghost w-full !border-[#5aa02a] !py-2.5"><TriangleAlert className="h-4 w-4 text-[var(--nf-lime)]" />Emergency Recon</button></div></Panel>
        </div>
      )}
      {tab === 'ai' && <p className="text-center text-xs text-[var(--muted)]">Detections here are community reports inside the patrol window, not a live model score.</p>}
    </>
  );
}
void CalendarDays;
