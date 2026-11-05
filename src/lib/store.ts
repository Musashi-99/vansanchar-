import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AppUser, Report, SOS, Notif, Team, Hospital, Contact, VolTask, VolAssignment, LedgerEntry, Cert, AuditLog, ScanResult, ChatMsg, ReportStatus, ResponseStatus, TimelineEvent, Role, Animal, Severity, GeoPoint, Drone, Mission, Hotspot } from './types';
import { SEED_REPORTS, SEED_SOS, SEED_TEAMS, SEED_HOSPITALS, SEED_CONTACTS, SEED_TASKS, SEED_NOTIFS, SEED_AUDIT, SEED_CERTS, SEED_USERS, DEMO_CITIZEN, SEED_DRONES, SEED_HOTSPOTS, SEED_MISSIONS } from './seed';
import { uid, sha256, TRANSITIONS, PLACES } from './utils';
import { idbPut, idbAll, idbDel, type QueueItem } from './idb';

export const VERIFIER_ROLES: Role[] = ['range_officer', 'deputy_ranger', 'dfo'];
export const LEVELS = [
  { name: 'Bronze', min: 0, perk: 'Default membership' },
  { name: 'Silver', min: 50, perk: 'Certificate eligibility' },
  { name: 'Gold', min: 250, perk: 'Certificate + approved goodies eligibility' },
  { name: 'Elite Gold', min: 550, perk: 'Certificate, goodies, incentive eligibility (subject to an approved program)' },
];
export const levelFor = (t: number) => [...LEVELS].reverse().find((l) => t >= l.min)!;

export interface NewReport {
  animal: Animal; severity: Severity; description: string; location: GeoPoint; occurredAt: string; photo?: string;
  hasVoice: boolean; voiceSeconds?: number; count?: number; direction?: string; injury?: boolean; damage?: boolean;
}

interface State {
  user: AppUser | null; theme: 'light' | 'dark'; lang: string; demoOffline: boolean; lastSync?: string;
  reports: Report[]; sos: SOS[]; notifs: Notif[]; teams: Team[]; hospitals: Hospital[]; contacts: Contact[];
  tasks: VolTask[]; assignments: VolAssignment[]; users: AppUser[]; ledger: LedgerEntry[]; certs: Cert[]; audit: AuditLog[];
  eduProgress: Record<string, { watched: number; completed: boolean }>; quizAttempts: { at: string; score: number; total: number; reward: number }[];
  scans: ScanResult[]; chat: ChatMsg[]; volApp: { status: 'none' | 'submitted' | 'training_required' | 'approved'; region?: string };
  flags: Record<string, boolean>; downloads: Record<string, { size: number; at: string; version: string }>;
  drones: Drone[]; missions: Mission[]; hotspots: Hotspot[];
  predictSub: boolean; pendingCount: number; installPrompt?: unknown;

