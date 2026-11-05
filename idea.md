[04/11, 20:43] KRISHNA.R: VanSanchar feature list :-Phone Login: Provides identity and accountability for citizens.
Citizen Profile: Stores safety-related personal details.
Conflict Reporting: Captures photo, voice, GPS, animal, severity, and notes.
Offline Queue: Saves reports without internet.
Automatic Sync: Uploads pending reports after reconnection.
Hotspot Map: Displays nearby wildlife conflict zones.
SOS: Handles life-threatening emergencies through verification.
Notifications: Warns citizens about nearby risks and status changes.
Weather Risk: Connects weather conditions with wildlife activity.
Analytics: Converts reports into trends and operational insights.
AI Detection: Identifies wildlife from images and gives safety advice.
Predictive Heatmap: Estimates future conflict risk.
Education: Teaches prevention and emergency procedures.
Quiz: Tests safety knowledge and rewards learning.
Offline Guides: Keeps critical information available without internet.
Achievements: Rewards verified community participation.
Van Mitra: Coordinates trained volunteers.
SARPA: Provides snake and snakebite emergency support.
AI Assistant: Answers wildlife safety questions.
Official Portal: Gives forest officials operational control.
Verification System: Prevents false and untrusted reports.
Drone Patrol: Provides aerial surveillance and AI target detection.
Leaderboard: Recognizes trusted citizens and volunteers.
Certificates: Provides official appreciation for community contribution.
Multi-language Support: Makes the platform accessible across Indian communities.
Dark Mode: Improves usability in different lighting conditions.
PWA Installation: Allows the website to behave like an installed application.
Push Notifications: Supports alerts even when the application is not actively open.
CSV Export: Supports government reporting and analysis.
[04/11, 20:56] KRISHNA.R: You are a senior full-stack engineer, system architect, geospatial engineer,
security engineer, AI integration engineer, PWA specialist, and product designer.

Your task is to transform the existing VanSanchar frontend into a complete,
secure, persistent, real-time, full-stack wildlife conflict management platform.

This is an IMPLEMENTATION task, not a design-only task or a request for a static
prototype.

Do not stop after creating screens.
Implement the database, authentication, permissions, backend services, APIs,
storage, notifications, background jobs, offline synchronization, integrations,
tests, and deployment documentation.

======================================================================
1. CORE PRODUCT IDENTITY
======================================================================

Product name:
VanSanchar

Tagline:
Bridging Communities & Wildlife

Primary deployment region:
Sundarbans, West Bengal, India.

Primary administrative focus:
South 24 Parganas and relevant surrounding forest-border communities.

Primary wildlife identity:
Royal Bengal Tiger.

Other supported wildlife:
- Estuarine crocodile
- Snake
- Wild boar
- Elephant
- Leopard
- Bear
- Other wildlife

The platform connects:
- Citizens and villagers
- Forest department officials
- Trained Van Mitra volunteers
- Wildlife rescue teams
- Hospitals
- Emergency responders
- Platform administrators

Primary goals:
1. Allow citizens to report wildlife incidents safely.
2. Allow officials to verify and manage reports.
3. Coordinate emergency response.
4. Warn nearby communities.
5. Operate in areas with unreliable internet.
6. Provide trustworthy safety information.
7. Support multilingual rural accessibility.
8. Generate reliable operational analytics.
9. Reward verified community contributions.
10. Protect people without encouraging harm to wildlife.

Brand rules:
- Always use “VanSanchar”.
- Never use “Vanabandhu”.   - Do not retain mixed Dehradun/Uttarakhand demo locations in the Sundarbans dataset.
- Do not imply government endorsement, official authorization, or live emergency
  dispatch unless those capabilities have actually been configured and approved.
- Clearly separate demonstration data from production data.

======================================================================
2. EXISTING PROJECT AND DESIGN PRESERVATION
======================================================================

If the existing repository is available:

1. Read repository instructions first.
2. Inspect package.json, application entry points, styling, components, and
   existing backend files.
3. Treat the current repository root as authoritative.
4. Preserve existing user changes.
5. Preserve the current visual design.
6. Upgrade existing components rather than replacing the entire application.
7. Keep existing working layouts, animations, typography, spacing, colors,
   responsiveness, and interaction patterns.
8. Replace local/demo business logic with real services incrementally.

Existing important frontend components include:

- App
- SplashScreen
- AppLogo
- LoginPage
- SignUpPage
- HomePage
- ConflictReportForm
- HotspotMapPage
- SOSButton
- NotificationsPanel
- AnalyticsDashboard
- AISpeciesDetection
- PredictiveHeatmap
- EducationSection
- AchievementBadges
- VolunteerNetwork
- SarpaModule
- AIChatbot
- UserProfileEdit
- LocationTracker
- OfflineIndicator
- OfflineSyncManager
- OfflineSafetyGuide
- OfficialLoginPage
- OfficialDashboard
- VerificationSystem
- DronePatrolDashboard
- WeatherWidget
- ShareButton
- Footer

Existing utilities include:

- LanguageContext
- ThemeContext
- translations
- useGeolocation
- offlineStorage
- pwa
- csvExport

Important existing technical fixes must be preserved:

- React 18 must use a compatible React Leaflet version, such as 4.2.1.
- Do not install React Leaflet 5 into a React 18 application.
- DOM-backed Radix wrappers that receive refs must use React.forwardRef.
- Preserve ref forwarding in DialogOverlay, DialogContent, DialogTrigger,
  DialogClose, DialogTitle, and DialogDescription.
- Use stable React keys for chart cells and mapped content.
- Use normal package imports, not source imports containing package versions.
- Do not reintroduce escaped template literal parser errors.

If a basic Supabase/Hono key-value scaffold exists:
- Audit whether any production data uses it.
- Do not assume it is a complete backend.
- Do not leave unauthenticated generic key-value read/write endpoints exposed.
- Do not maintain Firebase and Supabase as competing sources of truth.
- For this specification, use Firebase as the canonical backend.
- If legacy data exists, provide an explicit migration plan and migration script.
- Do not silently discard existing records.

If building from scratch:
Recreate the same nature-green visual language described below.

======================================================================
3. REQUIRED FULL-STACK ARCHITECTURE
======================================================================

Frontend:
- React
- TypeScript
- Vite
- Tailwind CSS
- Radix/shadcn-style reusable UI components
- Lucide React
- Motion/React
- React Router
- TanStack Query or an equivalent query-cache layer
- Recharts
- Leaflet and React Leaflet
- Sonner
- IndexedDB

Backend:
- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Storage
- Cloud Functions, preferably second generation
- Firebase Cloud Messaging
- Cloud Tasks or equivalent managed job queue
- Cloud Scheduler for periodic work
- Secret Manager for private credentials

API:
- A versioned HTTPS API under /api/v1
- TypeScript backend
- Runtime request validation
- OpenAPI documentation
- Consistent error format
- Cursor pagination
- Idempotency support for critical writes

Real-time:
- Firestore listeners on appropriately authorized, bounded queries
- Real-time report updates
- Real-time SOS updates
- Real-time notifications
- Real-time reward balances
- Real-time volunteer task updates
- Real-time official dashboard updatesAI:
- Server-side Gemini integration
- Streaming chatbot responses
- Vision-based species detection
- Retrieval-augmented safety guidance
- Speech transcription/translation adapter

Additional integrations:
- Weather provider
- Vapi voice alert adapter
- Stellar Testnet verification adapter
- Optional approved email/SMS provider

Hosting:
- Firebase Hosting for frontend
- Firebase Functions or compatible managed server runtime for backend

Do not migrate to Next.js merely because an old specification mentions it.
Keep the existing React + Vite frontend unless a concrete technical requirement
requires a separately approved migration.

======================================================================
4. VISUAL DESIGN SYSTEM
======================================================================

Primary font:
Outfit.

Weights:
300, 400, 500, 600, 700, 800.

Do not switch the project to a private/custom font unless the actual font files
and required permissions are supplied.

Light theme:
- Background: #ECF5EC
- Foreground: #1A2E1A
- Card: #F4FBF4
- Primary: #2D5016
- Primary foreground: #F8FAF7
- Secondary: #E8F4E0
- Muted foreground: #5A7350
- Accent: #D4E8C8
- Destructive: #C53030
- Border: rgba(45,80,22,0.15)
- Input background: #F0F6ED
- Ring: #5A9C3A

Dark theme:
- Background: #132215
- Foreground: #E8F4E0
- Card: #1A2418
- Primary: #7FB069
- Primary foreground: #0F1810
- Secondary: #2A3F25
- Muted foreground: #A8C89D
- Accent: #3D5A36
- Destructive: #E85D75
- Border: rgba(127,176,105,0.20)

