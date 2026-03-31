# Frontend-Backend Agreement

Last updated: 2026-03-31

This document is the current working contract between the React frontend and the Spring Boot backend.

Use this together with backend Swagger:

- Swagger UI: `/swagger-ui/index.html`
- OpenAPI JSON: `/v3/api-docs`

If this document and old docs differ, this document plus Swagger are the source of truth.

## 1. Base Rules

### Base URLs

- Local backend: `http://localhost:8080`
- Production backend: `https://ai-donor-matcher-backend.onrender.com`
- Production frontend: `https://ai-donor-matcher-frontend.vercel.app`

### Content Types

- Standard API body: `application/json`
- NGO document upload: `multipart/form-data`
- NGO photo upload: `multipart/form-data`

## 2. Authentication Model

The project no longer uses the old OTP-first frontend auth flow.

The active flow is:

1. Frontend authenticates users with Firebase Email/Password.
2. Frontend gets Firebase ID token from the signed-in user.
3. Frontend sends that token to backend in:

```http
Authorization: Bearer <firebase-id-token>
```

4. Backend validates the Firebase token and resolves the application user.

### Backend responsibilities after Firebase auth

- assign or resolve `DONOR`, `NGO`, `ADMIN`
- enforce NGO approval state
- enforce profile completion state
- enforce all protected business rules

### Deprecated frontend auth endpoints

These are not part of the active frontend flow anymore:

- `POST /api/auth/send-registration-otp`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- old OTP-based `POST /api/auth/register`
- password-based `POST /api/auth/login`

## 3. Registration and Login Agreement

### First-time application registration

```http
POST /api/auth/firebase/register
Authorization: Bearer <firebase-id-token>
```

Example JSON body:

```json
{
  "fullName": "Helping Hands",
  "role": "NGO",
  "location": "Nellore"
}
```

NGO registration may still use multipart payload when a document file is included.

### Returning application login

```http
POST /api/auth/firebase/login
Authorization: Bearer <firebase-id-token>
```

### Expected frontend behavior

- Firebase signup/login happens first in the browser
- frontend then calls backend register/login
- frontend stores the backend user payload plus active Firebase bearer token
- all protected API calls use the Firebase bearer token

## 4. Public Endpoints Used by Frontend

### NGO discovery and profile

- `GET /api/ngos`
- `GET /api/ngos/{id}`

`GET /api/ngos` should support:

- `lat`
- `lng`
- `radius`
- `category`
- `search`

Approved, publicly visible NGOs with valid coordinates should appear in this result.

### Need detail

- `GET /api/needs/{id}`

Used by the pledge screen for direct load and refresh-safe entry.

## 5. Donor Contract

### Create pledge

```http
POST /api/pledges
```

Expected response includes delivery-ready fields such as:

- `pledgeId`
- `ngoLat`
- `ngoLng`
- `ngoAddress`
- `ngoContactEmail`
- `expiresAt`

### Active donor pledges

- `GET /api/pledges/active`

### Donor pledge history

- `GET /api/pledges/history`

History should include non-active closed states such as:

- `CANCELLED`
- `FULFILLED`
- expired / closed states returned by backend

### Pledge detail

- `GET /api/pledges/{id}`

Used for refresh-safe delivery page loading.

### Cancel pledge

- `DELETE /api/pledges/{id}`

Expected response: `204 No Content`

### Report NGO

- `POST /api/ngos/{id}/report`

Frontend sends a string reason.

## 6. NGO Contract

### NGO profile

- `GET /api/ngo/my/profile`
- `PUT /api/ngo/my/profile`
- `POST /api/ngo/my/photo`

Notes:

- profile completion is determined from profile data, not from Firebase auth response
- NGO address updates may trigger backend geocoding

### NGO need management

- `GET /api/ngo/my/needs`
- `POST /api/needs`
- `PUT /api/needs/{id}`
- `DELETE /api/needs/{id}`

### NGO incoming pledges

- `GET /api/ngo/my/pledges`

Expected fields now include:

- `pledgeId`
- `needId`
- `donorName`
- `donorEmail`
- `itemName`
- `category`
- `quantity`
- `status`
- `createdAt`
- `expiresAt`
- `needQuantityRequired`
- `needQuantityPledged`
- `needQuantityReceived`
- `needQuantityRemaining`

### NGO pledge-level receipt

- `PATCH /api/ngo/my/pledges/{pledgeId}/receive`

This is now the correct NGO confirmation flow.

Rules:

- only the owning NGO can call it
- only `ACTIVE` pledges can be received
- received pledge becomes `FULFILLED`
- related need totals are recalculated
- need becomes fully fulfilled only when received quantity reaches required quantity

The frontend must not assume that receiving one pledge automatically means the full need is complete.

## 7. Admin Contract

### Admin overview and moderation

- `GET /api/admin/stats`
- `GET /api/admin/ngos/pending`
- `POST /api/admin/ngos/{id}/approve`
- `POST /api/admin/ngos/{id}/reject`
- `GET /api/admin/reports`
- `GET /api/admin/ngos`
- `GET /api/admin/ngos/{id}/needs`
- `POST /api/admin/ngos/{id}/suspend`

### Supported admin states

The current frontend supports only documented actions. The following remain unsupported unless backend adds them:

- report dismissal / resolution endpoint
- NGO reinstate / unsuspend endpoint

## 8. Deployment Agreement

### Frontend env vars

The frontend expects:

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

### Backend deployment config

Backend must allow frontend origin(s) through CORS, at minimum:

```text
http://localhost:5173
https://ai-donor-matcher-frontend.vercel.app
```

If backend uses pattern-based origin config, exact domains are still preferred over broad wildcards.

### Firebase deployment config

Firebase authorized domains must include:

```text
ai-donor-matcher-frontend.vercel.app
```

## 9. Frontend Implementation Rules

- The donor home route is `/`, not `/map`
- `/map` is only a compatibility redirect
- Discovery and delivery flows may geocode NGO address on the frontend for route accuracy, but public NGO coordinates still come from backend data
- Navigation links should prefer NGO address when available, with stored coordinates only as fallback

## 10. Known Dependency Notes

- Newly approved NGOs will only appear on the discovery map if backend includes them in `GET /api/ngos` with valid coordinates
- Donor history visibility depends on backend returning closed pledges from `GET /api/pledges/history`
- Admin report dismissal and NGO reinstate remain future backend scope unless explicitly added
