import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CircleCheckBig,
  ImagePlus,
  Lock,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NeedEditorModal from "../components/NeedEditorModal";
import NeedProgressBar from "../components/NeedProgressBar";
import TrustBadge from "../components/TrustBadge";
import { CATEGORY_LABELS } from "../utils/categoryColors";
import {
  getNgoProfileCompletion,
  normalizeNgoProfile,
} from "../utils/ngoProfile";
import useOnlineStatus from "../hooks/useOnlineStatus";

const MAX_ACTIVE_NEEDS = 5;

export default function NgoDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => normalizeNgoProfile());
  const [needs, setNeeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNeedModal, setShowNeedModal] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const online = useOnlineStatus();

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const [profileRes, needsRes] = await Promise.all([
        api.get("/api/ngo/my/profile"),
        api.get("/api/ngo/my/needs"),
      ]);

      const normalizedProfile = normalizeNgoProfile(profileRes.data);
      const completion = getNgoProfileCompletion(normalizedProfile);

      setProfile(normalizedProfile);
      setNeeds(Array.isArray(needsRes.data) ? needsRes.data : []);

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

  const handleFulfillNeed = async (needId) => {
    if (!online) {
      setError("You are offline. Reconnect before marking a need as fulfilled.");
      return;
    }
    if (!window.confirm("Mark this need as fulfilled? This action cannot be undone.")) {
      return;
    }

    try {
      await api.patch(`/api/needs/${needId}/fulfill`);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to mark need as fulfilled.");
    }
  };

  const activeNeeds = needs.filter(
    (need) => !["FULFILLED", "EXPIRED"].includes(need.status)
  );
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
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              NGO Dashboard
            </h1>
            <p className="text-slate-600 mt-1">
              Manage the agreed need workflow while keeping unsupported incoming
              pledges behind an explicit backend dependency.
            </p>
          </header>

          <div className="mt-8 space-y-6">
            <section className="glass rounded-2xl p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                    Organization
                  </p>
                  <h2 className="text-2xl font-semibold text-slate-900 mt-1">
                    {profile.name || "Your NGO"}
                  </h2>

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

            <section className="glass rounded-2xl p-6">
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
                    const pledged = Number(need.quantityPledged ?? 0);
                    const required = Number(need.quantityRequired ?? 0);
                    const remaining = Math.max(required - pledged, 0);
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
                              {pledged} pledged / {required} required
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
                            <button
                              onClick={() => handleFulfillNeed(need.id)}
                              disabled={!online}
                              className="bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <CircleCheckBig className="h-4 w-4" />
                              {online ? "Mark as Fulfilled" : "Offline"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <section className="glass rounded-2xl p-6">
              <h2 className="text-2xl font-semibold text-slate-900">
                Incoming Pledges
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                This section is intentionally blocked until the backend confirms
                `GET /api/ngo/my/pledges` and its response shape. The dependency
                is tracked in issue #16.
              </p>
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
