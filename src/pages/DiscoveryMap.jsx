import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import { createCategoryIcon } from "../components/CategoryPin";
import { CATEGORY_OPTIONS, CATEGORY_COLORS } from "../utils/categoryColors";

const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

function RecenterOnChange({ center }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center);
  }, [map, center]);

  return null;
}

export default function DiscoveryMap() {
  const navigate = useNavigate();
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(5);
  const [noLocal, setNoLocal] = useState(false);

  // Get user location on mount
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {} // silently use default
    );
  }, []);

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    setNoLocal(false);

    try {
      const baseFilters = {
        ...(search && { search }),
        ...(category && { category }),
      };

      // First: location-based search around current center
      const localParams = {
        ...baseFilters,
        lat: center[0],
        lng: center[1],
        radius,
      };

      const localRes = await api.get("/api/ngos", { params: localParams });

      if (localRes.data.length > 0) {
        setNgos(localRes.data);
        return;
      }

      // Fallback: nationwide search (omit lat/lng/radius)
      const nationwideRes = await api.get("/api/ngos", {
        params: baseFilters,
      });

      setNgos(nationwideRes.data);
      if (nationwideRes.data.length > 0) {
        setNoLocal(true);
      }
    } catch {
      setNgos([]);
    } finally {
      setLoading(false);
    }
  }, [center, radius, search, category]);

  useEffect(() => {
    fetchNgos();
  }, [fetchNgos]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const formatTrustTier = useCallback((tier) => {
    if (!tier) return "New";
    const normalized = tier.toString().toUpperCase();
    const map = {
      NEW: "New",
      ESTABLISHED: "Established",
      TRUSTED: "Trusted",
    };
    return map[normalized] || "New";
  }, []);

  return (
    <>
      <Navbar />
      <div className="bg-teal-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col h-[calc(100vh-52px)] border border-slate-200 rounded-2xl overflow-hidden shadow-sm bg-white/40 backdrop-blur-sm">
            {/* Filter bar */}
            <div className="glass-subtle px-4 py-3 flex flex-wrap items-center gap-3 border-b border-white/30">
              <input
                type="text"
                placeholder="🔍 Search NGO by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-2 text-sm">
                <span>Radius:</span>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-32"
                />
                <span className="font-medium">{radius} km</span>
              </div>
              <button
                onClick={() => fetchNgos()}
                className="bg-teal-600 text-white text-sm px-5 py-2 rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow font-medium"
              >
                Apply
              </button>
            </div>

            {/* No local results banner */}
            {noLocal && (
              <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-sm px-4 py-2 text-center">
                No NGOs found nearby. Showing all available NGOs.
              </div>
            )}

            {/* Map + List split */}
            <div className="flex flex-1 overflow-hidden">
              {/* Map */}
              <div className="flex-1">
                <MapContainer
                  center={center}
                  zoom={12}
                  className="h-full w-full"
                >
                  <RecenterOnChange center={center} />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {ngos.map((ngo) => (
                    <Marker
                      key={ngo.id}
                      position={[ngo.lat, ngo.lng]}
                      icon={createCategoryIcon(ngo.topNeedCategory)}
                    >
                      <Popup>
                        <div className="w-56">
                          <p className="font-bold text-sm">{ngo.name}</p>
                          <TrustBadge
                            score={ngo.trustScore}
                            label={formatTrustTier(ngo.trustTier)}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            📍 {ngo.distanceKm?.toFixed(1)} km away
                          </p>
                          <p className="text-xs mt-1">
                            Top Need: <strong>{ngo.topNeedItem}</strong> —{" "}
                            {ngo.topNeedQuantityRemaining} remaining
                          </p>
                          <button
                            onClick={() => navigate(`/ngo/${ngo.id}`)}
                            className="mt-2 w-full bg-teal-600 text-white text-xs py-1.5 rounded-lg hover:bg-teal-700 transition-all duration-200"
                          >
                            View Full Profile
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {/* Side list */}
              <div className="w-80 glass-subtle overflow-y-auto border-l border-white/30">
                {loading ? (
                  <p className="p-4 text-sm text-slate-400">Loading...</p>
                ) : ngos.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400">No NGOs found.</p>
                ) : (
                  ngos.map((ngo) => (
                    <div
                      key={ngo.id}
                      onClick={() => navigate(`/ngo/${ngo.id}`)}
                      className="p-4 border-b border-white/20 hover:bg-white/40 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">{ngo.name}</p>
                        <span className="text-xs text-slate-400">
                          {ngo.distanceKm?.toFixed(1)} km
                        </span>
                      </div>
                      {ngo.topNeedUrgency === "URGENT" && (
                        // Support both legacy "URGENT" and new "HIGH" urgency values
                        <span className="text-xs text-red-500 font-medium">
                          🔴 Urgent
                        </span>
                      )}
                      <p className="text-xs text-slate-600 mt-1">
                        <span
                          className="inline-block w-2 h-2 rounded-full mr-1"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[ngo.topNeedCategory] || "#6B7280",
                          }}
                        />
                        {ngo.topNeedItem} ({ngo.topNeedQuantityRemaining} left)
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
