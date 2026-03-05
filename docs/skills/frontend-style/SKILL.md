---
name: frontend-style
description: How to build pages and components in the AI Donor Matcher Frontend. Use this skill when creating or modifying any React component, page layout, or UI pattern. Defines coding conventions, layout approach, and styling rules specific to this React + Vite + Tailwind project.
---

# AI Donor Matcher — Frontend Style Guide

## Tech Stack
- **React 19** with Vite 6
- **Tailwind CSS 3.4** (utility-first, no custom CSS except glassmorphism utilities)
- **React Router DOM 7** (SPA routing)
- **Leaflet + React-Leaflet** (maps)
- **Lucide-React** (icons — use this for ALL icons)
- **Axios** (API client with JWT interceptor)
- **React Context** (auth state via `AuthContext`)

## Design Philosophy

**Apple-inspired professionalism with trust-driven warmth.**

- Generous whitespace — let content breathe
- Clear visual hierarchy — one focal point per section
- Restraint over excess — every element earns its place
- Glassmorphism for depth, not decoration
- Teal conveys growth, sustainability, trust

## Rules

### Do
- Use Tailwind utility classes exclusively
- Reference `design-system/SKILL.md` for all color/type/spacing tokens
- Use `lucide-react` for every icon (consistent 24px grid)
- Apply `glass` class to content cards, `glass-nav` to navbar
- Use `rounded-2xl` on cards, `rounded-xl` on buttons/inputs
- Use `transition-all duration-200 ease-out` on interactive elements
- Mobile-first responsive (`sm:`, `md:`, `lg:` breakpoints)
- Use semantic HTML (`<nav>`, `<main>`, `<section>`, `<header>`)

### Don't
- Write custom CSS (except glassmorphism in `index.css`)
- Use Inter, Roboto, Arial, or system fonts
- Use purple gradients or generic blue (#2E75B6 is replaced by teal)
- Center-align everything — use left-aligned text by default
- Apply glassmorphism to every element — only cards, modals, nav
- Add animations beyond subtle hover/focus transitions
- Use inline styles (`style={{}}`) — Tailwind only

## Page Layout Convention

```jsx
<div className="min-h-screen bg-teal-50">
  {/* Navbar handles itself */}
  <main className="max-w-4xl mx-auto px-6 py-8">
    <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
      Page Title
    </h1>
    <p className="text-slate-600 mt-1">Subtitle or description</p>

    <div className="mt-8 space-y-6">
      {/* Content cards */}
      <div className="glass rounded-2xl p-6">
        {/* Card content */}
      </div>
    </div>
  </main>
</div>
```

### Split layouts (map + panel)
```jsx
<div className="min-h-screen bg-teal-50 flex">
  <div className="flex-1">{/* Map */}</div>
  <div className="w-80 glass-subtle overflow-y-auto p-4">
    {/* Side panel */}
  </div>
</div>
```

## Component Conventions

### Forms
- Wrap in `glass rounded-2xl p-8 max-w-md mx-auto`
- Labels: `text-sm font-medium text-slate-700 mb-1`
- Inputs: use design-system input token
- Submit button: full-width primary button `w-full`
- Error messages: `text-sm text-red-500 mt-1`

### Stat Cards (dashboards)
```jsx
<div className="glass rounded-2xl p-6">
  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Label</p>
  <p className="text-3xl font-bold text-slate-900 mt-1">42</p>
</div>
```

### Empty States
```jsx
<div className="text-center py-12">
  <IconComponent className="mx-auto h-12 w-12 text-slate-300" />
  <p className="mt-3 text-slate-500">No items yet</p>
</div>
```

### Loading States
```jsx
<div className="flex items-center justify-center py-12">
  <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
</div>
```

## File Organization
```
src/
  components/   → Reusable UI (Navbar, TrustBadge, etc.)
  pages/        → Route-level components
  auth/         → AuthContext and auth logic
  api/          → Axios instance and API helpers
  utils/        → Pure utility functions (categoryColors, etc.)
```

## Import Order
1. React / React hooks
2. Third-party libraries (react-router-dom, leaflet, axios, lucide-react)
3. Local components
4. Local utils / context
5. Assets / styles
