# AI Donation Matcher Final Documentation

Last updated: 2026-03-31

## 1. Executive Summary

AI Donation Matcher is a location-aware donation coordination platform that connects donors with verified NGOs based on real-time needs. The deployed system now uses:

- React 19 + Vite 6 frontend
- Spring Boot backend
- PostgreSQL persistence
- Firebase Authentication for client sign-in
- Render for backend hosting
- Vercel for frontend hosting
- OpenStreetMap + Leaflet for map rendering
- OSRM for route estimation
- Nominatim for address geocoding when needed

The platform supports three application roles:

- `DONOR`
- `NGO`
- `ADMIN`

Firebase now owns user authentication at the identity layer, while the backend still owns:

- application role assignment
- NGO approval state
- profile completion state
- need and pledge lifecycle
- moderation and admin authorization

## 2. System Architecture

```mermaid
flowchart LR
    U["User Browser"] --> F["Frontend (React + Vite on Vercel)"]
    F --> FB["Firebase Auth"]
    F --> B["Backend API (Spring Boot on Render)"]
    B --> DB["PostgreSQL"]
    B --> CL["Cloudinary"]
    F --> OSM["OpenStreetMap / Leaflet Tiles"]
    F --> OSRM["OSRM Routing"]
    F --> NOM["Nominatim Geocoding"]
```

### 2.1 Deployment Topology

```mermaid
flowchart TD
    V["Vercel Frontend\nhttps://ai-donor-matcher-frontend.vercel.app"] --> API["Render Backend\nhttps://ai-donor-matcher-backend.onrender.com"]
    V --> FIRE["Firebase Authentication"]
    API --> PG["PostgreSQL Database"]
    API --> CA["Cloudinary Asset Storage"]
    V --> TILE["OSM Tile Server"]
    V --> ROUTE["OSRM"]
    V --> GEO["Nominatim"]
```

## 3. Core Data Model

### 3.1 ER Diagram

```mermaid
erDiagram
    USER ||--o| NGO : owns
    NGO ||--o{ NEED : publishes
    NGO ||--o{ REPORT : receives
    USER ||--o{ REPORT : submits
    USER ||--o{ PLEDGE : creates
    NEED ||--o{ PLEDGE : receives
    NGO ||--o{ PLEDGE : receives_through_need

    USER {
        long id
        string fullName
        string email
        string role
        boolean emailVerified
        string firebaseUid
    }

    NGO {
        long id
        long userId
        string name
        string contactEmail
        string location
        string address
        string categoryOfWork
        string status
        boolean profileComplete
        decimal trustScore
        decimal lat
        decimal lng
    }

    NEED {
        long id
        long ngoId
        string itemName
        string category
        string urgency
        int quantityRequired
        int quantityPledged
        int quantityReceived
        int quantityRemaining
        string status
        datetime expiryDate
    }

    PLEDGE {
        long id
        long needId
        long donorUserId
        int quantity
        string status
        datetime createdAt
        datetime expiresAt
        datetime fulfilledAt
    }

    REPORT {
        long id
        long ngoId
        long reporterUserId
        string reason
        datetime createdAt
    }
```

### 3.2 Practical Ownership Rules

- Every `NGO` record belongs to one `USER`.
- Every `NEED` belongs to one NGO.
- Every `PLEDGE` belongs to one donor user and one need.
- Need remaining quantity is now a derived operational value driven by pledged and received totals.
- NGO receipt is now pledge-level, not only need-level.

## 4. Authentication and Authorization Flow

### 4.1 Firebase + Backend Hybrid Model

The current authentication stack is hybrid:

1. Frontend signs users in with Firebase Email/Password.
2. Frontend reads the Firebase ID token.
3. Frontend calls backend registration/login using that token.
4. Backend validates the Firebase token and maps it to the application user model.
5. Backend APIs trust the Firebase bearer token for protected requests.

### 4.2 Login / Signup Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant FA as Firebase Auth
    participant BE as Backend
    participant DB as PostgreSQL

    U->>FE: Enter signup or login details
    FE->>FA: Firebase Email/Password signup or login
    FA-->>FE: Firebase user session
    FE->>FA: getIdToken()
    FA-->>FE: Firebase ID token
    alt First-time app registration
        FE->>BE: POST /api/auth/firebase/register
        BE->>DB: Create app user / NGO linkage
        DB-->>BE: Persisted user state
        BE-->>FE: App user payload
    else Returning app login
        FE->>BE: POST /api/auth/firebase/login
        BE->>DB: Resolve user + role + NGO state
        DB-->>BE: App user state
        BE-->>FE: App user payload
    end
