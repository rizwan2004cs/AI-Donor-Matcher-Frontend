# AI Donation Matcher — Frontend

A **React.js** single-page application that connects donors with verified NGOs based on proximity and need urgency. Built with **Vite**, styled with **Tailwind CSS**, and uses **Leaflet.js** for interactive maps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Styling | Tailwind CSS 3.4 |
| Routing | react-router-dom v7 |
| Maps | Leaflet.js + react-leaflet v5 |
| HTTP | Axios (JWT interceptor) |
| Icons | lucide-react |
| Deployment | Vercel |
| PWA | Service Worker + manifest.json |

---

## Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with JWT interceptor
├── auth/
│   └── AuthContext.jsx        # React Context for auth (login/logout)
├── components/
│   ├── CategoryPin.jsx        # Leaflet DivIcon factory (colour-coded)
│   ├── Navbar.jsx             # Top navigation (role-based links)
│   ├── NeedProgressBar.jsx    # Pledged / required progress bar
│   ├── ProtectedRoute.jsx     # Role-based route guard
│   └── TrustBadge.jsx         # Trust score badge
├── pages/
│   ├── AdminDashboard.jsx     # Admin: stats, verification, reports, NGO mgmt
│   ├── DeliveryView.jsx       # OSRM route map, countdown, navigate/cancel
│   ├── DiscoveryMap.jsx       # Main map with filters, side list, auto-expand
│   ├── DonorDashboard.jsx     # Active pledges & history tabs
│   ├── EmailVerificationPending.jsx
│   ├── Login.jsx
│   ├── NgoDashboard.jsx       # Needs CRUD, incoming pledges, lock/fulfill
│   ├── NgoProfile.jsx         # Public NGO profile with pledge buttons
│   ├── NgoProfileCompletion.jsx  # Profile wizard with progress bar
│   ├── PledgeScreen.jsx       # Quantity picker, confirm pledge
│   └── Register.jsx           # Donor/NGO registration with file upload
├── utils/
│   ├── categoryColors.js      # Category colour map & labels
│   └── fixLeafletIcons.js     # Leaflet default marker icon fix
├── App.jsx                    # Router configuration
├── main.jsx                   # Entry point + SW registration
└── index.css                  # Tailwind directives
public/
├── manifest.json              # PWA manifest
└── service-worker.js          # Offline-first caching
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/AI-Donor-Matcher-Frontend.git
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

---

## Backend API

This frontend expects a **Spring Boot** REST API. Key endpoints:

- `POST /api/auth/register` — Register donor/NGO
- `POST /api/auth/login` — JWT login
- `GET /api/needs/nearby` — Nearby needs (lat, lng, radius, category)
- `POST /api/pledges` — Create pledge
- `GET /api/pledges/donor/active` — Donor's active pledges
- `GET /api/admin/stats` — Admin statistics

All API calls include `Authorization: Bearer <token>` via the Axios interceptor.

---

## License

This project is part of an academic Final Year Project.
