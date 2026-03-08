# AI Donation Matcher — Feature List

> Extracted from [FRONTEND.md](FRONTEND.md) and [AI_Donation_Matcher_FINAL_v4_.md](AI_Donation_Matcher_FINAL_v4_.md).
> Each feature maps to a branch name for implementation tracking.

---

## Status Legend

| Icon | Meaning |
|------|---------|
| ⬜ | Not started |
| 🟡 | In progress |
| ✅ | Complete |

---

## 1. Auth & Account

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 1.1 | Donor Registration | `feat/donor-registration` | ✅ | Full name, email, password, location. POST JSON to `/api/auth/register`. Redirect to email verification screen. |
| 1.2 | NGO Registration | `feat/ngo-registration` | ✅ | Same fields + file upload for credentials. POST multipart to `/api/auth/register`. Profile set to PENDING. |
| 1.3 | Email Verification Screen | `feat/email-verification` | ✅ | Static pending screen with "Resend" button. Unverified users can browse map but Pledge button is disabled. |
| 1.4 | Login | `feat/login` | ✅ | Email + password. Store JWT + user in localStorage via AuthContext. Role-based redirect (Donor → map, NGO → dashboard, Admin → admin dashboard). |
| 1.5 | Logout | `feat/logout` | ✅ | Clear token + user from localStorage. Redirect to `/login`. |
| 1.6 | Protected Routes | `feat/protected-routes` | ✅ | Role-based route guard. Redirect unauthenticated users to `/login`, wrong-role users to `/`. |

---

## 2. Donor — Discovery & Map

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 2.1 | Discovery Map | `feat/discovery-map` | ⬜ | Leaflet `MapContainer` with OpenStreetMap tiles. Request browser geolocation on mount. Colour-coded category pins for each verified NGO. |
| 2.2 | Filter Bar | `feat/map-filters` | ⬜ | NGO name search (debounced 300 ms), category dropdown, radius slider (1–50 km). All filters hit the same API call. |
| 2.3 | Side List | `feat/map-side-list` | ⬜ | Right panel listing NGOs sorted by distance ASC, urgent-first within 2 km bands. Card shows name, distance, urgency badge, top need + remaining count. |
| 2.4 | Auto-Expand Nationwide | `feat/auto-expand` | ⬜ | If API returns empty results, re-fetch without radius. Show yellow banner: "No NGOs found nearby. Showing all available NGOs." |
| 2.5 | Map Pin Popup | `feat/pin-popup` | ⬜ | Popup on marker click: NGO photo, name, trust badge, distance, top need with remaining qty, "View Full Profile" button. |

---

## 3. Donor — NGO Profile & Pledging

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 3.1 | NGO Full Profile Page | `feat/ngo-profile` | ⬜ | Route `/ngo/:id`. Shows photo, name, trust score, address, contact, active needs with progress bars, fulfilled history. |
| 3.2 | Report NGO Modal | `feat/report-ngo` | ⬜ | "Report this organisation" link → modal with 4 reasons (Fraud / Inactive / Misleading / Other). POST to `/api/ngos/{id}/report`. |
| 3.3 | Pledge Screen | `feat/pledge-screen` | ⬜ | Route `/pledge/:needId`. Quantity selector clamped to remaining. Confirm → POST `/api/pledges` → redirect to delivery view. |
| 3.4 | Delivery View (OSRM) | `feat/delivery-view` | ⬜ | Route `/delivery/:pledgeId`. OSRM route polyline on Leaflet map. ETA display, expiry countdown, NGO contact card, Cancel button. |

---

## 4. Donor — Dashboard

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 4.1 | Active Pledges Tab | `feat/donor-active-pledges` | ⬜ | List of active pledges with category dot, item, quantity, expiry countdown, Navigate button, Cancel button. |
| 4.2 | Donation History Tab | `feat/donor-history` | ⬜ | Past fulfilled/expired pledges. Each row links back to NGO profile for easy re-donation. |

---

