import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Cell } from 'recharts';
import { Download, Printer } from 'lucide-react';
import { useScoped } from '../../lib/scope';
import { useStore } from '../../lib/store';
import { Card, Button, Stat, DemoNote } from '../../components/ui';
import { monthly } from '../citizen/Analytics';
import { ANIMALS, download, toCSV, stamp, SEV_HEX } from '../../lib/utils';

export default function OAnalytics() {
  const { reports } = useScoped();
  const addAudit = useStore((s) => s.addAudit);
  const m = useMemo(() => {
    const ack = reports.filter((r) => r.events.length > 1).map((r) => (+new Date(r.events[1].at) - +new Date(r.events[0].at)) / 60000).filter((x) => x >= 0);
    const resolved = reports.filter((r) => r.status === 'resolved'); const verified = reports.filter((r) => r.status === 'verified' || r.status === 'resolved');
    const res = resolved.map((r) => (+new Date(r.events[r.events.length - 1].at) - +new Date(r.events[0].at)) / 3600000).filter((x) => x >= 0);
    const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
    return { ackAvg: avg(ack), resAvg: avg(res), rate: verified.length ? Math.round((resolved.length / verified.length) * 100) : null, rejected: reports.filter((r) => r.status === 'rejected').length, dup: reports.filter((r) => r.duplicateOf).length };
  }, [reports]);
  const bySp = Object.entries(reports.reduce<Record<string, number>>((a, r) => ((a[ANIMALS[r.animal]] = (a[ANIMALS[r.animal]] ?? 0) + 1), a), {})).map(([name, count]) => ({ name, count }));
  const bySev = (['low', 'medium', 'high', 'critical'] as const).map((s) => ({ s, count: reports.filter((r) => r.severity === s).length }));
  const hours = Array.from({ length: 8 }, (_, i) => ({ h: `${i * 3}h`, count: reports.filter((r) => Math.floor(new Date(r.occurredAt).getHours() / 3) === i).length }));
  const fmt = (v: number | null, u: string) => (v == null ? 'n/a' : `${v < 10 ? v.toFixed(1) : Math.round(v)} ${u}`);
  const exportA = () => { download(`analytics-${stamp()}.csv`, toCSV([{ metric: 'total_reports', value: reports.length }, { metric: 'resolution_rate_pct', value: m.rate ?? '' }, { metric: 'avg_time_to_review_min', value: m.ackAvg?.toFixed(1) ?? '' }, { metric: 'avg_time_to_resolve_h', value: m.resAvg?.toFixed(1) ?? '' }, ...bySp.map((s) => ({ metric: `species_${s.name}`, value: s.count }))])); addAudit('export.analytics', 'csv'); };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h1 className="text-xl font-bold">Analytics</h1><div className="flex gap-2"><Button size="sm" variant="amber" onClick={exportA}><Download className="h-4 w-4" />CSV</Button><Button size="sm" variant="outline" onClick={() => window.print()} aria-label="Print"><Printer className="h-4 w-4" /></Button></div></div>
      <DemoNote>Period: all sample data. Timezone: Asia/Kolkata. Zero-data metrics show n/a. Times use actual event timestamps.</DemoNote>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Avg time to first review" value={fmt(m.ackAvg, 'min')} sub="submitted → first status change" />
        <Stat label="Avg time to resolve" value={fmt(m.resAvg, 'h')} sub="submitted → resolved" />
        <Stat label="Resolution rate" value={m.rate == null ? 'n/a' : `${m.rate}%`} sub="resolved ÷ verified" />
        <Stat label="Rejected / duplicate" value={`${m.rejected} / ${m.dup}`} sub="of all reports" />
      </div>
      <Card><h2 className="mb-2 font-semibold">Species distribution</h2><div className="h-52"><ResponsiveContainer><BarChart data={bySp}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-25} height={50} textAnchor="end" /><YAxis allowDecimals={false} width={28} /><Tooltip /><Bar dataKey="count" fill="#d97706" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card><h2 className="mb-2 font-semibold">Severity</h2><div className="h-44"><ResponsiveContainer><BarChart data={bySev}><XAxis dataKey="s" /><YAxis allowDecimals={false} width={28} /><Tooltip /><Bar dataKey="count" radius={[5, 5, 0, 0]} fill="#d97706">{bySev.map((d) => <Cell key={d.s} fill={SEV_HEX[d.s]} />)}</Bar></BarChart></ResponsiveContainer></div></Card>
      <Card><h2 className="mb-2 font-semibold">Peak hours</h2><div className="h-44"><ResponsiveContainer><BarChart data={hours}><XAxis dataKey="h" /><YAxis allowDecimals={false} width={28} /><Tooltip /><Bar dataKey="count" fill="#ea580c" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      <Card><h2 className="mb-2 font-semibold">Monthly trend</h2><div className="h-44"><ResponsiveContainer><LineChart data={monthly(reports)}><CartesianGrid strokeDasharray="3 3" opacity={0.3} /><XAxis dataKey="m" /><YAxis allowDecimals={false} width={28} /><Tooltip /><Line dataKey="count" stroke="#d97706" strokeWidth={3} /></LineChart></ResponsiveContainer></div></Card>
    </div>
  );
}
