export const TOUR_IDS = {
  DONOR_MAP: "donor-map",
  DONOR_DASHBOARD: "donor-dashboard",
  DONOR_NGO_PROFILE: "donor-ngo-profile",
  DONOR_PLEDGE: "donor-pledge",
  DONOR_DELIVERY: "donor-delivery",
  NGO_PROFILE: "ngo-profile",
  NGO_DASHBOARD: "ngo-dashboard",
  ADMIN_DASHBOARD: "admin-dashboard",
  FULL_DONOR: "full-donor-journey",
  FULL_NGO: "full-ngo-journey",
  FULL_ADMIN: "full-admin-journey",
};

const TOUR_STORAGE_KEYS = {
  pending: "app-tour-pending",
  completed: "app-tour-completed",
};

const TOUR_STEPS = {
  [TOUR_IDS.DONOR_MAP]: [
    {
      route: "/",
      targetId: "tour-fab",
      title: "Welcome to the Discovery Map",
      description:
        "This floating button restarts the guide whenever you need a quick walkthrough of the features on the current page.",
    },
    {
      route: "/",
      targetId: "donor-map-hero",
      title: "Your donor home base",
      description:
        "The map header gives you a fast view of how many NGOs are visible, your active search radius, and whether the app expanded beyond nearby matches.",
    },
    {
      route: "/",
      targetId: "donor-map-search",
      title: "Filter what matters",
      description:
        "Search by NGO name, narrow by category, and adjust the radius before you refresh the results.",
    },
    {
      route: "/",
      targetId: "donor-map-canvas",
      title: "Explore the live map",
      description:
        "Pins show nearby NGOs and their top need category. Select one to inspect the popup and open the full NGO profile.",
    },
    {
      route: "/",
      targetId: "donor-map-results",
      title: "Use the side panel",
      description:
        "This list is sorted to keep the strongest nearby matches first. You can focus an NGO on the map or jump straight to its profile from here.",
    },
    {
      route: "/",
      targetId: "donor-dashboard-link",
      title: "Track your pledges",
      description:
        "When you want to manage deliveries or review past support, jump to the donor dashboard from this navigation link.",
    },
  ],
  [TOUR_IDS.DONOR_DASHBOARD]: [
    {
      route: "/donor/dashboard",
      targetId: "tour-fab",
      title: "Welcome to the Donor Dashboard",
      description:
        "Use the floating guide button to replay this walkthrough whenever you want a refresher.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-hero",
      title: "Dashboard overview",
      description:
        "This header summarizes your delivery activity and links the dashboard back to the rest of your donor workflow.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-stats",
      title: "Impact at a glance",
      description:
        "These cards break out active pledges, history entries, and fulfilled support so you can see momentum quickly.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-tabs",
      title: "Switch between views",
      description:
        "Use these tabs to move between live pledge management and your donation history.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-content",
      title: "Take action here",
      description:
        "This panel is where you open deliveries, cancel active pledges, or revisit completed support.",
    },
  ],
  [TOUR_IDS.DONOR_NGO_PROFILE]: [
    {
      targetId: "ngo-profile-header",
      title: "NGO profile overview",
      description:
        "This card shows the organization photo, name, trust badge, and contact details so you can evaluate the NGO at a glance.",
    },
    {
      targetId: "ngo-profile-needs",
      title: "Active needs",
      description:
        "Each item the NGO needs is listed here with a progress bar and urgency badge. Look for urgent needs to make the highest impact.",
    },
    {
      targetId: "ngo-profile-pledge-btn",
      title: "Pledge an item",
      description:
        "Tap this button on any need to open the pledge screen where you specify how many units you can donate.",
    },
    {
      targetId: "ngo-profile-report",
      title: "Report this NGO",
      description:
        "If something looks wrong, use this link to flag the organization for admin review.",
    },
  ],
  [TOUR_IDS.DONOR_PLEDGE]: [
    {
      targetId: "pledge-item-details",
      title: "Review the item details",
      description:
        "Check the item name, category, and urgency before pledging. Urgent needs are highlighted in red.",
    },
    {
      targetId: "pledge-quantity-summary",
      title: "See what is still needed",
      description:
        "This section shows total required, already pledged by others, and what is still remaining.",
    },
    {
      targetId: "pledge-quantity-picker",
      title: "Choose your quantity",
      description:
        "Use the plus and minus buttons or type directly to set how many units you can donate.",
    },
    {
      targetId: "pledge-confirm-btn",
      title: "Confirm your pledge",
      description:
        "Once you are satisfied, confirm the pledge. You will receive a delivery instruction email with the NGO address.",
    },
  ],
  [TOUR_IDS.DONOR_DELIVERY]: [
    {
      targetId: "delivery-header",
      title: "Delivery overview",
      description:
        "This header shows the NGO destination, item details, distance, and a live countdown until the delivery window expires.",
    },
    {
      targetId: "delivery-map",
      title: "Follow the route",
      description:
        "The map plots your current location, the NGO drop-off point, and the driving route between them.",
    },
    {
      targetId: "delivery-navigate-btn",
      title: "Open navigation",
      description:
        "Tap Navigate to launch Google Maps with turn-by-turn directions from your current position to the NGO.",
    },
    {
      targetId: "delivery-dropoff",
      title: "Drop-off details",
      description:
        "Here you will find the NGO address and contact email for coordinating the handoff.",
    },
  ],
  [TOUR_IDS.NGO_PROFILE]: [
    {
      route: "/ngo/complete-profile",
      targetId: "tour-fab",
      title: "Welcome to NGO Profile Setup",
      description:
        "This floating button lets you restart the onboarding guide whenever you need to revisit the setup steps.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-progress",
      title: "Finish the required setup",
      description:
        "This progress panel shows exactly how close your NGO profile is to being ready for the dashboard.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-photo",
      title: "Add your organization photo",
      description:
        "Upload a recognizable image here so donors can identify your NGO more easily.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-form",
      title: "Complete the organization details",
      description:
        "These fields power your public NGO profile and help donors decide whether to support your needs.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-save",
      title: "Save to unlock the dashboard",
      description:
        "Once every required field is complete, save here and the app will take you into the NGO dashboard automatically.",
    },
  ],
  [TOUR_IDS.NGO_DASHBOARD]: [
    {
      route: "/ngo/dashboard",
      targetId: "tour-fab",
      title: "Welcome to the NGO Dashboard",
      description:
        "Use the floating guide button to relaunch this tour at any time.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-hero",
      title: "NGO dashboard overview",
      description:
        "This header is your operational summary for managing needs and confirming donor deliveries.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-summary",
      title: "Profile health and trust",
      description:
        "Keep this card current because it shows your organization identity, profile completion, and trust status.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-edit-profile",
      title: "Edit your profile",
      description:
        "Tap here to update your organization details, photo, and contact information. A complete profile builds donor trust.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-needs",
      title: "Publish and manage needs",
      description:
        "Add, edit, and remove active needs here while watching locked items that already have donor commitments.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-pledges",
      title: "Confirm incoming deliveries",
      description:
        "Receive active pledges from this list to update your need totals without closing the request early.",
    },
  ],
  [TOUR_IDS.ADMIN_DASHBOARD]: [
    {
      route: "/admin/dashboard",
      targetId: "tour-fab",
      title: "Welcome to Admin Control Center",
      description:
        "Use the floating guide button to replay this walkthrough whenever you need a refresher.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-hero-stats",
      title: "Key metrics at a glance",
      description:
        "These stat cards show approved NGOs, active needs, today's pledges, and monthly fulfillments in real time.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-tabs",
      title: "Switch between workflows",
      description:
        "Use these tabs to move between the verification queue, report review, and full NGO management.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-content",
      title: "Take action here",
      description:
        "This area shows the active tab content. Approve or reject NGOs, review reports, and manage organizations from here.",
    },
  ],

  /* ─── Full-flow journeys ─── */

  [TOUR_IDS.FULL_DONOR]: [
    // ── Discovery Map ──
    {
      route: "/",
      targetId: "donor-map-hero",
      title: "Step 1 — Discover NGOs near you",
      description:
        "Your journey starts on the discovery map. The header shows how many NGOs are in range and whether the app expanded the search radius automatically.",
    },
    {
      route: "/",
      targetId: "donor-map-search",
      title: "Filter and search",
      description:
        "Narrow results by NGO name, category, or distance so you only see organizations that match what you can donate.",
    },
    {
      route: "/",
      targetId: "donor-map-canvas",
      title: "Browse the map",
      description:
        "Each pin represents an NGO colour-coded by its top need category. Click a pin to see a popup with the NGO name, then open its full profile.",
    },
    {
      route: "/",
      targetId: "donor-map-results",
      title: "Side panel matches",
      description:
        "This ranked list lets you compare NGOs quickly. From here you can jump to any NGO profile to see their active needs and pledge items.",
    },
    // ── NGO Profile (demo data) ──
    {
      route: "/ngo/tour-demo",
      navState: {
        _tourData: {
          id: "tour-demo",
          name: "Hope Foundation",
          description: "A community-based organization providing food, clothing, and educational supplies to underserved families in the local area.",
          address: "12 Main Street, Community Centre",
          contactEmail: "contact@hopefoundation.org",
          trustScore: 82,
          trustTier: "ESTABLISHED",
          verifiedAt: "2025-06-15T00:00:00Z",
          photoUrl: null,
          activeNeeds: [
            { id: "demo-need-1", category: "FOOD", itemName: "Rice Bags", urgency: "URGENT", quantityRequired: 50, quantityPledged: 18 },
            { id: "demo-need-2", category: "CLOTHING", itemName: "Winter Jackets", urgency: "NORMAL", quantityRequired: 30, quantityPledged: 30 },
          ],
          fulfilledHistory: [],
        },
      },
      targetId: "ngo-profile-header",
      title: "Step 2 — The NGO profile",
      description:
        "When you open an NGO, you see their trust badge, description, and contact details. This is a demo profile so you can see the layout.",
    },
    {
      route: "/ngo/tour-demo",
      targetId: "ngo-profile-needs",
      title: "Active needs list",
      description:
        "Each item the NGO needs is shown with a progress bar and urgency badge. Look for urgent items to make the biggest impact.",
    },
    {
      route: "/ngo/tour-demo",
      targetId: "ngo-profile-pledge-btn",
      title: "Pledge an item",
      description:
        "Tap this button on any need to open the pledge screen where you choose how many units to donate.",
    },
    // ── Pledge Screen (demo data) ──
    {
      route: "/pledge/tour-demo",
      navState: {
        id: "demo-need-1",
        ngoId: "tour-demo",
        ngoName: "Hope Foundation",
        ngoTrustScore: 82,
        ngoTrustTier: "ESTABLISHED",
        category: "FOOD",
        itemName: "Rice Bags",
        urgency: "URGENT",
        quantityRequired: 50,
        quantityPledged: 18,
        quantityRemaining: 32,
        status: "ACTIVE",
      },
      targetId: "pledge-item-details",
      title: "Step 3 — Review the item",
      description:
        "The pledge screen shows the item name, category, and urgency. Urgent needs are highlighted so you know where help is most needed.",
    },
    {
      route: "/pledge/tour-demo",
      targetId: "pledge-quantity-picker",
      title: "Pick your quantity",
      description:
        "Use the plus/minus buttons or type directly to set how many units you can donate, then confirm your pledge.",
    },
    // ── Delivery View (demo data) ──
    {
      route: "/delivery/tour-demo",
      navState: {
        pledgeId: "tour-demo",
        ngoName: "Hope Foundation",
        ngoAddress: "12 Main Street, Community Centre",
        ngoContactEmail: "contact@hopefoundation.org",
        ngoLat: 14.4426,
        ngoLng: 79.9865,
        itemName: "Rice Bags",
        quantity: 5,
        category: "FOOD",
        expiresAt: new Date(Date.now() + 48 * 3600000).toISOString(),
      },
      targetId: "delivery-header",
      title: "Step 4 — Delivery view",
      description:
        "After pledging you land here. The header shows the NGO destination, item details, distance, and a countdown until the delivery window expires.",
    },
    {
      route: "/delivery/tour-demo",
      targetId: "delivery-map",
      title: "Follow the route",
      description:
        "The map shows your current location, the NGO drop-off point, and the driving route between them.",
    },
    {
      route: "/delivery/tour-demo",
      targetId: "delivery-dropoff",
      title: "Drop-off details",
      description:
        "The NGO address and contact email are here for coordinating the handoff.",
    },
    // ── Donor Dashboard ──
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-hero",
      title: "Step 2 — Your Donor Dashboard",
      description:
        "All your active pledges and donation history live here. This header summarizes your delivery activity.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-stats",
      title: "Impact at a glance",
      description:
        "These cards show active pledges, past donations, and fulfilled deliveries so you can track your impact over time.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-tabs",
      title: "Switch between views",
      description:
        "Use these tabs to move between managing live pledges and reviewing your donation history.",
    },
    {
      route: "/donor/dashboard",
      targetId: "donor-dashboard-content",
      title: "Manage pledges here",
      description:
        "Open delivery views, cancel pledges, or revisit completed support from this panel. That's the full donor journey!",
    },
  ],

  [TOUR_IDS.FULL_NGO]: [
    // ── Profile Completion ──
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-progress",
      title: "Step 1 — Complete your profile",
      description:
        "Your NGO journey starts here. This progress panel shows which required fields are done and what still needs filling in.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-photo",
      title: "Add a recognizable photo",
      description:
        "Upload your organization's logo or a representative image. Donors see this on the discovery map and your profile page.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-form",
      title: "Fill in organization details",
      description:
        "Name, address, contact email, and category of work are required. These power your public profile and help donors find and trust you.",
    },
    {
      route: "/ngo/complete-profile",
      targetId: "ngo-profile-save",
      title: "Save to continue",
      description:
        "Once every required field is filled, save here. The app will redirect you to the full NGO dashboard.",
    },
    // ── NGO Dashboard ──
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-hero",
      title: "Step 2 — Your NGO Dashboard",
      description:
        "This is your operational command center for managing needs and confirming deliveries from donors.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-summary",
      title: "Profile health and trust",
      description:
        "This card shows your organization identity, profile completion percentage, and trust status. Keep it current to attract more donors.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-edit-profile",
      title: "Edit your profile anytime",
      description:
        "Come back here whenever you need to update your NGO details, photo, or contact information.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-needs",
      title: "Publish and manage needs",
      description:
        "Add items your organization needs, set quantities and urgency, and track how many have been pledged. Locked items already have donor commitments.",
    },
    {
      route: "/ngo/dashboard",
      targetId: "ngo-dashboard-pledges",
      title: "Confirm incoming deliveries",
      description:
        "When donors deliver items, receive their pledges here to update your need totals. That's the full NGO journey!",
    },
  ],

  [TOUR_IDS.FULL_ADMIN]: [
    // ── Overview ──
    {
      route: "/admin/dashboard",
      targetId: "admin-hero-stats",
      title: "Step 1 — Platform overview",
      description:
        "These stat cards show approved NGOs, active needs, today's pledges, and monthly fulfillments so you can gauge platform health at a glance.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-tabs",
      title: "Three core workflows",
      description:
        "The admin dashboard is organized into three tabs: Verifications, Reports, and NGO Management. Let's walk through each one.",
    },
    // ── Verifications ──
    {
      route: "/admin/dashboard",
      targetId: "admin-tab-verify",
      clickBeforeTarget: "admin-tab-verify",
      title: "Step 2 — Verification queue",
      description:
        "Click this tab to see NGOs waiting for approval. Each pending NGO shows their submitted documents and profile details.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-verify-content",
      clickBeforeTarget: "admin-tab-verify",
      title: "Approve or reject NGOs",
      description:
        "Review each pending NGO's details and uploaded documents. Approve legitimate organizations or reject them with a reason that is sent to the applicant.",
    },
    // ── Reports ──
    {
      route: "/admin/dashboard",
      targetId: "admin-tab-reports",
      clickBeforeTarget: "admin-tab-reports",
      title: "Step 3 — Report review",
      description:
        "Switch to the Reports tab to see NGOs that donors have flagged. Reports are grouped per NGO with priority badges.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-reports-content",
      clickBeforeTarget: "admin-tab-reports",
      title: "Review and take action",
      description:
        "Expand a reported NGO to read individual report reasons. If reports are warranted, suspend the NGO to remove it from the discovery map.",
    },
    // ── NGO Management ──
    {
      route: "/admin/dashboard",
      targetId: "admin-tab-ngos",
      clickBeforeTarget: "admin-tab-ngos",
      title: "Step 4 — NGO management",
      description:
        "The NGO Management tab gives you a full list of all organizations on the platform, both active and suspended.",
    },
    {
      route: "/admin/dashboard",
      targetId: "admin-ngos-content",
      clickBeforeTarget: "admin-tab-ngos",
      title: "Inspect and override",
      description:
        "Expand any NGO to inspect their needs, edit or delete items, and suspend or unsuspend the organization. That covers every admin workflow!",
    },
  ],
};

