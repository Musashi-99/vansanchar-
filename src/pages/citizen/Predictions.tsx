import { useMemo, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, Legend } from 'recharts';
import { BellRing } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { Card, Tabs, Badge, DemoNote, Button, SevBadge, Empty } from '../../components/ui';
import { nearestPlace } from '../../lib/utils';
import type { Severity } from '../../lib/types';

const WINDOW_DAYS = 90;
export default function Predictions() {
  const { reports, predictSub, setPredictSub } = useStore();
  const [tf, setTf] = useState<'1' | '7' | '30'>('7');
  const horizon = +tf;

  const hist = useMemo(() => reports.filter((r) => (r.status === 'verified' || r.status === 'resolved') && Date.now() - +new Date(r.submittedAt) < WINDOW_DAYS * 864e5), [reports]);
  const zones = useMemo(() => {
    const m: Record<string, number> = {};
    hist.forEach((r) => { const p = nearestPlace(r.location.lat, r.location.lng).name; m[p] = (m[p] ?? 0) + 1; });
    return Object.entries(m).map(([name, n]) => {
      const expected = (n / WINDOW_DAYS) * horizon; // expected incidents in horizon
      const risk: Severity = expected >= 1.2 ? 'critical' : expected >= 0.7 ? 'high' : expected >= 0.3 ? 'medium' : 'low';
      return { name, n, expected: +expected.toFixed(2), risk };
    }).sort((a, b) => b.expected - a.expected).slice(0, 5);
  }, [hist, horizon]);

  const hourly = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ h: `${i * 2}:00`, risk: +(hist.filter((r) => Math.floor(new Date(r.occurredAt).getHours() / 2) === i).length / Math.max(hist.length, 1) * horizon * 10).toFixed(2) })), [hist, horizon]);
  const night = hist.filter((r) => { const h = new Date(r.occurredAt).getHours(); return h >= 18 || h < 6; }).length / Math.max(hist.length, 1);
  const recent = hist.filter((r) => Date.now() - +new Date(r.submittedAt) < 14 * 864e5).length / Math.max(hist.length, 1);
  const factors = [
    { f: 'Night activity', v: Math.round(night * 100) }, { f: 'Recent trend', v: Math.round(recent * 100) },
    { f: 'Severity share', v: Math.round(hist.filter((r) => r.severity === 'high' || r.severity === 'critical').length / Math.max(hist.length, 1) * 100) },
    { f: 'Tiger share', v: Math.round(hist.filter((r) => r.animal === 'tiger').length / Math.max(hist.length, 1) * 100) },
    { f: 'Repeat zones', v: Math.round(zones.filter((z) => z.n > 2).length / Math.max(zones.length, 1) * 100) },
  ];
  const weekly = useMemo(() => Array.from({ length: 7 }, (_, d) => {
    const day = (off: number) => hist.filter((r) => { const age = (Date.now() - +new Date(r.submittedAt)) / 864e5; return age >= off + d && age < off + d + 1; }).length;
    return { d: `D-${d}`, thisWeek: day(0), lastWeek: day(7) };
  }).reverse(), [hist]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2"><h1 className="text-xl font-bold">Predictive Heatmap</h1><Badge className="bg-purple-100 text-purple-800">Simulated</Badge></div>
      <Tabs tabs={[{ id: '1', label: '24 hours' }, { id: '7', label: '7 days' }, { id: '30', label: '30 days' }]} value={tf} onChange={setTf} />
      <DemoNote><b>Rule-based baseline, not a trained ML model.</b> Expected incidents = verified sample reports per zone over the last {WINDOW_DAYS} days ÷ {WINDOW_DAYS} × forecast days. No accuracy score is claimed; zones with few samples are uncertain. Model run: baseline-v0, {hist.length} samples.</DemoNote>
      {hist.length < 5 ? <Empty title="Insufficient data" hint="At least 5 verified reports are needed to estimate risk." /> : (
        <>
          <div className="space-y-2">
            {zones.map((z) => (
              <Card key={z.name} className="!p-3"><div className="flex items-center justify-between gap-2"><div className="min-w-0"><div className="font-semibold">{z.name}</div><div className="text-xs text-muted">{z.n} verified in {WINDOW_DAYS} d · ~{z.expected} expected in {horizon === 1 ? '24 h' : `${horizon} d`}</div></div><SevBadge s={z.risk} /></div></Card>
            ))}
          </div>
          <Card><h2 className="mb-2 font-semibold">Relative risk by time of day</h2>
            <div className="h-48"><ResponsiveContainer><BarChart data={hourly}><XAxis dataKey="h" tick={{ fontSize: 10 }} interval={1} /><YAxis width={28} tick={{ fontSize: 11 }} /><Tooltip /><Bar dataKey="risk" fill="#ea580c" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
          <Card><h2 className="mb-2 font-semibold">Contributing factors (% of samples)</h2>
            <div className="h-60"><ResponsiveContainer><RadarChart data={factors} outerRadius="70%"><PolarGrid /><PolarAngleAxis dataKey="f" tick={{ fontSize: 11 }} /><Radar dataKey="v" stroke="#2D5016" fill="#5A9C3A" fillOpacity={0.5} /><Tooltip /></RadarChart></ResponsiveContainer></div></Card>
          <Card><h2 className="mb-2 font-semibold">This week vs last week</h2>
            <div className="h-48"><ResponsiveContainer><BarChart data={weekly}><XAxis dataKey="d" tick={{ fontSize: 11 }} /><YAxis allowDecimals={false} width={28} tick={{ fontSize: 11 }} /><Tooltip /><Legend /><Bar dataKey="thisWeek" name="This week" fill="#2D5016" radius={[4, 4, 0, 0]} /><Bar dataKey="lastWeek" name="Last week" fill="#a3c293" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
        </>
      )}
      <Card className="flex flex-col gap-3 !bg-secondary sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3"><BellRing className="mt-0.5 h-6 w-6 shrink-0 text-primary" /><div><div className="font-semibold">Smart alerts</div><div className="text-sm text-muted">Opt in to advisories for your region. Rate-limited, never a guarantee.</div></div></div>
        <Button variant={predictSub ? 'outline' : 'primary'} onClick={() => { setPredictSub(!predictSub); toast.success(predictSub ? 'Smart alerts off' : 'Smart alerts on'); }}>{predictSub ? 'Turn off' : 'Turn on'}</Button>
      </Card>
    </div>
  );
}
