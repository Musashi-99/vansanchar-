import { useRef, useState } from 'react';
import { PlayCircle, CheckCircle2, Clock, Languages, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { SEED_EDU, SEED_QUIZ } from '../../lib/seed';
import { Modal, Card, Tabs, Progress, Badge, Button, DemoNote } from '../../components/ui';
import OfflineGuides from './OfflineGuides';
import { cn, fmtDay } from '../../lib/utils';

// CC0 placeholder clip. Replace with reviewed workshop videos in production.
const VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';

function Player({ id, onClose }: { id: string; onClose: () => void }) {
  const w = SEED_EDU.find((x) => x.id === id)!;
  const { eduProgress, setEdu } = useStore();
  const prog = eduProgress[id];
  const last = useRef(0); const acc = useRef(prog?.watched ?? 0); const lastSave = useRef(0);
  const [pct, setPct] = useState(prog?.completed ? 100 : 0);
  const [err, setErr] = useState(false);
  const onTime = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.currentTarget; const dt = v.currentTime - last.current; last.current = v.currentTime;
    if (dt > 0 && dt < 1.5 && !v.seeking) acc.current += dt; // only real, continuous playback counts
    const p = v.duration ? Math.min(100, (acc.current / v.duration) * 100) : 0; setPct(p);
    if (Date.now() - lastSave.current > 4000) { lastSave.current = Date.now(); setEdu(id, { watched: acc.current }); }
    if (p >= 90 && !useStore.getState().eduProgress[id]?.completed) { setEdu(id, { watched: acc.current, completed: true }); toast.success('Workshop completed'); }
  };
  return (
    <div className="space-y-3">
      {err ? <div className="rounded-xl2 bg-amber-50 p-3 text-sm text-amber-900">The demo video could not load (offline?). Read the steps below instead.</div>
        : <video src={VIDEO} controls playsInline preload="metadata" className="w-full rounded-xl2 bg-black" onTimeUpdate={onTime} onSeeked={(e) => { last.current = e.currentTarget.currentTime; }} onError={() => setErr(true)} onPause={() => setEdu(id, { watched: acc.current })} />}
      <div><div className="mb-1 flex justify-between text-xs"><span>Watched</span><span>{Math.round(pct)}% (completes at 90%)</span></div><Progress value={pct} /></div>
      <p className="text-sm">{w.summary}</p>
      {w.steps && <ol className="list-decimal space-y-1 pl-5 text-sm">{w.steps.map((s) => <li key={s}>{s}</li>)}</ol>}
      <p className="text-xs text-muted">Placeholder clip for the demo player. Content v{w.version}, reviewed {fmtDay(w.reviewed)} by {w.reviewer}.</p>
      <Button full variant="outline" onClick={onClose}>Close</Button>
    </div>
  );
}