Semantic colors:
- Critical: red
- High risk: orange
- Medium risk: amber/yellow
- Low risk: green
- Information: blue
- AI: purple/blue
- Official portal: amber/orange
- Volunteers: emerald
- SARPA: orange/amber

Layout:
- Mobile-first citizen experience
- Citizen content max width approximately 896px
- Official content max width approximately 1400px
- 16px mobile content padding
- Soft rounded cards
- Default radius approximately 12px
- Sticky translucent header
- Fixed citizen bottom navigation
- Floating SOS above bottom navigation
- Subtle green mesh background
- Wildlife photography where appropriate
- Low-opacity nature watermark
- High readability in field conditions

Motion:
- Gentle fade and slide transitions
- Tap feedback
- Subtle hover lift
- Pulsing SOS ring
- Restrained urgency animation
- Respect reduced-motion settings

Do not use decorative emojis as a replacement for the icon system.

======================================================================
5. PORTALS, ROLES, AND PERMISSIONS
======================================================================

Two primary portals:
A. Citizen Portal
B. Forest Official Portal

Additional functional workspaces:
C. Van Mitra Volunteer Workspace
D. SARPA Emergency Workspace
E. Administration and Content Management Workspace

The administration workspace is an operational requirement for a real backend,
not a claim that it already exists in the frontend.

Roles:
- citizen
- volunteer_applicant
- approved_volunteer
- forest_guard
- range_officer
- deputy_ranger
- dfo
- platform_admin
- content_editor
- dispatcher, if implemented as a distinct official permission set

Authorization must be enforced server-side.

Permissions:

Citizen:
- Read own private profile
- Update allowed profile fields
- Create reports and SOS requests
- Read own full reports
- Read sanitized public alerts
- Read own notifications
- Access education
- Access personal AI history
- Apply to become a volunteer

Approved volunteer:
- Citizen permissions
- Read assigned tasks
- Accept eligible tasks
- Submit task evidence
- Update own assignment progress
- Access required training
- Never access unrelated citizens’ private information

Forest guard:
- Read reports within assigned jurisdiction
- Add field notes
- Contact relevant reporters
- Update assigned case progress
- Access authorized precise locations

Range officer / deputy ranger:
- Verify and reject reports
- Assign responders
- Manage cases within jurisdiction
- Review volunteer completion
- Approve relevant operational actionsDFO:
- Division-level oversight
- Escalation
- Staff management within permitted scope
- Approvals and operational analytics

Platform admin:
- Manage application configuration
- Approve official invitations
- Manage jurisdiction mappings
- Manage integrations
- Review security/audit events
- No unrestricted use of personal data without an operational reason

Content editor:
- Manage safety guides, translations, workshops, and quizzes
- No incident verification or user-role escalation permissions

Roles must come from trusted backend-managed claims/records.
Users must never grant themselves an official role through a client request.

======================================================================
6. ROUTES AND NAVIGATION
======================================================================

Public:
- /
- /login
- /signup
- /official/login
- /privacy
- /terms
- /help
- /offline

Citizen:
- /app/home
- /app/map
- /app/reports
- /app/reports/:id
- /app/analytics
- /app/education
- /app/profile
- /app/ai-detection
- /app/predictions
- /app/achievements
- /app/volunteer
- /app/sarpa
- /app/assistant
- /app/offline-guides
- /app/notifications

Official:
- /official/overview
- /official/reports
- /official/reports/:id
- /official/verification
- /official/sos
- /official/dispatch
- /official/drone
- /official/leaderboard
- /official/certificates
- /official/volunteers
- /official/analytics

Admin:
- /admin/users
- /admin/officials
- /admin/jurisdictions
- /admin/content
- /admin/translations
- /admin/hospitals
- /admin/emergency-contacts
- /admin/integrations
- /admin/audit
- /admin/settings

Citizen bottom navigation must remain:
1. Home
2. Map
3. Report
4. AI Analytics
5. Education
6. Profile

Report is a modal action.

Make additional features discoverable through:
- A header More menu
- Dashboard quick-action cards
- Contextual actions

Do not create unreachable modules.

Every route must support:
- Direct opening
- Browser back/forward navigation
- Authentication checks
- Permission checks
- Loading state
- Error state
- Unauthorized state

======================================================================
7. AUTHENTICATION AND ACCOUNT LIFECYCLE
======================================================================

Citizen authentication:
- Real Firebase phone OTP when SMS configuration is available
- Google sign-in
- Email/password as an alternative
- Explicit development-only demo login

Phone authentication:
- Normalize numbers to E.164
- India defaults to +91
- Indian national number validation
- Do not force all international numbers to ten digits
- Six-digit OTP entry
- Resend timer
- Attempt limits
- Expiry handling
- Incorrect OTP errors
- Abuse protection
- Firebase-supported bot protection

Demo OTP:
- Available only when an explicit demo flag is enabled
- Show a visible demo banner
- Never permit demo OTP bypass in production

Signup:
1. Verify authentication method.
2. Ask for name.
3. Ask for optional address.
4. Ask for optional blood group.
5. Ask for optional emergency contact.
6. Ask for language.
7. Ask for home region/jurisdiction where appropriate.
8. Explain location and notification permissions.
9. Create the backend profile.
10. Open citizen home.

Official authentication:
- Separate login interface
- Real email/password or Google authentication
- Official ID linked to an authenticated account
- Invite/approval workflow
- Account status: invited, active, suspended, revoked
- Jurisdiction mapping
- Reauthentication for sensitive actions
- MFA where supported and configured
- No “accept any password” production behavior

Account features:
- Session restoration
- Logout
- Password reset
- Email verification where relevant
- Account linking without duplicate identities
- Deactivation
- Personal-data deletion request
- Emergency record retention policy
- Lost access handling

Use Firebase UID as the user identifier.
Do not use phone number as the database primary key.======================================================================
8. DATABASE MODEL
======================================================================

Use Firestore with documented collections, indexes, references, and access rules.

Use server timestamps.
Store timestamps in UTC.
Display regional time using Asia/Kolkata unless the user selects otherwise.

Prefer explicit enums and schema validation.

Collections:

1. users
Fields:
- uid
- displayName
- normalizedPhone
- email
- photoStoragePath
- address
- bloodGroup
- emergencyContacts
- preferredLanguage
- jurisdictionIds
- accountStatus
- notificationPreferences
- locationConsent
- voiceAlertConsent
- createdAt
- updatedAt

Keep role assignment server-managed.

2. officers
- userId
- officialId
- designation
- divisionId
- rangeIds
- permissions
- approvalStatus
- invitedBy
- approvedBy
- approvedAt
- dutyStatus

3. jurisdictions
- name
- type
- parentId
- boundaryGeometry or a documented spatial reference
- geohashCoverage
- emergencyContacts
- active

4. species
- commonName
- scientificName
- localizedNames
- conservationStatus
- conservationSource
- safetyGuideIds
- regionalPresence

5. wildlife_reports
- id
- reporterId
- animalType
- speciesId
- severity
- description
- originalLanguage
- translatedDescription
- exactLocation
- locationAccuracy
- locationCapturedAt
- locationLabel
- jurisdictionId
- occurredAt
- submittedAt
- mediaIds
- status
- assignedOfficerIds
- relatedSOSId
- duplicateOf
- version
- clientMutationId
- deletedAt

6. public_incidents
A sanitized projection containing only public-safe fields:
- incidentId
- species label
- severity
- coarse location
- approximate zone geometry
- public status
- public advisory
- public timestamp
- verification indicator

Never put reporter phone numbers or precise sensitive wildlife locations here.

7. report_events
- reportId
- previousStatus
- nextStatus
- actorId
- reason
- notes
- createdAt
- version

8. verification_decisions
- reportId
- reviewerId
- outcome
- evidenceChecklist
- notes
- reasonCode
- createdAt

9. sos_alerts
- requesterId
- relatedReportId
- exactLocation
- locationAccuracy
- locationCapturedAt
- emergencyType
- description
- voiceMediaId
- verificationStatus
- responseStatus
- assignedTeamIds
- acknowledgedAt
- verifiedAt
- resolvedAt
- cancelledAt
- lastKnownLocation
- clientMutationId

10. dispatch_assignments
- incidentId
- incidentType
- teamId
- assignedBy
- priority
- status
- acceptedAt
- dispatchedAt
- arrivedAt
- completedAt
- notes

11. responder_teams
- name
- jurisdictionId
- members
- capabilities
- availability

12. hotspot_zones
- name
- coarseGeometry
- geohashCoverage
- riskLevel
- sourceWindow
- incidentCount
- updatedAt
- dataSource
- advisory

