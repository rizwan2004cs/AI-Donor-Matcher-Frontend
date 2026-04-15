import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CircleCheckBig,
  Clock3,
  ImagePlus,
  Lock,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../auth/AuthContext";
import NeedEditorModal from "../components/NeedEditorModal";
import NeedProgressBar from "../components/NeedProgressBar";
import TrustBadge from "../components/TrustBadge";
import { CATEGORY_LABELS } from "../utils/categoryColors";
import {
  getNgoProfileCompletion,
  normalizeNgoProfile,
} from "../utils/ngoProfile";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useTour } from "../tour/TourContext";
import { takePendingTour, TOUR_IDS } from "../tour/tours";

const MAX_ACTIVE_NEEDS = 5;

export default function NgoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeTourId, startTour } = useTour();
  const [profile, setProfile] = useState(() => normalizeNgoProfile());
  const [needs, setNeeds] = useState([]);
  const [incomingPledges, setIncomingPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [receivingPledgeId, setReceivingPledgeId] = useState(null);
  const [error, setError] = useState(null);
  const online = useOnlineStatus();

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, needsRes, pledgesRes] = await Promise.all([
        api.get("/api/ngo/my/profile"),
        api.get("/api/ngo/my/needs"),
        api.get("/api/ngo/my/pledges"),
      ]);

      const normalizedProfile = normalizeNgoProfile(profileRes.data);
      const completion = getNgoProfileCompletion(normalizedProfile);

      setProfile(normalizedProfile);
      setNeeds(Array.isArray(needsRes.data) ? needsRes.data : []);
      setIncomingPledges(Array.isArray(pledgesRes.data) ? pledgesRes.data : []);

      if (!completion.isComplete) {
        navigate("/ngo/complete-profile", { replace: true });
        return;
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load NGO dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTourId || !takePendingTour(TOUR_IDS.NGO_DASHBOARD)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTour(TOUR_IDS.NGO_DASHBOARD);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [activeTourId, startTour]);

  const openAddModal = () => {
    setEditingNeed(null);
    setShowNeedModal(true);
  };

  const openEditModal = (need) => {
    setEditingNeed(need);
    setShowNeedModal(true);
  };

  const closeNeedModal = () => {
    setShowNeedModal(false);
    setEditingNeed(null);
  };

  const handleSaveNeed = async (payload) => {
    if (!online) {
      setError(
        `You are offline. Reconnect before ${editingNeed ? "updating" : "creating"} a need.`
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (editingNeed) {
        await api.put(`/api/needs/${editingNeed.id}`, payload);
      } else {
        await api.post("/api/needs", payload);
      }

      closeNeedModal();
      await loadDashboard();
    } catch (err) {
      setError(
        err.response?.data?.error ||
          `Failed to ${editingNeed ? "update" : "add"} need.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteNeed = async (needId) => {
    if (!online) {
      setError("You are offline. Reconnect before deleting a need.");
      return;
    }
    if (!window.confirm("Delete this need?")) return;

    try {
      await api.delete(`/api/needs/${needId}`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete need.");
    }
  };

  const handleReceivePledge = async (pledgeId) => {
    if (!online) {
      setError("You are offline. Reconnect before receiving a pledge.");
      return;
    }

    setError(null);
    setReceivingPledgeId(pledgeId);

    try {
      await api.patch(`/api/ngo/my/pledges/${pledgeId}/receive`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to receive pledge.");
    } finally {
      setReceivingPledgeId(null);
    }
  };

  const activeNeeds = needs.filter(
    (need) => !["FULFILLED", "EXPIRED"].includes(need.status)
  );
  const incomingPledgeNeedSummary = incomingPledges.reduce((acc, pledge) => {
    if (!pledge?.needId) return acc;
    const current = acc.get(pledge.needId);
    if (!current || (pledge.createdAt || "") > (current.createdAt || "")) {
      acc.set(pledge.needId, pledge);
    }
    return acc;
  }, new Map());
  const completion = getNgoProfileCompletion(profile);
  const canAddNeed = activeNeeds.length < MAX_ACTIVE_NEEDS;
  const hasTrustMetrics =
    typeof profile.trustScore === "number" && Boolean(profile.trustLabel);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-teal-50">
          <main className="max-w-5xl mx-auto px-6 py-12">
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        <main className="max-w-5xl mx-auto px-6 py-8">
          <header>
            <button
              type="button"
              onClick={() => navigate("/ngo/complete-profile")}
              data-tour-id="ngo-dashboard-hero"
              className="text-left text-sm font-medium text-teal-700 transition-all duration-200 hover:text-teal-800"
            >
              {profile.name
                ? `Managing ${profile.name}`
                : user?.fullName
                  ? `Welcome back, ${user.fullName}`
                  : "Welcome back"}
            </button>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              NGO Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage active needs and confirm donor deliveries one pledge at a time.
            </p>
          </header>

          <div className="mt-8 space-y-6">
            <section className="glass rounded-2xl p-6" data-tour-id="ngo-dashboard-summary">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Organization
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/ngo/complete-profile")}
                    className="mt-1 text-left text-2xl font-semibold text-slate-900 transition-all duration-200 hover:text-teal-700"
                  >
                    {profile.name || "Your NGO"}
                  </button>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    {hasTrustMetrics ? (
                      <TrustBadge
                        score={profile.trustScore}
                        label={profile.trustLabel}
                      />
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        Trust score unavailable in current profile response
                      </span>
                    )}

                    <button
                      data-tour-id="ngo-dashboard-edit-profile"
                      onClick={() => navigate("/ngo/complete-profile")}
                      className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center gap-2"
                    >
                      <ImagePlus className="h-4 w-4" />
                      Edit Profile
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 lg:min-w-72">
                  <div className="glass-subtle rounded-2xl p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Profile Status
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {completion.percent}%
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      {completion.isComplete ? "Ready" : "Needs attention"}
                    </p>
                  </div>

                  <div className="glass-subtle rounded-2xl p-4">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                      Active Needs
                    </p>
                    <p className="text-3xl font-bold text-slate-900 mt-1">
                      {activeNeeds.length}/{MAX_ACTIVE_NEEDS}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">Current load</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="glass rounded-2xl p-6" data-tour-id="ngo-dashboard-needs">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Active Needs
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Uses the agreed NGO need endpoints for read, create, update,
                    delete, and fulfill.
                  </p>
                </div>

                <button
                  onClick={() => canAddNeed && openAddModal()}
                  disabled={!canAddNeed || !online}
                  className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 inline-flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {online ? "Add Need" : "Offline"}
                </button>
              </div>

              {!canAddNeed && (
                <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  Maximum active need count reached. Fulfill or remove one before
                  adding another.
                </div>
              )}

              {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

              {activeNeeds.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-slate-500">No active needs yet</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {activeNeeds.map((need) => {
                    const summary = incomingPledgeNeedSummary.get(need.id);
                    const pledged = Number(
                      summary?.needQuantityPledged ?? need.quantityPledged ?? 0
                    );
                    const received = Number(summary?.needQuantityReceived ?? 0);
                    const required = Number(need.quantityRequired ?? 0);
                    const remaining = Math.max(
                      Number(summary?.needQuantityRemaining ?? required - received),
                      0
                    );
                    const isLocked = pledged > 0;

                    return (
                      <article key={need.id} className="glass-subtle rounded-2xl p-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-xl font-semibold text-slate-900">
                                {need.itemName}
                              </h3>
                              {isLocked && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                  <Lock className="h-3 w-3" />
                                  Locked
                                </span>
                              )}
                            </div>

                            <p className="text-sm text-slate-600 mt-1">
                              {CATEGORY_LABELS[need.category] || need.category}
                              {need.urgency ? ` • ${need.urgency}` : ""}
                            </p>
                          </div>

                          <div className="text-left sm:text-right">
                            <p className="text-sm font-medium text-slate-900">
                              {remaining} remaining
                            </p>
                            <p className="text-xs text-slate-500">
                              {received} received • {pledged} pledged / {required} required
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <NeedProgressBar pledged={pledged} required={required || 1} />
                        </div>

                        {!isLocked && (
                          <div className="mt-4 flex justify-end">
                            <div className="flex flex-col gap-3 sm:flex-row">
                              <button
                                onClick={() => openEditModal(need)}
                                disabled={!online}
                                className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Pencil className="h-4 w-4" />
                                {online ? "Edit" : "Offline"}
                              </button>
                              <button
                                onClick={() => handleDeleteNeed(need.id)}
                                disabled={!online}
                                className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Trash2 className="h-4 w-4" />
                                {online ? "Delete" : "Offline"}
                              </button>
                            </div>
                          </div>
                        )}

                        {isLocked && (
                          <div className="mt-4 flex justify-end">
                            <div className="rounded-xl border border-teal-100 bg-teal-50 px-4 py-2 text-sm text-teal-700">
                              Confirm deliveries from the incoming pledges list below.
                            </div>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="glass rounded-2xl p-6" data-tour-id="ngo-dashboard-pledges">
              <h2 className="text-2xl font-semibold text-slate-900">
                Incoming Pledges
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Confirm each donor delivery here. Receiving a pledge updates the related
                need totals without closing the need early.
              </p>

              {incomingPledges.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-slate-300" />
                  <p className="mt-3 text-slate-500">No incoming pledges yet</p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {incomingPledges.map((pledge) => (
                    <article
                      key={pledge.pledgeId}
                      className={`glass-subtle rounded-2xl p-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between ${
                        receivingPledgeId === pledge.pledgeId ? "opacity-80" : ""
                      }`}
                    >
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {pledge.itemName}
                        </h3>
                        <p className="text-sm text-slate-600 mt-1">
                          {pledge.quantity} pledged by {pledge.donorName}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                          {pledge.donorEmail}
                        </p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {CATEGORY_LABELS[pledge.category] || pledge.category || "Other"}
                          </span>
                          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                            {pledge.needQuantityRemaining} still needed
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {pledge.needQuantityReceived} received / {pledge.needQuantityRequired} required
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="flex flex-col gap-3 sm:items-end">
                          <div>
                            <p className="text-sm font-medium text-slate-900">
                              {pledge.status || "ACTIVE"}
                            </p>
                            {pledge.expiresAt && pledge.status === "ACTIVE" && (
                              <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                                <Clock3 className="h-3.5 w-3.5" />
                                Expires {new Date(pledge.expiresAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                          {pledge.status === "ACTIVE" && (
                            <button
                              type="button"
                              onClick={() => handleReceivePledge(pledge.pledgeId)}
                              disabled={!online || receivingPledgeId === pledge.pledgeId}
                              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <CircleCheckBig className="h-4 w-4" />
                              {receivingPledgeId === pledge.pledgeId
                                ? "Receiving..."
                                : online
                                  ? "Receive pledge"
                                  : "Offline"}
                            </button>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {pledge.createdAt
                            ? new Date(pledge.createdAt).toLocaleString()
                            : "Created date unavailable"}
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      {showNeedModal && (
        <NeedEditorModal
          initialData={editingNeed}
          onClose={closeNeedModal}
          onSave={handleSaveNeed}
          saving={submitting}
        />
      )}
    </>
  );
}
