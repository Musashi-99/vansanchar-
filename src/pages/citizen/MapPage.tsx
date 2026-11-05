import { useMemo, useState, useEffect } from 'react';
import { Maximize2, Minimize2, Crosshair, Navigation } from 'lucide-react';
import MapView, { type MapPoint } from '../../components/MapView';
import { Button, Card, Select, Badge, SevBadge, DemoNote, Empty } from '../../components/ui';
import { useStore } from '../../lib/store';
import { useGeolocation } from '../../lib/hooks';
import { ANIMALS, publicIncident, haversine, km, ago, SEVERITIES, label, cn } from '../../lib/utils';
import { SEED_HOTSPOTS } from '../../lib/seed';
import type { Animal, Severity } from '../../lib/types';

export default function MapPage() {
  const reports = useStore((s) => s.reports);
  const geo = useGeolocation();
  const [sev, setSev] = useState<'all' | Severity>('all');
  const [animal, setAnimal] = useState<'all' | Animal>('all');
  const [days, setDays] = useState(30);
  const [radius, setRadius] = useState(0);
  const [full, setFull] = useState(false);
  const [layer, setLayer] = useState({ incidents: true, zones: true });

  useEffect(() => { const k = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false); window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  const me = geo.point ? { lat: geo.point.lat, lng: geo.point.lng } : undefined;
  const incidents = useMemo(() => reports
    .filter((r) => (r.status === 'verified' || r.status === 'resolved') && !r.withdrawn)
    .filter((r) => Date.now() - +new Date(r.submittedAt) < days * 864e5)
    .map(publicIncident)
    .filter((i) => (sev === 'all' || i.severity === sev) && (animal === 'all' || i.animal === animal))
    .map((i) => ({ ...i, dist: me ? haversine(me, i) : undefined }))
    .filter((i) => !radius || !me || (i.dist ?? 0) <= radius)
    .sort((a, b) => (a.dist ?? 0) - (b.dist ?? 0) || +new Date(b.at) - +new Date(a.at)), [reports, sev, animal, days, radius, me]);

  const points: MapPoint[] = layer.incidents ? incidents.map((i) => ({ id: i.id, lat: i.lat, lng: i.lng, severity: i.severity, title: `${ANIMALS[i.animal]} (${label(i.severity)})`, sub: `Around ${i.area} · ${ago(i.at)}` })) : [];

  return (
    <div className={cn('space-y-3', full && 'fixed inset-0 z-[1500] flex flex-col bg-bg p-3')}>
      {!full && <><h1 className="text-xl font-bold">Hotspot Map</h1>
        <DemoNote>Public map shows only <b>verified</b> incidents, generalised to about 1 km. Exact positions are never shown to the public.</DemoNote></>}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Select value={sev} onChange={(e) => setSev(e.target.value as never)} aria-label="Severity"><option value="all">All severity</option>{SEVERITIES.map((s) => <option key={s} value={s}>{label(s)}</option>)}</Select>
        <Select value={animal} onChange={(e) => setAnimal(e.target.value as never)} aria-label="Species"><option value="all">All species</option>{(Object.keys(ANIMALS) as Animal[]).map((a) => <option key={a} value={a}>{ANIMALS[a]}</option>)}</Select>
        <Select value={days} onChange={(e) => setDays(+e.target.value)} aria-label="Date range"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></Select>
        <Select value={radius} onChange={(e) => setRadius(+e.target.value)} aria-label="Radius" disabled={!me}><option value={0}>Any distance</option><option value={5}>Within 5 km</option><option value={15}>Within 15 km</option><option value={30}>Within 30 km</option></Select>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={geo.request} loading={geo.loading}><Crosshair className="h-4 w-4" />Near me</Button>
        <Button size="sm" variant={layer.incidents ? 'soft' : 'outline'} onClick={() => setLayer({ ...layer, incidents: !layer.incidents })}>Incidents</Button>
        <Button size="sm" variant={layer.zones ? 'soft' : 'outline'} onClick={() => setLayer({ ...layer, zones: !layer.zones })}>Risk zones</Button>
        <Button size="sm" variant="outline" onClick={() => setFull(!full)} aria-label="Toggle fullscreen">{full ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}{full ? 'Exit' : 'Fullscreen'}</Button>
      </div>
      {geo.error && <div className="text-xs text-danger">{geo.error}</div>}
      <div className={full ? 'min-h-0 flex-1' : ''}>
        <MapView points={points} hotspots={layer.zones ? SEED_HOTSPOTS : []} me={me} radiusKm={radius || undefined} height={full ? '100%' : 380} trigger={full} />
      </div>
      {!full && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-xs"><span className="font-medium">Zones:</span>{(['low', 'medium', 'high', 'critical'] as Severity[]).map((s) => <SevBadge key={s} s={s} />)}</div>
          <h2 className="mt-2 text-lg font-semibold">{me ? 'Nearby incidents' : 'Recent verified incidents'} ({incidents.length})</h2>
          {incidents.length === 0 ? <Empty title="No incidents match" hint="Try widening the filters." /> : (
            <div className="space-y-2">
              {incidents.slice(0, 12).map((i) => (
                <Card key={i.id} className="!p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-1.5 font-medium">{ANIMALS[i.animal]}<SevBadge s={i.severity} /></div>
                      <div className="text-xs text-muted">Around {i.area} · {ago(i.at)}{i.dist != null && ` · ${km(i.dist)} away`}</div></div>
                    <a href={`https://www.openstreetmap.org/directions?to=${i.lat},${i.lng}`} target="_blank" rel="noreferrer" className="flex h-9 shrink-0 items-center gap-1 rounded-xl2 bg-secondary px-3 text-xs font-medium"><Navigation className="h-3.5 w-3.5" />Directions</a>
                  </div>
                </Card>
              ))}
            </div>
          )}
          <Badge className="bg-secondary">Map tiles © OpenStreetMap contributors. Offline map packs are not included.</Badge>
        </>
      )}
    </div>
  );
}
