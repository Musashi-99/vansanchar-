import { useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Zap, WifiOff, ShieldCheck, Check, PawPrint, Slash, Wheat, TriangleAlert, MoreHorizontal, ArrowLeft, ArrowRight, Calendar, Clock, Users, Minus, Plus, Info, Camera, Siren, CloudUpload, Leaf, MapPin, LocateFixed, ImagePlus } from 'lucide-react';
import CitizenHero from './CitizenHero';
import { Panel, img } from '../kit';
import { cn, PLACES, PLACE_NAMES, processImage } from '../../lib/utils';
import { useStore } from '../../lib/store';
import { useGeolocation } from '../../lib/hooks';
import type { Animal, Severity } from '../../lib/types';

const types = [[PawPrint, 'Animal Sighting', '(Near Human Area)'], [Slash, 'Animal Attack', '(Injury / Damage)'], [Wheat, 'Crop / Livestock', 'Damage'], [TriangleAlert, 'Potential Risk', '(Animal Movement)'], [MoreHorizontal, 'Other', '(Specify)']] as const;
const animals: [Animal | 'other', string, string][] = [['tiger', 'Tiger', 'sp-tiger.jpg'], ['crocodile', 'Crocodile', 'sp-croc.jpg'], ['snake', 'Snake', 'sp-snake.jpg'], ['boar', 'Wild Boar', 'sp-boar.jpg'], ['elephant', 'Elephant', 'sp-elephant.jpg'], ['leopard', 'Leopard', 'sp-leopard.jpg'], ['bear', 'Bear', 'sp-bear.jpg'], ['other', 'Other', '']];
const sev: [Severity, string, string, string][] = [['high', 'High', 'Immediate danger', '(attack, injury, animal inside village)'], ['medium', 'Medium', 'Significant risk', '(close sighting, repeated movement)'], ['low', 'Low', 'Informational', '(distant sighting, old signs, track, etc.)']];
const steps = ['Incident Details', 'Location', 'Media & Notes', 'Review & Submit'];