```

### 4.3 Auth Responsibilities

#### Firebase owns

- email/password sign-in
- email verification email delivery
- Firebase session state
- ID token issuance

#### Backend owns

- `DONOR` / `NGO` / `ADMIN` role
- NGO approval and suspension
- profile completion gating
- protected app business rules

## 5. Route Map

The active route set is:

- `/login`
- `/register`
- `/verify-email`
- `/`
- `/map` -> redirects to `/`
- `/ngo/:ngoId`
- `/pledge/:needId`
- `/delivery/:pledgeId`
- `/donor/dashboard`
- `/ngo/dashboard`
- `/ngo/complete-profile`
- `/admin/dashboard`

## 6. End-to-End Feature Flows

### 6.1 Donor Discovery Flow

```mermaid
flowchart TD
    A["Open /"] --> B["Request browser location"]
    B --> C["Call GET /api/ngos?lat&lng&radius"]
    C --> D{"Results found?"}
    D -- Yes --> E["Render markers + NGO list"]
    D -- No --> F["Expand query beyond radius"]
    F --> G["Render broader NGO list with banner"]
    E --> H["Click NGO row"]
    H --> I["Focus map on NGO"]
    I --> J["Open NGO popup or profile"]
```

Current donor home also surfaces a small active pledge banner using `GET /api/pledges/active`.

### 6.2 Donor Pledge Creation Flow

```mermaid
flowchart TD
    A["Open NGO profile"] --> B["See active needs"]
    B --> C["Click Pledge This Item"]
    C --> D["Open /pledge/:needId"]
    D --> E["Read need from route state or GET /api/needs/{id}"]
    E --> F["Submit POST /api/pledges"]
    F --> G["Receive pledgeId + NGO delivery details"]
    G --> H["Open /delivery/:pledgeId"]
```

### 6.3 Delivery Flow

```mermaid
flowchart TD
    A["Open /delivery/:pledgeId"] --> B["Load pledge from state / cache / GET /api/pledges/{id}"]
    B --> C["Resolve NGO destination"]
    C --> D{"NGO address available?"}
    D -- Yes --> E["Geocode address with Nominatim"]
    D -- No --> F["Use stored ngoLat / ngoLng"]
    E --> G["Render destination marker"]
    F --> G
    G --> H["Use current location as start"]
    H --> I["Request route from OSRM"]
    I --> J["Show ETA, distance, and external Google Maps navigation"]
```

### 6.4 Donor Dashboard Flow

```mermaid
flowchart TD
    A["Open /donor/dashboard"] --> B["Fetch GET /api/pledges/active"]
    A --> C["Fetch GET /api/pledges/history"]
    B --> D["Render active cards"]
    C --> E["Render history cards"]
    D --> F["Cancel active pledge via DELETE /api/pledges/{id}"]
    F --> G["Refresh active + history"]
    E --> H["Review fulfilled / cancelled / expired history"]
```

If active count is zero and history exists, the frontend auto-switches to the history tab.

### 6.5 NGO Need Management Flow

```mermaid
flowchart TD
    A["Open /ngo/dashboard"] --> B["Fetch profile"]
    B --> C{"Profile complete?"}
    C -- No --> D["Redirect to /ngo/complete-profile"]
    C -- Yes --> E["Fetch GET /api/ngo/my/needs"]
    E --> F["Create / edit / delete needs"]
    F --> G["Updated active needs list"]
```

### 6.6 NGO Incoming Pledge Receipt Flow

```mermaid
flowchart TD
    A["Open NGO dashboard"] --> B["Fetch GET /api/ngo/my/pledges"]
    B --> C["Render incoming pledge rows"]
    C --> D["Click Receive pledge"]
    D --> E["PATCH /api/ngo/my/pledges/{pledgeId}/receive"]
    E --> F["Pledge status -> FULFILLED"]
    F --> G["Need quantityReceived / remaining recalculated"]
    G --> H{"Need fully covered?"}
    H -- Yes --> I["Need becomes fulfilled"]
    H -- No --> J["Need stays open with remaining quantity"]