13. notifications
- recipientId
- type
- titleKey
- localizedPayload
- incidentId
- createdAt
- readAt
- dismissedAt

14. notification_deliveries
- notificationId
- channel
- providerMessageId
- status
- attempts
- sentAt
- deliveredAt
- failedAt
- failureCode

15. device_tokens
- userId
- token
- platform
- permissionState
- updatedAt

16. volunteer_applications
- userId
- region
- trainingStatus
- applicationStatus
- reviewedBy
- reviewedAt

17. volunteer_tasks
- title
- description
- jurisdictionId
- location
- urgency
- requiredTraining
- capacity
- status
- points
- expiresAt

18. volunteer_assignments
- taskId
- volunteerId
- status
- acceptedAt
- evidenceMediaIds
- completionNotes
- reviewedBy
- completedAt

19. education_content
- type
- title
- localizedContent
- language
- mediaPath
- duration
- topic
- publicationStatus
- version
- offlineAvailable
- medicalReviewer
- wildlifeReviewer
- reviewedAt

20. learning_progress
- userId
- contentId
- watchedSeconds
- completed
- updatedAt

21. quizzes
- title
- contentVersion
- questions
- rewardPolicy
- publicationStatus

Keep answer keys private and server-controlled.

22. quiz_attempts
- userId
- quizId
- answers
- score
- startedAt
- submittedAt
- rewardGranted23. reward_ledger
- userId
- amount
- reason
- sourceType
- sourceId
- idempotencyKey
- reversalOf
- approvedBy
- createdAt

24. reward_balances
- userId
- totalTokens
- level
- verifiedReportCount
- updatedAt

25. achievements
26. user_achievements
27. leaderboard_snapshots

28. certificates
- userId
- certificateNumber
- category
- issuedBy
- issuedAt
- storagePath
- verificationCode
- revokedAt
- revocationReason

29. hospitals
- name
- location
- phone
- emergencyServices
- antiVenomStatus
- lastConfirmedAt
- verifiedBy

30. snake_rescuers
- name
- jurisdictionId
- verifiedContact
- availability
- approvalStatus

31. sarpa_cases
- reporterId
- type
- relatedReportId
- relatedSOSId
- hospitalId
- rescuerAssignmentId
- status

32. ai_scans
- userId
- mediaId
- status
- provider
- model
- speciesCandidates
- confidenceType
- safetyGuideIds
- result
- errorCode
- createdAt

33. chat_sessions
34. chat_messages

35. knowledge_documents
36. knowledge_chunks

37. prediction_runs
38. prediction_zones
39. weather_cache

40. drones
41. drone_telemetry
42. drone_missions
43. drone_detections
44. drone_recordings
45. drone_commands

46. blockchain_attestations
47. voice_alert_jobs
48. call_logs

49. emergency_contacts
50. app_settings
51. integration_settings
52. audit_logs
53. outbox_events
54. job_executions

Do not store provider secrets in Firestore settings documents readable by clients.

Document which collections are:
- Client-readable
- Owner-readable
- Official-readable
- Server-only
- Public-safe

======================================================================
9. CORE REPORT STATE MACHINE
======================================================================

Report statuses:
- pending
- under_review
- verified
- rejected
- resolved

Normal transitions:
pending -> under_review
pending -> verified
pending -> rejected
under_review -> verified
under_review -> rejected
verified -> resolved

Reopening requires:
- Authorized role
- Explicit reason
- Audit event
- Version check

Rejected reports must not be silently changed to verified without a new review
decision and audit trail.

Case deletion:
- Citizens may delete an unsubmitted local draft.
- Citizens may request withdrawal of a submitted report.
- Submitted operational records use soft deletion/withdrawal where retention is
  required.
- Do not let citizens hard-delete verified emergency history.

Every transition must:
1. Validate actor permission.
2. Validate jurisdiction.
3. Validate current version.
4. Write a report event.
5. Update canonical report state.
6. Create an outbox event where needed.
7. Trigger downstream work idempotently.

Verification must not be inferred from an AI detection result.

======================================================================
10. CITIZEN HOME PORTAL
======================================================================

Preserve the existing home design and implement real backend-backed data.

Sections:

A. Welcome hero
- Name
- Profile photo
- Region
- Address, if the owner chooses to display it
- Blood group
- Emergency contact
- Own report count
- Token balance
- Government-style initiative badge only with appropriate wording/disclaimer

B. Offline synchronization manager
- Connectivity status
- Pending uploads
- Pending mutations
- Failed items
- Sync Now
- Last successful sync

C. Impact cards
- Families reached
- Verified conflicts
- Notifications delivered
- Resolution rate

Production values must come from documented backend aggregates.
Do not display fabricated impact numbers as real achievements.

D. Large Report Wildlife Conflict button
- Red/orange styling
- Photo/voice/GPS subtitle

E. Compact weather widget
- Current temperature
- Condition
- Humidity
- Wind
- Updated time
- Risk advisory
- Stale-data label

F. Active reports and active users
- Define the measurement period for “active”
- Avoid publishing identifiable user activity

G. Recent alerts
- Photo or safe placeholder
- Species
- Severity
- Public-safe location
- Time
- Status
- Verified badge
- Share
- Own-report controlsH. Important emergency numbers
- Tap-to-call
- Region-specific verified contacts
- Last verified timestamp

I. Quick safety tips

J. Footer
- About
- Privacy
- Contact
- Help
- Accessibility
- Terms
- Conservation message

======================================================================
11. FULL WILDLIFE REPORTING WORKFLOW
======================================================================

Form inputs:
- Photo capture/upload
- Optional voice recording
- GPS location
- Manual location/landmark fallback
- Animal type
- Severity
- Description
- Incident time
- Optional number of animals
- Optional movement direction
- Optional injury or property damage indicators

Animal options:
- Tiger
- Elephant
- Leopard
- Crocodile
- Snake
- Bear
- Wild Boar
- Other
- Unknown / Not Sure

Do not force uncertain users to claim a species with confidence.

Severity:
- Low
- Medium
- High
- Critical

Photo workflow:
1. Select/capture.
2. Validate MIME type and file signature.
3. Enforce size limits.
4. Compress where appropriate.
5. Show preview.
6. Remove/replace.
7. Upload securely.
8. Link media record to report.

Voice workflow:
1. Request microphone permission.
2. Start recording.
3. Show timer and recording state.
4. Stop recording.
5. Preview playback.
6. Remove/re-record.
7. Store Blob locally until uploaded.
8. Upload to private storage.
9. Optionally transcribe.
10. Preserve original language and transcript.

Never persist a temporary blob: URL as the durable audio asset.

GPS workflow:
- Request only after user action or explicit consent
- Show accuracy
- Show timestamp
- Show stale-location warning
- Allow retry
- Allow manual description
- Never claim precise GPS if unavailable

Submission:
1. Validate fields.
2. Generate clientMutationId.
3. Upload media or persist an offline queue item.
4. Submit canonical report.
5. Receive server report ID.
6. Show actual backend acknowledgement.
7. Update My Reports.
8. Notify authorized officials.
9. Create public alert only according to verification policy.

“My Reports”:
- Own reports
- Status timeline
- Officer public notes
- Attached evidence
- Submission/sync status
- Withdrawal request
- Share sanitized advisory

======================================================================
12. OFFLINE-FIRST SYNCHRONIZATION
======================================================================

Keep IndexedDB database:
VanSancharDB

Use versioned migrations.

Stores:
- reportDrafts
- pendingMutations
- pendingMedia
- cachedOwnReports
- cachedPublicIncidents
- locationHistory, if explicitly consented
- safetyData
- educationDownloads
- syncMetadata
- userPreferences

Queue item fields:
- mutationId
- ownerUid
- operation
- entityType
- localEntityId
- payload
- mediaDependencies
- createdAt
- status
- attempts
- retryAfter
- lastError

States:
- queued
- uploading_media
- submitting
- confirmed
- failed_retryable
- failed_permanent
- requires_login

Requirements:
- Persist before showing “saved offline”
- Sync only for the correct authenticated owner
- Do not upload one user’s queue after another user logs in
- Exponential backoff
- Retry limits
- Manual retry
- Idempotency keys
- Server acknowledgement
- Conflict handling
- No duplicate reports on reconnect
- Survive browser restart
- Support tab coordination to prevent duplicate sync workers
- Show per-item failures
- Do not delete local media before server confirmation

Background Sync:
Use when supported.

Fallback:
- online event
- app resume
- user-triggered Sync Now

Offline SOS:
- Save the request locally.
- Display “Not sent — waiting for connection”.
- Never display “Authorities notified” while offline.
- Provide verified tap-to-call emergency contacts.
- Explain that opening a dialer does not guarantee a completed call.
- Do not imply the website can transmit through SMS/radio without an integration.

