$ErrorActionPreference = "Stop"

$issue3_1 = @"
# Feature 3 Part 1: NGO Full Profile & Reporting Modal

**Branches:** `feat/ngo-profile`, `feat/report-ngo`

## Overview
Implement the public-facing NGO profile page where donors can view organization details, see current needs progress, and report suspicious activity.

### 1. NGO Profile Page (3.1)
* Route `/ngo/:id`
* Display NGO photo, name, trust score (reusing `TrustBadge`), address, and contact details.
* List active needs using the `NeedProgressBar` component to visualize pledged vs. required quantities.
* Include a toggle or section for gracefully displaying their fulfilled past history.

### 2. Report NGO Modal (3.2)
* Create a simple 'Report this organisation' trigger.
* Render a modal with 4 standard reason options (Fraud / Inactive / Misleading / Other).
* Expose a POST action sending the payload to `/api/ngos/{id}/report`.

## Acceptance Criteria
- [ ] NGO Profile successfully loads active needs and historical data.
- [ ] Progress bars correctly calculate percentages based on backend data.
- [ ] The reporting modal forces selection of a valid reason before submission.
"@
gh issue create -t "Feature 3 Part 1: NGO Full Profile & Reporting Modal" -b $issue3_1

$issue3_2 = @"
# Feature 3 Part 2: Pledge Flow & Delivery OSRM View

**Branches:** `feat/pledge-screen`, `feat/delivery-view`

## Overview
Handle the core interaction where a donor actively commits to fulfilling a need, and provide them an interactive navigation map for drop-off.

### 1. Pledge Screen (3.3)
* Route `/pledge/:needId`
* Include a numeric quantity selector, strongly clamped to the maximum `remaining` count.
* Submission targets `POST /api/pledges` and automatically redirects the user to the delivery tracking route.

### 2. Delivery View (OSRM Integration) (3.4)
* Route `/delivery/:pledgeId`
* Render a Leaflet map with a drawn OSRM polyline spanning from the donor's current location to the NGO.
* Interface must show active ETA, a pledge expiry countdown timer, and an NGO contact card.
* Ensure a 'Cancel Pledge' button rests on UI that cleanly aborts the pledge via `DELETE /api/pledges/{id}`.

## Acceptance Criteria
- [ ] Donors cannot exceed the requested maximum need limit when pledging.
- [ ] Form submission safely routes to the delivery ID.
- [ ] The OSRM polyline successfully paints between coordinates.
- [ ] Countdown timer runs actively and cancelling triggers immediate state rollback.
"@
gh issue create -t "Feature 3 Part 2: Pledge Flow & Delivery OSRM View" -b $issue3_2

$issue4_1 = @"
# Feature 4: Donor Dashboard (Active Pledges & History)

**Branches:** `feat/donor-active-pledges`, `feat/donor-history`

## Overview
Develop the private Donor Dashboard to actively manage in-flight pledges and historical deliveries.

### 1. Active Pledges Tab (4.1)
* List all unfulfilled pledges the donor has active.
* Cards require the colored category dot, item name, quantity committed, and active expiry countdown.
* Include 'Navigate' and 'Cancel' inline actions.

### 2. Donation History Tab (4.2)
* Filtered pane strictly for successfully fulfilled or expired pledges.
* Ensure each row features a clickable link looping the user back to the NGO profile to encourage re-donation.

## Acceptance Criteria
- [ ] The active pledges feed accurately tracks current state and routes context correctly.
- [ ] History feed ignores active pledges and retains deep linking back to previous NGOs.
"@
gh issue create -t "Feature 4: Donor Dashboard (Active Pledges & History)" -b $issue4_1

$issue5_1 = @"
# Feature 5 Part 1: NGO Profile Onboarding & Trust Display

**Branches:** `feat/ngo-profile-completion`, `feat/ngo-trust-score`

## Overview
Handle the NGO registration tail-end flow, gating live map discovery until profiles are meticulously completed.

### 1. Profile Completion Wizard (5.1)
* Route `/ngo/complete-profile`
* Display a strict progress bar evaluating missing mandatory profile requirements.
* Includes photo uploading UI and browser geolocation detection.
* Crucial logic: NGOs remain hidden from Donor searches until completion reaches 100%.

### 2. Trust Score Display (5.5)
* Implement a standardized header visible upon NGO Dashboard login holding their numeric score + tier label (New / Established / Trusted).
* Ensure this hooks correctly with `TrustBadge` infrastructure.

## Acceptance Criteria
- [ ] Incomplete NGOs are forced sequentially through the registration requirements.
- [ ] Photo upload correctly targets backend multiparts.
- [ ] Trust badge metrics dynamically populate using GET profile parameters.
"@
gh issue create -t "Feature 5 Part 1: NGO Profile Onboarding & Trust Display" -b $issue5_1

