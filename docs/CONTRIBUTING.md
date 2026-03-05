# Contributing to AI Donation Matcher

Thank you for contributing! This guide explains how to add a new feature using a branch-based workflow.

---

## Prerequisites

- **Node.js** ≥ 18 and **npm** ≥ 9
- Git installed and configured
- The repo cloned locally:
  ```bash
  git clone https://github.com/<your-username>/AI-Donor-Matcher-Frontend.git
  cd AI-Donor-Matcher-Frontend
  npm install
  ```

---

## Every Time You Open the Editor

**Before touching any code**, always sync your local repo with the remote to avoid conflicts:

```bash
git fetch origin          # see what's changed remotely (safe, no merge)
git pull origin main      # pull latest changes into your current branch
npm install               # install any new dependencies added by teammates
```

> **Why?** Teammates may have merged PRs while you were away. Working on stale code leads to merge conflicts and wasted effort.

If you are on a feature branch, rebase onto the latest `main` to stay current:

```bash
git fetch origin
git rebase origin/main
```

Resolve any conflicts, then continue working.

---

## AI Coding Assistants

This repo includes instruction files for all major AI coding agents so they automatically follow the project's design system and conventions — **no manual setup required**.

| File | Agent |
|------|-------|
| `.github/copilot-instructions.md` | GitHub Copilot |
| `.cursorrules` | Cursor |
| `.windsurfrules` | Windsurf |
| `CLAUDE.md` | Claude Code / Claude-based tools |
| `.clinerules` | Cline |
| `AGENTS.md` | OpenAI Codex CLI |

Each file tells the agent to:
- Use `teal-600` as the primary colour (never `#2E75B6` or `#1F4E79`).
- Use `glass rounded-2xl` cards, `glass-nav` navbar, `bg-teal-50` page backgrounds.
- Read `docs/skills/design-system/SKILL.md` before modifying any UI.
- Route all API calls through `src/api/axios.js`.
- Use Lucide React for icons.

If you add a **new AI tool** that isn't listed above, create a config file for it in the repo root following the same pattern as `CLAUDE.md`, then open a PR.

---

## Branch Naming Convention

Every feature gets its own branch. Use the naming pattern from [docs/FEATURES.md](docs/FEATURES.md):

```
feat/<feature-name>
```

Examples:
- `feat/donor-registration`
- `feat/discovery-map`
- `feat/admin-verification`

For bug fixes, use `fix/<description>`. For chores (dependency updates, config), use `chore/<description>`.

---

## Step-by-Step: Adding a Feature

### 1. Sync with `main`

Always start from an up-to-date `main` branch:

```bash
git checkout main
git pull origin main
```

### 2. Create a feature branch

```bash
git checkout -b feat/<feature-name>
```

Example:
```bash
git checkout -b feat/donor-registration
```

### 3. Implement the feature

- Refer to [docs/FEATURES.md](docs/FEATURES.md) for the feature spec and branch name.
- Refer to [docs/FRONTEND.md](docs/FRONTEND.md) for detailed implementation guidance, API calls, and component structure.
- Place files in the correct directory:
  - Pages → `src/pages/`
  - Shared components → `src/components/`
  - Utilities → `src/utils/`
  - API helpers → `src/api/`
- Follow existing code patterns (Tailwind classes, Axios via `src/api/axios.js`, AuthContext for auth).

### 4. Test locally

```bash
npm run dev
```

Open `http://localhost:5173` and manually verify your feature works.

### 5. Commit your changes

Write clear, descriptive commit messages:

```bash
git add .
git commit -m "feat: add donor registration page with role toggle and file upload"
```

**Commit message format:**
```
<type>: <short description>

Optional longer description of what changed and why.
```

Types: `feat`, `fix`, `chore`, `docs`, `refactor`, `style`, `test`

### 6. Push the branch

```bash
git push origin feat/<feature-name>
```

### 7. Open a Pull Request

1. Go to the repository on GitHub.
2. Click **"Compare & pull request"** for your branch.
3. Fill in the PR template:
   - **Title:** `feat: <Feature Name>` (e.g., `feat: Donor Registration`)
   - **Description:** What was built, which feature ID from FEATURES.md, any API endpoints used.
   - **Screenshots:** Attach a screenshot or screen recording of the feature.
4. Request a review from a team member.
5. Address any review feedback with additional commits on the same branch.

### 8. Merge

Once approved, the reviewer (or you, if you have permission) merges the PR into `main` using **Squash and Merge**. Delete the feature branch after merging.

---

## Code Guidelines

