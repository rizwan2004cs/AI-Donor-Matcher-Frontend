# AI Donor Matcher Frontend

Last updated: 2026-03-31

## 1. Stack

- React 19
- Vite 6
- Tailwind CSS 3.4
- React Router
- Leaflet + React Leaflet
- Firebase Auth
- Axios
- Lucide React

## 2. Environment Variables

The frontend reads configuration through `import.meta.env`.

Required variables:

```text
VITE_API_BASE_URL=https://ai-donor-matcher-backend.onrender.com
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=ngo-donation-matcher.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ngo-donation-matcher
VITE_FIREBASE_STORAGE_BUCKET=ngo-donation-matcher.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=997805461490
VITE_FIREBASE_APP_ID=1:997805461490:web:7d74b8bc7f4cfd0830e56b
VITE_OSRM_URL=https://router.project-osrm.org
VITE_NOMINATIM_URL=https://nominatim.openstreetmap.org
```

## 3. Authentication Model

The frontend no longer uses the old backend OTP flow.

### Active auth flow

1. User signs up or logs in with Firebase Email/Password.
2. Frontend gets Firebase ID token.
3. Frontend calls backend:
   - `POST /api/auth/firebase/register`
   - `POST /api/auth/firebase/login`
4. Token is attached to protected API calls through `src/api/axios.js`.

### Auth ownership

- Firebase owns authentication and email verification delivery.
- Backend owns role, NGO approval, profile completion, and business authorization.

## 4. Route Map

The app currently serves these route-level pages:

- `/login`
- `/register`
- `/verify-email`
- `/`
- `/map` -> redirect to `/`
- `/ngo/:ngoId`
- `/pledge/:needId`
- `/delivery/:pledgeId`
- `/donor/dashboard`
- `/ngo/dashboard`
- `/ngo/complete-profile`
- `/admin/dashboard`

## 5. Core Pages

### 5.1 Discovery Map (`/`)

Main donor landing page.

Responsibilities:

- request user geolocation
- call `GET /api/ngos`
- show marker map and NGO side list
- support search/category/radius filters
- focus the map when an NGO row is clicked
- open NGO profile from popup or row action
- show donor active pledge summary banner when one exists

### 5.2 NGO Profile (`/ngo/:ngoId`)

Responsibilities:

- load NGO public profile from `GET /api/ngos/{id}`
- show active needs
- allow donor to open pledge screen
- allow reporting the NGO

### 5.3 Pledge Screen (`/pledge/:needId`)

Responsibilities:

- load need from route state or `GET /api/needs/{id}`
- choose quantity within remaining limit
- create pledge via `POST /api/pledges`

### 5.4 Delivery View (`/delivery/:pledgeId`)

Responsibilities:

- load pledge from route state, cached session, or `GET /api/pledges/{id}`
- route donor toward NGO
- use NGO address first for geocoding and Google Maps navigation
- fall back to stored coordinates when needed

### 5.5 Donor Dashboard

Responsibilities:

- load active pledges via `GET /api/pledges/active`
- load history via `GET /api/pledges/history`
- cancel active pledge via `DELETE /api/pledges/{id}`
- auto-switch to history if active list is empty and history exists

### 5.6 NGO Dashboard

Responsibilities:

- load profile and redirect to completion page if incomplete
- manage NGO needs
- load incoming pledges via `GET /api/ngo/my/pledges`
- receive pledges individually via `PATCH /api/ngo/my/pledges/{pledgeId}/receive`

### 5.7 Admin Dashboard

Responsibilities:

- show stats, pending verification queue, reports, and NGO management
- load critical data first, then secondary panels
- approve / reject / suspend using documented backend endpoints

## 6. Shared Component Rules

- API access goes through `src/api/axios.js`
- auth state comes from `useAuth()` in `src/auth/AuthContext.jsx`
- role gating uses `ProtectedRoute`
- Lucide React icons only
- map pin styling is handled through shared map helpers/components

## 7. API Conventions

- JSON by default
- multipart for NGO document and photo uploads
- protected requests send:

```http
Authorization: Bearer <firebase-id-token>
```

## 8. Deployment

### Production targets

- Frontend: Vercel
- Backend: Render

### Frontend hosting notes

- `vercel.json` keeps SPA rewrites active
- frontend must point to the Render API through `VITE_API_BASE_URL`

### Cross-system requirements

- backend CORS must allow the Vercel frontend URL
- Firebase authorized domains must include the deployed Vercel domain

## 9. Validation Checklist

- Firebase signup/login works
- `/verify-email` gating works
- discovery map loads NGOs
- approved NGOs appear when backend exposes them
- donor can create pledge and open delivery view
- donor dashboard active/history stay in sync
- NGO can receive incoming pledges without force-closing the whole need
- admin approval flow works end-to-end
