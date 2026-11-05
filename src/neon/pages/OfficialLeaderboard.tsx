import { useState } from 'react';
import { Trophy, Users, Star, Award, Camera, MapPin, BadgeCheck, Crown, FileText, CalendarDays, Gift, Medal, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, KpiRow, Kpi, Panel, PTitle, Pills, Select2 } from '../kit';
import { useStore } from '../../lib/store';
import { fmtDay } from '../../lib/utils';
import { openForm } from '../actions';

const rewards = [[Trophy, 'Monthly top volunteer', 'Certificate recorded on the portal'], [Medal, 'Top team', 'Issued by the range officer'], [Star, 'Verified reporter', '10 points per verified report'], [Leaf, 'Training complete', 'Unlocks field tasks']] as const;

export default function OfficialLeaderboard() {
  const [tab, setTab] = useState('vol');
  const users = useStore((s) => s.users);
  const reports = useStore((s) => s.reports);
  const certs = useStore((s) => s.certs);
  const teams = useStore((s) => s.teams);
  const issueCert = useStore((s) => s.issueCert);
  const vols = users.filter((u) => u.role === 'approved_volunteer' || u.role === 'citizen');
  const ranked = vols.map((u) => {
    const mine = reports.filter((r) => r.reporterName === u.name && !r.withdrawn);
    const verified = mine.filter((r) => r.status === 'verified' || r.status === 'resolved').length;
    return { u, reports: mine.length, verified, points: verified * 10 };
  }).sort((a, b) => b.points - a.points || b.reports - a.reports);
  const points = ranked.reduce((a, r) => a + r.points, 0);
  const species = new Set(reports.map((r) => r.animal)).size;

  return (
    <>
      <Banner icon={<Trophy />} title="Leaderboard &" accent="Certificates" crumbs={['Dashboard', 'Leaderboard & Certificates']} sub="Recognizing volunteers and citizens whose reports were verified by forest staff." />
      <KpiRow cols={5}>
        <Kpi icon={<Users />} value={users.filter((u) => u.role === 'approved_volunteer').length} label="Volunteers" />
        <Kpi icon={<Star />} value={points} label="Points from verified reports" />
        <Kpi color="yellow" icon={<Award />} value={certs.filter((c) => !c.revoked).length} label="Certificates" />
        <Kpi icon={<FileText />} value={reports.filter((r) => r.status === 'verified' || r.status === 'resolved').length} label="Verified reports" />
        <Kpi icon={<Camera />} value={species} label="Species recorded" />
      </KpiRow>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'vol', label: 'Contributors' }, { id: 'team', label: 'Teams' }, { id: 'cert', label: 'Certificates' }]} />
        <Select2 icon={<CalendarDays className="h-4 w-4" />} options={['All time', 'Verified only']} />
      </div>
      {tab === 'vol' && (
        <Panel className="p-3"><PTitle icon={<Trophy />}>Ranked by verified reports (10 points each)</PTitle>
          <ul className="space-y-1">{ranked.filter((r) => r.reports > 0).slice(0, 8).map((r, i) => <li key={r.u.uid} className={`grid grid-cols-[36px_1fr_auto] items-center gap-2 rounded-xl px-2 py-2 ${i === 0 ? 'border border-[#d9b81f] bg-[#4a4410]/70' : ''}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#ffd93a] font-bold">{i + 1}</span>
            <span className="min-w-0"><b className="flex items-center gap-1 truncate">{r.u.name}{r.u.verified !== false && <BadgeCheck className="h-4 w-4 text-[#58e05b]" />}</b><span className="flex items-center gap-1 text-xs text-[#cfe3c4]"><MapPin className="h-3 w-3" />{r.u.region} · {r.verified} verified / {r.reports} filed</span></span>
            <span className="flex items-center gap-1 font-bold">{i === 0 && <Crown className="h-4 w-4 text-[#ffd93a]" />}{r.points}</span></li>)}
            {ranked.every((r) => r.reports === 0) && <li className="py-4 text-center text-sm text-[var(--muted)]">No matching reporter names yet.</li>}</ul></Panel>
      )}
      {tab === 'team' && (
        <Panel className="p-3"><PTitle icon={<Users />}>Teams by current assignment</PTitle>
          <ul className="divide-y divide-white/10 text-sm">{teams.map((t) => <li key={t.id} className="flex items-center justify-between gap-2 py-2"><span><b>{t.name}</b><div className="text-xs text-[var(--muted)]">{t.jurisdiction} · {t.members} members</div></span><span className="capitalize">{t.availability.replace('_', ' ')}{t.assignment ? ` · ${t.assignment}` : ''}</span></li>)}</ul></Panel>
      )}
      {tab === 'cert' && (
        <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
          <Panel className="p-3"><PTitle icon={<Award />} right={<button className="nf-btn !py-1 !text-xs" onClick={() => openForm({ title: 'Issue certificate', submit: 'Issue', fields: [{ key: 'who', label: 'Recipient', required: true, type: 'select', options: users.map((u) => [u.name, u.name] as [string, string]) }, { key: 'cat', label: 'Category', required: true, value: 'Community Contribution' }, { key: 'sum', label: 'Summary', type: 'textarea', required: true }], onSubmit: (v) => { const c = issueCert(v.who, v.cat, v.sum); toast.success(`Issued ${c.number}`); } })}>Issue</button>}>Certificates</PTitle>
            <ul className="space-y-2">{certs.map((c) => <li key={c.id} className="flex items-center gap-2 rounded-lg border border-[var(--nf-line)] px-3 py-2"><Award className="h-6 w-6 shrink-0 text-[#ffd93a]" /><span className="min-w-0 flex-1"><b className="block truncate">{c.category}</b><span className="text-xs text-[#cfe3c4]">{c.recipient} · {c.number} · {fmtDay(c.issuedAt)}{c.revoked ? ' · revoked' : ''}</span></span>
              <button className="text-sm font-semibold text-[var(--nf-lime)] underline" onClick={() => toast.success(`${c.number}`, { description: `${c.summary} · code ${c.code}` })}>View</button></li>)}</ul></Panel>
          <Panel className="p-3"><PTitle icon={<Gift />}>How recognition works</PTitle>
            <ul className="space-y-2">{rewards.map(([I, t, d]) => <li key={t} className="flex items-center gap-3 rounded-xl border border-[var(--nf-line)] px-3 py-2"><I className="h-6 w-6 shrink-0 text-[#ffd93a]" /><span><b className="block text-[13.5px]">{t}</b><span className="text-[12px] text-[#d4e4cc]">{d}</span></span></li>)}</ul></Panel>
        </div>
      )}
    </>
  );
}
