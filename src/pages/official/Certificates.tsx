import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Printer, Ban, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, VERIFIER_ROLES } from '../../lib/store';
import { Card, Button, Field, Input, Modal, Badge, DemoNote, Textarea } from '../../components/ui';
import { fmtDay } from '../../lib/utils';
import { Logo } from '../../components/Layouts';
import type { Cert } from '../../lib/types';

function CertView({ c }: { c: Cert }) {
  return (
    <div className="print-area rounded-xl border-4 border-double border-amber-700 bg-white p-6 text-center text-slate-900">
      <div className="flex justify-center"><Logo size={44} /></div>
      <div className="mt-3 text-xs uppercase tracking-widest text-slate-500">Certificate of Appreciation</div>
      <div className="mt-4 text-sm">Presented to</div><div className="mt-1 break-words text-3xl font-extrabold text-primary">{c.recipient}</div>
      <p className="mx-auto mt-3 max-w-sm text-sm">for outstanding community contribution to wildlife safety: {c.summary}.</p>
      <div className="mt-5 grid grid-cols-2 gap-2 text-xs"><div><div className="font-semibold">Issued</div>{fmtDay(c.issuedAt)}</div><div><div className="font-semibold">Issued by</div><span className="break-words">{c.issuedBy}</span></div></div>
      <div className="mt-4 text-xs"><b>{c.number}</b> · Code {c.code}</div>
      <div className="mt-1 break-all text-[10px] text-slate-500">Verify: {location.origin}/verify/{c.code}</div>
      <div className="mt-3 text-[10px] text-slate-500">VanSanchar demonstration certificate. No official seal or signature.</div>
      {c.revoked && <div className="mt-2 font-bold text-red-600">REVOKED: {c.revoked}</div>}
    </div>
  );
}

export default function Certificates() {
  const loc = useLocation(); const pre = loc.state as { name?: string; summary?: string } | null;
  const { certs, issueCert, revokeCert, user } = useStore();
  const [name, setName] = useState(pre?.name ?? ''); const [summary, setSummary] = useState(pre?.summary ?? ''); const [cat, setCat] = useState('Community Contribution');
  const [view, setView] = useState<Cert | null>(null); const [rev, setRev] = useState<Cert | null>(null); const [why, setWhy] = useState('');
  const can = !!user && VERIFIER_ROLES.includes(user.role);
  useEffect(() => { if (pre?.name) window.scrollTo(0, 0); }, [pre]);
  return (
    <div className="space-y-3">
      <h1 className="text-xl font-bold">Certificates</h1>
      <DemoNote>Certificates are generated in the browser and printed or saved as PDF using Print. A real deployment would generate and store the PDF server-side.</DemoNote>
      <Card className="space-y-3"><h2 className="font-semibold">Issue certificate</h2>
        {!can && <p className="text-xs text-danger">Only Range Officers and above can issue certificates.</p>}
        <Field label="Recipient (display name)"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Category"><Input value={cat} onChange={(e) => setCat(e.target.value)} /></Field>
        <Field label="Contribution summary"><Input value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="e.g. 14 verified reports" /></Field>
        <Button full variant="amber" disabled={!can || !name.trim() || !summary.trim()} onClick={() => { const c = issueCert(name.trim(), cat, summary.trim()); setView(c); setName(''); setSummary(''); toast.success(`Issued ${c.number}`); }}>Preview &amp; issue</Button></Card>
      <h2 className="font-semibold">Issued ({certs.length})</h2>
      {certs.map((c) => (
        <Card key={c.id} className="!p-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><div className="font-medium">{c.recipient}</div><div className="truncate text-xs text-muted">{c.number} · {fmtDay(c.issuedAt)}</div>{c.revoked && <Badge className="bg-red-100 text-red-800">Revoked</Badge>}</div>
          <div className="flex shrink-0 gap-1"><Button size="sm" variant="soft" onClick={() => setView(c)}>View</Button>{!c.revoked && can && <Button size="sm" variant="ghost" onClick={() => setRev(c)} aria-label="Revoke"><Ban className="h-4 w-4" /></Button>}</div></div></Card>
      ))}
      <Modal open={!!view} onClose={() => setView(null)} title="Certificate" wide>{view && <><CertView c={view} /><div className="mt-3 grid grid-cols-2 gap-2"><Button variant="amber" onClick={() => window.print()}><Printer className="h-4 w-4" />Print / PDF</Button><Button variant="outline" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/verify/${view.code}`); toast.success('Verification link copied'); }}><LinkIcon className="h-4 w-4" />Copy link</Button></div></>}</Modal>
      <Modal open={!!rev} onClose={() => setRev(null)} title="Revoke certificate"><Textarea placeholder="Reason (required, recorded in audit log)" value={why} onChange={(e) => setWhy(e.target.value)} /><Button full variant="danger" className="mt-3" disabled={why.trim().length < 3} onClick={() => { revokeCert(rev!.id, why); setRev(null); setWhy(''); toast.success('Revoked'); }}>Revoke</Button></Modal>
    </div>
  );
}
