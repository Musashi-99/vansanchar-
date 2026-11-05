import { useEffect, useRef, useState } from 'react';
import { Send, Bot, Square, RotateCcw, Trash2, AlertTriangle, Volume2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { KB } from '../../lib/seed';
import { Button, DemoNote, Badge } from '../../components/ui';
import { cn, uid } from '../../lib/utils';
import type { ChatMsg } from '../../lib/types';

const QUICK = ['Tiger spotted near village', 'Elephant entered farmland', 'Snakebite emergency', 'Nearest hospital', 'Forest officer help', 'Wildlife safety tips', 'How to use SOS', 'Emergency evacuation help'];
const URGENT = /(bitten|snakebite|attack|attacked|injur|bleeding|trapped|dying|emergency)/i;

function retrieve(q: string) {
  const words = q.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  return KB.map((d) => ({ d, s: d.keywords.reduce((a, k) => a + (words.some((w) => k.includes(w) || w.includes(k)) ? 2 : 0), 0) + words.filter((w) => d.text.toLowerCase().includes(w)).length * 0.3 }))
    .filter((x) => x.s > 0.5).sort((a, b) => b.s - a.s).slice(0, 2).map((x) => x.d);
}

export default function Assistant() {
  const { user, chat, addChat, clearChat } = useStore();
  const [input, setInput] = useState(''); const [typing, setTyping] = useState(false);
  const stop = useRef(false); const end = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState('');
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [chat, live]);

  const ask = async (text: string) => {
    if (!text.trim() || typing) return;
    addChat({ id: uid('m'), role: 'user', text });
    setInput(''); setTyping(true); stop.current = false;
    const docs = retrieve(text);
    const urgent = URGENT.test(text);
    let ans = docs.length ? docs.map((d) => d.text).join('\n\n') : 'I could not find reviewed guidance for that. For safety questions please read the Education section, or contact your forest office. I cannot contact anyone on your behalf.';
    if (urgent) ans = `If someone is in danger right now: call 112 (all services) or 108 (ambulance) and use the SOS button. I cannot call or dispatch anyone for you.\n\n` + ans;
    const sources = docs.map((d) => ({ id: d.id, title: d.title }));
    // simulated streaming of a local answer
    const words = ans.split(' '); let out = '';
    for (const w of words) { if (stop.current) break; out += (out ? ' ' : '') + w; setLive(out); await new Promise((r) => setTimeout(r, 22)); }
    addChat({ id: uid('m'), role: 'assistant', text: out + (stop.current ? ' …(stopped)' : ''), sources, emergency: urgent });
    setLive(''); setTyping(false);
  };
  const speak = (t: string) => { if ('speechSynthesis' in window) { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(t)); } };
  const retry = () => { const last = [...chat].reverse().find((m: ChatMsg) => m.role === 'user'); if (last) ask(last.text); };

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[420px] flex-col gap-2">
      <div className="flex items-center gap-2"><Bot className="h-6 w-6 text-indigo-600" /><h1 className="text-xl font-bold">AI Assistant</h1><Badge className="bg-purple-100 text-purple-800">Local demo</Badge></div>
      <DemoNote>Answers come from a small <b>local reviewed knowledge base</b>, not live Gemini. It is not an emergency service and gives no medical diagnosis.</DemoNote>
      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl2 border border-line bg-card/60 p-3">
        <div className="max-w-[88%] rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm">Hello {user?.name.split(' ')[0]}, how may I help you today?</div>
        <div className="flex flex-wrap gap-1.5">{QUICK.map((q) => <button key={q} onClick={() => ask(q)} className="rounded-full border border-line bg-card px-3 py-1.5 text-xs hover:bg-secondary">{q}</button>)}</div>
        {chat.map((m) => (
          <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
            <div className={cn('max-w-[88%] whitespace-pre-wrap break-words rounded-2xl p-3 text-sm', m.role === 'user' ? 'rounded-tr-sm bg-primary text-primary-fg' : 'rounded-tl-sm bg-secondary')}>
              {m.emergency && <div className="mb-2 flex items-center gap-1 text-xs font-bold text-red-700"><AlertTriangle className="h-3.5 w-3.5" />Possible emergency</div>}
              {m.text}
              {m.sources && m.sources.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{m.sources.map((s) => <Badge key={s.id} className="bg-white/60 text-fg">Source: {s.title}</Badge>)}</div>}
              {m.role === 'assistant' && <button onClick={() => speak(m.text)} className="mt-1 flex items-center gap-1 text-xs opacity-70" aria-label="Read aloud"><Volume2 className="h-3.5 w-3.5" />Read aloud</button>}
            </div>
          </div>
        ))}
        {typing && <div className="flex justify-start"><div className="max-w-[88%] whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-secondary p-3 text-sm">{live || '…'}</div></div>}
        <div ref={end} />
      </div>
      <div className="flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && ask(input)} placeholder="Ask a wildlife safety question" aria-label="Message" className="h-11 min-w-0 flex-1 rounded-xl2 border border-line bg-input px-3" maxLength={300} />
        {typing ? <Button variant="danger" onClick={() => { stop.current = true; }} aria-label="Stop"><Square className="h-4 w-4" /></Button> : <Button onClick={() => ask(input)} aria-label="Send"><Send className="h-4 w-4" /></Button>}
      </div>
      <div className="flex gap-3 text-xs text-muted"><button onClick={retry} className="flex items-center gap-1"><RotateCcw className="h-3 w-3" />Retry</button><button onClick={clearChat} className="flex items-center gap-1"><Trash2 className="h-3 w-3" />Clear history</button></div>
    </div>
  );
}
