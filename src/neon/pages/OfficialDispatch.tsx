import { useMemo, useState } from 'react';
import { useRun } from '../actions';
import { Truck, Siren, Timer, Target, CheckCircle2, Tent, Users, MapPin, Clock, ShieldCheck, Megaphone, Radio, FilePen, Phone, ChevronDown, FileText, TriangleAlert, Map as MapIcon, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, KpiRow, Kpi, Panel, PTitle, Pills, SearchBox, FilterBtn, Timeline, TabsLine, DroneIcon, ViewAll, Dot } from '../kit';
import NeonMap, { MapLabel, ReserveLabel, Pin } from '../NeonMap';
import { useStore } from '../../lib/store';
import { fmtDate } from '../../lib/utils';
import type { SOS, Team } from '../../lib/types';

const FLOW = ['received', 'acknowledged', 'dispatching', 'en_route', 'on_scene', 'resolved'] as const;
const LABEL: Record<string, string> = { received: 'Report Received', acknowledged: 'Acknowledged', dispatching: 'Team Dispatched', en_route: 'Team En Route', on_scene: 'On-ground Assessment', resolved: 'Incident Resolved' };

export default function OfficialDispatch() {
  const run = useRun();
  const { sos, teams, reports, drones } = useStore((s) => ({ sos: s.sos, teams: s.teams, reports: s.reports, drones: s.drones }));
  const [tab, setTab] = useState('live');
  const [dt, setDt] = useState('Incident');
  const [q, setQ] = useState('');
  const [filt, setFilt] = useState('All');
  const [selId, setSelId] = useState<string | null>(null);

  const active = sos.filter((s) => !s.cancelled && s.responseStatus !== 'cancelled');
  const live = active.filter((s) => !['resolved'].includes(s.responseStatus));
  const deployed = teams.filter((t) => t.availability === 'busy' || t.assignment);
  const resolved = active.filter((s) => s.responseStatus === 'resolved');
  const ackMins = resolved.map((s) => { const e = s.events.find((x) => x.to === 'acknowledged'); return e ? (+new Date(e.at) - +new Date(s.createdAt)) / 60000 : 0; }).filter(Boolean);
  const avg = ackMins.length ? Math.round(ackMins.reduce((a, b) => a + b, 0)) / ackMins.length : 0;
  const onTime = resolved.length ? Math.round((resolved.filter((s) => { const e = s.events.find((x) => x.to === 'acknowledged'); return e && (+new Date(e.at) - +new Date(s.createdAt)) / 60000 <= s.slaMinutes; }).length / resolved.length) * 100) : 0;
  const air = drones.filter((d) => d.status === 'patrolling' || d.status === 'returning').length;

  const rows = useMemo(() => {
    const src = tab === 'hist' ? active.filter((s) => s.responseStatus === 'resolved') : tab === 'team' ? active.filter((s) => s.assignedTeam) : live;
    return src.filter((s) => {
      const team = teams.find((t) => t.id === s.assignedTeam);
      const blob = `${s.id} ${s.type} ${s.location.label} ${team?.name ?? ''}`.toLowerCase();
      if (!blob.includes(q.toLowerCase())) return false;
      if (filt === 'High severity' && !/tiger|elephant|attack|leopard/i.test(s.type)) return false;
      if (filt === 'Medium severity' && /tiger|elephant|attack|leopard/i.test(s.type)) return false;
      return true;
    });
  }, [tab, active, live, q, filt, teams]);
  const sel: SOS | undefined = active.find((s) => s.id === selId) ?? rows[0] ?? live[0];
  const team: Team | undefined = sel?.assignedTeam ? teams.find((t) => t.id === sel.assignedTeam) : undefined;
  const idx = sel ? FLOW.indexOf(sel.responseStatus as typeof FLOW[number]) : -1;

  return (
    <>
      <Banner icon={<Truck />} title="Dispatch &" accent="Response" crumbs={['Dashboard', 'Dispatch & Response']} sub="Assign field teams, coordinate response, and track on-ground action in real time." />
      <KpiRow cols={6}>
        <Kpi tone="red" icon={<Siren />} value={live.length} label="Active Incidents" />
        <Kpi icon={<Truck />} value={deployed.length} label="Teams Deployed" />
        <Kpi color="yellow" icon={<Timer />} value={avg ? `${Math.round(avg)} min` : '—'} label="Avg. Acknowledge" />
        <Kpi icon={<CheckCircle2 />} value={`${onTime}%`} label="Within SLA" />
        <Kpi icon={<Tent />} value={teams.length} label="Field Teams" />
        <Kpi icon={<DroneIcon />} value={air} label="Drones Airborne" />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'live', label: `Live (${live.length})` }, { id: 'team', label: `Assigned (${active.filter((s) => s.assignedTeam).length})` }, { id: 'assign', label: `Open reports (${reports.filter((r) => r.status === 'verified' && !r.assignedTeam).length})` }, { id: 'hist', label: `History (${resolved.length})` }]} />
        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-[480px]"><SearchBox value={q} onChange={setQ} placeholder="Search incident, team, location..." /><FilterBtn value={filt === 'All' ? undefined : filt} onChange={setFilt} /></div>
      </div>
      {tab === 'assign' ? (
        <Panel className="p-3"><PTitle icon={<FileText />} right={<ViewAll to="/official/reports" />}>Verified reports waiting for a team</PTitle>
          <ul className="divide-y divide-white/10 text-sm">{reports.filter((r) => r.status === 'verified' && !r.assignedTeam).slice(0, 8).map((r) => <li key={r.id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><b className="capitalize">{r.animal}</b> · {r.location.label}<div className="text-xs text-[var(--muted)]">{r.id}</div></span><a href="/official/reports" className="nf-btn !py-1 !text-xs">Assign</a></li>)}
            {reports.filter((r) => r.status === 'verified' && !r.assignedTeam).length === 0 && <li className="py-6 text-center text-[var(--muted)]">Every verified report already has a team.</li>}</ul></Panel>
      ) : (
        <div className="grid gap-3 xl:grid-cols-[1.12fr_0.92fr_0.72fr]">
          <Panel className="p-3"><PTitle icon={<MapIcon />}>Live Deployment Map</PTitle>
            <NeonMap height={348} zoom={9} center={[sel?.location.lng ?? 88.75, sel?.location.lat ?? 22.1]} items={[
              { lng: 88.62, lat: 22.2, node: <MapLabel>Gosaba</MapLabel> }, { lng: 88.9, lat: 22.12, node: <MapLabel>Basanti</MapLabel> }, { lng: 88.5, lat: 22.0, node: <MapLabel>Pakhirala</MapLabel> }, { lng: 89.1, lat: 22.0, node: <MapLabel>Sajnekhali</MapLabel> }, { lng: 88.97, lat: 21.82, node: <ReserveLabel /> },
              ...live.slice(0, 5).map((s) => ({ lng: s.location.lng, lat: s.location.lat, z: 3, node: <span className="relative flex h-14 w-14 items-center justify-center"><i className="nf-pulse absolute inset-0 rounded-full bg-red-500/40" /><Pin c="#e5242b" size={30}><Siren className="h-3.5 w-3.5" /></Pin></span> })),
              ...deployed.slice(0, 4).map((t, i) => ({ lng: 88.5 + i * 0.12, lat: 21.95 + (i % 2) * 0.12, z: 2, node: <Pin c="#16401c" size={32}><Truck className="h-4 w-4 text-[var(--nf-lime)]" /></Pin> })),
            ]} />
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]"><span className="flex items-center gap-1.5"><Dot c="#ff3b3b" />Active SOS</span><span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-[var(--nf-lime)]" />Deployed team</span></div></Panel>
          {sel ? (
            <Panel className="p-3">
              <div className="flex items-center justify-between gap-2 text-[12.5px]"><span className="flex items-center gap-1.5 rounded-full bg-[#c92a2a] px-3 py-1 font-semibold"><Siren className="h-3.5 w-3.5" />{sel.responseStatus.replace('_', ' ')}</span><span>ID: {sel.id}</span></div>
              <div className="mt-2"><h3 className="text-[19px] font-bold leading-tight">{sel.type}</h3><div className="mt-1 text-[12.5px]"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--nf-lime)]" />{sel.location.label}</span><span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{fmtDate(sel.createdAt)}</span></div></div>
              <div className="mt-2"><TabsLine value={dt} onChange={setDt} items={['Incident', 'Dispatch', 'Updates']} /></div>
              {dt === 'Incident' && <p className="mt-2 text-[13px] leading-snug text-[#dcebd3]">{sel.description}</p>}
              {dt === 'Dispatch' && <p className="mt-2 text-[13px]">{team ? <>{team.name} · {team.members} members · {team.phone}</> : 'No team assigned yet. Dispatch from SOS Management.'}</p>}
              {dt === 'Updates' && <ul className="mt-2 space-y-1 text-[13px]">{[...sel.events].reverse().map((e, i) => <li key={i} className="rounded-lg border border-[var(--nf-line)] px-2 py-1"><b>{LABEL[e.to] ?? e.to}</b> · {e.actor}</li>)}</ul>}
            </Panel>
          ) : <Panel className="p-6 text-center text-[var(--muted)]">No incident in this view.</Panel>}
          <Panel className="p-3"><PTitle icon={<Radio />}>Response Timeline</PTitle>
            {sel && <Timeline steps={FLOW.map((f, i) => { const ev = sel.events.find((e) => e.to === f); return { t: LABEL[f], time: ev ? fmtDate(ev.at) : 'Pending', state: (sel.responseStatus === 'resolved' || i < idx ? 'done' : i === idx ? 'now' : 'todo') as 'done' | 'now' | 'todo' }; })} />}
            <button disabled={!team} onClick={() => run('Send Update to Field Team')} className="nf-btn mt-3 w-full !py-2.5 disabled:opacity-40"><Radio className="h-4 w-4" />Send Update to Field Team <ChevronDown className="h-4 w-4" /></button></Panel>
        </div>
      )}
      {tab !== 'assign' && (
        <div className="grid gap-3 xl:grid-cols-[1.9fr_1fr]">
          <Panel className="p-3"><PTitle icon={<Truck />} right={<ViewAll to="/official/sos" />}>Deployments ({rows.length})</PTitle>
            <ul className="divide-y divide-white/10 text-[13px]">{rows.map((s) => {
              const tm = teams.find((t) => t.id === s.assignedTeam);
              return <li key={s.id}><button onClick={() => setSelId(s.id)} className={`flex w-full flex-wrap items-center gap-2 py-2 text-left ${sel?.id === s.id ? 'text-[var(--nf-lime)]' : ''}`}><Truck className="h-4 w-4" /><b className="w-24 shrink-0">{tm?.name ?? 'Unassigned'}</b><span className="min-w-0 flex-1 truncate"><MapPin className="mr-1 inline h-3.5 w-3.5" />{s.type} · {s.location.label}</span><span className="rounded-md bg-[#1b5fb5] px-2 py-0.5 text-xs">{s.responseStatus.replace('_', ' ')}</span>
                <span className="flex gap-2" onClick={(e) => e.stopPropagation()}><button aria-label="Call team" onClick={() => tm ? toast.success(`Dial ${tm.phone}`) : toast.info('No team assigned')}><Phone className="h-4 w-4 text-[var(--nf-lime)]" /></button></span></button></li>;
            })}{rows.length === 0 && <li className="py-6 text-center text-[var(--muted)]">Nothing matches.</li>}</ul></Panel>
          <Panel className="p-3"><PTitle icon={<Zap />}>Quick Actions</PTitle>
            <div className="grid grid-cols-3 gap-2">{[[Truck, 'Deploy Team'], [ShieldCheck, 'Coordinate with Police'], [DroneIcon, 'Activate Drone'], [Megaphone, 'Alert Nearby Villages'], [Radio, 'Inform Control Room'], [FilePen, 'Log Field Note']].map(([I, t]) => { const Ic = I as typeof Truck; return <button key={t as string} onClick={() => run(t as string)} className="flex h-[92px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-1 text-center text-[12.5px] leading-tight hover:border-[var(--nf-lime)]"><Ic className="h-6 w-6 text-[var(--nf-lime)]" size={24} />{t as string}</button>; })}</div></Panel>
        </div>
      )}
    </>
  );
}
