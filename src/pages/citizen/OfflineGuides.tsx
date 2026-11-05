import { useEffect, useState } from 'react';
import { Download, Trash2, CheckCircle2, FileDown, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../../lib/store';
import { SEED_EDU } from '../../lib/seed';
import { Button, Card, Progress, Badge, DemoNote } from '../../components/ui';
import { idbPut, idbDel, idbGet } from '../../lib/idb';
import { download, fmtDay } from '../../lib/utils';

function guideText(g: (typeof SEED_EDU)[number]) {
  return `VanSanchar offline guide: ${g.title}\nVersion ${g.version} · Reviewed ${g.reviewed} (${g.reviewer})\n\n${g.summary}\n\n${(g.steps ?? []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nIn immediate danger call 112 (all services) or 108 (ambulance).`;
}

export function GuideReader({ id, onClose }: { id: string; onClose: () => void }) {
  const [txt, setTxt] = useState('Loading…');
  useEffect(() => { idbGet<{ key: string; text: string }>('educationDownloads', id).then((r) => setTxt(r?.text ?? 'Not downloaded')).catch(() => setTxt('Storage unavailable')); }, [id]);
  return <div><pre className="whitespace-pre-wrap break-words rounded-xl2 bg-input p-3 text-sm">{txt}</pre><Button full className="mt-3" onClick={onClose}>Close</Button></div>;
}

export default function OfflineGuides() {
  const { downloads, setDownload, contacts } = useStore();
  const guides = SEED_EDU.filter((g) => g.steps || g.type === 'safety');
  const [busy, setBusy] = useState<string>();
  const [pct, setPct] = useState(0);
  const [read, setRead] = useState<string>();

  const get = async (g: (typeof guides)[number]) => {
    setBusy(g.id); setPct(0);
    try {
      const text = guideText(g);
      for (let i = 1; i <= 5; i++) { await new Promise((r) => setTimeout(r, 90)); setPct(i * 20); } // chunked progress for the local write
      await idbPut('educationDownloads', { key: g.id, text, version: g.version });
      const size = new Blob([text]).size;
      setDownload(g.id, { size, at: new Date().toISOString(), version: g.version });
      toast.success(`${g.title} saved for offline use`); // only after the write completed
    } catch { toast.error('Could not save: storage unavailable or full.'); } finally { setBusy(undefined); }
  };
  const remove = async (id: string) => { await idbDel('educationDownloads', id); setDownload(id, null); toast.success('Removed from this device'); };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Offline guides</h2>
      <DemoNote>Guides are stored in your browser (IndexedDB) so they open without internet. Content is sample text, not a clinically reviewed protocol.</DemoNote>
      <Card className="!bg-red-50 dark:!bg-red-950/30">
        <div className="mb-2 font-semibold text-red-800 dark:text-red-200">Emergency card (always available)</div>
        <div className="flex flex-wrap gap-2">{contacts.slice(0, 4).map((c) => <a key={c.id} href={`tel:${c.phone}`} className="inline-flex h-10 items-center gap-1 rounded-xl2 bg-red-600 px-3 text-sm font-medium text-white"><Phone className="h-4 w-4" />{c.phone}</a>)}</div>
        <p className="mt-2 text-xs">Tiger: do not run, back away slowly. Snakebite: keep still, go to hospital, no cutting or tourniquet. Crocodile: stay away from the water edge.</p>
      </Card>
      {guides.map((g) => {
        const d = downloads[g.id]; const updated = d && d.version !== g.version;
        return (
          <Card key={g.id} className="!p-3">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1"><div className="font-medium">{g.title}</div><div className="text-xs text-muted">v{g.version} · reviewed {fmtDay(g.reviewed)} · ~{Math.ceil(new Blob([guideText(g)]).size / 1024)} KB</div>
                {d && <Badge className="mt-1 bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3" />On this device{updated ? ' · update available' : ''}</Badge>}</div>
              <div className="flex shrink-0 flex-col gap-1.5">
                {!d ? <Button size="sm" onClick={() => get(g)} loading={busy === g.id}><Download className="h-4 w-4" />Get</Button> : <>
                  <Button size="sm" variant="soft" onClick={() => setRead(g.id)}>Open</Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(g.id)} aria-label="Remove download"><Trash2 className="h-4 w-4" /></Button></>}
              </div>
            </div>
            {busy === g.id && <Progress value={pct} className="mt-2" />}
            <button className="mt-2 flex items-center gap-1 text-xs text-primary underline" onClick={() => download(`${g.id}-guide.txt`, guideText(g), 'text/plain;charset=utf-8')}><FileDown className="h-3.5 w-3.5" />Save as text file</button>
          </Card>
        );
      })}
      {read && <div className="fixed inset-0 z-[2000] flex items-end justify-center bg-black/50 sm:items-center" onClick={() => setRead(undefined)}><div className="max-h-[85dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-card p-4 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}><GuideReader id={read} onClose={() => setRead(undefined)} /></div></div>}
    </div>
  );
}
