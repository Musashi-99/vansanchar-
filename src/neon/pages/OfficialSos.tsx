import { useMemo, useState } from 'react';
import { Siren, CheckCircle2, Timer, Users, Plus, MapPin, ChevronRight, Clock, TriangleAlert, FileText, Phone, Radio, Send, Activity, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, Kpi, KpiRow, Panel, PTitle, Pills, SearchBox, Tag, Timeline, DroneIcon, TabsLine, KV, Select2 } from '../kit';
import NeonMap from '../NeonMap';
import { useStore, VERIFIER_ROLES } from '../../lib/store';
import { useRun, openForm } from '../actions';
import { fmtDate } from '../../lib/utils';
import type { ResponseStatus, SOS } from '../../lib/types';

const FLOW: ResponseStatus[] = ['received', 'acknowledged', 'dispatching', 'en_route', 'on_scene', 'resolved'];
const LABEL: Record<string, string> = { received: 'SOS Received', acknowledged: 'Acknowledged', dispatching: 'Team Dispatching', en_route: 'Team En Route', on_scene: 'On Scene', resolved: 'Resolved', cancelled: 'Cancelled' };
const ago = (iso: string) => { const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); return m < 60 ? `${m} min ago` : m < 1440 ? `${Math.round(m / 60)} h ago` : `${Math.round(m / 1440)} d ago`; };
const isActive = (s: SOS) => !['resolved', 'cancelled'].includes(s.responseStatus);
const high = (s: SOS) => /tiger|elephant|attack|leopard/i.test(s.type) || s.verificationStatus === 'pending';

