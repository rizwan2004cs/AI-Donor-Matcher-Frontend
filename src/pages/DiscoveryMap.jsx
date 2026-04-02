import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import {
  createCategoryIcon,
  createCurrentLocationIcon,
} from "../components/CategoryPin";
import { CATEGORY_OPTIONS, CATEGORY_COLORS } from "../utils/categoryColors";
import {
  ArrowRight,
  Clock3,
  MapPinned,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

function RecenterOnChange({ center, zoom = 12 }) {
  const map = useMap();

  useEffect(() => {
    if (!center) return;
    map.setView(center, zoom, { animate: true });
  }, [map, center, zoom]);

  return null;
}

export default function DiscoveryMap() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ngos, setNgos] = useState([]);
  const [activePledges, setActivePledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [hasUserLocation, setHasUserLocation] = useState(false);
  const [locationResolved, setLocationResolved] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [radius, setRadius] = useState(5);
  const [noLocal, setNoLocal] = useState(false);
  const [showExpandedBanner, setShowExpandedBanner] = useState(false);
  const [focusedNgoId, setFocusedNgoId] = useState(null);
  const [focusedCenter, setFocusedCenter] = useState(null);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
        setHasUserLocation(true);
        setLocationResolved(true);
      },
      () => {
        setHasUserLocation(false);
        setLocationResolved(true);
      }
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

  useEffect(() => {
    if (!user || user.role !== "DONOR") {
      setActivePledges([]);
      return;
    }

    api
      .get("/api/pledges/active")
      .then((response) => {
        const pledges = Array.isArray(response.data) ? response.data : [];
        setActivePledges(pledges);
      })
      .catch(() => setActivePledges([]));
  }, [user]);

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

  const mapNgos = useMemo(() => {
    const grouped = new Map();

    ngos.forEach((ngo) => {
      const key = `${ngo.lat},${ngo.lng}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(ngo);
    });

    return Array.from(grouped.values()).flatMap((group) => {
      if (group.length === 1) {
        return group.map((ngo) => ({
          ...ngo,
          markerLat: ngo.lat,
          markerLng: ngo.lng,
        }));
      }

      const radiusOffset = 0.0012;
      return group.map((ngo, index) => {
        if (index === 0) {
          return {
            ...ngo,
            markerLat: ngo.lat,
            markerLng: ngo.lng,
          };
        }

        const spreadIndex = index - 1;
        const angle = (index / group.length) * Math.PI * 2;
        return {
          ...ngo,
          markerLat: ngo.lat + Math.sin(angle) * radiusOffset * (spreadIndex % 2 === 0 ? 1 : 0.72),
          markerLng: ngo.lng + Math.cos(angle) * radiusOffset * (spreadIndex % 2 === 0 ? 1 : 0.72),
        };
      });
    });
  }, [ngos]);

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setCategory("");
    setRadius(5);
    setFocusedNgoId(null);
    setFocusedCenter(null);
  };

  const handleFocusNgo = (ngo) => {
    setFocusedNgoId(ngo.id);
    setFocusedCenter([ngo.markerLat ?? ngo.lat, ngo.markerLng ?? ngo.lng]);
  };

  const handleViewProfile = (ngoId) => {
    navigate(`/ngo/${ngoId}`);
  };

  const primaryPledge = activePledges[0];
  const primaryPledgeNeed = primaryPledge?.need || {};
  const primaryPledgeNgo = primaryPledgeNeed?.ngo || {};

  return (
    <>
      <Navbar />
      <div className="bg-teal-50">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
          <div className="overflow-hidden rounded-[30px] border border-white/70 bg-white/45 shadow-[0_24px_80px_rgba(15,118,110,0.08)] backdrop-blur-sm">
            {primaryPledge && (
              <div className="border-b border-white/40 bg-teal-50/90 px-5 py-3 sm:px-6">
                <div className="flex flex-col gap-3 rounded-2xl border border-teal-100 bg-white/80 px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded-2xl bg-teal-100 p-2.5 text-teal-700">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-600">
                        Active pledge
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {primaryPledgeNeed?.itemName || "Active delivery"} x{" "}
                        {primaryPledge?.quantity || 0}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {primaryPledgeNgo?.name || "NGO unavailable"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {primaryPledge?.expiresAt && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                        <Clock3 className="h-3.5 w-3.5" />
                        Delivery in progress
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => navigate(`/delivery/${primaryPledge.id}`)}
                      className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-700"
                    >
                      Open delivery
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="border-b border-white/40 bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600 px-5 py-4 text-white sm:px-6">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-100/80">
                    Donor Discovery Map
                  </p>
                  <h1 className="mt-1.5 text-[2rem] font-bold tracking-tight sm:text-[1.9rem]">
                    Find the right NGO faster
                  </h1>
                  <p className="mt-1.5 max-w-xl text-sm leading-6 text-teal-50/85">
                    Search by organization name, narrow by category, and expand your radius
                    when the nearest matches are not enough.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <HeroMetric label="Visible NGOs" value={sortedNgos.length} />
                  <HeroMetric label="Radius" value={`${radius} km`} />
                  <HeroMetric
                    label="Mode"
                    value={noLocal ? "Expanded" : "Local"}
                  />
                </div>
              </div>
            </div>

            <div className="glass-subtle border-b border-white/30">
              <div className="flex flex-col gap-3 px-4 py-3 sm:px-6">
                <div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                      Search Controls
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2">
                      <FilterChip label={search ? `Search: ${search}` : "No name filter"} />
                      <FilterChip
                        label={
                          category
                            ? CATEGORY_OPTIONS.find((option) => option.value === category)?.label ||
                              category
                            : "All categories"
                        }
                      />
                      <FilterChip label={`${radius} km radius`} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-2.5 border-t border-white/40 pt-3 lg:grid-cols-[1.2fr_0.8fr_1fr_auto_auto]">
                  <label className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
                    <Search className="h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search NGO by name..."
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
                    <SlidersHorizontal className="h-4 w-4 text-slate-400" />
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl bg-transparent text-sm text-slate-800 focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      {CATEGORY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="rounded-2xl border border-white/60 bg-white/80 px-4 py-3 shadow-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-slate-600">Radius</span>
                      <span className="rounded-full bg-teal-100 px-2.5 py-1 text-xs font-semibold text-teal-700">
                        {radius} km
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={50}
                      value={radius}
                      onChange={(e) => setRadius(Number(e.target.value))}
                      className="mt-3 w-full accent-teal-600"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      fetchNgos();
                    }}
                    className="rounded-2xl bg-teal-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow"
                  >
                    Apply Filters
                  </button>

                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="rounded-2xl border border-slate-200 bg-white/80 px-5 py-3 text-sm font-medium text-slate-600 transition-all duration-200 hover:bg-white"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>

            {noLocal && showExpandedBanner && (
              <div className="border-b border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-800 sm:px-6">
                <div className="flex items-center justify-between gap-3">
                  <p>No NGOs matched nearby, so the map expanded to show all available results.</p>
                  <button
                    type="button"
                    onClick={() => setShowExpandedBanner(false)}
                    className="rounded-xl px-3 py-1.5 text-amber-700 transition-all duration-200 hover:bg-amber-100"
                    aria-label="Dismiss expanded search notice"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            <div className="grid h-[calc(100vh-190px)] min-h-[620px] grid-rows-[minmax(460px,1fr)_280px] gap-0 lg:grid-cols-[minmax(0,1.7fr)_360px] lg:grid-rows-1">
              <div className="min-h-[460px] lg:min-h-0">
                <MapContainer center={center} zoom={12} className="h-full w-full">
                  <RecenterOnChange
                    center={focusedCenter || center}
                    zoom={focusedCenter ? 15 : 12}
                  />
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {hasUserLocation && (
                    <Marker position={center} icon={createCurrentLocationIcon()}>
                      <Popup>
                        <div className="w-48">
                          <p className="text-sm font-bold text-slate-900">Your location</p>
                          <p className="mt-1 text-xs text-slate-500">
                            Nearby NGOs are measured from here.
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                  {mapNgos.map((ngo) => (
                    <Marker
                      key={ngo.id}
                      position={[ngo.markerLat, ngo.markerLng]}
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
                            onClick={() => handleViewProfile(ngo.id)}
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

              <aside className="glass-subtle flex min-h-0 h-full max-h-[280px] flex-col border-t border-white/30 lg:max-h-none lg:border-l lg:border-t-0">
                <div className="border-b border-white/30 px-5 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                        Result Panel
                      </p>
                      <h2 className="mt-1.5 text-lg font-semibold text-slate-900">
                        Nearby NGOs
                      </h2>
                      <p className="mt-1 text-xs text-slate-500">
                        Sorted by distance bands, then urgency.
                      </p>
                    </div>
                    <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">
                      {sortedNgos.length} shown
                    </span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                {loading || !locationResolved ? (
                  <div className="flex h-full min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
                    <div className="h-10 w-10 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                    <p className="mt-4 text-sm font-medium text-slate-700">
                      {!locationResolved
                        ? "Finding NGOs near your location..."
                        : "Loading nearby NGOs..."}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {!locationResolved
                        ? "We are locating you before building the nearby list."
                        : "We are checking local matches first."}
                    </p>
                  </div>
                ) : sortedNgos.length === 0 ? (
                  <div className="flex h-full min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold text-slate-900">
                      No NGOs match this search yet
                    </h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
                      Try widening your radius, clearing the category filter, or searching
                      with a shorter name.
                    </p>
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-5 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-teal-700"
                    >
                      Reset search
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  sortedNgos.map((ngo) => (
                    <div
                      key={ngo.id}
                      onClick={() => handleFocusNgo(ngo)}
                      className={`cursor-pointer border-b border-white/20 px-5 py-3 transition-all duration-200 hover:bg-white/50 ${
                        focusedNgoId === ngo.id ? "bg-teal-50/80" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{ngo.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {ngo.address || "Address not available"}
                          </p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                          {ngo.distanceKm?.toFixed(1)} km
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {isUrgent(ngo.topNeedUrgency) && (
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                            Urgent
                          </span>
                        )}
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {ngo.topNeedCategory || "Other"}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-slate-600">
                        <span
                          className="mr-2 inline-block h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              CATEGORY_COLORS[ngo.topNeedCategory] || "#6B7280",
                          }}
                        />
                        {ngo.topNeedItem} ({ngo.topNeedQuantityRemaining} left)
                      </p>

                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleFocusNgo(ngo);
                          }}
                          className="text-xs font-medium text-teal-700 transition-all duration-200 hover:text-teal-800"
                        >
                          Show on map
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleViewProfile(ngo.id);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-teal-600 px-3 py-1.5 text-xs font-medium text-white transition-all duration-200 hover:bg-teal-700"
                        >
                          View full profile
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-50/70">
        {label}
      </p>
      <p className="mt-1.5 inline-flex items-center gap-2 text-xl font-bold text-white">
        <MapPinned className="h-5 w-5 text-teal-100" />
        {value}
      </p>
    </div>
  );
}

function FilterChip({ label }) {
  return (
    <span className="rounded-full border border-white/60 bg-white/75 px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
      {label}
    </span>
  );
}
