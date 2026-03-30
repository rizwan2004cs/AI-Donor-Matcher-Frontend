import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import Navbar from "../components/Navbar";
import { createCategoryIcon } from "../components/CategoryPin";
import { clearDeliverySession, loadDeliverySession, saveDeliverySession } from "../utils/deliverySession";
import { Clock, Navigation, X } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import api from "../api/axios";
import "leaflet/dist/leaflet.css";

const OSRM_URL = import.meta.env.VITE_OSRM_URL || "https://router.project-osrm.org";

export default function DeliveryView() {
  const { pledgeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const timerRef = useRef(null);

  const initialPledge = useMemo(
    () => location.state || loadDeliverySession(pledgeId),
    [location.state, pledgeId]
  );

  const [pledge, setPledge] = useState(initialPledge);
  const [donorPos, setDonorPos] = useState(null);
  const [route, setRoute] = useState([]);
  const [eta, setEta] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(!initialPledge);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    if (!location.state) return;
    saveDeliverySession(pledgeId, location.state);
  }, [location.state, pledgeId]);

  useEffect(() => {
    if (pledge || !online) {
      if (!pledge && !online) {
        setLoadError(
          "You are offline and no cached delivery details were found for this pledge."
        );
        setLoading(false);
      }
      return;
    }

    let cancelled = false;

    const loadPledge = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const response = await api.get(`/api/pledges/${pledgeId}`);
        if (!cancelled) {
          setPledge(response.data);
          saveDeliverySession(pledgeId, response.data);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to load delivery details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadPledge();

    return () => {
      cancelled = true;
    };
  }, [online, pledge, pledgeId]);

  useEffect(() => {
    if (!pledge) {
      return;
    }

    saveDeliverySession(pledgeId, pledge);
  }, [pledge, pledgeId]);

  useEffect(() => {
    if (!pledge?.ngoLat || !pledge?.ngoLng || typeof navigator === "undefined") return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentPos = [position.coords.latitude, position.coords.longitude];
        setDonorPos(currentPos);

        try {
          const response = await fetch(
            `${OSRM_URL}/route/v1/driving/${position.coords.longitude},${position.coords.latitude};${pledge.ngoLng},${pledge.ngoLat}?overview=full&geometries=geojson`
          );
          const data = await response.json();
          const routeData = data.routes?.[0];

          if (routeData) {
            setRoute(
              routeData.geometry.coordinates.map(([lng, lat]) => [lat, lng])
            );
            setEta(Math.ceil(routeData.duration / 60));
            setDistanceKm((routeData.distance / 1000).toFixed(1));
          } else {
            setRoute([currentPos, [pledge.ngoLat, pledge.ngoLng]]);
          }
        } catch {
          setRoute([currentPos, [pledge.ngoLat, pledge.ngoLng]]);
        }
      },
      () => {
        setDonorPos(null);
      }
    );
  }, [pledge]);

  useEffect(() => {
    if (!pledge?.expiresAt) return;

    const expire = new Date(pledge.expiresAt).getTime();
    const tick = () => {
      const diff = expire - Date.now();

      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(timerRef.current);
        return;
      }

      const hours = Math.floor(diff / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
      );
    };

    tick();
    timerRef.current = setInterval(tick, 1000);

    return () => clearInterval(timerRef.current);
  }, [pledge]);

  const cancelPledge = async () => {
    if (!online) {
      alert("You are offline. This action requires an internet connection.");
      return;
    }
    if (!window.confirm("Cancel this pledge?")) return;

    try {
      await api.delete(`/api/pledges/${pledgeId}`);
      clearDeliverySession(pledgeId);
      navigate("/donor/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel pledge");
    }
  };

  const openGoogleMaps = () => {
    if (!pledge?.ngoLat || !pledge?.ngoLng) return;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${pledge.ngoLat},${pledge.ngoLng}`,
      "_blank"
    );
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-slate-400">Loading delivery view...</div>
      </>
    );
  }

  if (!pledge) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-lg space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Delivery Details Unavailable</h1>
            <p className="text-sm text-slate-600">
              {loadError || "This pledge could not be loaded."}
            </p>
            <button
              onClick={() => navigate("/donor/dashboard")}
              className="bg-teal-600 text-white py-2.5 px-5 rounded-xl font-medium hover:bg-teal-700 transition-all duration-200"
            >
              Back to Donor Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  const center = donorPos || [pledge.ngoLat, pledge.ngoLng];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        <div className="glass-subtle shadow px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Delivering to {pledge.ngoName || "NGO destination"}
            </h2>
            <p className="text-sm text-slate-500">
              {pledge.itemName || "Donation"} x {pledge.quantity}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {distanceKm && eta && (
              <span className="flex items-center gap-1 text-sm text-slate-600">
                <Navigation className="w-4 h-4" /> {distanceKm} km · {eta} min
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

        <div className="h-[60vh]">
          <MapContainer center={center} zoom={12} className="h-full w-full">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap"
            />
            {donorPos && (
              <Marker position={donorPos}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            <Marker
              position={[pledge.ngoLat, pledge.ngoLng]}
              icon={createCategoryIcon(pledge.category)}
            >
              <Popup>{pledge.ngoAddress || "NGO drop-off point"}</Popup>
            </Marker>
            {route.length > 0 && (
              <Polyline positions={route} color="#0D9488" weight={4} opacity={0.8} />
            )}
          </MapContainer>
        </div>

        <div className="p-4 flex gap-3 max-w-lg mx-auto">
          <button
            onClick={openGoogleMaps}
            className="flex-1 bg-teal-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-teal-700 transition-all duration-200"
          >
            <Navigation className="w-4 h-4" /> Navigate
          </button>
          <button
            onClick={cancelPledge}
            disabled={!online}
            className="flex-1 border border-red-400 text-red-600 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-4 h-4" /> Cancel Pledge
          </button>
        </div>

        <div className="max-w-lg mx-auto glass rounded-2xl p-4 mb-6">
          <h3 className="font-semibold text-sm text-slate-500 mb-2">
            Drop-off Details
          </h3>
          <p className="text-sm">{pledge.ngoAddress || "Address not available"}</p>
          {pledge.ngoContactEmail && (
            <p className="text-sm mt-1">
              <a
                href={`mailto:${pledge.ngoContactEmail}`}
                className="text-teal-600 underline"
              >
                {pledge.ngoContactEmail}
              </a>
            </p>
          )}
        </div>
      </div>
    </>
  );
}
