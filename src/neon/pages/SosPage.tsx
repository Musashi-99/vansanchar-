import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Siren, Zap, MapPin, ShieldCheck, Info, Check, Phone, ArrowRight, Image as ImageIcon, Mic, Users, WifiOff, CloudUpload, LocateFixed, Bell, MessageSquare, Hand, Maximize2, Signal, Crosshair } from 'lucide-react';
import CitizenHero from './CitizenHero';
import { Panel } from '../kit';
import NeonMap from '../NeonMap';
import { useStore } from '../../lib/store';
import { useGeolocation, useOnline } from '../../lib/hooks';
import { PLACES } from '../../lib/utils';
import type { GeoPoint } from '../../lib/types';

const contactIcons = [Users, MapPin, Plus2, Hand];
function Plus2(props: { className?: string }) { return <span className={`flex h-7 w-7 items-center justify-center rounded-full bg-[#e5242b] text-[15px] font-extrabold text-white ${props.className ?? ''}`}>H</span>; }
const HOLD_MS = 3000;

export default function SosPage() {
  const createSOS = useStore((s) => s.createSOS);
  const contacts = useStore((s) => s.contacts);
  const geo = useGeolocation();
  const online = useOnline();
  const [hold, setHold] = useState(0);
  const [sent, setSent] = useState<string>();
  const raf = useRef<number>();
  const t0 = useRef(0);

  useEffect(() => { geo.request(); /* eslint-disable-next-line */ }, []);
  const loc = (): GeoPoint => geo.point ?? { lat: PLACES.Gosaba.lat, lng: PLACES.Gosaba.lng, label: 'Near Gosaba (approximate)', manual: true };

  const stop = () => { if (raf.current) cancelAnimationFrame(raf.current); raf.current = undefined; setHold(0); };
  const fire = async () => {
    stop();
    try { const s = await createSOS({ type: 'Other life-threatening', description: 'SOS from web emergency page', location: loc() }); setSent(s.id); toast.success(online ? 'SOS sent to the control room' : 'SOS saved — it will send as soon as you are online'); }
    catch (e) { toast.error((e as Error).message || 'Could not send SOS. Call the emergency contacts below.'); }
  };
  const start = () => {
    if (sent) return;
    t0.current = performance.now();
    const tick = (n: number) => { const p = Math.min(1, (n - t0.current) / HOLD_MS); setHold(p); if (p >= 1) { void fire(); return; } raf.current = requestAnimationFrame(tick); };
    raf.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => { if (raf.current) cancelAnimationFrame(raf.current); }, []);

  const p = geo.point ?? { lat: 22.0634, lng: 88.7261, accuracy: 8 };
  const emerg = contacts.slice(0, 3);
  const rows: [string, string?, string?][] = [['Forest Control Room', 'South 24 Parganas', emerg[0]?.phone], ['Wildlife Rescue (Sundarbans)', undefined, emerg[1]?.phone], ['Nearest Hospital', undefined, emerg[2]?.phone], ['Snakebite Helpline (SARPA)', undefined, undefined]];

  return (
    <>
      <CitizenHero title="SOS" accent="Emergency" icon={<Siren className="!text-[#ff4040]" />} sub="Get urgent help during a wildlife encounter, attack, or life-threatening situation.">
        {[[Zap, 'Quick Response'], [MapPin, 'Share Live Location'], [ShieldCheck, 'Verified & Secure']].map(([I, t]) => { const Ic = I as typeof Zap; return <span key={t as string} className="nf-pill !rounded-xl !bg-black/40 !px-4 !py-2.5 !text-[15px] !font-semibold"><Ic className="h-5 w-5 text-[var(--nf-lime)]" />{t as string}</span>; })}
      </CitizenHero>
      <div className="mx-auto grid max-w-[1400px] gap-4 px-4 pb-8 sm:px-8 lg:grid-cols-[400px_1fr_400px]">
        <div className="space-y-3">
          <Panel className="p-4"><h3 className="mb-2 flex items-center gap-2 text-[19px] font-bold"><Info className="h-5 w-5 text-[#ff5a5a]" />When to use SOS?</h3>
            <ul className="space-y-2.5 text-[14.5px]">{['You are in immediate danger.', 'A wildlife attack has occurred.', 'Someone is injured (e.g., tiger, crocodile, snake).', 'You need urgent assistance from forest/rescue teams.'].map((t) => <li key={t} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-[#ff5a5a]" />{t}</li>)}</ul></Panel>
          <Panel className="p-4"><h3 className="mb-2 flex items-center gap-2 text-[19px] font-bold"><Phone className="h-5 w-5 text-[#ff5a5a]" />Emergency Contacts</h3>
            <ul className="divide-y divide-white/10">{rows.map(([n, a, ph], i) => { const Ic = contactIcons[i]; return <li key={n} className="flex items-center gap-3 py-2.5"><Ic className="h-7 w-7 shrink-0 text-[var(--nf-lime)]" /><span className="min-w-0 flex-1 leading-tight"><b className="block text-[14.5px] font-semibold">{n}</b>{a && <span className="text-[13px]">{a}</span>}</span>
              <a href={ph ? `tel:${ph.replace(/\s/g, '')}` : undefined} aria-label={`Call ${n}`} className="flex h-10 w-14 items-center justify-center rounded-lg border border-[var(--nf-line)] bg-[#12341b]"><Phone className="h-5 w-5" /></a></li>; })}</ul>
            <Link to="/app/offline-guides" className="nf-btn ghost mt-3 w-full !rounded-xl !py-3">View All Contacts <ArrowRight className="h-4 w-4" /></Link></Panel>
        </div>

        <Panel tone="red" className="flex flex-col items-center px-4 pb-4 pt-6 text-center">
          <Siren className="h-10 w-10 text-[#ff4040]" /><h2 className="mt-2 text-[34px] font-extrabold">Press to Send SOS</h2>
          <p className="max-w-[380px] text-[15px] leading-snug">Your location, identity, and emergency details will be instantly shared with the response network.</p>
          <div className="relative my-5 flex h-[280px] w-[280px] items-center justify-center">
            <i className="absolute inset-0 rounded-full border border-red-500/40" /><i className="absolute inset-5 rounded-full border border-red-500/50" />
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 280 280"><circle cx="140" cy="140" r="132" fill="none" stroke="#ffd0d0" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 132 * hold} 999`} /></svg>
            <button onPointerDown={start} onPointerUp={stop} onPointerLeave={stop} onPointerCancel={stop} onKeyDown={(e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) start(); }} onKeyUp={(e) => { if (e.key === ' ' || e.key === 'Enter') stop(); }} aria-label="Press and hold for 3 seconds to send SOS"
              className="nf-sosbtn relative flex h-[232px] w-[232px] select-none flex-col items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_30%,#ff5a5a,#d11a1a_60%,#a80f0f)] text-white" style={{ touchAction: 'none' }}>
              <Siren className="h-16 w-16" strokeWidth={1.6} /><span className="text-[54px] font-extrabold leading-none">SOS</span></button></div>
          {sent ? <p className="rounded-full bg-[#1d6b24] px-5 py-2.5 text-[15px] font-semibold" role="status">✓ SOS sent · reference {sent.slice(-6).toUpperCase()}</p>
            : <p className="flex items-center gap-2 rounded-full border border-[#ff4040] bg-[#5a1010]/50 px-5 py-2.5 text-[15px] font-semibold"><Hand className="h-5 w-5" />{hold > 0 ? `Keep holding… ${Math.ceil((1 - hold) * 3)}s` : 'Tap & Hold for 3 Seconds'}</p>}
          <div className="mt-5 grid w-full grid-cols-4 gap-2">{[[MapPin, 'Live Location (GPS)'], [ImageIcon, 'Photo / Video (Optional)'], [Mic, 'Voice Note (Optional)'], [Users, 'Alert Rescue Teams']].map(([I, t]) => { const Ic = I as typeof Mic; return <div key={t as string} className="flex flex-col items-center gap-1.5 rounded-xl bg-black/20 px-1 py-3 text-[12.5px] leading-tight"><Ic className="h-6 w-6" />{t as string}</div>; })}</div>
        </Panel>

        <div className="space-y-3">
          <Panel className="p-4"><h3 className="mb-2 flex items-center gap-2 text-[19px] font-bold"><MapPin className="h-5 w-5 text-[#ff5a5a]" />Your Location <span className="font-normal">(Live)</span></h3>
            <div className="grid grid-cols-[1.25fr_1fr] gap-3"><NeonMap height={160} zoom={10.5} center={[p.lng, p.lat]} reserve={false} scale={false} controls={false} interactive={false} items={[{ lng: p.lng, lat: p.lat, node: <span className="relative flex h-14 w-14 items-center justify-center"><i className="nf-pulse absolute inset-0 rounded-full bg-red-500/50" /><i className="h-7 w-7 rounded-full border-[3px] border-white bg-red-600" /></span> }]}><span className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-md bg-black/60"><Maximize2 className="h-4 w-4" /></span></NeonMap>
              <div className="flex flex-col justify-between text-[14px]"><div className="flex items-center gap-2"><Crosshair className="h-7 w-7 shrink-0" /><span className="leading-tight"><b>{Math.abs(p.lat).toFixed(4)}° N</b><br /><b>{p.lng.toFixed(4)}° E</b></span></div><div className="flex items-center gap-2"><Signal className="h-6 w-6 shrink-0 text-[#58e05b]" /><span className="leading-tight">GPS Accuracy<br />± {geo.point?.accuracy ?? 8} m</span></div><span className="rounded-lg bg-[var(--nf-lime)] py-1.5 text-center text-[13.5px] font-bold text-black">Live Tracking {geo.point ? 'ON' : 'OFF'}</span></div></div></Panel>
          <Panel className="p-4"><h3 className="mb-3 flex items-center gap-2 text-[19px] font-bold"><Siren className="h-5 w-5 text-[#ff5a5a]" />What Happens After You Send SOS?</h3>
            <ol className="space-y-3 text-[14.5px]">{[[Bell, 'Your SOS is received by the control team.'], [LocateFixed, 'Your location is verified.'], [Users, 'Nearest forest / rescue team is alerted.'], [MessageSquare, 'You will get real-time status updates here.']].map(([I, t], i) => { const Ic = I as typeof Bell; return <li key={t as string} className="flex items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--nf-line)] bg-[#12341b]"><Ic className="h-5 w-5 text-[var(--nf-lime)]" /></span><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#58e05b] text-sm font-bold text-black">{i + 1}</span><span>{t as string}</span></li>; })}</ol></Panel>
          <Panel tone="red" className="p-4"><div className="flex items-start gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#3a0d0d]"><WifiOff className="h-7 w-7" /></span><div className="min-w-0 flex-1"><h3 className="text-[19px] font-bold">No Internet?</h3><p className="text-[13px] leading-snug">You can still trigger SOS. It will be saved offline and sent automatically when network is available.</p></div><CloudUpload className="mt-auto h-8 w-8 shrink-0" /></div></Panel>
        </div>
      </div>
    </>
  );
}
