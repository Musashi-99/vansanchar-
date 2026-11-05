import { useMemo, useState } from 'react';
import { Users, UserRound, ShieldCheck, User, BadgeCheck, Flag, Plus, Mail, Phone, MapPin, UserCog, Power, Ban, KeyRound, Trash2, Clock, Settings, Check, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Banner, Kpi, KpiRow, Panel, PTitle, Pills, SearchBox, FilterBtn, Tag, Dot, TableWrap, Select2, KV } from '../kit';
import { Bars } from '../charts';
import { useStore } from '../../lib/store';
import { OFFICIALS } from '../../lib/seed';
import { openForm, openConfirm, actAddUser } from '../actions';
import type { AppUser } from '../../lib/types';

const OFFICIAL_ROLES = ['forest_guard', 'range_officer', 'deputy_ranger', 'dfo'];
const kind = (u: AppUser) => (u.role === 'platform_admin' ? 'Admin' : OFFICIAL_ROLES.includes(u.role) ? 'Forest Official' : u.role === 'approved_volunteer' ? 'Volunteer' : 'General User');
const ROLE_OPTS: [string, string][] = [['citizen', 'General User'], ['approved_volunteer', 'Volunteer (Van Mitra)'], ['forest_guard', 'Forest Guard'], ['range_officer', 'Range Officer'], ['dfo', 'Divisional Forest Officer']];
const roleTag = (r: string) => <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12.5px] font-medium ${r === 'Volunteer' ? 'border-[#6fae2a] bg-[#335f1c]' : r === 'Forest Official' ? 'border-[#8a63d8] bg-[#3a2a66]' : r === 'Admin' ? 'border-[#ffa41c] bg-[#5a3a0a]' : 'border-white/30 bg-[#17391f]'}`}>{r}</span>;
const perms = [[Crown, 'System Admin', 'Full platform access'], [ShieldCheck, 'Forest Official', 'Verify reports, dispatch teams, drones & areas'], [Users, 'Volunteer (Van Mitra)', 'Report, accept field tasks & events'], [User, 'General User', 'Report sightings, SOS & view public info']] as const;

export default function AdminUsers() {
  const stored = useStore((s) => s.users);
  const me = useStore((s) => s.user);
  const { setUserStatus, setUserRole, verifyUser, removeUser, logActivity } = useStore.getState();
  const users: AppUser[] = useMemo(() => [...OFFICIALS.map(({ password, ...u }) => { void password; return u as AppUser; }), ...stored], [stored]);
  const [tab, setTab] = useState('all');
  const [status, setStatus] = useState('All');
  const [sel, setSel] = useState<string>(users[0].uid);
  const [q, setQ] = useState('');
  const [dt, setDt] = useState('Activity');
  const isStored = (id: string) => stored.some((u) => u.uid === id);

  const list = users.filter((u) => (tab === 'all' || (tab === 'vol' && kind(u) === 'Volunteer') || (tab === 'off' && (kind(u) === 'Forest Official' || kind(u) === 'Admin')) || (tab === 'gen' && kind(u) === 'General User'))
    && (status === 'All' || (status === 'Suspended' ? u.status === 'suspended' : status === 'Active' ? u.status === 'active' : (u.verified === false || (u.role === 'citizen' && !u.verified && !u.phone))))
    && `${u.name} ${u.uid} ${kind(u)} ${u.region} ${u.email ?? ''}`.toLowerCase().includes(q.toLowerCase()));
  const u = users.find((x) => x.uid === sel) ?? users[0];
  const count = (k: string) => users.filter((x) => kind(x) === k).length;
  const dist = ['General User', 'Volunteer', 'Forest Official', 'Admin'].map((k) => ({ x: k.replace('General User', 'General').replace('Forest Official', 'Officials'), v: count(k) }));
  const locked = !isStored(u.uid); // seeded official accounts are managed outside the app
  const guardStored = (fn: () => void) => { if (locked) return toast.info('Official accounts are managed through invitations; changes are disabled in the demo.'); fn(); };
  const myAudit = useStore((s) => s.audit).filter((a) => a.target === u.uid || a.actor === u.name).slice(0, 4);
  const pending = users.filter((x) => x.verified === false).length;

  return (
    <>
      <Banner icon={<Users />} title="User &" accent="Official Accounts" crumbs={['Admin', 'User & Official Accounts']} sub="Manage all users, forest officials, and volunteers, with roles, verification, and access control." />
      <KpiRow cols={6}>
        <Kpi icon={<Users />} value={users.length} label="Total Accounts" /><Kpi icon={<UserRound />} value={count('Volunteer')} label="Volunteers" />
        <Kpi icon={<ShieldCheck />} value={count('Forest Official')} label="Forest Officials" /><Kpi icon={<User />} value={count('General User')} label="General Users" />
        <Kpi icon={<BadgeCheck />} value={users.filter((x) => x.status === 'active').length} label="Active Accounts" /><Kpi tone="red" icon={<Flag />} value={users.filter((x) => x.status === 'suspended').length + pending} label="Suspended / Unverified" />
      </KpiRow>
      <div className="flex flex-wrap items-center gap-2">
        <Pills value={tab} onChange={setTab} items={[{ id: 'all', label: 'All Users' }, { id: 'vol', label: <><Users className="h-4 w-4" />Volunteers</> }, { id: 'off', label: <><ShieldCheck className="h-4 w-4" />Officials</> }, { id: 'gen', label: <><User className="h-4 w-4" />General Users</> }]} />
        <div className="ml-auto flex min-w-0 flex-1 items-center gap-2 sm:max-w-[560px]"><SearchBox value={q} onChange={setQ} placeholder="Search by name, ID, region, role..." /><FilterBtn options={['All', 'Active', 'Suspended']} value={status === 'All' ? 'Filters' : status} onChange={setStatus} /></div>
      </div>

      <div className="grid gap-3 xl:grid-cols-[1.75fr_1fr]">
        <div className="min-w-0 space-y-3">
          <Panel className="p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><PTitle icon={<Users />}>Accounts ({list.length})</PTitle>
              <div className="flex items-center gap-2"><Select2 className="!py-1.5" options={['Bulk Actions', 'Suspend filtered (citizens)', 'Reactivate filtered (citizens)']} onChange={(o) => {
                const t = list.filter((x) => isStored(x.uid) && x.role === 'citizen' && x.uid !== me?.uid); if (!t.length) return toast.info('No editable citizen accounts in this view.');
                if (o.startsWith('Suspend')) openConfirm({ title: 'Suspend accounts', message: `Suspend ${t.length} citizen account(s)?`, confirm: 'Suspend', danger: true, onConfirm: () => { t.forEach((x) => setUserStatus(x.uid, 'suspended')); toast.success(`${t.length} suspended`); } });
                if (o.startsWith('Reactivate')) { t.forEach((x) => setUserStatus(x.uid, 'active')); toast.success(`${t.length} reactivated`); }
              }}>Bulk Actions</Select2><button onClick={actAddUser} className="nf-btn !py-2"><Plus className="h-4 w-4" />Add Account</button></div></div>
            <TableWrap>
              <table className="w-full text-[13.5px]">
                <thead><tr className="nf-th text-left"><th className="py-2 pl-2">User ID</th><th>Name</th><th>Role / Type</th><th>Verification</th><th>Status</th><th>Region</th></tr></thead>
                <tbody>{list.map((r) => (
                  <tr key={r.uid} onClick={() => setSel(r.uid)} className={`cursor-pointer border-t border-white/5 ${sel === r.uid ? 'bg-[#2a4a14]/60 outline outline-1 outline-[#6fae2a]' : 'hover:bg-white/5'}`}>
                    <td className="whitespace-nowrap py-2.5 pl-2">{r.officialId ?? r.uid}</td>
                    <td><span className="flex items-center gap-2"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2a5a1c] text-xs font-bold">{r.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>{r.name}</span></td><td>{roleTag(kind(r))}</td>
                    <td>{r.verified === false ? <Tag c="yellow" className="!bg-transparent !text-[#ffd93a] border-[#ffd93a]"><Clock className="h-3.5 w-3.5" />Pending</Tag> : <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-[#58e05b]" />Verified</span>}</td>
                    <td><span className="flex items-center gap-2 capitalize"><Dot c={r.status === 'active' ? '#58e05b' : r.status === 'suspended' ? '#ff5a5a' : '#8a9a8a'} />{r.status}</span></td><td>{r.region}</td></tr>))}
                  {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-[var(--muted)]">No accounts match.</td></tr>}</tbody>
              </table>
            </TableWrap>
          </Panel>
          <div className="grid gap-3 lg:grid-cols-[1fr_1.15fr]">
            <Panel className="p-3"><PTitle icon={<Users />}>Accounts by Type</PTitle><Bars data={dist} height={170} /></Panel>
            <Panel className="p-3"><PTitle icon={<ShieldCheck />}>Roles &amp; Permissions</PTitle><p className="-mt-1 mb-2 text-xs text-[#cfe3c4]">Access levels on the platform.</p>
              <ul className="space-y-1.5">{perms.map(([I, n, d]) => <li key={n} className="flex items-center gap-3 rounded-xl border border-[var(--nf-line)] bg-[#0f321a]/70 px-3 py-2"><I className="h-6 w-6 shrink-0 text-[var(--nf-lime)]" /><span className="min-w-0 flex-1 leading-tight"><b className="block text-[14px]">{n}</b><span className="text-[12px] text-[#cfe3c4]">{d}</span></span></li>)}</ul></Panel>
          </div>
        </div>

        <div className="min-w-0 space-y-3">
          <Panel className="p-3"><PTitle icon={<User />}>User Details</PTitle>
            <div className="flex gap-3"><span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl bg-[#2a5a1c] text-2xl font-bold">{u.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}</span>
              <div className="min-w-0 flex-1"><div className="flex items-center gap-1.5 text-[19px] font-bold">{u.name}{u.verified !== false && <BadgeCheck className="h-5 w-5 text-[#58e05b]" />}</div><div className="text-[13px]">ID: {u.officialId ?? u.uid}</div><div className="mt-1.5 flex flex-wrap items-center gap-2">{roleTag(kind(u))}<Tag c={u.status === 'active' ? 'green' : 'red'}>{u.status}</Tag></div></div></div>
            <ul className="mt-3 space-y-1.5 text-[13.5px]">{u.email && <li className="flex items-center gap-3"><Mail className="h-4 w-4 shrink-0" />{u.email}</li>}{u.phone && <li className="flex items-center gap-3"><Phone className="h-4 w-4 shrink-0" />{u.phone}</li>}<li className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0" />{u.jurisdiction ?? u.region}</li></ul>
            {u.designation && <div className="mt-2"><KV k="Designation" v={u.designation} /></div>}
            <div className="mt-3 flex flex-wrap gap-2">{['Activity', 'Access'].map((t) => <button key={t} onClick={() => setDt(t)} className={`nf-pill !py-1 !text-xs ${dt === t ? 'on' : ''}`}>{t}</button>)}</div>
            <ul className="mt-2 divide-y divide-white/5 rounded-xl border border-[var(--nf-line)] px-3 text-[13px]">
              {dt === 'Activity' ? (myAudit.length ? myAudit.map((a) => <li key={a.id} className="py-1.5"><b>{a.action}</b> <span className="text-[#cfe3c4]">{a.detail ?? a.target}</span></li>) : <li className="py-2 text-[var(--muted)]">No recorded activity yet.</li>)
                : <><li className="py-1.5">Portal: <b>{kind(u) === 'Admin' ? 'Admin' : kind(u) === 'Forest Official' ? 'Forest Officer' : 'Citizen'}</b></li><li className="py-1.5">Can verify reports: <b>{['range_officer', 'deputy_ranger', 'dfo'].includes(u.role) ? 'Yes' : 'No'}</b></li></>}
            </ul></Panel>
          <Panel className="p-3"><PTitle icon={<Settings />}>Account Actions</PTitle>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => guardStored(() => openForm({ title: `Change role · ${u.name}`, submit: 'Update role', fields: [{ key: 'role', label: 'Role', type: 'select', options: ROLE_OPTS, value: u.role }], onSubmit: (v) => { setUserRole(u.uid, v.role as never); toast.success('Role updated'); } }))} className="nf-btn ghost !justify-start !rounded-lg border-[var(--nf-line)] !py-2.5"><UserCog className="h-[18px] w-[18px] text-[var(--nf-lime)]" />Change Role</button>
              <button disabled={u.verified !== false} onClick={() => guardStored(() => { verifyUser(u.uid); toast.success('Account verified'); })} className="nf-btn ghost !justify-start !rounded-lg border-[var(--nf-line)] !py-2.5 disabled:opacity-40"><Check className="h-[18px] w-[18px] text-[var(--nf-lime)]" />Verify Account</button>
              <button onClick={() => guardStored(() => { setUserStatus(u.uid, u.status === 'active' ? 'suspended' : 'active'); toast.success(u.status === 'active' ? 'Account deactivated' : 'Account activated'); })} className="nf-btn ghost !justify-start !rounded-lg border-[var(--nf-line)] !py-2.5"><Power className="h-[18px] w-[18px] text-[var(--nf-lime)]" />{u.status === 'active' ? 'Deactivate' : 'Activate'}</button>
              <button onClick={() => guardStored(() => openConfirm({ title: 'Reset password', message: `Send a password reset link to ${u.name}?`, confirm: 'Send link', onConfirm: () => { logActivity('user.reset_password', u.uid); toast.success('Reset link sent (demo)'); } }))} className="nf-btn ghost !justify-start !rounded-lg border-[var(--nf-line)] !py-2.5"><KeyRound className="h-[18px] w-[18px] text-[var(--nf-lime)]" />Reset Password</button>
              <button disabled={u.status === 'suspended'} onClick={() => guardStored(() => openForm({ title: `Suspend ${u.name}`, submit: 'Suspend', danger: true, fields: [{ key: 'r', label: 'Reason', type: 'textarea', required: true }], onSubmit: (v) => { setUserStatus(u.uid, 'suspended'); logActivity('user.suspend', u.uid, v.r); toast.success('Account suspended'); } }))} className="nf-btn ghost !justify-start !rounded-lg border-[var(--nf-line)] !py-2.5 disabled:opacity-40"><Ban className="h-[18px] w-[18px] text-[var(--nf-lime)]" />Suspend</button>
              <button onClick={() => guardStored(() => openConfirm({ title: 'Delete account', message: `Permanently delete ${u.name}? This cannot be undone.`, confirm: 'Delete', danger: true, onConfirm: () => { removeUser(u.uid); setSel(users[0].uid); toast.success('Account deleted'); } }))} className="nf-btn danger !justify-start !rounded-lg !py-2.5"><Trash2 className="h-[18px] w-[18px]" />Delete</button>
            </div>
            {locked && <p className="mt-2 text-xs text-[var(--muted)]">Seeded official accounts are read-only in the demo. Select a citizen or volunteer to edit.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
