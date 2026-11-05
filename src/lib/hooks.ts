import { useCallback, useEffect, useState } from 'react';
import { create } from 'zustand';
import { useStore } from './store';
import type { GeoPoint } from './types';
import { nearestPlace } from './utils';

export const useUI = create<{ reportOpen: boolean; sosOpen: boolean; moreOpen: boolean; set: (p: Partial<{ reportOpen: boolean; sosOpen: boolean; moreOpen: boolean }>) => void }>((set) => ({
  reportOpen: false, sosOpen: false, moreOpen: false, set: (p) => set(p),
}));

export function useOnline() {
  const demoOffline = useStore((s) => s.demoOffline);
  const [net, setNet] = useState(navigator.onLine);
  useEffect(() => {
    const on = () => setNet(true), off = () => setNet(false);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  return net && !demoOffline;
}

export interface GeoState { point?: GeoPoint; loading: boolean; error?: string; stale: boolean }
export function useGeolocation() {
  const [st, setSt] = useState<GeoState>({ loading: false, stale: false });
  const request = useCallback(() => {
    if (!('geolocation' in navigator)) { setSt({ loading: false, stale: false, error: 'GPS is not supported on this device.' }); return; }
    setSt((s) => ({ ...s, loading: true, error: undefined }));
    navigator.geolocation.getCurrentPosition(
      (p) => {
        const near = nearestPlace(p.coords.latitude, p.coords.longitude);
        setSt({ loading: false, stale: false, point: { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: Math.round(p.coords.accuracy), capturedAt: new Date(p.timestamp).toISOString(), label: near.distance < 60 ? `Near ${near.name}` : 'Outside Sundarbans demo region' } });
      },
      (e) => setSt({ loading: false, stale: false, error: e.code === 1 ? 'Location permission denied. Describe the place manually instead.' : 'Could not get a GPS fix. Try again or describe the place manually.' }),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }, []);
  // flag a fix as stale after 2 minutes
  useEffect(() => {
    if (!st.point?.capturedAt) return;
    const t = setInterval(() => setSt((s) => ({ ...s, stale: !!s.point?.capturedAt && Date.now() - new Date(s.point.capturedAt).getTime() > 120000 })), 15000);
    return () => clearInterval(t);
  }, [st.point?.capturedAt]);
  return { ...st, request };
}

export function useInstallPrompt() {
  const [evt, setEvt] = useState<Event & { prompt?: () => Promise<void> } | null>(null);
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setEvt(e as never); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);
  return { canInstall: !!evt, install: async () => { await evt?.prompt?.(); setEvt(null); } };
}
