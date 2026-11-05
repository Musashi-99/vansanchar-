import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { User, ShieldCheck, Settings2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input } from '../../components/ui';
import { useStore } from '../../lib/store';
import { homeFor } from '../../components/Layouts';
import { DEMO_CITIZEN, OFFICIALS } from '../../lib/seed';
import { normalizeIndianPhone } from '../../lib/utils';
import { useT } from '../../lib/i18n';

export const DEMO_OTP = '123456';

export function OTPBlock({ onVerified, phoneInit = '' }: { onVerified: (phone: string) => void; phoneInit?: string }) {
  const { t } = useT();
  const [phone, setPhone] = useState(phoneInit);
  const [sent, setSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [err, setErr] = useState('');
  const [wait, setWait] = useState(0);
  const [tries, setTries] = useState(0);
  const [expires, setExpires] = useState(0);
  useEffect(() => { if (wait <= 0) return; const id = setTimeout(() => setWait(wait - 1), 1000); return () => clearTimeout(id); }, [wait]);
  const send = () => {
    const n = normalizeIndianPhone(phone);
    if (!n) return setErr('Enter a valid 10-digit Indian mobile number (starts with 6-9).');
    setErr(''); setSent(true); setWait(30); setTries(0); setExpires(Date.now() + 5 * 60000);
    toast.info(`Demo OTP: ${DEMO_OTP}`);
  };
  const verify = () => {
    if (Date.now() > expires) return setErr('OTP expired. Request a new one.');
    if (tries >= 5) return setErr('Too many attempts. Please wait and resend.');
    if (otp !== DEMO_OTP) { setTries(tries + 1); return setErr(`Incorrect OTP. ${4 - tries} attempt(s) left.`); }
    onVerified(normalizeIndianPhone(phone)!);
  };
  return (
    <div className="space-y-3">
      <Field label={t('login.phone')} error={!sent ? err : undefined}>
        <div className="flex gap-2"><span className="flex h-11 items-center rounded-xl border border-line bg-input px-3 text-sm">+91</span>
          <Input inputMode="numeric" autoComplete="tel-national" maxLength={12} placeholder="98300 12345" value={phone} disabled={sent} onChange={(e) => setPhone(e.target.value)} /></div>
      </Field>
      {!sent ? <Button full onClick={send}>{t('login.send')}</Button> : (
        <>
          <Field label={t('login.otp')} error={err}><Input inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="••••••" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))} className="text-center text-xl tracking-[.4em]" /></Field>
          <Button full onClick={verify} disabled={otp.length !== 6}>{t('login.verify')}</Button>
          <div className="flex justify-between text-sm"><button className="text-muted underline" onClick={() => { setSent(false); setOtp(''); setErr(''); }}>Change number</button>
            <button disabled={wait > 0} onClick={send} className="text-primary disabled:text-muted">{wait > 0 ? `Resend in ${wait}s` : 'Resend OTP'}</button></div>
        </>
      )}
    </div>
  );
}

type Portal = 'citizen' | 'official' | 'admin';
const PORTALS: { id: Portal; label: string; sub: string; icon: typeof User }[] = [
  { id: 'citizen', label: 'Citizen', sub: 'Report & stay safe', icon: User },
  { id: 'official', label: 'Forest Officer', sub: 'Verify & respond', icon: ShieldCheck },
  { id: 'admin', label: 'Admin', sub: 'Manage platform', icon: Settings2 },
];

