import { Link, useParams } from 'react-router-dom';
import { BadgeCheck, XCircle } from 'lucide-react';
import { useStore } from '../../lib/store';
import { fmtDay } from '../../lib/utils';

export default function Verify() {
  const { code } = useParams();
  const c = useStore((s) => s.certs.find((x) => x.code === code));
  return (
    <div className="mesh flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 text-center shadow">
        {!c ? <><XCircle className="mx-auto h-12 w-12 text-red-600" /><h1 className="mt-2 text-xl font-bold">Certificate not found</h1></>
          : c.revoked ? <><XCircle className="mx-auto h-12 w-12 text-red-600" /><h1 className="mt-2 text-xl font-bold">Revoked</h1><p className="text-sm text-muted">{c.number} - {c.revoked}</p></>
          : <><BadgeCheck className="mx-auto h-12 w-12 text-green-600" /><h1 className="mt-2 text-xl font-bold">Valid certificate</h1><p className="mt-1 text-sm">{c.number}</p><p className="text-sm text-muted">{c.recipient} · {c.category}</p><p className="text-xs text-muted">Issued {fmtDay(c.issuedAt)} by {c.issuedBy}</p></>}
        <p className="mt-3 text-xs text-muted">Demo verification page: checks only this browser&apos;s demo data.</p>
        <Link to="/" className="mt-4 inline-block text-sm text-primary underline">Home</Link>
      </div>
    </div>
  );
}
