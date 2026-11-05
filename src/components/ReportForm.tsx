import { useEffect, useRef, useState } from 'react';
import { Camera, Mic, Square, MapPin, Trash2, Loader2, CheckCircle2, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Modal, Button, Field, Input, Select, Textarea, SevBadge } from './ui';
import { ANIMALS, SEVERITIES, PLACES, PLACE_NAMES, cn, label, processImage } from '../lib/utils';
import type { Animal, Severity, GeoPoint } from '../lib/types';
import { useStore } from '../lib/store';
import { useGeolocation, useUI } from '../lib/hooks';
import { useT } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';

const localInput = (d = new Date()) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

export default function ReportForm() {
  const open = useUI((s) => s.reportOpen);
  const close = () => useUI.getState().set({ reportOpen: false });
  const submit = useStore((s) => s.submitReport);
  const { t } = useT();
  const nav = useNavigate();
  const geo = useGeolocation();

  const [animal, setAnimal] = useState<Animal>('unknown');
  const [severity, setSeverity] = useState<Severity>('medium');
  const [desc, setDesc] = useState('');
  const [when, setWhen] = useState(localInput());
  const [count, setCount] = useState('');
  const [direction, setDirection] = useState('');
  const [injury, setInjury] = useState(false);
  const [damage, setDamage] = useState(false);
  const [photo, setPhoto] = useState<string>();
  const [photoBusy, setPhotoBusy] = useState(false);
  const [manualPlace, setManualPlace] = useState('');
  const [landmark, setLandmark] = useState('');
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: string; queued: boolean } | null>(null);

  // voice
  const [rec, setRec] = useState<'idle' | 'recording' | 'done'>('idle');
  const [secs, setSecs] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>();
  const mr = useRef<MediaRecorder | null>(null);
  const timer = useRef<number>();
  const chunks = useRef<Blob[]>([]);

  const reset = () => {
    setAnimal('unknown'); setSeverity('medium'); setDesc(''); setWhen(localInput()); setCount(''); setDirection(''); setInjury(false); setDamage(false);
    setPhoto(undefined); setManualPlace(''); setLandmark(''); setErr({}); setDone(null); discardVoice();
  };
  useEffect(() => () => { clearInterval(timer.current); }, []);

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunks.current = [];
      const m = new MediaRecorder(stream); mr.current = m;
      m.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      m.onstop = () => {
        stream.getTracks().forEach((x) => x.stop());
        setAudioUrl(URL.createObjectURL(new Blob(chunks.current, { type: m.mimeType || 'audio/webm' }))); setRec('done');
      };
      m.start(); setRec('recording'); setSecs(0);
      timer.current = window.setInterval(() => setSecs((s) => { if (s >= 59) { m.state === 'recording' && m.stop(); clearInterval(timer.current); } return s + 1; }), 1000);
    } catch { toast.error('Microphone not available or permission denied. You can type a description instead.'); }
  };
  const stopRec = () => { clearInterval(timer.current); mr.current?.state === 'recording' && mr.current.stop(); };
  function discardVoice() { clearInterval(timer.current); if (audioUrl) URL.revokeObjectURL(audioUrl); setAudioUrl(undefined); setRec('idle'); setSecs(0); }

  const pickPhoto = async (f?: File) => {
    if (!f) return;
    setPhotoBusy(true);
    try { setPhoto(await processImage(f)); } catch (e) { toast.error((e as Error).message); } finally { setPhotoBusy(false); }
  };

  const buildLocation = (): GeoPoint | null => {
    if (geo.point && !manualPlace) return { ...geo.point, label: landmark ? `${landmark} (${geo.point.label})` : geo.point.label };
    if (manualPlace) { const p = PLACES[manualPlace]; return { lat: p.lat, lng: p.lng, label: landmark ? `${landmark}, ${manualPlace}` : `Near ${manualPlace}`, manual: true }; }
    return null;
  };

  const onSubmit = async () => {
    const e: Record<string, string> = {};
    const loc = buildLocation();
    if (!loc) e.loc = 'Share GPS or choose the nearest place.';
    if (desc.trim().length < 5 && rec !== 'done') e.desc = 'Describe what you saw (at least 5 characters) or record a voice note.';
    if (new Date(when) > new Date(Date.now() + 60000)) e.when = 'Time cannot be in the future.';
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    const res = await submit({ animal, severity, description: desc.trim() || 'Voice note attached', location: loc!, occurredAt: new Date(when).toISOString(), photo, hasVoice: rec === 'done', voiceSeconds: secs || undefined, count: count ? +count : undefined, direction: direction || undefined, injury, damage });
    setBusy(false); setDone(res);
  };

  return (
    <Modal open={open} onClose={() => { close(); }} title={done ? (done.queued ? 'Saved on this device' : 'Report received') : 'Report Wildlife Conflict'} wide>
      {done ? (
        <div className="space-y-4 text-center">
          {done.queued ? <WifiOff className="mx-auto h-14 w-14 text-amber-600" /> : <CheckCircle2 className="mx-auto h-14 w-14 text-green-600" />}
          <div>
            <div className="text-lg font-semibold">{done.queued ? 'Saved offline - not yet sent' : `Report ${done.id} received`}</div>
            <p className="mt-1 text-sm text-muted">
              {done.queued ? 'It is stored on your device and will upload automatically when you reconnect. Officials have NOT been notified yet. If anyone is in danger, call 112.'
                : 'Forest staff will review it. It appears publicly only after official verification. If anyone is in danger, use SOS or call 112.'}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button onClick={() => { close(); reset(); nav('/app/reports'); }}>View My Reports</Button>
            <Button variant="outline" onClick={() => { reset(); }}>Report another</Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="rounded-xl2 bg-amber-50 p-3 text-xs text-amber-900 dark:bg-amber-950/40 dark:text-amber-200">Stay at a safe distance. Never approach wildlife for a better photo. In immediate danger call 112.</p>

          {/* Photo */}
          <div>
            <div className="mb-1 text-sm font-medium">Photo (optional)</div>
            {photo ? (
              <div className="relative"><img src={photo} alt="Preview" className="h-44 w-full rounded-xl2 object-cover" />
                <button onClick={() => setPhoto(undefined)} aria-label="Remove photo" className="absolute right-2 top-2 rounded-full bg-black/60 p-2 text-white"><Trash2 className="h-4 w-4" /></button></div>
            ) : (
              <label className="flex h-28 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl2 border-2 border-dashed border-line bg-input text-sm text-muted">
                {photoBusy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
                <span>{photoBusy ? 'Processing…' : 'Take or upload a photo (JPEG/PNG, max 10 MB)'}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pickPhoto(e.target.files?.[0])} />
              </label>
            )}
          </div>

          {/* Voice */}
          <div>
            <div className="mb-1 text-sm font-medium">Voice note (optional)</div>
            <div className="flex flex-wrap items-center gap-2 rounded-xl2 border border-line bg-input p-3">
              {rec === 'idle' && <Button size="sm" variant="outline" onClick={startRec}><Mic className="h-4 w-4" />Record</Button>}
              {rec === 'recording' && <><Button size="sm" variant="danger" onClick={stopRec}><Square className="h-4 w-4" />Stop</Button><span className="flex items-center gap-2 text-sm"><span className="h-2 w-2 animate-pulse rounded-full bg-red-600" />Recording {secs}s / 60s</span></>}
              {rec === 'done' && <><audio src={audioUrl} controls className="h-10 min-w-0 max-w-full flex-1" /><Button size="sm" variant="ghost" onClick={discardVoice} aria-label="Remove recording"><Trash2 className="h-4 w-4" /></Button></>}
            </div>
            <p className="mt-1 text-xs text-muted">Demo build: the recording stays in this browser tab; it is not uploaded anywhere.</p>
          </div>

          {/* Location */}
          <div>
            <div className="mb-1 text-sm font-medium">Location</div>
            <div className="space-y-2 rounded-xl2 border border-line bg-input p-3">
              <Button size="sm" variant="outline" onClick={() => { setManualPlace(''); geo.request(); }} loading={geo.loading}><MapPin className="h-4 w-4" />{geo.point ? 'Refresh GPS' : 'Use my GPS'}</Button>
              {geo.point && !manualPlace && (
                <div className="text-xs">
                  <div className="font-medium">{geo.point.label}</div>
                  <div className="text-muted">Accuracy ±{geo.point.accuracy} m · fixed {new Date(geo.point.capturedAt!).toLocaleTimeString()}</div>
                  {geo.stale && <div className="mt-1 flex items-center gap-1 text-amber-700"><RefreshCw className="h-3 w-3" />Location is stale, refresh before submitting.</div>}
                </div>
              )}
              {geo.error && <div className="text-xs text-danger">{geo.error}</div>}
              <Select value={manualPlace} onChange={(e) => setManualPlace(e.target.value)} aria-label="Nearest place">
                <option value="">Or choose nearest place…</option>
                {PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}
              </Select>
              <Input placeholder="Landmark (e.g. near the temple pond)" value={landmark} onChange={(e) => setLandmark(e.target.value)} maxLength={80} />
              {err.loc && <div className="text-xs text-danger" role="alert">{err.loc}</div>}
            </div>
          </div>

          <Field label={t('form.animal')}>
            <Select value={animal} onChange={(e) => setAnimal(e.target.value as Animal)}>
              {(Object.keys(ANIMALS) as Animal[]).map((a) => <option key={a} value={a}>{ANIMALS[a]}</option>)}
            </Select>
          </Field>

          <div>
            <div className="mb-1 text-sm font-medium">{t('form.severity')}</div>
            <div className="grid grid-cols-4 gap-2">
              {SEVERITIES.map((s) => (
                <button key={s} type="button" onClick={() => setSeverity(s)} aria-pressed={severity === s}
                  className={cn('rounded-xl2 border px-1 py-2 text-xs font-medium transition', severity === s ? 'border-primary bg-primary text-primary-fg' : 'border-line bg-input')}>{t(`sev.${s}`)}</button>
              ))}
            </div>
          </div>

          <Field label={t('form.description')} error={err.desc}><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} maxLength={500} placeholder="What did you see? Where was it heading?" /></Field>
          <Field label={t('form.time')} error={err.when}><Input type="datetime-local" value={when} max={localInput()} onChange={(e) => setWhen(e.target.value)} /></Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Number of animals"><Input type="number" inputMode="numeric" min={1} max={50} value={count} onChange={(e) => setCount(e.target.value)} placeholder="Optional" /></Field>
            <Field label="Moving towards"><Input value={direction} onChange={(e) => setDirection(e.target.value)} placeholder="e.g. north" maxLength={30} /></Field>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={injury} onChange={(e) => setInjury(e.target.checked)} />Someone injured</label>
            <label className="flex items-center gap-2"><input type="checkbox" className="h-5 w-5 accent-[var(--primary)]" checked={damage} onChange={(e) => setDamage(e.target.checked)} />Property damage</label>
          </div>
          {injury && <div className="rounded-xl2 bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950/40 dark:text-red-200">If someone is injured, use the SOS button or call 108 / 112 now. A report alone is not an emergency call.</div>}

          <div className="flex items-center gap-2 text-xs text-muted">Severity: <SevBadge s={severity} /></div>
          <Button full size="lg" onClick={onSubmit} loading={busy}>{t('form.submit')}</Button>
        </div>
      )}
    </Modal>
  );
}