### General
- Use **functional components** with hooks (no class components).
- All API calls go through `src/api/axios.js` — never use raw `fetch()` for backend calls.
- Wrap API calls in `try/catch`. Always show user-friendly error messages.
- Use a `loading` state boolean. Show a spinner or skeleton while data loads.
- Disable submit buttons while a request is in flight to prevent double submission.

### Styling
- Use **Tailwind CSS** utility classes. No custom CSS files per component.
- Theme colours: primary `teal-600` (#0D9488), accent `emerald-500`, neutrals from the `slate` palette. **Never** use `#2E75B6` or `#1F4E79`.
- Cards: `glass rounded-2xl`. Buttons: `bg-teal-600 text-white rounded-xl hover:bg-teal-700`. Page backgrounds: `bg-teal-50`.
- See `docs/skills/design-system/SKILL.md` for the full design token reference.
- Responsive: mobile-first. Test at 375px width minimum.

### Routing
- Add new routes in `src/App.jsx`.
- Wrap role-restricted routes with `<ProtectedRoute role="ROLE">`.

### State Management
- Use React Context (`AuthContext`) for auth state only.
- Use local component state (`useState`) for everything else.
- No Redux or external state library needed for this project.

---

## Updating the Feature List

After completing a feature, update its status in [docs/FEATURES.md](docs/FEATURES.md):

1. Change the status icon from `⬜` to `✅`.
2. Commit the update on your feature branch before opening the PR:
   ```bash
   git add docs/FEATURES.md
   git commit -m "docs: mark <feature-name> as complete"
   ```

---

## Environment Variables

Never commit `.env` to Git. Each developer creates their own `.env` locally:

```env
VITE_API_BASE_URL=https://your-render-backend.onrender.com
VITE_OSRM_URL=https://router.project-osrm.org
```

For production, set these in **Vercel → Project Settings → Environment Variables**.

---

## Recommended Implementation Order

Features have dependencies. Follow this order so each feature's prerequisites are already in place:

| Phase | Features | Why First |
|-------|----------|-----------|
| **1 — Infrastructure** | 8.1 Axios Setup → 8.2 Auth Context → 7.5 ProtectedRoute → 7.1 Navbar | Every page depends on the HTTP client, auth state, and route guards. |
| **2 — Auth & Onboarding** | 1.1 Donor Registration → 1.2 NGO Registration → 1.3 Email Verification → 1.4 Login → 1.5 Logout → 1.6 Protected Routes | Users must be able to register and log in before any role-specific screens work. |
| **3 — Shared Components** | 7.2 TrustBadge → 7.3 NeedProgressBar → 7.4 CategoryPin | Used across Discovery Map, NGO Profile, and dashboards. Build once, reuse everywhere. |
| **4 — Discovery Map** | 2.1 Discovery Map → 2.2 Filter Bar → 2.3 Side List → 2.4 Auto-Expand → 2.5 Pin Popup | The donor's main entry point. Filter Bar, Side List, Auto-Expand, and Pin Popup are sub-features of the map page. |
| **5 — NGO Profile & Pledging** | 3.1 NGO Profile → 3.2 Report NGO → 3.3 Pledge Screen → 3.4 Delivery View (OSRM) | Donors navigate here from the map. Pledge and Delivery depend on the profile page existing. |
| **6 — Donor Dashboard** | 4.1 Active Pledges → 4.2 Donation History | Requires pledges to exist (Phase 5). |
| **7 — NGO Dashboard** | 5.1 Profile Completion → 5.2 Active Needs CRUD → 5.3 Incoming Pledges → 5.4 Mark Fulfilled → 5.5 Trust Score Display | Depends on auth (Phase 2) and shared components (Phase 3). Profile Completion gates map visibility. |
| **8 — Admin Dashboard** | 6.1 Stats Overview → 6.2 Verification Queue → 6.3 Report Queue → 6.4 NGO Management → 6.5 Suspend NGO (Cascade) | Admin features are independent of donor/NGO UI but need Infrastructure (Phase 1). Do last since they aren't on the critical user path. |
| **9 — PWA & Deployment** | 8.3 PWA Manifest → 8.4 Service Worker → 8.5 Offline Check → 8.6 Vercel Config | Polish layer. Add after all features work correctly. |

> **Rule of thumb:** Within each phase, work left-to-right. Never skip to a later phase until the current one is complete.

---

## Questions?

If you're unsure about implementation details for a feature, check:
1. [docs/FEATURES.md](docs/FEATURES.md) — Feature list with descriptions
2. [docs/FRONTEND.md](docs/FRONTEND.md) — Detailed implementation guide with API specs
3. [docs/AI_Donation_Matcher_FINAL_v4_.md](docs/AI_Donation_Matcher_FINAL_v4_.md) — Full project documentation

If still unclear, open a GitHub Issue with the label `question` and tag a team member.
