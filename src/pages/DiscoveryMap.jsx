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
  const [showExpandedBanner, setShowExpandedBanner] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setCenter([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const fetchNgos = useCallback(async () => {
    setLoading(true);
    setNoLocal(false);
    setShowExpandedBanner(false);

    try {
      const baseFilters = {
        ...(search && { search }),
        ...(category && { category }),
      };

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

      const expandedRes = await api.get("/api/ngos", {
        params: {
          ...baseFilters,
          lat: center[0],
          lng: center[1],
        },
      });

      setNgos(expandedRes.data);

      if (expandedRes.data.length > 0) {
        setNoLocal(true);
        setShowExpandedBanner(true);
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

  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const timeoutId = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  const formatTrustTier = useCallback((tier) => {
    if (!tier) return "New";

    const normalized = tier.toString().toUpperCase();
    const labels = {
      NEW: "New",
      ESTABLISHED: "Established",
      TRUSTED: "Trusted",
    };

    return labels[normalized] || "New";
  }, []);

  const isUrgent = useCallback((urgency) => {
    if (!urgency) return false;
    const normalized = urgency.toString().toUpperCase();
    return normalized === "URGENT" || normalized === "HIGH";
  }, []);

  const sortedNgos = useMemo(() => {
    const getDistance = (ngo) =>
      Number.isFinite(ngo.distanceKm) ? ngo.distanceKm : Number.MAX_SAFE_INTEGER;

    const getBand = (ngo) => Math.floor(getDistance(ngo) / 2);

    return [...ngos].sort((left, right) => {
      const bandDiff = getBand(left) - getBand(right);
      if (bandDiff !== 0) return bandDiff;

      const urgencyDiff =
        Number(isUrgent(right.topNeedUrgency)) -
        Number(isUrgent(left.topNeedUrgency));
      if (urgencyDiff !== 0) return urgencyDiff;

      return getDistance(left) - getDistance(right);
    });
  }, [isUrgent, ngos]);

  return (
    <>
      <Navbar />
      <div className="bg-teal-50">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex h-[calc(100vh-52px)] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white/40 shadow-sm backdrop-blur-sm">
            <div className="glass-subtle flex flex-wrap items-center gap-3 border-b border-white/30 px-4 py-3">
              <input
                type="text"
                placeholder="Search NGO by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-64 rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2 text-sm transition-all duration-200 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-teal-400"
              >
                <option value="">All Categories</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
                type="button"
                onClick={() => fetchNgos()}
                className="rounded-xl bg-teal-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow"
              >
                Apply
              </button>
            </div>

            {noLocal && showExpandedBanner && (
              <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
                <div className="flex items-center justify-between gap-3">
                  <p>No NGOs found nearby. Showing all available NGOs.</p>
                  <button
                    type="button"
                    onClick={() => setShowExpandedBanner(false)}
                    className="rounded-lg px-2 py-1 text-amber-700 transition-all duration-200 hover:bg-amber-100"
                    aria-label="Dismiss expanded search notice"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-1 overflow-hidden">
              <div className="flex-1">
                <MapContainer center={center} zoom={12} className="h-full w-full">
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
                          <p className="text-sm font-bold">{ngo.name}</p>
                          <TrustBadge
                            score={ngo.trustScore}
                            label={formatTrustTier(ngo.trustTier)}
                          />
                          <p className="mt-1 text-xs text-slate-500">
                            {ngo.distanceKm?.toFixed(1)} km away
                          </p>
                          <p className="mt-1 text-xs">
                            Top Need: <strong>{ngo.topNeedItem}</strong> -{" "}
                            {ngo.topNeedQuantityRemaining} remaining
                          </p>
                          <button
                            type="button"
                            onClick={() => navigate(`/ngo/${ngo.id}`)}
                            className="mt-2 w-full rounded-xl bg-teal-600 py-1.5 text-xs text-white transition-all duration-200 hover:bg-teal-700"
                          >
                            View Full Profile
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              <div className="glass-subtle w-80 overflow-y-auto border-l border-white/30">
                {loading ? (
                  <p className="p-4 text-sm text-slate-400">Loading...</p>
                ) : sortedNgos.length === 0 ? (
                  <p className="p-4 text-sm text-slate-400">No NGOs found.</p>
                ) : (
                  sortedNgos.map((ngo) => (
                    <div
                      key={ngo.id}
                      onClick={() => navigate(`/ngo/${ngo.id}`)}
                      className="cursor-pointer border-b border-white/20 p-4 transition-all duration-200 hover:bg-white/40"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold">{ngo.name}</p>
                        <span className="text-xs text-slate-400">
                          {ngo.distanceKm?.toFixed(1)} km
                        </span>
                      </div>
                      {isUrgent(ngo.topNeedUrgency) && (
                        <span className="text-xs font-medium text-red-500">
                          Urgent
                        </span>
                      )}
                      <p className="mt-1 text-xs text-slate-600">
                        <span
                          className="mr-1 inline-block h-2 w-2 rounded-full"
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
