import { useState, useEffect, useCallback } from 'react';
import { getDiscoveryNgos } from '../api/ngoApi';

/**
 * Hook to manage NGO discovery state and fetching logic
 * @param {Object} initialParams - { lat, lng, radius, category, search }
 * @returns {Object} - { ngos, loading, error, filters, setFilters, refresh, noLocalResults }
 */
export const useNgos = (initialCoords) => {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noLocalResults, setNoLocalResults] = useState(false);
  
  const [filters, setFilters] = useState({
    radius: 5,
    category: '',
    search: '',
  });

  const fetchNgos = useCallback(async () => {
    if (!initialCoords) return;
    
    setLoading(true);
    setError(null);
    setNoLocalResults(false);

    try {
      const baseParams = {
        category: filters.category || undefined,
        search: filters.search || undefined,
      };

      // 1. Try local search
      const localParams = {
        ...baseParams,
        lat: initialCoords.lat,
        lng: initialCoords.lng,
        radius: filters.radius,
      };

      const response = await getDiscoveryNgos(localParams);
      
      if (response.data.length > 0) {
        setNgos(response.data);
      } else {
        // 2. Fallback to nationwide search if no local results
        const nationwideResponse = await getDiscoveryNgos(baseParams);
        setNgos(nationwideResponse.data);
        if (nationwideResponse.data.length > 0) {
          setNoLocalResults(true);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch NGOs");
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, [initialCoords, filters]);

  useEffect(() => {
    fetchNgos();
  }, [fetchNgos]);

  return {
    ngos,
    loading,
    error,
    filters,
    setFilters,
    refresh: fetchNgos,
    noLocalResults,
  };
};
