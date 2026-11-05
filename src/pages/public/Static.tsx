import { Link } from 'react-router-dom';
import { ArrowLeft, WifiOff } from 'lucide-react';
import { Logo } from '../../components/Layouts';

const C = {
  privacy: { t: 'Privacy', p: ['VanSanchar collects only what is needed to report and respond to wildlife conflict: your name, phone number, optional medical/emergency details and location when you choose to share it.', 'Exact wildlife locations are never shown publicly. The public map uses generalised, verified incidents only.', 'You can edit your profile, withdraw a pending report, and request deletion of personal data. Emergency records may be retained where policy requires.', 'Demo build: data stays in your browser (localStorage / IndexedDB). Nothing is sent to a server. This text is not legal advice or a compliance certification.'] },
  terms: { t: 'Terms of use', p: ['Use SOS only for genuine emergencies. False or malicious reports may be reviewed by officials; there are no automatic penalties.', 'Rewards are given for verified contributions only and are subject to program approval. No cash benefit is promised.', 'VanSanchar is not an emergency service. In immediate danger call 112. This demo does not imply government endorsement or live dispatch.'] },
  help: { t: 'Help', p: ['To report: tap the green + button, add a photo, voice note and location, choose the animal (or Unknown) and submit.', 'To send SOS: tap the red SOS button, confirm, and wait for the 3-second countdown. You can cancel during the countdown.', 'Offline: reports and SOS are saved on your device and sent when you reconnect. SOS offline shows Not sent. Use the call buttons.', 'Browsers cannot notify a powered-off device, and background sync is not supported everywhere. Open the app to sync.'] },
  offline: { t: 'You are offline', p: ['The app shell and downloaded guides still work. Reports and SOS are saved locally and will sync when you reconnect.', 'Emergency numbers: 112 (all services), 108 (ambulance), 1070 (disaster management).'] },
} as const;

export default function Static({ kind }: { kind: keyof typeof C }) {
  const c = C[kind];
  return (
    <div className="mesh min-h-dvh">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between"><Logo size={34} /><Link to="/" className="flex items-center gap-1 text-sm text-primary"><ArrowLeft className="h-4 w-4" />Back</Link></div>
        <div className="rounded-2xl border border-line bg-card p-5">
          {kind === 'offline' && <WifiOff className="mb-2 h-10 w-10 text-amber-600" />}
          <h1 className="mb-3 text-2xl font-bold">{c.t}</h1>
          <div className="space-y-3 text-sm leading-relaxed">{c.p.map((x) => <p key={x}>{x}</p>)}</div>
        </div>
      </div>
    </div>
  );
}
