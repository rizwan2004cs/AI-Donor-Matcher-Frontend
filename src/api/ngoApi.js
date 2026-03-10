import api from "./axios";

/**
 * NGO Discovery and Profile API service
 */

/**
 * Fetch NGOs based on discovery parameters
 * @param {Object} params - { lat, lng, radius, category, search }
 */
export const getDiscoveryNgos = (params = {}) => {
  return api.get("/api/ngos", { params });
};

/**
 * Fetch a single NGO by ID
 * @param {string|number} id 
 */
export const getNgoById = (id) => {
  return api.get(`/api/ngos/${id}`);
};

/**
 * Report an NGO
 * @param {string|number} id 
 * @param {string} reason 
 */
export const reportNgo = (id, reason) => {
  return api.post(`/api/ngos/${id}/report`, { reason });
};