function Quiz() {
  const addAttempt = useStore((s) => s.addQuizAttempt);
  const attempts = useStore((s) => s.quizAttempts);
  const [idx, setIdx] = useState(0); const [ans, setAns] = useState<number[]>([]); const [sel, setSel] = useState<number | null>(null);
  const [done, setDone] = useState<{ score: number; reward: number } | null>(null);
  const q = SEED_QUIZ[idx];
  const next = () => {
    const a = [...ans, sel!]; setAns(a); setSel(null);
    if (idx + 1 < SEED_QUIZ.length) return setIdx(idx + 1);
    const score = a.filter((x, i) => x === SEED_QUIZ[i].answer).length; // demo: validated locally
    setDone({ score, reward: addAttempt(score, SEED_QUIZ.length) });
  };
  if (done) return (
    <Card className="space-y-3 text-center">
      <div className="text-4xl font-bold text-primary">{done.score}/{SEED_QUIZ.length}</div>
      <p className="text-sm">{done.reward ? `+${done.reward} tokens awarded` : done.score / SEED_QUIZ.length >= 0.8 ? 'Reward limit reached for the demo (prevents farming).' : 'Score 80%+ to earn tokens.'}</p>
      <div className="space-y-2 text-left text-sm">{SEED_QUIZ.map((x, i) => <div key={x.id} className={cn('rounded-xl2 p-2', ans[i] === x.answer ? 'bg-green-50 dark:bg-green-950/30' : 'bg-red-50 dark:bg-red-950/30')}><b>{i + 1}.</b> {x.why}</div>)}</div>
      <Button full onClick={() => { setIdx(0); setAns([]); setDone(null); }}>Retake quiz</Button>
    </Card>
  );
  return (
    <Card className="space-y-3">
      <div className="flex justify-between text-xs text-muted"><span>Question {idx + 1} of {SEED_QUIZ.length}</span><span>{attempts.length} attempt(s)</span></div>
      <Progress value={(idx / SEED_QUIZ.length) * 100} />
      <h3 className="font-semibold">{q.q}</h3>
      <div className="space-y-2">{q.options.map((o, i) => (
        <button key={o} onClick={() => setSel(i)} className={cn('w-full rounded-xl2 border p-3 text-left text-sm transition', sel === i ? 'border-primary bg-secondary' : 'border-line bg-input')}>{o}</button>))}</div>
      <Button full disabled={sel === null} onClick={next}>{idx + 1 === SEED_QUIZ.length ? 'Submit' : 'Next'}</Button>
    </Card>
  );
}

export default function Education() {
  const [tab, setTab] = useState<'w' | 's' | 'q' | 'o'>('w');
  const [play, setPlay] = useState<string>();
  const progress = useStore((s) => s.eduProgress);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Education Hub</h1>
      <Tabs tabs={[{ id: 'w', label: 'Workshops' }, { id: 's', label: 'Safety Measures' }, { id: 'q', label: 'Interactive Quiz' }, { id: 'o', label: 'Offline Guides' }]} value={tab} onChange={setTab} />
      {tab === 'w' && (
        <div className="space-y-3">
          <DemoNote>Workshop videos use a placeholder clip. Completion needs about 90% of real watch time, not just pressing Play.</DemoNote>
          {SEED_EDU.filter((e) => e.type === 'workshop').map((w) => {
            const p = progress[w.id];
            return (
              <Card key={w.id} className="!p-3">
                <button className="flex w-full items-start gap-3 text-left" onClick={() => setPlay(w.id)}>
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-green-600 text-white"><PlayCircle className="h-8 w-8" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{w.title}</span><span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted"><span className="flex items-center gap-1"><Clock className="h-3 w-3" />{w.duration} min</span><span className="flex items-center gap-1"><Languages className="h-3 w-3" />{w.language}</span></span>
                    <span className="mt-1 block">{p?.completed ? <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3" />Completed</Badge> : p?.watched ? <span className="text-xs text-muted">In progress</span> : <span className="text-xs text-muted">Not started</span>}</span></span>
                </button>
              </Card>
            );
          })}
        </div>
      )}
      {tab === 's' && (
        <div className="space-y-3">
          {SEED_EDU.filter((e) => e.type === 'safety').map((s) => (
            <Card key={s.id}><div className="flex items-center gap-2 font-semibold"><ShieldCheck className="h-5 w-5 text-primary" />{s.title}</div><p className="mt-1 text-sm">{s.summary}</p><p className="mt-2 text-[11px] text-muted">v{s.version} · reviewed {fmtDay(s.reviewed)} · {s.reviewer}</p></Card>
          ))}
        </div>
      )}
      {tab === 'q' && <Quiz />}
      {tab === 'o' && <OfflineGuides />}
      <Modal open={!!play} onClose={() => setPlay(undefined)} title={SEED_EDU.find((e) => e.id === play)?.title ?? ''} wide>{play && <Player id={play} onClose={() => setPlay(undefined)} />}</Modal>
    </div>
  );
}