======================================================================
13. SOS AND EMERGENCY COORDINATION
======================================================================

Preserve the floating SOS design.Button states:
- Inactive: red
- Pending verification: amber
- Verified/active: green
- Rejected/cancelled: neutral

SOS user flow:
1. Tap SOS.
2. Show concise misuse warning.
3. Show genuine-emergency confirmation.
4. Three-second countdown.
5. Allow cancellation.
6. Capture available location and its freshness.
7. Capture timestamp and user identity.
8. Optionally attach voice.
9. Submit emergency request.
10. Receive server acknowledgement.
11. Notify on-duty officials immediately as UNVERIFIED.
12. Begin staff verification.
13. Record verified/rejected outcome.
14. Dispatch and broader public alerts according to policy.
15. Show response timeline.
16. Close only through an authorized resolution workflow.

Safety rule:
Verification must not hide access to emergency calling or delay advice to seek
urgent medical care.

Maintain two independent state fields:

verificationStatus:
- pending
- under_review
- verified
- rejected

responseStatus:
- received
- acknowledged
- dispatching
- en_route
- on_scene
- resolved
- cancelled

Do not collapse verification and physical response into one ambiguous status.

Official actions:
- Acknowledge
- Call requester
- Request clarification
- Verify
- Reject with reason
- Assign team
- Update response status
- Resolve with notes

Escalation:
- Configurable acknowledgement SLA
- Reassign if no official responds
- Escalate to supervisory official
- Track escalations in audit log
- No random approval/rejection in production

Show arrival estimates only if supported by actual operational information.
Otherwise show “Response time not yet confirmed”.

======================================================================
14. NOTIFICATION AND ALERT ENGINE
======================================================================

Notification types:
- New report
- Verification update
- Case status update
- SOS acknowledgement
- SOS dispatch
- Nearby verified incident
- High-risk zone advisory
- Volunteer task
- Training reminder
- Achievement unlock
- Certificate issued
- Offline sync result

Channels:
- In-app
- FCM web push
- Optional approved SMS
- Optional Vapi voice call
- Optional transactional email

User controls:
- Read/unread
- Mark all read
- Dismiss
- Channel preferences
- Language
- Alert radius
- Quiet hours where applicable
- Explicit voice/SMS consent

Nearby recipient selection:
1. Select consented recipients in relevant geohash cells.
2. Perform exact distance filtering server-side.
3. Apply jurisdiction and alert policy.
4. Exclude opted-out recipients.
5. Deduplicate.
6. Queue delivery.
7. Record provider acceptance and delivery status separately.

Never reveal recipient phone lists in the browser.

Notification UI:
- Bell badge
- Alert title
- Species
- Approximate distance
- Time
- Severity
- Verification status
- Safe deep link

A provider “accepted” response is not the same as “delivered” or “read”.

======================================================================
15. REAL-TIME MAP AND HOTSPOTS
======================================================================

Use Leaflet and OpenStreetMap.

Initial regional center:
Approximately 22.1587, 88.8523.

Locations:
- Gosaba
- Sajnekhali
- Basanti
- Canning
- Namkhana
- Jharkhali
- Kultali
- Patharpratima
- Dayapur
- Satjelia
- Bali Island
- Piyali

Validate coordinate-location consistency.

Layers:
- Public verified incidents
- Coarse hotspot zones
- Risk heatmap
- Citizen’s own location
- Authorized responder positions for officials only
- Jurisdiction boundaries

Features:
- Risk filters
- Species filters
- Date filters
- Near-me search
- Radius filter
- Marker popups
- Fullscreen
- Escape to exit fullscreen
- Haversine distance
- Nearby sorted list
- Directions link
- Marker clustering
- Viewport-bounded data queries
- Loading/error/empty states
- Map resize handling after layout changesSensitive data:
- Exact wildlife positions must not be public.
- Sanitize data in backend/public projections, not only through frontend rounding.
- Do not expose exact coordinates in public share links, exports, or notifications.
- Public data may use spatial generalization and configurable delay.
- Avoid putting private coordinates in URL query parameters.

Map tiles:
Respect tile-provider usage policies.
Do not bulk-download OpenStreetMap tiles for offline use without an allowed
provider/license.
Use an approved offline-capable source if downloadable map packs are implemented.

======================================================================
16. WEATHER SYSTEM
======================================================================

Integrate a real weather provider through the backend where required.

Store:
- Provider
- Location/grid
- Temperature
- Condition
- Humidity
- Wind
- Visibility/fog, if available
- Fetched time
- Expiry time

Features:
- Current weather
- Last updated
- Cached fallback
- Stale warning
- Weather-based safety advice
- Regional language support

Do not call a rule-based weather advisory a scientifically validated wildlife
prediction.

Implement a scheduled cache refresh and avoid provider calls from every client
render.

======================================================================
17. AI SPECIES DETECTION
======================================================================

Brand the existing screen as Gemini Vision.

Real workflow:
1. Authenticate user.
2. Capture/upload image.
3. Validate and store in private media.
4. Create ai_scan job.
5. Run server-side Gemini vision analysis.
6. Validate structured output.
7. Store result.
8. Notify frontend via listener/polling.
9. Show species candidates and uncertainty.
10. Link reviewed safety guidance.
11. Allow conversion into a report.

Result:
- Species/common name
- Scientific name when supported
- Candidate list
- Confidence/uncertainty explanation
- Conservation status from a maintained source
- Threat context
- Approved safety tips
- Model/provider metadata
- Analysis timestamp

Important:
- Do not always return “Bengal Tiger”.
- Do not fabricate a fixed 98.7% confidence.
- If the provider does not return calibrated probabilities, do not present a
  made-up percentage as calibrated confidence.
- Support “Unknown / insufficient image quality”.
- AI result is not official verification.
- Do not suggest approaching wildlife to obtain a better image.

Analysis states:
- queued
- uploading
- analyzing
- completed
- failed
- unavailable

Show honest activity phases rather than fake progress claiming specific API
operations that did not occur.

History:
- Owner-only detection history
- Cached previous results
- Delete request
- Link scan to report

======================================================================
18. GEMINI CHATBOT AND RAG
======================================================================

Preserve the existing chat UI.

Greeting:
“Hello [username], how may I help you today?”

Features:
- Real server-side Gemini response
- Streaming
- Abort/cancel
- Retry
- Session history
- Language support
- User-owned storage
- Optional speech input
- Optional text-to-speech
- Citation links to approved safety documents

Quick prompts:
- Tiger spotted near village
- Elephant entered farmland
- Snakebite emergency
- Nearest hospital
- Forest officer help
- Wildlife safety tips
- How to use SOS
- Emergency evacuation help

RAG sources:
- Reviewed wildlife safety guides
- Snakebite first-aid protocols
- Forest response SOPs
- Emergency procedures
- Approved regional contacts
- Species knowledge base

Retrieval:
1. Identify query language.
2. Retrieve relevant approved/versioned chunks.
3. Filter by region and publication state.
4. Supply grounded context to model.
5. Return answer with source references.
6. Store model and source version metadata.

Use Firestore vector search or a documented compatible vector service.
Do not build an unbounded “load every document into every prompt” implementation.Safety:
- Clear non-emergency-service disclaimer
- Immediate emergency guidance for high-risk queries
- No diagnosis or guaranteed treatment advice
- Do not invent nearby hospitals or anti-venom availability
- Do not claim an officer was contacted unless an actual action was submitted
- Do not let model output directly dispatch teams or trigger calls without a
  separate validated, authorized, user-confirmed tool/action
- Treat retrieved content and user uploads as untrusted
- Resist prompt injection
- Redact unnecessary personal information from provider payloads

If AI is unavailable:
- Show a clear integration-unavailable state
- Offer offline reviewed guidance
- Do not silently replace it with fake “live Gemini” responses

======================================================================
19. VOICE, TRANSCRIPTION, AND TRANSLATION
======================================================================

Implement:
- Browser speech input where supported
- Recorded-audio transcription adapter
- Preserve original audio
- Preserve original transcript
- Translation to English for official review
- Translation back into the citizen’s chosen language
- User correction before submission

Store:
- Original language
- Original transcript
- Translated transcript
- Provider
- Processing status

Do not assume browser speech APIs work offline or support every language.
Provide typed and recorded-audio fallbacks.

======================================================================
20. PREDICTIVE CONFLICT HEATMAP
======================================================================

Preserve:
- Timeframes: 24 hours, 7 days, 30 days
- High-risk area cards
- Hourly chart
- Factor radar chart
- Weekly comparison chart
- Smart-alert CTA