export default function OfficialSos() {
  const run = useRun();
  const { sos, teams, hospitals, drones0, user, sosAction } = useStore((s) => ({ sos: s.sos, teams: s.teams, hospitals: s.hospitals, drones0: s.flags.drones, user: s.user, sosAction: s.sosAction }));
  void drones0;
  const [tab, setTab] = useState('active');
  const [q, setQ] = useState('');
  const [selId, setSelId] = useState<string | null>(null);
  const [dt, setDt] = useState('Overview');
  const [teamId, setTeamId] = useState('');

  const list = useMemo(() => sos.filter((s) => !s.cancelled).filter((s) =>
    (tab === 'all' || (tab === 'active' && isActive(s)) || (tab === 'resp' && ['dispatching', 'en_route', 'on_scene'].includes(s.responseStatus)) || (tab === 'res' && s.responseStatus === 'resolved'))
    && `${s.id} ${s.type} ${s.location.label} ${s.requesterName}`.toLowerCase().includes(q.toLowerCase())).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)), [sos, tab, q]);
  const sel = sos.find((s) => s.id === selId) ?? list[0];
  const avail = teams.filter((t) => t.availability === 'available');
  const canVerify = !!user && VERIFIER_ROLES.includes(user.role);
  const active = sos.filter(isActive);
  const resolved = sos.filter((s) => s.responseStatus === 'resolved');
  const mins = resolved.map((s) => { const e = s.events.find((x) => x.to === 'acknowledged'); return e ? (+new Date(e.at) - +new Date(s.createdAt)) / 60000 : 0; }).filter(Boolean);
  const avg = mins.length ? Math.round(mins.reduce((a, b) => a + b, 0) / mins.length) : 0;
  const idx = sel ? FLOW.indexOf(sel.responseStatus) : -1;
  const team = sel?.assignedTeam ? teams.find((t) => t.id === sel.assignedTeam) : undefined;

  const dispatch = () => {
    if (!sel) return;
    const id = teamId || avail[0]?.id;
    if (!id) return toast.error('No team is available. Free a team first.');
    if (sel.assignedTeam) return toast.info('A team is already assigned.');
    if (sel.responseStatus === 'received') sosAction(sel.id, 'acknowledge');
    sosAction(sel.id, 'dispatch', id); sosAction(sel.id, 'status', 'en_route');
    toast.success(`${teams.find((t) => t.id === id)?.name} dispatched to ${sel.location.label}`); setTeamId('');
  };
  const nextStatus = () => {
    if (!sel || idx < 0 || idx >= FLOW.length - 1) return;
    const next = FLOW[idx + 1];
    if (next === 'resolved') return openForm({ title: 'Resolve SOS', submit: 'Mark resolved', fields: [{ key: 'n', label: 'Resolution note', type: 'textarea', required: true }], onSubmit: (v) => { sosAction(sel.id, 'resolve', v.n); if (sel.assignedTeam) useStore.getState().setTeamAvail(sel.assignedTeam, 'available'); toast.success('SOS resolved'); } });
    if (next === 'dispatching') return toast.info('Use Dispatch Team to assign a team.');
    sosAction(sel.id, next === 'acknowledged' ? 'acknowledge' : 'status', next);
  };

  return (
    <>
      <Banner icon={<Siren className="!text-[#ff4040]" />} title="SOS" accent="Management" crumbs={['Dashboard', 'SOS Management']} sub="Monitor, verify, and coordinate emergency wildlife response in real time." />
      <KpiRow cols={6}>
        <Kpi tone="red" icon={<Siren />} value={active.length} label="Active SOS" /><Kpi icon={<CheckCircle2 />} value={resolved.length} label="Resolved" />
        <Kpi color="yellow" icon={<Timer />} value={avg ? `${avg} min` : '—'} label="Avg. Acknowledge Time" /><Kpi icon={<Users />} value={avail.length} label="Field Teams Available" />
        <Kpi icon={<Plus />} value={hospitals.length} label="Linked Hospitals" /><Kpi icon={<DroneIcon />} value={3} label="Drones on Standby" />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'active', label: `Active (${active.length})` }, { id: 'resp', label: `In Response (${sos.filter((s) => ['dispatching', 'en_route', 'on_scene'].includes(s.responseStatus)).length})` }, { id: 'res', label: `Resolved (${resolved.length})` }, { id: 'all', label: `All (${sos.filter((s) => !s.cancelled).length})` }]} />
        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-[480px]"><SearchBox value={q} onChange={setQ} placeholder="Search by ID, location, type..." /></div>
      </div>
      <div className="grid gap-3 xl:grid-cols-[1fr_1.7fr_0.95fr]">
        <Panel className="p-2.5"><PTitle icon={<Siren />} right={<Select2 className="!py-0.5 text-xs">Latest</Select2>}>SOS Requests</PTitle>
          {list.length === 0 && <p className="p-4 text-center text-sm text-[var(--muted)]">No SOS in this view.</p>}
          <ul className="space-y-1.5">{list.map((s) => (
            <li key={s.id}><button onClick={() => { setSelId(s.id); setDt('Overview'); }} className={`flex w-full items-center gap-2.5 rounded-xl border p-2 text-left ${sel?.id === s.id ? 'border-[#ff4040] bg-[#4a1212]/60 shadow-[0_0_14px_rgba(255,59,59,.3)]' : 'border-transparent hover:bg-white/5'}`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#5a1010]/70"><Siren className="h-5 w-5 text-[#ff5a5a]" /></span>
              <span className="min-w-0 flex-1 leading-tight"><b className="block truncate text-[13px]">{s.type}</b><span className="flex items-center gap-1 text-[12px]"><MapPin className="h-3 w-3 shrink-0 text-[var(--nf-lime)]" /><span className="truncate">{s.location.label}</span></span>
                <span className="flex items-center gap-1 text-[11.5px] text-[#bcd2b0]"><Clock className="h-3 w-3" />{ago(s.createdAt)} · {LABEL[s.responseStatus]}</span></span>
              <Tag c={high(s) ? 'high' : 'med'} className="!rounded-lg !px-2.5">{high(s) ? 'High' : 'Medium'}</Tag><ChevronRight className="h-4 w-4 shrink-0" /></button></li>))}</ul>
        </Panel>

        {sel ? (
          <Panel className="p-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[12.5px]"><span className="flex items-center gap-1.5 rounded-full bg-[#c92a2a] px-3 py-1 font-semibold"><Siren className="h-3.5 w-3.5" />SOS #{sel.id}</span><span>Received: {fmtDate(sel.createdAt)}</span></div>
            <div className="mt-2 flex flex-wrap gap-3">
              <div className="min-w-0 flex-1"><h3 className="text-[22px] font-bold leading-tight">{sel.type}</h3>
                <div className="text-[13px]"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-[var(--nf-lime)]" />{sel.location.label}</span><span className="flex items-center gap-1 text-[#cfe3c4]"><Phone className="h-3.5 w-3.5" />{sel.requesterName} · {sel.requesterPhone}</span></div></div>
              <span className="h-fit shrink-0 rounded-xl border border-[#ff4040] bg-[#5a1010]/70 px-3 py-1.5 text-[13px] font-semibold"><TriangleAlert className="mr-1 inline h-4 w-4 text-[#ff5a5a]" />{high(sel) ? 'High Priority' : 'Medium Priority'}</span></div>
            <div className="mt-2"><TabsLine value={dt} onChange={setDt} items={['Overview', 'Location', 'History']} /></div>
            {dt === 'Overview' && (
              <div className="mt-2 grid gap-3 md:grid-cols-2">
                <div className="rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/50 p-2.5"><h4 className="mb-1 flex items-center gap-2 text-[14px] font-bold"><FileText className="h-4 w-4 text-[var(--nf-lime)]" />Incident Details</h4>
                  <KV k="Type" v={sel.type} /><KV k="Verification" v={<span className="capitalize">{sel.verificationStatus.replace('_', ' ')}</span>} /><KV k="Response SLA" v={`${sel.slaMinutes} min`} /><KV k="GPS accuracy" v={`±${sel.location.accuracy ?? '—'} m`} />
                  <div className="mt-1 text-[12.5px]"><b>Description</b><p className="leading-snug text-[#dcebd3]">{sel.description}</p></div></div>
                <div className="rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/50 p-2.5"><h4 className="mb-1.5 text-[14px] font-bold">Verification</h4>
                  {sel.verificationStatus === 'pending' || sel.verificationStatus === 'under_review' ? (
                    canVerify ? <div className="flex gap-2"><button onClick={() => { sosAction(sel.id, 'verify'); toast.success('SOS verified'); }} className="nf-btn flex-1 !py-2"><Check className="h-4 w-4" />Verify</button>
                      <button onClick={() => openForm({ title: 'Reject SOS', submit: 'Reject', danger: true, fields: [{ key: 'r', label: 'Reason', type: 'textarea', required: true }], onSubmit: (v) => { sosAction(sel.id, 'reject', v.r); toast.success('SOS rejected'); } })} className="nf-btn danger flex-1 !py-2"><X className="h-4 w-4" />Reject</button></div>
                      : <p className="text-[12.5px] text-[#ffd93a]">Only Range Officers and above can verify. You can still acknowledge and dispatch.</p>
                  ) : <Tag c={sel.verificationStatus === 'verified' ? 'green' : 'red'}>{sel.verificationStatus}</Tag>}
                  {sel.rejectReason && <p className="mt-1 text-xs text-[#ff8a8a]">Reason: {sel.rejectReason}</p>}
                </div>
              </div>
            )}
            {dt === 'Location' && <div className="mt-2 overflow-hidden rounded-xl"><NeonMap height={220} zoom={10.5} center={[sel.location.lng, sel.location.lat]} reserve={false} items={[{ lng: sel.location.lng, lat: sel.location.lat, node: <span className="relative flex h-14 w-14 items-center justify-center"><i className="nf-pulse absolute inset-0 rounded-full bg-red-500/50" /><i className="h-5 w-5 rounded-full bg-red-500" /></span> }]} /></div>}
            {dt === 'History' && <ul className="mt-2 space-y-1.5 text-[13px]">{[...sel.events].reverse().map((e, i) => <li key={i} className="rounded-lg border border-[var(--nf-line)] bg-[#0f321a]/50 px-3 py-1.5"><b>{LABEL[e.to] ?? e.to}</b> · {e.actor}<div className="text-xs text-[var(--muted)]">{fmtDate(e.at)}{e.note ? ` — ${e.note}` : ''}</div></li>)}</ul>}
          </Panel>
        ) : <Panel className="p-6 text-center text-[var(--muted)]">Select an SOS to see details.</Panel>}

        <div className="min-w-0 space-y-3">
          <Panel className="p-3"><PTitle icon={<Users />}>Response Coordination</PTitle>
            {team ? <p className="rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/60 p-2.5 text-[13.5px]"><b>{team.name}</b><br /><span className="text-[#cfe3c4]">{team.jurisdiction} · {team.members} members · {team.phone}</span></p> : (
              <>
                <label className="text-[13.5px] font-semibold" htmlFor="tm">Assign Response Team</label>
                <select id="tm" value={teamId || avail[0]?.id || ''} onChange={(e) => setTeamId(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--nf-line)] bg-[#0b2113] px-3 py-2.5 text-sm">
                  {avail.length === 0 && <option value="">No team available</option>}{avail.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.jurisdiction})</option>)}</select>
                <button disabled={!sel || !isActive(sel)} onClick={dispatch} className="nf-btn mt-2.5 w-full !py-3 disabled:opacity-40"><Send className="h-4 w-4" />Dispatch Team</button>
              </>)}
            <div className="mt-2.5 grid grid-cols-3 gap-2">{[[Phone, 'Contact Caller'], [Radio, 'Send Alert to Nearby Villages'], [DroneIcon, 'Request Drone Recon']].map(([I, t]) => { const Ic = I as typeof Phone; return <button key={t as string} onClick={() => run(t as string)} className="flex h-[88px] flex-col items-center justify-center gap-1.5 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-1 text-center text-[12.5px] leading-tight hover:border-[var(--nf-lime)]"><Ic className="h-6 w-6 text-[var(--nf-lime)]" size={24} />{t as string}</button>; })}</div></Panel>
          {sel && (
            <Panel className="p-3"><PTitle icon={<Activity />} right={isActive(sel) && idx < FLOW.length - 1 ? <button onClick={nextStatus} className="nf-pill !py-0.5 text-xs">Advance ▸ {LABEL[FLOW[idx + 1]]}</button> : undefined}>Response Status</PTitle>
              <Timeline steps={FLOW.map((f, i) => { const ev = sel.events.find((e) => e.to === f); return { t: LABEL[f], time: ev ? fmtDate(ev.at) : 'Pending', state: i < idx || sel.responseStatus === 'resolved' ? 'done' : i === idx ? 'now' : 'todo' } as const; })} />
              {isActive(sel) && sel.createdAt && <button onClick={() => { sosAction(sel.id, 'escalate'); toast.warning('Escalated to supervisory officer'); }} className="nf-btn danger mt-2 w-full !py-2 text-sm">Escalate (SLA)</button>}
            </Panel>)}
        </div>
      </div>
    </>
  );
}
