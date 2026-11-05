import type { TimelineEvent, Report, SOS, Team, Drone, Hospital, Contact, VolTask, Edu, QuizQ, Cert, AuditLog, Hotspot, AppUser, Notif, Animal, Severity, ReportStatus, Mission } from './types';
import { PLACES, PLACE_NAMES, hoursAgo } from './utils';

// ---- DEMONSTRATION DATA ONLY. Nothing here is real incident data. ----
let seedN = 7;
const rnd = () => { seedN = (seedN * 9301 + 49297) % 233280; return seedN / 233280; };
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];

export const DEMO_CITIZEN: AppUser = {
  uid: 'u_citizen_demo', name: 'Anita Mondal', phone: '+919830012345', role: 'citizen', address: 'Gosaba Block, South 24 Parganas',
  blood: 'B+', emergency: { name: 'Ramesh Mondal', phone: '+919830054321' }, language: 'en', region: 'Gosaba', status: 'active', alertRadius: 15,
  consent: { location: true, voice: false, push: true },
};

export const OFFICIALS: (AppUser & { password: string })[] = [
  { uid: 'o_guard', name: 'Subrata Das', email: 'guard@vansanchar.demo', password: 'Demo@1234', role: 'forest_guard', officialId: 'WB-FG-1042', designation: 'Forest Guard', jurisdiction: 'Gosaba Range', language: 'en', region: 'Gosaba', status: 'active' },
  { uid: 'o_range', name: 'Priya Sen', email: 'range@vansanchar.demo', password: 'Demo@1234', role: 'range_officer', officialId: 'WB-RO-0217', designation: 'Range Officer', jurisdiction: 'Gosaba Range', language: 'en', region: 'Gosaba', status: 'active' },
  { uid: 'o_dfo', name: 'Arindam Ghosh', email: 'dfo@vansanchar.demo', password: 'Demo@1234', role: 'dfo', officialId: 'WB-DFO-0031', designation: 'Divisional Forest Officer', jurisdiction: 'South 24 Parganas Division', language: 'en', region: 'Gosaba', status: 'active' },
  { uid: 'o_admin', name: 'Meera Banerjee', email: 'admin@vansanchar.demo', password: 'Demo@1234', role: 'platform_admin', officialId: 'WB-ADM-0004', designation: 'Platform Administrator', jurisdiction: 'All', language: 'en', region: 'Gosaba', status: 'active' },
];

const DESCS: Record<Animal, string[]> = {
  tiger: ['Pugmarks seen near the village pond at dawn.', 'Tiger sighted across the creek near the embankment.', 'Livestock attacked overnight, tiger suspected.', 'Roar heard near the mangrove edge after dusk.'],
  crocodile: ['Large crocodile on the muddy bank near the ghat.', 'Crocodile seen near fishing boats.', 'Crocodile spotted close to children bathing area.'],
  snake: ['King cobra found in a courtyard.', 'Snake near the water pump, family moved away.', 'Venomous snake inside storage shed.'],
  boar: ['Wild boar herd damaging paddy field.', 'Boars crossing the road at night.'],
  elephant: ['Elephant seen at the edge of the forest strip.', 'Crop damage reported near the border.'],
  leopard: ['Leopard-like animal seen near the fence.'],
  bear: ['Sloth bear reported near the forest track.'],
  other: ['Unfamiliar animal tracks near the canal.'],
  unknown: ['Large shadow moving behind the hut, species unclear.'],
};
const SUNDARBANS_MIX: Animal[] = ['tiger', 'tiger', 'tiger', 'crocodile', 'crocodile', 'snake', 'snake', 'boar', 'boar', 'unknown', 'other'];
const NAMES = ['Rahul Naskar', 'Sumita Mondal', 'Bikash Mistry', 'Kabita Sardar', 'Tapan Halder', 'Mamata Gayen', 'Sanjay Mandal', 'Rina Bar'];

