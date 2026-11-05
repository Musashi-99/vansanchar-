import { useState } from 'react';
import { MapPin, Clock, Coins, ShieldAlert, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { SEED_EDU } from '../../lib/seed';
import { Button, Card, Select, Badge, SevBadge, Progress, DemoNote, SectionTitle, Modal, Textarea, Switch } from '../../components/ui';
import { PLACE_NAMES, label, fmtDate } from '../../lib/utils';

export default function Volunteer() {
  const { volApp, applyVolunteer, completeTraining, tasks, assignments, acceptTask, progressAssignment, eduProgress } = useStore();
  const [region, setRegion] = useState('Gosaba'); const [terms, setTerms] = useState(false); const [avail, setAvail] = useState('Weekends');
  const [submit, setSubmit] = useState<string>(); const [notes, setNotes] = useState('');
  const trainingIds = ['w1', 'w2', 'w6'];
  const done = trainingIds.filter((id) => eduProgress[id]?.completed).length;
  const mine = assignments;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><Users className="h-6 w-6 text-emerald-600" /><h1 className="text-xl font-bold">Van Mitra Volunteers</h1></div>
      <div className="flex gap-2 rounded-xl2 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><ShieldAlert className="h-5 w-5 shrink-0" />Volunteers assist trained forest staff. Never approach or handle dangerous wildlife yourself.</div>

      {volApp.status === 'none' && (
        <Card className="space-y-3"><h2 className="font-semibold">Apply to become a volunteer</h2>
          <label className="block text-sm font-medium">Region<Select className="mt-1" value={region} onChange={(e) => setRegion(e.target.value)}>{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select></label>
          <label className="block text-sm font-medium">Availability<Select className="mt-1" value={avail} onChange={(e) => setAvail(e.target.value)}><option>Weekends</option><option>Evenings</option><option>Weekdays</option><option>Emergencies only</option></Select></label>
          <Switch label="I accept the volunteer safety terms" checked={terms} onChange={setTerms} />
          <Button full disabled={!terms} onClick={() => { applyVolunteer(region); toast.success('Application submitted. Complete required training.'); }}>Submit application</Button></Card>
      )}
      {volApp.status === 'training_required' && (
        <Card className="space-y-3"><h2 className="font-semibold">Training required</h2><Badge className="bg-amber-100 text-amber-800">Application submitted · {volApp.region}</Badge>
          <p className="text-sm text-muted">Complete these workshops (Education Hub) and an official reviews your application.</p>
          <Progress value={(done / trainingIds.length) * 100} />
          <ul className="space-y-1 text-sm">{trainingIds.map((id) => <li key={id} className="flex items-center justify-between gap-2"><span className="min-w-0 truncate">{SEED_EDU.find((e) => e.id === id)?.title}</span><Badge className={eduProgress[id]?.completed ? 'bg-green-100 text-green-800' : 'bg-secondary'}>{eduProgress[id]?.completed ? 'Done' : 'Pending'}</Badge></li>)}</ul>
          <DemoNote>Demo shortcut: simulate official approval after training.</DemoNote>
          <Button full variant="soft" onClick={() => { completeTraining(); toast.success('Approved as Van Mitra volunteer (demo)'); }}>Simulate official approval</Button></Card>
      )}
      {volApp.status === 'approved' && <Card className="flex items-center justify-between gap-2"><div><Badge className="bg-emerald-100 text-emerald-800">Approved Van Mitra</Badge><div className="mt-1 text-sm text-muted">Region: {volApp.region}</div></div><div className="text-right text-sm"><div className="font-bold">{mine.filter((a) => a.status === 'approved').length}</div><div className="text-xs text-muted">completed</div></div></Card>}

      <SectionTitle>Tasks</SectionTitle>
      <div className="space-y-3">
        {tasks.map((t) => {
          const a = mine.find((x) => x.taskId === t.id && x.status !== 'cancelled'); const full = t.accepted.length >= t.capacity;
          return (
            <Card key={t.id} className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2"><div className="min-w-0 font-semibold">{t.title}</div><SevBadge s={t.urgency} /></div>
              <p className="text-sm text-muted">{t.description}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted"><span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{t.place}</span><span className="flex items-center gap-1"><Clock className="h-3 w-3" />by {fmtDate(t.deadline)}</span><span className="flex items-center gap-1"><Coins className="h-3 w-3" />{t.points} pts</span><span>Needs: {t.requiredTraining}</span><span>{t.accepted.length}/{t.capacity} filled</span></div>
              {a ? (
                <div className="space-y-2"><Badge>{label(a.status)}</Badge>
                  {a.status === 'accepted' && <Button size="sm" onClick={() => progressAssignment(a.id, 'in_progress')}>Start task</Button>}
                  {a.status === 'in_progress' && <Button size="sm" onClick={() => setSubmit(a.id)}>Submit completion</Button>}
                  {a.status === 'submitted' && <Button size="sm" variant="soft" onClick={() => { progressAssignment(a.id, 'approved'); toast.success('Officer approved (demo). Points awarded.'); }}>Simulate officer approval</Button>}
                  {a.status === 'approved' && <span className="text-xs text-green-700">+{t.points} points awarded after approval</span>}
                </div>
              ) : <Button size="sm" disabled={full} onClick={() => { const r = acceptTask(t.id); r.ok ? toast.success('Task accepted') : toast.error(r.error); }}>{full ? 'Full' : 'Accept task'}</Button>}
            </Card>
          );
        })}
      </div>
      <Modal open={!!submit} onClose={() => setSubmit(undefined)} title="Submit completion">
        <Textarea placeholder="What did you do? Any safe observations?" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <Button full className="mt-3" disabled={notes.trim().length < 5} onClick={() => { progressAssignment(submit!, 'submitted', notes); setSubmit(undefined); setNotes(''); toast.success('Submitted for officer review'); }}>Submit</Button>
      </Modal>
    </div>
  );
}
