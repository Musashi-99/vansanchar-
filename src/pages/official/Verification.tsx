import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScoped } from '../../lib/scope';
import { useStore } from '../../lib/store';
import { ReviewModal } from '../../components/Review';
import { Card, Tabs, Button, SevBadge, StatusBadge, Empty, DemoNote } from '../../components/ui';
import { ANIMALS, ago } from '../../lib/utils';
import { toast } from 'sonner';
import type { Report } from '../../lib/types';

export default function Verification() {
  const { reports, canVerify } = useScoped();
  const transition = useStore((s) => s.transition);
  const [tab, setTab] = useState<'pending' | 'under_review' | 'verified' | 'all'>('pending');
  const [target, setTarget] = useState<{ r: Report; mode: 'verify' | 'reject' } | null>(null);
  const list = reports.filter((r) => tab === 'all' || r.status === tab);
  const n = (s: string) => reports.filter((r) => r.status === s).length;
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Verification</h1>
      <Tabs tone="amber" tabs={[{ id: 'pending', label: 'Pending', badge: n('pending') }, { id: 'under_review', label: 'Review', badge: n('under_review') }, { id: 'verified', label: 'Verified' }, { id: 'all', label: 'All' }]} value={tab} onChange={setTab} />
      <DemoNote>AI species suggestions can assist triage but never replace this decision. A single rejection is not an accusation against the reporter.</DemoNote>
      {list.length === 0 ? <Empty title="Queue is empty" /> : list.map((r) => (
        <Card key={r.id} className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5"><Link to={`/official/reports/${r.id}`} className="font-bold underline">{r.id}</Link><span>{ANIMALS[r.animal]}</span><SevBadge s={r.severity} /><StatusBadge s={r.status} /></div>
          <p className="text-sm">{r.description}</p><div className="text-xs text-muted">{r.location.label} · {r.reporterName} · {ago(r.submittedAt)}</div>
          {(r.status === 'pending' || r.status === 'under_review') && (
            <div className="grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" disabled={!canVerify || r.status === 'under_review'} onClick={() => { const x = transition(r.id, 'under_review'); x.ok ? toast.success('Under review') : toast.error(x.error); }}>Review</Button>
              <Button size="sm" variant="amber" disabled={!canVerify} onClick={() => setTarget({ r, mode: 'verify' })}>Verify</Button>
              <Button size="sm" variant="danger" disabled={!canVerify} onClick={() => setTarget({ r, mode: 'reject' })}>Reject</Button>
            </div>
          )}
        </Card>
      ))}
      {!canVerify && <p className="text-xs text-muted">Read-only: your role cannot verify.</p>}
      {target && <ReviewModal report={target.r} mode={target.mode} onClose={() => setTarget(null)} />}
    </div>
  );
}
