import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ImagePlus,
  Lock,
  Package,
  Plus,
  Trash2,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NeedProgressBar from "../components/NeedProgressBar";
import TrustBadge from "../components/TrustBadge";
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "../utils/categoryColors";
import {
  getNgoProfileCompletion,
  normalizeNgoProfile,
} from "../utils/ngoProfile";
import useOnlineStatus from "../hooks/useOnlineStatus";

const MAX_ACTIVE_NEEDS = 5;
const INITIAL_FORM = {
  itemName: "",
  category: "FOOD",
  quantityRequired: 1,
  urgency: "NORMAL",
  description: "",
  expiryDate: "",
};

export default function NgoDashboard() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => normalizeNgoProfile());
  const [needs, setNeeds] = useState([]);
  const [incomingPledgesAvailable, setIncomingPledgesAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);
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

    try {
      await api.get("/api/ngo/my/pledges");
      setIncomingPledgesAvailable(true);
    } catch {
      setIncomingPledgesAvailable(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleAddNeed = async (event) => {
    event.preventDefault();
    if (!online) {
      setError("You are offline. Reconnect before creating a need.");
      return;
    }
    setSubmitting(true);
    setError(null);

    try {
      await api.post("/api/needs", formData);
      setShowAddModal(false);
      setFormData(INITIAL_FORM);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add need.");
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
      setNeeds((current) => current.filter((need) => need.id !== needId));
    } catch (err) {
      setError(err.response?.data?.error || "Failed to delete need.");
    }
  };

  const activeNeeds = needs.filter((need) => need.status !== "FULFILLED");
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
              Review your profile status and manage the active needs already
              supported by the current backend agreement.
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
                    Uses the agreed NGO need endpoints: read, create, and delete.
                  </p>
                </div>

                <button
                  onClick={() => canAddNeed && setShowAddModal(true)}
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
                            <button
                              onClick={() => handleDeleteNeed(need.id)}
                              disabled={!online}
                              className="bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="h-4 w-4" />
                              {online ? "Delete" : "Offline"}
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {!incomingPledgesAvailable && (
              <section className="glass rounded-2xl p-6">
                <h2 className="text-2xl font-semibold text-slate-900">
                  Incoming Pledges
                </h2>
                <p className="text-sm text-slate-600 mt-2">
                  The incoming pledges section is waiting on a backend-confirmed
                  read endpoint and is tracked separately in issue #16.
                </p>
              </section>
            )}
          </div>
        </main>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              Add New Need
            </h3>
            <p className="text-sm text-slate-600 mt-1">
              This form uses the agreed `POST /api/needs` payload.
            </p>

            <form onSubmit={handleAddNeed} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      itemName: event.target.value,
                    }))
                  }
                  className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        category: event.target.value,
                      }))
                    }
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                  >
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Quantity Required
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={formData.quantityRequired}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        quantityRequired: Number(event.target.value),
                      }))
                    }
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        urgency: event.target.value,
                      }))
                    }
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        expiryDate: event.target.value,
                      }))
                    }
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData(INITIAL_FORM);
                  }}
                  className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submitting || !online}
                  className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                >
                  {submitting ? "Saving..." : online ? "Add Need" : "Offline"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
