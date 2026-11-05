import { useState } from 'react';
import { Bug, Phone, Navigation, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { useGeolocation, useUI } from '../../lib/hooks';
import { Button, Card, Tabs, Badge, Select, Textarea, Field, Input, DemoNote } from '../../components/ui';
import { haversine, km, fmtDay, PLACES, PLACE_NAMES, cn } from '../../lib/utils';
import { SEED_TEAMS } from '../../lib/seed';

const AV = { available: 'bg-green-100 text-green-800', unavailable: 'bg-red-100 text-red-800', unknown: 'bg-slate-200 text-slate-700' };

export default function Sarpa() {
  const [tab, setTab] = useState<'report' | 'hosp' | 'aid' | 'status'>('report');
  const { hospitals, createSOS, contacts } = useStore();
  const geo = useGeolocation();
  const [type, setType] = useState<'sighting' | 'bite'>('sighting'); const [place, setPlace] = useState('Gosaba'); const [desc, setDesc] = useState(''); const [victims, setVictims] = useState('1');
  const [caseId, setCaseId] = useState<string>();
  const sos = useStore((s) => s.sos.find((x) => x.id === caseId));

  const submit = async () => {
    if (desc.trim().length < 5) return toast.error('Please describe the situation.');
    const p = PLACES[place];
    const s = await createSOS({ type: type === 'bite' ? 'Snakebite' : 'Snake sighting (SARPA)', description: `${desc} · victims: ${type === 'bite' ? victims : 0}`, location: geo.point ?? { lat: p.lat, lng: p.lng, label: `Near ${place}`, manual: true } });
    setCaseId(s.id); setTab('status'); toast.success(s.sent ? `Case ${s.id} received (unverified)` : 'Saved offline - not sent');
  };
  const me = geo.point ?? { lat: PLACES[place].lat, lng: PLACES[place].lng };
  const list = hospitals.map((h) => ({ ...h, d: haversine(me, h) })).sort((a, b) => a.d - b.d);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Bug className="h-6 w-6 text-orange-600" /><h1 className="text-xl font-bold">SARPA Snake Help</h1></div>
      <Tabs tone="amber" tabs={[{ id: 'report', label: 'Report Incident' }, { id: 'hosp', label: 'Nearby Hospitals' }, { id: 'aid', label: 'First Aid Guide' }, ...(caseId ? [{ id: 'status' as const, label: 'Rescue Status' }] : [])]} value={tab} onChange={setTab} />

      {tab === 'report' && (
        <Card className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {(['sighting', 'bite'] as const).map((t) => <button key={t} onClick={() => setType(t)} className={cn('rounded-xl2 border p-3 text-sm font-medium', type === t ? 'border-orange-600 bg-orange-50 text-orange-900 dark:bg-orange-950/40 dark:text-orange-200' : 'border-line')}>{t === 'bite' ? 'Snakebite emergency' : 'Snake sighting'}</button>)}
          </div>
          {type === 'bite' && <div className="flex gap-2 rounded-xl2 bg-red-50 p-3 text-sm text-red-900 dark:bg-red-950/40 dark:text-red-200"><AlertTriangle className="h-5 w-5 shrink-0" /><div>Call <a href="tel:108" className="font-bold underline">108</a> / <a href="tel:112" className="font-bold underline">112</a> now and go to hospital. Do not wait for this form.</div></div>}
          <Field label="Nearest place"><Select value={place} onChange={(e) => setPlace(e.target.value)}>{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
          <Button size="sm" variant="outline" onClick={geo.request} loading={geo.loading}>Use my GPS{geo.point ? ' (set)' : ''}</Button>
          {type === 'bite' && <Field label="Number of victims"><Input type="number" min={1} max={20} value={victims} onChange={(e) => setVictims(e.target.value)} /></Field>}
          <Field label="Description"><Textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Where is the snake / what happened?" maxLength={400} /></Field>
          <p className="text-xs text-muted">Never try to catch or kill the snake. Species can be identified later from a safe photo; treatment must not wait for identification.</p>
          <Button full variant="amber" onClick={submit}>{type === 'bite' ? 'Send snakebite alert' : 'Report sighting'}</Button>
          <Button full variant="outline" onClick={() => useUI.getState().set({ reportOpen: true })}>File a full wildlife report instead</Button>
        </Card>
      )}

      {tab === 'hosp' && (
        <div className="space-y-3">
          <DemoNote>Distances are straight-line (haversine), not travel time. Anti-venom status is sample data and may be outdated: always call to confirm.</DemoNote>
          {list.map((h) => {
            const old = Date.now() - +new Date(h.confirmedAt) > 7 * 864e5;
            return (
              <Card key={h.id} className="!p-3">
                <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="font-semibold">{h.name}</div><div className="text-xs text-muted">{km(h.d)} away · {h.area}</div></div><Badge className={AV[h.antiVenom]}>{h.antiVenom === 'unknown' ? 'Anti-venom: unknown' : `Anti-venom: ${h.antiVenom}`}</Badge></div>
                <div className="mt-1 text-xs text-muted">Last confirmed {fmtDay(h.confirmedAt)}{old && ' (old, call to confirm)'}</div>
                <div className="mt-2 flex gap-2"><a href={`tel:${h.phone}`} className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-xl2 bg-primary text-sm font-medium text-primary-fg"><Phone className="h-4 w-4" />Call</a>
                  <a href={`https://www.openstreetmap.org/directions?to=${h.lat},${h.lng}`} target="_blank" rel="noreferrer" className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-xl2 border border-line text-sm font-medium"><Navigation className="h-4 w-4" />Directions</a></div>
              </Card>
            );
          })}
          <h3 className="pt-2 font-semibold">Snake rescue contacts</h3>
          {SEED_TEAMS.filter((t) => t.id === 'team_d').map((t) => <Card key={t.id} className="!p-3 flex items-center justify-between gap-2"><div className="min-w-0"><div className="font-medium">{t.name}</div><div className="text-xs text-muted">Approved rescuer (demo)</div></div><a href={`tel:${t.phone}`} className="shrink-0 rounded-xl2 bg-secondary px-3 py-2 text-sm font-medium">{t.phone}</a></Card>)}
          <p className="text-xs text-muted">{contacts[0].name}: {contacts[0].phone}</p>
        </div>
      )}

      {tab === 'aid' && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Snakebite first aid</h2>
          <ol className="list-decimal space-y-2 pl-5 text-sm"><li><b>Call 108 / 112</b> and start moving to a hospital immediately.</li><li>Keep the person calm and as still as possible. Minimise movement.</li><li>Keep the bitten limb at heart level, immobilised. Remove rings, watches, tight clothing before swelling.</li><li>Note the time of the bite.</li><li>Do not cut, suck or burn the wound. Do not apply a tight tourniquet. Do not use traditional remedies.</li><li>Do not delay transport to identify or catch the snake.</li></ol>
          <p className="text-[11px] text-muted">Sample text for the demo. Production content must be medically reviewed and region-specific. Not a substitute for professional care.</p>
        </Card>
      )}

      {tab === 'status' && (
        <Card className="space-y-3">
          {!sos ? <p className="text-sm text-muted">No active case.</p> : <>
            <div className="flex flex-wrap items-center gap-2"><b>{sos.id}</b><Badge>{sos.sent ? 'Received' : 'Not sent - waiting for connection'}</Badge></div>
            <p className="text-sm text-muted">{sos.description}</p>
            <ol className="space-y-2 border-l-2 border-line pl-4">{['received', 'acknowledged', 'dispatching', 'en_route', 'on_scene', 'resolved'].map((st) => {
              const reached = sos.events.some((e) => e.to === st);
              return <li key={st} className="flex items-center gap-2 text-sm"><CheckCircle2 className={cn('h-4 w-4', reached ? 'text-green-600' : 'text-muted/40')} /><span className={reached ? 'font-medium' : 'text-muted'}>{st.replace('_', ' ')}</span></li>;
            })}</ol>
            <p className="text-xs text-muted">Response time not yet confirmed.</p></>}
        </Card>
      )}
    </div>
  );
}
