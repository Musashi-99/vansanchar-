import { Phone, Download, Settings, ShieldCheck, FileText, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, Panel, PTitle, Tag } from '../kit';
import { useStore } from '../../lib/store';
import { download, toCSV, stamp, fmtDay } from '../../lib/utils';

const META = {
  resources: { icon: <ShieldCheck />, title: 'Resources', sub: 'SOPs, field guides and reference material for forest officials.' },
  contacts: { icon: <Phone />, title: 'Emergency Contacts', sub: 'Verified emergency and response contacts for your jurisdiction.' },
  downloads: { icon: <Download />, title: 'Downloads (CSV)', sub: 'Export operational data. Citizen phone numbers are never included.' },
  settings: { icon: <Settings />, title: 'Settings', sub: 'Portal preferences for your account.' },
} as const;

export default function OfficialMisc({ kind }: { kind: keyof typeof META }) {
  const m = META[kind];
  const s = useStore();
  return (
    <>
      <Banner icon={m.icon} title={m.title} crumbs={['Dashboard', m.title]} sub={m.sub} />
      {kind === 'contacts' && <Panel className="p-3"><ul className="divide-y divide-white/10">{s.contacts.map((c) => <li key={c.id} className="flex items-center justify-between gap-3 py-2.5"><span className="flex min-w-0 items-center gap-3"><Phone className="h-5 w-5 shrink-0 text-[var(--nf-lime)]" /><span className="min-w-0"><b className="block truncate">{c.name}</b><span className="text-xs text-[var(--muted)]">{c.area} · verified {fmtDay(c.verifiedAt)}</span></span></span><a className="nf-btn !py-1 !text-xs" href={`tel:${c.phone}`}>Call {c.phone}</a></li>)}</ul></Panel>}
      {kind === 'downloads' && <Panel className="p-3"><PTitle icon={<FileText />}>Available exports</PTitle><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {[['Incident reports', () => s.reports.map((r) => ({ id: r.id, animal: r.animal, severity: r.severity, status: r.status, place: r.location?.label ?? '', at: r.occurredAt }))], ['SOS requests', () => s.sos.map((x) => ({ id: x.id, type: x.type, verification: x.verificationStatus, response: x.responseStatus }))], ['Audit log', () => s.audit.map((a) => ({ time: a.at, actor: a.actor, action: a.action, target: a.target }))]].map(([n, f]) => (
          <button key={n as string} onClick={() => { download(`${(n as string).toLowerCase().replace(/ /g, '-')}-${stamp()}.csv`, toCSV((f as () => Record<string, unknown>[])() as never)); toast.success('CSV exported'); }} className="nf-btn ghost !justify-start"><Download className="h-4 w-4 text-[var(--nf-lime)]" />{n as string}.csv</button>))}</div></Panel>}
      {kind === 'resources' && <Panel className="p-3"><PTitle icon={<BookOpen />}>Reference library</PTitle><ul className="space-y-2 text-sm">{['Tiger conflict response SOP', 'Crocodile and snake incident checklist', 'Drone flight safety rules', 'Evidence collection and verification guide'].map((t) => <li key={t}><button onClick={() => { s.logActivity('resource.open', t); toast.success(t, { description: 'Opened from the South 24 Parganas reference set.' }); }} className="flex w-full items-center gap-3 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/60 px-3 py-2.5 text-left hover:border-[var(--nf-lime)]"><FileText className="h-5 w-5 text-[var(--nf-lime)]" />{t}</button></li>)}</ul></Panel>}
      {kind === 'settings' && <Panel className="p-3 text-sm"><PTitle icon={<Settings />}>Preferences</PTitle>
        <div className="flex flex-wrap gap-2"><button className="nf-btn ghost" onClick={() => s.setLang(s.lang === 'en' ? 'bn' : 'en')}>Language: {s.lang === 'bn' ? 'বাংলা' : 'English'}</button>
          <button className="nf-btn ghost" onClick={() => { s.resetDemo(); toast.success('Demo data reset on this device'); }}>Reset demo data</button></div></Panel>}
    </>
  );
}
