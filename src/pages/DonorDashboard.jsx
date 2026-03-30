import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS } from "../utils/categoryColors";
import { Clock3, History, Navigation, Package, X } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

function formatCountdown(expiresAt) {
  if (!expiresAt) return null;

  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";

  const totalMinutes = Math.floor(diff / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours}h ${minutes}m`;
}

function normalizePledge(pledge) {
  const need = pledge?.need || {};
  const ngo = need?.ngo || {};

  return {
    id: pledge?.id,
    quantity: Number(pledge?.quantity || 0),
    status: pledge?.status || "UNKNOWN",
    createdAt: pledge?.createdAt || "",
    expiresAt: pledge?.expiresAt || "",
    itemName: need?.itemName || "Item unavailable",
    category: need?.category || "OTHER",
    ngoId: ngo?.id ?? null,
    ngoName: ngo?.name || "NGO unavailable",
  };
}

export default function DonorDashboard() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [tab, setTab] = useState("active");
  const [activePledges, setActivePledges] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState(null);

  const historyLoaded = useMemo(() => history.length > 0, [history]);

  const loadActivePledges = async () => {
    setActiveLoading(true);

    try {
      const response = await api.get("/api/pledges/active");
      setActivePledges(
        (Array.isArray(response.data) ? response.data : []).map(normalizePledge)
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load active pledges."
      );
    } finally {
      setActiveLoading(false);
    }
  };

  const loadHistory = async () => {
    setHistoryLoading(true);

    try {
      const response = await api.get("/api/pledges/history");
      setHistory(
        (Array.isArray(response.data) ? response.data : []).map(normalizePledge)
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to load pledge history."
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadActivePledges();
  }, []);

  useEffect(() => {
    if (tab !== "history" || historyLoaded) return;
    loadHistory();
  }, [tab, historyLoaded]);

  const cancelPledge = async (pledgeId) => {
    if (!online) {
      alert("You are offline. Reconnect before cancelling a pledge.");
      return;
    }
    if (!window.confirm("Cancel this pledge?")) return;

    setError(null);

    try {
      await api.delete(`/api/pledges/${pledgeId}`);
      await loadActivePledges();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to cancel pledge."
      );
      await loadActivePledges();
    }
  };

  const renderActiveContent = () => {
    if (activeLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (activePledges.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>No active pledges</p>
          <button
            onClick={() => navigate("/map")}
            className="mt-3 text-sm text-teal-600 font-medium hover:text-teal-700 transition-all duration-200"
          >
            Discover needs on the map
          </button>
        </div>
      );
    }

    return activePledges.map((pledge) => {
      const countdown = formatCountdown(pledge.expiresAt);

      return (
        <article
          key={pledge.id}
          className="glass rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: CATEGORY_COLORS[pledge.category] || "#6B7280",
              }}
            />
            <div>
              <p className="font-medium text-sm text-slate-900">
                {pledge.itemName} x {pledge.quantity}
              </p>
              <p className="text-xs text-slate-500 mt-1">{pledge.ngoName}</p>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 sm:items-end">
            {countdown && (
              <span
                className={`text-xs inline-flex items-center gap-1 ${
                  countdown === "Expired" ? "text-red-500" : "text-amber-600"
                }`}
              >
                <Clock3 className="w-3 h-3" />
                {countdown}
              </span>
            )}

            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate(`/delivery/${pledge.id}`)}
                className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-teal-700 transition-all duration-200"
              >
                <Navigation className="w-3 h-3" />
                Navigate
              </button>
              <button
                onClick={() => cancelPledge(pledge.id)}
                disabled={!online}
                className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-3 h-3" />
                {online ? "Cancel" : "Offline"}
              </button>
            </div>
          </div>
        </article>
      );
    });
  };

  const renderHistoryContent = () => {
    if (historyLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (history.length === 0) {
      return (
        <div className="text-center py-12 text-slate-400">
          <History className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p>No donation history yet.</p>
        </div>
      );
    }

    return history.map((pledge) => {
      const isFulfilled = pledge.status === "FULFILLED";
      const canOpenNgo = Boolean(pledge.ngoId);

      return (
        <article
          key={pledge.id}
          onClick={() => canOpenNgo && navigate(`/ngo/${pledge.ngoId}`)}
          className={`glass rounded-2xl p-4 flex items-center justify-between gap-4 ${
            canOpenNgo ? "cursor-pointer hover:bg-white/80 transition-all duration-200" : ""
          }`}
        >
          <div className="flex items-center gap-3">
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: CATEGORY_COLORS[pledge.category] || "#6B7280",
              }}
            />
            <div>
              <p className="font-medium text-sm text-slate-900">
                {pledge.itemName} x {pledge.quantity}
              </p>
              <p className="text-xs text-slate-500 mt-1">{pledge.ngoName}</p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                isFulfilled
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {isFulfilled ? "Fulfilled" : pledge.status}
            </span>
            <p className="text-xs text-slate-400 mt-1">
              {formatDate(pledge.createdAt) || "Date unavailable"}
            </p>
          </div>
        </article>
      );
    });
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        <div className="glass-nav text-white px-6 py-6">
          <h1 className="text-xl font-bold tracking-tight">Donor Dashboard</h1>
          <p className="text-teal-200 text-sm mt-1">Manage your active and past pledges</p>
        </div>

        <div className="flex border-b bg-white/70 backdrop-blur-sm">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-all duration-200 ${
              tab === "active"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500"
            }`}
          >
            <Package className="w-4 h-4 inline mr-1" />
            Active ({activePledges.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-all duration-200 ${
              tab === "history"
                ? "border-teal-600 text-teal-700"
                : "border-transparent text-slate-500"
            }`}
          >
            <History className="w-4 h-4 inline mr-1" />
            History ({history.length})
          </button>
        </div>

        <main className="p-4 max-w-3xl mx-auto space-y-3">
          {error && <div className="glass rounded-2xl p-4 text-sm text-red-500">{error}</div>}
          {tab === "active" ? renderActiveContent() : renderHistoryContent()}
        </main>
      </div>
    </>
  );
}