Backend:
- Scheduled aggregation
- Historical verified/resolved incident inputs
- Weather features where available
- Seasonal/crop/calendar features only if sourced
- Model/run version
- Generated timestamp
- Data window
- Confidence/uncertainty
- Expiry

Start with a documented statistical/rule-based baseline if a trained model is not
available.

Do not claim ML accuracy such as “94.2%” without actual evaluation data.

Cold start:
- Show insufficient-data state
- Label demo forecasts as simulated
- Do not manufacture historical incidents

Timeframe selection must actually change query/results.

Store prediction evaluation:
- Prediction run
- Forecast horizon
- Observed outcome
- Metric definition
- Sample size
- Evaluation period

Alerts:
- User opt-in
- Rate limits
- Region/radius matching
- Avoid false certainty

======================================================================
21. EDUCATION HUB
======================================================================

Tabs:
1. Workshops
2. Safety Measures
3. Interactive Quiz
4. Offline Guides

Workshop topics:
- Tiger encounter safety
- Elephant conflict safety
- Snakebite first aid
- Flood emergency survival
- Forest awareness
- How to use SOS
- Safe night travel
- Wildlife reporting training

Workshop cards:
- Thumbnail
- Video
- Duration
- Language
- Watch progress
- Completion state
- Offline availability

Implement actual video playback.
Persist progress with throttled updates.
Do not grant completion because the user merely clicked Play.

Safety content:
- Versioned
- Reviewed by qualified medical/wildlife reviewers
- Region-specific
- Translated
- Review date visible

Quiz:
- Questions from backend
- Answer validation server-side
- Attempt record
- Score
- Explanations
- Completion
- Retake
- Configured reward policy
- Prevent unlimited reward farming

Offline guides:
- Actual downloadable PDFs
- Quick-access emergency cards
- Version metadata
- Download size
- Download progress
- Remove download
- Cache expiry/update notice

Never use a toast saying “downloaded” unless a real download/cache operation
completed.

======================================================================
22. ACHIEVEMENTS, TOKENS, AND LEADERBOARDS
======================================================================

Verified report reward:
+10 tokens.Award only after an authorized verification decision.

Levels:
- Bronze: 0
- Silver: 50
- Gold: 250
- Elite Gold: 550

Rewards:
Bronze:
- Default membership

Silver:
- Certificate eligibility

Gold:
- Certificate
- Approved goodies eligibility

Elite Gold:
- Certificate
- Goodies
- Incentive eligibility subject to a real approved program

Do not promise actual government cash benefits if no program exists.

Reward implementation:
- Append-only reward ledger
- Unique source/idempotency key
- Server transaction
- Derived balance
- One verified-report award per report
- Reverification must not double-award
- Reversal entry if approval is revoked
- Authorized manual adjustment with reason

Leaderboards:
- District
- Division
- Community
- Optional time period
- Opt-in display name
- No phone number exposure
- Ties handled consistently
- Personal rank
- Contribution history

Terms:
- Verified contributions only
- False reports may cause review
- Rewards subject to program approval
- No automatic punitive penalties without a reviewed process
- Badges/certificates can be revoked with an audit reason

======================================================================
23. VAN MITRA VOLUNTEER WORKSPACE
======================================================================

Application:
- Citizen applies
- Selects region
- Provides relevant availability
- Accepts safety terms
- Completes required training
- Official reviews application
- Approved volunteer receives role

States:
- draft
- submitted
- training_required
- approved
- rejected
- suspended

Volunteer dashboard:
- Rank
- Points
- Completed assignments
- Training progress
- Nearby eligible tasks
- Assigned tasks
- Leaderboard

Task fields:
- Title
- Description
- Location
- Distance
- Urgency
- Required training
- Capacity
- Deadline
- Points
- Official contact channel

Task workflow:
open -> accepted -> in_progress -> submitted -> approved/completed

Also support:
- declined
- cancelled
- expired
- rejected_completion

Use a transaction to prevent overbooking/duplicate acceptance.

Completion:
- Notes
- Optional safe evidence
- Officer review
- Reward only after approval

Safety:
- Untrained users must not be encouraged to approach or handle dangerous wildlife.
- Volunteers support trained officials; they do not replace rescue professionals.
- Restrict exact incident details to assigned authorized volunteers.
- Support reporting inability to attend and requesting reassignment.

======================================================================
24. SARPA SNAKE EMERGENCY WORKSPACE
======================================================================

Tabs:
1. Report Incident
2. Nearby Hospitals
3. First Aid Guide
4. Rescue Status, where an active case exists

Incident types:
- Snake sighting
- Snakebite emergency

Report:
- Location
- Optional image
- Description
- Victim count where relevant
- Time
- Contact
- Link to wildlife report/SOS

AI:
- Snake identification with uncertainty
- Never advise catching/killing the snake
- Never determine treatment solely from AI identification

Hospital directory:
- Facility name
- Location
- Phone
- Directions
- Distance
- Estimated travel time only if a real routing source exists
- Anti-venom availability:
  available / unavailable / unknown
- Last confirmed timestamp

Do not represent old stock data as real-time availability.
Show “Call to confirm” where appropriate.

Rescue:
- Approved rescuer contacts
- Assignment
- Acknowledgement
- En route
- On scene
- Completed

First aid:
Use region-appropriate medically reviewed content.
Do not blindly copy potentially disputed advice from demo text.
Prioritize:
- Keep the victim calm
- Minimize movement
- Seek urgent medical care
- Do not cut/suck the wound
- Do not apply a tight tourniquet
- Do not delay transport for identification or traditional remedies

======================================================================
25. FOREST OFFICIAL PORTAL
======================================================================

Preserve amber/orange official styling.Header:
- Shield
- Officer name
- Official ID
- Designation
- Jurisdiction
- Duty status
- Theme
- Logout

Primary tabs:
1. Overview
2. Drone Patrol
3. Reports
4. SOS Alerts
5. Leaderboard

Additional accessible sections:
- Verification
- Dispatch
- Volunteers
- Analytics
- Certificates

Overview:
- Total reports
- Pending
- Under review
- Verified
- Resolved
- Active SOS
- Critical cases
- Unacknowledged emergencies
- Case status distribution
- Recent activity
- SLA breaches
- Assigned cases

All statistics must respect the officer’s jurisdiction and role.

Reports:
- Search reporter/location/species using a documented search implementation
- Status filter
- Severity filter
- Species filter
- Date range
- Jurisdiction
- Pagination
- Sorting
- Empty state
- Export

Do not claim arbitrary full-text search is natively available in Firestore.
Implement suitable indexed fields/prefix search or an authorized search service.

Details:
- Evidence
- Exact authorized location
- Accuracy
- Reporter contact
- Original/translated notes
- Status timeline
- Verification history
- Team assignments
- Action notes
- Related reports
- Duplicates
- SOS link

Actions:
- Acknowledge
- Review
- Verify
- Reject
- Assign
- Add notes
- Request clarification
- Resolve
- Reopen with permission
- Call reporter

======================================================================
26. VERIFICATION AND MISINFORMATION CONTROL
======================================================================

Verification dashboard tabs:
- Pending
- Review
- Verified
- All

Evidence checklist:
- Photo authenticity/context
- Species plausibility
- GPS-location consistency
- Timestamp freshness
- Nearby corroborating reports
- Reporter callback
- Duplicate detection
- Media reuse flag where practical

Actions:
- Verify
- Under review
- Reject with reason
- Request more information

Reasons:
- Insufficient evidence
- Duplicate
- Wrong location
- Incorrect species
- Stale image
- Misleading/false report
- Other, with notes

AI can assist triage but cannot silently replace official verification.

Every decision:
- Actor
- Timestamp
- Previous state
- New state
- Reason
- Notes
- Report version

Do not publicly accuse a citizen of malicious reporting based solely on an AI
signal or one rejection.

======================================================================
27. DISPATCH AND RESPONSE TEAMS
======================================================================

Official dispatch workspace:
- Unassigned cases
- Available teams
- Capabilities
- Jurisdiction
- Priority
- Current assignments

Workflow:
1. Verify/acknowledge incident as appropriate.
2. Select eligible team.
3. Assign.
4. Team accepts.
5. En route.
6. Arrived.
7. Action completed.
8. Supervisor resolves incident.

Track:
- First acknowledgement time
- Assignment time
- Departure
- Arrival
- Completion
- Cancellation
- Reassignment

Responder tracking:
- Explicit work-duty consent
- Only while assigned/on duty
- Limited retention
- Visible to authorized officials
- Not public by default

======================================================================
28. DRONE PATROL SYSTEM
======================================================================

Preserve existing drone interface:
- Fleet list
- Selected drone
- Battery
- Signal
- Altitude
- Speed
- GPS
- RGB/Thermal mode
- Recording
- AI target box
- System diagnostics

