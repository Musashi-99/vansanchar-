import { useMemo, useState } from 'react';
import { FileText, TriangleAlert, Hourglass, CheckCircle2, Users, ChevronRight, MapPin, Check, X, Megaphone, SquarePen, RefreshCw, ClipboardCheck, Clock, ListChecks, ChevronLeft, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, Kpi, KpiRow, Panel, Pills, SearchBox, Tag, Dot, TabsLine, KV, img, TableWrap } from '../kit';
import NeonMap, { Heat } from '../NeonMap';
import { useStore, VERIFIER_ROLES } from '../../lib/store';
import { openForm, actBroadcast } from '../actions';
import { fmtDate } from '../../lib/utils';
import type { Animal, Report, ReportStatus } from '../../lib/types';

const THUMB: Partial<Record<Animal, string>> = { tiger: 'th-tiger.jpg', crocodile: 'th-croc.jpg', elephant: 'th-elephant.jpg', boar: 'th-boar.jpg', snake: 'th-snake.jpg', leopard: 'th-leopard.jpg' };
const thumb = (a: Animal) => img(THUMB[a] ?? 'th-crop.jpg');
const sevC = { critical: '#ff3b3b', high: '#ff3b3b', medium: '#ffa41c', low: '#ffd93a' } as const;
const stLabel: Record<ReportStatus, string> = { pending: 'Pending', under_review: 'Under Review', verified: 'Verified', rejected: 'Rejected', resolved: 'Resolved' };
const stC = { pending: 'pend', under_review: 'blue', verified: 'green', rejected: 'red', resolved: 'green' } as const;
const PER = 8;

