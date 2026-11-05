import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { LogOut, Trash2, Download, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useStore, tokenBalance, levelFor } from '../../lib/store';
import { Button, Card, Field, Input, Select, Switch, SectionTitle, DemoNote, Modal, Badge } from '../../components/ui';
import { ThemeLangControls } from '../../components/Layouts';
import { normalizeIndianPhone, PLACE_NAMES } from '../../lib/utils';
import { useInstallPrompt } from '../../lib/hooks';

const BLOOD = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
export default function Profile() {
  const nav = useNavigate();
  const { user, updateUser, logout, ledger, demoOffline, setDemoOffline, resetDemo, pendingCount, syncNow, lastSync } = useStore();
  const { canInstall, install } = useInstallPrompt();
  const [name, setName] = useState(user?.name ?? ''); const [address, setAddress] = useState(user?.address ?? ''); const [blood, setBlood] = useState(user?.blood ?? '');
  const [ecn, setEcn] = useState(user?.emergency?.name ?? ''); const [ecp, setEcp] = useState(user?.emergency?.phone ?? ''); const [region, setRegion] = useState(user?.region ?? 'Gosaba');
  const [err, setErr] = useState(''); const [del, setDel] = useState(false);
  const tokens = tokenBalance(ledger);

  const save = () => {
    if (name.trim().length < 2) return setErr('Name is required.');
    let emergency = undefined;
    if (ecp) { const n = normalizeIndianPhone(ecp); if (!n) return setErr('Emergency contact number is invalid.'); emergency = { name: ecn || 'Emergency contact', phone: n }; }
    setErr(''); updateUser({ name: name.trim(), address: address || undefined, blood: blood || undefined, emergency, region }); toast.success('Profile saved');
  };
  const exportData = () => {
    const blob = new Blob([JSON.stringify({ profile: user, reports: useStore.getState().reports.filter((r) => r.reporterId === user?.uid) }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-vansanchar-data.json'; a.click();
  };
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Profile</h1>
      <Card className="space-y-3">
        <div className="flex items-center gap-3"><div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-fg">{user?.name[0]}</div>
          <div className="min-w-0"><div className="truncate font-semibold">{user?.name}</div><div className="truncate text-sm text-muted">{user?.phone}</div><Badge className="mt-1">{levelFor(tokens).name} · {tokens} tokens</Badge></div></div>
        <Field label="Name" error={err}><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Address"><Input value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Blood group"><Select value={blood} onChange={(e) => setBlood(e.target.value)}>{BLOOD.map((b) => <option key={b} value={b}>{b || '-'}</option>)}</Select></Field>
          <Field label="Home region"><Select value={region} onChange={(e) => setRegion(e.target.value)}>{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        </div>
        <Field label="Emergency contact name"><Input value={ecn} onChange={(e) => setEcn(e.target.value)} /></Field>
        <Field label="Emergency contact phone"><Input inputMode="tel" value={ecp} onChange={(e) => setEcp(e.target.value)} /></Field>
        <Button full onClick={save}>Save profile</Button>
      </Card>

      <SectionTitle>Preferences</SectionTitle>
      <Card className="space-y-4">
        <ThemeLangControls />
        <Switch label="Share location for nearby alerts" checked={user?.consent?.location ?? false} onChange={(v) => updateUser({ consent: { ...(user?.consent ?? { location: false, voice: false, push: false }), location: v } })} />
        <Switch label="Voice-call alerts (explicit consent)" hint="Not configured in this demo." checked={user?.consent?.voice ?? false} onChange={(v) => updateUser({ consent: { ...(user?.consent ?? { location: false, voice: false, push: false }), voice: v } })} />
        {canInstall && <Button full variant="outline" onClick={install}><Download className="h-4 w-4" />Install VanSanchar app</Button>}
      </Card>

      <SectionTitle>Offline &amp; demo tools</SectionTitle>
      <Card className="space-y-3">
        <DemoNote>Use Simulate offline to test saving reports/SOS on-device and syncing when reconnected.</DemoNote>
        <Switch label="Simulate offline mode" checked={demoOffline} onChange={setDemoOffline} hint={demoOffline ? 'Offline: new reports are queued in IndexedDB.' : 'Online'} />
        <div className="flex flex-wrap items-center gap-2 text-sm">{demoOffline ? <WifiOff className="h-4 w-4 text-amber-600" /> : <Wifi className="h-4 w-4 text-green-600" />}{pendingCount} pending · last sync {lastSync ? new Date(lastSync).toLocaleTimeString() : 'never'}
          <Button size="sm" variant="outline" onClick={async () => toast.success(`${await syncNow()} synced`)}>Sync now</Button></div>
        <Button full variant="outline" onClick={() => { if (confirm('Reset all demo data in this browser?')) { resetDemo(); toast.success('Demo data reset'); } }}><RotateCcw className="h-4 w-4" />Reset demo data</Button>
      </Card>

      <SectionTitle>Account</SectionTitle>
      <div className="space-y-2">
        <Button full variant="outline" onClick={exportData}><Download className="h-4 w-4" />Download my data</Button>
        <Button full variant="outline" onClick={() => { logout(); nav('/'); }}><LogOut className="h-4 w-4" />Log out</Button>
        <Button full variant="ghost" className="text-danger" onClick={() => setDel(true)}><Trash2 className="h-4 w-4" />Request account deletion</Button>
      </div>
      <Modal open={del} onClose={() => setDel(false)} title="Request deletion">
        <p className="text-sm">Personal data will be removed after review. Verified emergency records may be retained, de-identified, where policy requires.</p>
        <div className="mt-4 grid grid-cols-2 gap-2"><Button variant="outline" onClick={() => setDel(false)}>Cancel</Button><Button variant="danger" onClick={() => { setDel(false); toast.success('Deletion request recorded (demo)'); }}>Submit request</Button></div>
      </Modal>
    </div>
  );
}
