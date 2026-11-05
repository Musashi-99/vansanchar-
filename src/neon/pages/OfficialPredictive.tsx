import { useState } from 'react';
import { useRun } from '../actions';
import { useStore } from '../../lib/store';
import { Flame, TriangleAlert, Leaf, CalendarDays, Target, Route, Maximize2, Map as MapIcon, Crosshair, Layers, Sparkles, BarChart3, Play, Bell, Users, ChevronRight, ShieldCheck, PawPrint, Trees, Siren } from 'lucide-react';
import { Banner, KpiRow, Kpi, Panel, PTitle, Pills, Check2, Dot, Meter, Select2, ViewAll, DroneIcon, TableWrap } from '../kit';
import NeonMap, { MapLabel, ReserveLabel, Heat } from '../NeonMap';
import { Lines } from '../charts';

const trend = [['18 Oct', 33, 18, 15, 12, 8], ['20 Oct', 36, 19, 16, 13, 9], ['22 Oct', 38, 20, 15, 12, 8], ['24 Oct', 46, 24, 17, 14, 10], ['26 Oct', 44, 22, 18, 14, 9], ['28 Oct', 48, 26, 17, 15, 10], ['30 Oct', 56, 25, 19, 15, 10], ['1 Nov', 55, 27, 20, 16, 11], ['4 Nov', 62, 31, 21, 17, 12]].map(([x, a, b, c, d, e]) => ({ x, a, b, c, d, e }));
const zones = [[1, 'Sajnekhali Beat', '0.92', '#e5242b', 'HWC, Poaching'], [2, 'Basanti Beat', '0.88', '#e5242b', 'HWC'], [3, 'Gosaba North', '0.76', '#e8731a', 'Poaching'], [4, 'Pakhirala East', '0.69', '#e8731a', 'Encroachment'], [5, 'Namkhana West', '0.62', '#e8b81a', 'HWC']] as const;
const Lab = ({ n, r, c }: { n: string; r: string; c: string }) => <span className="block whitespace-nowrap rounded-md bg-black/65 px-2 py-0.5 text-center text-[12px] font-semibold leading-tight" style={{ borderLeft: `3px solid ${c}` }}>{n}<br /><span className="text-[11px] font-normal">({r})</span></span>;

