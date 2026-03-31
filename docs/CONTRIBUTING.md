# Contributing

Last updated: 2026-03-31

## 1. Local Setup

```bash
npm install
npm run dev
```

The app expects a running backend and valid frontend environment variables.

## 2. Required Frontend Environment Variables

Copy from `.env.example` and set:

```text
VITE_API_BASE_URL
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
VITE_OSRM_URL
VITE_NOMINATIM_URL
```

## 3. Development Workflow

The team workflow used in this repo is:

1. Sync local `main`
2. Create a focused issue branch
3. Implement only the issue scope
4. Test locally before packaging
5. Push the branch
6. Open PR to `main`
7. Merge PR
8. Sync back to `main`

## 4. Branch Naming

Historical team branches follow:

```text
riz/{issue-no}-{issue-name}
```

Codex-created branches may use the `codex/` prefix unless a team-specific branch name is requested.

## 5. Code Conventions

- API calls go through `src/api/axios.js`
- auth state goes through `useAuth()`
- protected pages use `ProtectedRoute`
- use Lucide React icons
- follow `AGENTS.md` and the design system skill before UI edits

## 6. Auth Development Rules

Do not add new frontend code against the deprecated OTP endpoints.

Active auth model:

- Firebase Email/Password in client
- Firebase ID token in bearer header
- backend Firebase register/login endpoints for app identity linkage

## 7. Docs Responsibility

When architecture or contract changes happen, update at minimum:

- `docs/AI_Donation_Matcher_FINAL_v4_.md`
- `docs/FRONTEND_BACKEND_AGREEMENT.md`
- `docs/FRONTEND.md`
- feature implementation docs affected by the change

## 8. Deployment Notes

Production targets:

- frontend on Vercel
- backend on Render

Required deployment alignment:

- frontend `VITE_API_BASE_URL` must target Render backend
- backend CORS must allow the Vercel frontend domain
- Firebase authorized domains must include the deployed Vercel domain