Production architecture:
- Drone integration adapter
- Telemetry ingestion endpoint
- Authenticated device identity
- Validated telemetry payload
- Sampling/downsampling
- Mission records
- Detection records
- Secure video stream token
- Recording asset metadata

States:
- Patrolling
- Returning
- Charging
- Offline
- Maintenance

Controls:
- Thermal request
- Start/stop recording request
- View detection on map
- Diagnostics request

A button must show:
- Requested
- Acknowledged
- Failed
- Timed out

Do not display “command completed” unless the device confirms it.Hardware unavailable:
- Use explicit simulator mode
- Label video and telemetry as simulated
- Do not claim a static image is a live drone stream
- Keep device control disabled or routed to simulator only

High-frequency telemetry should not create an unbounded Firestore cost problem.
Document sampling and retention.

======================================================================
29. CERTIFICATES AND RECOGNITION
======================================================================

Official leaderboard:
- Display name
- District
- Verified contributions
- Tokens
- Rank
- Award action

Certificate workflow:
1. Check officer permission.
2. Check eligibility.
3. Preview certificate.
4. Generate actual PDF server-side.
5. Store private/public-safe document as appropriate.
6. Assign unique certificate number.
7. Add verification code.
8. Allow download.
9. Record issuance audit event.

Certificate fields:
- Recipient
- Contribution summary
- Issuing organization
- Issuing official
- Date
- Certificate ID
- Verification URL/QR
- Status

Revocation:
- Reason
- Actor
- Timestamp
- Public verification page reflects revocation

Do not use fake official signatures or seals.

======================================================================
30. STELLAR TESTNET VERIFICATION
======================================================================

Purpose:
Provide tamper-evident attestations for officially verified records.

This is not proof that the original incident was true.
It proves that a particular record version was attested at a particular time.

Workflow:
1. Authorized official verifies a report.
2. Backend emits an outbox event.
3. Worker creates canonical versioned payload.
4. Calculate cryptographic hash.
5. Submit compact attestation to Stellar Testnet using an appropriate,
   documented transaction/memo/data design.
6. Store transaction identifier and network.
7. Display attestation status.
8. Retry safely without duplicate attestations.

Public blockchain data:
- Random/non-identifying record reference where needed
- Content hash
- Schema/version reference
- Network and transaction reference

Do not put:
- Phone numbers
- Names
- Emergency contacts
- Exact endangered-wildlife GPS
- Medical details
- Sensitive officer identity

Keep detailed records private in the backend.
A hash does not remove all privacy risks; design payload minimization carefully.

UI:
- Pending attestation
- Confirmed on Testnet
- Failed / retry scheduled
- View transaction

Corrections:
Create a new version/attestation.
Never pretend blockchain records can be edited or erased.

Feature flag:
Stellar integration can be disabled without breaking report verification.

======================================================================
31. VAPI MULTILINGUAL VOICE ALERTS
======================================================================

Implement real server-side integration with an explicit feature flag.

Use case:
Opted-in residents receive a multilingual warning about a verified high-risk
incident affecting their area.

Workflow:
1. Verified incident qualifies for voice alerts.
2. Backend determines eligible recipients.
3. Default configurable radius: up to 15 km.
4. Apply consent, quiet-hours, suppression, and severity policy.
5. Generate approved localized message.
6. Queue calls.
7. Submit to Vapi.
8. Receive provider webhooks.
9. Verify webhook authenticity using the provider-supported method.
10. Update call status.
11. Record cost/attempt metadata without unnecessary transcripts.

Call statuses:
- queued
- accepted_by_provider
- ringing
- answered
- completed
- failed
- cancelled
- suppressed

Requirements:
- Opt-in
- Rate limiting
- Per-incident deduplication
- Per-user suppression
- Retry policy
- Cost caps
- Opt-out
- Jurisdiction policy
- No automatic emergency-number dialing
- No voice cloning or impersonation of public officials

Do not let a caller’s untrusted spoken content change incident truth or grant
access.

If credentials are absent:
Show “Voice alerts not configured”.
Do not show fake successful calls. ======================================================================
32. ANALYTICS AND EXPORTS
======================================================================

Citizen:
- Own contributions
- Public aggregate trends
- Personal rewards
- Own case response timeline

Official:
- Reports by status
- Reports by severity
- Species distribution
- Monthly trends
- Peak hours
- Resolution rate
- Time to acknowledge
- Time to dispatch
- Time to arrive
- Time to resolve
- Jurisdiction hotspots
- Volunteer response
- False/duplicate report trends
- Notification delivery
- System health

Metrics:
- Define each metric
- Define denominator
- Define reporting period
- Define timezone
- Handle zero data
- Use actual timestamps
- No synthetic monthly history

Exports:
- Reports CSV
- Analytics CSV
- JSON where authorized
- Printable/PDF summaries
- Date-stamped filenames
- Filtered export
- Export audit

CSV:
- Escape commas, quotes, and newlines
- Prevent spreadsheet formula injection
- Preserve Unicode
- Use consistent headers
- Do not export private fields to unauthorized roles

Large exports:
- Background job
- Progress/status
- Expiring signed download link
- Automatic expiry

======================================================================
33. MULTILINGUAL SUPPORT
======================================================================

Preserve all current languages:
- English
- Hindi
- Bengali
- Marathi
- Tamil
- Malayalam
- Assamese
- Rajasthani
- Gujarati
- Kannada
- Telugu
- Odia
- Punjabi
- Urdu

Also support Nepali as an additional language from the full-stack brief.

Requirements:
- Centralized translation keys
- No raw key text in UI
- English fallback
- Bengali regional priority
- Hindi complete
- Critical safety messages reviewed
- Native language names
- Locale-aware dates
- Native digit display where appropriate
- Indian number formatting
- Urdu RTL
- Persist preference locally and in user profile
- Apply preference across portals
- Translate notifications and AI conversations
- Original and translated report text retained

Do not automatically treat machine-translated medical content as reviewed clinical
guidance.

======================================================================
34. PWA AND SERVICE WORKER
======================================================================

Features:
- Valid manifest
- Standalone installation
- Maskable icons
- Portrait-friendly layout
- Add to Home Screen
- Install prompt where supported
- App update notification
- Offline shell
- Downloaded guides
- Cached own reports
- Offline queue
- Push notifications

Shortcuts:
- Report
- SOS
- Map

Ensure shortcut URLs actually open the intended action.

Caching:
- Precache built assets using actual build output
- Cache versioning
- Navigation fallback
- Safe runtime caching
- Cache size limits
- Cache cleanup
- Storage quota handling

Security:
- Do not blindly cache authenticated API responses.
- Do not cache POST requests as if they were static GET assets.
- Partition sensitive cached data by user.
- Clear or protect appropriate private cache on logout.
- Do not use public image URLs for private evidence.
- Do not create conflicting push and offline service workers.
- Consolidate service-worker ownership or register scopes deliberately.

Browser limitations:
- Explain offline limitations.
- Explain unsupported background sync.
- Explain push permission.
- Never claim the app can notify a powered-off device or guarantee emergency
  delivery.

======================================================================
35. MEDIA STORAGE AND PRIVACY
======================================================================

Buckets/paths:
- profile photos
- report evidence
- voice evidence
- AI scans
- education media
- downloadable guides
- certificates
- drone recordings Controls:
- Owner checks
- Jurisdiction checks
- Signed download URLs
- File type validation
- Size limits
- Upload progress
- Expiring upload authorization if needed
- Storage metadata
- Malware/moderation workflow where practical
- Retention policy
- Orphan upload cleanup

Strip unnecessary EXIF metadata from public copies.
Preserve authorized evidence originals only where policy permits.

Never expose a storage service key in the frontend.

======================================================================
36. API CONTRACT
======================================================================

Implement and document endpoints such as:

Identity:
GET    /api/v1/me
PATCH  /api/v1/me
POST   /api/v1/me/photo
POST   /api/v1/account/deletion-request

Reports:
POST   /api/v1/reports
GET    /api/v1/reports/mine
GET    /api/v1/reports/:id
PATCH  /api/v1/reports/:id
POST   /api/v1/reports/:id/withdraw
GET    /api/v1/reports/:id/events

Official:
GET    /api/v1/official/reports
POST   /api/v1/official/reports/:id/review
POST   /api/v1/official/reports/:id/verify
POST   /api/v1/official/reports/:id/reject
POST   /api/v1/official/reports/:id/resolve
POST   /api/v1/official/reports/:id/reopen
POST   /api/v1/official/reports/:id/notes

