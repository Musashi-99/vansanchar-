export type Role = 'citizen' | 'volunteer_applicant' | 'approved_volunteer' | 'forest_guard' | 'range_officer' | 'deputy_ranger' | 'dfo' | 'platform_admin' | 'content_editor';
export type Animal = 'tiger' | 'elephant' | 'leopard' | 'crocodile' | 'snake' | 'bear' | 'boar' | 'other' | 'unknown';
export type Severity = 'low' | 'medium' | 'high' | 'critical';
export type ReportStatus = 'pending' | 'under_review' | 'verified' | 'rejected' | 'resolved';
export type VerificationStatus = 'pending' | 'under_review' | 'verified' | 'rejected';
export type ResponseStatus = 'received' | 'acknowledged' | 'dispatching' | 'en_route' | 'on_scene' | 'resolved' | 'cancelled';

export interface GeoPoint { lat: number; lng: number; label: string; accuracy?: number; capturedAt?: string; manual?: boolean }
export interface TimelineEvent { at: string; actor: string; from?: string; to: string; note?: string }

export interface Report {
  id: string; clientMutationId: string; reporterId: string; reporterName: string; reporterPhone: string;
  animal: Animal; severity: Severity; description: string; count?: number; direction?: string; injury?: boolean; damage?: boolean;
  location: GeoPoint; jurisdiction: string; occurredAt: string; submittedAt: string;
  status: ReportStatus; version: number; photo?: string; hasVoice: boolean; voiceSeconds?: number;
  syncStatus: 'synced' | 'queued'; publicNote?: string; assignedTeam?: string; duplicateOf?: string; sosId?: string;
  withdrawn?: boolean; checklist?: Record<string, boolean>; rejectReason?: string;
  attestation?: { status: 'pending' | 'confirmed'; hash: string; txId?: string; network: string };
  events: TimelineEvent[]; demo?: boolean;
}

export interface SOS {
  id: string; requesterId: string; requesterName: string; requesterPhone: string; location: GeoPoint;
  type: string; description: string; verificationStatus: VerificationStatus; responseStatus: ResponseStatus;
  createdAt: string; assignedTeam?: string; sent: boolean; cancelled?: boolean; rejectReason?: string;
  events: TimelineEvent[]; slaMinutes: number;
}

export interface Notif { id: string; type: string; title: string; body: string; severity?: Severity; createdAt: string; read: boolean; dismissed?: boolean; link?: string; recipient: 'citizen' | 'official' }
export interface Team { id: string; name: string; jurisdiction: string; members: number; capabilities: string[]; availability: 'available' | 'busy' | 'off_duty'; assignment?: string; phone: string }
export interface Drone { id: string; name: string; status: 'patrolling' | 'returning' | 'charging' | 'offline' | 'maintenance'; battery: number; signal: number; altitude: number; speed: number; lat: number; lng: number; mode: 'rgb' | 'thermal'; recording: boolean; zone: string }
export interface Mission { id: string; area: string; objective: string; droneId: string; status: 'in_progress' | 'completed' | 'scheduled'; progress: number }
export interface Hospital { id: string; name: string; lat: number; lng: number; phone: string; antiVenom: 'available' | 'unavailable' | 'unknown'; confirmedAt: string; area: string }
export interface Contact { id: string; name: string; phone: string; area: string; verifiedAt: string; kind: 'forest' | 'police' | 'medical' | 'rescue' | 'disaster' }
export interface VolTask { id: string; title: string; description: string; place: string; lat: number; lng: number; urgency: Severity; requiredTraining: string; capacity: number; accepted: string[]; points: number; deadline: string; status: 'open' | 'closed' }
export interface VolAssignment { id: string; taskId: string; status: 'accepted' | 'in_progress' | 'submitted' | 'approved' | 'rejected_completion' | 'cancelled'; notes?: string; acceptedAt: string }
export interface Edu { id: string; type: 'workshop' | 'safety'; topic: string; title: string; summary: string; duration: number; language: string; reviewed: string; reviewer: string; version: string; steps?: string[]; offlineSize?: number }
export interface QuizQ { id: string; q: string; options: string[]; answer: number; why: string }
export interface LedgerEntry { id: string; amount: number; reason: string; sourceType: string; sourceId: string; at: string }
export interface Cert { id: string; number: string; recipient: string; category: string; summary: string; issuedBy: string; issuedAt: string; code: string; revoked?: string }
export interface AuditLog { id: string; at: string; actor: string; action: string; target: string; detail?: string }
export interface Hotspot { id: string; name: string; lat: number; lng: number; radius: number; risk: Severity; count: number; advisory: string }
export interface AppUser { uid: string; name: string; phone?: string; email?: string; role: Role; address?: string; blood?: string; emergency?: { name: string; phone: string }; language: string; region: string; status: 'active' | 'suspended' | 'invited'; officialId?: string; designation?: string; jurisdiction?: string; alertRadius?: number; verified?: boolean; consent?: { location: boolean; voice: boolean; push: boolean } }
export interface ScanResult { id: string; at: string; fileName: string; preview?: string; candidates: { name: string; scientific: string; likelihood: 'low' | 'moderate' | 'high'; note: string }[]; unknown: boolean; status: string }
export interface ChatMsg { id: string; role: 'user' | 'assistant'; text: string; sources?: { id: string; title: string }[]; emergency?: boolean }