function readCompletedTours() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const saved = window.localStorage.getItem(TOUR_STORAGE_KEYS.completed);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function writeCompletedTours(value) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    TOUR_STORAGE_KEYS.completed,
    JSON.stringify(value)
  );
}

export function getTourSteps(tourId) {
  return TOUR_STEPS[tourId] || [];
}

export function resolveContextTourId(pathname, role) {
  if (role === "DONOR") {
    if (pathname === "/donor/dashboard") return TOUR_IDS.DONOR_DASHBOARD;
    if (pathname.startsWith("/ngo/") && pathname !== "/ngo/dashboard" && pathname !== "/ngo/complete-profile") return TOUR_IDS.DONOR_NGO_PROFILE;
    if (pathname.startsWith("/pledge/")) return TOUR_IDS.DONOR_PLEDGE;
    if (pathname.startsWith("/delivery/")) return TOUR_IDS.DONOR_DELIVERY;
    return TOUR_IDS.DONOR_MAP;
  }

  if (role === "NGO") {
    if (pathname === "/ngo/dashboard") return TOUR_IDS.NGO_DASHBOARD;
    if (pathname === "/ngo/complete-profile") return TOUR_IDS.NGO_PROFILE;
  }

  if (role === "ADMIN") {
    if (pathname === "/admin/dashboard") return TOUR_IDS.ADMIN_DASHBOARD;
  }

  return null;
}

export function resolveFullTourId(role) {
  if (role === "DONOR") return TOUR_IDS.FULL_DONOR;
  if (role === "NGO") return TOUR_IDS.FULL_NGO;
  if (role === "ADMIN") return TOUR_IDS.FULL_ADMIN;
  return null;
}

export function queuePendingTour(tourId) {
  if (typeof window === "undefined" || !tourId) {
    return;
  }

  window.localStorage.setItem(TOUR_STORAGE_KEYS.pending, tourId);
}

export function takePendingTour(expectedTourId) {
  if (typeof window === "undefined") {
    return false;
  }

  const pendingTourId = window.localStorage.getItem(TOUR_STORAGE_KEYS.pending);
  if (pendingTourId !== expectedTourId) {
    return false;
  }

  window.localStorage.removeItem(TOUR_STORAGE_KEYS.pending);
  return true;
}

export function markTourCompleted(tourId) {
  if (!tourId) {
    return;
  }

  writeCompletedTours({
    ...readCompletedTours(),
    [tourId]: true,
  });
}

export function hasCompletedTour(tourId) {
  return Boolean(readCompletedTours()[tourId]);
}