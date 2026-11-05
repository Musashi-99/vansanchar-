import { useState } from 'react';
import { Radio, TriangleAlert, Layers, PawPrint, SlidersHorizontal, Check, Slash, Wheat, ChevronDown, Calendar, Users, Leaf, ChevronRight, Cpu, ArrowRight, ShieldCheck, ChartNoAxesColumn, Navigation, LocateFixed, Maximize2 } from 'lucide-react';
import CitizenHero from './CitizenHero';
import { Panel, Pills, Check2, Dot, img } from '../kit';
import NeonMap, { MapLabel, ReserveLabel, Heat } from '../NeonMap';

const Paw = ({ c = '#ff3b3b' }: { c?: string }) => <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white/95 text-[#c92a2a]" style={{ borderColor: c }}><PawPrint className="h-4 w-4" /></span>;
const pins: [number, number, string, number][] = [[88.58, 22.25, '#ff3b3b', 56], [88.95, 22.18, '#ffa41c', 34], [88.8, 22.0, '#ff3b3b', 62], [88.45, 21.78, '#ff3b3b', 36], [88.88, 21.7, '#ff3b3b', 46], [89.12, 22.1, '#ff3b3b', 44]];
const recent = [['inc-tiger.jpg', 'Tiger sighting near Gosaba', 'High Risk', '#ff3b3b', '2 hours ago'], ['inc-croc.jpg', 'Crocodile near riverbank', 'Medium Risk', '#ffa41c', '4 hours ago'], ['inc-elephant.jpg', 'Elephant movement (group)', 'High Risk', '#ff3b3b', '6 hours ago'], ['inc-boar.jpg', 'Wild boar in crop field', 'Low Risk', '#ffd93a', '8 hours ago']] as const;

export default function MapHotspot() {
  const [mode, setMode] = useState('live');
  const [range, setRange] = useState('24 Hrs');
  const [types, setTypes] = useState([true, false, false, false]);
  return (
    <>
      <CitizenHero title="Wildlife Hotspot Map" sub="Explore real-time reports, risk zones, and wildlife movement patterns across the Sundarbans.">
        <Pills value={mode} onChange={setMode} items={[{ id: 'live', label: <><Radio className="h-4 w-4" />Live Incidents</> }, { id: 'risk', label: <><TriangleAlert className="h-4 w-4" />Risk Zones</> }, { id: 'heat', label: <><Layers className="h-4 w-4" />Predictive Heatmap</> }, { id: 'move', label: <><PawPrint className="h-4 w-4" />Wildlife Movement</> }]} />
      </CitizenHero>
      <div className="mx-auto grid max-w-[1500px] gap-3 px-3 pb-8 sm:px-5 lg:grid-cols-[250px_1fr_370px]">
        <Panel className="p-3.5 lg:self-stretch"><div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-2 text-[17px] font-bold"><SlidersHorizontal className="h-5 w-5 text-[var(--nf-lime)]" />Filters</h3><button onClick={() => { setTypes([false, false, false, false]); setRange('24 Hrs'); }} className="text-[12.5px] font-semibold text-[var(--nf-lime)] underline">Clear All</button></div>
          <div className="border-t border-white/10 pt-3"><h4 className="mb-2 text-[14px] font-semibold">Time Range</h4><div className="flex flex-wrap gap-1.5">{['24 Hrs', '7 Days', '30 Days'].map((r) => <button key={r} onClick={() => setRange(r)} className={`nf-pill !px-3 !py-1 !text-xs ${range === r ? 'on' : ''}`}>{r}</button>)}<span className="nf-pill !px-3 !py-1 !text-xs"><Calendar className="h-3 w-3" />Custom</span></div></div>
          <div className="mt-4 border-t border-white/10 pt-3"><h4 className="mb-2 text-[14px] font-semibold">Incident Type</h4><ul className="space-y-2.5">{[[PawPrint, 'Animal Sighting'], [Slash, 'Animal Attack'], [Wheat, 'Crop / Livestock Damage'], [TriangleAlert, 'Potential Risk / Movement']].map(([I, n], i) => { const Ic = I as typeof Slash; return <li key={n as string}><button onClick={() => setTypes((t) => t.map((x, j) => (j === i ? !x : x)))} className="flex items-center gap-2.5 text-[13px]"><Check2 on={types[i]} /><Ic className="h-5 w-5 text-[var(--nf-lime)]" />{n as string}</button></li>; })}</ul></div>
          {[['Animal', 'All Animals', PawPrint], ['Severity', 'All Levels', ChartNoAxesColumn], ['Status', 'All (Verified + Pending)', ShieldCheck]].map(([t, v, I]) => { const Ic = I as typeof PawPrint; return <div key={t as string} className="mt-4 border-t border-white/10 pt-3"><h4 className="mb-2 text-[14px] font-semibold">{t as string}</h4><span className="nf-pill !flex !w-full !justify-between !rounded-xl !py-2.5 !text-[13px]"><span className="flex items-center gap-2"><Ic className="h-4 w-4" />{v as string}</span><ChevronDown className="h-4 w-4" /></span></div>; })}</Panel>

        <Panel className="relative p-2"><NeonMap height={640} zoom={9} center={[88.78, 22.05]} items={[
          { lng: 88.7, lat: 22.4, node: <MapLabel>Canning</MapLabel> }, { lng: 88.35, lat: 22.4, node: <MapLabel>Bhangar</MapLabel> }, { lng: 88.9, lat: 22.27, node: <MapLabel>Basanti</MapLabel> }, { lng: 88.85, lat: 22.12, node: <MapLabel>Gosaba</MapLabel> }, { lng: 88.45, lat: 21.98, node: <MapLabel>Pakhirala</MapLabel> }, { lng: 88.2, lat: 21.78, node: <MapLabel>Namkhana</MapLabel> }, { lng: 88.45, lat: 21.55, node: <MapLabel>Bakkhali</MapLabel> }, { lng: 89.05, lat: 22.05, node: <MapLabel>Sajnekhali<br />Range</MapLabel> }, { lng: 89.0, lat: 21.82, node: <ReserveLabel /> },
          ...pins.map(([lng, lat, c, r]) => ({ lng, lat, node: <Heat r={r} c={c} core={<Paw c={c} />} />, z: 2 })),
          ...[[88.7, 22.3], [88.62, 22.0], [88.92, 22.05], [88.4, 21.85], [89.0, 22.3], [88.75, 21.85]].map(([lng, lat]) => ({ lng, lat, node: <Dot c="#ffd93a" /> })),
        ]}><span className="absolute right-3 top-3 flex flex-col items-center gap-0.5 rounded-lg border border-[var(--nf-line)] bg-[#0b2a14]/90 px-2.5 py-1.5 text-[10px] font-bold"><b>N</b><Navigation className="h-5 w-5" fill="white" /></span>
          <span className="absolute bottom-16 right-3 flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--nf-line)] bg-[#0b2a14]/90"><LocateFixed className="h-5 w-5" /></span></NeonMap>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-xl border border-[var(--nf-line)] bg-[#0a2411]/90 px-3 py-2 text-[12px]"><b>Risk Level:</b><span className="flex items-center gap-1.5"><Dot c="#ff3b3b" />High</span><span className="flex items-center gap-1.5"><Dot c="#ffa41c" />Medium</span><span className="flex items-center gap-1.5"><Dot c="#ffd93a" />Low</span><span className="mx-2 h-5 w-px bg-white/20" /><span className="flex items-center gap-1.5"><Paw />Incident (Verified)</span><span className="flex items-center gap-1.5"><Paw c="#8a9a8a" />Incident (Pending)</span><span className="flex items-center gap-1.5"><i className="h-3 w-5 rounded-md border-2 border-dashed border-[#e8ff4a]" />Reserve Boundary</span></div></Panel>

        <div className="space-y-3 min-w-0">
          <Panel className="p-3.5"><h3 className="mb-3 flex items-center gap-2 text-[17px] font-bold"><ChartNoAxesColumn className="h-5 w-5 text-[var(--nf-lime)]" />Live Overview <span className="font-normal">(Last 7 Days)</span></h3>
            <div className="grid grid-cols-4 divide-x divide-white/15 text-center">{[[PawPrint, '1,248', 'Total Reports', '#ff5a5a'], [TriangleAlert, '76', 'High Risk', '#ffa41c'], [Users, '426', 'Volunteers Active', 'var(--nf-lime)'], [Leaf, '7', 'Species Reported', 'var(--nf-lime)']].map(([I, v, l, c]) => { const Ic = I as typeof Leaf; return <div key={l as string} className="flex flex-col items-center px-1 leading-tight"><Ic className="mb-1 h-6 w-6" style={{ color: c as string }} /><b className="text-[22px]">{v as string}</b><span className="text-[11px]">{l as string}</span></div>; })}</div></Panel>
          <Panel className="p-3.5"><div className="mb-1 flex items-center justify-between"><h3 className="flex items-center gap-2 text-[17px] font-bold"><SlidersHorizontal className="h-5 w-5 text-[var(--nf-lime)]" />Recent Incidents</h3><span className="text-[12.5px] font-semibold text-[var(--nf-lime)]">View All →</span></div>
            <ul className="divide-y divide-white/10">{recent.map(([im, t, r, c, w]) => <li key={t} className="flex items-center gap-3 py-2.5"><img src={img(im)} alt="" className="h-[50px] w-[58px] shrink-0 rounded-lg object-cover" /><span className="min-w-0 flex-1 leading-tight"><b className="block text-[14px]">{t}</b><span className="flex items-center gap-1.5 text-[12px]"><Dot c={c} /><span style={{ color: c }}>{r}</span> • {w}</span></span><ChevronRight className="h-4 w-4" /></li>)}</ul></Panel>
          <Panel tone="hl" className="p-3.5"><div className="flex items-center gap-3"><Cpu className="h-11 w-11 shrink-0 text-[var(--nf-lime)]" /><div className="min-w-0 flex-1"><h3 className="text-[16px] font-bold">AI Predictive Insight</h3><p className="text-[12.5px] leading-snug">Elevated conflict risk in Gosaba–Basanti belt over the next 3 days (72% confidence).</p></div><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[var(--nf-lime)] text-[var(--nf-lime)]"><ArrowRight className="h-4 w-4" /></span></div></Panel>
        </div>
      </div>
    </>
  );
}
