---
name: design-system
description: Single source of truth for all visual decisions in the AI Donor Matcher Frontend. Use this skill whenever styling any component, page, or UI element. Defines the teal/emerald color palette, Space Grotesk typography, glassmorphism system, component tokens, spacing, shadows, and transitions. Reference this before writing any Tailwind classes.
---

# AI Donor Matcher — Design System

## Color Palette

### Primary (Teal)
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Primary | `#0D9488` | `teal-600` | Main actions, links, active states |
| Primary Dark | `#0F766E` | `teal-700` | Hover states, headers |
| Primary Light | `#CCFBF1` | `teal-100` | Light backgrounds, highlights |
| Primary Muted | `#F0FDFA` | `teal-50` | Page background |

### Accent (Emerald)
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Accent | `#10B981` | `emerald-500` | Success, progress, positive actions |
| Accent Dark | `#059669` | `emerald-600` | Accent hover |

### Neutrals (Slate)
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Text Primary | `#0F172A` | `slate-900` | Headings, primary text |
| Text Secondary | `#475569` | `slate-600` | Body text, descriptions |
| Text Muted | `#94A3B8` | `slate-400` | Placeholders, meta info |
| Border | `#E2E8F0` | `slate-200` | Card borders, dividers |
| Surface Alt | `#F1F5F9` | `slate-100` | Subtle backgrounds |

### Status Colors
| Token | Hex | Tailwind | Usage |
|-------|-----|----------|-------|
| Error | `#EF4444` | `red-500` | Errors, danger, cancel |
| Warning | `#F59E0B` | `amber-500` | Warnings, expiring |
| Success | `#10B981` | `emerald-500` | Success, delivered |
| Info | `#0EA5E9` | `sky-500` | Informational |

### Category Pin Colors
```
FOOD:       #EF4444 (red-500)
CLOTHING:   #0EA5E9 (sky-500)
MEDICINE:   #10B981 (emerald-500)
EDUCATION:  #F59E0B (amber-500)
HOUSEHOLD:  #F97316 (orange-500)
OTHER:      #8B5CF6 (violet-500)
```

---

## Typography — Space Grotesk

**Font**: `'Space Grotesk', system-ui, sans-serif`
**Import**: Google Fonts — weights 400, 500, 600, 700

### Scale
| Element | Size | Weight | Tailwind |
|---------|------|--------|----------|
| Page title (h1) | 2.25rem | 700 | `text-4xl font-bold tracking-tight` |
| Section header (h2) | 1.5rem | 600 | `text-2xl font-semibold` |
| Card title (h3) | 1.25rem | 600 | `text-xl font-semibold` |
| Sub-label (h4) | 1rem | 500 | `text-base font-medium` |
| Body | 0.875rem | 400 | `text-sm` |
| Small / meta | 0.75rem | 400–500 | `text-xs` |

---

## Glassmorphism System

Three tiers — applied via utility classes in `index.css`:

### `.glass` — Standard card
```css
background: rgba(255, 255, 255, 0.70);
backdrop-filter: blur(16px);
-webkit-backdrop-filter: blur(16px);
border: 1px solid rgba(255, 255, 255, 0.30);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
```

### `.glass-subtle` — Overlays, secondary panels
```css
background: rgba(255, 255, 255, 0.50);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.20);
```

### `.glass-nav` — Navbar
```css
background: rgba(15, 118, 110, 0.85);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(255, 255, 255, 0.10);
```

**Usage rules:**
- Glass on cards, modals, nav ONLY — not on every element
- Page backgrounds stay flat (`bg-teal-50`)
- Glass works best when content behind it varies (maps, images, gradient)

---

## Shadows (Apple-inspired, soft & layered)

| Token | Value | Tailwind |
|-------|-------|----------|
| Subtle | `0 1px 2px rgba(0,0,0,0.04)` | `shadow-sm` |
| Default | `0 4px 12px rgba(0,0,0,0.06)` | `shadow` |
| Medium | `0 8px 24px rgba(0,0,0,0.08)` | `shadow-md` |
| Large | `0 16px 48px rgba(0,0,0,0.10)` | `shadow-lg` |

---

## Spacing & Radius

| Element | Radius | Padding |
|---------|--------|---------|
| Cards | `rounded-2xl` | `p-6` (standard), `p-8` (feature) |
| Buttons | `rounded-xl` | `px-5 py-2.5` |
| Inputs | `rounded-xl` | `px-4 py-2.5` |
| Badges | `rounded-full` | `px-2.5 py-0.5` |
| Avatars | `rounded-full` | — |
| Modals | `rounded-2xl` | `p-8` |

| Layout | Value |
|--------|-------|
| Section gap | `space-y-6` |
| Page padding (mobile) | `px-6 py-8` |
| Page padding (desktop) | `px-12 py-10` |

---

## Transitions

| Type | Value |
|------|-------|
| Default | `transition-all duration-200 ease-out` |
| Card hover | `hover:shadow-md hover:-translate-y-0.5` |
| Button hover | brightness shift via bg color change |
| Focus ring | `focus:ring-2 focus:ring-teal-400 focus:ring-offset-2` |

---

## Component Tokens

### Buttons
**Primary:**
```
bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-5 py-2.5 font-medium
transition-all duration-200 shadow-sm hover:shadow
```

**Secondary:**
```
bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl
px-5 py-2.5 font-medium transition-all duration-200
```

**Danger:**
```
bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl
px-5 py-2.5 font-medium transition-all duration-200
```

### Inputs
```
bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5
text-slate-900 placeholder:text-slate-400
focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none
transition-all duration-200
```

### Cards
**Standard glass card:**
```
glass rounded-2xl p-6
```

**Elevated glass card:**
```
bg-white/80 backdrop-blur-lg border border-white/40 rounded-2xl p-8 shadow-md
```

### Modals
**Overlay:** `fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-50`
**Modal box:** `bg-white/90 backdrop-blur-xl rounded-2xl p-8 shadow-lg max-w-md mx-auto`

### Badges
```
px-2.5 py-0.5 rounded-full text-xs font-medium
```

Status badge variants:
- Delivered: `bg-emerald-100 text-emerald-700`
- Fulfilled: `bg-teal-100 text-teal-700`
- Cancelled: `bg-red-100 text-red-700`
- Expired: `bg-slate-100 text-slate-500`
- Pending: `bg-amber-100 text-amber-700`

### Page Headers
```
text-4xl font-bold text-slate-900 tracking-tight
```
With subtitle:
```
text-slate-600 mt-1
```

### Tabs
Active: `border-b-2 border-teal-600 text-teal-700 font-medium`
Inactive: `text-slate-500 hover:text-slate-700`
