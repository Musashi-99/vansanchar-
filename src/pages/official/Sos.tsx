import { useEffect, useState } from 'react';
import { Phone, AlertTriangle, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { useScoped, REJECT_REASONS } from '../../lib/scope';
import { Card, Button, Badge, Select, Empty, Modal, Textarea, Tabs } from '../../components/ui';
import { SOSTimeline } from '../../components/SOS';
import { ago, label } from '../../lib/utils';
import type { SOS } from '../../lib/types';

export default function OSos() {
  const { sos, canVerify } = useScoped();
  const { teams, sosAction, users } = useStore();
  const [tab, setTab] = useState<'active' | 'closed'>('active');
  const [, tick] = useState(0);
  const [rej, setRej] = useState<SOS | null>(null); const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [res, setRes] = useState<SOS | null>(null); const [notes, setNotes] = useState('');
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 15000); return () => clearInterval(t); }, []);
  const list = sos.filter((x) => (tab === 'active' ? !x.cancelled && x.responseStatus !== 'resolved' : x.cancelled || x.responseStatus === 'resolved'));
  const STEPS = ['acknowledged', 'dispatching', 'en_route', 'on_scene'];
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">SOS Alerts</h1>
      <Tabs tone="amber" tabs={[{ id: 'active', label: 'Active' }, { id: 'closed', label: 'Closed' }]} value={tab} onChange={setTab} />
      <p className="text-xs text-muted">Verification (is it genuine?) and response (what is being done?) are tracked separately. Alerts arrive as UNVERIFIED so help is never delayed by verification.</p>
      {list.length === 0 ? <Empty title="No SOS alerts" /> : list.map((s) => {
        const mins = (Date.now() - +new Date(s.createdAt)) / 60000; const breach = s.responseStatus === 'received' && mins > s.slaMinutes;
        const person = users.find((u) => u.uid === s.requesterId);
        return (
          <Card key={s.id} className={breach ? '!border-red-500' : ''}>
            <div className="flex flex-wrap items-center gap-2"><b className="text-lg">{s.id}</b><Badge className={s.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : s.verificationStatus === 'rejected' ? 'bg-slate-200' : 'bg-amber-100 text-amber-800'}>{label(s.verificationStatus)}</Badge><Badge className="bg-blue-100 text-blue-800">{label(s.responseStatus)}</Badge>{!s.sent && <Badge className="bg-slate-200">Not yet received</Badge>}</div>
            {breach && <div className="mt-2 flex items-center gap-2 rounded-xl2 bg-red-50 p-2 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200"><AlertTriangle className="h-4 w-4 shrink-0" />Unacknowledged for {Math.floor(mins)} min (SLA {s.slaMinutes} min)</div>}
            <div className="mt-2 font-medium">{s.type}</div><p className="text-sm text-muted">{s.description}</p>
            <div className="mt-1 flex items-start gap-1 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{s.location.label} ({s.location.lat.toFixed(4)}, {s.location.lng.toFixed(4)}) {s.location.accuracy ? `±${s.location.accuracy} m` : '(manual)'}</span></div>
            <div className="text-xs text-muted">{s.requesterName} · {s.requesterPhone}{person?.blood ? ` · blood ${person.blood}` : ''} · {ago(s.createdAt)}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:${s.requesterPhone}`} className="inline-flex h-9 items-center gap-1 rounded-xl2 bg-amber-600 px-3 text-sm font-medium text-white"><Phone className="h-4 w-4" />Call requester</a>
              {!s.cancelled && s.responseStatus === 'received' && <Button size="sm" onClick={() => { sosAction(s.id, 'acknowledge'); toast.success('Acknowledged'); }}>Acknowledge</Button>}
              {breach && <Button size="sm" variant="danger" onClick={() => { sosAction(s.id, 'escalate'); toast.success('Escalated to supervisor'); }}>Escalate</Button>}
              {!s.cancelled && s.verificationStatus !== 'verified' && s.verificationStatus !== 'rejected' && <><Button size="sm" variant="soft" disabled={!canVerify} onClick={() => { sosAction(s.id, 'verify'); toast.success('Verified'); }}>Verify</Button><Button size="sm" variant="outline" disabled={!canVerify} onClick={() => setRej(s)}>Reject</Button></>}
            </div>
            {!s.cancelled && s.responseStatus !== 'resolved' && s.responseStatus !== 'received' && (
              <div className="mt-3 space-y-2">
                {!s.assignedTeam && <div className="flex gap-2"><Select id={`team-${s.id}`} defaultValue="" aria-label="Assign team"><option value="">Assign team…</option>{teams.filter((t) => t.availability === 'available').map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
                  <Button size="sm" variant="amber" onClick={() => { const v = (document.getElementById(`team-${s.id}`) as HTMLSelectElement).value; v ? (sosAction(s.id, 'dispatch', v), toast.success('Team assigned')) : toast.error('Choose a team'); }}>Dispatch</Button></div>}
                {s.assignedTeam && <div className="text-sm">Team: <b>{teams.find((t) => t.id === s.assignedTeam)?.name}</b></div>}
                <div className="flex flex-wrap gap-2">{STEPS.slice(1).map((st) => <Button key={st} size="sm" variant={s.responseStatus === st ? 'amber' : 'outline'} onClick={() => sosAction(s.id, 'status', st)}>{label(st)}</Button>)}<Button size="sm" variant="primary" onClick={() => setRes(s)}>Resolve</Button></div>
              </div>
            )}
            <div className="mt-3"><SOSTimeline id={s.id} /></div>
          </Card>
        );
      })}
      <Modal open={!!rej} onClose={() => setRej(null)} title="Reject SOS"><Select value={reason} onChange={(e) => setReason(e.target.value)}>{REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}</Select><p className="my-2 text-xs text-muted">Keep emergency contact options visible to the requester until closed.</p><Button full variant="danger" onClick={() => { sosAction(rej!.id, 'reject', reason); setRej(null); }}>Confirm reject</Button></Modal>
      <Modal open={!!res} onClose={() => setRes(null)} title="Resolve SOS"><Textarea placeholder="Resolution notes (required)" value={notes} onChange={(e) => setNotes(e.target.value)} /><Button full className="mt-3" disabled={notes.trim().length < 3} onClick={() => { sosAction(res!.id, 'resolve', notes); setRes(null); setNotes(''); toast.success('Resolved'); }}>Resolve</Button></Modal>
    </div>
  );
}
