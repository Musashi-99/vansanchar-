import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { RotateCw } from 'lucide-react';
import { CENTER, SEV_HEX, label, cn } from '../lib/utils';
import type { Severity, Hotspot } from '../lib/types';

export interface MapPoint { id: string; lat: number; lng: number; severity?: Severity; title: string; sub?: string; color?: string; link?: { href: string; text: string } }

// Open data sources, no API keys:
//  - OpenFreeMap vector tiles (crisp at any pixel density = "HD" 2D map, plus forest/wetland polygons for canopy)
//  - AWS Terrain Tiles (Terrarium DEM) for elevation
//  - Esri World Imagery for satellite (check Esri terms for production use)
const STYLE = 'https://tiles.openfreemap.org/styles/liberty';
const DEM = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
const RISK_HEX: Record<Severity, string> = { low: '#16a34a', medium: '#d97706', high: '#ea580c', critical: '#dc2626' };
const COLUMN_H: Record<Severity, number> = { low: 700, medium: 1500, high: 2600, critical: 4000 };
const ZONE_H: Record<Severity, number> = { low: 150, medium: 350, high: 650, critical: 1000 };

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
function circle(lng: number, lat: number, rM: number, steps = 24): number[][] {
  const dLat = rM / 111320, dLng = rM / (111320 * Math.cos((lat * Math.PI) / 180));
  const ring = Array.from({ length: steps }, (_, i) => { const a = (i / steps) * 2 * Math.PI; return [lng + dLng * Math.cos(a), lat + dLat * Math.sin(a)]; });
  return [...ring, ring[0]];
}
const poly = (ring: number[][], props: Record<string, unknown>): GeoJSON.Feature => ({ type: 'Feature', properties: props, geometry: { type: 'Polygon', coordinates: [ring] } });
const pt = (lng: number, lat: number, props: Record<string, unknown>): GeoJSON.Feature => ({ type: 'Feature', properties: props, geometry: { type: 'Point', coordinates: [lng, lat] } });
const fc = (features: GeoJSON.Feature[]): GeoJSON.FeatureCollection => ({ type: 'FeatureCollection', features });

function Seg<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string }[] }) {
  return (
    <div className="flex overflow-hidden rounded-lg bg-white/95 shadow" role="group">
      {items.map((i) => <button key={i.id} onClick={() => onChange(i.id)} aria-pressed={value === i.id}
        className={cn('h-9 px-3 text-xs font-semibold', value === i.id ? 'bg-[#2D5016] text-white' : 'text-slate-800')}>{i.label}</button>)}
    </div>
  );
}

