import { useState, type ReactNode } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../lib/store';

export type Field = { key: string; label: string; type?: 'text' | 'textarea' | 'select' | 'number'; options?: [string, string][]; placeholder?: string; required?: boolean; value?: string };
type Dlg =
  | { kind: 'form'; title: string; intro?: string; fields: Field[]; submit: string; danger?: boolean; onSubmit: (v: Record<string, string>) => void }
  | { kind: 'confirm'; title: string; message: ReactNode; confirm: string; danger?: boolean; onConfirm: () => void };

const useDlg = create<{ d: Dlg | null; set: (d: Dlg | null) => void }>((set) => ({ d: null, set: (d) => set({ d }) }));
export const openForm = (d: Omit<Extract<Dlg, { kind: 'form' }>, 'kind'>) => useDlg.getState().set({ kind: 'form', ...d });
export const openConfirm = (d: Omit<Extract<Dlg, { kind: 'confirm' }>, 'kind'>) => useDlg.getState().set({ kind: 'confirm', ...d });

const inputCls = 'w-full rounded-xl border border-[var(--nf-line)] bg-[#0b2113] px-3 py-2.5 text-[15px] text-white outline-none focus:border-[var(--nf-lime)]';

function FormBody({ d, close }: { d: Extract<Dlg, { kind: 'form' }>; close: () => void }) {
  const [v, setV] = useState<Record<string, string>>(() => Object.fromEntries(d.fields.map((f) => [f.key, f.value ?? f.options?.[0]?.[0] ?? ''])));
  const [err, setErr] = useState('');
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    const miss = d.fields.find((f) => f.required && !v[f.key]?.trim());
    if (miss) return setErr(`${miss.label} is required.`);
    d.onSubmit(v); close();
  };
  return (
    <form onSubmit={go} className="space-y-3">
      {d.intro && <p className="text-sm text-[var(--muted)]">{d.intro}</p>}
      {d.fields.map((f) => (
        <label key={f.key} className="block text-sm"><span className="mb-1 block font-medium">{f.label}{f.required && <b className="text-[#ff6a6a]"> *</b>}</span>
          {f.type === 'select' ? <select className={inputCls} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })}>{f.options!.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            : f.type === 'textarea' ? <textarea rows={3} className={inputCls} placeholder={f.placeholder} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />
              : <input type={f.type === 'number' ? 'number' : 'text'} className={inputCls} placeholder={f.placeholder} value={v[f.key]} onChange={(e) => setV({ ...v, [f.key]: e.target.value })} />}
        </label>
      ))}
      {err && <p role="alert" className="text-sm text-[#ff6a6a]">{err}</p>}
      <div className="flex gap-2 pt-1"><button type="button" onClick={close} className="nf-btn ghost flex-1">Cancel</button><button type="submit" className={`nf-btn flex-1 ${d.danger ? 'red' : ''}`}>{d.submit}</button></div>
    </form>
  );
}