function genReports(): Report[] {
  const out: Report[] = [];
  const statuses: ReportStatus[] = ['pending', 'pending', 'under_review', 'verified', 'verified', 'verified', 'verified', 'rejected', 'resolved', 'resolved'];
  for (let i = 0; i < 36; i++) {
    const place = pick(PLACE_NAMES), p = PLACES[place];
    const animal = pick(SUNDARBANS_MIX), sev = pick<Severity>(['low', 'medium', 'medium', 'high', 'high', 'critical']);
    const status = i < 3 ? 'pending' : pick(statuses);
    const h = i < 3 ? 1 + i * 2 : 3 + Math.floor(rnd() * 24 * 28);
    const lat = p.lat + (rnd() - 0.5) * 0.06, lng = p.lng + (rnd() - 0.5) * 0.06;
    const name = pick(NAMES), mine = i % 9 === 4;
    const sub = hoursAgo(h);
    const ev: TimelineEvent[] = [{ at: sub, actor: mine ? DEMO_CITIZEN.name : name, to: 'pending', note: 'Report submitted' }];
    if (status !== 'pending') ev.push({ at: hoursAgo(Math.max(0.2, h - 1)), actor: 'Subrata Das', from: 'pending', to: status === 'under_review' ? 'under_review' : status === 'rejected' ? 'rejected' : 'verified', note: status === 'rejected' ? 'Insufficient evidence' : 'Reviewed' });
    if (status === 'resolved') ev.push({ at: hoursAgo(Math.max(0.1, h - 3)), actor: 'Priya Sen', from: 'verified', to: 'resolved', note: 'Team completed patrol; area calm' });
    out.push({
      id: `VS-${String(1001 + i)}`, clientMutationId: `seed-${i}`, reporterId: mine ? DEMO_CITIZEN.uid : `u_seed_${i % 8}`,
      reporterName: mine ? DEMO_CITIZEN.name : name, reporterPhone: mine ? DEMO_CITIZEN.phone! : `+9198300${String(10000 + i * 37).slice(0, 5)}`,
      animal, severity: sev, description: pick(DESCS[animal]), count: 1 + Math.floor(rnd() * 3),
      location: { lat, lng, label: `Near ${place}`, accuracy: 10 + Math.floor(rnd() * 40), capturedAt: sub },
      jurisdiction: place === 'Canning' || place === 'Piyali' ? 'Canning Range' : place === 'Namkhana' || place === 'Patharpratima' ? 'Namkhana Range' : 'Gosaba Range',
      occurredAt: sub, submittedAt: sub, status, version: 1 + (status === 'pending' ? 0 : 1), hasVoice: rnd() > 0.7, syncStatus: 'synced',
      publicNote: status === 'verified' ? 'Verified by forest staff. Avoid the area after dusk.' : undefined,
      rejectReason: status === 'rejected' ? 'Insufficient evidence' : undefined,
      events: ev, demo: true,
    });
  }
  return out.sort((a, b) => +new Date(b.submittedAt) - +new Date(a.submittedAt));
}
export const SEED_REPORTS = genReports();

