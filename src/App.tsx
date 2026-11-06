import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CitizenLayout, RequireAuth, homeFor, useHydrated } from './components/Layouts';
import { useStore } from './lib/store';
import { SidebarShell } from './neon/Shells';
import { Spinner } from './components/ui';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const L = (f: () => Promise<{ default: React.ComponentType<any> }>) => lazy(f);
const Landing = L(() => import('./pages/public/Landing'));
const Login = L(() => import('./pages/public/Login'));
const Signup = L(() => import('./pages/public/Signup'));
const OfficialLogin = L(() => import('./pages/public/OfficialLogin'));
const Static = L(() => import('./pages/public/Static'));
const Verify = L(() => import('./pages/public/Verify'));
const Home = L(() => import('./pages/citizen/Home'));
const MapPage = L(() => import('./pages/citizen/MapPage'));
const Reports = L(() => import('./pages/citizen/Reports'));
const ReportDetail = L(() => import('./pages/citizen/ReportDetail'));
const Analytics = L(() => import('./pages/citizen/Analytics'));
const Education = L(() => import('./pages/citizen/Education'));
const Profile = L(() => import('./pages/citizen/Profile'));
const AIDetect = L(() => import('./pages/citizen/AIDetection'));
const Predictions = L(() => import('./pages/citizen/Predictions'));
const Achievements = L(() => import('./pages/citizen/Achievements'));
const Volunteer = L(() => import('./pages/citizen/Volunteer'));
const Sarpa = L(() => import('./pages/citizen/Sarpa'));
const Assistant = L(() => import('./pages/citizen/Assistant'));
const OfflineGuides = L(() => import('./pages/citizen/OfflineGuides'));
const Notifications = L(() => import('./pages/citizen/Notifications'));
const Overview = L(() => import('./pages/official/Overview'));
const OReports = L(() => import('./pages/official/Reports'));
const OReportDetail = L(() => import('./pages/official/ReportDetail'));
const Verification = L(() => import('./pages/official/Verification'));
const OSos = L(() => import('./pages/official/Sos'));
const Dispatch = L(() => import('./pages/official/Dispatch'));
const Drone = L(() => import('./pages/official/Drone'));
const Leaderboard = L(() => import('./pages/official/Leaderboard'));
const Certificates = L(() => import('./pages/official/Certificates'));
const OVolunteers = L(() => import('./pages/official/Volunteers'));
const OAnalytics = L(() => import('./pages/official/Analytics'));
const OfficialDashboard = L(() => import('./neon/pages/OfficialDashboard'));
const OfficialReports = L(() => import('./neon/pages/OfficialReports'));
const OfficialSos = L(() => import('./neon/pages/OfficialSos'));
const OfficialDispatch = L(() => import('./neon/pages/OfficialDispatch'));
const OfficialHotspot = L(() => import('./neon/pages/OfficialHotspot'));
const OfficialDrone = L(() => import('./neon/pages/OfficialDrone'));
const OfficialVolunteers = L(() => import('./neon/pages/OfficialVolunteers'));
const OfficialLeaderboard = L(() => import('./neon/pages/OfficialLeaderboard'));
const OfficialPredictive = L(() => import('./neon/pages/OfficialPredictive'));
const OfficialMisc = L(() => import('./neon/pages/OfficialMisc'));
const HomeView = L(() => import('./neon/pages/HomeView'));
const ReportPage = L(() => import('./neon/pages/ReportPage'));
const MapHotspot = L(() => import('./neon/pages/MapHotspot'));
const SosPage = L(() => import('./neon/pages/SosPage'));
const AiDetectPage = L(() => import('./neon/pages/AiDetectPage'));
const Admin = L(() => import('./pages/admin/Admin'));
const AdminDashboard = L(() => import('./neon/pages/AdminDashboard'));
const AdminUsers = L(() => import('./neon/pages/AdminUsers'));
const AdminJurisdictions = L(() => import('./neon/pages/AdminJurisdictions'));