export function ActionHost() {
  const { d, set } = useDlg();
  const close = () => set(null);
  return (
    <AnimatePresence>
      {d && (
        <motion.div className="nf fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <motion.div role="dialog" aria-modal="true" aria-label={d.title} initial={{ y: 60, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 40, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            className="nf-panel max-h-[90dvh] w-full max-w-md overflow-y-auto !rounded-b-none p-5 sm:!rounded-b-2xl" style={{ background: 'linear-gradient(180deg,#10361a,#0a2312)' }}>
            <div className="mb-3 flex items-center justify-between gap-2"><h2 className="text-lg font-bold">{d.title}</h2><button aria-label="Close" onClick={close} className="rounded-full p-1.5 hover:bg-white/10"><X className="h-5 w-5" /></button></div>
            {d.kind === 'form' ? <FormBody d={d} close={close} /> : (
              <div className="space-y-4"><div className="text-sm text-[#dcebd3]">{d.message}</div>
                <div className="flex gap-2"><button onClick={close} className="nf-btn ghost flex-1">Cancel</button><button onClick={() => { d.onConfirm(); close(); }} className={`nf-btn flex-1 ${d.danger ? 'red' : ''}`}>{d.confirm}</button></div></div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------- ready-made actions (all write to the store + audit log) ---------- */
const R = () => useStore.getState();
const REGIONS = ['Gosaba', 'Sajnekhali', 'Basanti', 'Canning', 'Pakhirala', 'Namkhana', 'Bakkhali', 'Dayapur'].map((x) => [x, x] as [string, string]);

export const actBroadcast = (audience: 'citizen' | 'official' = 'citizen') => openForm({
  title: 'Broadcast Alert', intro: 'Sent to every user in the chosen audience as an in-app notification.', submit: 'Send alert',
  fields: [
    { key: 'audience', label: 'Audience', type: 'select', options: [['citizen', 'Citizens & villages'], ['official', 'Forest staff']], value: audience },
    { key: 'sev', label: 'Severity', type: 'select', options: [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']], value: 'medium' },
    { key: 'title', label: 'Title', required: true, placeholder: 'e.g. Tiger movement near Sajnekhali' },
    { key: 'body', label: 'Message', type: 'textarea', required: true },
  ],
  onSubmit: (v) => { R().broadcast(v.title, v.body, v.audience as 'citizen' | 'official', v.sev as 'high'); toast.success('Alert broadcast'); },
});

export const actLog = (title: string, intro: string, submit: string, auditAction: string, extra: Field[] = [], done?: string) => openForm({
  title, intro, submit,
  fields: [...extra, { key: 'note', label: 'Notes', type: 'textarea', placeholder: 'Optional details' }],
  onSubmit: (v) => { R().logActivity(auditAction, v.target || title, Object.values(v).filter(Boolean).join(' · ')); toast.success(done ?? `${title}: recorded`); },
});

export const actAddUser = () => openForm({
  title: 'Add Account', submit: 'Create account',
  fields: [
    { key: 'name', label: 'Full name', required: true }, { key: 'phone', label: 'Mobile (10 digits)', placeholder: '98300 12345' },
    { key: 'role', label: 'Role', type: 'select', options: [['citizen', 'General User'], ['approved_volunteer', 'Volunteer (Van Mitra)'], ['forest_guard', 'Forest Guard'], ['range_officer', 'Range Officer']] },
    { key: 'region', label: 'Region', type: 'select', options: REGIONS },
  ],
  onSubmit: (v) => { const u = R().addUser({ name: v.name.trim(), phone: v.phone ? `+91${v.phone.replace(/\D/g, '').slice(-10)}` : undefined, role: v.role as never, region: v.region }); toast.success(`${u.name} added`); },
});

export const actAddTeam = () => openForm({
  title: 'Create Team', submit: 'Create',
  fields: [{ key: 'name', label: 'Team name', required: true, placeholder: 'e.g. Rapid Response Team F' }, { key: 'j', label: 'Range', type: 'select', options: [['Gosaba Range', 'Gosaba Range'], ['Sajnekhali Range', 'Sajnekhali Range'], ['Basanti Range', 'Basanti Range']] }, { key: 'm', label: 'Members', type: 'number', value: '4', required: true }],
  onSubmit: (v) => { R().addTeam(v.name.trim(), v.j, Math.max(1, +v.m || 1)); toast.success('Team created'); },
});

/* ---------- label → action dispatcher used by quick-action buttons ---------- */
import { useNavigate } from 'react-router-dom';
const ROUTES: Record<string, string> = { 'System Settings': '/admin/settings', 'Update Species DB': '/admin/content', 'Plan Patrol Route': '/official/hotspot' };

export function useRun() {
  const nav = useNavigate();
  return (label: string) => {
    const l = label.trim();
    switch (l) {
      case 'Add User': case 'Add Account': case 'Add New Volunteer': return actAddUser();
      case 'Create Team': case 'Form New Team': return actAddTeam();
      case 'Create Jurisdiction': return actLog(l, 'Define a new administrative range or beat.', 'Create', 'jurisdiction.create', [{ key: 'target', label: 'Name', required: true }, { key: 'parent', label: 'Parent division', placeholder: 'South 24 Parganas Division' }]);
      case 'Assign Coverage Area': return actLog(l, 'Assign a patrol area to a team.', 'Assign', 'coverage.assign', [{ key: 'target', label: 'Area', required: true }, { key: 'team', label: 'Team', type: 'select', options: R().teams.map((t) => [t.name, t.name] as [string, string]) }]);
      case 'Allocate Drones / Assets': return actLog(l, 'Allocate drones or vehicles to a range.', 'Allocate', 'assets.allocate', [{ key: 'target', label: 'Asset', required: true }, { key: 'range', label: 'Range' }]);
      case 'Update Team Members': return actLog(l, 'Update the roster of a team.', 'Update', 'team.roster', [{ key: 'target', label: 'Team', type: 'select', options: R().teams.map((t) => [t.name, t.name] as [string, string]) }, { key: 'change', label: 'Change', required: true, placeholder: 'e.g. add guard Subrata Das' }]);
      case 'View Team Performance': return nav('/admin/reports');
      case 'Create Announcement': case 'Broadcast Alert': case 'Send Alert / Broadcast': case 'Alert Nearby Villages': case 'Send Alert to Nearby Villages': return actBroadcast('citizen');
      case 'Assign Role': return openForm({
        title: 'Assign Role', submit: 'Assign',
        fields: [{ key: 'uid', label: 'User', type: 'select', options: R().users.map((u) => [u.uid, `${u.name} (${u.role.replace('_', ' ')})`] as [string, string]) },
          { key: 'role', label: 'New role', type: 'select', options: [['citizen', 'General User'], ['approved_volunteer', 'Volunteer (Van Mitra)'], ['forest_guard', 'Forest Guard'], ['range_officer', 'Range Officer']] }],
        onSubmit: (v) => { R().setUserRole(v.uid, v.role as never); toast.success('Role updated'); },
      });
      case 'Retrain AI Model': return openConfirm({ title: 'Retrain AI model', message: 'Queue a retraining job on verified, labelled reports and photos? Training runs off-peak (demo: simulated).', confirm: 'Queue job', onConfirm: () => { R().logActivity('ai.retrain', 'species-detector', 'queued'); toast.success('Retraining job queued'); } });
      case 'Deploy Team': return openForm({
        title: 'Deploy Team', submit: 'Deploy',
        fields: [{ key: 'team', label: 'Team', type: 'select', options: R().teams.filter((t) => t.availability === 'available').map((t) => [t.id, `${t.name} · ${t.jurisdiction}`] as [string, string]) }, { key: 'note', label: 'Instructions', type: 'textarea' }],
        onSubmit: (v) => { if (!v.team) return toast.error('No team available'); R().setTeamAvail(v.team, 'busy'); R().logActivity('team.deploy', v.team, v.note); toast.success('Team deployed'); },
      });
      case 'Coordinate with Police': return actLog('Coordinate with Police', 'Log a request to the local police station.', 'Send request', 'police.coordinate', [{ key: 'target', label: 'Station', placeholder: 'e.g. Gosaba PS' }]);
      case 'Activate Drone': case 'Launch Drone': case 'Request Drone Recon': case 'Emergency Recon': {
        const ready = R().drones.filter((d) => d.status !== 'maintenance');
        return openForm({
          title: l, intro: 'The chosen drone leaves its current task and flies the target area.', submit: 'Task drone',
          fields: [
            { key: 'drone', label: 'Drone', type: 'select', options: ready.map((d) => [d.id, `${d.name} · ${d.zone} (${d.battery}%)`] as [string, string]) },
            { key: 'target', label: 'Target area', required: true, placeholder: 'e.g. Sajnekhali creek' },
          ],
          onSubmit: (v) => {
            if (!v.drone) return toast.error('No drone is available.');
            R().setDrone(v.drone, { status: 'patrolling', zone: v.target, recording: true, altitude: 90, speed: 28, signal: 88 });
            R().addMission({ area: v.target, objective: l, droneId: v.drone, status: 'in_progress', progress: 8 });
            R().logActivity('drone.task', v.drone, v.target); toast.success(`${ready.find((d) => d.id === v.drone)?.name ?? 'Drone'} tasked`);
          },
        });
      }
      case 'Plan New Mission': return openForm({
        title: 'Plan new mission', submit: 'Save plan',
        fields: [
          { key: 'target', label: 'Area', required: true, placeholder: 'e.g. Gosaba Range' },
          { key: 'objective', label: 'Objective', required: true },
          { key: 'drone', label: 'Drone', type: 'select', options: R().drones.map((d) => [d.id, d.name] as [string, string]) },
        ],
        onSubmit: (v) => { R().addMission({ area: v.target, objective: v.objective, droneId: v.drone, status: 'scheduled', progress: 0 }); toast.success('Mission saved'); },
      });
      case 'Plan Patrol Route': return actLog(l, 'Define a patrol route for a field team.', 'Save plan', 'patrol.plan', [{ key: 'target', label: 'Route name', required: true }, { key: 'from', label: 'From' }, { key: 'to', label: 'To' }], 'Plan saved');
      case 'Inform Control Room': return actLog(l, 'Notify the control room of the current situation.', 'Send', 'control.inform');
      case 'Log Field Note': return actLog(l, 'Add a note to the operations log.', 'Save note', 'field.note', [{ key: 'target', label: 'Subject', required: true }]);
      case 'Send Update to Field Team': return actLog(l, 'Message the team currently assigned.', 'Send update', 'team.update', [{ key: 'target', label: 'Team' }]);
      case 'Contact Caller': return actLog(l, 'Record the call attempt.', 'Log call', 'sos.contact');
      case 'Assign Field Task': return openForm({
        title: 'Assign field task', submit: 'Create task',
        fields: [
          { key: 'target', label: 'Task title', required: true },
          { key: 'place', label: 'Place', type: 'select', options: REGIONS },
          { key: 'urgency', label: 'Urgency', type: 'select', options: [['low', 'Low'], ['medium', 'Medium'], ['high', 'High']], value: 'medium' },
        ],
        onSubmit: (v) => { R().addTask({ title: v.target, place: v.place, urgency: v.urgency as 'low' }); toast.success('Task assigned to Van Mitra'); },
      });
      case 'Create Training': return actLog(l, 'Schedule a training session.', 'Schedule', 'training.create', [{ key: 'target', label: 'Topic', required: true }, { key: 'date', label: 'Date' }]);
      case 'Issue Certificate': return nav('/official/certificates');
      case 'Run New Prediction': return openConfirm({ title: 'Run new prediction', message: 'Recompute 7-day risk forecast from the latest verified reports.', confirm: 'Run', onConfirm: () => { R().logActivity('predict.run', 'risk-forecast'); toast.success('Forecast refreshed'); } });
      case 'Increase patrols in Sajnekhali & Basanti (1–10 Nov)': case 'Deploy drone surveillance on high-risk corridors': case 'Alert nearby Van Mitra teams & range officers':
        return openConfirm({ title: 'Apply recommendation', message: l, confirm: 'Apply', onConfirm: () => { R().logActivity('recommendation.apply', l); toast.success('Recommendation applied and logged'); } });
      default:
        if (ROUTES[l]) return nav(ROUTES[l]);
        return toast.info(l);
    }
  };
}
