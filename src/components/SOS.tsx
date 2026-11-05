import { useEffect, useState } from 'react';
import { Siren, Phone, ShieldAlert, WifiOff, CheckCircle2, X } from 'lucide-react';
import { Modal, Button, Select, Textarea, Badge } from './ui';
import { useStore } from '../lib/store';
import { useUI, useGeolocation, useOnline } from '../lib/hooks';
import { cn, label, PLACE_NAMES, PLACES, fmtDate } from '../lib/utils';
import { useT } from '../lib/i18n';
import type { GeoPoint } from '../lib/types';

const TYPES = ['Tiger attack nearby', 'Crocodile attack', 'Snakebite', 'Person injured by wildlife', 'Trapped / cut off by wildlife', 'Other life-threatening'];

export function SOSButton() {
  const sos = useStore((s) => s.sos);
  const user = useStore((s) => s.user);
  const mine = sos.filter((x) => x.requesterId === user?.uid && !x.cancelled && x.responseStatus !== 'resolved')[0];
  const state = !mine ? 'idle' : mine.verificationStatus === 'verified' ? 'active' : mine.verificationStatus === 'rejected' ? 'rejected' : 'pending';
  const colors = { idle: 'bg-red-600', pending: 'bg-amber-500', active: 'bg-green-600', rejected: 'bg-slate-500' }[state];
  return (
    <button onClick={() => useUI.getState().set({ sosOpen: true })} aria-label="SOS emergency"
      className="fixed right-4 z-[1100] flex h-16 w-16 items-center justify-center rounded-full text-white shadow-xl active:scale-95"
      style={{ bottom: 'calc(5.25rem + env(safe-area-inset-bottom))' }}>
      {state === 'idle' && <span className="absolute inset-0 rounded-full bg-red-500 animate-sosring" />}
      <span className={cn('relative flex h-16 w-16 flex-col items-center justify-center rounded-full', colors)}>
        <Siren className="h-6 w-6" /><span className="text-[10px] font-bold leading-none">SOS</span>
      </span>
    </button>
  );
}