## 5. NGO — Dashboard & Needs

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 5.1 | NGO Profile Completion | `feat/ngo-profile-completion` | ⬜ | Route `/ngo/complete-profile`. Progress bar, required-field checklist, photo upload, geolocation detect. NGO visible on map only when 100% complete. |
| 5.2 | Active Needs CRUD | `feat/ngo-needs-crud` | ⬜ | List active needs with progress bars. Add Need modal (max 5). Edit/Delete only when no active pledges. Lock icon when pledged. |
| 5.3 | Incoming Pledges List | `feat/ngo-incoming-pledges` | ⬜ | View donor name, email, item, quantity, timestamp for each incoming pledge. |
| 5.4 | Mark as Fulfilled | `feat/ngo-mark-fulfilled` | ⬜ | Button on locked needs / delivered pledges. Triggers trust score recalc, donor thank-you email, history update. |
| 5.5 | Trust Score Display | `feat/ngo-trust-score` | ⬜ | Show numeric score + tier (New / Established / Trusted) on dashboard header. Auto-updates on fulfillment. |

---

## 6. Admin — Platform Management

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 6.1 | Stats Overview Strip | `feat/admin-stats` | ⬜ | Four stat cards: Verified NGOs, Active Needs, Pledges Today, Fulfilled This Month. GET `/api/admin/stats`. |
| 6.2 | Verification Queue | `feat/admin-verification` | ⬜ | List PENDING NGOs. View uploaded documents. Approve or Reject (with written reason). |
| 6.3 | Report Queue | `feat/admin-reports` | ⬜ | List reported NGOs. ≥ 3 reports shows warning badge. Actions: Dismiss or Suspend. |
| 6.4 | NGO Management Table | `feat/admin-ngo-mgmt` | ⬜ | All verified NGOs with trust tier. Actions: View Needs, Edit, Suspend / Reinstate. |
| 6.5 | Suspend NGO (Cascade) | `feat/admin-suspend` | ⬜ | Atomic operation: close all needs, cancel all pledges, notify all donors, remove from map. |

---

## 7. Shared Components

| # | Component | Branch | Status | Description |
|---|-----------|--------|--------|-------------|
| 7.1 | Navbar | `feat/navbar` | ✅ | Role-based navigation links. Guest / Donor / NGO / Admin variants. |
| 7.2 | TrustBadge | `feat/trust-badge` | ⬜ | Reusable badge: star icon + tier label + numeric score. Colour varies by tier. |
| 7.3 | NeedProgressBar | `feat/progress-bar` | ⬜ | Pledged / required visual bar with percentage label. |
| 7.4 | CategoryPin (DivIcon) | `feat/category-pin` | ⬜ | Leaflet `L.divIcon` factory with colour-coded circles per category. |
| 7.5 | ProtectedRoute | `feat/protected-route` | ✅ | HOC checking auth + role, redirects on failure. |

---

## 8. Infrastructure & PWA

| # | Feature | Branch | Status | Description |
|---|---------|--------|--------|-------------|
| 8.1 | Axios Instance + JWT Interceptor | `feat/axios-setup` | ✅ | Base URL from env. Request interceptor attaches `Authorization: Bearer` header. |
| 8.2 | AuthContext (React Context) | `feat/auth-context` | ✅ | `user` / `token` state, `login()` / `logout()`, persisted in localStorage. |
| 8.3 | PWA Manifest | `feat/pwa-manifest` | ⬜ | `public/manifest.json` with app name, icons, theme colour. |
| 8.4 | Service Worker | `feat/service-worker` | ⬜ | Cache-first for static, network-first for API. Offline fallback. |
| 8.5 | Offline Connectivity Check | `feat/offline-check` | ⬜ | `navigator.onLine` guard on all mutating actions. User-friendly offline alert. |
| 8.6 | Vercel Deployment Config | `feat/vercel-config` | ⬜ | `vercel.json` SPA rewrites. Environment variables in Vercel dashboard. |

---

## 9. Future Scope (Post-Prototype)

| # | Feature | Branch | Description |
|---|---------|--------|-------------|
| 9.1 | Volunteer Coordination | `feat/volunteer-role` | Volunteer role with task board, assignment, and delivery tracking. |
| 9.2 | Real-Time Notifications | `feat/realtime-notifs` | WebSocket or SSE for pledge alerts, fulfillment confirmations. |
| 9.3 | Dark Mode | `feat/dark-mode` | Tailwind `dark:` variant support with toggle. |
| 9.4 | Multi-Language (i18n) | `feat/i18n` | Internationalisation with `react-i18next`. |
| 9.5 | Analytics Dashboard | `feat/analytics` | Charts for donation trends, category breakdown, regional heatmap. |
| 9.6 | Push Notifications | `feat/push-notifications` | Web Push API via service worker for pledge/fulfillment alerts. |

---

## Total: 38 features + 6 future scope items