  login: (u: AppUser) => void; logout: () => void; updateUser: (p: Partial<AppUser>) => void;
  setTheme: (t: 'light' | 'dark') => void; setLang: (l: string) => void; setDemoOffline: (b: boolean) => void;
  isOnline: () => boolean;
  submitReport: (r: NewReport) => Promise<{ id: string; queued: boolean }>;
  withdrawReport: (id: string) => void;
  syncNow: () => Promise<number>; refreshPending: () => Promise<void>;
  transition: (id: string, to: ReportStatus, opts?: { reason?: string; notes?: string; checklist?: Record<string, boolean> }) => { ok: boolean; error?: string };
  addNote: (id: string, note: string, isPublic?: boolean) => void;
  assignReport: (id: string, teamId: string) => void;
  createSOS: (p: { type: string; description: string; location: GeoPoint }) => Promise<SOS>;
  cancelSOS: (id: string) => void;
  sosAction: (id: string, a: 'acknowledge' | 'verify' | 'reject' | 'dispatch' | 'status' | 'resolve' | 'escalate', arg?: string) => void;
  markRead: (id?: string) => void; dismissNotif: (id: string) => void; pushNotif: (n: Omit<Notif, 'id' | 'createdAt' | 'read'>) => void;
  awardTokens: (amount: number, reason: string, sourceType: string, sourceId: string) => boolean;
  setEdu: (id: string, p: Partial<{ watched: number; completed: boolean }>) => void;
  addQuizAttempt: (score: number, total: number) => number;
  setDownload: (id: string, v: { size: number; at: string; version: string } | null) => void;
  applyVolunteer: (region: string) => void; completeTraining: () => void;
  acceptTask: (id: string) => { ok: boolean; error?: string }; progressAssignment: (id: string, s: VolAssignment['status'], notes?: string) => void;
  issueCert: (recipient: string, category: string, summary: string) => Cert; revokeCert: (id: string, reason: string) => void;
  addScan: (s: ScanResult) => void; deleteScan: (id: string) => void; addChat: (m: ChatMsg) => void; clearChat: () => void;
  setFlag: (k: string, v: boolean) => void; addAudit: (action: string, target: string, detail?: string) => void;
  updateHospital: (id: string, p: Partial<Hospital>) => void; updateContact: (id: string, p: Partial<Contact>) => void;
  setUserStatus: (uid: string, s: AppUser['status']) => void; setTeamAvail: (id: string, a: Team['availability']) => void;
  setPredictSub: (b: boolean) => void; resetDemo: () => void;
  addUser: (u: { name: string; phone?: string; email?: string; role: Role; region: string }) => AppUser;
  setUserRole: (uid: string, role: Role) => void; verifyUser: (uid: string) => void; removeUser: (uid: string) => void;
  addTeam: (name: string, jurisdiction: string, members: number) => void;
  broadcast: (title: string, body: string, audience: 'citizen' | 'official', severity?: Severity) => void;
  logActivity: (action: string, target: string, detail?: string) => void;
  setDrone: (id: string, p: Partial<Drone>) => void;
  addMission: (m: Omit<Mission, 'id'>) => Mission;
  addTask: (t: { title: string; place: string; urgency?: Severity }) => void;
}

const baseData = () => ({
  reports: SEED_REPORTS, sos: SEED_SOS, notifs: SEED_NOTIFS, teams: SEED_TEAMS, hospitals: SEED_HOSPITALS, contacts: SEED_CONTACTS,
  tasks: SEED_TASKS, assignments: [] as VolAssignment[], users: SEED_USERS, certs: SEED_CERTS, audit: SEED_AUDIT,
  drones: SEED_DRONES, missions: SEED_MISSIONS, hotspots: SEED_HOTSPOTS,
  ledger: [
    { id: 'l1', amount: 10, reason: 'Verified report VS-1013', sourceType: 'report', sourceId: 'VS-1013', at: new Date(Date.now() - 6 * 864e5).toISOString() },
    { id: 'l2', amount: 10, reason: 'Verified report VS-1022', sourceType: 'report', sourceId: 'VS-1022', at: new Date(Date.now() - 3 * 864e5).toISOString() },
    { id: 'l3', amount: 20, reason: 'Quiz completed: Wildlife Safety', sourceType: 'quiz', sourceId: 'seed-quiz', at: new Date(Date.now() - 2 * 864e5).toISOString() },
  ] as LedgerEntry[],
  eduProgress: {} as State['eduProgress'], quizAttempts: [] as State['quizAttempts'], scans: [] as ScanResult[], chat: [] as ChatMsg[],
  volApp: { status: 'none' as const }, downloads: {} as State['downloads'], predictSub: false,
  flags: { demoOtp: true, drones: true, voiceAlerts: false, stellar: true, push: false, translate: true, aiLive: false } as Record<string, boolean>,
});

const evt = (actor: string, to: string, from?: string, note?: string): TimelineEvent => ({ at: new Date().toISOString(), actor, from, to, note });
let reportSeq = 1100;
let sosSeq = 300;