$issue5_2 = @"
# Feature 5 Part 2: Need Management & Incoming Pledges

**Branches:** `feat/ngo-needs-crud`, `feat/ngo-incoming-pledges`, `feat/ngo-mark-fulfilled`

## Overview
Build the transactional engine for the NGO: broadcasting needs, processing incoming donor pledges, and resolving them.

### 1. Active Needs CRUD (5.2)
* Render active needs UI (capped hard at 5 max needs).
* Permit Editing/Deleting of a need strictly only if there are **no active donor pledges** against it.
* Display a padlock icon to symbolize locked (pledged) states.

### 2. Incoming Pledges List (5.3)
* Real-time list rendering assigned donor's Name, Email, Requested Item, Qty, and Timestamp natively in the view.

### 3. Fulfillment Operations (5.4)
* The 'Mark as Fulfilled' button mechanism. 
* Target endpoint `POST /api/needs/{id}/fulfill`.
* Must cascade triggering generic Trust Score calculations, and logging to donor history natively.

## Acceptance Criteria
- [ ] Deletion of active pledged items is fully disabled.
- [ ] New item generation caps exactly at the 5-item limit context.
- [ ] Validation correctly updates tracking when Marked as Fulfilled is confirmed.
"@
gh issue create -t "Feature 5 Part 2: Need Management & Incoming Pledges" -b $issue5_2

$issue6_1 = @"
# Feature 6 Part 1: Admin Stats & NGO Verification Queue

**Branches:** `feat/admin-stats`, `feat/admin-verification`

## Overview
Bootstrap the master administration view with top-level analytics and the entry pipeline for pending organization applicants.

### 1. Stats Overview Strip (6.1)
* GET `/api/admin/stats` to hydrate four widget cards: Verified NGOs, Active Needs, Pledges Today, Fulfilled This Month.

### 2. Verification Queue (6.2)
* Dashboard grid listing exclusively `PENDING` state NGOs.
* UI to review embedded document/identification files.
* Provide explicit Reject with Reason prompt vs immediate Acceptance buttons.

## Acceptance Criteria
- [ ] Admin panel safely restricts authorization.
- [ ] Verification state safely flips NGO entity into the live discovery map arrays.
"@
gh issue create -t "Feature 6 Part 1: Admin Stats & NGO Verification Queue" -b $issue6_1

$issue6_2 = @"
# Feature 6 Part 2: Moderation, Reports & NGO Suspension

**Branches:** `feat/admin-reports`, `feat/admin-ngo-mgmt`, `feat/admin-suspend`

## Overview
Establish ongoing moderation tooling.

### 1. Report Queue (6.3)
* List all NGOs receiving warnings by users.
* Inject an explicit **warning badge if count >= 3**.
* Action buttons strictly split between Dismiss vs Suspend.

### 2. NGO Management Hub (6.4 & 6.5)
* Table displaying every active verified NGO + their trust tier.
* Edit capability, view raw needs, and Suspend/Reinstate toggles.
* Ensure suspension triggers the atomic safety sequence cascade.

## Acceptance Criteria
- [ ] Reported organizations automatically highlight visual flags upon reaching threshold.
- [ ] Suspend features correctly block access to NGO operations without fundamentally deleting databases payload natively.
"@
gh issue create -t "Feature 6 Part 2: Moderation, Reports & NGO Suspension" -b $issue6_2

$issue8_1 = @"
# Feature 8: Infrastructure, PWA Manifest & Offline Safety Guard

**Branches:** `feat/pwa-manifest`, `feat/service-worker`, `feat/offline-check`, `feat/vercel-config`

## Overview
Solidify the architecture to handle progressive web delivery and unstable local connectivity, matching strict PWA regulations.

### 1. PWA & Service Workers (8.3 & 8.4)
* Author the `public/manifest.json` carrying standardized branding constraints.
* Instantiate Service Worker scripts pushing: Cache-first resolution for static assets vs Network-first strategy for API routes. 

### 2. Connectivity Guard (8.5)
* Implement a `navigator.onLine` wrapper verifying active connectivity gracefully before submitting any mutating actions (Pledge, Cancel, Edit, Fulfill). Throw friendly alerts when blocked.

### 3. Vercel Configuration (8.6)
* Attach standard explicit `vercel.json` SPA routing rewrites allowing history pushState APIs to fallback cleanly towards `index.html`.

## Acceptance Criteria
- [ ] Device prompts installability natively matching valid Lighthouse metrics.
- [ ] Forms deliberately block/throw errors via warning state if connection dynamically severs.
- [ ] Reloading random paths remotely successfully respects Vercel JSON router bindings without 404ing natively.
"@
gh issue create -t "Feature 8: Infrastructure, PWA Manifest & Offline Safety Guard" -b $issue8_1

Write-Host "All issues created successfully."
