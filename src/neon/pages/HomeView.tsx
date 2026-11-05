import { Link } from 'react-router-dom';
import { MapPin, Megaphone, ChevronRight, ChevronLeft, PawPrint, ScanSearch, BarChart3, Users, Bug, BookOpen, Trophy, ArrowRight, Siren, Cpu } from 'lucide-react';
import { useState } from 'react';
import { img } from '../kit';
import { useStore } from '../../lib/store';

const features = [
  [PawPrint, 'Report\nConflict', '/app/report'], [MapPin, 'Hotspot\nMap', '/app/map'], [Cpu, 'AI Species\nDetection', '/app/ai-detection'], [BarChart3, 'Analytics\n& Trends', '/app/analytics'],
  [Users, 'Van Mitra\n(Volunteer)', '/app/volunteer'], [Bug, 'SARPA\n(Snake Support)', '/app/sarpa'], [BookOpen, 'Learn\n& Stay Safe', '/app/education'], [Trophy, 'Achievements\n& Leaderboard', '/app/achievements'],
] as const;
const species = [['ROYAL BENGAL TIGER', 'Panthera tigris tigris', 'A flagship species of the Sundarbans and a symbol of a healthy mangrove ecosystem.'], ['ESTUARINE CROCODILE', 'Crocodylus porosus', 'The largest living reptile, patrolling the tidal creeks of the delta.'], ['INDIAN COBRA', 'Naja naja', 'A widespread venomous snake — keep distance and call SARPA support.'], ['ASIAN ELEPHANT', 'Elephas maximus', 'Seasonal herds raid crops near forest edges; use early warnings.']];

