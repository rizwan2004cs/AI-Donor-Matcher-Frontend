import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS } from "../utils/categoryColors";
import {
  ArrowRight,
  Clock3,
  HeartHandshake,
  History,
  MapPinned,
  Navigation,
  Package,
  X,
} from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useTour } from "../tour/TourContext";
import { takePendingTour, TOUR_IDS } from "../tour/tours";

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

function isExpiringSoon(expiresAt) {
  if (!expiresAt) return false;

  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 && diff <= 6 * 60 * 60 * 1000;
}

function getApiErrorMessage(err, fallback) {
  return (
    err?.response?.data?.error ||
    err?.response?.data?.message ||
    fallback
  );
}

export default function DonorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const online = useOnlineStatus();
  const { activeTourId, startTour } = useTour();
  const [tab, setTab] = useState("active");
  const [activePledges, setActivePledges] = useState([]);
  const [history, setHistory] = useState([]);
  const [activeLoading, setActiveLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const [error, setError] = useState(null);
  const [cancellingPledgeId, setCancellingPledgeId] = useState(null);

  const fulfilledCount = useMemo(
    () => history.filter((pledge) => pledge.status === "FULFILLED").length,
    [history]
  );
  const expiringSoonCount = useMemo(
    () => activePledges.filter((pledge) => isExpiringSoon(pledge.expiresAt)).length,
    [activePledges]
  );

  const loadActivePledges = async () => {
    setActiveLoading(true);

    try {
      const response = await api.get("/api/pledges/active");
      setActivePledges(
        (Array.isArray(response.data) ? response.data : []).map(normalizePledge)
      );
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load active pledges."));
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
      setError(getApiErrorMessage(err, "Failed to load pledge history."));
    } finally {
      setHistoryFetched(true);
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadActivePledges();
  }, []);

  useEffect(() => {
    if (activeTourId || !takePendingTour(TOUR_IDS.DONOR_DASHBOARD)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTour(TOUR_IDS.DONOR_DASHBOARD);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [activeTourId, startTour]);

  useEffect(() => {
    if (tab !== "history" || historyFetched) return;
    loadHistory();
  }, [tab, historyFetched]);

  useEffect(() => {
    if (activeLoading || activePledges.length > 0 || historyFetched || historyLoading) return;
    loadHistory();
  }, [activeLoading, activePledges.length, historyFetched, historyLoading]);

  useEffect(() => {
    if (tab !== "active" || activePledges.length > 0 || history.length === 0) return;
    setTab("history");
  }, [tab, activePledges.length, history.length]);

  const cancelPledge = async (pledgeId) => {
    if (!online) {
      alert("You are offline. Reconnect before cancelling a pledge.");
      return;
    }
    if (!window.confirm("Cancel this pledge?")) return;

    setError(null);
    setCancellingPledgeId(pledgeId);

    try {
      await api.delete(`/api/pledges/${pledgeId}`);
      await Promise.all([loadActivePledges(), loadHistory()]);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to cancel pledge."));
      await Promise.all([loadActivePledges(), loadHistory()]);
    } finally {
      setCancellingPledgeId(null);
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
        <div className="glass rounded-[28px] border border-white/60 px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-teal-100 text-teal-700">
            <HeartHandshake className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">
            Your next donation journey starts here
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            You do not have any active pledges yet. Browse nearby NGO needs and turn this
            space into a live delivery board.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow"
          >
            Explore the map
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      );
    }

    return activePledges.map((pledge) => {
      const countdown = formatCountdown(pledge.expiresAt);
      const isCancelling = cancellingPledgeId === pledge.id;

      return (
        <article
          key={pledge.id}
          className={`glass relative rounded-[26px] border border-white/60 p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
            isCancelling ? "pointer-events-none opacity-80" : ""
          }`}
        >
          {isCancelling && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-[26px] bg-white/75 backdrop-blur-sm">
              <div className="h-8 w-8 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
              <p className="text-sm font-medium text-slate-700">Cancelling pledge...</p>
            </div>
          )}

          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                style={{
                  backgroundColor: CATEGORY_COLORS[pledge.category] || "#0D9488",
                }}
              >
                <Package className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-slate-900">
                    {pledge.itemName} x {pledge.quantity}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                    {pledge.category}
                  </span>
                </div>
                <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                  <MapPinned className="h-4 w-4 text-teal-600" />
                  {pledge.ngoName}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Created {formatDate(pledge.createdAt) || "recently"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 lg:items-end">
              {countdown && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
                    countdown === "Expired"
                      ? "bg-red-100 text-red-600"
                      : isExpiringSoon(pledge.expiresAt)
                        ? "bg-amber-100 text-amber-700"
                        : "bg-teal-100 text-teal-700"
                  }`}
                >
                  <Clock3 className="h-3.5 w-3.5" />
                  {countdown === "Expired" ? "Delivery window expired" : `${countdown} left`}
                </span>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => navigate(`/delivery/${pledge.id}`)}
                  disabled={isCancelling}
                  className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:bg-teal-700 hover:shadow disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Navigation className="h-4 w-4" />
                  Open delivery
                </button>
                <button
                  onClick={() => cancelPledge(pledge.id)}
                  disabled={!online || isCancelling}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition-all duration-200 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <X className="h-4 w-4" />
                  {!online ? "Offline" : isCancelling ? "Cancelling..." : "Cancel pledge"}
                </button>
              </div>
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
        <div className="glass rounded-[28px] border border-white/60 px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
            <History className="h-8 w-8" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold text-slate-900">
            Your impact timeline is still empty
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500">
            Once your pledges are completed or closed, they will appear here as a record
            of the NGOs you supported.
          </p>
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
          className={`glass rounded-[26px] border border-white/60 p-5 shadow-sm ${
            canOpenNgo ? "cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-md" : ""
          }`}
        >
          <div className="flex items-start gap-4">
            <div
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
              style={{
                backgroundColor: CATEGORY_COLORS[pledge.category] || "#0D9488",
              }}
            >
              <Package className="h-5 w-5" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-lg font-semibold text-slate-900">
                  {pledge.itemName} x {pledge.quantity}
                </p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {pledge.category}
                </span>
              </div>
              <p className="mt-2 inline-flex items-center gap-2 text-sm text-slate-500">
                <MapPinned className="h-4 w-4 text-teal-600" />
                {pledge.ngoName}
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
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
    <div className="min-h-screen page-watermark">
        <section className="mx-auto max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <div
            className="overflow-hidden rounded-[28px] border border-teal-700/20 bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-600 px-6 py-6 text-white shadow-[0_24px_80px_rgba(13,148,136,0.18)] sm:px-8"
            data-tour-id="donor-dashboard-hero"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-teal-100/80">
                  Donor Space
                </p>
                <p className="mt-2 text-sm font-medium text-teal-50/85">
                  {user?.fullName ? `Welcome back, ${user.fullName}` : "Welcome back"}
                </p>
                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-[2rem]">
                  Donor Dashboard
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-6 text-teal-50/85">
                  Track active deliveries, revisit completed pledges, and jump back into
                  the discovery map whenever you are ready to support another NGO.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <HeroMetric label="Active" value={activePledges.length} />
                <HeroMetric label="History" value={history.length} />
                <HeroMetric label="Expiring Soon" value={expiringSoonCount} />
              </div>
            </div>
          </div>
        </section>

        <section
          className="mx-auto mt-6 grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3 sm:px-6 lg:px-8"
          data-tour-id="donor-dashboard-stats"
        >
          <StatCard
            icon={Package}
            label="Active pledges"
            value={activePledges.length}
            tone="teal"
          />
          <StatCard
            icon={History}
            label="History entries"
            value={history.length}
            tone="slate"
          />
          <StatCard
            icon={HeartHandshake}
            label="Fulfilled support"
            value={fulfilledCount}
            tone="emerald"
          />
        </section>

        <div className="mx-auto mt-6 max-w-6xl px-4 sm:px-6 lg:px-8">
          <div
            className="glass-subtle grid overflow-hidden rounded-[24px] border border-white/60 p-2 shadow-sm md:grid-cols-2"
            data-tour-id="donor-dashboard-tabs"
          >
            <button
              onClick={() => setTab("active")}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                tab === "active"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <Package className="h-4 w-4" />
              Active ({activePledges.length})
            </button>
            <button
              onClick={() => setTab("history")}
              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                tab === "history"
                  ? "bg-white text-teal-700 shadow-sm"
                  : "text-slate-500 hover:bg-white/60 hover:text-slate-700"
              }`}
            >
              <History className="h-4 w-4" />
              History ({history.length})
            </button>
          </div>
        </div>

        <main
          className="mx-auto max-w-6xl space-y-4 px-4 py-6 sm:px-6 lg:px-8"
          data-tour-id="donor-dashboard-content"
        >
          {error && <div className="glass rounded-2xl p-4 text-sm text-red-500">{error}</div>}
          {tab === "active" ? renderActiveContent() : renderHistoryContent()}
        </main>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  const toneClasses = {
    teal: "text-teal-700",
    slate: "text-slate-700",
    emerald: "text-emerald-700",
  };

  return (
    <div className="glass rounded-[24px] border border-white/60 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-4xl font-bold text-slate-900">{value}</p>
        </div>
        <div
          className={`rounded-2xl bg-white/70 p-3 ${
            toneClasses[tone] || toneClasses.teal
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function HeroMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 backdrop-blur-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-teal-50/70">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-bold text-white">{value}</p>
    </div>
  );
}
