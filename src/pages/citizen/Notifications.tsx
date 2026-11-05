import { Link } from 'react-router-dom';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useStore } from '../../lib/store';
import { Button, Card, Empty, SevBadge, Switch, SectionTitle, Select } from '../../components/ui';
import { ago, cn } from '../../lib/utils';
import { useState } from 'react';

export default function Notifications() {
  const { notifs, markRead, dismissNotif, user, updateUser } = useStore();
  const list = notifs.filter((n) => n.recipient === 'citizen' && !n.dismissed);
  const [push, setPush] = useState(user?.consent?.push ?? false);
  const [quiet, setQuiet] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2"><h1 className="text-xl font-bold">Notifications</h1><Button size="sm" variant="outline" onClick={() => markRead()}><CheckCheck className="h-4 w-4" />Mark all read</Button></div>
      {list.length === 0 ? <Empty title="You are all caught up" /> : list.map((n) => (
        <Card key={n.id} className={cn('!p-3', !n.read && 'border-primary/50')}>
          <div className="flex gap-3">
            <Bell className={cn('mt-0.5 h-5 w-5 shrink-0', n.read ? 'text-muted' : 'text-primary')} />
            <Link to={n.link ?? '#'} onClick={() => markRead(n.id)} className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 font-medium">{n.title}{n.severity && <SevBadge s={n.severity} />}</div>
              <div className="text-sm text-muted">{n.body}</div><div className="text-xs text-muted">{ago(n.createdAt)}</div>
            </Link>
            <button onClick={() => dismissNotif(n.id)} aria-label="Dismiss" className="h-8 w-8 shrink-0 rounded-full hover:bg-secondary"><X className="mx-auto h-4 w-4" /></button>
          </div>
        </Card>
      ))}
      <SectionTitle>Alert preferences</SectionTitle>
      <Card className="space-y-4">
        <Switch label="Push notifications" hint="Browsers cannot reach a powered-off device. Not a guaranteed emergency channel." checked={push} onChange={(v) => { setPush(v); updateUser({ consent: { ...(user?.consent ?? { location: false, voice: false, push: false }), push: v } }); if (v && 'Notification' in window) Notification.requestPermission(); }} />
        <Switch label="Voice call alerts" hint="Voice alerts are not configured in this demo." checked={false} onChange={() => undefined} />
        <Switch label="Quiet hours (10 pm - 6 am)" hint="Critical verified advisories can still be shown in-app." checked={quiet} onChange={setQuiet} />
        <label className="block text-sm font-medium">Alert radius
          <Select className="mt-1" value={user?.alertRadius ?? 15} onChange={(e) => updateUser({ alertRadius: +e.target.value })}><option value={5}>5 km</option><option value={15}>15 km</option><option value={30}>30 km</option></Select></label>
      </Card>
    </div>
  );
}