```

This is the major behavior change from the older need-level-only fulfillment model.

### 6.7 Admin Approval Flow

```mermaid
flowchart TD
    A["Admin opens /admin/dashboard"] --> B["Load stats and verification queue"]
    B --> C["Review pending NGO"]
    C --> D["Approve or reject"]
    D --> E["Backend updates NGO approval status"]
    E --> F["Approved NGO becomes eligible for GET /api/ngos"]
    F --> G["Discovery map can show NGO if coordinates and approval filters allow it"]
```

## 7. API Surface Used by Frontend

### 7.1 Public / shared

- `POST /api/auth/firebase/register`
- `POST /api/auth/firebase/login`
- `GET /api/ngos`
- `GET /api/ngos/{id}`
- `GET /api/needs/{id}`

### 7.2 Donor

- `POST /api/pledges`
- `GET /api/pledges/active`
- `GET /api/pledges/history`
- `GET /api/pledges/{id}`
- `DELETE /api/pledges/{id}`
- `POST /api/ngos/{id}/report`

### 7.3 NGO

- `GET /api/ngo/my/profile`
- `PUT /api/ngo/my/profile`
- `POST /api/ngo/my/photo`
- `GET /api/ngo/my/needs`
- `POST /api/needs`
- `PUT /api/needs/{id}`
- `DELETE /api/needs/{id}`
- `GET /api/ngo/my/pledges`
- `PATCH /api/ngo/my/pledges/{pledgeId}/receive`

### 7.4 Admin

- `GET /api/admin/stats`
- `GET /api/admin/ngos/pending`
- `POST /api/admin/ngos/{id}/approve`
- `POST /api/admin/ngos/{id}/reject`
- `GET /api/admin/reports`
- `GET /api/admin/ngos`
- `GET /api/admin/ngos/{id}/needs`
- `POST /api/admin/ngos/{id}/suspend`

## 8. Database Access Patterns

### 8.1 Login / Signup

- Firebase stores the identity record.
- Backend stores and reads the application user record and NGO linkage record.

### 8.2 Need Access

- Discovery map reads NGO summaries from backend, which are filtered for public visibility.
- NGO dashboard reads own needs directly.
- Admin dashboard reads moderated NGO and need views.

### 8.3 Pledge Access

- Donor active/history endpoints are donor-scoped.
- NGO incoming pledge list is NGO-scoped.
- Admin does not manage donor pledge lifecycle directly in the current frontend flow.

### 8.4 Geospatial Access

- Backend stores NGO coordinates.
- Frontend uses those coordinates for map pinning.
- Delivery page can re-geocode NGO address when route accuracy matters.

## 9. Deployment and Environment

### 9.1 Frontend Environment Variables

Required frontend variables:

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

### 9.2 Production URLs

- Frontend: `https://ai-donor-matcher-frontend.vercel.app`
- Backend: `https://ai-donor-matcher-backend.onrender.com`

### 9.3 Required Cross-System Configuration

Backend CORS must allow:

- `http://localhost:5173`
- `https://ai-donor-matcher-frontend.vercel.app`

Firebase authorized domains must include:

- `ai-donor-matcher-frontend.vercel.app`

## 10. Current Constraints and Known Gaps

- Admin report dismissal / resolution is not yet part of the supported frontend workflow unless backend adds it explicitly.
- NGO reinstate / unsuspend is not yet supported unless backend adds it explicitly.
- Newly approved NGOs appear on the map only if backend includes them in `GET /api/ngos` and valid coordinates exist.
- The frontend still depends on backend consistency between need state and donor history state for completed or cancelled pledge visibility.

## 11. Validation Checklist

### Auth

- Firebase signup works
- Firebase login works
- backend register/login with bearer token works
- unverified users are gated correctly

### Discovery

- donor home loads nearby NGOs
- list click focuses map
- `View full profile` opens NGO page

### Pledges

- donor can pledge a need
- delivery page loads after refresh
- Google Maps navigation uses NGO address first
- donor cancellation updates dashboard state

### NGO

- NGO profile completion flow works
- active needs CRUD works
- incoming pledge receipt works pledge-by-pledge

### Admin

- approve/reject queue works
- approved NGOs become discoverable when backend returns them

## 12. Source of Truth

When this document conflicts with older implementation notes, the current source of truth is:

1. current code in the frontend repo
2. [FRONTEND_BACKEND_AGREEMENT.md](C:\Users\moham\FYP\AI-Donor-Matcher-Frontend\docs\FRONTEND_BACKEND_AGREEMENT.md)
3. current backend Swagger / deployed contract
