import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { ScanSearch, ImagePlus, Upload, Camera, Video, Clock, ChevronRight, Check, PawPrint, ShieldAlert, TriangleAlert, PersonStanding, Ban, Users, Smartphone, BookOpen, ArrowRight, Layers, Trees } from 'lucide-react';
import CitizenHero from './CitizenHero';
import { Panel, ViewAll, Meter, img } from '../kit';
import { processImage } from '../../lib/utils';

const species = [['Royal Bengal Tiger', 'sp-tiger.jpg'], ['Estuarine Crocodile', 'sp-croc.jpg'], ['Snake\n(Multiple Species)', 'sp-snake.jpg'], ['Wild Boar', 'sp-boar.jpg'], ['Elephant', 'sp-elephant.jpg'], ['Leopard', 'sp-leopard.jpg'], ['Bear\n(Sloth Bear)', 'sp-bear.jpg']] as const;
const recent = [['sp-tiger.jpg', 'Royal Bengal Tiger', '97.6%', '2 min ago'], ['sp-croc.jpg', 'Estuarine Crocodile', '96.2%', '18 min ago'], ['sp-snake.jpg', 'Indian Cobra', '95.1%', '1 hour ago']] as const;

export default function AiDetectPage() {
  const file = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<string>();
  const [drag, setDrag] = useState(false);
  const pick = async (f?: File) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) { toast.info('Video analysis is available in the field app. Please upload a JPG, PNG or WEBP photo.'); return; }
    try { setPhoto(await processImage(f)); toast.success('Photo analysed (demo result shown)'); } catch (e) { toast.error((e as Error).message); }
  };
  return (
    <>
      <CitizenHero title="AI Species" accent="Detection" icon={<ScanSearch />} sub="Identify wildlife from a photo or video and get instant safety advice." bg="banner-tiger.jpg" />
      <div className="mx-auto grid max-w-[1500px] gap-3 px-3 pb-8 sm:px-5 lg:grid-cols-[365px_1fr]">
        <div className="space-y-3 min-w-0">
          <Panel className="p-4"><input ref={file} type="file" accept="image/*,video/*" hidden onChange={(e) => pick(e.target.files?.[0])} />
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }} className={`flex min-h-[340px] flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 text-center ${drag ? 'border-[var(--nf-lime)] bg-[#17391f]/50' : 'border-[#7fb36a]'}`}>
              <ImagePlus className="h-16 w-16" strokeWidth={1.3} /><h3 className="mt-3 text-[20px] font-bold">Upload Photo or Video</h3><p className="mt-2 text-[14.5px] leading-snug">Drag &amp; drop an image/video here<br />or click to browse</p>
              <button onClick={() => file.current?.click()} className="nf-btn mt-4 !rounded-xl !px-8 !py-3"><Upload className="h-4 w-4" />Choose File</button><p className="mt-4 text-[13px] leading-snug">Supports: JPG, PNG, WEBP, MP4<br />(Max 20 MB)</p></div>
            <div className="mt-3 grid grid-cols-2 gap-2"><button onClick={() => file.current?.click()} className="nf-btn ghost !rounded-xl !py-3"><Camera className="h-4 w-4" />Use Camera</button><button onClick={() => file.current?.click()} className="nf-btn ghost !rounded-xl !py-3"><Video className="h-4 w-4" />Record Video</button></div></Panel>
          <Panel className="p-4"><div className="mb-2 flex items-center justify-between"><h3 className="flex items-center gap-2 text-[17px] font-bold"><Clock className="h-5 w-5 text-[var(--nf-lime)]" />Recent Detections</h3><ViewAll /></div>
            <ul className="divide-y divide-white/10">{recent.map(([im, n, c, w]) => <li key={n} className="flex items-center gap-3 py-2.5"><img src={img(im)} alt="" className="h-[50px] w-[68px] shrink-0 rounded-lg object-cover" /><span className="min-w-0 flex-1 leading-tight"><b className="block text-[15px]">{n}</b><span className="flex items-center gap-1.5 text-[12.5px]"><i className="h-2 w-2 rounded-full bg-[#58e05b]" />{c} • {w}</span></span><ChevronRight className="h-4 w-4" /></li>)}</ul></Panel>
        </div>

        <div className="space-y-3 min-w-0">
          <div className="grid gap-3 xl:grid-cols-[1.9fr_1fr]">
            <Panel className="grid gap-4 p-4 md:grid-cols-[345px_1fr]">
              <div className="relative overflow-hidden rounded-xl"><img src={photo ?? img('detect-tiger.jpg')} alt="Uploaded wildlife photo with detection frame" className="h-[316px] w-full object-cover" />{['left-2 top-2 border-l-4 border-t-4', 'right-2 top-2 border-r-4 border-t-4', 'bottom-2 left-2 border-b-4 border-l-4', 'bottom-2 right-2 border-b-4 border-r-4'].map((c) => <i key={c} className={`absolute h-9 w-9 border-white ${c}`} />)}</div>
              <div className="min-w-0"><span className="inline-flex items-center gap-2 rounded-lg bg-[#1f6b1f] px-3 py-1.5 text-[13.5px] font-semibold"><Check className="h-4 w-4" />Detection Result</span>
                <h2 className="mt-3 text-[34px] font-extrabold leading-tight">Royal Bengal Tiger</h2><p className="italic text-[#d4e4cc]">Panthera tigris tigris</p>
                <div className="mt-3 text-[15px]">Confidence: <b>97.6%</b></div><Meter pct={97.6} h={9} className="mt-1.5" />
                <div className="mt-3 grid grid-cols-2 gap-2"><div className="flex items-center gap-2.5 rounded-xl bg-[#0f321a]/80 p-2.5"><PawPrint className="h-8 w-8 text-[var(--nf-lime)]" /><span className="leading-tight text-[13px]">Type<br /><b>Mammal</b></span></div><div className="flex items-center gap-2.5 rounded-xl bg-[#0f321a]/80 p-2.5"><ShieldAlert className="h-8 w-8 text-[#ff5a5a]" /><span className="leading-tight text-[13px]">Status (IUCN)<br /><b className="rounded bg-[#b5252b] px-1.5">Endangered</b></span></div></div>
                <div className="mt-2 flex items-center gap-2.5 rounded-xl bg-[#0f321a]/80 p-2.5"><Trees className="h-8 w-8 text-[var(--nf-lime)]" /><span className="leading-tight text-[13px]">Habitat<br /><b>Sundarbans, mangroves, riverine forests</b></span></div></div></Panel>
            <Panel className="p-4"><h3 className="mb-2 flex items-center gap-2 text-[20px] font-bold"><TriangleAlert className="h-6 w-6 text-[#ffc21a]" fill="currentColor" fillOpacity={0.3} />Safety Advice</h3>
              <ul className="divide-y divide-white/10">{[[PersonStanding, 'Maintain a safe distance (≥ 100 m).'], [Ban, 'Do not chase, corner, or try to photograph closely.'], [Users, 'Move to a safe and populated area immediately.'], [Smartphone, 'Report the sighting to the forest department via VanSanchar.']].map(([I, t]) => { const Ic = I as typeof Ban; return <li key={t as string} className="flex items-center gap-3 py-3 text-[14.5px] leading-snug"><Ic className={`h-8 w-8 shrink-0 ${(t as string).startsWith('Do not') ? 'text-[#ff4040]' : 'text-[var(--nf-lime)]'}`} strokeWidth={1.6} />{t as string}</li>; })}</ul></Panel>
          </div>
          <Panel className="flex flex-wrap items-center gap-4 p-4"><BookOpen className="h-9 w-9 shrink-0 text-[var(--nf-lime)]" /><div className="min-w-0 flex-1 basis-[300px]"><h3 className="text-[16px] font-bold">About the Species</h3><p className="text-[14px] leading-snug">The Royal Bengal Tiger is a flagship species of the Sundarbans. It plays a crucial role in maintaining the health of the mangrove ecosystem.</p></div><a href="/app/education" className="nf-btn ghost !rounded-xl !px-6">Learn More <ArrowRight className="h-4 w-4" /></a></Panel>
          <Panel className="p-4"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-[17px] font-bold"><Layers className="h-5 w-5" />Supported Species <span className="font-normal">(Sundarbans &amp; Region)</span></h3><span className="rounded-lg border border-[var(--nf-line)] bg-[#17391f] px-3 py-1 text-[12.5px] text-[#b9f26a]">Multiple Species Supported ✓</span></div>
            <div className="grid grid-cols-4 gap-3 md:grid-cols-8">{species.map(([n, im]) => <div key={n} className="text-center"><img src={img(im)} alt="" className="h-[84px] w-full rounded-xl border border-[var(--nf-line)] object-cover" /><span className="mt-1.5 block whitespace-pre-line text-[13px] leading-tight">{n}</span></div>)}<div className="flex h-[84px] flex-col items-center justify-center rounded-xl border border-[var(--nf-line)] text-center text-[13px] leading-tight"><b className="text-xl">•••</b>Other<br />Wildlife</div></div></Panel>
        </div>
      </div>
    </>
  );
}
