import { useMemo } from 'react';
import { Trophy, Medal, Lock, Award, Coins } from 'lucide-react';
import { useStore, tokenBalance, levelFor, LEVELS } from '../../lib/store';
import { SEED_LEADERS } from '../../lib/seed';
import { Card, Progress, Badge, SectionTitle, Tabs, DemoNote } from '../../components/ui';
import { fmtDay, cn } from '../../lib/utils';
import { useState } from 'react';

export default function Achievements() {
  const { ledger, user, reports, certs } = useStore();
  const tokens = tokenBalance(ledger);
  const lvl = levelFor(tokens);
  const idx = LEVELS.findIndex((l) => l.name === lvl.name);
  const nextL = LEVELS[idx + 1];
  const verified = reports.filter((r) => r.reporterId === user?.uid && (r.status === 'verified' || r.status === 'resolved')).length;
  const [scope, setScope] = useState<'South 24 Parganas' | 'all'>('South 24 Parganas');
  const board = useMemo(() => {
    const me = { name: `${user?.name.split(' ')[0]} ${user?.name.split(' ')[1]?.[0] ?? ''}. (you)`, district: 'South 24 Parganas', contributions: verified, tokens };
    return [...SEED_LEADERS, me].filter((x) => scope === 'all' || x.district === scope).sort((a, b) => b.tokens - a.tokens || a.name.localeCompare(b.name));
  }, [tokens, verified, scope, user]);
  const myRank = board.findIndex((b) => b.name.endsWith('(you)')) + 1;
  const badges = [
    { n: 'First report', ok: reports.some((r) => r.reporterId === user?.uid) }, { n: 'Verified contributor', ok: verified >= 1 }, { n: 'Silver member', ok: tokens >= 50 },
    { n: 'Gold member', ok: tokens >= 250 }, { n: 'Quiz master', ok: ledger.some((l) => l.sourceType === 'quiz') }, { n: 'Elite Gold', ok: tokens >= 550 },
  ];
  const myCerts = certs.filter((c) => c.recipient.startsWith(user?.name.split(' ')[0] ?? '#'));
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Achievements</h1>
      <Card className="!bg-gradient-to-br from-amber-100 to-yellow-50 dark:!from-amber-950/50 dark:!to-yellow-950/30">
        <div className="flex items-center justify-between gap-3"><div><div className="text-sm text-muted">Current level</div><div className="text-2xl font-extrabold">{lvl.name}</div></div><div className="flex items-center gap-1 text-3xl font-bold text-amber-700"><Coins className="h-7 w-7" />{tokens}</div></div>
        {nextL && <><Progress className="mt-3" value={((tokens - lvl.min) / (nextL.min - lvl.min)) * 100} /><div className="mt-1 text-xs text-muted">{nextL.min - tokens} tokens to {nextL.name}</div></>}
        <p className="mt-2 text-sm">{lvl.perk}</p>
        <p className="mt-2 text-[11px] text-muted">+10 tokens per officially verified report (once per report). Rewards are subject to program approval; no cash benefit is promised.</p>
      </Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{LEVELS.map((l) => <div key={l.name} className={cn('rounded-xl2 border p-2 text-center text-xs', tokens >= l.min ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/30' : 'border-line')}><Medal className="mx-auto h-5 w-5" /><div className="font-semibold">{l.name}</div><div className="text-muted">{l.min}+</div></div>)}</div>

      <SectionTitle>Badges</SectionTitle>
      <div className="grid grid-cols-3 gap-2">{badges.map((b) => <div key={b.n} className={cn('flex min-w-0 flex-col items-center gap-1 rounded-xl2 border p-3 text-center text-xs', b.ok ? 'border-primary bg-secondary' : 'border-line opacity-60')}>{b.ok ? <Award className="h-6 w-6 text-primary" /> : <Lock className="h-6 w-6" />}<span className="w-full break-words">{b.n}</span></div>)}</div>

      <SectionTitle>Token history</SectionTitle>
      <Card className="divide-y divide-line !p-0">{ledger.slice(0, 8).map((l) => <div key={l.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm"><div className="min-w-0"><div className="truncate">{l.reason}</div><div className="text-xs text-muted">{fmtDay(l.at)}</div></div><b className={l.amount > 0 ? 'text-green-600' : 'text-red-600'}>{l.amount > 0 ? '+' : ''}{l.amount}</b></div>)}</Card>

      <SectionTitle>Leaderboard</SectionTitle>
      <Tabs tabs={[{ id: 'South 24 Parganas', label: 'District' }, { id: 'all', label: 'All districts' }]} value={scope} onChange={setScope} />
      <DemoNote>Sample leaderboard. Only opt-in display names are shown; phone numbers are never exposed.</DemoNote>
      <Card className="divide-y divide-line !p-0">
        {board.map((b, i) => (
          <div key={b.name} className={cn('flex items-center gap-3 px-3 py-2.5', b.name.endsWith('(you)') && 'bg-secondary')}>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold">{i < 3 ? <Trophy className="h-4 w-4 text-amber-600" /> : i + 1}</span>
            <div className="min-w-0 flex-1"><div className="truncate font-medium">{b.name}</div><div className="text-xs text-muted">{b.contributions} verified</div></div><b>{b.tokens}</b>
          </div>
        ))}
      </Card>
      <p className="text-sm">Your rank: <b>#{myRank}</b></p>

      <SectionTitle>Certificates</SectionTitle>
      {myCerts.length === 0 ? <Card className="text-sm text-muted">No certificate yet. Silver level and above becomes eligible; an official issues certificates.</Card> : myCerts.map((c) => <Badge key={c.id}>{c.number}</Badge>)}
    </div>
  );
}