export const SEED_SOS: SOS[] = [
  { id: 'SOS-201', requesterId: 'u_seed_2', requesterName: 'Bikash Mistry', requesterPhone: '+919830011122', location: { lat: 22.12, lng: 88.81, label: 'Near Sajnekhali', accuracy: 18, capturedAt: hoursAgo(0.3) }, type: 'Tiger attack nearby', description: 'Tiger seen close to the boat landing. Two people are on the jetty.', verificationStatus: 'pending', responseStatus: 'received', createdAt: hoursAgo(0.2), sent: true, slaMinutes: 10, events: [{ at: hoursAgo(0.2), actor: 'Bikash Mistry', to: 'received', note: 'SOS received (unverified)' }] },
  { id: 'SOS-200', requesterId: 'u_seed_5', requesterName: 'Kabita Sardar', requesterPhone: '+919830033344', location: { lat: 22.05, lng: 88.76, label: 'Near Dayapur', accuracy: 30, capturedAt: hoursAgo(5) }, type: 'Snakebite', description: 'Child bitten on the foot; transport arranged.', verificationStatus: 'verified', responseStatus: 'en_route', createdAt: hoursAgo(5), assignedTeam: 'team_a', sent: true, slaMinutes: 10, events: [{ at: hoursAgo(5), actor: 'Kabita Sardar', to: 'received' }, { at: hoursAgo(4.9), actor: 'Subrata Das', from: 'received', to: 'acknowledged' }, { at: hoursAgo(4.8), actor: 'Priya Sen', from: 'acknowledged', to: 'en_route', note: 'Team A dispatched' }] },
  { id: 'SOS-199', requesterId: 'u_seed_199', requesterName: 'Rina Bar', requesterPhone: '+919830077788', location: { lat: 22.17, lng: 88.91, label: 'Near Basanti', accuracy: 25, capturedAt: hoursAgo(3.5) }, type: 'Elephant near homes', description: 'Elephant herd at the edge of the paddy fields; families moved indoors.', verificationStatus: 'verified', responseStatus: 'on_scene', createdAt: hoursAgo(3.5), assignedTeam: 'team_b', sent: true, slaMinutes: 10, events: [{ at: hoursAgo(3.5), actor: 'Rina Bar', to: 'received', note: 'SOS received' }, { at: hoursAgo(3.4), actor: 'Subrata Das', from: 'received', to: 'acknowledged' }, { at: hoursAgo(3.3), actor: 'Priya Sen', from: 'acknowledged', to: 'en_route', note: 'Team B dispatched' }, { at: hoursAgo(2.9), actor: 'Team B', from: 'en_route', to: 'on_scene' } ] },
  { id: 'SOS-198', requesterId: 'u_seed_198', requesterName: 'Tapan Halder', requesterPhone: '+919830055566', location: { lat: 22.19, lng: 88.7, label: 'Near Canning', accuracy: 25, capturedAt: hoursAgo(9) }, type: 'Crocodile near ghat', description: 'Large crocodile on the bathing ghat; people asked to stay back.', verificationStatus: 'verified', responseStatus: 'resolved', createdAt: hoursAgo(9), assignedTeam: 'team_c', sent: true, slaMinutes: 10, events: [{ at: hoursAgo(9), actor: 'Tapan Halder', to: 'received', note: 'SOS received' }, { at: hoursAgo(8.9), actor: 'Subrata Das', from: 'received', to: 'acknowledged' }, { at: hoursAgo(8.7), actor: 'Priya Sen', from: 'acknowledged', to: 'en_route', note: 'Canning Patrol dispatched' }, { at: hoursAgo(8), actor: 'Canning Patrol', from: 'en_route', to: 'resolved', note: 'Crocodile moved to the creek' } ] },
  { id: 'SOS-197', requesterId: 'u_seed_197', requesterName: 'Bikash Mistry', requesterPhone: '+919830011122', location: { lat: 22.09, lng: 88.86, label: 'Near Pakhirala', accuracy: 25, capturedAt: hoursAgo(26) }, type: 'Snakebite', description: 'Adult bitten while harvesting; anti-venom requested.', verificationStatus: 'verified', responseStatus: 'resolved', createdAt: hoursAgo(26), assignedTeam: 'team_d', sent: true, slaMinutes: 10, events: [{ at: hoursAgo(26), actor: 'Bikash Mistry', to: 'received', note: 'SOS received' }, { at: hoursAgo(25.8), actor: 'Subrata Das', from: 'received', to: 'acknowledged' }, { at: hoursAgo(25), actor: 'Snake Rescue Unit', from: 'acknowledged', to: 'resolved', note: 'Patient shifted to hospital' } ] },
];