export const useStore = create<State>()(
  persist(
    (set, get) => {
      const actorName = () => get().user?.name ?? 'System';
      const audit = (action: string, target: string, detail?: string) =>
        set((s) => ({ audit: [{ id: uid('a'), at: new Date().toISOString(), actor: actorName(), action, target, detail }, ...s.audit].slice(0, 300) }));
      const notify = (n: Omit<Notif, 'id' | 'createdAt' | 'read'>) =>
        set((s) => ({ notifs: [{ ...n, id: uid('n'), createdAt: new Date().toISOString(), read: false }, ...s.notifs].slice(0, 100) }));

      return {
        user: null, theme: 'light', lang: 'en', demoOffline: false, pendingCount: 0,
        ...baseData(),

        login: (u) => set({ user: u }),
        logout: () => set({ user: null }),
        updateUser: (p) => set((s) => (s.user ? { user: { ...s.user, ...p } } : {})),
        setTheme: (theme) => set({ theme }),
        setLang: (lang) => set((s) => ({ lang, user: s.user ? { ...s.user, language: lang } : s.user })),
        setDemoOffline: (demoOffline) => set({ demoOffline }),
        isOnline: () => navigator.onLine && !get().demoOffline,

        submitReport: async (r) => {
          const s = get(); const user = s.user ?? DEMO_CITIZEN;
          const mutationId = uid('mut');
          const online = s.isOnline();
          const id = online ? `VS-${++reportSeq + s.reports.length}` : `LOCAL-${mutationId.slice(-6).toUpperCase()}`;
          const now = new Date().toISOString();
          const report: Report = {
            id, clientMutationId: mutationId, reporterId: user.uid, reporterName: user.name, reporterPhone: user.phone ?? '',
            ...r, jurisdiction: 'Gosaba Range', submittedAt: now, status: 'pending', version: 1, syncStatus: online ? 'synced' : 'queued',
            events: [evt(user.name, 'pending', undefined, online ? 'Report submitted' : 'Saved on device; waiting for connection')],
          };
          if (!online) {
            const q: QueueItem = { key: mutationId, mutationId, ownerUid: user.uid, operation: 'create', entityType: 'report', localEntityId: id, payload: report, createdAt: now, status: 'queued', attempts: 0 };
            await idbPut('pendingMutations', q); // persist BEFORE saying "saved offline"
          }
          set((st) => ({ reports: [report, ...st.reports] }));
          if (online) notify({ type: 'report', title: `New report ${id}`, body: `${r.animal} - ${r.location.label}`, severity: r.severity, link: `/official/reports/${id}`, recipient: 'official' });
          get().refreshPending();
          return { id, queued: !online };
        },

        withdrawReport: (id) => {
          set((s) => ({ reports: s.reports.map((r) => (r.id === id && r.status === 'pending' ? { ...r, withdrawn: true, status: 'rejected' as const, rejectReason: 'Withdrawn by reporter', events: [...r.events, evt(actorName(), 'rejected', 'pending', 'Withdrawn by reporter')] } : r)) }));
          audit('report.withdraw', id);
        },

        refreshPending: async () => {
          try { const all = await idbAll<QueueItem>('pendingMutations'); set({ pendingCount: all.filter((q) => q.ownerUid === get().user?.uid).length }); } catch { /* IDB unavailable */ }
        },

        syncNow: async () => {
          const s = get();
          if (!s.isOnline() || !s.user) return 0;
          let all: QueueItem[] = [];
          try { all = await idbAll<QueueItem>('pendingMutations'); } catch { return 0; }
          const mine = all.filter((q) => q.ownerUid === s.user!.uid); // never upload another user's queue
          let n = 0;
          for (const q of mine) {
            if (q.entityType === 'report') {
              const cur = get().reports.find((r) => r.clientMutationId === q.mutationId);
              if (cur && cur.syncStatus === 'queued') {
                const newId = `VS-${++reportSeq + get().reports.length}`;
                set((st) => ({ reports: st.reports.map((r) => (r.clientMutationId === q.mutationId ? { ...r, id: newId, syncStatus: 'synced' as const, events: [...r.events, evt('System', 'pending', 'pending', 'Synced to server')] } : r)) }));
                notify({ type: 'report', title: `New report ${newId}`, body: `${cur.animal} - ${cur.location.label}`, severity: cur.severity, link: `/official/reports/${newId}`, recipient: 'official' });
              }
            } else {
              set((st) => ({ sos: st.sos.map((x) => (x.id === q.localEntityId ? { ...x, sent: true, events: [...x.events, evt('System', 'received', undefined, 'Sent after reconnection')] } : x)) }));
              notify({ type: 'sos', title: `SOS ${q.localEntityId} (unverified)`, body: 'Received after reconnection', severity: 'critical', link: '/official/sos', recipient: 'official' });
            }
            await idbDel('pendingMutations', q.key); n++;
          }
          if (n) { set({ lastSync: new Date().toISOString() }); notify({ type: 'sync', title: 'Offline sync complete', body: `${n} item(s) uploaded.`, recipient: 'citizen' }); }
          await get().refreshPending();
          return n;
        },

        transition: (id, to, opts = {}) => {
          const s = get(); const r = s.reports.find((x) => x.id === id); const u = s.user;
          if (!r || !u) return { ok: false, error: 'Report not found' };
          if (!VERIFIER_ROLES.includes(u.role)) return { ok: false, error: 'Your role cannot change report status.' };
          if (u.role !== 'dfo' && r.jurisdiction !== u.jurisdiction) return { ok: false, error: 'Outside your jurisdiction.' };
          const reopen = to === 'under_review' && (r.status === 'rejected' || r.status === 'resolved');
          if (reopen && !opts.reason) return { ok: false, error: 'Reopening requires a reason.' };
          if (!reopen && !TRANSITIONS[r.status].includes(to)) return { ok: false, error: `Cannot move from ${r.status} to ${to}.` };
          if (to === 'rejected' && !opts.reason) return { ok: false, error: 'A rejection reason is required.' };
          const next: Report = { ...r, status: to, version: r.version + 1, checklist: opts.checklist ?? r.checklist, rejectReason: to === 'rejected' ? opts.reason : r.rejectReason, events: [...r.events, evt(u.name, to, r.status, [opts.reason, opts.notes].filter(Boolean).join(' - ') || undefined)] };
          if (to === 'verified') {
            next.publicNote = r.publicNote ?? 'Verified by forest staff. Stay alert and avoid the area.';
            next.attestation = { status: 'pending', hash: '', network: 'Stellar Testnet (simulated)' };
          }
          set((st) => ({ reports: st.reports.map((x) => (x.id === id ? next : x)) }));
          audit(`report.${to}`, id, opts.reason);
          notify({ type: 'verification', title: `Report ${id} ${to.replace('_', ' ')}`, body: opts.reason ?? opts.notes ?? 'Status updated by forest staff.', severity: r.severity, link: `/app/reports/${id}`, recipient: 'citizen' });
          if (to === 'verified') {
            get().awardTokens(10, `Verified report ${id}`, 'report', id); // idempotent by sourceId
            if (get().flags.stellar) {
              sha256(JSON.stringify({ v: next.version, id, animal: r.animal, severity: r.severity, status: 'verified', area: r.jurisdiction })).then((hash) => {
                set((st) => ({ reports: st.reports.map((x) => (x.id === id ? { ...x, attestation: { status: 'pending', hash, network: 'Stellar Testnet (simulated)' } } : x)) }));
                setTimeout(() => set((st) => ({ reports: st.reports.map((x) => (x.id === id && x.attestation ? { ...x, attestation: { ...x.attestation, status: 'confirmed', txId: hash.slice(0, 32) } } : x)) })), 2500);
              });
            }
          }
          return { ok: true };
        },
        addNote: (id, note, isPublic) => {
          set((s) => ({ reports: s.reports.map((r) => (r.id === id ? { ...r, publicNote: isPublic ? note : r.publicNote, events: [...r.events, evt(actorName(), r.status, r.status, `${isPublic ? 'Public note' : 'Field note'}: ${note}`)] } : r)) }));
          audit('report.note', id);
        },
        assignReport: (id, teamId) => {
          const t = get().teams.find((x) => x.id === teamId);
          set((s) => ({
            reports: s.reports.map((r) => (r.id === id ? { ...r, assignedTeam: teamId, events: [...r.events, evt(actorName(), r.status, r.status, `Assigned ${t?.name}`)] } : r)),
            teams: s.teams.map((x) => (x.id === teamId ? { ...x, availability: 'busy' as const, assignment: id } : x)),
          }));
          audit('dispatch.assign', id, t?.name);
        },

        createSOS: async ({ type, description, location }) => {
          const s = get(); const user = s.user ?? DEMO_CITIZEN; const online = s.isOnline();
          const id = online ? `SOS-${++sosSeq + s.sos.length}` : `SOS-LOCAL-${uid().slice(-5).toUpperCase()}`;
          const sos: SOS = {
            id, requesterId: user.uid, requesterName: user.name, requesterPhone: user.phone ?? '', location, type, description,
            verificationStatus: 'pending', responseStatus: 'received', createdAt: new Date().toISOString(), sent: online, slaMinutes: 10,
            events: [evt(user.name, 'received', undefined, online ? 'SOS received (unverified)' : 'Saved on device - not sent')],
          };
          if (!online) await idbPut('pendingMutations', { key: id, mutationId: id, ownerUid: user.uid, operation: 'create', entityType: 'sos', localEntityId: id, payload: sos, createdAt: sos.createdAt, status: 'queued', attempts: 0 } satisfies QueueItem);
          set((st) => ({ sos: [sos, ...st.sos] }));
          if (online) notify({ type: 'sos', title: `SOS ${id} (unverified)`, body: `${type} - ${location.label}`, severity: 'critical', link: '/official/sos', recipient: 'official' });
          get().refreshPending();
          return sos;
        },
        cancelSOS: (id) => {
          set((s) => ({ sos: s.sos.map((x) => (x.id === id ? { ...x, cancelled: true, responseStatus: 'cancelled' as const, events: [...x.events, evt(actorName(), 'cancelled', x.responseStatus, 'Cancelled by requester')] } : x)) }));
          idbDel('pendingMutations', id).then(() => get().refreshPending()).catch(() => undefined);
        },
        sosAction: (id, a, arg) => {
          const u = get().user; if (!u) return;
          const patch = (p: Partial<SOS>, to: string, note?: string) =>
            set((s) => ({ sos: s.sos.map((x) => (x.id === id ? { ...x, ...p, events: [...x.events, evt(u.name, to, x.responseStatus, note)] } : x)) }));
          if (a === 'acknowledge') patch({ responseStatus: 'acknowledged' }, 'acknowledged');
          if (a === 'verify') { if (!VERIFIER_ROLES.includes(u.role)) return; patch({ verificationStatus: 'verified' }, 'verified', 'Verification: verified'); }
          if (a === 'reject') { if (!VERIFIER_ROLES.includes(u.role)) return; patch({ verificationStatus: 'rejected', rejectReason: arg }, 'rejected', arg); }
          if (a === 'dispatch') {
            patch({ assignedTeam: arg, responseStatus: 'dispatching' }, 'dispatching', `Team ${arg} assigned`);
            set((s) => ({ teams: s.teams.map((t) => (t.id === arg ? { ...t, availability: 'busy' as const, assignment: id } : t)) }));
          }
          if (a === 'status') patch({ responseStatus: arg as ResponseStatus }, arg!);
          if (a === 'resolve') patch({ responseStatus: 'resolved' }, 'resolved', arg);
          if (a === 'escalate') patch({}, 'escalated', 'Escalated to supervisory officer (SLA breach)');
          audit(`sos.${a}`, id, arg);
          const sos = get().sos.find((x) => x.id === id);
          if (sos) notify({ type: 'sos', title: `SOS ${id}: ${a}`, body: 'Your emergency request was updated. For immediate danger call 112.', severity: 'high', link: '/app/home', recipient: 'citizen' });
        },

        markRead: (id) => set((s) => ({ notifs: s.notifs.map((n) => (!id || n.id === id ? { ...n, read: true } : n)) })),
        dismissNotif: (id) => set((s) => ({ notifs: s.notifs.map((n) => (n.id === id ? { ...n, dismissed: true } : n)) })),
        pushNotif: notify,

        awardTokens: (amount, reason, sourceType, sourceId) => {
          if (get().ledger.some((l) => l.sourceType === sourceType && l.sourceId === sourceId && l.amount > 0)) return false; // idempotent
          set((s) => ({ ledger: [{ id: uid('l'), amount, reason, sourceType, sourceId, at: new Date().toISOString() }, ...s.ledger] }));
          return true;
        },
        setEdu: (id, p) => set((s) => ({ eduProgress: { ...s.eduProgress, [id]: { ...{ watched: 0, completed: false }, ...s.eduProgress[id], ...p } } })),
        addQuizAttempt: (score, total) => {
          const attempts = get().quizAttempts;
          const rewardable = attempts.filter((a) => a.reward > 0).length < 2 && score / total >= 0.8; // reward cap vs farming
          const reward = rewardable ? 15 : 0;
          set((s) => ({ quizAttempts: [{ at: new Date().toISOString(), score, total, reward }, ...s.quizAttempts] }));
          if (reward) get().awardTokens(reward, 'Quiz passed', 'quiz', uid('quiz'));
          return reward;
        },
        setDownload: (id, v) => set((s) => { const d = { ...s.downloads }; if (v) d[id] = v; else delete d[id]; return { downloads: d }; }),

        applyVolunteer: (region) => set({ volApp: { status: 'training_required', region } }),
        completeTraining: () => set((s) => ({ volApp: { ...s.volApp, status: 'approved' as const } })),
        acceptTask: (id) => {
          const s = get(); const t = s.tasks.find((x) => x.id === id);
          if (!t) return { ok: false, error: 'Task not found' };
          if (s.volApp.status !== 'approved') return { ok: false, error: 'Complete application and training first.' };
          if (s.assignments.some((a) => a.taskId === id && a.status !== 'cancelled')) return { ok: false, error: 'Already accepted.' };
          if (t.accepted.length >= t.capacity) return { ok: false, error: 'Task is full.' };
          set((st) => ({
            tasks: st.tasks.map((x) => (x.id === id ? { ...x, accepted: [...x.accepted, st.user?.uid ?? 'me'] } : x)),
            assignments: [...st.assignments, { id: uid('as'), taskId: id, status: 'accepted', acceptedAt: new Date().toISOString() }],
          }));
          return { ok: true };
        },
        progressAssignment: (id, status, notes) => {
          set((s) => ({ assignments: s.assignments.map((a) => (a.id === id ? { ...a, status, notes: notes ?? a.notes } : a)) }));
          if (status === 'approved') {
            const a = get().assignments.find((x) => x.id === id); const t = get().tasks.find((x) => x.id === a?.taskId);
            if (t) get().awardTokens(t.points, `Volunteer task: ${t.title}`, 'task', id);
          }
        },

        issueCert: (recipient, category, summary) => {
          const n = get().certs.length + 1;
          const c: Cert = { id: uid('cert'), number: `VS-CERT-2026-${String(n).padStart(4, '0')}`, recipient, category, summary, issuedBy: `${actorName()}, ${get().user?.designation ?? ''}`, issuedAt: new Date().toISOString(), code: `${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}` };
          set((s) => ({ certs: [c, ...s.certs] })); audit('certificate.issue', c.number, recipient);
          return c;
        },
        revokeCert: (id, reason) => { set((s) => ({ certs: s.certs.map((c) => (c.id === id ? { ...c, revoked: reason } : c)) })); audit('certificate.revoke', id, reason); },

        addScan: (sc) => set((s) => ({ scans: [sc, ...s.scans].slice(0, 15) })),
        deleteScan: (id) => set((s) => ({ scans: s.scans.filter((x) => x.id !== id) })),
        addChat: (m) => set((s) => ({ chat: [...s.chat, m].slice(-60) })),
        clearChat: () => set({ chat: [] }),
        setFlag: (k, v) => { set((s) => ({ flags: { ...s.flags, [k]: v } })); audit('flag.set', k, String(v)); },
        addAudit: audit,
        updateHospital: (id, p) => set((s) => ({ hospitals: s.hospitals.map((h) => (h.id === id ? { ...h, ...p, confirmedAt: new Date().toISOString() } : h)) })),
        updateContact: (id, p) => set((s) => ({ contacts: s.contacts.map((c) => (c.id === id ? { ...c, ...p, verifiedAt: new Date().toISOString() } : c)) })),
        setUserStatus: (id, status) => { set((s) => ({ users: s.users.map((u) => (u.uid === id ? { ...u, status } : u)) })); audit('user.status', id, status); },
        setTeamAvail: (id, availability) => set((s) => ({ teams: s.teams.map((t) => (t.id === id ? { ...t, availability, assignment: availability === 'available' ? undefined : t.assignment } : t)) })),
        setPredictSub: (predictSub) => set({ predictSub }),
        addUser: (p) => {
          const u: AppUser = { uid: uid('u'), name: p.name, phone: p.phone, email: p.email, role: p.role, language: 'en', region: p.region, status: 'active', verified: p.role !== 'citizen' };
          set((s) => ({ users: [u, ...s.users] })); audit('user.create', u.uid, `${p.name} (${p.role})`); return u;
        },
        setUserRole: (id, role) => { set((s) => ({ users: s.users.map((u) => (u.uid === id ? { ...u, role } : u)) })); audit('user.role', id, role); },
        verifyUser: (id) => { set((s) => ({ users: s.users.map((u) => (u.uid === id ? { ...u, verified: true } : u)) })); audit('user.verify', id); },
        removeUser: (id) => { set((s) => ({ users: s.users.filter((u) => u.uid !== id) })); audit('user.delete', id); },
        addTeam: (name, jurisdiction, members) => {
          set((s) => ({ teams: [...s.teams, { id: uid('t'), name, jurisdiction, members, capabilities: ['patrol'], availability: 'available' as const, phone: '' } as Team] })); audit('team.create', name, jurisdiction);
        },
        broadcast: (title, body, audience, severity = 'medium') => { notify({ type: 'broadcast', title, body, severity, recipient: audience }); audit('broadcast', audience, title); },
        logActivity: (action, target, detail) => audit(action, target, detail),
        setDrone: (id, p) => set((s) => ({ drones: s.drones.map((d) => (d.id === id ? { ...d, ...p } : d)) })),
        addMission: (m) => {
          const row: Mission = { ...m, id: `MS-${String(200 + get().missions.length).slice(-3)}` };
          set((s) => ({ missions: [row, ...s.missions] })); audit('mission.create', row.id, m.objective); return row;
        },
        addTask: ({ title, place, urgency = 'medium' }) => {
          const geo = PLACES[place] ?? { lat: 22.16, lng: 88.8 };
          const t: VolTask = { id: uid('task'), title, description: 'Assigned by forest staff for an approved Van Mitra.', place, lat: geo.lat, lng: geo.lng, urgency, requiredTraining: 'Basic safety', capacity: 4, accepted: [], points: urgency === 'high' ? 40 : 20, deadline: new Date(Date.now() + 3 * 864e5).toISOString(), status: 'open' };
          set((s) => ({ tasks: [t, ...s.tasks] })); audit('task.create', t.id, `${title} · ${place}`);
        },
        resetDemo: () => set({ ...baseData(), lastSync: undefined, pendingCount: 0 }),
      };
    },
    {
      name: 'vansanchar-demo-v2',
      storage: createJSONStorage(() => ({
        getItem: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
        setItem: (k, v) => { try { localStorage.setItem(k, v); } catch { /* quota */ } },
        removeItem: (k) => { try { localStorage.removeItem(k); } catch { /* ignore */ } },
      })),
      partialize: (s) => {
        const { installPrompt, pendingCount, ...rest } = s as State;
        void installPrompt; void pendingCount;
        return Object.fromEntries(Object.entries(rest).filter(([, v]) => typeof v !== 'function'));
      },
    }
  )
);

export const tokenBalance = (ledger: LedgerEntry[]) => ledger.reduce((a, l) => a + l.amount, 0);
