import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Modal, Button, Select, Textarea, Badge } from './ui';
import { useStore } from '../lib/store';
import { CHECKLIST, REJECT_REASONS } from '../lib/scope';
import { haversine, ANIMALS } from '../lib/utils';
import type { Report } from '../lib/types';

/** Verification / rejection modal with evidence checklist. AI results never auto-verify. */
export function ReviewModal({ report, mode, onClose }: { report: Report | null; mode: 'verify' | 'reject' | 'reopen' | 'resolve'; onClose: () => void }) {
  const transition = useStore((s) => s.transition);
  const reports = useStore((s) => s.reports);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [reason, setReason] = useState(REJECT_REASONS[0]); const [notes, setNotes] = useState('');

  const related = useMemo(() => report ? reports.filter((r) => r.id !== report.id && r.animal === report.animal && haversine(r.location, report.location) < 3 && Math.abs(+new Date(r.submittedAt) - +new Date(report.submittedAt)) < 12 * 3600e3) : [], [report, reports]);
  if (!report) return null;
  const n = Object.values(checks).filter(Boolean).length;

  const submit = () => {
    const to = mode === 'verify' ? 'verified' : mode === 'reject' ? 'rejected' : mode === 'reopen' ? 'under_review' : 'resolved';
    if (mode === 'verify' && n < 2) return toast.error('Tick at least 2 evidence checks before verifying.');
    if ((mode === 'reopen' || (mode === 'reject' && reason === 'Other')) && notes.trim().length < 3) return toast.error('A reason / note is required.');
    const res = transition(report.id, to, { reason: mode === 'reject' ? (reason === 'Other' ? notes : reason) : mode === 'reopen' ? notes : undefined, notes: mode === 'resolve' || mode === 'verify' ? notes : undefined, checklist: checks });
    if (!res.ok) return toast.error(res.error);
    toast.success(`Report ${report.id} ${to.replace('_', ' ')}`); onClose();
  };
  const titles = { verify: 'Verify report', reject: 'Reject report', reopen: 'Reopen report', resolve: 'Resolve report' };
  return (
    <Modal open onClose={onClose} title={`${titles[mode]} ${report.id}`}>
      <div className="space-y-3">
        <div className="text-sm text-muted">{ANIMALS[report.animal]} · {report.location.label}</div>
        {mode === 'verify' && (
          <>
            <div className="space-y-2">{CHECKLIST.map(([k, l]) => (
              <label key={k} className="flex items-center gap-3 rounded-xl2 border border-line p-2.5 text-sm"><input type="checkbox" className="h-5 w-5 shrink-0 accent-[var(--primary)]" checked={!!checks[k]} onChange={(e) => setChecks({ ...checks, [k]: e.target.checked })} /><span className="min-w-0">{l}</span></label>))}</div>
            {related.length > 0 && <div className="rounded-xl2 bg-blue-50 p-2 text-xs text-blue-900 dark:bg-blue-950/40 dark:text-blue-200">{related.length} similar nearby report(s) in 12 h: {related.slice(0, 3).map((r) => r.id).join(', ')} (possible corroboration or duplicate)</div>}
            <p className="text-xs text-muted">Verification is an official decision and is not inferred from any AI result.</p>
          </>
        )}
        {mode === 'reject' && <Select value={reason} onChange={(e) => setReason(e.target.value)}>{REJECT_REASONS.map((r) => <option key={r}>{r}</option>)}</Select>}
        <Textarea placeholder={mode === 'reopen' ? 'Reason for reopening (required)' : 'Notes (optional)'} value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Badge className="bg-secondary">Recorded in audit log with your name and timestamp</Badge>
        <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={onClose}>Cancel</Button><Button variant={mode === 'reject' ? 'danger' : 'amber'} onClick={submit}>Confirm</Button></div>
      </div>
    </Modal>
  );
}
