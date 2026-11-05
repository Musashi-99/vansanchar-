import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { useScoped } from '../../lib/scope';
import { Card, Button, Badge, Select, SevBadge, Empty, SectionTitle } from '../../components/ui';
import { ANIMALS, label, ago, cn } from '../../lib/utils';

const AV = { available: 'bg-green-100 text-green-800', busy: 'bg-amber-100 text-amber-800', off_duty: 'bg-slate-200 text-slate-700' };
export default function Dispatch() {
  const { reports, canVerify } = useScoped();
  const { teams, assignReport, setTeamAvail } = useStore();
  const [pick, setPick] = useState<Record<string, string>>({});
  const unassigned = reports.filter((r) => r.status === 'verified' && !r.assignedTeam);
  const assigned = reports.filter((r) => r.assignedTeam && r.status !== 'resolved');
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Dispatch</h1>
      <p className="text-xs text-muted">Assign eligible teams to verified cases. Team location tracking is off in this demo (requires explicit duty consent in production).</p>
      <SectionTitle>Teams</SectionTitle>
      <div className="grid gap-2 sm:grid-cols-2">
        {teams.map((t) => (
          <Card key={t.id} className="!p-3 space-y-1">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0 font-semibold">{t.name}</div><Badge className={AV[t.availability]}>{label(t.availability)}</Badge></div>
            <div className="text-xs text-muted">{t.jurisdiction} · {t.members} members</div>
            <div className="flex flex-wrap gap-1">{t.capabilities.map((c) => <Badge key={c} className="bg-secondary">{c}</Badge>)}</div>
            {t.assignment && <div className="text-xs">On: <b>{t.assignment}</b></div>}
            <div className="flex gap-2 pt-1"><a href={`tel:${t.phone}`} className="text-xs text-amber-700 underline">Call {t.phone}</a>
              {t.availability !== 'available' && <button className="ml-auto text-xs underline" onClick={() => setTeamAvail(t.id, 'available')}>Mark available</button>}</div>
          </Card>
        ))}
      </div>
      <SectionTitle>Unassigned verified cases ({unassigned.length})</SectionTitle>
      {unassigned.length === 0 ? <Empty title="Nothing waiting for a team" /> : unassigned.map((r) => (
        <Card key={r.id} className="!p-3 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5"><Link to={`/official/reports/${r.id}`} className="font-bold underline">{r.id}</Link><span>{ANIMALS[r.animal]}</span><SevBadge s={r.severity} /></div>
          <div className="text-xs text-muted">{r.location.label} · {ago(r.submittedAt)}</div>
          <div className="flex gap-2"><Select value={pick[r.id] ?? ''} onChange={(e) => setPick({ ...pick, [r.id]: e.target.value })} aria-label="Team"><option value="">Select team…</option>{teams.filter((t) => t.availability === 'available').map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</Select>
            <Button size="sm" variant="amber" disabled={!pick[r.id] || !canVerify} onClick={() => { assignReport(r.id, pick[r.id]); toast.success('Assigned'); }}>Assign</Button></div>
        </Card>
      ))}
      <SectionTitle>Current assignments</SectionTitle>
      <div className="space-y-2">{assigned.map((r) => <Card key={r.id} className={cn('!p-3 text-sm')}><b>{r.id}</b> → {teams.find((t) => t.id === r.assignedTeam)?.name} <span className="text-muted">({label(r.status)})</span></Card>)}{assigned.length === 0 && <p className="text-sm text-muted">None.</p>}</div>
    </div>
  );
}
