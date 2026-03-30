# Feature 2 (Part 2): Map Filters, Side List & Auto-Expand

**Branches Configured:** `feat/map-filters`, `feat/map-side-list`, `feat/auto-expand`
**Objective:** Add robust search controls to the Discovery Map, alongside an interactive side panel plotting the localized NGOs with fallback edge cases.

## 📋 Requirements
This issue assumes the base map (Part 1) has been merged. It focuses entirely on data filtering, list rendering, and UX fallbacks.

### 1. The Filter Bar (from Feature 2.2)
* Create `src/components/FilterBar.jsx` placed directly above the map context.
* **Fields:** NGO Name Search (input), Category (select), and Radius (slider 1-50km). 
* The input search must be debounced by `300ms` before triggering parent state updates.
* Any filter change should fire the API endpoint to retrieve filtered NGOs.

### 2. Auto-Expand Nationwide Fallback (from Feature 2.4)
* Implement logic so that if the local API request (with radius) returns `0` results, it immediately executes a secondary query with the `radius` parameter omitted.
* When triggered, render a dismissible yellow banner between the filter bar and map: `⚠️ No NGOs found nearby. Showing all available NGOs.`

### 3. Side List Feed (from Feature 2.3)
* Build `src/components/SideList.jsx` as a fixed-width (`w-80`) scrollable panel on the right side of the screen.
* NGOs must be sorted ascending by distance.
* Within identical 2km bands, NGOs with `URGENT` top needs must be pinned to the top.
* The Sidelist cards must be clickable (routing to `/ngo/:id`) and render the core details (Name, distance, Top Need dot, remaining quantity, and optional Urgent badge).
* Provide a clean Empty state (`No NGOs found.`) if strictly zero results.

**Acceptance Criteria:**
- [ ] Filter changes accurately drive updates to the parent Map components.
- [ ] 300ms typing debounce operates correctly on the text input.
- [ ] Empty queries seamlessly drop the radius parameter and throw the visual yellow banner.
- [ ] The right-aligned Side List matches the exact sorted logic (Distance > 2km Band Grouping > Urgency).
