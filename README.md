# AI Donation Matcher — Frontend

A **React.js** single-page application that connects donors with verified NGOs based on proximity and need urgency. Built with **Vite**, styled with **Tailwind CSS**, and uses **Leaflet.js** for interactive maps.

> **Final Year Engineering Project | Academic Year 2025–26**
> **Team:** Dinesh · Gowtham · Sriram · Rizwan

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [User Roles](#user-roles)
3. [Tech Stack](#tech-stack)
4. [Features](#features)
5. [Project Structure](#project-structure)
6. [Getting Started](#getting-started)
7. [Deployment (Vercel)](#deployment-vercel)
8. [Routes](#routes)
9. [Backend API](#backend-api)
10. [NGO Need Categories](#ngo-need-categories)
11. [Trust Score System](#trust-score-system)
12. [PWA Support](#pwa-support)
13. [Contributing](#contributing)
14. [Documentation](#documentation)
15. [License](#license)

---

## Project Overview

Local charitable giving is fragmented: donors cannot easily verify nearby organisations are legitimate or know what they currently need; NGOs lack a channel to broadcast real-time resource requirements to a nearby donor base.

The **AI Donation Matcher** addresses this by providing a trust-filtered, location-aware matching layer:

- **Donors** discover admin-verified NGOs on an interactive map, pledge specific items against stated needs, and navigate to the NGO using in-app OSRM routing.
- **NGOs** post and manage real-time resource requests, receive incoming pledges with donor contact details, and mark needs as fulfilled to build a transparent track record.
- **Admins** gate NGO access through a manual verification queue and govern the platform through suspension, report handling, and NGO management.

---

## User Roles

| Role | Entry Point | Key Capabilities |
|------|-------------|-----------------|
| **Donor** | `/map` after login | Discover NGOs on map, filter by category/radius, pledge items, navigate via OSRM, track active pledges & history |
| **NGO** | `/ngo/dashboard` after login | Complete profile to go live, post up to 5 active needs, view incoming pledges, mark needs as fulfilled |
| **Admin** | `/admin/dashboard` after login | Verify/reject NGO applications, handle report queue, manage all NGOs, view platform statistics |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 + Vite 6 |
| Styling | Tailwind CSS 3.4 |
| Routing | react-router-dom v7 |
| Maps | Leaflet.js 1.9 + react-leaflet v5 |
| Routing Engine | OSRM (Open Source Routing Machine) |
| HTTP | Axios 1.7 (JWT interceptor) |
| Icons | lucide-react |
| Deployment | Vercel |
| PWA | Service Worker + manifest.json |

---

## Features

The platform is organised into eight feature groups. Full details including branch names, API contracts, and acceptance criteria are in [`docs/FEATURES.md`](docs/FEATURES.md).

| Group | Features |
|-------|---------|
| **Auth & Account** | Donor/NGO registration, email verification, login, logout, protected routes |
| **Donor — Discovery & Map** | Leaflet map with colour-coded category pins, filter bar (search/category/radius), side list sorted by distance, auto-expand nationwide, pin popups |
| **Donor — NGO Profile & Pledging** | Full NGO profile with trust score & progress bars, report NGO modal, pledge screen with quantity picker, post-pledge delivery view (OSRM navigation) |
| **Donor — Dashboard** | Active pledges with countdown & navigate button, donation history with re-donate links |
| **NGO — Dashboard & Needs** | Profile completion wizard (go-live gate), active needs CRUD (max 5), incoming pledges list, mark as fulfilled, trust score display |
| **Admin — Platform Management** | Stats overview strip, verification queue, report queue, NGO management table, suspend NGO cascade |
| **Shared Components** | Navbar (role-based), TrustBadge, NeedProgressBar, CategoryPin (DivIcon), ProtectedRoute |
| **Infrastructure & PWA** | Axios + JWT interceptor, AuthContext, PWA manifest, service worker, offline check, Vercel config |

---

## Project Structure

```
src/
├── api/
│   └── axios.js                  # Axios instance with JWT interceptor
├── auth/
│   └── AuthContext.jsx            # React Context for auth (login/logout/persist)
├── components/
│   ├── CategoryPin.jsx            # Leaflet DivIcon factory (colour-coded by category)
│   ├── Navbar.jsx                 # Top navigation (role-based links)
│   ├── NeedProgressBar.jsx        # Pledged / required progress bar
│   ├── ProtectedRoute.jsx         # Role-based route guard
│   └── TrustBadge.jsx             # Trust score badge (tier + numeric score)
├── pages/
│   ├── AdminDashboard.jsx         # Admin: stats, verification queue, reports, NGO mgmt
│   ├── DeliveryView.jsx           # OSRM route map, ETA, expiry countdown, cancel
│   ├── DiscoveryMap.jsx           # Main map with filters, side list, auto-expand
│   ├── DonorDashboard.jsx         # Active pledges & history tabs
│   ├── EmailVerificationPending.jsx  # Post-registration email prompt
│   ├── Login.jsx                  # Email + password login
│   ├── NgoDashboard.jsx           # Needs CRUD, incoming pledges, lock/fulfill
│   ├── NgoProfile.jsx             # Public NGO profile with pledge buttons
│   ├── NgoProfileCompletion.jsx   # Profile wizard with progress bar (go-live gate)
│   ├── PledgeScreen.jsx           # Quantity picker, confirm pledge
│   └── Register.jsx               # Donor/NGO registration with role toggle & file upload
├── utils/
│   ├── categoryColors.js          # Category colour map & labels
│   └── fixLeafletIcons.js         # Leaflet default marker icon fix
├── App.jsx                        # Router configuration
├── main.jsx                       # Entry point + service worker registration
└── index.css                      # Tailwind directives
public/
├── manifest.json                  # PWA manifest (name, icons, theme colour)
└── service-worker.js              # Offline-first caching strategy
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repo
git clone https://github.com/rizwan2004cs/AI-Donor-Matcher-Frontend.git
cd AI-Donor-Matcher-Frontend

# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
VITE_OSRM_URL=https://router.project-osrm.org
```

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Base URL of the Spring Boot backend |
| `VITE_OSRM_URL` | OSRM routing server URL (public instance or self-hosted) |

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Production Build

```bash
npm run build
npm run preview   # preview the build locally
```

---

## Deployment (Vercel)

1. Push the repo to GitHub.
2. Import the project in [vercel.com](https://vercel.com).
3. Set the environment variables (`VITE_API_BASE_URL`, `VITE_OSRM_URL`) in Vercel dashboard.
4. Deploy — Vercel auto-detects Vite and builds with `npm run build`.

The included `vercel.json` handles SPA routing (all paths → `index.html`).

---

## Routes

| Path | Role | Page |
|---|---|---|
| `/login` | Public | Login |
| `/register` | Public | Register (Donor / NGO) |
| `/verify-email` | Public | Email verification pending |
| `/map` | Donor | Discovery Map |
| `/ngo/:ngoId` | Donor | NGO Profile |
| `/pledge/:needId` | Donor | Pledge Screen |
| `/delivery/:pledgeId` | Donor | Delivery View (OSRM route) |
| `/donor/dashboard` | Donor | Donor Dashboard |
| `/ngo/dashboard` | NGO | NGO Dashboard |
| `/ngo/complete-profile` | NGO | Profile Completion Wizard |
| `/admin/dashboard` | Admin | Admin Dashboard |

All role-restricted routes are wrapped in `<ProtectedRoute role="…">`. Unauthenticated users are redirected to `/login`; wrong-role users are redirected to `/`.

---

## Backend API

This frontend expects a **Spring Boot** REST API. All requests include `Authorization: Bearer <token>` via the Axios interceptor in `src/api/axios.js`.

### Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register donor (JSON) or NGO (multipart with documents) |
| `POST` | `/api/auth/login` | JWT login; returns token + user object |

### Needs & Map

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/needs/nearby` | Nearby needs (`lat`, `lng`, `radius`, `category`) |
| `GET` | `/api/ngos/{id}` | NGO full profile |
| `POST` | `/api/ngos/{id}/report` | Submit a report against an NGO |

### Pledges

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/pledges` | Create a pledge |
| `GET` | `/api/pledges/donor/active` | Donor's active pledges |
| `GET` | `/api/pledges/donor/history` | Donor's fulfilled/expired pledge history |
| `DELETE` | `/api/pledges/{id}` | Cancel a pledge |
| `GET` | `/api/pledges/{id}` | Pledge detail (used in Delivery View) |

### NGO Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/needs/ngo` | NGO's own active needs |
| `POST` | `/api/needs` | Add a new need |
| `PUT` | `/api/needs/{id}` | Edit a need |
| `DELETE` | `/api/needs/{id}` | Delete a need |
| `POST` | `/api/needs/{id}/fulfill` | Mark a need as fulfilled |
| `GET` | `/api/pledges/ngo/incoming` | Incoming pledges for the NGO |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/admin/stats` | Platform statistics (verified NGOs, active needs, pledges today, fulfilled/month) |
| `GET` | `/api/admin/ngos/pending` | NGOs awaiting verification |
| `POST` | `/api/admin/ngos/{id}/approve` | Approve an NGO application |
| `POST` | `/api/admin/ngos/{id}/reject` | Reject an NGO application (with reason) |
| `GET` | `/api/admin/reports` | Report queue |
| `POST` | `/api/admin/ngos/{id}/suspend` | Suspend an NGO (cascade: close needs, cancel pledges, notify donors) |
| `POST` | `/api/admin/ngos/{id}/reinstate` | Reinstate a suspended NGO |

---

## NGO Need Categories

Map pins are colour-coded by category using Leaflet `DivIcon` (see `src/components/CategoryPin.jsx` and `src/utils/categoryColors.js`):

| Category | Colour |
|----------|--------|
| Food | 🔴 Red |
| Clothing | 🔵 Blue |
| Medicine | 🟢 Green |
| Education Supplies | 🟡 Yellow |
| Household Items | 🟠 Orange |
| Other | 🟣 Purple |

---

## Trust Score System

Each verified NGO has a numeric trust score and a tier label displayed throughout the UI (`TrustBadge` component):

| Tier | Score Range | Badge Colour |
|------|------------|-------------|
| New | 0 – 39 | Grey |
| Established | 40 – 69 | Blue |
| Trusted | 70 – 100 | Gold |

The score is computed by the backend from four inputs: verification status, profile completeness, total fulfilled needs count, and activity recency. It is recalculated automatically on fulfillment and profile update events.

---

## PWA Support

The app ships as a Progressive Web App:

- **`public/manifest.json`** — App name, icons, theme colour, display mode.
- **`public/service-worker.js`** — Cache-first strategy for static assets; network-first for API calls; offline fallback page.
- **`src/main.jsx`** — Registers the service worker on app load.
- **Offline guard** — All mutating actions (pledge, cancel, mark fulfilled) check `navigator.onLine` and show a user-friendly alert when offline.

---

## Contributing

See [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for the full contribution guide, including:

- Branch naming convention (`feat/<feature-name>`, `fix/<description>`, `chore/<description>`)
- Step-by-step workflow (sync → branch → implement → test → commit → PR)
- Code guidelines (functional components, Tailwind CSS, Axios via `src/api/axios.js`, AuthContext)
- Recommended implementation order (infrastructure → auth → shared components → map → pledging → dashboards → admin → PWA)

### Quick Start for Contributors

```bash
git checkout main && git pull origin main
git checkout -b feat/<feature-name>
npm run dev          # develop at http://localhost:5173
# ... make changes ...
git commit -m "feat: <description>"
git push origin feat/<feature-name>
# open a Pull Request on GitHub
```

After merging, update the feature status in [`docs/FEATURES.md`](docs/FEATURES.md) from `⬜` to `✅`.

---

## Documentation

| File | Contents |
|------|---------|
| [`docs/FEATURES.md`](docs/FEATURES.md) | Complete feature list with branch names, statuses, and descriptions (38 features + 6 future scope items) |
| [`docs/FRONTEND.md`](docs/FRONTEND.md) | Detailed implementation guide: boilerplate setup, API call conventions, component specs, UI layouts |
| [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) | Contribution workflow, code guidelines, recommended implementation order |
| [`docs/AI_Donation_Matcher_FINAL_v4_.md`](docs/AI_Donation_Matcher_FINAL_v4_.md) | Full project documentation (problem statement, user journeys, screen-by-screen UI specs, data models, backend architecture) |
| `docs/Feature_implementations/` | Per-feature implementation guides (API contracts, component specs, acceptance criteria) |

---

## License

This project is part of an academic Final Year Engineering Project (2025–26).
