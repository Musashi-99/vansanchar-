import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { OFFICIALS, SEED_EDU } from '../../lib/seed';
import { Banner } from '../../neon/kit';
import { Settings } from 'lucide-react';
import { Card, Button, Badge, Switch, Input, Select, Field, DemoNote, Empty } from '../../components/ui';
import { LANGS } from '../../lib/i18n';
import { fmtDate, fmtDay, label, PLACE_NAMES, download, toCSV, stamp } from '../../lib/utils';

const ALIAS: Record<string, string> = { roles: 'officials', config: 'settings', 'ai-models': 'integrations', reports: 'audit', data: 'settings', announcements: 'content', 'translations-x': 'translations' };
const TITLES: Record<string, string> = { roles: 'Roles & Permissions', config: 'System Configuration', content: 'Content & Species DB', 'ai-models': 'AI & Model Management', reports: 'Reports & Analytics', integrations: 'Integrations (Drone / GIS)', data: 'Data Management', audit: 'Security & Audit Logs', announcements: 'Announcements', settings: 'Platform Settings' };
const SECTIONS = ['roles', 'config', 'ai-models', 'reports', 'data', 'announcements', 'users', 'officials', 'jurisdictions', 'content', 'translations', 'hospitals', 'emergency-contacts', 'integrations', 'audit', 'settings'];