export const SEED_TEAMS: Team[] = [
  { id: 'team_a', name: 'Rapid Response Team A', jurisdiction: 'Gosaba Range', members: 5, capabilities: ['Tiger tranquilising', 'Boat patrol', 'First aid'], availability: 'busy', assignment: 'SOS-200', phone: '+913324000101' },
  { id: 'team_b', name: 'Rapid Response Team B', jurisdiction: 'Gosaba Range', members: 4, capabilities: ['Boat patrol', 'Crowd control'], availability: 'available', phone: '+913324000102' },
  { id: 'team_c', name: 'Canning Patrol', jurisdiction: 'Canning Range', members: 4, capabilities: ['Crocodile response', 'Land patrol'], availability: 'available', phone: '+913324000103' },
  { id: 'team_d', name: 'Snake Rescue Unit', jurisdiction: 'South 24 Parganas', members: 3, capabilities: ['Snake rescue', 'Venom first aid'], availability: 'available', phone: '+913324000104' },
  { id: 'team_e', name: 'Namkhana Coastal Team', jurisdiction: 'Namkhana Range', members: 4, capabilities: ['Coastal boat patrol'], availability: 'off_duty', phone: '+913324000105' },
];

export const SEED_DRONES: Drone[] = [
  { id: 'dr1', name: 'Garuda-1', status: 'patrolling', battery: 78, signal: 92, altitude: 96, speed: 31, lat: 22.14, lng: 88.84, mode: 'rgb', recording: true, zone: 'Sajnekhali buffer' },
  { id: 'dr2', name: 'Garuda-2', status: 'returning', battery: 24, signal: 71, altitude: 60, speed: 38, lat: 22.07, lng: 88.77, mode: 'rgb', recording: false, zone: 'Dayapur creek' },
  { id: 'dr3', name: 'Garuda-3', status: 'charging', battery: 45, signal: 100, altitude: 0, speed: 0, lat: 22.158, lng: 88.852, mode: 'rgb', recording: false, zone: 'Gosaba base' },
  { id: 'dr4', name: 'Garuda-4', status: 'maintenance', battery: 100, signal: 0, altitude: 0, speed: 0, lat: 22.158, lng: 88.852, mode: 'rgb', recording: false, zone: 'Gosaba base' },
];

export const SEED_HOSPITALS: Hospital[] = [
  { id: 'h1', name: 'Gosaba Rural Hospital', lat: 22.1635, lng: 88.8, phone: '+913218255100', antiVenom: 'available', confirmedAt: hoursAgo(30), area: 'Gosaba' },
  { id: 'h2', name: 'Basanti Block PHC', lat: 22.172, lng: 88.672, phone: '+913218255200', antiVenom: 'unknown', confirmedAt: hoursAgo(24 * 20), area: 'Basanti' },
  { id: 'h3', name: 'Canning Sub-Divisional Hospital', lat: 22.312, lng: 88.667, phone: '+913218255300', antiVenom: 'available', confirmedAt: hoursAgo(50), area: 'Canning' },
  { id: 'h4', name: 'Namkhana Rural Hospital', lat: 21.769, lng: 88.24, phone: '+913218255400', antiVenom: 'unavailable', confirmedAt: hoursAgo(72), area: 'Namkhana' },
  { id: 'h5', name: 'Patharpratima PHC', lat: 21.802, lng: 88.33, phone: '+913218255500', antiVenom: 'unknown', confirmedAt: hoursAgo(24 * 40), area: 'Patharpratima' },
  { id: 'h6', name: 'Kultali Block PHC', lat: 22.005, lng: 88.531, phone: '+913218255600', antiVenom: 'available', confirmedAt: hoursAgo(90), area: 'Kultali' },
];

// Placeholder numbers: replace with verified department numbers before any real deployment.
export const SEED_CONTACTS: Contact[] = [
  { id: 'c1', name: 'Emergency (all services)', phone: '112', area: 'India', verifiedAt: hoursAgo(24 * 30), kind: 'police' },
  { id: 'c2', name: 'Ambulance', phone: '108', area: 'West Bengal', verifiedAt: hoursAgo(24 * 30), kind: 'medical' },
  { id: 'c3', name: 'Forest Helpline (demo number)', phone: '+913324000100', area: 'South 24 Parganas', verifiedAt: hoursAgo(24 * 7), kind: 'forest' },
  { id: 'c4', name: 'Disaster Management', phone: '1070', area: 'West Bengal', verifiedAt: hoursAgo(24 * 30), kind: 'disaster' },
  { id: 'c5', name: 'Snake Rescue Unit (demo)', phone: '+913324000104', area: 'South 24 Parganas', verifiedAt: hoursAgo(24 * 7), kind: 'rescue' },
];

