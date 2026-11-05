# VanSanchar – "Neon Forest" front-end plan (screenshot → code)

Source of truth: 17 screenshots in `frontend images/`. Goal: pixel-faithful desktop UI, still responsive on mobile.
Stack stays: React 18 + TS + Vite + Tailwind + zustand + recharts + MapLibre. Front-end only, demo data (labelled).

## 1. Design language (extracted from screenshots)
| Token | Value |
|---|---|
| Page bg | `#06140b` → `#0a2010` deep forest gradient, faint topographic lines |
| Panel | `rgba(14,44,22,.72)` fill, 1px `#2f6b2a`→`#7ed321/.35` border, radius 14–18px, inner glow |
| Primary neon | `#a8f43a` (lime) – active nav, CTAs, title accent word |
| Danger | `#ff3b3b` (SOS, High) on `#3a0d0d` panels with red border glow |
| Warn / Medium | `#ffa41c`; Low `#ffd93a`; Info blue `#3b9dff`; purple `#a35cff` |
| Font | Outfit (already loaded), titles 800, accent word in lime |
| Header banner | sunset mangrove + Bengal tiger photo on the right, dark gradient fade to left; title w/ lime accent, subtitle, breadcrumb, bell + avatar |
| Chips/tabs | rounded-full, dark fill + green border; active = solid lime, black text |
| KPI card | icon left (lime/red/amber), big number, label, ▲/▼ delta |

Legacy light/amber pages keep working: the neon shell scopes CSS variables (`--bg/--card/--primary…`) under `.nf`, so any not-yet-redesigned page inherits the dark-green look.

## 2. Shells
- **PublicShell** – transparent top nav (logo, Home/Report/Map/Learn/Volunteer/Analytics, EN switcher, Login/Sign up).
- **CitizenShell** – same top nav + bell + avatar; SOS tab turns red; mobile: bottom nav kept.
- **SidebarShell** (official + admin) – 260px sidebar: logo, portal pill (Official / Admin), nav list with badges, grouped utility links, user card; top banner with breadcrumb, title, subtitle, bell, avatar.

## 3. Shared kit (`src/neon/`)
`kit.tsx` Panel, PanelTitle, Kpi, KpiRow, Pill/PillTabs, Chip, Sev/Status badges, Donut, Bars, SearchBox, FilterBtn, Check, Progress, Timeline, Banner.
`NeonMap.tsx` MapLibre satellite (Esri) tinted green, HTML label/markers/heat blobs, dashed reserve boundary, zoom/layer buttons, legend, scale bar.
`data.ts` all demo numbers/names exactly as in screenshots.
`assets` cropped from screenshots to `public/img/` (tiger hero, sunset banner, species thumbs, avatars).

## 4. Pages ↔ screenshots
### Public & citizen (top-nav)
| Route | Screenshot | Status |
|---|---|---|
| `/` Landing | Bridging Communities and Wildlife | rebuild |
| `/app/report` Report a Conflict (4-step) | Conflict Report Dashboard | new |
| `/app/map` Hotspot Map | Sundarbans Wildlife Hotspot | rebuild |
| `/app/sos` SOS Emergency | SOS Emergency Dashboard | new |
| `/app/ai-detection` | AI Wildlife Detection | rebuild |
| Predictive Heatmap | Predictive Heatmap (official sidebar variant) | new |
| Learn, Quiz, Volunteer, SARPA, Assistant, Notifications, My Reports, Profile | none | legacy pages inherit neon theme |

### Official portal (sidebar)
Dashboard (Sundarbans Wildlife Dashboard) · Incident Reports · SOS Management · Dispatch & Response · Hotspot & Patrol Map · Drone Patrol · Volunteers (Van Mitra) · Analytics & Trends → Predictive Heatmap · Leaderboard & Certificates.
Sidebar groups: main nav; Resources / Emergency Contacts / Downloads (CSV) / Settings.

### Admin portal (sidebar)
Admin Dashboard · User & Official Accounts · Jurisdictions & Teams (3 screenshots).
Other sidebar entries (Roles & Permissions, System Config, Content & Species DB, AI & Model Mgmt, Reports & Analytics, Integrations, Data Mgmt, Security & Audit Logs, Announcements, Platform Settings) → neon-styled pages reusing existing admin sections (users, content, integrations, audit, settings, emergency contacts) until dedicated mockups exist.

## 5. Build order
1. Plan (this file) + asset crops
2. Theme tokens, `.nf` CSS, kit, NeonMap
3. Shells (sidebar, top-nav) and routing
4. Admin ×3 → Official ×9 → Citizen/Public ×5
5. `tsc` + `vite build`, visual diff vs screenshots in browser, fix.

## 6. Risks / notes
- No photo assets supplied: tiger/sunset/species/avatar images are cropped from the screenshots (low-res). Replace with real photos in `public/img/` – same filenames.
- Satellite tiles need network; offline falls back to dark green gradient.
- All data is demo; footer/badges keep the existing "demo" disclosure.
