---
name: testing
description: How to test the AI Donor Matcher Frontend using Playwright. Use this skill when writing automated UI tests, verifying page functionality, debugging visual issues, or capturing screenshots of the running app.
---

# AI Donor Matcher — Testing Guide

## Stack
- **Playwright** (Python, sync API)
- **Dev server**: `npm run dev` → `http://localhost:5173`
- **Browser**: Chromium, headless

## Quick Start

### 1. Ensure dev server is running
```bash
cd AI-Donor-Matcher-Frontend
npm run dev
```

### 2. Write a test script
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    # Your test logic here
    page.screenshot(path="screenshot.png", full_page=True)

    browser.close()
```

### 3. Run it
```bash
python test_script.py
```

## Approach: Reconnaissance-Then-Action

1. **Navigate** → go to the target page
2. **Wait** → `page.wait_for_load_state("networkidle")` (CRITICAL for React SPA)
3. **Screenshot** → `page.screenshot(path="/tmp/inspect.png", full_page=True)`
4. **Inspect** → `page.content()`, `page.locator("button").all()`
5. **Act** → click, fill, assert based on discovered selectors

## Common Selectors for This App

| Element | Selector |
|---------|----------|
| Nav links | `nav >> a` or `text=Dashboard` |
| Primary buttons | `button:has-text("Submit")` or role-based |
| Form inputs | `input[type="email"]`, `input[type="password"]` |
| Glass cards | `.glass` |
| Modal overlay | `.fixed.inset-0` |
| Map container | `.leaflet-container` |

## Key Pages to Test

| Route | What to verify |
|-------|---------------|
| `/login` | Form renders, inputs accept text, submit works |
| `/register` | Role toggle (DONOR/NGO), file upload for NGO |
| `/map` | Map loads, pins appear, filter bar works |
| `/donor/dashboard` | Tabs switch, pledges display |
| `/ngo/dashboard` | Needs CRUD, incoming pledges |
| `/admin/dashboard` | Stats cards, verification/report queues |

## Tips
- Always wait for `networkidle` before inspecting — React hydrates async
- Use `page.wait_for_selector(".glass")` to confirm Tailwind loaded
- For auth-protected pages, first login via the `/login` form
- Take screenshots before and after actions for debugging