export const SEED_TASKS: VolTask[] = [
  { id: 't1', title: 'Village awareness meeting', description: 'Help a forest guard brief villagers on safe fishing practices. No wildlife contact involved.', place: 'Gosaba', lat: 22.158, lng: 88.85, urgency: 'low', requiredTraining: 'Basic safety', capacity: 3, accepted: [], points: 20, deadline: hoursAgo(-72), status: 'open' },
  { id: 't2', title: 'Night patrol support (boat assistant)', description: 'Support a trained team on the boat patrol. Stay with the team at all times.', place: 'Sajnekhali', lat: 22.1, lng: 88.83, urgency: 'high', requiredTraining: 'Tiger encounter safety', capacity: 2, accepted: [], points: 40, deadline: hoursAgo(-24), status: 'open' },
  { id: 't3', title: 'Community alert relay', description: 'Relay a verified advisory door-to-door in the affected hamlet.', place: 'Dayapur', lat: 22.08, lng: 88.74, urgency: 'medium', requiredTraining: 'Basic safety', capacity: 4, accepted: ['x'], points: 25, deadline: hoursAgo(-48), status: 'open' },
  { id: 't4', title: 'Camera-trap card collection', description: 'Accompany a guard to swap memory cards at marked posts.', place: 'Jharkhali', lat: 21.99, lng: 88.69, urgency: 'low', requiredTraining: 'Wildlife reporting training', capacity: 1, accepted: ['x'], points: 30, deadline: hoursAgo(-96), status: 'open' },
];

export const SEED_EDU: Edu[] = [
  { id: 'w1', type: 'workshop', topic: 'Tiger encounter safety', title: 'If you meet a tiger: what to do', summary: 'Stay calm, never run, keep group together, back away slowly, avoid eye challenge.', duration: 8, language: 'English', reviewed: '2026-08-14', reviewer: 'Demo reviewer (Wildlife)', version: '1.2', steps: ['Do not run', 'Keep the group together', 'Back away slowly facing the animal', 'Make yourself look larger, speak calmly', 'Report only after reaching safety'] },
  { id: 'w2', type: 'workshop', topic: 'Snakebite first aid', title: 'Snakebite: first 30 minutes', summary: 'Keep the victim calm and still, remove tight items, get to a hospital fast.', duration: 10, language: 'English', reviewed: '2026-09-02', reviewer: 'Demo reviewer (Medical)', version: '2.0', steps: ['Keep calm, minimise movement', 'Immobilise the limb gently', 'Remove rings/watches before swelling', 'Do NOT cut, suck or tie tightly', 'Transport to hospital immediately'] },
  { id: 'w3', type: 'workshop', topic: 'Flood emergency survival', title: 'Cyclone & flood readiness', summary: 'Know your shelter, keep a go-bag, avoid creek crossings.', duration: 7, language: 'Bengali / English', reviewed: '2026-07-20', reviewer: 'Demo reviewer (Disaster)', version: '1.0' },
  { id: 'w4', type: 'workshop', topic: 'How to use SOS', title: 'Using SOS in VanSanchar', summary: 'How the 3-second countdown works and when not to use SOS.', duration: 4, language: 'English', reviewed: '2026-10-01', reviewer: 'Demo reviewer (Platform)', version: '1.1' },
  { id: 'w5', type: 'workshop', topic: 'Safe night travel', title: 'Moving safely after dark', summary: 'Travel in groups, carry a light, avoid creek banks at dusk and dawn.', duration: 6, language: 'English', reviewed: '2026-08-30', reviewer: 'Demo reviewer (Wildlife)', version: '1.0' },
  { id: 'w6', type: 'workshop', topic: 'Wildlife reporting training', title: 'How to report well', summary: 'Safe photo distance, accurate location, honest species uncertainty.', duration: 5, language: 'English', reviewed: '2026-09-15', reviewer: 'Demo reviewer (Platform)', version: '1.0' },
  { id: 's1', type: 'safety', topic: 'Tiger', title: 'Tiger safety measures', summary: 'Never enter the forest alone. Carry noise-makers. Use face masks on the back of the head where advised by the department. Avoid honey/wood collection at dusk.', duration: 0, language: 'English', reviewed: '2026-08-14', reviewer: 'Demo reviewer (Wildlife)', version: '1.2' },
  { id: 's2', type: 'safety', topic: 'Crocodile', title: 'Crocodile safety measures', summary: 'Avoid bathing or washing at unprotected creek edges. Use fenced ghats. Keep children away from muddy banks.', duration: 0, language: 'English', reviewed: '2026-08-14', reviewer: 'Demo reviewer (Wildlife)', version: '1.1' },
  { id: 's3', type: 'safety', topic: 'Snake', title: 'Snake safety measures', summary: 'Wear boots at night, use a torch, clear debris near homes. Never try to catch or kill a snake. Call the rescue unit.', duration: 0, language: 'English', reviewed: '2026-09-02', reviewer: 'Demo reviewer (Medical)', version: '2.0' },
  { id: 's4', type: 'safety', topic: 'Wild boar', title: 'Wild boar & crop safety', summary: 'Do not corner a boar. Use community watch and approved fencing. Report crop damage for compensation processing.', duration: 0, language: 'English', reviewed: '2026-07-01', reviewer: 'Demo reviewer (Wildlife)', version: '1.0' },
];

