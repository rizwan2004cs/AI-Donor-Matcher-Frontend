/**
 * Utility to format distance in kilometers
 * @param {number} km - Distance in kilometers
 * @returns {string} - Formatted distance string (e.g., "5.2 km")
 */
export const formatDistance = (km) => {
  if (km === undefined || km === null) return "Unknown distance";
  return `${km.toFixed(1)} km`;
};
