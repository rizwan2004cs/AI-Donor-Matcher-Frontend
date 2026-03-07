import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NeedProgressBar from "../components/NeedProgressBar";
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from "../utils/categoryColors";
import { Plus, Lock, Check, Trash2, Package, AlertTriangle } from "lucide-react";

const URGENCY_OPTIONS = ["NORMAL", "URGENT"];
const MAX_ACTIVE_NEEDS = 5;

export default function NgoDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [needs, setNeeds] = useState([]);
  const [pledges, setPledges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    itemName: "",
    category: "FOOD",
    quantityRequired: 1,
    urgency: "NORMAL",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      const [needsRes, pledgesRes] = await Promise.all([
        api.get("/api/needs/ngo"),
        api.get("/api/pledges/ngo/incoming"),
      ]);
      setNeeds(needsRes.data);
      setPledges(pledgesRes.data);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === "NGO" && !user?.profileComplete) {
      navigate("/ngo/complete-profile", { replace: true });
      return;
    }
    fetchData();
  }, [user, navigate]);

  const activeNeeds = needs.filter((n) => n.status === "ACTIVE");
  const fulfilledNeeds = needs.filter((n) => n.status === "FULFILLED");
  const canAdd = activeNeeds.length < MAX_ACTIVE_NEEDS;

  const addNeed = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await api.post("/api/needs", formData);
      setShowAddModal(false);
      setFormData({ itemName: "", category: "FOOD", quantityRequired: 1, urgency: "NORMAL" });
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add need");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteNeed = async (needId) => {
    if (!window.confirm("Delete this need?")) return;
    try {
      await api.delete(`/api/needs/${needId}`);
      setNeeds((prev) => prev.filter((n) => n.id !== needId));
    } catch {
      alert("Failed to delete need");
    }
  };

  const lockNeed = async (needId) => {
    try {
      await api.put(`/api/needs/${needId}/lock`);
      await fetchData();
    } catch {
      alert("Failed to lock need");
    }
  };

  const markFulfilled = async (pledgeId) => {
    try {
      await api.put(`/api/pledges/${pledgeId}/fulfill`);
      await fetchData();
    } catch {
      alert("Failed to mark as fulfilled");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        {/* Header */}
        <div className="glass-nav text-white px-6 py-6">
          <h1 className="text-xl font-bold tracking-tight">NGO Dashboard</h1>
          <p className="text-teal-200 text-sm mt-1">
            Manage your needs & incoming pledges
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {/* Active Needs Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-slate-900">
                Active Needs ({activeNeeds.length}/{MAX_ACTIVE_NEEDS})
              </h2>
              <button
                onClick={() => canAdd && setShowAddModal(true)}
                disabled={!canAdd}
                className="flex items-center gap-1 bg-teal-600 text-white text-sm px-4 py-1.5 rounded-xl hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-40 disabled:cursor-not-allowed font-medium"
              >
                <Plus className="w-4 h-4" /> Add Need
              </button>
            </div>

            {!canAdd && (
              <div className="bg-amber-50 text-amber-700 text-xs p-2.5 rounded-xl mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Maximum {MAX_ACTIVE_NEEDS} active needs reached. Fulfill or
                delete one to add more.
              </div>
            )}

            {loading && <p className="text-slate-400 text-sm">Loading...</p>}

            {!loading && activeNeeds.length === 0 && (
              <p className="text-slate-400 text-sm py-4 text-center">
                No active needs. Click "Add Need" to create one.
              </p>
            )}

            <div className="space-y-3">
              {activeNeeds.map((need) => (
                <div key={need.id} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{need.itemName}</p>
                      <p className="text-xs text-slate-500">
                        {CATEGORY_LABELS[need.category] || need.category}
                        {need.urgency === "URGENT" && (
                          <span className="ml-2 text-red-500">🔴 Urgent</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {!need.locked && (
                        <button
                          onClick={() => lockNeed(need.id)}
                          className="text-xs border border-amber-300 text-amber-600 px-2.5 py-1 rounded-xl flex items-center gap-1 hover:bg-amber-50 transition-all duration-200"
                          title="Lock to stop new pledges"
                        >
                          <Lock className="w-3 h-3" /> Lock
                        </button>
                      )}
                      {need.locked && (
                        <span className="text-xs text-amber-600 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      <button
                        onClick={() => deleteNeed(need.id)}
                        className="text-xs bg-red-50 border border-red-200 text-red-600 px-2.5 py-1 rounded-xl flex items-center gap-1 hover:bg-red-100 transition-all duration-200"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <NeedProgressBar
                    pledged={need.quantityPledged}
                    required={need.quantityRequired}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Incoming Pledges Section */}
          <section>
            <h2 className="font-bold text-slate-900 mb-3">
              Incoming Pledges ({pledges.length})
            </h2>
            {pledges.length === 0 && (
              <p className="text-slate-400 text-sm py-4 text-center">
                No incoming pledges yet.
              </p>
            )}
            <div className="space-y-3">
              {pledges.map((p) => (
                <div
                  key={p.pledgeId}
                  className="glass rounded-2xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {p.itemName} × {p.quantity}
                    </p>
                    <p className="text-xs text-slate-500">
                      From: {p.donorName} • {p.donorEmail}
                    </p>
                    <p className="text-xs text-slate-400">
                      Status: {p.status}
                    </p>
                  </div>
                  {p.status === "DELIVERED" && (
                    <button
                      onClick={() => markFulfilled(p.pledgeId)}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-emerald-700 transition-all duration-200"
                    >
                      <Check className="w-3 h-3" /> Mark Fulfilled
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Fulfilled History */}
          {fulfilledNeeds.length > 0 && (
            <section>
              <h2 className="font-bold text-slate-900 mb-3">
                Fulfilled Needs ({fulfilledNeeds.length})
              </h2>
              <div className="space-y-2">
                {fulfilledNeeds.map((n) => (
                  <div
                    key={n.id}
                    className="glass rounded-2xl p-3 flex items-center gap-3 opacity-70"
                  >
                    <Package className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium">{n.itemName}</p>
                      <p className="text-xs text-slate-400">
                        {CATEGORY_LABELS[n.category]} • Fulfilled{" "}
                        {new Date(n.fulfilledAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      {/* Add Need Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">
              Add New Need
            </h3>
            {error && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}
            <form onSubmit={addNeed} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  value={formData.itemName}
                  onChange={(e) =>
                    setFormData({ ...formData, itemName: e.target.value })
                  }
                  required
                  className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                  placeholder="e.g. Rice (5 kg bags)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                  >
                    {URGENCY_OPTIONS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Quantity Required
                </label>
                <input
                  type="number"
                  min={1}
                  value={formData.quantityRequired}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      quantityRequired: Number(e.target.value),
                    })
                  }
                  className="w-full bg-white/70 border border-slate-200 rounded-xl px-3 py-2.5 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                  className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Need"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
