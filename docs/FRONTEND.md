# AI Donor Matcher — Frontend Documentation

> **Repo:** `AI-Donor-Matcher-Frontend`
> **Stack:** React.js · Tailwind CSS · Leaflet.js · OSRM · PWA
> **Deployed to:** Vercel
> **Backend base URL (env var):** `VITE_API_BASE_URL=https://your-render-backend.onrender.com`

---

## Table of Contents

1. [Boilerplate Setup](#1-boilerplate-setup)
2. [Project Structure](#2-project-structure)
3. [Environment Variables](#3-environment-variables)
4. [Auth & Routing](#4-auth--routing)
5. [Feature Implementation Guide](#5-feature-implementation-guide)
   - [5.1 Registration & Email Verification](#51-registration--email-verification)
   - [5.2 Login](#52-login)
   - [5.3 Donor Discovery Map](#53-donor-discovery-map)
   - [5.4 Map Pin Popup](#54-map-pin-popup)
   - [5.5 NGO Full Profile Page](#55-ngo-full-profile-page)
   - [5.6 Pledge Screen](#56-pledge-screen)
   - [5.7 Post-Pledge Delivery View (OSRM Navigation)](#57-post-pledge-delivery-view-osrm-navigation)
   - [5.8 Donor Dashboard](#58-donor-dashboard)
   - [5.9 NGO Dashboard](#59-ngo-dashboard)
   - [5.10 NGO Profile Completion Screen](#510-ngo-profile-completion-screen)
   - [5.11 Admin Dashboard](#511-admin-dashboard)
6. [Shared Components](#6-shared-components)
7. [API Call Conventions](#7-api-call-conventions)
8. [PWA Setup](#8-pwa-setup)
9. [Vercel Deployment](#9-vercel-deployment)

---

## 1. Boilerplate Setup

### 1.1 Create the project

```bash
npm create vite@latest ai-donor-matcher-frontend -- --template react
cd ai-donor-matcher-frontend
```

### 1.2 Install all dependencies

```bash
# Styling
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# Routing
npm install react-router-dom

# Map
npm install leaflet react-leaflet

# HTTP client
npm install axios

# Icons
npm install lucide-react
```

### 1.3 Configure Tailwind

In `tailwind.config.js`:

```js
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

In `src/index.css` (replace all):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 1.4 Configure Leaflet CSS

In `src/main.jsx`:

```jsx
import "leaflet/dist/leaflet.css";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 1.5 Fix Leaflet default marker icons (required or pins won't show)

Create `src/utils/fixLeafletIcons.js`:

```js
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});
```

Import this once at the top of `src/main.jsx`.

---

## 2. Project Structure

```
src/
├── api/
│   └── axios.js              # Axios instance with base URL + JWT interceptor
├── auth/
│   └── AuthContext.jsx       # React Context: user, token, login(), logout()
├── components/
│   ├── Navbar.jsx
│   ├── ProtectedRoute.jsx
│   ├── TrustBadge.jsx        # Reusable trust score + tier label
│   ├── NeedProgressBar.jsx   # Reusable pledged/remaining progress bar
│   └── CategoryPin.jsx       # Colour-coded Leaflet DivIcon factory
├── pages/
│   ├── Register.jsx
│   ├── Login.jsx
│   ├── EmailVerificationPending.jsx
│   ├── DiscoveryMap.jsx      # Donor main map page
│   ├── NgoProfile.jsx        # Public NGO profile
│   ├── PledgeScreen.jsx
│   ├── DeliveryView.jsx      # Post-pledge OSRM navigation
│   ├── DonorDashboard.jsx
│   ├── NgoDashboard.jsx
│   ├── NgoProfileCompletion.jsx
│   └── AdminDashboard.jsx
├── utils/
│   ├── fixLeafletIcons.js
│   └── categoryColors.js     # Maps category → hex color + label
├── App.jsx                   # Router setup
└── main.jsx
```

---

## 3. Environment Variables

Create `.env` in the project root:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
VITE_OSRM_URL=https://router.project-osrm.org
```

Access in code: `import.meta.env.VITE_API_BASE_URL`

> **Do not** commit `.env` to Git. Add it to `.gitignore`. Set the same variables in Vercel → Project Settings → Environment Variables.

---

## 4. Auth & Routing

### 4.1 Axios instance (`src/api/axios.js`)

```js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach JWT to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

### 4.2 Auth Context (`src/auth/AuthContext.jsx`)

```jsx
import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

### 4.3 Protected Route (`src/components/ProtectedRoute.jsx`)

```jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role !== role) return <Navigate to="/" />;
  return children;
}
```

### 4.4 App Router (`src/App.jsx`)

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Register from "./pages/Register";
import Login from "./pages/Login";
import EmailVerificationPending from "./pages/EmailVerificationPending";
import DiscoveryMap from "./pages/DiscoveryMap";
import NgoProfile from "./pages/NgoProfile";
import PledgeScreen from "./pages/PledgeScreen";
import DeliveryView from "./pages/DeliveryView";
import DonorDashboard from "./pages/DonorDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import NgoProfileCompletion from "./pages/NgoProfileCompletion";
import AdminDashboard from "./pages/AdminDashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<EmailVerificationPending />} />
          <Route path="/" element={<DiscoveryMap />} />
          <Route path="/ngo/:id" element={<NgoProfile />} />

          {/* Donor only */}
          <Route path="/pledge/:needId" element={
            <ProtectedRoute role="DONOR"><PledgeScreen /></ProtectedRoute>
          } />
          <Route path="/delivery/:pledgeId" element={
            <ProtectedRoute role="DONOR"><DeliveryView /></ProtectedRoute>
          } />
          <Route path="/dashboard/donor" element={
            <ProtectedRoute role="DONOR"><DonorDashboard /></ProtectedRoute>
          } />

          {/* NGO only */}
          <Route path="/dashboard/ngo" element={
            <ProtectedRoute role="NGO"><NgoDashboard /></ProtectedRoute>
          } />
          <Route path="/dashboard/ngo/complete-profile" element={
            <ProtectedRoute role="NGO"><NgoProfileCompletion /></ProtectedRoute>
          } />

          {/* Admin only */}
          <Route path="/dashboard/admin" element={
            <ProtectedRoute role="ADMIN"><AdminDashboard /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
```

---

## 5. Feature Implementation Guide

### 5.1 Registration & Email Verification

**Screen:** Single page with a role toggle (Donor / NGO). NGO role reveals a file upload field for credentials.

**What to build:**
- Role selector: two toggle buttons (`DONOR` / `NGO`). Store selected role in local state.
- Fields: Full Name, Email, Password, Location (text), and conditionally a file input for NGO documents.
- On submit: POST to `/api/auth/register` with `multipart/form-data` if NGO (to include the file), or `application/json` if Donor.
- On success: redirect to `/verify-email` which shows a static screen telling the user to check their email.

**API call:**
```js
// Donor
POST /api/auth/register
Body (JSON): { fullName, email, password, location, role: "DONOR" }

// NGO
POST /api/auth/register
Body (multipart/form-data): fullName, email, password, location, role: "NGO", documents (file)
```

**Key behaviour:**
- Unverified donors can reach `/` (map) but the Pledge button must be disabled with tooltip: _"Verify your email to pledge."_
- Check `user.emailVerified === false` from the JWT payload or user object returned at login.

---

### 5.2 Login

**What to build:**
- Email + password fields. On submit: POST to `/api/auth/login`.
- Response contains `{ token, user: { id, fullName, email, role, emailVerified } }`.
- Call `login(user, token)` from AuthContext, then redirect based on role:
  - `DONOR` → `/`
  - `NGO` → `/dashboard/ngo`
  - `ADMIN` → `/dashboard/admin`

**API call:**
```js
POST /api/auth/login
Body (JSON): { email, password }
Response: { token: "eyJ...", user: { id, fullName, email, role, emailVerified } }
```

---

### 5.3 Donor Discovery Map

**This is the most complex screen. It has three layers: filter bar, Leaflet map, and side list.**

**What to build:**

**A. Filter bar (top of page):**
- NGO name search input (text). On change → debounce 300ms → re-fetch.
- Category dropdown: All / Food / Clothing / Medicine / Education / Household / Other.
- Radius slider: range input 1–50 km. Show current value next to it. Add an "Apply" button.
- All three filters send to the same API call simultaneously.

**B. Leaflet map (left panel):**
- On mount: request browser geolocation (`navigator.geolocation.getCurrentPosition`). If denied, default to a hardcoded centre (e.g., Chennai: `[13.0827, 80.2707]`).
- Render `<MapContainer>` with `<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />`.
- For each NGO in the results array, render a `<Marker>` with a custom coloured `DivIcon` based on the NGO's top need category.
- On marker click → show pin popup (see 5.4).

**C. Side list (right panel):**
- Render the same NGO array as cards sorted by `distanceKm ASC`. Within 2 km bands, sort urgent needs first.
- Each card shows: NGO name, distance, urgency badge, top need item + remaining count.
- Clicking a card opens the NGO full profile page.

**D. Auto-expand behaviour:**
- If the API returns an empty array, immediately re-call the same endpoint without the `radius` param (or with a very large radius) to get nationwide results.
- Show a yellow banner: _"No NGOs found nearby. Showing all available NGOs."_

**Category colour map (`src/utils/categoryColors.js`):**
```js
export const CATEGORY_COLORS = {
  FOOD: "#EF4444",        // red
  CLOTHING: "#3B82F6",    // blue
  MEDICINE: "#22C55E",    // green
  EDUCATION: "#EAB308",   // yellow
  HOUSEHOLD: "#F97316",   // orange
  OTHER: "#A855F7",       // purple
};
```

**Creating coloured DivIcons:**
```js
import L from "leaflet";
import { CATEGORY_COLORS } from "../utils/categoryColors";

export function createCategoryIcon(category) {
  const color = CATEGORY_COLORS[category] || "#6B7280";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:24px; height:24px; border-radius:50%;
      background:${color}; border:2px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.4);">
    </div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}
```

**API call:**
```js
GET /api/ngos?lat={lat}&lng={lng}&radius={km}&category={CATEGORY}&search={name}
// All params optional. Omit radius to get nationwide results.
Response: [
  {
    id, name, distanceKm, trustScore, trustLabel,
    topNeedItem, topNeedRemaining, topNeedUrgency,
    pinCategory, lat, lng, photoUrl
  }
]
```

---

### 5.4 Map Pin Popup

**What to build:**

Use react-leaflet's `<Popup>` inside each `<Marker>`. Content:
- NGO photo thumbnail (small, rounded). If no photo, show initials.
- NGO name (bold).
- Trust badge: star icon + tier label (New / Established / Trusted) + numeric score.
- Distance: `📍 0.8 km away`.
- Top need: category colour dot + item name + remaining quantity + urgency badge.
- Button: `View Full Profile` → navigates to `/ngo/:id`.

```jsx
<Marker position={[ngo.lat, ngo.lng]} icon={createCategoryIcon(ngo.pinCategory)}>
  <Popup>
    <div className="w-56">
      <p className="font-bold text-sm">{ngo.name}</p>
      <p className="text-xs text-gray-500">📍 {ngo.distanceKm.toFixed(1)} km away</p>
      <p className="text-xs mt-1">
        Top Need: <strong>{ngo.topNeedItem}</strong> — {ngo.topNeedRemaining} remaining
      </p>
      <button
        onClick={() => navigate(`/ngo/${ngo.id}`)}
        className="mt-2 w-full bg-blue-600 text-white text-xs py-1 rounded"
      >
        View Full Profile
      </button>
    </div>
  </Popup>
</Marker>
```

---

### 5.5 NGO Full Profile Page

**Route:** `/ngo/:id`

**What to build:**
- Fetch NGO details on mount using the `:id` param.
- Display: profile photo, name, trust score badge, full address, contact email, verified since date, about text.
- **Active Needs section:** For each need, render:
  - Category colour dot + item name + urgency badge + optional expiry countdown.
  - Progress bar: `quantityPledged / quantityRequired` as a percentage fill.
  - Text: `{remaining} remaining of {total}`.
  - `Pledge This Item` button. If `user.emailVerified === false`, disable with tooltip. If no user logged in, redirect to login on click.
- **Past Fulfilled Needs section:** Simple list. Each row: checkmark + item name + quantity + month/year. No donor names shown.
- **Report button** at the bottom: `⚑ Report this organisation`. On click → open a modal with 4 reason options + submit.

**Progress bar component:**
```jsx
function NeedProgressBar({ pledged, required }) {
  const pct = Math.min(100, Math.round((pledged / required) * 100));
  return (
    <div className="w-full bg-gray-200 rounded-full h-3">
      <div
        className="bg-blue-500 h-3 rounded-full transition-all"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
```

**API calls:**
```js
GET /api/ngos/{id}
Response: {
  id, name, photoUrl, trustScore, trustLabel, address, contactEmail,
  verifiedSince, description, activeNeeds: [...], fulfilledHistory: [...]
}

// activeNeeds item shape:
{ id, category, itemName, urgency, quantityRequired, quantityPledged, expiryDate }

// fulfilledHistory item shape:
{ category, itemName, quantity, fulfilledDate }

// Report submission:
POST /api/ngos/{id}/report
Body (JSON): { reason: "FRAUD" | "INACTIVE" | "MISLEADING" | "OTHER" }
```

---

### 5.6 Pledge Screen

**Route:** `/pledge/:needId`

**What to build:**
- On mount: fetch need details by `needId`.
- Display: NGO name, item, category, urgency, total required, already pledged by others, remaining.
- Quantity selector: decrement button `−`, number input, increment button `+`. Clamp value between 1 and `remaining`.
- `Confirm Pledge` button: POST pledge. On success → navigate to `/delivery/:pledgeId` with the response data.
- Show a note below the button: _"A confirmation email will be sent to you with the NGO address and contact."_

**Quantity selector logic:**
```js
const [qty, setQty] = useState(1);
const remaining = need.quantityRequired - need.quantityPledged;

const increment = () => setQty((q) => Math.min(q + 1, remaining));
const decrement = () => setQty((q) => Math.max(q - 1, 1));
```

**API calls:**
```js
GET /api/needs/{needId}
Response: { id, ngoId, ngoName, itemName, category, urgency, quantityRequired, quantityPledged }

POST /api/pledges
Body (JSON): { needId, quantity }
Response: {
  pledgeId, ngoLat, ngoLng, ngoAddress, ngoEmail,
  expiresAt   // ISO datetime string, 48hr from now
}
```

---

### 5.7 Post-Pledge Delivery View (OSRM Navigation)

**Route:** `/delivery/:pledgeId`

**What to build:**
- On mount: get donor's current GPS location via `navigator.geolocation`.
- Fetch OSRM route between donor GPS and NGO coordinates (passed via router state or fetched from `/api/pledges/:pledgeId`).
- Render a Leaflet map with:
  - Marker at donor location labelled _"📍 You are here"_.
  - Marker at NGO location labelled _"🏢 Drop-off here"_.
  - A blue `Polyline` drawn from the OSRM GeoJSON route geometry.
- Above the map: estimated distance (km) and duration (minutes) from OSRM response.
- Below the map: NGO address, NGO contact email, pledge item + quantity, expiry countdown, `Cancel Pledge` button.
- This screen is also accessible from the Donor Dashboard via the `Navigate` button on each active pledge card.

**OSRM fetch:**
```js
const OSRM = import.meta.env.VITE_OSRM_URL;

async function fetchRoute(donorLat, donorLng, ngoLat, ngoLng) {
  const url = `${OSRM}/route/v1/driving/${donorLng},${donorLat};${ngoLng},${ngoLat}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  const data = await res.json();
  const route = data.routes[0];
  return {
    coordinates: route.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
    distanceKm: (route.distance / 1000).toFixed(1),
    durationMins: Math.ceil(route.duration / 60),
  };
}
```

**Render route on map:**
```jsx
import { Polyline } from "react-leaflet";
// After fetchRoute returns:
<Polyline positions={routeCoords} color="blue" weight={4} />
```

**API call for pledge data (if not passed via router state):**
```js
GET /api/pledges/{pledgeId}
Response: { pledgeId, ngoLat, ngoLng, ngoAddress, ngoEmail, itemName, quantity, expiresAt, status }

DELETE /api/pledges/{pledgeId}   // Cancel pledge
```

**Expiry countdown:**
```js
// expiresAt is an ISO string. Update every second with setInterval.
const secondsLeft = Math.max(0, Math.floor((new Date(expiresAt) - Date.now()) / 1000));
const hours = Math.floor(secondsLeft / 3600);
const mins = Math.floor((secondsLeft % 3600) / 60);
// Display: "47h 12m"
```

---

### 5.8 Donor Dashboard

**Route:** `/dashboard/donor`

**What to build:**
- Two tabs: `Active Pledges` and `Donation History`. Use local state to track which tab is visible.

**Active Pledges tab:**
- Fetch all active pledges for the logged-in donor.
- Each card shows: NGO name, distance, category colour dot + item name + quantity, status badge, expiry countdown, two action buttons:
  - `Navigate` → navigates to `/delivery/:pledgeId`.
  - `Cancel Pledge` → DELETE `/api/pledges/:pledgeId`, then remove card from list optimistically.

**Donation History tab:**
- Fetch fulfilled/expired pledge history for the donor.
- Each row: checkmark + NGO name + category dot + item + quantity + date. Clicking a row navigates to `/ngo/:ngoId` so the donor can re-donate easily.

**API calls:**
```js
GET /api/pledges/my/active
Response: [{ pledgeId, ngoId, ngoName, distanceKm, category, itemName, quantity, status, expiresAt }]

GET /api/pledges/my/history
Response: [{ pledgeId, ngoId, ngoName, category, itemName, quantity, fulfilledDate }]

DELETE /api/pledges/{pledgeId}   // Cancel
```

---

### 5.9 NGO Dashboard

**Route:** `/dashboard/ngo`

**What to build:**

**Header section:**
- NGO name, trust score numeric value + tier label badge, active needs count (`2/5`), total fulfilled count.

**Active Needs section:**
- Fetch active needs for this NGO.
- Each need card shows: category dot + item name + urgency badge.
- Progress bar: `quantityPledged / quantityRequired`.
- If `quantityPledged > 0` (has at least one active pledge): show a lock icon 🔒, hide Edit and Delete buttons, show only `Mark as Fulfilled` button.
- If no active pledges: show `Edit` and `Delete` buttons.
- `+ Add New Need` button — opens a modal form (see below). If the NGO already has 5 active needs, disable this button and show: _"Maximum 5 active needs reached."_

**Add Need modal fields:**
- Category dropdown (Food / Clothing / Medicine / Education / Household / Other)
- Item name (text input, required)
- Description (textarea, optional)
- Quantity required (number input, min 1)
- Urgency toggle: Normal / Urgent
- Expiry date (date picker, optional)
- Submit → POST `/api/needs`

**Incoming Pledges section:**
- List of pledge notifications: donor name, donor email, item, quantity pledged, time ago.

**API calls:**
```js
GET /api/ngo/my/needs
Response: [{ id, category, itemName, urgency, quantityRequired, quantityPledged, expiryDate, status }]

POST /api/needs
Body (JSON): { category, itemName, description, quantityRequired, urgency, expiryDate }

PUT /api/needs/{id}
Body (JSON): { category, itemName, description, quantityRequired, urgency, expiryDate }

DELETE /api/needs/{id}

PATCH /api/needs/{id}/fulfill

GET /api/ngo/my/pledges
Response: [{ donorName, donorEmail, itemName, quantity, pledgedAt }]
```

---

### 5.10 NGO Profile Completion Screen

**Route:** `/dashboard/ngo/complete-profile`

**What to build:**
- Show a progress bar at the top based on how many required fields are filled.
- Required fields: Organisation Name, Full Address, Contact Email, Contact Phone, Organisation Description (min 50 chars), Category of Work.
- Optional: Profile Photo (JPG/PNG, max 2MB).
- For each required field: show a green checkmark ✅ if filled, empty checkbox □ if missing.
- Show a list of missing fields at the bottom: _"Missing: Organisation Description"_.
- `Save & Complete Profile` button → PUT `/api/ngo/my/profile`.
- NGO is only visible on the donor map once all required fields are complete. This is enforced backend-side, but the frontend should redirect to this page if the NGO logs in and `profileComplete === false`.

**Profile photo upload:**
- On file input change: validate type (jpg/png) and size (≤ 2MB) client-side before uploading.
- POST the file to `/api/ngo/my/photo` as `multipart/form-data`. Backend uploads to Cloudinary and returns a URL.

**Progress bar calculation:**
```js
const requiredFields = ["name", "address", "contactEmail", "contactPhone", "description", "category"];
const filled = requiredFields.filter((f) => ngo[f] && ngo[f].toString().trim().length > 0);
const pct = Math.round((filled.length / requiredFields.length) * 100);
```

**API calls:**
```js
GET /api/ngo/my/profile
Response: { name, address, contactEmail, contactPhone, description, category, photoUrl, profileComplete }

PUT /api/ngo/my/profile
Body (JSON): { name, address, contactEmail, contactPhone, description, category }

POST /api/ngo/my/photo
Body (multipart/form-data): photo (file)
Response: { photoUrl }
```

---

### 5.11 Admin Dashboard

**Route:** `/dashboard/admin`

**What to build:**

**Overview stats strip (top):**
- Four stat cards: Verified NGOs · Active Needs · Pledges Today · Fulfilled This Month.
- Fetch from `GET /api/admin/stats`.

**Verification Queue:**
- List all NGOs with status `PENDING`.
- Each row: NGO name, submitted time, `Review` button (opens document inline or in new tab), `Approve` button, `Reject` button.
- Reject → show a text input modal for written reason before submitting.

**Report Queue:**
- List NGOs that have been reported.
- Show report count. If count ≥ 3, show a ⚠️ warning badge.
- Each row: NGO name, report count, `View` button (expands to show individual reports with reasons and timestamps), `Dismiss` / `Suspend` action buttons.

**NGO Management table:**
- All verified NGOs listed with name and trust tier badge.
- Actions per row: `View Needs` (expand inline), `Edit` (open edit modal), `Suspend`.
- Suspend → confirmation modal → POST `/api/admin/ngos/:id/suspend`.

**API calls:**
```js
GET /api/admin/stats
Response: { verifiedNgos, activeNeeds, pledgesToday, fulfilledThisMonth }

GET /api/admin/ngos/pending
GET /api/admin/ngos              // all verified NGOs
GET /api/admin/reports

POST /api/admin/ngos/{id}/approve
POST /api/admin/ngos/{id}/reject
Body (JSON): { reason }

POST /api/admin/ngos/{id}/suspend

PUT /api/admin/needs/{id}        // Edit any NGO's need
DELETE /api/admin/needs/{id}     // Remove any NGO's need (cascade cancels pledges)
```

---

## 6. Shared Components

### TrustBadge

```jsx
const TIER_STYLES = {
  New: "bg-gray-100 text-gray-600",
  Established: "bg-yellow-100 text-yellow-700",
  Trusted: "bg-green-100 text-green-700",
};

export default function TrustBadge({ score, label }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${TIER_STYLES[label]}`}>
      ★ {label} {score}
    </span>
  );
}
```

### Navbar

- Show different links based on `user.role`:
  - Guest: Login, Register
  - Donor: Map, My Dashboard, Logout
  - NGO: Dashboard, Logout
  - Admin: Dashboard, Logout

---

## 7. API Call Conventions

- All API calls go through `src/api/axios.js` (the configured instance — never use raw `fetch` for backend calls).
- Always wrap calls in `try/catch`. Show a user-friendly error message on failure.
- Loading state: use a `loading` boolean in local state. Show a spinner or skeleton while loading.
- For actions (POST/PUT/DELETE): disable the submit button while the request is in flight to prevent double submission.

```js
// Standard pattern for a page
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  api.get("/api/some-endpoint")
    .then((res) => setData(res.data))
    .catch((err) => setError(err.response?.data?.message || "Something went wrong"))
    .finally(() => setLoading(false));
}, []);
```

---

## 8. PWA Setup

> Owner: Rizwan. Add this after Tier 1 is live. Estimated time: half a day.

### 8.1 manifest.json

Place in `public/manifest.json`:

```json
{
  "name": "AI Donor Matcher",
  "short_name": "DonorMatch",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#1F4E79",
  "theme_color": "#2E75B6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Link in `index.html`:
```html
<link rel="manifest" href="/manifest.json" />
<meta name="theme-color" content="#2E75B6" />
```

### 8.2 Service Worker

Place in `public/service-worker.js`:

```js
const CACHE = "adm-cache-v1";
const PRECACHE = ["/", "/index.html"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)));
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
```

Register in `src/main.jsx`:
```js
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js");
  });
}
```

### 8.3 Offline behaviour

- Map and previously visited NGO profiles are served from cache when offline.
- Any action requiring the server (pledge, mark fulfilled) must check connectivity and show: _"You are offline. This action requires an internet connection."_

```js
if (!navigator.onLine) {
  alert("You are offline. This action requires an internet connection.");
  return;
}
```

---

## 9. Vercel Deployment

1. Push repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub.
3. Framework preset: **Vite**.
4. Add environment variables: `VITE_API_BASE_URL` and `VITE_OSRM_URL`.
5. Add `vercel.json` to project root to handle client-side routing:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

6. Every push to `main` auto-deploys. Preview deployments are created for every PR.