export default function HomeView() {
  const [i, setI] = useState(0);
  const sp = species[i];
  const reports = useStore((s) => s.reports.filter((r) => !r.withdrawn).length);
  const vols = useStore((s) => s.users.filter((u) => u.role === 'approved_volunteer').length);
  const speciesN = useStore((s) => new Set(s.reports.map((r) => r.animal)).size);
  return (
    <div className="space-y-5 px-4 pb-8 sm:px-8">
      <section className="relative -mx-4 overflow-hidden px-4 pb-8 pt-6 sm:-mx-8 sm:px-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-full sm:w-[68%] lg:right-[310px] lg:w-[50%]" style={{ background: 'url(/img/hero-tiger.jpg) right center/auto 100% no-repeat', WebkitMaskImage: 'linear-gradient(90deg,transparent 0,#000 45%)', maskImage: 'linear-gradient(90deg,transparent 0,#000 45%)', opacity: 0.9 }} />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07170d]" />
        <div className="relative mx-auto grid max-w-[1400px] gap-6 lg:grid-cols-[1fr_340px] lg:items-center">
          <div className="max-w-[620px] py-6">
            <span className="mb-4 flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-[var(--nf-lime)]" />Sundarbans, West Bengal</span>
            <h1 className="nf-title text-[44px] leading-[1.02] sm:text-[58px]">Bridging<br />Communities &amp; <em>Wildlife</em></h1>
            <p className="mt-4 max-w-[430px] text-[19px] leading-snug text-[#e4f2dc]">A people–wildlife coexistence platform for reporting, responding and reducing wildlife conflicts in the Sundarbans.</p>
            <div className="mt-7 flex flex-wrap gap-4"><Link to="/app/report" className="nf-btn !rounded-2xl !px-6 !py-3.5 !text-[16px]"><Megaphone className="h-5 w-5" />Report a Conflict<ChevronRight className="h-4 w-4" /></Link>
              <Link to="/app/sos" className="nf-btn ghost !rounded-2xl !border-white/70 !px-6 !py-3.5 !text-[16px] !font-semibold"><span className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-white text-[9px] font-extrabold">SOS</span>SOS Emergency</Link></div>
          </div>
          <aside className="nf-panel !rounded-3xl !bg-black/45 p-6" aria-live="polite"><div className="text-[13px] font-semibold tracking-[.14em]">{sp[0]}</div><div className="mt-1 text-[15px] italic text-[#d4e4cc]">{sp[1]}</div><div className="my-3 h-[3px] w-10 rounded bg-[var(--nf-lime)]" /><p className="min-h-[86px] text-[16px] leading-snug">{sp[2]}</p>
            <div className="mt-3 flex items-center justify-between"><span className="flex gap-1.5">{species.map((_, k) => <i key={k} className={`h-1.5 w-1.5 rounded-full ${k === i ? 'bg-white' : 'bg-white/40'}`} />)}</span>
              <span className="flex gap-2"><button aria-label="Previous species" onClick={() => setI((i + species.length - 1) % species.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Next species" onClick={() => setI((i + 1) % species.length)} className="flex h-9 w-9 items-center justify-center rounded-full border border-white/50"><ChevronRight className="h-4 w-4" /></button></span></div></aside>
        </div>
      </section>

      <nav className="nf-panel mx-auto grid max-w-[1400px] grid-cols-2 divide-white/10 py-4 sm:grid-cols-4 lg:grid-cols-8 lg:divide-x" aria-label="Features">
        {features.map(([I, t, to]) => <Link key={to} to={to} className="flex flex-col items-center gap-1.5 px-2 py-2 text-center text-[13.5px] leading-tight hover:text-[var(--nf-lime)]"><I className="h-7 w-7 text-[var(--nf-lime)]" /><span className="whitespace-pre-line">{t}</span></Link>)}
      </nav>

      <div className="mx-auto grid max-w-[1400px] gap-5 lg:grid-cols-2">
        <section className="relative min-h-[260px] overflow-hidden rounded-3xl border border-[var(--nf-line)]" style={{ background: 'url(/img/sundarbans-aerial.jpg) right center/auto 100% no-repeat, #0b2a14' }}>
          <div className="relative max-w-[400px] p-7"><div className="text-[12px] tracking-[.2em] text-[#cfe3c4]">FOCUS REGION</div><h2 className="mt-1 text-[32px] font-extrabold">The Sundarbans</h2><p className="mt-3 text-[16px] leading-snug text-[#e4f2dc]">A unique mangrove ecosystem, home to the Royal Bengal Tiger and diverse wildlife, where people and nature live close together.</p>
            <Link to="/app/map" className="nf-btn ghost mt-5 !rounded-full !border-white/70 !px-5 !font-semibold">Explore the Region <ArrowRight className="h-4 w-4" /></Link></div></section>
        <section className="nf-panel hl grid min-h-[260px] gap-4 !rounded-3xl p-4 sm:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[200px] overflow-hidden rounded-2xl" style={{ background: 'url(/img/sundarbans-map.jpg) center/cover' }}>
            {[['14%', '66%'], ['35%', '36%'], ['62%', '12%'], ['72%', '42%'], ['40%', '84%']].map(([l, t], k) => <span key={k} className="absolute" style={{ left: l, top: t }}><i className="nf-pulse absolute -inset-3 rounded-full bg-red-500/50" /><i className="relative block h-3.5 w-3.5 rounded-full border-2 border-white bg-red-600" /></span>)}</div>
          <div className="flex flex-col justify-center"><div className="text-[12.5px] tracking-[.14em]">LIVE INSIGHTS <span className="tracking-normal text-[#cfe3c4]">(DEMO)</span></div>
            <div className="mt-3 grid grid-cols-3 divide-x divide-white/20 text-center">{[[reports, 'Reports'], [vols, 'Volunteers'], [speciesN, 'Species']].map(([v, l]) => <div key={l}><b className="block text-[28px]">{v}</b><span className="text-[14px]">{l}</span></div>)}</div>
            <Link to="/app/map" className="nf-btn mt-5 !rounded-2xl !py-3.5 !text-[15px]">View Hotspot Map <ArrowRight className="h-4 w-4" /></Link></div></section>
      </div>
      <p className="mx-auto max-w-[1400px] text-center text-xs text-[var(--muted)]">Demonstration build · figures are sample data · <Link to="/privacy" className="underline">Privacy</Link> · <Link to="/terms" className="underline">Terms</Link> · <Link to="/official/login" className="underline">Forest official portal</Link></p>
    </div>
  );
}