export default function OfficialPredictive() {
  const run = useRun();
  const hotspots = useStore((s) => s.hotspots);
  const [tab, setTab] = useState('heat');
  const [win, setWin] = useState(1);
  const [lay, setLay] = useState([true, true, true, false, false, false]);
  const scale = [0.85, 1, 1.12][win];
  const scored = [...hotspots].map((h) => ({ ...h, score: Math.min(0.97, Math.round((h.count / 14) * scale * 100) / 100) })).sort((a, b) => b.score - a.score);
  return (
    <>
      <Banner icon={<Flame className="!text-[#ffa41c]" />} title="Predictive" accent="Heatmap" crumbs={['Analytics & AI', 'Predictive Heatmap']} sub="AI-powered risk prediction for wildlife conflict, poaching, fire, and other forest threats." />
      <KpiRow cols={6}><Kpi tone="red" icon={<Flame />} value={scored.filter((h) => h.score >= 0.75).length} label="High-Risk Zones" /><Kpi tone="amber" icon={<TriangleAlert />} value={scored.filter((h) => h.score >= 0.4 && h.score < 0.75).length} label="Medium-Risk Zones" /><Kpi icon={<Leaf />} value={scored.filter((h) => h.score < 0.4).length} label="Low-Risk Zones" /><Kpi icon={<CalendarDays />} value={['7 days', '14 days', '30 days'][win]} label="Prediction Window" /><Kpi icon={<Target />} value="Rule-based" label="Forecast source" sub="From hotspot counts" /><Kpi icon={<Route />} value={hotspots.reduce((a, h) => a + h.count, 0)} label="Recorded incidents" /></KpiRow>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'heat', label: 'Risk Heatmap' }, { id: 'pred', label: 'Predictions & Alerts' }, { id: 'fac', label: 'Risk Factors' }, { id: 'perf', label: 'Model Performance' }, { id: 'wi', label: 'What-If Analysis' }]} />
        <Select2 icon={<CalendarDays className="h-4 w-4" />}>Next 14 Days (1 – 14 Nov)</Select2>
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.55fr_1.05fr_0.72fr]">
        <Panel className="p-3"><PTitle icon={<MapIcon />} right={<Maximize2 className="h-4 w-4" />}>Predictive Risk Heatmap</PTitle>
          <NeonMap height={372} zoom={8.9} center={[88.75, 22.0]} items={[
            { lng: 88.6, lat: 22.3, node: <Lab n="Sajnekhali" r="High" c="#ff3b3b" /> }, { lng: 89.1, lat: 22.28, node: <Lab n="Basanti" r="High" c="#ff3b3b" /> }, { lng: 88.35, lat: 22.05, node: <Lab n="Pakhirala" r="Medium" c="#ffa41c" /> }, { lng: 88.5, lat: 21.78, node: <Lab n="Namkhana" r="Low" c="#ffd93a" /> }, { lng: 89.2, lat: 21.95, node: <Lab n="Gosaba" r="Medium" c="#ffa41c" /> }, { lng: 88.85, lat: 21.88, node: <ReserveLabel /> },
            { lng: 88.62, lat: 22.2, node: <Heat r={54} />, z: 1 }, { lng: 88.98, lat: 22.2, node: <Heat r={64} />, z: 1 }, { lng: 88.45, lat: 22.0, node: <Heat r={30} c="#ffa41c" /> }, { lng: 88.78, lat: 22.02, node: <Heat r={38} c="#ff8a2a" /> }, { lng: 89.1, lat: 22.05, node: <Heat r={34} /> }, { lng: 88.9, lat: 22.28, node: <Heat r={30} c="#ffa41c" /> },
          ]}><span className="absolute left-3 top-3 flex flex-col items-center text-[11px] font-bold"><b>N</b><i className="border-x-[6px] border-b-[12px] border-x-transparent border-b-white" /></span></NeonMap></Panel>
        <div className="space-y-3 min-w-0">
          <Panel className="p-3"><PTitle icon={<TriangleAlert />} sub={<span className="text-[13px]"> (Next 14 Days)</span>}>Risk Forecast</PTitle>
            <ul className="space-y-2.5">{[[PawPrint, 'Human–Wildlife Conflict', 64, '↑+12%', '#ff4040'], [Crosshair, 'Poaching / Illegal Activity', 41, '↑+6%', '#ffa41c'], [Flame, 'Forest Fire', 28, '↓-9%', '#ffd93a'], [Trees, 'Illegal Logging', 36, '↑+4%', '#a8f43a'], [TriangleAlert, 'Encroachment', 22, '↓-7%', '#a8f43a']].map(([I, n, v, d, c]) => { const Ic = I as typeof Flame; const up = (d as string).startsWith('↑'); return <li key={n as string} className="grid grid-cols-[22px_1.4fr_1fr_38px_52px] items-center gap-2 text-[12.5px]"><Ic className="h-5 w-5" style={{ color: c as string }} /><span className="truncate">{n as string}</span><Meter pct={v as number} color={c as string} h={6} /><b>{v as number}%</b><span className={up ? 'text-[#ff6a6a]' : 'text-[#58e05b]'}>{d as string}</span></li>; })}</ul></Panel>
          <Panel className="p-3"><PTitle icon={<Sparkles />} sub={<span className="text-[13px]"> (AI)</span>}>Key Insights</PTitle>
            <ul className="space-y-2.5 text-[12.5px] leading-snug">{['High conflict risk around Sajnekhali and Basanti (next 7 days).', 'Increased poaching probability in riverine corridors (3–10 Nov).', 'Lower fire risk due to recent rainfall (−9% vs. last period).'].map((t) => <li key={t} className="flex gap-2.5"><Dot c="#7ed321" /><span>{t}</span></li>)}</ul></Panel>
        </div>
        <div className="space-y-3 min-w-0">
          <Panel className="p-3"><PTitle icon={<Layers />}>Control &amp; Layers</PTitle>
            <ul className="space-y-2">{['Predicted Risk (AI)', 'Past Incidents (30 Days)', 'Patrol Routes', 'Camera Traps', 'Drone Coverage', 'Habitat / Land Use'].map((n, i) => <li key={n}><button onClick={() => setLay((l) => l.map((x, j) => (j === i ? !x : x)))} className="flex items-center gap-2.5 text-[13px]"><Check2 on={lay[i]} />{n}</button></li>)}</ul>
            <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-[14px] font-bold"><CalendarDays className="h-4 w-4 text-[var(--nf-lime)]" />Prediction Window</div>
            <ul className="mt-2 space-y-2">{['Next 7 Days', 'Next 14 Days', 'Next 30 Days'].map((n, i) => <li key={n}><button onClick={() => setWin(i)} className="flex items-center gap-2.5 text-[13px]"><span className={`flex h-[18px] w-[18px] items-center justify-center rounded-full border-2 ${win === i ? 'border-[var(--nf-lime)]' : 'border-[#8a9a8a]'}`}>{win === i && <i className="h-2 w-2 rounded-full bg-[var(--nf-lime)]" />}</span>{n}</button></li>)}</ul>
            <button onClick={() => run('Run New Prediction')} className="nf-btn mt-3 w-full !py-2.5"><Play className="h-4 w-4" fill="currentColor" />Run New Prediction</button></Panel>
        </div>
      </div>
      <div className="grid gap-3 xl:grid-cols-[1.2fr_1.02fr_1.02fr]">
        <Panel className="p-3"><PTitle icon={<BarChart3 />} sub={<span className="text-[13px]"> (By Category)</span>}>Risk Trend</PTitle>
          <Lines data={trend} keys={[{ k: 'a', c: '#ff5a5a' }, { k: 'b', c: '#ffa41c' }, { k: 'c', c: '#ffd93a' }, { k: 'd', c: '#8fdc2f' }, { k: 'e', c: '#a35cff' }]} domain={[0, 100]} height={150} />
          <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px]">{[['#ff5a5a', 'HWC (Wildlife Conflict)'], ['#ffa41c', 'Poaching'], ['#ffd93a', 'Fire'], ['#8fdc2f', 'Logging'], ['#a35cff', 'Encroachment']].map(([c, n]) => <span key={n} className="flex items-center gap-1"><Dot c={c} />{n}</span>)}</div></Panel>
        <Panel className="p-3"><PTitle icon={<Target />} sub={<span className="text-[13px]"> (Next 7 Days)</span>} right={<ViewAll />}>High-Risk Zones</PTitle>
          <TableWrap><table className="w-full text-[13px]"><thead><tr className="nf-th text-left"><th>#</th><th>Zone / Beat</th><th>Risk Score</th><th>Advisory</th></tr></thead><tbody>{scored.map((h, i) => { const c = h.score >= 0.75 ? '#e5242b' : h.score >= 0.4 ? '#e8731a' : '#e8b81a'; return <tr key={h.id} className="border-t border-white/5"><td className="py-2">{i + 1}</td><td>{h.name}</td><td><span className="rounded-full px-3.5 py-0.5 text-[12.5px] font-bold text-white" style={{ background: c }}>{h.score.toFixed(2)}</span></td><td>{h.advisory}</td></tr>; })}</tbody></table></TableWrap></Panel>
        <Panel className="p-3"><PTitle icon={<ShieldCheck />}>Recommended Actions</PTitle>
          <ul className="space-y-2">{[[Siren, 'Increase patrols in Sajnekhali & Basanti (1–10 Nov)'], [DroneIcon, 'Deploy drone surveillance on high-risk corridors'], [Users, 'Alert nearby Van Mitra teams & range officers']].map(([I, t]) => { const Ic = I as typeof Siren; return <li key={t as string}><button onClick={() => run(t as string)} className="flex w-full items-center gap-3 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-3 py-2.5 text-left text-[13px]"><Ic className="h-7 w-7 shrink-0 text-[#ffd93a]" size={28} /><span className="flex-1 leading-tight">{t as string}</span><ChevronRight className="h-4 w-4 text-[var(--nf-lime)]" /></button></li>; })}</ul></Panel>
      </div>
    </>
  );
}
