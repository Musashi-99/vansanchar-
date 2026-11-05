import { useState } from 'react';
import { ScanSearch, Upload, Trash2, AlertTriangle, FilePlus2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { useUI } from '../../lib/hooks';
import { Button, Card, Badge, DemoNote, Empty, Progress } from '../../components/ui';
import { processImage, uid, sha256, fmtDate, cn } from '../../lib/utils';
import type { ScanResult } from '../../lib/types';

const SPECIES = [
  { name: 'Royal Bengal Tiger', scientific: 'Panthera tigris tigris', note: 'Large striped cat. Stay far away, never approach. Report from safety.' },
  { name: 'Estuarine Crocodile', scientific: 'Crocodylus porosus', note: 'Avoid water edges. Keep children and livestock away from muddy banks.' },
  { name: 'Spectacled Cobra', scientific: 'Naja naja', note: 'Back away slowly. Do not try to catch or kill it. Call the rescue unit.' },
  { name: 'Wild Boar', scientific: 'Sus scrofa', note: 'Do not corner it. Can be aggressive when protecting young.' },
  { name: 'Leopard Cat', scientific: 'Prionailurus bengalensis', note: 'Small wild cat, usually shy. Keep pets indoors at night.' },
  { name: 'Water Monitor Lizard', scientific: 'Varanus salvator', note: 'Generally harmless if left alone. Do not provoke.' },
];
const L: ScanResult['candidates'][number]['likelihood'][] = ['high', 'moderate', 'low'];

export default function AIDetection() {
  const { scans, addScan, deleteScan } = useStore();
  const [img, setImg] = useState<string>(); const [name, setName] = useState('');
  const [phase, setPhase] = useState<'idle' | 'uploading' | 'analyzing' | 'done' | 'failed'>('idle'); const [pct, setPct] = useState(0);
  const [cur, setCur] = useState<ScanResult>();

  const pick = async (f?: File) => {
    if (!f) return;
    try { setImg(await processImage(f, 720)); setName(f.name); setCur(undefined); setPhase('idle'); } catch (e) { toast.error((e as Error).message); }
  };
  const run = async () => {
    if (!img) return;
    setPhase('uploading'); setPct(0);
    for (let i = 1; i <= 4; i++) { await new Promise((r) => setTimeout(r, 180)); setPct(i * 12); }
    setPhase('analyzing');
    for (let i = 5; i <= 10; i++) { await new Promise((r) => setTimeout(r, 220)); setPct(i * 10); }
    // Demo analyzer: deterministic from image bytes, NOT a real model. Tiny/dark images => unknown.
    const h = await sha256(img.slice(0, 4000) + img.length);
    const seed = parseInt(h.slice(0, 8), 16);
    const unknown = img.length < 6000 || seed % 7 === 0;
    const order = SPECIES.map((s, i) => ({ s, k: (seed >> (i * 3)) % 97 + i })).sort((a, b) => b.k - a.k).slice(0, 3);
    const res: ScanResult = {
      id: uid('scan'), at: new Date().toISOString(), fileName: name, preview: img, status: 'completed', unknown,
      candidates: unknown ? [] : order.map((o, i) => ({ name: o.s.name, scientific: o.s.scientific, likelihood: L[i], note: o.s.note })),
    };
    setCur(res); addScan({ ...res, preview: img }); setPhase('done');
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2"><ScanSearch className="h-6 w-6 text-purple-600" /><h1 className="text-xl font-bold">AI Species Detection</h1><Badge className="bg-purple-100 text-purple-800">Gemini Vision (demo)</Badge></div>
      <DemoNote><b>Simulated analyzer.</b> No real Gemini call is made. Results are deterministic placeholders to demonstrate the flow and are never a verification or a calibrated probability.</DemoNote>
      <Card className="space-y-3">
        {img ? <div className="relative"><img src={img} alt="To analyze" className="max-h-64 w-full rounded-xl2 object-cover" /><button onClick={() => { setImg(undefined); setCur(undefined); setPhase('idle'); }} aria-label="Remove" className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"><Trash2 className="h-4 w-4" /></button></div>
          : <label className="flex h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border-2 border-dashed border-line bg-input text-sm text-muted"><Upload className="h-7 w-7" />Take or upload a photo<span className="text-xs">Never move closer for a better image</span>
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(e.target.files?.[0])} /></label>}
        <Button full onClick={run} disabled={!img || phase === 'uploading' || phase === 'analyzing'} loading={phase === 'uploading' || phase === 'analyzing'}>{phase === 'uploading' ? 'Preparing image…' : phase === 'analyzing' ? 'Analyzing (demo)…' : 'Analyze image'}</Button>
        {(phase === 'uploading' || phase === 'analyzing') && <Progress value={pct} />}
      </Card>

      {cur && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Result</h2>
          {cur.unknown ? <div className="flex gap-2 rounded-xl2 bg-amber-50 p-3 text-sm text-amber-900"><AlertTriangle className="h-5 w-5 shrink-0" />Unknown / insufficient image quality. Do not guess. You can still file a report as &quot;Unknown / Not Sure&quot;.</div> : (
            <div className="space-y-2">
              {cur.candidates.map((c, i) => (
                <div key={c.name} className={cn('rounded-xl2 border p-3', i === 0 ? 'border-primary' : 'border-line')}>
                  <div className="flex flex-wrap items-center justify-between gap-2"><span className="font-semibold">{c.name}</span><Badge className="bg-secondary">{c.likelihood} likelihood (uncalibrated)</Badge></div>
                  <div className="text-xs italic text-muted">{c.scientific}</div><p className="mt-1 text-sm">{c.note}</p>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted">Not an official verification. Analysed {fmtDate(cur.at)} by demo analyzer v0. No percentages are shown because this model provides no calibrated confidence.</p>
          <Button full variant="soft" onClick={() => useUI.getState().set({ reportOpen: true })}><FilePlus2 className="h-4 w-4" />Create a report from this</Button>
        </Card>
      )}

      <h2 className="text-lg font-semibold">My detection history</h2>
      {scans.length === 0 ? <Empty title="No scans yet" /> : scans.map((s) => (
        <Card key={s.id} className="!p-3"><div className="flex items-center gap-3">
          {s.preview && <img src={s.preview} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />}
          <div className="min-w-0 flex-1"><div className="truncate font-medium">{s.unknown ? 'Unknown / insufficient quality' : s.candidates[0]?.name}</div><div className="text-xs text-muted">{fmtDate(s.at)}</div></div>
          <Button size="sm" variant="ghost" onClick={() => deleteScan(s.id)} aria-label="Delete scan"><Trash2 className="h-4 w-4" /></Button></div></Card>
      ))}
    </div>
  );
}
