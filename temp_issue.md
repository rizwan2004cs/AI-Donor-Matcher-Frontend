**Branch:** `feat/discovery-map`
**Route:** `/map` (or `/` based on your routing setup)

## 🎯 Overview
Implement the core donor-facing Discovery Map screen (`src/pages/DiscoveryMap.jsx`). This page acts as the main container for the map view, handling user geolocation on mount, fetching nearby NGOs from the backend, and rendering colour-coded category pins using Leaflet.js.

*Note: The Filter Bar, Side List, and Map Pin Popups will be implemented as separate components in subsequent tickets, but this issue sets up the state and layout to accommodate them.*

## 📋 Requirements & Steps

### 1. State Management & Geolocation
In `src/pages/DiscoveryMap.jsx`, set up the core React state:
- `ngos` (Array), `loading` (Boolean), `error` (String | null)
- `userLat` / `userLng` (Number | null)
- `filters` (Object: `{ search: "", category: "", radius: 10 }`)
- `expanded` (Boolean) - for nationwide fallback

**On Component Mount:**
- Use `navigator.geolocation.getCurrentPosition()` to get the user's location.
- Set `userLat` and `userLng` to the retrieved coordinates.
- **Fallback:** If geolocation is denied or unavailable, default to Chennai coordinates: `[13.0827, 80.2707]`.

### 2. API Integration
Create a `useEffect` that triggers whenever `userLat`, `userLng`, or `filters` change (ignore if `userLat` is null).
- Call `GET /api/ngos` passing `lat`, `lng`, and `radius`. Append `category` and `search` if they exist in the `filters` state.
- **Auto-Expand Logic:** If the response is empty (0 results), immediately re-fetch the API *without* the `radius` parameter to get nationwide results. Dispay a yellow banner: *"No NGOs found nearby. Showing all available NGOs."* and set the `expanded` state to `true`.
- Handle `loading` states and `error` catch blocks.

### 3. Component Layout & Leaflet Map
Use `react-leaflet` to render the map structure.
- Add the `Navbar` component at the top.
- Create a flex container where the Map takes up the remaining height.
- Set up `<MapContainer>` centering on `userLat`/`userLng` (or the Chennai fallback) with a zoom level of `12`.
- Add the OpenStreetMap `<TileLayer>`.

### 4. Render Category Pins
For each NGO in the `ngos` state array, render a `<Marker>` on the map.
- Map pins must be colour-coded based on the NGO's `pinCategory`.
- **Implementation:** Create a new file `src/components/CategoryPin.jsx` that exports a function `createCategoryIcon(category)`. This should return a `L.divIcon` using the appropriate hex colour from `src/utils/categoryColors.js`.

## 🛠️ Design System Rules (MUST FOLLOW)
- Follow the overarching Tailwind styling outlined in `AGENTS.md`. 
- Page background should use `bg-teal-50` if any background is exposed.
- Use the standard `AGENTS.md` guidelines for any momentary loading states (e.g., matching the teal/emerald themes). 
- Ensure the map container takes up the full available screen height `flex-1 overflow-hidden` under the Navbar.

## ✅ Acceptance Criteria
- [ ] Browser requests geolocation immediately on mount.
- [ ] Map defaults to Chennai coordinates `[13.0827, 80.2707]` if geolocation is blocked/unavailable.
- [ ] `MapContainer` renders successfully utilizing OpenStreetMap tiles.
- [ ] API call is cleanly executed via the internal `src/api/axios.js` instance.
- [ ] NGOs are rendered accurately on the map with custom `DivIcon` markers.
- [ ] Pin colours strictly match the `categoryColors.js` mappings (Red for Food, Blue for Clothing, etc.).
- [ ] Yellow "Auto-expand" banner displays correctly if the initial localized search returns 0 results.
