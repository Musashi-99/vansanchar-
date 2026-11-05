import { useNavigate } from 'react-router-dom';
import { Trophy, Award } from 'lucide-react';
import { SEED_LEADERS } from '../../lib/seed';
import { useStore, levelFor } from '../../lib/store';
import { Card, Button, DemoNote, Badge } from '../../components/ui';

export default function Leaderboard() {
  const nav = useNavigate();
  const certs = useStore((s) => s.certs);
  const rows = [...SEED_LEADERS].sort((a, b) => b.tokens - a.tokens || a.name.localeCompare(b.name));
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Trophy className="h-6 w-6 text-amber-600" /><h1 className="text-xl font-bold">Leaderboard</h1></div>
      <DemoNote>Verified contributions only. Display names are opt-in; no phone numbers. Ties are broken alphabetically.</DemoNote>
      <div className="space-y-2">
        {rows.map((r, i) => {
          const has = certs.some((c) => c.recipient === r.name && !c.revoked); const eligible = r.tokens >= 50;
          return (
            <Card key={r.name} className="!p-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 font-bold text-amber-800">{i + 1}</span>
                <div className="min-w-0 flex-1"><div className="truncate font-semibold">{r.name}</div><div className="truncate text-xs text-muted">{r.district} · {r.contributions} verified · {r.tokens} tokens · {levelFor(r.tokens).name}</div></div>
                {has ? <Badge className="bg-green-100 text-green-800">Certified</Badge> : <Button size="sm" variant="amber" disabled={!eligible} onClick={() => nav('/official/certificates', { state: { name: r.name, summary: `${r.contributions} verified wildlife reports` } })}><Award className="h-4 w-4" />Award</Button>}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