SOS:
POST   /api/v1/sos
GET    /api/v1/sos/:id
POST   /api/v1/sos/:id/cancel
POST   /api/v1/official/sos/:id/acknowledge
POST   /api/v1/official/sos/:id/verify
POST   /api/v1/official/sos/:id/reject
POST   /api/v1/official/sos/:id/dispatch
POST   /api/v1/official/sos/:id/resolve

Map:
GET    /api/v1/public/incidents
GET    /api/v1/hotspots
GET    /api/v1/nearby

Media:
POST   /api/v1/media/upload-intent
POST   /api/v1/media/:id/complete
GET    /api/v1/media/:id/download

Notifications:
GET    /api/v1/notifications
POST   /api/v1/notifications/:id/read
POST   /api/v1/notifications/read-all
POST   /api/v1/devices/register

AI:
POST   /api/v1/ai/scans
GET    /api/v1/ai/scans/:id
GET    /api/v1/ai/scans
POST   /api/v1/chat/sessions
GET    /api/v1/chat/sessions
POST   /api/v1/chat/sessions/:id/messages
GET    /api/v1/chat/sessions/:id/stream

Education:
GET    /api/v1/education
GET    /api/v1/education/:id
POST   /api/v1/education/:id/progress
POST   /api/v1/quizzes/:id/attempts
POST   /api/v1/quiz-attempts/:id/submit

Volunteers:
POST   /api/v1/volunteer/applications
GET    /api/v1/volunteer/tasks
POST   /api/v1/volunteer/tasks/:id/accept
POST   /api/v1/volunteer/assignments/:id/submit
POST   /api/v1/official/volunteer/assignments/:id/approve

SARPA:
POST   /api/v1/sarpa/cases
GET    /api/v1/sarpa/cases/:id
GET    /api/v1/hospitals/nearby
GET    /api/v1/snake-rescuers/nearby

Rewards:
GET    /api/v1/rewards/me
GET    /api/v1/rewards/me/history
GET    /api/v1/leaderboard
POST   /api/v1/official/certificates
GET    /api/v1/certificates/:id/verify

Analytics:
GET    /api/v1/analytics/summary
GET    /api/v1/analytics/trends
POST   /api/v1/exports
GET    /api/v1/exports/:id

Predictions:
GET    /api/v1/predictions
POST   /api/v1/predictions/subscriptions

Drone:
POST   /api/v1/devices/drones/:id/telemetry
GET    /api/v1/official/drones
POST   /api/v1/official/drones/:id/commands

Integrations:
POST   /api/v1/webhooks/vapi
POST   /api/v1/webhooks/approved-provider

Health:
GET    /api/v1/health
GET    /api/v1/readiness

For every endpoint:
- Validate input
- Authenticate where required
- Authorize object access
- Enforce jurisdiction
- Rate limit appropriately
- Use safe errors
- Attach request ID
- Write audit record when relevant
- Avoid leaking private fields

Use Firebase bearer tokens for API authentication and verify them server-side.
Internal queue workers must use authenticated service identity, not public access.

======================================================================
37. EVENT-DRIVEN BACKEND WORKFLOWS
======================================================================

Use an outbox/event model for reliable downstream processing.Events:
- report.created
- report.under_review
- report.verified
- report.rejected
- report.resolved
- sos.created
- sos.acknowledged
- sos.verified
- dispatch.assigned
- task.completed
- quiz.completed
- certificate.issued

Example: report.verified

1. Persist verification and outbox event atomically.
2. Award reward once.
3. Update public-safe incident projection.
4. Update authorized aggregates.
5. Generate nearby notifications.
6. Queue voice alerts if policy allows.
7. Queue blockchain attestation if enabled.
8. Update hotspot aggregation.
9. Mark each side effect independently.

Requirements:
- At-least-once delivery awareness
- Idempotent handlers
- Retry/backoff
- Dead-letter state
- Operational retry tools
- No distributed “exactly once” claims without justification
- External provider failures must not roll back a valid official decision

======================================================================
38. ADMINISTRATION AND CONTENT MANAGEMENT
======================================================================

Implement an operational admin workspace.

Manage:
- Official invitations
- Roles
- Jurisdictions
- Account status
- Volunteer approvals
- Species directory
- Safety guides
- Workshops
- Quizzes
- Translations
- Emergency contacts
- Hospitals
- Rescuer contacts
- Feature flags
- Integration availability
- Retention settings
- Notification policy
- Reward program settings

Content workflow:
draft -> review -> approved -> published -> archived

Record:
- Author
- Reviewer
- Version
- Publication time
- Review date

Medical and wildlife safety content needs appropriate review fields.

Do not allow a content editor to modify user roles or access all emergency data.

======================================================================
39. SECURITY AND RELIABILITY
======================================================================

Implement:
- Firestore security rules
- Storage security rules
- Backend authorization
- Firebase App Check where appropriate
- Input validation
- Object-level access checks
- Rate limiting
- Upload validation
- Webhook verification
- CORS allowlist
- Security headers
- CSP appropriate to required providers
- Secrets management
- Audit trails
- PII redaction in logs

Firestore-specific:
- Rules are not filters; queries must match authorized scopes.
- Do not grant read access to an entire collection and hide fields in UI.
- Admin SDK bypasses rules; API authorization is mandatory.
- Keep public projections physically separate from private records.
- Test security rules using emulators.

Emergency reliability:
- Alert on unacknowledged SOS
- Detect failed job queues
- Record provider failures
- Expose integration health to administrators
- Provide manual operational fallbacks

Privacy:
- Data minimization
- Consent
- Location retention
- Medical profile optionality
- Safe exports
- User deletion workflow
- Retention exceptions documented
- Follow applicable Indian data-protection requirements; do not claim legal
  certification merely because controls are implemented

======================================================================
40. FRONTEND STATE AND CODE STRUCTURE
======================================================================

Suggested structure:

apps/
  web/
    src/
      app/
      routes/
      components/
        auth/
        citizen/
        official/
        admin/
        reports/
        map/
        sos/
        ai/
        education/
        volunteer/
        sarpa/
        shared/
        ui/
      contexts/
      hooks/
      services/
      storage/
      i18n/
      styles/
      types/
      utils/

functions/
  src/
    api/
    middleware/
    auth/
    reports/
    sos/
    dispatch/
    notifications/
    rewards/
    volunteers/
    education/
    ai/
    weather/
    predictions/
    drones/
    certificates/
    blockchain/
    voice/
    jobs/
    repositories/
    schemas/
    audit/

packages/
  shared/
    schemas/
    enums/
    types/
    constants/

firebase/
  firestore.rules
  firestore.indexes.json
  storage.rulestests/
  unit/
  integration/
  rules/
  e2e/

docs/
  architecture.md
  workflows.md
  data-model.md
  api.md
  security.md
  operations.md
  deployment.md
  demo-vs-production.md

Adapt to the existing repository rather than moving files unnecessarily.

State responsibilities:
- Context: theme/language/session
- Query cache: server data
- Firestore listeners: real-time updates
- IndexedDB: local drafts and offline queue
- Local component state: temporary UI interactions

Do not make localStorage the canonical backend.

======================================================================
41. ENVIRONMENT AND INTEGRATION CONFIGURATION
======================================================================

Provide .env.example with names only, no actual secrets.

Browser-safe configuration:
- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_STORAGE_BUCKET
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID
- VITE_FIREBASE_VAPID_KEY
- VITE_API_BASE_URL
- VITE_APP_CHECK_SITE_KEY
- VITE_ENABLE_DEMO_MODE

Server-side:
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- APP_GEMINI_API_KEY
- GEMINI_MODEL
- WEATHER_API_KEY, if provider requires it
- VAPI_API_KEY
- VAPI_ASSISTANT_ID
- Provider-supported webhook verification configuration
- STELLAR_NETWORK
- STELLAR_SIGNER_SECRET
- Approved email/SMS credentials, if enabled

Use managed identity for Firebase Admin where available.
Never require committing a service-account JSON file.

Private provider secrets must never have a VITE_ prefix.
Public Firebase client configuration is not a replacement for access control.

Feature flags:
- DEMO_AUTH
- AI_CHAT
- AI_VISION
- VOICE_TRANSCRIPTION
- VAPI_ALERTS
- STELLAR_ATTESTATION
- DRONE_SIMULATOR
- LIVE_DRONE
- PUSH_NOTIFICATIONS

Missing integration:
- Show an honest unavailable/configuration state
- Keep the rest of the application functional
- Document setup steps
- Do not fabricate successful provider actions

======================================================================
42. DEMO DATA AND LOCAL DEVELOPMENT
======================================================================

Provide:
- Firebase Emulator Suite setup
- Auth emulator
- Firestore emulator
- Storage emulator
- Functions emulator where practical
- Explicit seed command
- Deterministic test fixtures
- Separate emulator/test project identifiers

