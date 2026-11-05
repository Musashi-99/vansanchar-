import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, ShieldCheck, Hash, Mic } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { useScoped } from '../../lib/scope';
import MapView from '../../components/MapView';
import { ReviewModal } from '../../components/Review';
import { Timeline } from '../citizen/ReportDetail';
import { Card, StatusBadge, SevBadge, Button, Input, Select, Empty, Badge } from '../../components/ui';
import { ANIMALS, fmtDate, haversine } from '../../lib/utils';

export default function OReportDetail() {
  const { id } = useParams();
  const { reports, canVerify } = useScoped();
  const { teams, assignReport, addNote, transition } = useStore();
  const all = useStore((s) => s.reports);
  const r = reports.find((x) => x.id === id);
  const [mode, setMode] = useState<'verify' | 'reject' | 'reopen' | 'resolve' | null>(null);
  const [note, setNote] = useState(''); const [pub, setPub] = useState(false); const [team, setTeam] = useState('');
  if (!r) return <Empty title="Report not found or outside your jurisdiction" action={<Link to="/official/reports" className="text-amber-700 underline">Back</Link>} />;
  const dups = all.filter((x) => x.id !== r.id && x.animal === r.animal && haversine(x.location, r.location) < 3 && Math.abs(+new Date(x.submittedAt) - +new Date(r.submittedAt)) < 12 * 3600e3);
  const act = (to: 'under_review') => { const res = transition(r.id, to); res.ok ? toast.success('Moved to review') : toast.error(res.error); };
  return (
    <div className="space-y-3">
      <Link to="/official/reports" className="flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400"><ArrowLeft className="h-4 w-4" />Reports</Link>
      <Card>
        <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold">{r.id}</h1><SevBadge s={r.severity} /><StatusBadge s={r.status} />{r.syncStatus === 'queued' && <Badge className="bg-amber-100 text-amber-800">Queued on device</Badge>}</div>
        <div className="mt-1 text-sm">{ANIMALS[r.animal]}{r.count ? ` × ${r.count}` : ''}{r.direction ? ` heading ${r.direction}` : ''}</div>
        {r.photo ? <img src={r.photo} alt="Evidence" className="mt-3 max-h-72 w-full rounded-xl2 object-cover" /> : <div className="mt-3 rounded-xl2 bg-secondary p-3 text-sm text-muted">No photo attached.</div>}
        <p className="mt-3 text-sm">{r.description}</p>
        {(r.injury || r.damage) && <div className="mt-2 flex gap-2">{r.injury && <Badge className="bg-red-100 text-red-800">Injury reported</Badge>}{r.damage && <Badge className="bg-orange-100 text-orange-800">Property damage</Badge>}</div>}
        {r.hasVoice && <Badge className="mt-2 bg-secondary"><Mic className="h-3 w-3" />Voice note ({r.voiceSeconds ?? '?'}s)</Badge>}
      </Card>
      <Card className="space-y-2">
        <h2 className="font-semibold">Reporter &amp; location (authorised view)</h2>
        <div className="flex flex-wrap items-center justify-between gap-2"><div className="min-w-0"><div className="font-medium">{r.reporterName}</div><div className="text-sm text-muted">{r.reporterPhone}</div></div>
          <a href={`tel:${r.reporterPhone}`} className="inline-flex h-10 items-center gap-1 rounded-xl2 bg-amber-600 px-3 text-sm font-medium text-white"><Phone className="h-4 w-4" />Call reporter</a></div>
        <div className="flex items-start gap-1 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{r.location.label} · {r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)} {r.location.accuracy ? `(±${r.location.accuracy} m)` : r.location.manual ? '(manual, not GPS)' : ''}</span></div>
        <div className="text-xs text-muted">Occurred {fmtDate(r.occurredAt)} · submitted {fmtDate(r.submittedAt)} · {r.jurisdiction}</div>
        <MapView height={220} points={[{ id: r.id, lat: r.location.lat, lng: r.location.lng, severity: r.severity, title: ANIMALS[r.animal] }]} heat={false} focus={[r.location.lat, r.location.lng]} />
      </Card>
      {dups.length > 0 && <Card className="!bg-blue-50 dark:!bg-blue-950/30"><b className="text-sm">Possible related / duplicate reports</b><div className="mt-1 flex flex-wrap gap-2">{dups.slice(0, 5).map((d) => <Link key={d.id} to={`/official/reports/${d.id}`} className="rounded-full bg-white px-3 py-1 text-xs underline dark:bg-black/30">{d.id}</Link>)}</div></Card>}

      <Card className="space-y-3">
        <h2 className="font-semibold">Actions</h2>
        {!canVerify && <p className="text-xs text-muted">Your role can add field notes but cannot verify or reject. Ask a Range Officer.</p>}
        <div className="grid grid-cols-2 gap-2">
          {r.status === 'pending' && <Button variant="outline" disabled={!canVerify} onClick={() => act('under_review')}>Start review</Button>}
          {(r.status === 'pending' || r.status === 'under_review') && <><Button variant="amber" disabled={!canVerify} onClick={() => setMode('verify')}>Verify</Button><Button variant="danger" disabled={!canVerify} onClick={() => setMode('reject')}>Reject</Button></>}
          {r.status === 'verified' && <Button variant="amber" disabled={!canVerify} onClick={() => setMode('resolve')}>Resolve</Button>}
          {(r.status === 'rejected' || r.status === 'resolved') && <Button variant="outline" disabled={!canVerify} onClick={() => setMode('reopen')}>Reopen</Button>}
        </div>
        <div className="flex gap-2"><Select value={team} onChange={(e) => setTeam(e.target.value)} aria-label="Team"><option value="">Assign a team…</option>{teams.filter((t) => t.availability === 'available').map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select><Button variant="soft" disabled={!team || !canVerify} onClick={() => { assignReport(r.id, team); toast.success('Team assigned'); setTeam(''); }}>Assign</Button></div>
        {r.assignedTeam && <div className="text-sm">Assigned: <b>{teams.find((t) => t.id === r.assignedTeam)?.name}</b></div>}
        <div className="space-y-2"><Input placeholder="Add a note" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="h-4 w-4" checked={pub} onChange={(e) => setPub(e.target.checked)} />Visible to reporter (public note)</label>
          <Button size="sm" variant="outline" disabled={!note.trim()} onClick={() => { addNote(r.id, note.trim(), pub); setNote(''); toast.success('Note added'); }}>Add note</Button></div>
      </Card>
      {r.attestation && <Card className="text-xs"><div className="flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-blue-600" />Attestation: {r.attestation.status === 'confirmed' ? 'Confirmed on Testnet (simulated)' : 'Pending'}</div>{r.attestation.hash && <div className="mt-1 flex items-center gap-1 break-all text-muted"><Hash className="h-3 w-3 shrink-0" />{r.attestation.hash}</div>}{r.attestation.txId && <div className="text-muted">Tx (simulated): {r.attestation.txId}</div>}<div className="mt-1 text-muted">Hash covers non-identifying fields only. It proves a version existed, not that the incident was true.</div></Card>}
      <Card><h2 className="mb-3 font-semibold">Audit timeline</h2><Timeline events={r.events} /></Card>
      {mode && <ReviewModal report={r} mode={mode} onClose={() => setMode(null)} />}
    </div>
  );
}
