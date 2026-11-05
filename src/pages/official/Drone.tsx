import { useEffect, useState } from 'react';
import { Battery, Signal, Mountain, Gauge, MapPin, Video, Thermometer, Activity, Plane } from 'lucide-react';
import { SEED_DRONES } from '../../lib/seed';
import { Card, Button, Badge, DemoNote, Progress } from '../../components/ui';
import MapView from '../../components/MapView';
import { cn, label } from '../../lib/utils';
import type { Drone } from '../../lib/types';

type Cmd = { id: number; drone: string; name: string; state: 'requested' | 'acknowledged' | 'confirmed' | 'failed' | 'timed_out' };
const ST: Record<Drone['status'], string> = { patrolling: 'bg-green-100 text-green-800', returning: 'bg-amber-100 text-amber-800', charging: 'bg-blue-100 text-blue-800', offline: 'bg-slate-200 text-slate-700', maintenance: 'bg-red-100 text-red-800' };

export default function DronePage() {
  const [drones, setDrones] = useState<Drone[]>(SEED_DRONES);
  const [sel, setSel] = useState('dr1');
  const [cmds, setCmds] = useState<Cmd[]>([]);
  // simulated telemetry
  useEffect(() => {
    const t = setInterval(() => setDrones((ds) => ds.map((d) => d.status === 'patrolling' || d.status === 'returning' ? { ...d, battery: Math.max(5, +(d.battery - 0.05).toFixed(2)), altitude: Math.round(d.altitude + (Math.random() - 0.5) * 4), speed: Math.max(10, Math.round(d.speed + (Math.random() - 0.5) * 3)), lat: d.lat + (Math.random() - 0.5) * 0.0008, lng: d.lng + (Math.random() - 0.5) * 0.0008, signal: Math.min(100, Math.max(40, Math.round(d.signal + (Math.random() - 0.5) * 4))) } : d)), 1500);
    return () => clearInterval(t);
  }, []);
  const d = drones.find((x) => x.id === sel)!;
  const live = d.status === 'patrolling' || d.status === 'returning';

  const send = (name: string, apply?: (x: Drone) => Drone) => {
    const id = Date.now();
    setCmds((c) => [{ id, drone: d.id, name, state: 'requested' as const }, ...c].slice(0, 8));
    const set = (state: Cmd['state']) => setCmds((c) => c.map((x) => (x.id === id ? { ...x, state } : x)));
    setTimeout(() => set('acknowledged'), 900);
    setTimeout(() => { if (!live) return set('timed_out'); set('confirmed'); apply && setDrones((ds) => ds.map((x) => (x.id === d.id ? apply(x) : x))); }, 2200);
  };
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2"><Plane className="h-6 w-6 text-amber-600" /><h1 className="text-xl font-bold">Drone Patrol</h1><Badge className="bg-purple-100 text-purple-800">SIMULATOR</Badge></div>
      <DemoNote><b>No real drones are connected.</b> Telemetry, video and AI detection below are simulated. A command shows &quot;confirmed&quot; only after the (simulated) device acknowledges it.</DemoNote>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4">
        {drones.map((x) => <button key={x.id} onClick={() => setSel(x.id)} className={cn('min-w-[140px] shrink-0 rounded-xl2 border p-3 text-left', sel === x.id ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/30' : 'border-line bg-card')}><div className="font-semibold">{x.name}</div><Badge className={ST[x.status]}>{label(x.status)}</Badge><div className="mt-1 text-xs text-muted">Battery {Math.round(x.battery)}%</div></button>)}
      </div>
      <Card className="!p-0 overflow-hidden">
        <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-green-900 via-emerald-800 to-slate-900">
          <div className={cn('absolute inset-0 opacity-30', d.mode === 'thermal' && 'bg-gradient-to-br from-orange-500 via-red-600 to-purple-900 opacity-60')} style={{ backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,.06) 0 1px,transparent 1px 28px),repeating-linear-gradient(90deg,rgba(255,255,255,.06) 0 1px,transparent 1px 28px)' }} />
          {live ? <>
            <div className="absolute left-[38%] top-[42%] h-[26%] w-[22%] animate-pulse rounded border-2 border-red-500"><span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-red-600 px-1 text-[10px] text-white">Target (simulated)</span></div>
            {d.recording && <span className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white"><i className="h-2 w-2 animate-pulse rounded-full bg-red-500" />REC</span>}
          </> : <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">No feed: drone is {d.status}</div>}
          <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] text-white">SIMULATED FEED · {d.mode.toUpperCase()}</span>
        </div>
        <div className="grid grid-cols-2 gap-3 p-3 sm:grid-cols-4">
          <div><div className="flex items-center gap-1 text-xs text-muted"><Battery className="h-3.5 w-3.5" />Battery</div><div className="font-bold">{Math.round(d.battery)}%</div><Progress value={d.battery} /></div>
          <div><div className="flex items-center gap-1 text-xs text-muted"><Signal className="h-3.5 w-3.5" />Signal</div><div className="font-bold">{d.signal}%</div></div>
          <div><div className="flex items-center gap-1 text-xs text-muted"><Mountain className="h-3.5 w-3.5" />Altitude</div><div className="font-bold">{d.altitude} m</div></div>
          <div><div className="flex items-center gap-1 text-xs text-muted"><Gauge className="h-3.5 w-3.5" />Speed</div><div className="font-bold">{d.speed} km/h</div></div>
        </div>
        <div className="flex items-center gap-1 px-3 pb-3 text-xs text-muted"><MapPin className="h-3.5 w-3.5 shrink-0" />{d.lat.toFixed(5)}, {d.lng.toFixed(5)} · {d.zone}</div>
      </Card>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <Button variant="amber" onClick={() => send(d.mode === 'rgb' ? 'Switch to thermal' : 'Switch to RGB', (x) => ({ ...x, mode: x.mode === 'rgb' ? 'thermal' : 'rgb' }))}><Thermometer className="h-4 w-4" />Request {d.mode === 'rgb' ? 'thermal' : 'RGB'}</Button>
        <Button variant="outline" onClick={() => send(d.recording ? 'Stop recording' : 'Start recording', (x) => ({ ...x, recording: !x.recording }))}><Video className="h-4 w-4" />{d.recording ? 'Stop' : 'Start'} recording</Button>
        <Button variant="outline" onClick={() => send('Run diagnostics')}><Activity className="h-4 w-4" />Diagnostics</Button>
      </div>
      <MapView height={220} points={drones.filter((x) => x.id === sel || x.status === 'patrolling').map((x) => ({ id: x.id, lat: x.lat, lng: x.lng, title: x.name, sub: label(x.status), color: '#d97706' }))} heat={false} />
      <Card><h2 className="mb-2 font-semibold">Command log</h2>
        {cmds.length === 0 ? <p className="text-sm text-muted">No commands yet.</p> : <ul className="space-y-1.5 text-sm">{cmds.map((c) => <li key={c.id} className="flex items-center justify-between gap-2"><span className="min-w-0 truncate">{drones.find((x) => x.id === c.drone)?.name}: {c.name}</span><Badge className={c.state === 'confirmed' ? 'bg-green-100 text-green-800' : c.state === 'timed_out' || c.state === 'failed' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}>{label(c.state)}</Badge></li>)}</ul>}
        <p className="mt-2 text-[11px] text-muted">Production: telemetry sampled (e.g. every 5 s) and retained briefly to bound storage cost.</p></Card>
    </div>
  );
}
