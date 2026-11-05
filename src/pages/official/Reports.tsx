import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Download, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScoped } from '../../lib/scope';
import { useStore } from '../../lib/store';
import { Card, Input, Select, Button, StatusBadge, SevBadge, Empty } from '../../components/ui';
import { ANIMALS, SEVERITIES, ago, label, toCSV, download, stamp, fmtDate } from '../../lib/utils';
import type { Animal, ReportStatus, Severity } from '../../lib/types';

const PAGE = 10;
export default function OReports() {
  const { reports, user } = useScoped();
  const addAudit = useStore((s) => s.addAudit);
  const [q, setQ] = useState(''); const [st, setSt] = useState<'all' | ReportStatus>('all'); const [sev, setSev] = useState<'all' | Severity>('all'); const [sp, setSp] = useState<'all' | Animal>('all');
  const [from, setFrom] = useState(''); const [sort, setSort] = useState<'new' | 'sev'>('new'); const [page, setPage] = useState(0);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase(); const rank = { critical: 0, high: 1, medium: 2, low: 3 };
    // prefix / token search over indexed fields (reporter, location, species, id) - Firestore has no native full-text search
    return reports.filter((r) => (st === 'all' || r.status === st) && (sev === 'all' || r.severity === sev) && (sp === 'all' || r.animal === sp)
      && (!from || new Date(r.submittedAt) >= new Date(from)) && (!t || [r.reporterName, r.location.label, ANIMALS[r.animal], r.id].some((f) => f.toLowerCase().split(/\s+/).some((w) => w.startsWith(t)) || f.toLowerCase().includes(t))))
      .sort((a, b) => sort === 'new' ? +new Date(b.submittedAt) - +new Date(a.submittedAt) : rank[a.severity] - rank[b.severity]);
  }, [reports, q, st, sev, sp, from, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PAGE)); const cur = Math.min(page, pages - 1);

  const exportCSV = () => {
    const priv = user?.role !== 'forest_guard' || true;
    download(`reports-${stamp()}.csv`, toCSV(list.map((r) => ({ id: r.id, status: r.status, severity: r.severity, species: ANIMALS[r.animal], area: r.location.label, jurisdiction: r.jurisdiction, submitted: r.submittedAt, reporter: priv ? r.reporterName : '', description: r.description }))));
    addAudit('export.reports', `${list.length} rows`);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h1 className="text-xl font-bold">Reports</h1><Button size="sm" variant="amber" onClick={exportCSV} disabled={!list.length}><Download className="h-4 w-4" />CSV</Button></div>
      <div className="relative"><Search className="absolute left-3 top-3 h-5 w-5 text-muted" /><Input className="pl-10" placeholder="Search reporter, place, species or ID" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} /></div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <Select value={st} onChange={(e) => { setSt(e.target.value as never); setPage(0); }} aria-label="Status"><option value="all">All status</option>{['pending', 'under_review', 'verified', 'rejected', 'resolved'].map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select>
        <Select value={sev} onChange={(e) => { setSev(e.target.value as never); setPage(0); }} aria-label="Severity"><option value="all">All severity</option>{SEVERITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select>
        <Select value={sp} onChange={(e) => { setSp(e.target.value as never); setPage(0); }} aria-label="Species"><option value="all">All species</option>{(Object.keys(ANIMALS) as Animal[]).map((a) => <option key={a} value={a}>{ANIMALS[a]}</option>)}</Select>
        <Input type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(0); }} aria-label="From date" />
        <Select value={sort} onChange={(e) => setSort(e.target.value as never)} aria-label="Sort"><option value="new">Newest first</option><option value="sev">Severity first</option></Select>
      </div>
      <div className="text-xs text-muted">{list.length} result(s) · jurisdiction: {user?.jurisdiction}</div>
      {list.length === 0 ? <Empty title="No reports match" /> : (
        <div className="space-y-2">
          {list.slice(cur * PAGE, cur * PAGE + PAGE).map((r) => (
            <Link key={r.id} to={`/official/reports/${r.id}`}>
              <Card className="!p-3">
                <div className="flex flex-wrap items-center gap-1.5"><b>{r.id}</b><span className="font-medium">{ANIMALS[r.animal]}</span><SevBadge s={r.severity} /><StatusBadge s={r.status} /></div>
                <div className="mt-1 truncate text-sm text-muted">{r.description}</div>
                <div className="mt-1 text-xs text-muted">{r.reporterName} · {r.location.label} · {ago(r.submittedAt)} ({fmtDate(r.submittedAt)})</div>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between"><Button size="sm" variant="outline" disabled={cur === 0} onClick={() => setPage(cur - 1)}><ChevronLeft className="h-4 w-4" />Prev</Button><span className="text-sm">Page {cur + 1} / {pages}</span><Button size="sm" variant="outline" disabled={cur >= pages - 1} onClick={() => setPage(cur + 1)}>Next<ChevronRight className="h-4 w-4" /></Button></div>
    </div>
  );
}