export const SEED_QUIZ: QuizQ[] = [
  { id: 'q1', q: 'You see a tiger at a distance on the creek bank. What should you do first?', options: ['Run to the boat', 'Stay calm and move away slowly, keeping the group together', 'Take a close photograph', 'Throw stones'], answer: 1, why: 'Running can trigger a chase. Move away calmly and report from a safe place.' },
  { id: 'q2', q: 'Which action is correct for snakebite first aid?', options: ['Cut the wound and suck out venom', 'Tie a tight tourniquet', 'Keep the victim calm and still and go to hospital immediately', 'Wait for symptoms'], answer: 2, why: 'Cutting, sucking and tight tourniquets cause harm. Fast hospital transport matters most.' },
  { id: 'q3', q: 'When should you use the SOS button?', options: ['To test the app', 'Only for a genuine life-threatening emergency', 'When you are bored', 'For crop damage'], answer: 1, why: 'False SOS alerts delay help for people in real danger.' },
  { id: 'q4', q: 'Why is AI species detection not enough to verify a report?', options: ['It is always wrong', 'Only authorised officials verify reports', 'It is too slow', 'It needs internet'], answer: 1, why: 'AI results are suggestions. Verification is an official decision.' },
  { id: 'q5', q: 'Where is it safest to wash or bathe in tidal creeks?', options: ['Any muddy bank', 'A fenced or protected ghat', 'Near mangrove roots', 'Alone at dusk'], answer: 1, why: 'Crocodiles use unprotected muddy banks.' },
];

export const SEED_HOTSPOTS: Hotspot[] = [
  { id: 'hz1', name: 'Sajnekhali buffer', lat: 22.1, lng: 88.83, radius: 5500, risk: 'high', count: 9, advisory: 'Avoid creek banks at dusk and dawn.' },
  { id: 'hz2', name: 'Dayapur creek', lat: 22.08, lng: 88.74, radius: 4200, risk: 'medium', count: 6, advisory: 'Travel in groups; carry a light.' },
  { id: 'hz3', name: 'Jharkhali edge', lat: 21.99, lng: 88.69, radius: 4800, risk: 'critical', count: 12, advisory: 'Stay away from the forest edge after dark.' },
  { id: 'hz4', name: 'Basanti fringe', lat: 22.17, lng: 88.67, radius: 3600, risk: 'low', count: 3, advisory: 'Be alert near ponds and fields.' },
  { id: 'hz5', name: 'Namkhana coast', lat: 21.766, lng: 88.237, radius: 4500, risk: 'medium', count: 5, advisory: 'Avoid unprotected landing points.' },
];

