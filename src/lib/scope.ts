import { useMemo } from 'react';
import { useStore, VERIFIER_ROLES } from './store';

/** Reports an official may see: DFO / admin see all, others only their own jurisdiction (enforced client-side in this demo). */
export function useScoped() {
  const user = useStore((s) => s.user);
  const reports = useStore((s) => s.reports);
  const sos = useStore((s) => s.sos);
  return useMemo(() => {
    const all = user?.role === 'dfo' || user?.role === 'platform_admin';
    const mineR = reports.filter((r) => all || r.jurisdiction === user?.jurisdiction);
    const mineS = sos.filter((x) => all || true); // SOS visible to all on-duty officials in demo
    return { reports: mineR, sos: mineS, canVerify: !!user && VERIFIER_ROLES.includes(user.role), user };
  }, [user, reports, sos]);
}

export const REJECT_REASONS = ['Insufficient evidence', 'Duplicate', 'Wrong location', 'Incorrect species', 'Stale image', 'Misleading/false report', 'Other'];
export const CHECKLIST = [
  ['photo', 'Photo authenticity / context'], ['species', 'Species plausibility'], ['gps', 'GPS-location consistency'],
  ['time', 'Timestamp freshness'], ['corroboration', 'Nearby corroborating reports'], ['callback', 'Reporter callback done'], ['duplicate', 'Checked for duplicates'],
] as const;
