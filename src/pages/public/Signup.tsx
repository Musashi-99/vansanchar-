import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from '../../components/Layouts';
import { Button, Field, Input, Select, Progress, DemoNote, Switch } from '../../components/ui';
import { OTPBlock } from './Login';
import { useStore } from '../../lib/store';
import { LANGS } from '../../lib/i18n';
import { PLACE_NAMES, uid, normalizeIndianPhone } from '../../lib/utils';
import type { AppUser } from '../../lib/types';
import { toast } from 'sonner';

const BLOOD = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export default function Signup() {
  const nav = useNavigate();
  const st = useLocation().state as { phone?: string } | null;
  const { users, login, setLang } = useStore();
  const [step, setStep] = useState(st?.phone ? 1 : 0);
  const [phone, setPhone] = useState(st?.phone ?? '');
  const [name, setName] = useState(''); const [address, setAddress] = useState(''); const [blood, setBlood] = useState('');
  const [ecName, setEcName] = useState(''); const [ecPhone, setEcPhone] = useState(''); const [lang, setL] = useState('bn'); const [region, setRegion] = useState('Gosaba');
  const [loc, setLoc] = useState(true); const [push, setPush] = useState(true); const [err, setErr] = useState('');
  const total = 5;

  const next = () => {
    setErr('');
    if (step === 1 && name.trim().length < 2) return setErr('Please enter your name.');
    if (step === 2 && ecPhone && !normalizeIndianPhone(ecPhone)) return setErr('Emergency contact number is not a valid Indian mobile number.');
    setStep(step + 1);
  };
  const finish = () => {
    if (users.some((u) => u.phone === phone)) return toast.error('An account with this number exists. Please log in.');
    const u: AppUser = { uid: uid('u'), name: name.trim(), phone, role: 'citizen', address: address || undefined, blood: blood || undefined,
      emergency: ecPhone ? { name: ecName || 'Emergency contact', phone: normalizeIndianPhone(ecPhone)! } : undefined, language: lang, region, status: 'active', alertRadius: 15, consent: { location: loc, voice: false, push } };
    useStore.setState((s) => ({ users: [...s.users, u] }));
    setLang(lang); login(u); toast.success('Profile created'); nav('/app/home');
  };
  return (
    <div className="mesh flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-line bg-card p-5 shadow-lg">
        <div className="text-center"><Link to="/" className="inline-block"><Logo size={40} /></Link><h1 className="mt-2 text-xl font-bold">Create account</h1></div>
        <Progress value={((step + 1) / (total + 1)) * 100} />
        {step === 0 && <><DemoNote>Demo OTP is 123456.</DemoNote><OTPBlock onVerified={(p) => { setPhone(p); setStep(1); }} /></>}
        {step === 1 && <div className="space-y-3"><Field label="Full name" error={err}><Input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Field><Field label="Address (optional)"><Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Village, block" /></Field><Button full onClick={next}>Next</Button></div>}
        {step === 2 && (
          <div className="space-y-3">
            <Field label="Blood group (optional)" hint="Shared only with responders during an emergency."><Select value={blood} onChange={(e) => setBlood(e.target.value)}>{BLOOD.map((b) => <option key={b} value={b}>{b || 'Prefer not to say'}</option>)}</Select></Field>
            <Field label="Emergency contact name (optional)"><Input value={ecName} onChange={(e) => setEcName(e.target.value)} /></Field>
            <Field label="Emergency contact phone (optional)" error={err}><Input inputMode="numeric" value={ecPhone} onChange={(e) => setEcPhone(e.target.value)} /></Field>
            <Button full onClick={next}>Next</Button></div>
        )}
        {step === 3 && (
          <div className="space-y-3">
            <Field label="Language"><Select value={lang} onChange={(e) => setL(e.target.value)}>{LANGS.map((l) => <option key={l.code} value={l.code}>{l.native} ({l.name})</option>)}</Select></Field>
            <Field label="Home region"><Select value={region} onChange={(e) => setRegion(e.target.value)}>{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
            <Button full onClick={next}>Next</Button></div>
        )}
        {step === 4 && (
          <div className="space-y-3">
            <p className="text-sm text-muted">VanSanchar uses your location only when you report or send SOS (or to show nearby alerts). Notifications warn you about verified nearby risks. You can change this any time in Profile.</p>
            <Switch label="Allow location for alerts" checked={loc} onChange={setLoc} /><Switch label="Allow push notifications" checked={push} onChange={setPush} hint="Cannot reach a powered-off phone; not a guaranteed emergency channel." />
            <Button full onClick={finish}>Create profile</Button></div>
        )}
        <div className="text-center text-sm">Have an account? <Link to="/login" className="font-medium text-primary underline">Log in</Link></div>
      </div>
    </div>
  );
}