export function SOSFlow() {
  const open = useUI((s) => s.sosOpen);
  const close = () => useUI.getState().set({ sosOpen: false });
  const { t } = useT();
  const online = useOnline();
  const contacts = useStore((s) => s.contacts);
  const createSOS = useStore((s) => s.createSOS);
  const cancelSOS = useStore((s) => s.cancelSOS);
  const sosList = useStore((s) => s.sos);
  const user = useStore((s) => s.user);
  const geo = useGeolocation();
  const [step, setStep] = useState<'warn' | 'confirm' | 'count' | 'sent'>('warn');
  const [count, setCount] = useState(3);
  const [type, setType] = useState(TYPES[0]);
  const [note, setNote] = useState('');
  const [place, setPlace] = useState('');
  const [sentId, setSentId] = useState<string>();

  useEffect(() => { if (open) { setStep('warn'); setCount(3); setSentId(undefined); geo.request(); } /* eslint-disable-next-line */ }, [open]);

  const location = (): GeoPoint => {
    if (geo.point && !place) return geo.point;
    const p = place ? PLACES[place] : PLACES.Gosaba;
    return { lat: p.lat, lng: p.lng, label: place ? `Near ${place}` : 'Location unavailable (Gosaba default - tell the officer your place)', manual: true };
  };

  useEffect(() => {
    if (step !== 'count') return;
    if (count <= 0) {
      createSOS({ type, description: note.trim() || 'No description', location: location() }).then((s) => { setSentId(s.id); setStep('sent'); });
      return;
    }
    const id = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(id);
    // eslint-disable-next-line
  }, [step, count]);

  const live = sosList.find((x) => x.id === sentId) ?? sosList.find((x) => x.requesterId === user?.uid && !x.cancelled && x.responseStatus !== 'resolved');
  const emergency = contacts.slice(0, 3);

  return (
    <Modal open={open} onClose={close} title="SOS Emergency">
      <div className="mb-3 rounded-xl2 bg-red-50 p-3 dark:bg-red-950/40">
        <div className="mb-2 text-sm font-semibold text-red-800 dark:text-red-200">Call directly if you are in immediate danger</div>
        <div className="flex flex-wrap gap-2">
          {emergency.map((c) => <a key={c.id} href={`tel:${c.phone}`} className="inline-flex h-10 items-center gap-1.5 rounded-xl2 bg-red-600 px-3 text-sm font-medium text-white"><Phone className="h-4 w-4" />{c.phone}</a>)}
        </div>
        <p className="mt-2 text-[11px] text-red-900/80 dark:text-red-200/80">Opening the dialer does not guarantee a call is connected.</p>
      </div>

      {step === 'warn' && (
        <div className="space-y-3">
          <div className="flex gap-2 text-sm"><ShieldAlert className="h-5 w-5 shrink-0 text-red-600" /><span>{t('sos.warn')}</span></div>
          {!online && <div className="flex gap-2 rounded-xl2 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"><WifiOff className="h-5 w-5 shrink-0" />You are offline. SOS will be saved and show &quot;Not sent - waiting for connection&quot;. Use the call buttons above.</div>}
          <label className="block text-sm font-medium">Emergency type
            <Select className="mt-1" value={type} onChange={(e) => setType(e.target.value)}>{TYPES.map((x) => <option key={x}>{x}</option>)}</Select></label>
          <Textarea placeholder="Short note (optional)" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
          <div className="rounded-xl2 border border-line p-3 text-xs">
            <div className="font-medium">Your location</div>
            {geo.loading && <div className="text-muted">Getting GPS…</div>}
            {geo.point && !place && <div className="text-muted">{geo.point.label} · ±{geo.point.accuracy} m · {fmtDate(geo.point.capturedAt!)}</div>}
            {geo.error && <div className="text-danger">{geo.error}</div>}
            <Select className="mt-2" value={place} onChange={(e) => setPlace(e.target.value)} aria-label="Nearest place"><option value="">Use GPS / choose nearest place…</option>{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select>
          </div>
          <Button full variant="danger" size="lg" onClick={() => setStep('confirm')}>Continue</Button>
        </div>
      )}
      {step === 'confirm' && (
        <div className="space-y-3 text-center">
          <Siren className="mx-auto h-12 w-12 text-red-600" />
          <div className="text-lg font-semibold">Is this a genuine emergency?</div>
          <p className="text-sm text-muted">Officials will be alerted with your name, phone and location. They verify every alert; a false alert may be reviewed.</p>
          <div className="grid grid-cols-2 gap-2"><Button variant="outline" onClick={close}>No, go back</Button><Button variant="danger" onClick={() => { setCount(3); setStep('count'); }}>Yes, send SOS</Button></div>
        </div>
      )}
      {step === 'count' && (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-8 border-red-600 text-5xl font-bold text-red-600">{Math.max(count, 0)}</div>
          <div className="text-sm text-muted">Sending SOS… you can still cancel.</div>
          <Button full variant="outline" onClick={() => setStep('warn')}><X className="h-4 w-4" />Cancel</Button>
        </div>
      )}
      {step === 'sent' && live && (
        <div className="space-y-3">
          <div className="text-center">
            {live.sent ? <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" /> : <WifiOff className="mx-auto h-12 w-12 text-amber-600" />}
            <div className="mt-1 text-lg font-semibold">{live.sent ? `SOS ${live.id} received (unverified)` : 'Not sent - waiting for connection'}</div>
            <p className="text-sm text-muted">{live.sent ? 'On-duty officials have been alerted and will verify. Keep your phone on and stay safe.' : 'It is saved on this device and will be sent when you reconnect. Officials are NOT notified yet. Call 112 now.'}</p>
          </div>
          <SOSTimeline id={live.id} />
          {!live.cancelled && live.responseStatus !== 'resolved' && <Button full variant="outline" onClick={() => { cancelSOS(live.id); close(); }}>Cancel this SOS (I am safe)</Button>}
        </div>
      )}
    </Modal>
  );
}

export function SOSTimeline({ id }: { id: string }) {
  const s = useStore((st) => st.sos.find((x) => x.id === id));
  if (!s) return null;
  return (
    <div className="rounded-xl2 border border-line p-3 text-sm">
      <div className="mb-2 flex flex-wrap gap-2"><Badge>Verification: {label(s.verificationStatus)}</Badge><Badge>Response: {label(s.responseStatus)}</Badge></div>
      <ol className="space-y-1.5 border-l-2 border-line pl-3">
        {s.events.map((e, i) => <li key={i} className="text-xs"><span className="font-medium">{label(e.to)}</span> · {fmtDate(e.at)}{e.note ? <span className="text-muted"> - {e.note}</span> : null}</li>)}
      </ol>
      <p className="mt-2 text-xs text-muted">Response time not yet confirmed.</p>
    </div>
  );
}
