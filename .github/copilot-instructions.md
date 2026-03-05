# AI Donor Matcher Frontend — Copilot Instructions

This is a React 19 + Vite 6 + Tailwind CSS 3.4 frontend for a donation-matching platform.

## Design System (MUST follow)

Before writing or modifying any UI code, read and follow: `docs/skills/design-system/SKILL.md`

Key rules:
- **Primary color**: teal-600 (`#0D9488`). Never use `#2E75B6` or `#1F4E79`.
- **Accent**: emerald-500. **Neutrals**: slate palette (not gray).
- **Font**: Space Grotesk via Google Fonts.
- **Cards**: use the `glass` CSS class + `rounded-2xl` — not `bg-white rounded-lg shadow`.
- **Buttons**: `rounded-xl`, primary = `bg-teal-600 text-white hover:bg-teal-700`.
- **Inputs**: `rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-teal-400`.
- **Modals**: overlay = `bg-slate-900/30 backdrop-blur-sm`, box = `bg-white/90 backdrop-blur-xl rounded-2xl`.
- **Navbar**: uses `glass-nav` class (teal glassmorphism).
- **Page backgrounds**: `bg-teal-50` — never `bg-gray-50`.
- **Transitions**: `transition-all duration-200` on interactive elements.

## Frontend Conventions

Before writing component or page code, read: `docs/skills/frontend-style/SKILL.md`

Key rules:
- Use Lucide React for icons (`lucide-react`), not other icon libraries.
- API calls go through `src/api/axios.js` — never raw `fetch` or direct axios imports.
- Auth state via `useAuth()` from `src/auth/AuthContext.jsx`.
- All routes are protected via `src/components/ProtectedRoute.jsx`.
- Use Tailwind utility classes — no inline styles except for dynamic values (e.g., map pin colors).

## Testing

For writing tests, read: `docs/skills/testing/SKILL.md`

## File Structure

```
src/
  api/axios.js          — Axios instance with interceptors
  auth/AuthContext.jsx   — Auth provider & useAuth hook
  components/            — Reusable components (Navbar, TrustBadge, etc.)
  pages/                 — Route-level page components
  utils/                 — Helpers (categoryColors, fixLeafletIcons)
```
