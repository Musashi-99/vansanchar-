import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Clock, Search, ShieldCheck, CheckCircle2, Siren, AlertTriangle, BellRing, ListChecks } from 'lucide-react';
import { useScoped } from '../../lib/scope';
import { useStore } from '../../lib/store';
import { Card, Stat, SectionTitle, Badge, SevBadge, DemoNote } from '../../components/ui';
import { ago, label, ANIMALS } from '../../lib/utils';

const COL: Record<string, string> = { pending: '#d97706', under_review: '#2563eb', verified: '#16a34a', rejected: '#dc2626', resolved: '#64748b' };

export default function Overview() {
  const { reports, sos, user } = useScoped();
  const notifs = useStore((s) => s.notifs.filter((n) => n.recipient === 'official' && !n.dismissed));
  const markRead = useStore((s) => s.markRead);
  const c = (s: string) => reports.filter((r) => r.status === s).length;
  const activeSOS = sos.filter((x) => !x.cancelled && x.responseStatus !== 'resolved');
  const unack = activeSOS.filter((x) => x.responseStatus === 'received');
  const breach = unack.filter((x) => (Date.now() - +new Date(x.createdAt)) / 60000 > x.slaMinutes);
  const critical = reports.filter((r) => r.severity === 'critical' && r.status !== 'resolved' && r.status !== 'rejected').length;
  const dist = ['pending', 'under_review', 'verified', 'rejected', 'resolved'].map((s) => ({ name: label(s), key: s, value: c(s) })).filter((d) => d.value);
  const recent = reports.flatMap((r) => r.events.map((e) => ({ ...e, id: r.id }))).sort((a, b) => +new Date(b.at) - +new Date(a.at)).slice(0, 8);

  return (
    <div className="space-y-4">
      <div><h1 className="text-xl font-bold">Overview</h1><p className="text-xs text-muted">Scope: {user?.jurisdiction} ({reports.length} reports in your jurisdiction)</p></div>
      <DemoNote>Sample operational data. Statistics respect the signed-in officer&apos;s jurisdiction.</DemoNote>
      {breach.length > 0 && <Link to="/official/sos" className="flex items-center gap-2 rounded-xl2 bg-red-600 p-3 text-sm font-medium text-white"><AlertTriangle className="h-5 w-5 shrink-0" />{breach.length} SOS past acknowledgement SLA. Act now.</Link>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={<FileText className="h-4 w-4" />} label="Total reports" value={reports.length} />
        <Stat icon={<Clock className="h-4 w-4" />} label="Pending" value={c('pending')} tone="text-amber-600" />
        <Stat icon={<Search className="h-4 w-4" />} label="Under review" value={c('under_review')} tone="text-blue-600" />
        <Stat icon={<ShieldCheck className="h-4 w-4" />} label="Verified" value={c('verified')} tone="text-green-600" />
        <Stat icon={<CheckCircle2 className="h-4 w-4" />} label="Resolved" value={c('resolved')} tone="text-slate-600" />
        <Stat icon={<Siren className="h-4 w-4" />} label="Active SOS" value={activeSOS.length} tone="text-red-600" />
        <Stat icon={<AlertTriangle className="h-4 w-4" />} label="Critical cases" value={critical} tone="text-red-600" />
        <Stat icon={<BellRing className="h-4 w-4" />} label="Unacknowledged SOS" value={unack.length} tone="text-red-600" sub={`${breach.length} past SLA`} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-2 font-semibold">Case status distribution</h2>
          <div className="h-52"><ResponsiveContainer><PieChart><Pie data={dist} dataKey="value" nameKey="name" innerRadius={40} outerRadius={75}>{dist.map((d) => <Cell key={d.key} fill={COL[d.key]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">{dist.map((d) => <span key={d.key} className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full" style={{ background: COL[d.key] }} />{d.name} {d.value}</span>)}</div></Card>
        <Card><h2 className="mb-2 font-semibold">Alerts</h2>
          <div className="space-y-2">{notifs.slice(0, 5).map((n) => <Link key={n.id} to={n.link ?? '#'} onClick={() => markRead(n.id)} className="flex items-start gap-2 rounded-xl2 border border-line p-2 text-sm"><span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read ? 'bg-slate-300' : 'bg-red-600'}`} /><span className="min-w-0"><b className="block truncate">{n.title}</b><span className="block truncate text-xs text-muted">{n.body} · {ago(n.createdAt)}</span></span></Link>)}</div></Card>
      </div>
      <SectionTitle>Assigned &amp; urgent cases</SectionTitle>
      <div className="space-y-2">
        {reports.filter((r) => (r.status === 'pending' || r.status === 'under_review') && (r.severity === 'critical' || r.severity === 'high')).slice(0, 5).map((r) => (
          <Link key={r.id} to={`/official/reports/${r.id}`}><Card className="!p-3"><div className="flex flex-wrap items-center gap-1.5"><b>{r.id}</b><span>{ANIMALS[r.animal]}</span><SevBadge s={r.severity} /><Badge>{label(r.status)}</Badge></div><div className="text-xs text-muted">{r.location.label} · {ago(r.submittedAt)}</div></Card></Link>
        ))}
      </div>
      <SectionTitle>Recent activity</SectionTitle>
      <Card className="!p-3"><ul className="space-y-2">{recent.map((e, i) => <li key={i} className="flex items-start gap-2 text-sm"><ListChecks className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" /><span className="min-w-0"><b>{e.id}</b> {label(e.to)} <span className="text-muted">· {e.actor} · {ago(e.at)}</span></span></li>)}</ul></Card>
    </div>
  );
}
