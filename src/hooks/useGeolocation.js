import { useState, useEffect } from 'react';

const CHENNAI_FALLBACK = { lat: 13.0827, lng: 80.2707 };

/**
 * Hook to get user geolocation
 * @returns {Object} - { coords, error, loading }
 */
export const useGeolocation = () => {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setCoords(CHENNAI_FALLBACK);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError("Location access denied - using fallback");
        setCoords(CHENNAI_FALLBACK);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return { coords, error, loading };
};