const NotFound = () => (
  <div className="mesh flex min-h-dvh flex-col items-center justify-center gap-2 p-6 text-center"><h1 className="text-2xl font-bold">Page not found</h1>
    <a href="/" className="rounded-xl bg-primary px-4 py-2 text-primary-fg">Go home</a></div>
);

function Entry() {
  const user = useStore((s) => s.user);
  const ready = useHydrated();
  if (!ready) return <div className="mesh min-h-dvh"><Spinner /></div>;
  return <Navigate to={user ? homeFor(user.role) : '/login'} replace />;
}

export default function App() {
  return (
    <Suspense fallback={<div className="mesh min-h-dvh"><Spinner /></div>}>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/welcome" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/official/login" element={<OfficialLogin />} />
        <Route path="/privacy" element={<Static kind="privacy" />} />
        <Route path="/terms" element={<Static kind="terms" />} />
        <Route path="/help" element={<Static kind="help" />} />
        <Route path="/offline" element={<Static kind="offline" />} />
        <Route path="/verify/:code" element={<Verify />} />

        <Route path="/app" element={<RequireAuth roles="citizen"><CitizenLayout /></RequireAuth>}>
          <Route index element={<Navigate to="home" replace />} />
          <Route path="home" element={<HomeView />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="sos" element={<SosPage />} />
          <Route path="map" element={<MapHotspot />} />
          <Route path="reports" element={<Reports />} />
          <Route path="reports/:id" element={<ReportDetail />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="education" element={<Education />} />
          <Route path="profile" element={<Profile />} />
          <Route path="ai-detection" element={<AiDetectPage />} />
          <Route path="predictions" element={<Predictions />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="sarpa" element={<Sarpa />} />
          <Route path="assistant" element={<Assistant />} />
          <Route path="offline-guides" element={<OfflineGuides />} />
          <Route path="notifications" element={<Notifications />} />
        </Route>

        <Route path="/official" element={<RequireAuth roles="official"><SidebarShell /></RequireAuth>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OfficialDashboard />} />
          <Route path="reports" element={<OfficialReports />} />
          <Route path="reports/:id" element={<OReportDetail />} />
          <Route path="verification" element={<Verification />} />
          <Route path="sos" element={<OfficialSos />} />
          <Route path="dispatch" element={<OfficialDispatch />} />
          <Route path="hotspot" element={<OfficialHotspot />} />
          <Route path="drone" element={<OfficialDrone />} />
          <Route path="volunteers" element={<OfficialVolunteers />} />
          <Route path="analytics" element={<OfficialPredictive />} />
          <Route path="analytics/incidents" element={<OAnalytics />} />
          <Route path="analytics/movement" element={<OAnalytics />} />
          <Route path="analytics/models" element={<OAnalytics />} />
          <Route path="leaderboard" element={<OfficialLeaderboard />} />
          <Route path="certificates" element={<OfficialLeaderboard />} />
          <Route path="resources" element={<OfficialMisc kind="resources" />} />
          <Route path="emergency-contacts" element={<OfficialMisc kind="contacts" />} />
          <Route path="downloads" element={<OfficialMisc kind="downloads" />} />
          <Route path="settings" element={<OfficialMisc kind="settings" />} />
          <Route path="legacy/overview" element={<Overview />} />
          <Route path="legacy/sos" element={<OSos />} />
          <Route path="legacy/dispatch" element={<Dispatch />} />
          <Route path="legacy/drone" element={<Drone />} />
          <Route path="legacy/leaderboard" element={<Leaderboard />} />
          <Route path="legacy/certificates" element={<Certificates />} />
          <Route path="legacy/volunteers" element={<OVolunteers />} />
        </Route>

        <Route path="/admin" element={<RequireAuth roles="admin"><SidebarShell admin /></RequireAuth>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="jurisdictions" element={<AdminJurisdictions />} />
          <Route path=":section" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
