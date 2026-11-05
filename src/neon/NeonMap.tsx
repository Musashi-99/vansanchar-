import { useEffect, useRef, useState, type ReactNode } from 'react';
import maplibregl from 'maplibre-gl';
import { Plus, Minus, Layers, Maximize2, Navigation } from 'lucide-react';
import { cn } from '../lib/utils';

const SAT = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/** Approximate Sundarbans Tiger Reserve outline (stylised, demo). */
export const RESERVE: [number, number][] = [
  [88.78, 22.03], [88.95, 22.1], [89.1, 22.06], [89.2, 21.93], [89.12, 21.8], [88.98, 21.72], [88.86, 21.62], [88.72, 21.7], [88.64, 21.82], [88.7, 21.95], [88.78, 22.03],
];
export const PLACES: Record<string, [number, number]> = {
  Canning: [88.67, 22.31], Basanti: [88.88, 22.17], Gosaba: [88.8, 22.16], Pakhirala: [88.62, 21.98], Namkhana: [88.26, 21.77], Bakkhali: [88.3, 21.56],
  Sajnekhali: [88.99, 22.08], Bhangar: [88.5, 22.45],
};

export interface MapItem { lng: number; lat: number; node: ReactNode; z?: number }
export interface Route { pts: [number, number][]; color?: string; dash?: boolean; w?: number }

export default function NeonMap({
  items = [], routes = [], reserve = true, height = 320, center = [88.8, 22.0], zoom = 8.6, controls = true, className, children, scale = true, tint = true, interactive = true,
}: { items?: MapItem[]; routes?: Route[]; reserve?: boolean; height?: number | string; center?: [number, number]; zoom?: number; controls?: boolean; className?: string; children?: ReactNode; scale?: boolean; tint?: boolean; interactive?: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [, force] = useState(0);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!box.current) return;
    let map: maplibregl.Map;
    try {
      map = new maplibregl.Map({
        container: box.current, center, zoom: zoom - 0.5, attributionControl: false, interactive, pitchWithRotate: false, dragRotate: false,
        style: { version: 8, sources: { sat: { type: 'raster', tiles: [SAT], tileSize: 256, maxzoom: 17 } }, layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#08200f' } }, { id: 'sat', type: 'raster', source: 'sat', paint: { 'raster-saturation': 0.5, 'raster-contrast': 0.15 } }] },
      });
    } catch { setFailed(true); return; }
    mapRef.current = map;
    const bump = () => force((n) => n + 1);
    map.on('move', bump); map.on('resize', bump);
    map.on('error', () => undefined);
    map.on('load', () => {
      if (reserve) {
        map.addSource('reserve', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [RESERVE] } } });
        map.addLayer({ id: 'reserve-fill', type: 'fill', source: 'reserve', paint: { 'fill-color': '#0a3a12', 'fill-opacity': 0.25 } });
        map.addLayer({ id: 'reserve-line', type: 'line', source: 'reserve', paint: { 'line-color': '#e8ff4a', 'line-width': 2.2, 'line-dasharray': [3, 2] } });
      }
      routes.forEach((r, i) => {
        map.addSource(`r${i}`, { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: r.pts } } });
        map.addLayer({ id: `r${i}`, type: 'line', source: `r${i}`, paint: { 'line-color': r.color ?? '#fff', 'line-width': r.w ?? 2.5, ...(r.dash === false ? {} : { 'line-dasharray': [2, 1.5] }) } });
      });
      bump();
    });
    const ro = new ResizeObserver(() => map.resize()); ro.observe(box.current);
    const t = setTimeout(() => { if (!map.loaded()) setFailed(true); }, 6000);
    return () => { clearTimeout(t); ro.disconnect(); map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const map = mapRef.current;
  const px = (lng: number, lat: number) => { try { const p = map!.project([lng, lat]); return { left: p.x, top: p.y }; } catch { return { left: -999, top: -999 }; } };

  return (
    <div className={cn('nf-map relative overflow-hidden rounded-xl', className)} style={{ height }}>
      <div ref={box} className="absolute inset-0" />
      {failed && <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 30% 40%, #1c5a2a, #0a2a14 70%)' }} />}
      {tint && <><div className="pointer-events-none absolute inset-0 bg-[#0d7a2a]/35 mix-blend-soft-light" /><div className="pointer-events-none absolute inset-0 bg-[#052a10]/25" /></>}
      <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,.45)]" />
      {map && [...items].sort((a, b) => (a.z ?? 0) - (b.z ?? 0)).map((it, i) => (
        <div key={i} className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2" style={px(it.lng, it.lat)}>{it.node}</div>
      ))}
      {controls && (
        <>
          <div className="absolute bottom-3 right-3 flex flex-col overflow-hidden rounded-lg border border-[var(--nf-line)] bg-[#0b2a14]/90">
            <button aria-label="Zoom in" onClick={() => mapRef.current?.zoomIn()} className="p-2 hover:bg-white/10"><Plus className="h-4 w-4" /></button>
            <button aria-label="Zoom out" onClick={() => mapRef.current?.zoomOut()} className="border-t border-[var(--nf-line)] p-2 hover:bg-white/10"><Minus className="h-4 w-4" /></button>
          </div>
          <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nf-line)] bg-[#0b2a14]/90"><Layers className="h-4 w-4" /></span>
          <button aria-label="Reset view" onClick={() => mapRef.current?.flyTo({ center, zoom: zoom - 0.5 })} className="absolute right-3 top-14 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--nf-line)] bg-[#0b2a14]/90"><Maximize2 className="h-4 w-4" /></button>
        </>
      )}
      {scale && <div className="pointer-events-none absolute bottom-3 left-3 text-[10px] leading-none text-white/90"><div className="mb-1 flex gap-4"><span>0</span><span>5</span><span>10</span><span>20 km</span></div><div className="h-1 w-24 border-x border-b border-white/80" /></div>}
      {children}
    </div>
  );
}