export const SEED_MISSIONS: Mission[] = [
  { id: 'MS-026', area: 'Gosaba Range', objective: 'Hotspot surveillance', droneId: 'dr1', status: 'in_progress', progress: 72 },
  { id: 'MS-025', area: 'Sajnekhali buffer', objective: 'Tiger movement check', droneId: 'dr2', status: 'in_progress', progress: 54 },
  { id: 'MS-024', area: 'Dayapur creek', objective: 'Conflict zone scan', droneId: 'dr3', status: 'completed', progress: 100 },
  { id: 'MS-023', area: 'Namkhana coast', objective: 'Coastal wildlife survey', droneId: 'dr4', status: 'scheduled', progress: 0 },
];

export const SEED_USERS: AppUser[] = [
  DEMO_CITIZEN,
  { uid: 'u1', name: 'Bikash Mistry', phone: '+919830011122', role: 'approved_volunteer', language: 'bn', region: 'Sajnekhali', status: 'active', verified: true },
  { uid: 'u2', name: 'Kabita Sardar', phone: '+919830033344', role: 'citizen', language: 'bn', region: 'Dayapur', status: 'active', verified: true },
  { uid: 'u3', name: 'Tapan Halder', phone: '+919830055566', role: 'citizen', language: 'bn', region: 'Basanti', status: 'suspended', verified: true },
  { uid: 'u4', name: 'Rina Bar', phone: '+919830077788', role: 'citizen', language: 'hi', region: 'Canning', status: 'active', verified: true },
  { uid: 'u5', name: 'Sumita Mondal', phone: '+919830088811', role: 'approved_volunteer', language: 'bn', region: 'Gosaba', status: 'active', verified: true },
  { uid: 'u6', name: 'Rahul Naskar', phone: '+919830088822', role: 'approved_volunteer', language: 'bn', region: 'Sajnekhali', status: 'active', verified: true },
  { uid: 'u7', name: 'Mamata Gayen', phone: '+919830088833', role: 'approved_volunteer', language: 'bn', region: 'Basanti', status: 'active', verified: true },
  { uid: 'u8', name: 'Sanjay Mandal', phone: '+919830088844', role: 'approved_volunteer', language: 'bn', region: 'Namkhana', status: 'active', verified: false },
];
export const SEED_LEADERS = [
  { name: 'Sumita M.', district: 'South 24 Parganas', contributions: 14, tokens: 580 },
  { name: 'Bikash M.', district: 'South 24 Parganas', contributions: 11, tokens: 340 },
  { name: 'Kabita S.', district: 'South 24 Parganas', contributions: 9, tokens: 260 },
  { name: 'Rahul N.', district: 'North 24 Parganas', contributions: 6, tokens: 120 },
  { name: 'Mamata G.', district: 'South 24 Parganas', contributions: 4, tokens: 70 },
  { name: 'Tapan H.', district: 'South 24 Parganas', contributions: 2, tokens: 30 },
];
export const SEED_CERTS: Cert[] = [
  { id: 'cert1', number: 'VS-CERT-2026-0001', recipient: 'Sumita M.', category: 'Community Contribution', summary: '14 verified wildlife reports', issuedBy: 'Priya Sen, Range Officer', issuedAt: hoursAgo(24 * 12), code: 'K7Q2-M9XA' },
];
export const SEED_AUDIT: AuditLog[] = [
  { id: 'a1', at: hoursAgo(5), actor: 'Priya Sen', action: 'sos.dispatch', target: 'SOS-200', detail: 'Team A assigned' },
  { id: 'a2', at: hoursAgo(26), actor: 'Subrata Das', action: 'report.verify', target: 'VS-1012' },
  { id: 'a3', at: hoursAgo(48), actor: 'Meera Banerjee', action: 'official.invite', target: 'ranger.new@vansanchar.demo' },
];
export const SEED_NOTIFS: Notif[] = [
  { id: 'n1', type: 'nearby', title: 'Verified tiger sighting ~6 km away', body: 'Near Sajnekhali. Avoid creek banks at dusk.', severity: 'high', createdAt: hoursAgo(3), read: false, link: '/app/map', recipient: 'citizen' },
  { id: 'n2', type: 'advisory', title: 'High-risk zone advisory', body: 'Jharkhali edge is marked high risk this week (rule-based estimate).', severity: 'medium', createdAt: hoursAgo(20), read: false, link: '/app/predictions', recipient: 'citizen' },
  { id: 'n3', type: 'training', title: 'Training reminder', body: 'Complete "Snakebite first aid" to unlock volunteer tasks.', createdAt: hoursAgo(48), read: true, link: '/app/education', recipient: 'citizen' },
  { id: 'o1', type: 'sos', title: 'SOS-201 unacknowledged', body: 'Near Sajnekhali. Acknowledge within SLA.', severity: 'critical', createdAt: hoursAgo(0.2), read: false, link: '/official/sos', recipient: 'official' },
  { id: 'o2', type: 'report', title: '3 new reports pending', body: 'Review in the verification queue.', severity: 'medium', createdAt: hoursAgo(1), read: false, link: '/official/verification', recipient: 'official' },
];