export default function Login() {
  const nav = useNavigate();
  const loc = useLocation();
  const [sp] = useSearchParams();
  const login = useStore((s) => s.login);
  const users = useStore((s) => s.users);
  const session = useStore((s) => s.user);
  const initial = (['citizen', 'official', 'admin'] as Portal[]).find((p) => p === sp.get('role')) ?? 'citizen';
  const [portal, setPortal] = useState<Portal>(initial);
  const [mode, setMode] = useState<'phone' | 'email'>(initial === 'citizen' ? 'phone' : 'email');
  const [email, setEmail] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [show, setShow] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const from = (loc.state as { from?: string } | null)?.from;

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lg-orb', { scale: 0.6, opacity: 0, duration: 1.4, stagger: 0.2, ease: 'power3.out' });
      gsap.to('.lg-orb', { y: -18, duration: 4, yoyo: true, repeat: -1, ease: 'sine.inOut', stagger: 0.6 });
      gsap.from('.lg-in', { y: 24, opacity: 0, duration: 0.7, stagger: 0.09, ease: 'power3.out', delay: 0.1 });
    }, root);
    return () => ctx.revert();
  }, []);
  const pick = (p: Portal) => { setPortal(p); setErr(''); setEmail(''); setPw(''); setMode(p === 'citizen' ? 'phone' : 'email'); };

  const done = (target: string, name: string) => {
    toast.success(`Welcome, ${name}`);
    const base = '/' + target.split('/')[1];
    nav(from && from.startsWith(base) ? from : target, { replace: true });
  };
  const enterPhone = (phone: string) => {
    const u = users.find((x) => x.phone === phone && x.role === 'citizen');
    if (!u) { toast.info('New number: let us set up your profile'); nav('/signup', { state: { phone } }); return; }
    if (u.status === 'suspended') return toast.error('This account is suspended.');
    login(u); done('/app/home', u.name);
  };
  const submit = () => {
    const e = email.trim().toLowerCase();
    if (!e || !pw) return setErr('Enter email and password.');
    if (portal === 'citizen') {
      if (e === 'citizen@vansanchar.demo' && pw === 'Demo@1234') { login(DEMO_CITIZEN); return done('/app/home', DEMO_CITIZEN.name); }
      return setErr('Wrong email or password.');
    }
    const o = OFFICIALS.find((x) => x.email === e && x.password === pw);
    if (!o) return setErr('Invalid credentials for this portal.');
    const isAdmin = o.role === 'platform_admin';
    if (portal === 'admin' && !isAdmin) return setErr('This account is not an administrator. Use the Forest Officer portal.');
    if (portal === 'official' && isAdmin) return setErr('Administrators sign in through the Admin portal.');
    const { password, ...u } = o; void password;
    login(u); done(isAdmin ? '/admin/dashboard' : '/official/overview', u.name);
  };
  const demos = OFFICIALS.filter((o) => (portal === 'admin') === (o.role === 'platform_admin'));
  const fill = (e: string, p: string) => { setEmail(e); setPw(p); setErr(''); };
  if (session) return <Navigate to={homeFor(session.role)} replace />;

  return (
    <div ref={root} className="nf relative flex min-h-dvh items-center justify-center overflow-hidden p-4">
      <div className="lg-orb pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#a8f43a]/10 blur-3xl" />
      <div className="lg-orb pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-[#2a9d4a]/20 blur-3xl" />
      <div className="relative w-full max-w-md space-y-4">
        <div className="lg-in text-center">
          <img src="/icon.svg" width={56} height={56} alt="" className="mx-auto rounded-full" />
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight">Van<span className="text-[var(--nf-lime)]">Sanchar</span></h1>
          <p className="text-sm text-[var(--muted)]">Sign in to your portal</p>
        </div>
        <div className="lg-in grid grid-cols-3 gap-2" role="tablist" aria-label="Portal">
          {PORTALS.map((p) => {
            const on = portal === p.id;
            return (
              <button key={p.id} role="tab" aria-selected={on} onClick={() => pick(p.id)}
                className={`relative flex flex-col items-center gap-1 rounded-2xl border px-1 py-3 text-center transition ${on ? 'border-[var(--nf-lime)] text-white' : 'border-[var(--nf-line)] text-[var(--muted)] hover:border-[var(--nf-lime)]/60'}`}>
                {on && <motion.span layoutId="portal-pill" className="absolute inset-0 rounded-2xl bg-[#2a5a1c]/80 shadow-[0_0_18px_rgba(168,244,58,.3)]" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />}
                <p.icon className={`relative h-6 w-6 ${on ? 'text-[var(--nf-lime)]' : ''}`} />
                <span className="relative text-[13px] font-bold leading-tight">{p.label}</span>
                <span className="relative text-[10.5px] leading-tight">{p.sub}</span>
              </button>
            );
          })}
        </div>
        <div className="lg-in nf-panel p-5">
          <AnimatePresence mode="wait">
            <motion.div key={portal + mode} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.2 }} className="space-y-3">
              {portal === 'citizen' && (
                <div className="grid grid-cols-2 gap-1 rounded-xl border border-[var(--nf-line)] p-1 text-sm">
                  {(['phone', 'email'] as const).map((m) => <button key={m} onClick={() => { setMode(m); setErr(''); }} className={`rounded-lg py-1.5 font-medium ${mode === m ? 'bg-[var(--nf-lime)] text-black' : 'text-[var(--muted)]'}`}>{m === 'phone' ? 'Phone OTP' : 'Email'}</button>)}
                </div>
              )}
              {portal === 'citizen' && mode === 'phone' ? (
                <>
                  <p className="rounded-xl border border-[var(--nf-line)] bg-black/20 p-2.5 text-xs text-[var(--muted)]">Demo: number <b className="text-white">98300 12345</b>, OTP <b className="text-white">{DEMO_OTP}</b>. Any other number creates a new citizen profile.</p>
                  <OTPBlock onVerified={enterPhone} />
                </>
              ) : (
                <>
                  <p className="rounded-xl border border-[var(--nf-line)] bg-black/20 p-2.5 text-xs text-[var(--muted)]">Demo password for all accounts: <b className="text-white">Demo@1234</b>. Tap an account to fill.</p>
                  <div className="flex flex-wrap gap-2">
                    {portal === 'citizen'
                      ? <button onClick={() => fill('citizen@vansanchar.demo', 'Demo@1234')} className="nf-pill !py-1 text-xs">Anita Mondal · Citizen</button>
                      : demos.map((o) => <button key={o.uid} onClick={() => fill(o.email!, o.password)} className="nf-pill !py-1 text-xs">{o.name} · {o.designation}</button>)}
                  </div>
                  <form onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-3">
                    <Field label={portal === 'citizen' ? 'Email' : 'Official email'}><Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
                    <Field label="Password" error={err}>
                      <div className="relative"><Input type={show ? 'text' : 'password'} autoComplete="current-password" value={pw} onChange={(e) => setPw(e.target.value)} className="pr-11" />
                        <button type="button" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow(!show)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--muted)]">{show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
                    </Field>
                    <Button full type="submit">Sign in as {PORTALS.find((p) => p.id === portal)!.label}</Button>
                  </form>
                  <button className="w-full text-sm text-[var(--muted)] underline" onClick={() => toast.info(portal === 'citizen' ? 'Password reset email would be sent (not connected in demo).' : 'Official accounts are invite-only. Contact your Platform Administrator.')}>Forgot password?</button>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
        {portal === 'citizen' && <div className="lg-in text-center text-sm">New here? <Link to="/signup" className="font-semibold text-[var(--nf-lime)] underline">Create account</Link></div>}
        <p className="lg-in text-center text-[11px] text-[var(--muted)]">Demonstration build · seeded demo data only</p>
      </div>
    </div>
  );
}