export default function Admin() {
  const { section: raw } = useParams();
  const section = raw && (ALIAS[raw] ?? raw);
  const s = useStore();
  const [inv, setInv] = useState(''); const [invRole, setInvRole] = useState('range_officer');
  if (!raw || !section || !SECTIONS.includes(raw)) return <Navigate to="/admin/dashboard" replace />;

  const title = TITLES[raw] ?? label(section.replace('-', '_'));
  return (
    <div className="space-y-3">
      <Banner icon={<Settings />} title={title} crumbs={['Admin', title]} sub="Manage platform configuration. Every change is written to the audit log." />
      <DemoNote>Admin workspace demo. Admins cannot read citizen private data without an operational reason; every change here is written to the audit log.</DemoNote>

      {section === 'users' && s.users.map((u) => (
        <Card key={u.uid} className="!p-3 flex items-center justify-between gap-2"><div className="min-w-0"><div className="truncate font-medium">{u.name}</div><div className="truncate text-xs text-muted">{u.role} · {u.region} · phone hidden</div></div>
          <div className="flex shrink-0 items-center gap-2"><Badge className={u.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>{u.status}</Badge>
            <Button size="sm" variant="outline" onClick={() => s.setUserStatus(u.uid, u.status === 'active' ? 'suspended' : 'active')}>{u.status === 'active' ? 'Suspend' : 'Activate'}</Button></div></Card>
      ))}

      {section === 'officials' && <>
        {OFFICIALS.map((o) => <Card key={o.uid} className="!p-3"><div className="font-medium">{o.name} <Badge>{o.designation}</Badge></div><div className="text-xs text-muted">{o.officialId} · {o.jurisdiction} · active</div></Card>)}
        <Card className="space-y-3"><h2 className="font-semibold">Invite an official</h2><Field label="Official email"><Input type="email" value={inv} onChange={(e) => setInv(e.target.value)} /></Field>
          <Field label="Role"><Select value={invRole} onChange={(e) => setInvRole(e.target.value)}>{['forest_guard', 'range_officer', 'deputy_ranger', 'dfo', 'content_editor'].map((r) => <option key={r} value={r}>{label(r)}</option>)}</Select></Field>
          <Button full variant="amber" disabled={!/^\S+@\S+\.\S+$/.test(inv)} onClick={() => { s.addAudit('official.invite', inv, invRole); toast.success('Invitation recorded (no email sent in demo)'); setInv(''); }}>Send invite</Button></Card></>}

      {section === 'jurisdictions' && ['Gosaba Range', 'Canning Range', 'Namkhana Range', 'South 24 Parganas Division'].map((j) => <Card key={j} className="!p-3"><div className="font-medium">{j}</div><div className="text-xs text-muted">{j.includes('Division') ? 'Division' : 'Range'} · boundaries managed as geometry in production · active</div></Card>)}

      {section === 'content' && SEED_EDU.map((e) => <Card key={e.id} className="!p-3 flex items-center justify-between gap-2"><div className="min-w-0"><div className="truncate font-medium">{e.title}</div><div className="text-xs text-muted">v{e.version} · reviewer: {e.reviewer} · reviewed {fmtDay(e.reviewed)}</div></div><Badge className="bg-green-100 text-green-800">published</Badge></Card>)}
      {section === 'content' && <p className="text-xs text-muted">Workflow: draft → review → approved → published → archived. Medical and wildlife content needs named reviewers.</p>}

      {section === 'translations' && <Card className="space-y-2">{LANGS.map((l) => <div key={l.code} className="flex items-center justify-between gap-2 text-sm"><span className="min-w-0">{l.native} <span className="text-muted">({l.name})</span></span><Badge className={['en', 'bn', 'hi'].includes(l.code) ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}>{['en', 'bn', 'hi'].includes(l.code) ? 'core strings' : 'navigation only'}</Badge></div>)}<p className="text-xs text-muted">Machine-translated medical content is not treated as reviewed clinical guidance.</p></Card>}

      {section === 'hospitals' && s.hospitals.map((h) => <Card key={h.id} className="!p-3 space-y-2"><div className="font-medium">{h.name}</div><div className="text-xs text-muted">{h.phone} · confirmed {fmtDate(h.confirmedAt)}</div>
        <Select value={h.antiVenom} onChange={(e) => { s.updateHospital(h.id, { antiVenom: e.target.value as never }); s.addAudit('hospital.update', h.name, e.target.value); }} aria-label="Anti-venom"><option value="available">Anti-venom available</option><option value="unavailable">Unavailable</option><option value="unknown">Unknown</option></Select></Card>)}

      {section === 'emergency-contacts' && s.contacts.map((c) => <Card key={c.id} className="!p-3 flex items-center justify-between gap-2"><div className="min-w-0"><div className="truncate font-medium">{c.name}</div><div className="text-xs text-muted">{c.area} · verified {fmtDay(c.verifiedAt)}</div></div>
        <Button size="sm" variant="outline" onClick={() => { s.updateContact(c.id, {}); toast.success('Marked as verified today'); }}>Re-verify</Button></Card>)}

      {section === 'integrations' && <Card className="space-y-4">
        {[['aiLive', 'Gemini (server-side AI)', 'Not configured: assistant and vision use local demo logic'], ['voiceAlerts', 'Vapi voice alerts', 'Not configured: voice alerts not configured'], ['stellar', 'Stellar Testnet attestations', 'Simulated locally (SHA-256 is real, transaction is simulated)'], ['push', 'Web push (FCM)', 'Not configured'], ['drones', 'Drone integration', 'Simulator mode'], ['translate', 'Translation provider', 'Not configured']].map(([k, n, d]) => (
          <div key={k}><Switch label={n} hint={d} checked={!!s.flags[k]} onChange={(v) => { s.setFlag(k, v); toast.success(`${n} ${v ? 'enabled' : 'disabled'} (flag only)`); }} /></div>))}
        <p className="text-xs text-muted">Secrets never live in client-readable settings. No provider is connected in this front-end-only build.</p></Card>}

      {section === 'audit' && <>
        <Button size="sm" variant="outline" onClick={() => download(`audit-${stamp()}.csv`, toCSV(s.audit.map((a) => ({ time: a.at, actor: a.actor, action: a.action, target: a.target, detail: a.detail ?? '' }))))}>Export CSV</Button>
        {s.audit.length === 0 ? <Empty title="No events" /> : s.audit.slice(0, 60).map((a) => <Card key={a.id} className="!p-3 text-sm"><b>{a.action}</b> · {a.target}{a.detail ? ` (${a.detail})` : ''}<div className="text-xs text-muted">{a.actor} · {fmtDate(a.at)}</div></Card>)}</>}

      {section === 'settings' && <Card className="space-y-4">
        <Field label="Default alert radius (km)"><Select defaultValue="15"><option>5</option><option>15</option><option>30</option></Select></Field>
        <Field label="SOS acknowledgement SLA (min)"><Select defaultValue="10"><option>5</option><option>10</option><option>15</option></Select></Field>
        <Field label="Home region default"><Select defaultValue="Gosaba">{PLACE_NAMES.map((p) => <option key={p}>{p}</option>)}</Select></Field>
        <Button full variant="amber" onClick={() => { s.addAudit('settings.update', 'app_settings'); toast.success('Settings saved (demo)'); }}>Save</Button>
        <Button full variant="outline" onClick={() => { if (confirm('Reset all demo data in this browser?')) { s.resetDemo(); toast.success('Demo data reset'); } }}>Reset demo data</Button></Card>}
    </div>
  );
}
