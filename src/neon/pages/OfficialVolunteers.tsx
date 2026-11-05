import { useState } from 'react';
import { useRun } from '../actions';
import { Users, CheckCircle2, Clipboard, TriangleAlert, MapPin, Star, Plus, Megaphone, GraduationCap, Award, UserPlus, ChevronRight, Clock, Leaf, Zap } from 'lucide-react';
import { Banner, KpiRow, Kpi, Panel, PTitle, Pills, SearchBox, ViewAll, Dot } from '../kit';
import NeonMap, { ReserveLabel, MapLabel } from '../NeonMap';
import { useStore } from '../../lib/store';
import { PLACES } from '../../lib/utils';
import { fmtDate } from '../../lib/utils';

export default function OfficialVolunteers() {
  const run = useRun();
  const users = useStore((s) => s.users);
  const tasks = useStore((s) => s.tasks);
  const reports = useStore((s) => s.reports);
  const [tab, setTab] = useState('ov');
  const [q, setQ] = useState('');
  const vols = users.filter((u) => u.role === 'approved_volunteer');
  const list = vols.filter((u) => `${u.name} ${u.region} ${u.uid}`.toLowerCase().includes(q.toLowerCase()));
  const open = tasks.filter((t) => t.status === 'open');
  const byRegion = Object.entries(vols.reduce<Record<string, number>>((a, u) => { a[u.region] = (a[u.region] ?? 0) + 1; return a; }, {}));

  return (
    <>
      <Banner icon={<Users />} title="Volunteer" accent="Management" crumbs={['Dashboard', 'Volunteer Management']} sub="Onboard, coordinate, and engage community volunteers (Van Mitra) for conservation and rapid response." />
      <KpiRow cols={6}>
        <Kpi icon={<Users />} value={vols.length} label="Total Volunteers" />
        <Kpi icon={<CheckCircle2 />} value={vols.filter((u) => u.status === 'active').length} label="Active" />
        <Kpi icon={<Clipboard />} value={open.length} label="Open Tasks" />
        <Kpi tone="red" icon={<TriangleAlert />} value={tasks.filter((t) => t.urgency === 'high' && t.status === 'open').length} label="Urgent Tasks" />
        <Kpi icon={<MapPin />} value={byRegion.length} label="Coverage Areas" />
        <Kpi color="yellow" icon={<Star />} value={vols.filter((u) => u.verified !== false).length} label="Verified" />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'ov', label: 'Overview' }, { id: 'list', label: `Volunteer List (${vols.length})` }, { id: 'fa', label: `Field Tasks (${open.length})` }, { id: 'en', label: 'Recent Reports' }]} />
        <div className="ml-auto min-w-0 flex-1 sm:max-w-[360px]"><SearchBox value={q} onChange={setQ} placeholder="Search volunteer (name, area)..." /></div>
      </div>
      {(tab === 'ov' || tab === 'list') && (
        <div className="grid gap-3 xl:grid-cols-[1.28fr_1fr_0.72fr]">
          <Panel className="p-3"><PTitle icon={<Clipboard />}>Volunteer Distribution</PTitle>
            <NeonMap height={268} zoom={8.6} center={[88.72, 22.0]} items={[
              ...byRegion.map(([n, c]) => { const g = PLACES[n]; return g ? { lng: g.lng, lat: g.lat, node: <MapLabel>{n}<br />({c})</MapLabel> } : null; }).filter(Boolean) as { lng: number; lat: number; node: JSX.Element }[],
              { lng: 88.95, lat: 21.8, node: <ReserveLabel /> },
            ]} /></Panel>
          <Panel className="p-3"><PTitle icon={<Users />} right={<ViewAll to="/admin/users" />}>Van Mitra</PTitle>
            <ul className="space-y-2">{list.map((u) => <li key={u.uid} className="flex items-center gap-3 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-2.5 py-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#17391f] text-xs font-bold">{u.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span><span className="min-w-0 flex-1 leading-tight"><b className="block truncate">{u.name}</b><span className="text-[12.5px] text-[#d4e4cc]">{u.region}</span></span><span className="flex items-center gap-1.5 text-[13px]"><Dot c={u.status === 'active' ? '#58e05b' : '#ff5a5a'} />{u.status}</span></li>)}
              {list.length === 0 && <li className="py-4 text-center text-sm text-[var(--muted)]">No volunteer matches.</li>}</ul></Panel>
          <Panel className="p-3"><PTitle icon={<Zap />}>Quick Actions</PTitle>
            <div className="space-y-2"><button onClick={() => run('Assign Field Task')} className="nf-btn w-full !justify-start !py-2.5"><Plus className="h-4 w-4" />Assign Field Task</button>{[[Megaphone, 'Send Alert / Broadcast'], [GraduationCap, 'Create Training'], [Award, 'Issue Certificate'], [UserPlus, 'Add New Volunteer']].map(([I, t]) => { const Ic = I as typeof Plus; return <button key={t as string} onClick={() => run(t as string)} className="nf-btn ghost w-full !justify-start !border-[#5aa02a] !py-2.5"><Ic className="h-4 w-4 text-[var(--nf-lime)]" />{t as string}</button>; })}</div></Panel>
        </div>
      )}
      {(tab === 'ov' || tab === 'fa' || tab === 'en') && (
        <div className="grid gap-3 xl:grid-cols-2">
          {(tab === 'ov' || tab === 'fa') && <Panel className="p-3"><PTitle icon={<Clipboard />}>Open field tasks</PTitle>
            <ul className="divide-y divide-white/10 text-sm">{open.filter((t) => t.title.toLowerCase().includes(q.toLowerCase())).map((t) => <li key={t.id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><b className="block truncate">{t.title}</b><span className="text-xs text-[var(--muted)]">{t.place} · {t.urgency} · {t.accepted.length}/{t.capacity} accepted · due {fmtDate(t.deadline)}</span></span><ChevronRight className="h-4 w-4 shrink-0" /></li>)}</ul></Panel>}
          {(tab === 'ov' || tab === 'en') && <Panel className="p-3"><PTitle icon={<Clock />}>Reports by volunteers</PTitle>
            <ul className="divide-y divide-white/10 text-sm">{reports.filter((r) => vols.some((u) => u.name === r.reporterName)).slice(0, 6).map((r) => <li key={r.id} className="flex items-center justify-between gap-2 py-2"><span className="min-w-0"><b className="block truncate capitalize">{r.animal} · {r.location.label}</b><span className="text-xs text-[var(--muted)]">{r.reporterName}</span></span><span className="text-xs capitalize">{r.status.replace('_', ' ')}</span></li>)}
              {reports.filter((r) => vols.some((u) => u.name === r.reporterName)).length === 0 && <li className="py-4 text-center text-[var(--muted)]">No volunteer-filed reports in the seed yet.</li>}</ul></Panel>}
        </div>
      )}
    </>
  );
}
void Leaf;
