import { Link } from 'react-router-dom';
import { MapPin, WifiOff, ChevronRight, Plus } from 'lucide-react';
import { useStore } from '../../lib/store';
import { useUI } from '../../lib/hooks';
import { Card, StatusBadge, SevBadge, Empty, Button, Badge } from '../../components/ui';
import { ANIMALS, ago } from '../../lib/utils';

export default function Reports() {
  const { user, reports } = useStore();
  const mine = reports.filter((r) => r.reporterId === user?.uid);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h1 className="text-xl font-bold">My Reports</h1><Button size="sm" onClick={() => useUI.getState().set({ reportOpen: true })}><Plus className="h-4 w-4" />New</Button></div>
      {mine.length === 0 ? <Empty title="No reports yet" hint="Your submitted reports and their verification status will appear here." /> : mine.map((r) => (
        <Link key={r.id} to={`/app/reports/${r.id}`}>
          <Card className="!p-3 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5"><span className="font-semibold">{ANIMALS[r.animal]}</span><SevBadge s={r.severity} /><StatusBadge s={r.status} />
                  {r.syncStatus === 'queued' && <Badge className="bg-amber-100 text-amber-800"><WifiOff className="h-3 w-3" />Not sent</Badge>}</div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{r.location.label}</span></div>
                <div className="text-xs text-muted">{r.id} · {ago(r.submittedAt)}</div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted" />
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
