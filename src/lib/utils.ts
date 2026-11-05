import type { Animal, Severity, ReportStatus, Report } from './types';

export const cn = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(' ');

export const PLACES: Record<string, { lat: number; lng: number }> = {
  Gosaba: { lat: 22.1587, lng: 88.8523 }, Sajnekhali: { lat: 22.1, lng: 88.83 }, Basanti: { lat: 22.17, lng: 88.67 },
  Canning: { lat: 22.315, lng: 88.665 }, Namkhana: { lat: 21.766, lng: 88.237 }, Jharkhali: { lat: 21.99, lng: 88.69 },
  Kultali: { lat: 22.0, lng: 88.53 }, Patharpratima: { lat: 21.8, lng: 88.33 }, Dayapur: { lat: 22.08, lng: 88.74 },
  Satjelia: { lat: 22.07, lng: 88.83 }, 'Bali Island': { lat: 22.09, lng: 88.72 }, Piyali: { lat: 22.19, lng: 88.58 },
};
export const PLACE_NAMES = Object.keys(PLACES);
export const CENTER: [number, number] = [22.1587, 88.8523];

export const ANIMALS: Record<Animal, string> = {
  tiger: 'Tiger', elephant: 'Elephant', leopard: 'Leopard', crocodile: 'Crocodile', snake: 'Snake',
  bear: 'Bear', boar: 'Wild Boar', other: 'Other', unknown: 'Unknown / Not Sure',
};
export const SEVERITIES: Severity[] = ['low', 'medium', 'high', 'critical'];
export const SEV_STYLE: Record<Severity, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
};
export const SEV_HEX: Record<Severity, string> = { low: '#16a34a', medium: '#d97706', high: '#ea580c', critical: '#dc2626' };
export const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  under_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  verified: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-200',
  resolved: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
};
export const label = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export const TRANSITIONS: Record<ReportStatus, ReportStatus[]> = {
  pending: ['under_review', 'verified', 'rejected'],
  under_review: ['verified', 'rejected'],
  verified: ['resolved'],
  rejected: [],
  resolved: [],
};

export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371, rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
export const km = (n: number) => (n < 10 ? n.toFixed(1) : Math.round(n)) + ' km';

export function nearestPlace(lat: number, lng: number) {
  let best = 'Gosaba', d = Infinity;
  for (const [n, p] of Object.entries(PLACES)) { const x = haversine({ lat, lng }, p); if (x < d) { d = x; best = n; } }
  return { name: best, distance: d };
}

/** Public projection: strips reporter identity and generalises coordinates (~1.1 km grid) */
export function publicIncident(r: Report) {
  const g = (n: number) => Math.round(n * 100) / 100;
  return {
    id: r.id, animal: r.animal, severity: r.severity, status: r.status, verified: r.status === 'verified' || r.status === 'resolved',
    lat: g(r.location.lat), lng: g(r.location.lng), area: nearestPlace(r.location.lat, r.location.lng).name,
    at: r.submittedAt, photo: r.photo,
  };
}

const TZ = 'Asia/Kolkata';
export const fmtDate = (iso: string, lang = 'en-IN') =>
  new Date(iso).toLocaleString(lang, { timeZone: TZ, day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
export const fmtDay = (iso: string, lang = 'en-IN') => new Date(iso).toLocaleDateString(lang, { timeZone: TZ, day: 'numeric', month: 'short', year: 'numeric' });
export function ago(iso: string) {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}
export const inr = (n: number) => new Intl.NumberFormat('en-IN').format(n);
export const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
export const uid = (p = 'id') => `${p}_${Math.random().toString(36).slice(2, 9)}${Date.now().toString(36).slice(-3)}`;

export function normalizeIndianPhone(input: string): string | null {
  const d = input.replace(/[\s\-()]/g, '').replace(/^\+?91/, '').replace(/^0/, '');
  return /^[6-9]\d{9}$/.test(d) ? `+91${d}` : null;
}

export async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** CSV with quote escaping, formula-injection guard and UTF-8 BOM */
export function toCSV(rows: Record<string, unknown>[]) {
  if (!rows.length) return '';
  const heads = Object.keys(rows[0]);
  const esc = (v: unknown) => {
    let s = v == null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  };
  return [heads.join(','), ...rows.map((r) => heads.map((h) => esc(r[h])).join(','))].join('\n');
}
export function download(name: string, content: string | Blob, type = 'text/csv;charset=utf-8') {
  const blob = content instanceof Blob ? content : new Blob(['﻿', content], { type });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
export const stamp = () => new Date().toISOString().slice(0, 10);

/** Validate image by magic bytes, then re-encode to compressed JPEG (strips EXIF) */
export async function processImage(file: File, maxDim = 900): Promise<string> {
  if (file.size > 10 * 1024 * 1024) throw new Error('Image is larger than 10 MB.');
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  const hex = Array.from(head).map((b) => b.toString(16).padStart(2, '0')).join('');
  const ok = hex.startsWith('ffd8ff') || hex.startsWith('89504e47') || hex.startsWith('52494646') || hex.startsWith('47494638');
  if (!ok) throw new Error('Only JPEG, PNG, WebP or GIF images are allowed.');
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('Could not read image.')); i.src = url; });
    const s = Math.min(1, maxDim / Math.max(img.width, img.height));
    const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.72);
  } finally { URL.revokeObjectURL(url); }
}