export default function ReportPage() {
  const nav = useNavigate();
  const submit = useStore((s) => s.submitReport);
  const geo = useGeolocation();
  const file = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [type, setType] = useState(0);
  const [animal, setAnimal] = useState<Animal | 'other'>('tiger');
  const [severity, setSeverity] = useState<Severity>('high');
  const [date, setDate] = useState('2026-11-05');
  const [time, setTime] = useState('12:45');
  const [people, setPeople] = useState(0);
  const [desc, setDesc] = useState('');
  const [place, setPlace] = useState('Gosaba');
  const [photo, setPhoto] = useState<string>();
  const [busy, setBusy] = useState(false);

  const valid0 = desc.trim().length >= 5;
  const next = () => { if (step === 0 && !valid0) { toast.error('Please add a short description (at least 5 characters).'); return; } setStep((s) => Math.min(3, s + 1)); };
  const send = async () => {
    setBusy(true);
    try {
      const p = PLACES[place];
      const loc = geo.point && place === 'GPS' ? geo.point : { lat: p.lat, lng: p.lng, label: `Near ${place}`, manual: true };
      const r = await submit({ animal: (animal === 'other' ? 'unknown' : animal) as Animal, severity, description: desc.trim(), location: loc, occurredAt: new Date(`${date}T${time}`).toISOString(), photo, hasVoice: false, count: people, injury: type === 1, damage: type === 2 });
      toast.success(r.queued ? 'Saved offline — will sync when you are online' : 'Report submitted'); nav('/app/reports');
    } catch (e) { toast.error((e as Error).message || 'Could not submit'); } finally { setBusy(false); }
  };

  return (
    <>
      <CitizenHero title="Report a" accent="Conflict" sub="Help us respond quickly and keep your community and wildlife safe." bg="banner-sunset.jpg">
        <span className="flex flex-wrap items-center gap-x-8 gap-y-2 text-[13px] leading-tight">
          {[[Zap, 'Quick Report', '(< 2 min)'], [WifiOff, 'Works Offline', '(Saves & Syncs)'], [ShieldCheck, 'Verified & Secure', '(Preventing False Reports)']].map(([I, a, b]) => { const Ic = I as typeof Zap; return <span key={a as string} className="flex items-center gap-2.5"><Ic className="h-7 w-7" /><span><b className="block font-semibold">{a as string}</b>{b as string}</span></span>; })}</span>
      </CitizenHero>
      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 pb-8 sm:px-8 lg:grid-cols-[1fr_360px]">
        <Panel className="p-4">
          <ol className="relative mb-5 grid grid-cols-4 text-center text-[13.5px]">{steps.map((s, i) => <li key={s} className="relative flex flex-col items-center gap-1.5">
            {i > 0 && <i className={cn('absolute right-1/2 top-[18px] h-px w-full', i <= step ? 'bg-[var(--nf-lime)]' : 'bg-white/30')} />}
            <span className={cn('relative z-[1] flex h-9 w-9 items-center justify-center rounded-full border-2 text-[16px] font-bold', i === step ? 'border-[var(--nf-lime)] bg-[var(--nf-lime)] text-black' : i < step ? 'border-[var(--nf-lime)] bg-[#17391f]' : 'border-white/60 bg-[#0a2111]')}>{i < step ? <Check className="h-4 w-4" strokeWidth={3.5} /> : i + 1}</span>
            <span className={i === step ? 'font-semibold text-[var(--nf-lime)]' : ''}>{s}</span></li>)}</ol>

          <div className="rounded-2xl border border-[var(--nf-line)] bg-[#082012]/70 p-4">
            {step === 0 && <>
              <h2 className="text-[22px] font-bold">1. Incident Details</h2><p className="mb-3 text-[14px]">Tell us what happened.</p>
              <h3 className="mb-2 text-[14px] font-semibold">Type of Incident <span className="text-[#ff5a5a]">*</span></h3>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">{types.map(([I, a, b], i) => <button key={a} onClick={() => setType(i)} aria-pressed={type === i} className={cn('relative flex min-h-[92px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 text-center text-[12.5px] leading-tight', type === i ? 'border-[#c9ff6a] bg-gradient-to-b from-[#a8f43a] to-[#7fcf2a] font-semibold text-black shadow-[0_0_16px_rgba(168,244,58,.5)]' : 'border-[var(--nf-line)] bg-[#0f321a]/70')}>
                {type === i && <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#1b6b24] text-white"><Check className="h-3 w-3" strokeWidth={4} /></span>}<I className="h-7 w-7" /><span>{a}<br /><span className="font-normal">{b}</span></span></button>)}</div>
              <h3 className="mb-2 mt-5 text-[14px] font-semibold">Which Animal Was Involved? <span className="text-[#ff5a5a]">*</span></h3>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">{animals.map(([k, n, im]) => <button key={k} onClick={() => setAnimal(k)} aria-pressed={animal === k} className={cn('relative flex h-[92px] flex-col overflow-hidden rounded-xl border text-center text-[12.5px]', animal === k ? 'border-[#c9ff6a] shadow-[0_0_14px_rgba(168,244,58,.45)]' : 'border-[var(--nf-line)]')}>
                {im ? <img src={img(im)} alt="" className="h-[68px] w-full object-cover" /> : <span className="flex h-[68px] items-center justify-center"><MoreHorizontal className="h-6 w-6" /></span>}<span className={cn('flex flex-1 items-center justify-center', animal === k ? 'bg-[var(--nf-lime)] font-semibold text-black' : 'bg-[#0f321a]/80')}>{n}</span>
                {animal === k && <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#1b6b24] text-white"><Check className="h-3 w-3" strokeWidth={4} /></span>}</button>)}</div>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div><h3 className="mb-2 text-[14px] font-semibold">Severity / Risk Level <span className="text-[#ff5a5a]">*</span></h3>
                  <div className="divide-y divide-white/10 rounded-xl border border-[var(--nf-line)]" role="radiogroup">{sev.map(([k, a, b, c]) => <button key={k} role="radio" aria-checked={severity === k} onClick={() => setSeverity(k)} className="flex w-full items-center gap-3 px-3 py-2 text-left text-[13px]"><span className={cn('flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2', severity === k ? 'border-[var(--nf-lime)]' : 'border-[#8a9a8a]')}>{severity === k && <i className="h-2 w-2 rounded-full bg-[var(--nf-lime)]" />}</span>
                    <span className={cn('flex h-6 w-6 items-center justify-center', k === 'high' ? 'text-[#ff4040]' : k === 'medium' ? 'text-[#ffa41c]' : 'text-[#58e05b]')}>{k === 'low' ? <span className="h-5 w-5 rounded-full border-[3px] border-current" /> : <TriangleAlert className="h-6 w-6" fill="currentColor" fillOpacity={0.25} />}</span><span className="leading-tight"><b>{a}</b> – {b}<br /><span className="text-[#cfe3c4]">{c}</span></span></button>)}</div></div>
                <div className="space-y-3"><div><h3 className="mb-2 text-[14px] font-semibold">Date and Time of Incident <span className="text-[#ff5a5a]">*</span></h3>
                  <div className="grid grid-cols-[1.4fr_1fr] gap-2"><label className="nf-pill !justify-start !rounded-xl !py-2.5"><Calendar className="h-4 w-4" /><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none [color-scheme:dark]" /></label><label className="nf-pill !justify-start !rounded-xl !py-2.5"><Clock className="h-4 w-4" /><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="min-w-0 flex-1 bg-transparent text-[14px] outline-none [color-scheme:dark]" /></label></div></div>
                  <div><h3 className="mb-2 text-[14px] font-semibold">Number of People Affected</h3><div className="nf-pill !flex !justify-between !rounded-xl !py-1.5"><span className="flex items-center gap-2"><Users className="h-4 w-4" />{people}</span><span className="flex gap-1.5"><button aria-label="Decrease" onClick={() => setPeople((p) => Math.max(0, p - 1))} className="rounded-md bg-white/10 p-1.5"><Minus className="h-4 w-4" /></button><button aria-label="Increase" onClick={() => setPeople((p) => p + 1)} className="rounded-md bg-white/10 p-1.5"><Plus className="h-4 w-4" /></button></span></div></div></div></div>
              <h3 className="mb-2 mt-4 text-[14px] font-semibold">Brief Description <span className="text-[#ff5a5a]">*</span></h3>
              <div className="rounded-xl border border-[var(--nf-line)] bg-[#0a2111] p-3"><textarea value={desc} onChange={(e) => setDesc(e.target.value.slice(0, 500))} rows={3} placeholder="Describe what you saw, where it happened, and any immediate risk… (e.g. Tiger seen near the embankment, moving towards village)" className="w-full resize-none bg-transparent text-[14px] outline-none placeholder:text-[#a9c79d]" style={{ fontSize: 14 }} /><div className="text-right text-xs">{desc.length} / 500</div></div></>}

            {step === 1 && <>
              <h2 className="text-[22px] font-bold">2. Location</h2><p className="mb-3 text-[14px]">Where did it happen?</p>
              <button onClick={() => { geo.request(); setPlace('GPS'); }} className="nf-btn mb-3"><LocateFixed className="h-4 w-4" />{geo.loading ? 'Getting GPS…' : 'Use my GPS location'}</button>
              {geo.point && place === 'GPS' && <p className="mb-3 flex items-center gap-2 text-sm text-[#58e05b]"><Check className="h-4 w-4" />{geo.point.label} · ±{geo.point.accuracy} m</p>}{geo.error && <p className="mb-3 text-sm text-[#ffa41c]">{geo.error}</p>}
              <h3 className="mb-2 text-[14px] font-semibold">Or choose the nearest place</h3>
              <div className="flex flex-wrap gap-2">{PLACE_NAMES.map((p) => <button key={p} onClick={() => setPlace(p)} className={cn('nf-pill', place === p && 'on')}><MapPin className="h-3.5 w-3.5" />{p}</button>)}</div></>}

            {step === 2 && <>
              <h2 className="text-[22px] font-bold">3. Media &amp; Notes</h2><p className="mb-3 text-[14px]">Add a photo if it is safe to do so.</p>
              <input ref={file} type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setPhoto(await processImage(f)); } catch (err) { toast.error((err as Error).message); } }} />
              {photo ? <div className="relative w-fit"><img src={photo} alt="Attached" className="max-h-[220px] rounded-xl" /><button onClick={() => setPhoto(undefined)} className="nf-btn danger absolute right-2 top-2 !px-3 !py-1 !text-xs">Remove</button></div>
                : <button onClick={() => file.current?.click()} className="flex h-[150px] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--nf-line)] text-[14px]"><ImagePlus className="h-8 w-8 text-[var(--nf-lime)]" />Tap to add a photo (optional)</button>}</>}

            {step === 3 && <>
              <h2 className="text-[22px] font-bold">4. Review &amp; Submit</h2>
              <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-[14px] sm:grid-cols-[150px_1fr]">{[['Incident', types[type][1]], ['Animal', animals.find((a) => a[0] === animal)?.[1] ?? ''], ['Severity', sev.find((s) => s[0] === severity)?.[1] ?? ''], ['When', `${date} ${time}`], ['People affected', String(people)], ['Location', place === 'GPS' ? (geo.point?.label ?? 'GPS') : `Near ${place}`], ['Description', desc]].map(([k, v]) => <div key={k} className="contents"><dt className="text-[#bcd2b0]">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
              {photo && <img src={photo} alt="Attached" className="mt-3 max-h-[140px] rounded-xl" />}</>}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button onClick={() => (step === 0 ? nav(-1) : setStep(step - 1))} className="nf-btn ghost !rounded-full !px-6"><ArrowLeft className="h-4 w-4" />{step === 0 ? 'Cancel' : 'Back'}</button>
            {step < 3 ? <button onClick={next} className="nf-btn !rounded-full !px-6">Next: {['Add Location', 'Add Media', 'Review'][step]}<ArrowRight className="h-4 w-4" /></button>
              : <button onClick={send} disabled={busy} className="nf-btn !rounded-full !px-6 disabled:opacity-60">{busy ? 'Submitting…' : 'Submit Report'}<ArrowRight className="h-4 w-4" /></button>}
          </div>
        </Panel>

        <aside className="space-y-3">
          <Panel className="p-4"><h3 className="flex items-center gap-2 border-b border-white/10 pb-2 text-[18px] font-bold"><Info className="h-5 w-5 text-[var(--nf-lime)]" />Before You Report</h3>
            <ul className="mt-2 space-y-2 text-[13.5px]">{['Stay at a safe distance from the animal.', 'Do not try to chase, capture or harm it.', 'Share clear and recent information.', 'Add a photo or video if it is safe.', 'In case of an emergency, use the SOS button instead of this form.'].map((t) => <li key={t} className="flex gap-2.5"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--nf-lime)]" />{t}</li>)}</ul></Panel>
          <Panel className="p-4"><h3 className="flex items-center gap-2 border-b border-white/10 pb-2 text-[18px] font-bold"><Camera className="h-5 w-5 text-[var(--nf-lime)]" />Example of a Good Report</h3>
            <div className="mt-2 grid grid-cols-[1fr_1fr] gap-3"><div className="relative"><img src={img('report-photo.jpg')} alt="" className="h-full w-full rounded-lg object-cover" /><span className="absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#2e8b2a]"><Check className="h-4 w-4" /></span></div>
              <ul className="space-y-1.5 text-[12.5px]">{['Clear photo or video', 'Exact location (GPS)', 'Correct animal (Tiger)', 'Time and date', 'Short and accurate description'].map((t) => <li key={t} className="flex gap-1.5"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--nf-lime)]" />{t}</li>)}</ul></div></Panel>
          <Panel tone="red" className="p-4"><div className="flex items-start gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c92a2a]"><Siren className="h-5 w-5" /></span><div><h3 className="text-[19px] font-bold">Need Urgent Help?</h3><p className="text-[13px] leading-snug">If you are in immediate danger or someone is injured, use SOS Emergency.</p></div></div><Link to="/app/sos" className="nf-btn red mt-3 w-full !justify-between !py-3 !text-[16px]"><span className="flex items-center gap-2"><Siren className="h-5 w-5" />SOS Emergency</span><ArrowRight className="h-4 w-4" /></Link></Panel>
          <Panel className="p-4"><div className="flex items-start gap-3"><WifiOff className="mt-1 h-8 w-8 shrink-0" /><div><h3 className="text-[18px] font-bold">No Internet?</h3><p className="text-[13px] leading-snug">You can still fill this form. It will be saved offline and automatically sent when you’re back online.</p></div><CloudUpload className="mt-auto h-7 w-7 shrink-0" /></div></Panel>
        </aside>
      </div>
      <div className="mx-auto mb-8 grid max-w-[1400px] gap-4 px-4 sm:px-8 md:grid-cols-3"><Panel className="col-span-full grid gap-4 p-4 md:grid-cols-3">{[[ShieldCheck, 'Report Responsibly', 'Share only true and verified information.'], [Leaf, 'Coexist with Wildlife', 'Help keep people and animals safe in the Sundarbans.'], [Users, 'A Community Effort', 'Your reports help in timely response, awareness and conflict prevention.']].map(([I, a, b]) => { const Ic = I as typeof Leaf; return <div key={a as string} className="flex items-center gap-3"><Ic className="h-9 w-9 shrink-0 text-[var(--nf-lime)]" /><div className="leading-tight"><b className="block text-[15px]">{a as string}</b><span className="text-[12.5px]">{b as string}</span></div></div>; })}</Panel></div>
    </>
  );
}
