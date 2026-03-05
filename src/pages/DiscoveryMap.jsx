import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import { createCategoryIcon } from "../components/CategoryPin";
import { CATEGORY_OPTIONS, CATEGORY_COLORS } from "../utils/categoryColors";

const DEFAULT_CENTER = [13.0827, 80.2707]; // Chennai fallback

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

  const fetchNgos = useCallback(
    async (expandNationwide = false) => {
      setLoading(true);
      try {
        const params = {
          lat: center[0],
          lng: center[1],
          search,
          ...(category && { category }),
          ...(!expandNationwide && { radius }),
        };
        const res = await api.get("/api/ngos", { params });
        if (res.data.length === 0 && !expandNationwide) {
          setNoLocal(true);
          return fetchNgos(true);
        }
        setNoLocal(expandNationwide && res.data.length > 0);
        setNgos(res.data);
      } catch {
        setNgos([]);
      } finally {
        setLoading(false);
      }
    },
    [center, search, category, radius]
  );

  useEffect(() => {
    fetchNgos();
  }, [fetchNgos]);

  // Debounce search
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  return (
    <>
      <Navbar />
      <div className="flex flex-col h-[calc(100vh-52px)]">
        {/* Filter bar */}
        <div className="glass-subtle px-4 py-3 flex flex-wrap items-center gap-3">
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
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {ngos.map((ngo) => (
                <Marker
                  key={ngo.id}
                  position={[ngo.lat, ngo.lng]}
                  icon={createCategoryIcon(ngo.pinCategory)}
                >
                  <Popup>
                    <div className="w-56">
                      <p className="font-bold text-sm">{ngo.name}</p>
                      <TrustBadge
                        score={ngo.trustScore}
                        label={ngo.trustLabel}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        📍 {ngo.distanceKm?.toFixed(1)} km away
                      </p>
                      <p className="text-xs mt-1">
                        Top Need: <strong>{ngo.topNeedItem}</strong> —{" "}
                        {ngo.topNeedRemaining} remaining
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
          <div className="w-80 glass-subtle overflow-y-auto">
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
                    <span className="text-xs text-red-500 font-medium">
                      🔴 Urgent
                    </span>
                  )}
                  <p className="text-xs text-slate-600 mt-1">
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-1"
                      style={{
                        backgroundColor:
                          CATEGORY_COLORS[ngo.pinCategory] || "#6B7280",
                      }}
                    />
                    {ngo.topNeedItem} ({ngo.topNeedRemaining} left)
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
