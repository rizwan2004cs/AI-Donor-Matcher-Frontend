const DELIVERY_STORAGE_PREFIX = "delivery-session:";

export function saveDeliverySession(pledgeId, payload) {
  if (!pledgeId || typeof window === "undefined") return;

  window.localStorage.setItem(
    `${DELIVERY_STORAGE_PREFIX}${pledgeId}`,
    JSON.stringify(payload)
  );
}

export function loadDeliverySession(pledgeId) {
  if (!pledgeId || typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(`${DELIVERY_STORAGE_PREFIX}${pledgeId}`);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDeliverySession(pledgeId) {
  if (!pledgeId || typeof window === "undefined") return;
  window.localStorage.removeItem(`${DELIVERY_STORAGE_PREFIX}${pledgeId}`);
}
