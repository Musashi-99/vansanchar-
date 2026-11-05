import { useState } from 'react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { Card, Button, Badge, Field, Input, Select, Textarea, Modal, SevBadge, SectionTitle, DemoNote } from '../../components/ui';
import { PLACE_NAMES, PLACES, label, uid } from '../../lib/utils';
import type { Severity } from '../../lib/types';

export default function OVolunteers() {
  const { tasks, assignments, volApp, user, progressAssignment } = useStore();
  const [open, setOpen] = useState(false);
  const [t, setT] = useState({ title: '', description: '', place: 'Gosaba', urgency: 'medium' as Severity, capacity: '2', points: '20', training: 'Basic safety' });
  const create = () => {
    if (t.title.trim().length < 3 || t.description.trim().length < 5) return toast.error('Title and description are required.');
    const p = PLACES[t.place];
    useStore.setState((s) => ({ tasks: [{ id: uid('t'), title: t.title.trim(), description: t.description.trim(), place: t.place, lat: p.lat, lng: p.lng, urgency: t.urgency, requiredTraining: t.training, capacity: +t.capacity || 1, accepted: [], points: +t.points || 10, deadline: new Date(Date.now() + 72 * 3600e3).toISOString(), status: 'open' as const }, ...s.tasks] }));
    useStore.getState().addAudit('task.create', t.title); setOpen(false); toast.success('Task published');
  };
  const submitted = assignments.filter((a) => a.status === 'submitted');
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h1 className="text-xl font-bold">Van Mitra Volunteers</h1><Button size="sm" variant="amber" onClick={() => setOpen(true)}>New task</Button></div>
      <DemoNote>Volunteers support trained officials and never replace rescue professionals. Exact incident details are shared only with assigned, trained volunteers.</DemoNote>
      <SectionTitle>Applications</SectionTitle>
      {volApp.status === 'none' ? <Card className="text-sm text-muted">No pending applications.</Card> : <Card className="flex items-center justify-between gap-2"><div className="min-w-0"><b>{useStore.getState().users[0]?.name}</b><div className="text-xs text-muted">Region {volApp.region}</div></div><Badge>{label(volApp.status)}</Badge></Card>}
      <SectionTitle>Completion reviews ({submitted.length})</SectionTitle>
      {submitted.length === 0 ? <Card className="text-sm text-muted">Nothing to review.</Card> : submitted.map((a) => (
        <Card key={a.id} className="space-y-2"><b>{tasks.find((x) => x.id === a.taskId)?.title}</b><p className="text-sm text-muted">{a.notes}</p>
          <div className="flex gap-2"><Button size="sm" variant="amber" onClick={() => { progressAssignment(a.id, 'approved'); toast.success('Approved. Points awarded.'); }}>Approve</Button><Button size="sm" variant="outline" onClick={() => { progressAssignment(a.id, 'rejected_completion'); toast('Returned to volunteer'); }}>Reject</Button></div></Card>
      ))}
      <SectionTitle>Tasks ({tasks.length})</SectionTitle>
      {tasks.map((x) => <Card key={x.id} className="!p-3"><div className="flex flex-wrap items-center justify-between gap-2"><b className="min-w-0">{x.title}</b><SevBadge s={x.urgency} /></div><div className="text-xs text-muted">{x.place} · {x.accepted.length}/{x.capacity} filled · {x.points} pts · needs {x.requiredTraining}</div></Card>)}
      <p className="text-xs text-muted">Signed in as {user?.name}.</p>
      <Modal open={open} onClose={() => setOpen(false)} title="New volunteer task">
        <div className="space-y-3">
          <Field label="Title"><Input value={t.title} onChange={(e) => setT({ ...t, title: e.target.value })} /></Field>
          <Field label="Description"><Textarea value={t.description} onChange={(e) => setT({ ...t, description: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Place"><Select value={t.place} onChange={(e) => setT({ ...t, place: e.target.value })}>{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
            <Field label="Urgency"><Select value={t.urgency} onChange={(e) => setT({ ...t, urgency: e.target.value as Severity })}>{(['low', 'medium', 'high', 'critical'] as Severity[]).map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select></Field>
            <Field label="Capacity"><Input type="number" min={1} value={t.capacity} onChange={(e) => setT({ ...t, capacity: e.target.value })} /></Field>
            <Field label="Points"><Input type="number" min={0} value={t.points} onChange={(e) => setT({ ...t, points: e.target.value })} /></Field>
          </div>
          <Button full variant="amber" onClick={create}>Publish task</Button>
        </div>
      </Modal>
    </div>
  );
}
