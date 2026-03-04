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
- Theme colours: primary `#2E75B6`, dark `#1F4E79`, white backgrounds.
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

## Questions?

If you're unsure about implementation details for a feature, check:
1. [docs/FEATURES.md](docs/FEATURES.md) — Feature list with descriptions
2. [docs/FRONTEND.md](docs/FRONTEND.md) — Detailed implementation guide with API specs
3. [docs/AI_Donation_Matcher_FINAL_v4_.md](docs/AI_Donation_Matcher_FINAL_v4_.md) — Full project documentation

If still unclear, open a GitHub Issue with the label `question` and tag a team member.
