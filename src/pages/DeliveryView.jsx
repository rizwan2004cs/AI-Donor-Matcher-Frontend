import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { createCategoryIcon } from "../components/CategoryPin";
import { Navigation, Clock, X } from "lucide-react";
import "leaflet/dist/leaflet.css";

const OSRM_URL = import.meta.env.VITE_OSRM_URL || "https://router.project-osrm.org";

export default function DeliveryView() {
  const { pledgeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [pledge, setPledge] = useState(location.state || null);
  const [route, setRoute] = useState(null);
  const [eta, setEta] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(!location.state);
  const timerRef = useRef(null);

  // Fetch pledge details if not provided via state
  useEffect(() => {
    if (!pledge) {
      api
        .get(`/api/pledges/${pledgeId}`)
        .then((res) => setPledge(res.data))
        .catch(() => navigate("/donor/dashboard"))
        .finally(() => setLoading(false));
    }
  }, [pledgeId, pledge, navigate]);

  // Fetch route from OSRM
  useEffect(() => {
    if (!pledge?.donorLat || !pledge?.ngoLat) return;
    const coords = `${pledge.donorLng},${pledge.donorLat};${pledge.ngoLng},${pledge.ngoLat}`;
    fetch(`${OSRM_URL}/route/v1/driving/${coords}?overview=full&geometries=geojson`)
      .then((r) => r.json())
      .then((data) => {
        if (data.routes?.length) {
          const r = data.routes[0];
          const latlngs = r.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
          setRoute(latlngs);
          setEta(Math.ceil(r.duration / 60));
        }
      })
      .catch(console.error);
  }, [pledge]);

  // Countdown to expiry
  useEffect(() => {
    if (!pledge?.expiresAt) return;
    const expire = new Date(pledge.expiresAt).getTime();
    const tick = () => {
      const diff = expire - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timerRef.current);
      } else {
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setTimeLeft(
          `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
        );
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [pledge]);

  const cancelPledge = async () => {
    if (!window.confirm("Cancel this pledge?")) return;
    try {
      await api.put(`/api/pledges/${pledgeId}/cancel`);
      navigate("/donor/dashboard");
    } catch {
      alert("Failed to cancel pledge");
    }
  };

  const openGoogleMaps = () => {
    if (!pledge?.ngoLat) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${pledge.ngoLat},${pledge.ngoLng}`,
      "_blank"
    );
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-gray-400">Loading delivery view...</div>
      </>
    );

  if (!pledge)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-red-500">Pledge not found.</div>
      </>
    );

  const center =
    pledge.donorLat && pledge.ngoLat
      ? [(pledge.donorLat + pledge.ngoLat) / 2, (pledge.donorLng + pledge.ngoLng) / 2]
      : [6.9271, 79.8612];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header bar */}
        <div className="bg-white shadow px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1F4E79]">
              Delivering to {pledge.ngoName}
            </h2>
            <p className="text-sm text-gray-500">
              {pledge.itemName} × {pledge.quantity}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {eta && (
              <span className="flex items-center gap-1 text-sm text-gray-600">
                <Navigation className="w-4 h-4" /> ~{eta} min
              </span>
            )}
            {timeLeft && (
              <span
                className={`flex items-center gap-1 text-sm font-medium ${
                  timeLeft === "Expired" ? "text-red-500" : "text-orange-500"
                }`}
              >
                <Clock className="w-4 h-4" /> {timeLeft}
              </span>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="h-[60vh]">
          <MapContainer center={center} zoom={12} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {pledge.donorLat && (
              <Marker position={[pledge.donorLat, pledge.donorLng]}>
                <Popup>Your location</Popup>
              </Marker>
            )}
            {pledge.ngoLat && (
              <Marker
                position={[pledge.ngoLat, pledge.ngoLng]}
                icon={createCategoryIcon(pledge.category)}
              >
                <Popup>{pledge.ngoName}</Popup>
              </Marker>
            )}
            {route && (
              <Polyline positions={route} color="#2E75B6" weight={4} opacity={0.8} />
            )}
          </MapContainer>
        </div>

        {/* Action buttons */}
        <div className="p-4 flex gap-3 max-w-lg mx-auto">
          <button
            onClick={openGoogleMaps}
            className="flex-1 bg-[#2E75B6] text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-[#1F4E79] transition"
          >
            <Navigation className="w-4 h-4" /> Navigate
          </button>
          <button
            onClick={cancelPledge}
            className="flex-1 border border-red-400 text-red-600 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition"
          >
            <X className="w-4 h-4" /> Cancel Pledge
          </button>
        </div>

        {/* NGO contact card */}
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-semibold text-sm text-gray-500 mb-2">
            Drop-off Details
          </h3>
          <p className="text-sm">{pledge.ngoAddress || "Address not available"}</p>
          {pledge.ngoPhone && (
            <p className="text-sm mt-1">
              📞{" "}
              <a href={`tel:${pledge.ngoPhone}`} className="text-blue-600 underline">
                {pledge.ngoPhone}
              </a>
            </p>
          )}
          {pledge.ngoEmail && (
            <p className="text-sm mt-1">
              ✉️{" "}
              <a href={`mailto:${pledge.ngoEmail}`} className="text-blue-600 underline">
                {pledge.ngoEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
