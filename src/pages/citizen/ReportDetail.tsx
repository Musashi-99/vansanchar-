import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Share2, Mic, ShieldCheck, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { Card, StatusBadge, SevBadge, Button, Badge, Empty } from '../../components/ui';
import { ANIMALS, fmtDate, label, publicIncident } from '../../lib/utils';

export function Timeline({ events }: { events: { at: string; actor: string; to: string; from?: string; note?: string }[] }) {
  return (
    <ol className="space-y-3 border-l-2 border-line pl-4">
      {events.map((e, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[22px] top-1 h-3 w-3 rounded-full bg-primary" />
          <div className="text-sm font-medium">{label(e.to)}{e.from && e.from !== e.to ? <span className="text-muted"> (from {label(e.from)})</span> : null}</div>
          <div className="text-xs text-muted">{fmtDate(e.at)} · {e.actor}</div>
          {e.note && <div className="mt-0.5 text-sm">{e.note}</div>}
        </li>
      ))}
    </ol>
  );
}

export default function ReportDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { user, reports, withdrawReport } = useStore();
  const r = reports.find((x) => x.id === id);
  if (!r || r.reporterId !== user?.uid) return <Empty title="Report not found" hint="It may belong to another account." action={<Link to="/app/reports" className="text-primary underline">Back to reports</Link>} />;
  const pub = publicIncident(r);
  const share = async () => {
    const text = `VanSanchar advisory: ${ANIMALS[r.animal]} activity near ${pub.area}${r.status === 'verified' ? ' (officially verified)' : ' (unverified report)'}. Stay alert.`;
    try { if (navigator.share) await navigator.share({ text }); else { await navigator.clipboard.writeText(text); toast.success('Sanitised advisory copied'); } } catch { /* cancelled */ }
  };
  return (
    <div className="space-y-3">
      <button onClick={() => nav(-1)} className="flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" />Back</button>
      <Card>
        <div className="flex flex-wrap items-center gap-2"><h1 className="text-xl font-bold">{ANIMALS[r.animal]}</h1><SevBadge s={r.severity} /><StatusBadge s={r.status} /></div>
        <div className="mt-1 text-xs text-muted">{r.id} · version {r.version}</div>
        {r.syncStatus === 'queued' && <div className="mt-2 rounded-xl2 bg-amber-50 p-2 text-sm text-amber-900">Saved on this device. Not yet sent to forest staff.</div>}
        {r.photo && <img src={r.photo} alt="Evidence" className="mt-3 max-h-64 w-full rounded-xl2 object-cover" />}
        <p className="mt-3 text-sm">{r.description}</p>
        <div className="mt-3 flex items-center gap-1 text-sm text-muted"><MapPin className="h-4 w-4 shrink-0" /><span className="min-w-0 break-words">{r.location.label}{r.location.accuracy ? ` (±${r.location.accuracy} m)` : ''}</span></div>
        <div className="mt-1 text-xs text-muted">Occurred {fmtDate(r.occurredAt)} · Submitted {fmtDate(r.submittedAt)}</div>
        {r.hasVoice && <Badge className="mt-2 bg-secondary"><Mic className="h-3 w-3" />Voice note attached{r.voiceSeconds ? ` (${r.voiceSeconds}s)` : ''}</Badge>}
        {r.publicNote && <div className="mt-3 rounded-xl2 bg-green-50 p-3 text-sm text-green-900 dark:bg-green-950/40 dark:text-green-200"><b>Officer note:</b> {r.publicNote}</div>}
        {r.rejectReason && <div className="mt-3 rounded-xl2 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200"><b>Reason:</b> {r.rejectReason}. This is not an accusation; you may report again with better evidence.</div>}
        {r.attestation && (
          <div className="mt-3 flex items-start gap-2 rounded-xl2 border border-line p-2 text-xs"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
            <div className="min-w-0"><div className="font-medium">Tamper-evident record: {r.attestation.status === 'confirmed' ? 'Confirmed (simulated Testnet)' : 'Pending'}</div>
              {r.attestation.hash && <div className="flex items-center gap-1 text-muted"><Hash className="h-3 w-3 shrink-0" /><span className="truncate">{r.attestation.hash}</span></div>}
              <div className="text-muted">Simulated demo. A hash proves a record version existed, not that the incident was true.</div></div></div>
        )}
      </Card>
      <Card><h2 className="mb-3 font-semibold">Status timeline</h2><Timeline events={r.events} /></Card>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={share}><Share2 className="h-4 w-4" />Share advisory</Button>
        {r.status === 'pending' && !r.withdrawn && <Button variant="outline" onClick={() => { withdrawReport(r.id); toast.success('Report withdrawn'); }}>Withdraw report</Button>}
      </div>
    </div>
  );
}
