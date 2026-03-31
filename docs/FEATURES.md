# AI Donation Matcher Feature Status

Last updated: 2026-03-31

This file tracks the current implemented feature surface, not the older OTP-era plan.

## 1. Auth and Session

| Feature | Status | Notes |
|---|---|---|
| Firebase Email/Password signup | Complete | Frontend-first auth, backend app registration after Firebase auth |
| Firebase login | Complete | Backend login contract uses Firebase bearer token |
| Email verification pending flow | Complete | Verification email delivered by Firebase |
| Protected routes | Complete | Role-based guards remain active |
| Logout | Complete | Clears frontend session state |

## 2. Donor Discovery

| Feature | Status | Notes |
|---|---|---|
| Discovery map on `/` | Complete | `/map` redirects to `/` |
| Search + category + radius filters | Complete | Inline controls |
| NGO side list | Complete | Clicking a row focuses the map |
| Map pin popup | Complete | Includes profile navigation |
| Auto-expand broader search | Complete | Used when local radius search is empty |

## 3. Donor Pledging

| Feature | Status | Notes |
|---|---|---|
| NGO public profile | Complete | Includes active needs |
| Pledge screen | Complete | Uses need detail endpoint for direct load |
| Delivery view | Complete | Address-first navigation and destination resolution |
| Donor active pledges | Complete | Dashboard active tab |
| Donor history | Complete | Dashboard history tab |

## 4. NGO Workflow

| Feature | Status | Notes |
|---|---|---|
| NGO profile completion | Complete | Enforced by dashboard gating |
| NGO needs CRUD | Complete | Create/edit/delete active needs |
| Incoming pledges list | Complete | Uses backend incoming pledge endpoint |
| Pledge-level receipt | Complete | NGO confirms each pledge independently |

## 5. Admin Workflow

| Feature | Status | Notes |
|---|---|---|
| Stats overview | Complete | Staged loading |
| Verification queue | Complete | Approve/reject supported |
| Report queue | Complete | Read and moderation views supported |
| NGO management | Complete | Includes per-NGO need inspection |
| Suspend NGO | Complete | Supported action |

## 6. Deployment

| Feature | Status | Notes |
|---|---|---|
| Frontend deployment on Vercel | Complete | `https://ai-donor-matcher-frontend.vercel.app` |
| Backend deployment on Render | Complete | `https://ai-donor-matcher-backend.onrender.com` |
| Firebase auth integration | Complete | Production env configured |

## 7. Known Backend-Dependent Constraints

| Item | Status | Notes |
|---|---|---|
| Report dismissal / resolution | Pending backend support | Not part of current supported contract |
| NGO reinstate / unsuspend | Pending backend support | Not part of current supported contract |
| Map visibility for newly approved NGOs | Depends on backend `/api/ngos` | Backend must return approved NGOs with valid coordinates |