// Local knowledge base for the demo assistant (retrieval over reviewed snippets)
export const KB = [
  { id: 'kb1', title: 'Tiger encounter safety', keywords: ['tiger', 'bagh', 'village', 'forest', 'spotted', 'encounter'], text: 'Do not run. Stay calm and keep your group together. Move away slowly without turning your back, speak firmly, and never approach to take photos. Once safe, report the sighting with VanSanchar and warn neighbours. If someone is in immediate danger, use SOS and call 112.' },
  { id: 'kb2', title: 'Snakebite first aid', keywords: ['snake', 'snakebite', 'bite', 'bitten', 'cobra', 'venom'], text: 'Keep the person calm and still, immobilise the limb, remove rings or tight items, and get to a hospital immediately (call 108). Do not cut or suck the wound, do not apply a tight tourniquet, and do not wait for symptoms or try traditional remedies. Do not catch or kill the snake. A photo from a safe distance helps only if it causes no delay.' },
  { id: 'kb3', title: 'Elephant & crop conflict', keywords: ['elephant', 'farmland', 'crop', 'herd', 'field'], text: 'Keep a long distance, stay indoors or move upwind and away, never use fire or loud crackers near a herd, and alert the forest helpline. Report crop damage so compensation can be reviewed.' },
  { id: 'kb4', title: 'Using SOS', keywords: ['sos', 'emergency', 'help', 'button', 'use'], text: 'SOS is for genuine life-threatening emergencies only. Tap SOS, confirm, and wait for the 3-second countdown (you can cancel). The alert reaches on-duty officials as UNVERIFIED first. If you are offline it is saved and sent later, and will show "Not sent". Always call 112 directly for immediate danger.' },
  { id: 'kb5', title: 'Crocodile safety', keywords: ['crocodile', 'creek', 'bathing', 'river', 'water'], text: 'Avoid bathing, washing or fishing at unprotected muddy banks. Use fenced ghats. Keep children away from the water edge. Report sightings near bathing areas.' },
  { id: 'kb6', title: 'Evacuation help', keywords: ['evacuation', 'flood', 'cyclone', 'shelter', 'evacuate'], text: 'Move to the nearest cyclone shelter early, carry drinking water, a torch, documents and medicines, avoid crossing creeks during surge, and call 1070 or 112 if trapped.' },
  { id: 'kb7', title: 'Hospitals and officers', keywords: ['hospital', 'nearest', 'officer', 'forest', 'doctor'], text: 'See the SARPA section for hospitals near you and the emergency numbers on the Home page. Anti-venom availability may be out of date; always call to confirm. Opening a dialer does not guarantee a call is connected.' },
];
