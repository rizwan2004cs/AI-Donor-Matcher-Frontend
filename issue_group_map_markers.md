# Feature 2 (Part 1): Discovery Map Core & Pin Popups

**Branches Configured:** `feat/discovery-map` & `feat/pin-popup`
**Objective:** Establish the main map UI, plot dynamic NGO locations based on user proximity, and instantiate clickable interactive popups.

## 📋 Requirements
This issue groups the core Leaflet rendering and marker interactions. A developer can build this foundation without touching the filter bar or list panel.

### 1. Map Foundation & Geolocation (from Feature 2.1)
* Create `src/pages/DiscoveryMap.jsx` containing a `MapContainer`.
* On mount, request the browser's geolocation. Default to `[13.0827, 80.2707]` (Chennai) if denied.
* Ensure the map takes up the remaining `vh` under the Navbar.

### 2. Category Markers (from Feature 2.1/7.4)
* Fetch NGOs using `api.get('/api/ngos')` (use the mock implementation provided originally if backend isn't ready).
* Render each NGO as a `<Marker>` on the map.
* Create a `createCategoryIcon(category)` function in `src/components/CategoryPin.jsx` using `L.divIcon` to color-code pins according to `src/utils/categoryColors.js` (e.g., Red for FOOD).

### 3. Pin Popups (from Feature 2.5)
* When a user clicks a marker, a `react-leaflet` `<Popup>` should display.
* The popup must contain:
  - NGO Photo or fallback initial template.
  - NGO Name (bolded).
  - TrustBadge widget.
  - Formatted Distance (`📍 0.8 km away`).
  - Top Need Details with Category Dot and Quantity Remaining.
  - "Urgent" pill badge if `topNeedUrgency === "URGENT"`.
  - "View Full Profile" CTA button routing to `/ngo/:id`.

**Acceptance Criteria:**
- [ ] Geolocation successfully centers the Leaflet map on mount.
- [ ] Colored pins render precisely matching their category.
- [ ] Clicking a pin triggers a correctly styled, non-overflowing Popup window with all required details.