export default function MapView({ points, hotspots = [], me, radiusKm, height = 360, trigger, focus, heat = true }: {
  points: MapPoint[]; hotspots?: Hotspot[]; me?: { lat: number; lng: number }; radiusKm?: number; height?: number | string; trigger?: unknown; focus?: [number, number]; heat?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const baseIds = useRef<string[]>([]);
  const spin = useRef<number>();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<'2d' | '3d'>('2d');
  const [base, setBase] = useState<'map' | 'sat'>('map');
  const [exag, setExag] = useState(8);
  const [err, setErr] = useState<string | false>(false);

  useEffect(() => {
    if (!box.current) return;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({ container: box.current, style: STYLE, center: [CENTER[1], CENTER[0]], zoom: 9.6, maxPitch: 85, pixelRatio: Math.max(window.devicePixelRatio, 2), attributionControl: { compact: true } });
    } catch (e) { setErr(String((e as Error).message || e)); return; }
    mapRef.current = map;
    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'bottom-right');
    map.on('error', (e) => { if (!map.isStyleLoaded() && !(e as { sourceId?: string }).sourceId) setErr('Map style could not load. Check your internet connection.'); });
    map.on('load', () => {
      baseIds.current = map.getStyle().layers.filter((l) => l.type !== 'symbol').map((l) => l.id);
      const first = map.getStyle().layers[0]?.id;
      map.addSource('sat', { type: 'raster', tiles: [SAT], tileSize: 256, maxzoom: 18, attribution: 'Imagery © Esri, Maxar, Earthstar Geographics' });
      map.addLayer({ id: 'sat', type: 'raster', source: 'sat', layout: { visibility: 'none' } }, first);
      map.addSource('dem', { type: 'raster-dem', tiles: [DEM], encoding: 'terrarium', tileSize: 256, maxzoom: 14, attribution: 'Terrain: Mapzen / AWS Open Data' });
      map.addLayer({ id: 'canopy', type: 'fill-extrusion', source: 'openmaptiles', 'source-layer': 'landcover', minzoom: 8,
        filter: ['in', ['get', 'class'], ['literal', ['wood', 'wetland']]],
        paint: { 'fill-extrusion-color': ['match', ['get', 'class'], 'wood', '#14532d', '#2f855a'], 'fill-extrusion-height': 0, 'fill-extrusion-opacity': 0.78 }, layout: { visibility: 'none' } });
      for (const s of ['zones', 'cols', 'pts', 'me']) map.addSource(s, { type: 'geojson', data: fc([]) });
      map.addLayer({ id: 'zones-2d', type: 'fill', source: 'zones', paint: { 'fill-color': ['get', 'color'], 'fill-opacity': 0.2 } });
      map.addLayer({ id: 'zones-line', type: 'line', source: 'zones', paint: { 'line-color': ['get', 'color'], 'line-width': 1.5 } });
      map.addLayer({ id: 'zones-3d', type: 'fill-extrusion', source: 'zones', layout: { visibility: 'none' }, paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-opacity': 0.38 } });
      map.addLayer({ id: 'cols-3d', type: 'fill-extrusion', source: 'cols', layout: { visibility: 'none' }, paint: { 'fill-extrusion-color': ['get', 'color'], 'fill-extrusion-height': ['get', 'h'], 'fill-extrusion-opacity': 0.95 } });
      map.addLayer({ id: 'pts-2d', type: 'circle', source: 'pts', paint: { 'circle-radius': 9, 'circle-color': ['get', 'color'], 'circle-stroke-color': '#fff', 'circle-stroke-width': 2.5 } });
      map.addLayer({ id: 'me-ring', type: 'line', source: 'me', filter: ['==', ['get', 'kind'], 'radius'], paint: { 'line-color': '#2563eb', 'line-width': 2, 'line-dasharray': [2, 2] } });
      map.addLayer({ id: 'me-dot', type: 'circle', source: 'me', filter: ['==', ['get', 'kind'], 'dot'], paint: { 'circle-radius': 8, 'circle-color': '#2563eb', 'circle-stroke-color': '#fff', 'circle-stroke-width': 3 } });

      const open = (e: maplibregl.MapLayerMouseEvent) => {
        const f = e.features?.[0]; if (!f) return; const p = f.properties as Record<string, string>;
        const link = p.href ? `<br/><a href="${esc(p.href)}" style="color:#2D5016;font-weight:600">${esc(p.linkText || 'Open')}</a>` : '';
        new maplibregl.Popup({ maxWidth: '240px' }).setLngLat(e.lngLat).setHTML(`<div style="font-family:Outfit,sans-serif;font-size:13px;color:#1A2E1A"><b>${esc(p.title ?? '')}</b>${p.sub ? `<br/>${esc(p.sub)}` : ''}${link}</div>`).addTo(map);
      };
      for (const id of ['pts-2d', 'cols-3d', 'zones-2d', 'zones-3d']) {
        map.on('click', id, open);
        map.on('mouseenter', id, () => (map.getCanvas().style.cursor = 'pointer'));
        map.on('mouseleave', id, () => (map.getCanvas().style.cursor = ''));
      }
      setReady(true);
    });
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(box.current);
    return () => { ro.disconnect(); cancelAnimationFrame(spin.current!); map.remove(); mapRef.current = null; setReady(false); };
  }, []);

  // view mode + basemap
  useEffect(() => {
    const map = mapRef.current; if (!map || !ready) return;
    const vis = (id: string, on: boolean) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none');
    const d3 = mode === '3d';
    vis('sat', base === 'sat');
    baseIds.current.forEach((id) => vis(id, base === 'map' && (id !== 'building-3d' || true)));
    vis('canopy', d3); vis('cols-3d', d3); vis('zones-3d', d3); vis('pts-2d', !d3); vis('zones-2d', !d3); vis('zones-line', !d3);
    map.setTerrain(d3 ? { source: 'dem', exaggeration: exag } : null);
    if (d3) {
      // canopy ~25 m real height for forest, ~8 m for mangrove/wetland; scaled by the same vertical exaggeration as terrain
      map.setPaintProperty('canopy', 'fill-extrusion-height', ['match', ['get', 'class'], 'wood', 25 * exag, 8 * exag]);
    }
    map.easeTo({ pitch: d3 ? 65 : 0, bearing: d3 ? -18 : 0, duration: 700 });
  }, [mode, base, exag, ready]);

  // data
  useEffect(() => {
    const map = mapRef.current; if (!map || !ready) return;
    const src = (n: string) => map.getSource(n) as maplibregl.GeoJSONSource;
    const props = (p: MapPoint) => ({ color: p.color ?? SEV_HEX[p.severity ?? 'medium'], title: p.title, sub: p.sub ?? '', href: p.link?.href ?? '', linkText: p.link?.text ?? '' });
    src('pts').setData(fc(points.map((p) => pt(p.lng, p.lat, props(p)))));
    src('cols').setData(fc(points.map((p) => poly(circle(p.lng, p.lat, 260), { ...props(p), h: p.color ? 900 : COLUMN_H[p.severity ?? 'medium'] }))));
    src('zones').setData(fc(heat ? hotspots.map((z) => poly(circle(z.lng, z.lat, z.radius), { color: RISK_HEX[z.risk], h: ZONE_H[z.risk], title: `${z.name} (${label(z.risk)} risk)`, sub: `${z.count} incidents · ${z.advisory}` })) : []));
    src('me').setData(fc(me ? [pt(me.lng, me.lat, { kind: 'dot' }), ...(radiusKm ? [{ type: 'Feature' as const, properties: { kind: 'radius' }, geometry: { type: 'LineString' as const, coordinates: circle(me.lng, me.lat, radiusKm * 1000, 64) } }] : [])] : []));
  }, [points, hotspots, me, radiusKm, heat, ready]);

  useEffect(() => { mapRef.current?.resize(); const t = setTimeout(() => mapRef.current?.resize(), 200); return () => clearTimeout(t); }, [trigger]);
  useEffect(() => { if (focus && ready) mapRef.current?.flyTo({ center: [focus[1], focus[0]], zoom: 12.5, duration: 900 }); }, [focus, ready]);
  useEffect(() => { if (me && ready) mapRef.current?.flyTo({ center: [me.lng, me.lat], zoom: 11, duration: 900 }); }, [me?.lat, me?.lng, ready]); // eslint-disable-line

  const rotate = () => {
    const map = mapRef.current; if (!map) return;
    if (spin.current) { cancelAnimationFrame(spin.current); spin.current = undefined; return; }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const step = () => { map.setBearing(map.getBearing() + 0.25); spin.current = requestAnimationFrame(step); };
    step();
  };

  return (
    <div style={{ height }} className="relative z-0 overflow-hidden rounded-xl2 border border-line bg-secondary">
      <div ref={box} className="h-full w-full" />
      <div className="absolute left-2 top-2 z-10 flex max-w-[calc(100%-1rem)] flex-wrap gap-1.5">
        <Seg value={mode} onChange={setMode} items={[{ id: '2d', label: '2D' }, { id: '3d', label: '3D' }]} />
        <Seg value={base} onChange={setBase} items={[{ id: 'map', label: 'Map' }, { id: 'sat', label: 'Satellite' }]} />
        {mode === '3d' && <button onClick={rotate} className="flex h-9 items-center gap-1 rounded-lg bg-white/95 px-2.5 text-xs font-semibold text-slate-800 shadow" aria-label="Rotate map"><RotateCw className="h-4 w-4" />Rotate</button>}
      </div>
      {mode === '3d' && (
        <div className="absolute bottom-7 left-2 z-10 max-w-[calc(100%-4rem)] rounded-lg bg-white/92 p-2 text-[11px] leading-snug text-slate-800 shadow">
          <label className="flex items-center gap-2 font-semibold">Height ×{exag}
            <input type="range" min={1} max={20} value={exag} onChange={(e) => setExag(+e.target.value)} className="h-2 min-w-0 flex-1 accent-[#2D5016]" aria-label="Vertical exaggeration" /></label>
          <div className="mt-1 text-slate-600">Sundarbans delta is almost flat (about 0–10 m above sea level), so there are no mountains. Forest and mangrove canopy is drawn extruded, exaggerated by the slider.</div>
        </div>
      )}
      {err && <div className="absolute inset-x-2 bottom-10 z-10 rounded-lg bg-amber-100 p-2 text-xs text-amber-900">{err} (Needs WebGL and internet.)</div>}
    </div>
  );
}