/* ---------- reusable map nodes ---------- */
export const MapLabel = ({ children, sub, className }: { children: ReactNode; sub?: ReactNode; className?: string }) => (
  <span className={cn('block whitespace-nowrap rounded-md bg-black/55 px-2 py-0.5 text-center text-[12px] font-semibold leading-tight text-white backdrop-blur-[1px]', className)}>{children}{sub && <span className="block text-[11px] font-normal">{sub}</span>}</span>
);
export const ReserveLabel = () => (
  <span className="flex flex-col items-center text-center text-[14px] font-bold leading-tight text-white [text-shadow:0_1px_4px_#000]"><span className="mb-1 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--nf-lime)] bg-black/50 text-[var(--nf-lime)]">▲</span>Sundarbans<br />Tiger Reserve</span>
);
export const Heat = ({ r = 40, c = '#ff2a1a', core }: { r?: number; c?: string; core?: ReactNode }) => (
  <span className="relative flex items-center justify-center" style={{ width: r * 2, height: r * 2 }}>
    <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${c}cc 0%, ${c}77 35%, ${c}00 70%)` }} />
    {core && <span className="relative">{core}</span>}
  </span>
);
export const Pin = ({ c = '#ff3b3b', size = 26, children }: { c?: string; size?: number; children?: ReactNode }) => (
  <span className="relative flex items-center justify-center rounded-full border-2 border-white/90 text-white shadow-[0_0_14px_var(--c)]" style={{ width: size, height: size, background: c, ['--c' as string]: c }}>{children}</span>
);
export const Dotm = ({ c = '#ffa41c', s = 8 }: { c?: string; s?: number }) => <span className="block rounded-full border border-black/40" style={{ width: s, height: s, background: c, boxShadow: `0 0 8px ${c}` }} />;
export const NorthArrow = () => <Navigation className="h-6 w-6 text-white" fill="white" />;