Demo personas:
- Citizen in Gosaba
- Citizen in Basanti
- Approved Van Mitra
- Forest Guard
- Range Officer
- Deputy Ranger
- DFO
- Admin
- Content editor

Use fictional names and clearly fictional phone numbers.
Do not expose real personal contact information.

Demo incidents:
- Tiger near village boundary
- Crocodile near ferry crossing
- Wild boar crop damage
- Snake sighting
- Snakebite emergency
- Resolved community report
- Rejected duplicate report

Demo integration adapters:
- AI fixture provider
- Weather fixture provider
- Vapi sandbox/mock
- Stellar Testnet or local mock
- Drone simulator

A working local simulator is acceptable for tests.
It must be visibly distinguishable from production integration.
[04/11, 20:56] KRISHNA.R: ======================================================================
43. COMPLETE END-TO-END BUSINESS SCENARIO
======================================================================

Implement this scenario across separate browser sessions:

1. Rahul, a citizen in Gosaba, logs in with a real authenticated identity.
2. He reports suspected tiger movement near Dayapur.
3. He attaches a photo, voice note, and location.
4. The report is saved offline because connectivity is unavailable.
5. The browser is restarted; the local draft/queue still exists.
6. Connectivity returns.
7. The report synchronizes once, including media.
8. The server returns a canonical report ID.9. A jurisdiction-authorized official sees the report in another browser.
10. The official acknowledges and reviews it.
11. The official checks evidence and contacts Rahul.
12. The official verifies the report.
13. Rahul receives exactly 10 tokens.
14. Rahul’s report timeline updates in real time.
15. Nearby opted-in citizens receive a sanitized warning.
16. Approved volunteers receive suitable support tasks.
17. A team is assigned.
18. The official updates response progress.
19. Drone evidence may be attached if a real feed/simulator is enabled.
20. A Stellar attestation is queued if configured.
21. A Vapi alert is queued only for eligible opted-in recipients.
22. The team completes its response.
23. The report is marked resolved.
24. Citizen and official analytics update.
25. A filtered CSV export contains the same report with permitted fields.
26. Retries do not duplicate rewards, reports, notifications, or attestations.

Also implement a snakebite case:
- SARPA report
- Immediate medical guidance
- Hospital directory with availability freshness
- Official acknowledgement
- Rescue/transport coordination
- Case resolution

======================================================================
44. TESTING AND ACCEPTANCE CRITERIA
======================================================================

Unit tests:
- Schema validation
- Phone normalization
- Distance calculation
- Reward levels
- Status transitions
- CSV escaping
- Public data sanitization
- Offline retry logic
- Idempotency keys
- Translation fallbacks

Security rules tests:
- Citizen cannot read another citizen’s private report
- Citizen cannot assign self an official role
- Volunteer cannot read unrelated medical/contact data
- Official cannot access another jurisdiction without permission
- Public incident documents contain no private fields
- User cannot write reward balances
- User cannot verify own report by direct Firestore write
- Storage reads/uploads enforce ownership and scope

Integration tests:
- Report creation
- Media completion
- Verification transaction
- Reward exactly once under retries
- Status timeline
- Notification creation
- SOS acknowledgement
- Task capacity
- Quiz scoring
- Certificate creation
- Webhook verification
- Outbox retry

E2E tests:
- Citizen signup/login
- Official login
- Unauthorized route protection
- Report submission
- Offline queue survives reload
- Reconnect sync
- Cross-browser official visibility
- Verification updates citizen browser
- Reward balance updates once
- Map filters
- SOS cancellation
- SOS pending/verified/dispatch states
- Education progress
- Quiz
- Volunteer task
- SARPA
- AI history
- CSV export
- Certificate download
- Theme
- Language
- Urdu RTL
- Mobile navigation
- Keyboard dialog interaction

Accessibility:
- Labels
- Focus management
- Ref-safe Radix wrappers
- Escape behavior
- Alt text
- Color-independent severity cues
- Reduced motion
- Minimum touch targets
- Screen reader status announcements

Performance:
- No unbounded Firestore subscriptions
- Paginated reports
- Clustered markers
- Throttled GPS/telemetry/progress writes
- Lazy-loaded heavy charts/maps/AI views
- Image optimization
- Listener cleanup
- Abort requests on unmount where appropriate

Build and checks:
- Use repository-prescribed commands
- Typecheck
- Lint, if configured
- Unit tests
- Rules tests
- Integration tests
- E2E tests
- Production build

Do not claim tests passed unless they actually ran successfully.
Report missing credentials or unavailable external systems honestly.

======================================================================
45. DEPLOYMENT AND OPERATIONS
======================================================================

Provide development, staging, and production environments.

Deployment documentation: - Firebase project creation
- Auth provider setup
- Authorized domains
- Phone SMS configuration
- Firestore rules/index deployment
- Storage rules deployment
- Functions deployment
- Hosting deployment
- Queue setup
- Scheduled jobs
- FCM/VAPID setup
- Secret Manager configuration
- Gemini configuration
- Vapi setup
- Stellar Testnet setup
- Weather provider configuration

CI:
- Install from lockfile
- Typecheck
- Tests
- Security rules tests
- Build
- Staging deployment
- Production approval gate

Operations:
- Structured logs with request IDs
- No OTP/password/token logging
- Error monitoring
- Queue failure alerts
- SOS acknowledgement monitoring
- API error-rate monitoring
- Provider cost limits
- Backup/export strategy
- Restore drill
- Retention jobs
- Rollback procedure
- Budget alerts
- Firestore index documentation

======================================================================
46. IMPLEMENTATION ORDER
======================================================================

Implement in this order while preserving the UI:

Phase 1:
- Repository audit
- Architecture
- Shared schemas
- Firebase setup
- Auth
- Roles
- Security rules
- Profile persistence

Phase 2:
- Report API
- Private media
- Offline queue
- Citizen My Reports
- Official report listing
- Cross-browser real-time synchronization

Phase 3:
- Verification
- Status timeline
- Reward ledger
- Public-safe incidents
- Map
- Notifications

Phase 4:
- SOS
- Dispatch
- Escalation
- Volunteer coordination
- SARPA

Phase 5:
- Education
- Quiz
- Achievements
- Leaderboards
- Certificates
- Admin content management

Phase 6:
- Gemini chat
- RAG
- Species detection
- Voice transcription/translation
- Weather
- Predictive baseline

Phase 7:
- Vapi
- Stellar Testnet
- Drone integration/simulator
- Advanced analytics
- Exports

Phase 8:
- PWA hardening
- Accessibility
- Security testing
- E2E testing
- Deployment
- Operational documentation

At the end of each phase:
- Explain what works
- List checks run
- List integrations awaiting credentials
- Update the acceptance checklist
- Do not call a phase complete if its UI is disconnected from the backend

======================================================================
47. FINAL DELIVERABLES
======================================================================

Deliver:

1. Complete frontend code preserving the original design.
2. Complete backend code.
3. Firebase configuration.
4. Firestore model documentation.
5. Firestore security rules.
6. Storage rules.
7. Index definitions.
8. Authentication.
9. Role and jurisdiction authorization.
10. Citizen portal.
11. Forest official portal.
12. Verification workspace.
13. Dispatch workflow.
14. Volunteer workspace.
15. SARPA.
16. Admin/content management.
17. Real report/media persistence.
18. Cross-device real-time synchronization.
19. Offline queue and conflict handling.
20. AI integrations.
21. Weather integration.
22. Prediction baseline.
23. Push notifications.
24. Vapi adapter and queue.
25. Stellar Testnet attestations.
26. Drone simulator/device adapter.
27. Reward ledger.
28. Certificate generation.
29. CSV/JSON/PDF exports as specified.
30. Tests and fixtures.
31. Seed scripts.
32. .env.example.
33. OpenAPI documentation.
34. Setup README.
35. Deployment guide.
36. Operations guide.
37. Demo-versus-production capability matrix.
38. Known limitations and unresolved external dependencies.

FINAL RULES:

- No frontend-only “success” toasts pretending to be backend operations.
- No random SOS verification.
- No fake AI confidence.
- No arbitrary official login in production.
- No client-controlled rewards.
- No public reporter phone numbers.
- No exact endangered-wildlife GPS in public data.
- No dead buttons.
- No unreachable modules.
- No silent data loss.
- No fabricated impact or prediction metrics.
- No API keys in the browser.
- No claim of live drone/video/calling integrations without actual confirmation.
- No promise that emergency services were notified unless delivery/acknowledgement
  supports that statement. The final result must be the original VanSanchar visual experience evolved into
a real, secure, persistent, multilingual, offline-friendly, operational full-stack
platform.