export default function OfficialReports() {
  const { reports, teams, user, transition, assignReport, addNote } = useStore((s) => ({ reports: s.reports, teams: s.teams, user: s.user, transition: s.transition, assignReport: s.assignReport, addNote: s.addNote }));
  const [tab, setTab] = useState('all');
  const [selId, setSelId] = useState<string | null>(null);
  const [dt, setDt] = useState('Details');
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [teamId, setTeamId] = useState('');

  const all = useMemo(() => reports.filter((r) => !r.withdrawn).sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt)), [reports]);
  const count = (s: ReportStatus) => all.filter((r) => r.status === s).length;
  const filtered = all.filter((r) => (tab === 'all' || r.status === tab) && `${r.id} ${r.animal} ${r.jurisdiction} ${r.location.label ?? ''} ${r.description}`.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PER, cur * PER);
  const r: Report | undefined = all.find((x) => x.id === selId) ?? rows[0];
  const canVerify = !!user && VERIFIER_ROLES.includes(user.role);
  const team = r?.assignedTeam ? teams.find((t) => t.id === r.assignedTeam) : undefined;
  const avail = teams.filter((t) => t.availability === 'available');

  const verify = (rep: Report) => { const x = transition(rep.id, 'verified'); x.ok ? toast.success(`${rep.id} verified`) : toast.error(x.error ?? 'Not allowed'); };
  const reject = (rep: Report) => openForm({ title: 'Mark report false', submit: 'Mark false', danger: true, fields: [{ key: 'r', label: 'Reason', type: 'textarea', required: true }], onSubmit: (v) => { const x = transition(rep.id, 'rejected', { reason: v.r }); x.ok ? toast.success('Report rejected') : toast.error(x.error ?? 'Not allowed'); } });
  const dispatch = (rep: Report) => {
    const id = teamId || avail[0]?.id;
    if (!id) return toast.error('No team available.');
    assignReport(rep.id, id); toast.success(`${teams.find((t) => t.id === id)?.name} assigned`); setTeamId('');
  };
  const guard = <T,>(fn: () => T) => { if (!canVerify) return toast.error('Only Range Officers and above can change report status.'); return fn(); };

  const steps = (rep: Report) => {
    const done = rep.status !== 'pending';
    return [['Report submitted by citizen', fmtDate(rep.submittedAt), 'done'], [rep.status === 'rejected' ? 'Marked false' : done ? 'Verified by official' : 'Pending verification', done ? 'Completed' : 'Awaiting official review', done ? 'done' : 'now'],
      ['Field team assigned', rep.assignedTeam ? (teams.find((t) => t.id === rep.assignedTeam)?.name ?? '') : '—', rep.assignedTeam ? 'done' : done ? 'now' : 'todo'], ['Resolved', rep.status === 'resolved' ? 'Closed' : '—', rep.status === 'resolved' ? 'done' : 'todo']];
  };

  return (
    <>
      <Banner icon={<FileText />} title="Incident" accent="Reports" crumbs={['Dashboard', 'Incident Reports']} sub="View, verify, assign, and manage wildlife conflict reports from the community." />
      <KpiRow cols={5}>
        <Kpi icon={<FileText />} value={all.length} label="Total Reports" /><Kpi tone="red" icon={<TriangleAlert />} value={all.filter((x) => x.severity === 'high' || x.severity === 'critical').length} label="High Risk" />
        <Kpi color="amber" icon={<Hourglass />} value={count('pending')} label="Pending Verification" /><Kpi icon={<CheckCircle2 />} value={count('verified')} label="Verified" /><Kpi icon={<Users />} value={all.filter((x) => x.assignedTeam).length} label="Team Assigned" />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={tab} onChange={(t) => { setTab(t); setPage(1); }} items={[{ id: 'all', label: `All (${all.length})` }, { id: 'pending', label: `Pending (${count('pending')})` }, { id: 'under_review', label: `Review (${count('under_review')})` }, { id: 'verified', label: `Verified (${count('verified')})` }, { id: 'resolved', label: `Resolved (${count('resolved')})` }, { id: 'rejected', label: `Rejected (${count('rejected')})` }]} />
        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-[420px]"><SearchBox value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by ID, location, animal..." /></div>
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.12fr_1fr]">
        <Panel className="p-2">
          <TableWrap><table className="w-full text-[13px]">
            <thead><tr className="nf-th text-left"><th className="py-2.5 pl-2">Report ID</th><th>Incident</th><th>Location</th><th>Time</th><th>Severity</th><th>Status</th><th /></tr></thead>
            <tbody>{rows.map((x) => (
              <tr key={x.id} onClick={() => { setSelId(x.id); setDt('Details'); }} className={`cursor-pointer border-t border-white/5 ${r?.id === x.id ? 'bg-[#2a4a14]/50 outline outline-1 outline-[var(--nf-lime)]' : 'hover:bg-white/5'}`}>
                <td className="whitespace-nowrap py-2 pl-2 pr-2 text-[12.5px]">{x.id}</td>
                <td><span className="flex items-center gap-2"><img src={thumb(x.animal)} alt="" className="h-[40px] w-[44px] rounded-md object-cover" /><span className="leading-tight"><b className="block text-[13px] capitalize">{x.animal}</b><span className="line-clamp-1 max-w-[180px] text-[11.5px] text-[#cfe3c4]">{x.description}</span></span></span></td>
                <td><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--nf-lime)]" />{x.jurisdiction.replace(' Range', '')}</span></td><td className="text-[12.5px] leading-tight">{fmtDate(x.submittedAt)}</td>
                <td><span className="flex items-center gap-1.5 capitalize"><Dot c={sevC[x.severity]} />{x.severity}</span></td><td><Tag c={stC[x.status]} className="!rounded-md !px-2.5">{stLabel[x.status]}</Tag></td><td><ChevronRight className="h-4 w-4" /></td></tr>))}
              {rows.length === 0 && <tr><td colSpan={7} className="py-8 text-center text-[var(--muted)]">No reports match.</td></tr>}</tbody></table></TableWrap>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-3 py-3 text-[12.5px]"><span>Showing {filtered.length ? (cur - 1) * PER + 1 : 0}–{Math.min(cur * PER, filtered.length)} of {filtered.length}</span>
            <span className="flex items-center gap-1.5"><button aria-label="Previous page" disabled={cur === 1} onClick={() => setPage(cur - 1)} className="disabled:opacity-30"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: Math.min(pages, 5) }, (_, i) => { const n = Math.max(1, Math.min(cur - 2, pages - 4)) + i; return n <= pages ? <button key={n} onClick={() => setPage(n)} className={`h-7 w-7 rounded-md ${cur === n ? 'bg-[var(--nf-lime)] font-bold text-black' : ''}`}>{n}</button> : null; })}
              <button aria-label="Next page" disabled={cur === pages} onClick={() => setPage(cur + 1)} className="disabled:opacity-30"><ChevronRight className="h-4 w-4" /></button></span></div>
        </Panel>

        {r ? (
          <Panel className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]"><Tag c={r.severity === 'low' ? 'low' : r.severity === 'medium' ? 'med' : 'high'} className="!rounded-lg !px-3 !py-1"><TriangleAlert className="h-3.5 w-3.5" />{r.severity} risk</Tag><span>Report ID: {r.id}</span><span>Reported: {fmtDate(r.submittedAt)}</span></div>
            <div className="mt-2 flex gap-3"><img src={thumb(r.animal)} alt="" className="h-[78px] w-[78px] rounded-lg object-cover" />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><h3 className="text-[20px] font-bold capitalize">{r.animal}</h3><Tag c={stC[r.status]}>{stLabel[r.status]}</Tag></div>
                <div className="text-[13px]"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--nf-lime)]" />{r.location.label ?? r.jurisdiction}</span><span className="text-[#cfe3c4]">By {r.reporterName}</span></div></div></div>
            <div className="mt-2"><TabsLine value={dt} onChange={setDt} items={['Details', 'Location', 'History']} /></div>
            {dt === 'Details' && (<div className="mt-2"><KV k="Animal" v={<span className="capitalize">{r.animal}</span>} /><KV k="Severity" v={<span className="flex items-center gap-1.5 capitalize"><Dot c={sevC[r.severity]} />{r.severity}</span>} /><KV k="Animals seen" v={r.count ?? '—'} /><KV k="Injury / damage" v={`${r.injury ? 'Injury' : 'No injury'} · ${r.damage ? 'Damage' : 'No damage'}`} /><KV k="Occurred" v={fmtDate(r.occurredAt)} />
              <div className="mt-1 text-[13px]"><b>Description</b><p className="text-[12.5px] leading-snug text-[#dcebd3]">{r.description}</p></div>{r.rejectReason && <p className="mt-1 text-xs text-[#ff8a8a]">Rejected: {r.rejectReason}</p>}</div>)}
            {dt === 'Location' && <div className="mt-2 overflow-hidden rounded-xl"><NeonMap height={200} zoom={10} center={[r.location.lng, r.location.lat]} scale={false} reserve={false} items={[{ lng: r.location.lng, lat: r.location.lat, node: <Heat r={28} core={<i className="block h-4 w-4 rounded-full border-2 border-white bg-red-600" />} /> }]} /></div>}
            {dt === 'History' && <ul className="mt-2 space-y-1.5 text-[13px]">{[...r.events].reverse().map((e, i) => <li key={i} className="rounded-lg border border-[var(--nf-line)] bg-[#0f321a]/50 px-3 py-1.5"><b className="capitalize">{e.to.replace('_', ' ')}</b> · {e.actor}<div className="text-xs text-[var(--muted)]">{fmtDate(e.at)}{e.note ? ` — ${e.note}` : ''}</div></li>)}</ul>}

            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/60 p-2.5"><h4 className="mb-1.5 flex items-center gap-2 text-[14px] font-bold"><ClipboardCheck className="h-4 w-4 text-[var(--nf-lime)]" />Verification &amp; Action</h4>
                <div className="flex items-center gap-2 text-[12.5px]"><span className="whitespace-nowrap">Verify Report</span><span className="ml-auto flex gap-1.5">
                  <button disabled={r.status === 'verified' || r.status === 'resolved' || r.status === 'rejected'} onClick={() => guard(() => verify(r))} className="nf-btn !rounded-md !px-3 !py-1 !text-xs disabled:opacity-40"><Check className="h-3.5 w-3.5" />Verify</button>
                  <button disabled={r.status === 'rejected' || r.status === 'resolved'} onClick={() => guard(() => reject(r))} className="nf-btn ghost !rounded-md !px-3 !py-1 !text-xs disabled:opacity-40"><X className="h-3.5 w-3.5" />Mark False</button></span></div>
                <div className="mt-2 text-[12.5px]">Assign to Field Team
                  {team ? <div className="mt-1 rounded-lg border border-[var(--nf-line)] px-2.5 py-1.5 text-xs"><b>{team.name}</b> · {team.jurisdiction}</div> : (
                    <div className="mt-1 flex gap-1.5"><select aria-label="Team" value={teamId || avail[0]?.id || ''} onChange={(e) => setTeamId(e.target.value)} className="min-w-0 flex-1 rounded-lg border border-[var(--nf-line)] bg-[#0b2113] px-2 py-1.5 text-xs">{avail.length === 0 && <option value="">None available</option>}{avail.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
                      <button disabled={r.status !== 'verified'} title={r.status !== 'verified' ? 'Verify the report first' : ''} onClick={() => guard(() => dispatch(r))} className="nf-btn !rounded-md !px-3 !py-1 !text-xs disabled:opacity-40"><Truck className="h-3.5 w-3.5" />Assign</button></div>)}</div></div>
              <div className="rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/60 p-2.5"><h4 className="mb-2 flex items-center gap-2 text-[14px] font-bold"><Clock className="h-4 w-4 text-[var(--nf-lime)]" />Response Timeline</h4>
                <ol className="space-y-2 text-[12.5px]">{steps(r).map(([t, s, st]) => <li key={t} className="flex gap-2"><span className={`mt-0.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 ${st === 'done' ? 'border-[#58e05b] bg-[#58e05b]' : st === 'now' ? 'border-[#ffd93a] bg-[#ffd93a]' : 'border-[#8a9a8a]'}`} /><span className="leading-tight"><b className="block font-semibold">{t}</b><span className="text-[11.5px] text-[#bcd2b0]">{s}</span></span></li>)}</ol></div>
            </div>
            <div className="mt-3 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/60 p-2.5"><h4 className="mb-1 flex items-center gap-2 text-[14px] font-bold"><ListChecks className="h-4 w-4 text-[var(--nf-lime)]" />Quick Actions</h4>
              <ul className="divide-y divide-white/5 text-[13px]">{([
                [Megaphone, 'Send Advisory to Nearby Villages', () => actBroadcast('citizen')],
                [SquarePen, 'Add Field Note / Update', () => openForm({ title: 'Add field note', submit: 'Save note', fields: [{ key: 'n', label: 'Note', type: 'textarea', required: true }], onSubmit: (v) => { addNote(r.id, v.n); toast.success('Note added'); } })],
                [RefreshCw, 'Mark as Under Review', () => guard(() => { const x = transition(r.id, 'under_review'); x.ok ? toast.success('Marked under review') : toast.error(x.error ?? 'Not allowed'); })],
                [CheckCircle2, 'Close as Resolved', () => guard(() => { const x = transition(r.id, 'resolved'); x.ok ? toast.success('Report resolved') : toast.error(x.error ?? 'Verify the report before closing.'); })],
              ] as const).map(([I, t, fn]) => <li key={t}><button onClick={fn} className="flex w-full items-center gap-2 py-[9px] text-left hover:text-[var(--nf-lime)]"><I className="h-4 w-4 text-[var(--nf-lime)]" /><span className="flex-1">{t}</span><ChevronRight className="h-4 w-4" /></button></li>)}</ul></div>
          </Panel>
        ) : <Panel className="p-6 text-center text-[var(--muted)]">No report selected.</Panel>}
      </div>
    </>
  );
}
