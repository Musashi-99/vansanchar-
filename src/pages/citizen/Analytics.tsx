import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import { ScanSearch, TrendingUp, Bot } from 'lucide-react';
import { useStore, tokenBalance } from '../../lib/store';
import { Card, Stat, Tabs, DemoNote, SectionTitle } from '../../components/ui';
import { ANIMALS, SEV_HEX } from '../../lib/utils';

const COLORS = ['#2D5016', '#5A9C3A', '#d97706', '#2563eb', '#9333ea', '#dc2626', '#0d9488', '#64748b', '#a16207'];
export function monthly(reports: { submittedAt: string }[]) {
  const out: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) { const d = new Date(); d.setMonth(d.getMonth() - i); out[d.toLocaleString('en-IN', { month: 'short' })] = 0; }
  reports.forEach((r) => { const k = new Date(r.submittedAt).toLocaleString('en-IN', { month: 'short' }); if (k in out) out[k]++; });
  return Object.entries(out).map(([m, count]) => ({ m, count }));
}

export default function Analytics() {
  const { reports, user, ledger } = useStore();
  const [tab, setTab] = useState<'public' | 'mine'>('public');
  const src = tab === 'public' ? reports.filter((r) => r.status !== 'rejected') : reports.filter((r) => r.reporterId === user?.uid);
  const bySpecies = useMemo(() => Object.entries(src.reduce<Record<string, number>>((a, r) => ((a[ANIMALS[r.animal]] = (a[ANIMALS[r.animal]] ?? 0) + 1), a), {})).map(([name, value]) => ({ name, value })), [src]);
  const bySev = useMemo(() => (['low', 'medium', 'high', 'critical'] as const).map((s) => ({ s, count: src.filter((r) => r.severity === s).length })), [src]);
  const hours = useMemo(() => Array.from({ length: 8 }, (_, i) => ({ h: `${i * 3}h`, count: src.filter((r) => Math.floor(new Date(r.occurredAt).getHours() / 3) === i).length })), [src]);
  const trend = useMemo(() => monthly(src), [src]);
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">AI Analytics</h1>
      <Tabs tabs={[{ id: 'public', label: 'Public trends' }, { id: 'mine', label: 'My contributions' }]} value={tab} onChange={setTab} />
      <DemoNote>Charts are computed from seeded sample reports. Local-time (Asia/Kolkata) hours use each report&apos;s timestamp. With zero data charts stay empty.</DemoNote>
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Reports" value={src.length} /><Stat label="Verified" value={src.filter((r) => r.status === 'verified' || r.status === 'resolved').length} tone="text-green-600" />
        <Stat label={tab === 'mine' ? 'Tokens' : 'Resolved'} value={tab === 'mine' ? tokenBalance(ledger) : src.filter((r) => r.status === 'resolved').length} />
      </div>
      {src.length === 0 ? <Card className="text-center text-sm text-muted">No data yet for this view.</Card> : (
        <>
          <Card><h2 className="mb-2 font-semibold">By species</h2>
            <div className="h-56 w-full"><ResponsiveContainer><PieChart><Pie data={bySpecies} dataKey="value" nameKey="name" innerRadius={45} outerRadius={80}>{bySpecies.map((d, i) => <Cell key={d.name} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs">{bySpecies.map((d, i) => <span key={d.name} className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />{d.name} ({d.value})</span>)}</div></Card>
          <Card><h2 className="mb-2 font-semibold">By severity</h2>
            <div className="h-48 w-full"><ResponsiveContainer><BarChart data={bySev}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="s" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} width={28} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="count" radius={[6, 6, 0, 0]}>{bySev.map((d) => <Cell key={d.s} fill={SEV_HEX[d.s]} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
          <Card><h2 className="mb-2 font-semibold">Peak hours (3-hour blocks)</h2>
            <div className="h-48 w-full"><ResponsiveContainer><BarChart data={hours}><XAxis dataKey="h" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} width={28} tick={{ fontSize: 12 }} /><Tooltip /><Bar dataKey="count" fill="#5A9C3A" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
          <Card><h2 className="mb-2 font-semibold">Monthly trend (last 6 months)</h2>
            <div className="h-48 w-full"><ResponsiveContainer><LineChart data={trend}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="m" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} width={28} tick={{ fontSize: 12 }} /><Tooltip /><Line dataKey="count" stroke="#2D5016" strokeWidth={3} dot /></LineChart></ResponsiveContainer></div></Card>
        </>
      )}
      <SectionTitle>AI tools</SectionTitle>
      <div className="grid grid-cols-3 gap-2">
        {[['/app/ai-detection', ScanSearch, 'Species detection'], ['/app/predictions', TrendingUp, 'Predictions'], ['/app/assistant', Bot, 'Assistant']].map(([to, I, l]) => {
          const Icon = I as typeof Bot; return <Link key={to as string} to={to as string} className="flex min-w-0 flex-col items-center gap-1 rounded-xl2 border border-line bg-card p-3 text-center text-xs font-medium"><Icon className="h-6 w-6 text-primary" />{l as string}</Link>;
        })}
      </div>
    </div>
  );
}
