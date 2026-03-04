import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import NeedProgressBar from "../components/NeedProgressBar";
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from "../utils/categoryColors";
import { Plus, Lock, Check, Trash2, Package, AlertTriangle } from "lucide-react";

const URGENCY_OPTIONS = ["NORMAL", "URGENT"];
const MAX_ACTIVE_NEEDS = 5;

export default function NgoDashboard() {
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
    fetchData();
  }, []);

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
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1F4E79] text-white px-6 py-6">
          <h1 className="text-xl font-bold">NGO Dashboard</h1>
          <p className="text-blue-200 text-sm mt-1">
            Manage your needs & incoming pledges
          </p>
        </div>

        <div className="max-w-3xl mx-auto p-4 space-y-6">
          {/* Active Needs Section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-[#1F4E79]">
                Active Needs ({activeNeeds.length}/{MAX_ACTIVE_NEEDS})
              </h2>
              <button
                onClick={() => canAdd && setShowAddModal(true)}
                disabled={!canAdd}
                className="flex items-center gap-1 bg-[#2E75B6] text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#1F4E79] transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" /> Add Need
              </button>
            </div>

            {!canAdd && (
              <div className="bg-yellow-50 text-yellow-700 text-xs p-2 rounded-lg mb-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Maximum {MAX_ACTIVE_NEEDS} active needs reached. Fulfill or
                delete one to add more.
              </div>
            )}

            {loading && <p className="text-gray-400 text-sm">Loading...</p>}

            {!loading && activeNeeds.length === 0 && (
              <p className="text-gray-400 text-sm py-4 text-center">
                No active needs. Click "Add Need" to create one.
              </p>
            )}

            <div className="space-y-3">
              {activeNeeds.map((need) => (
                <div key={need.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{need.itemName}</p>
                      <p className="text-xs text-gray-500">
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
                          className="text-xs border border-orange-300 text-orange-500 px-2 py-1 rounded flex items-center gap-1 hover:bg-orange-50"
                          title="Lock to stop new pledges"
                        >
                          <Lock className="w-3 h-3" /> Lock
                        </button>
                      )}
                      {need.locked && (
                        <span className="text-xs text-orange-500 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      )}
                      <button
                        onClick={() => deleteNeed(need.id)}
                        className="text-xs border border-red-300 text-red-500 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-50"
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
            <h2 className="font-bold text-[#1F4E79] mb-3">
              Incoming Pledges ({pledges.length})
            </h2>
            {pledges.length === 0 && (
              <p className="text-gray-400 text-sm py-4 text-center">
                No incoming pledges yet.
              </p>
            )}
            <div className="space-y-3">
              {pledges.map((p) => (
                <div
                  key={p.pledgeId}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {p.itemName} × {p.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      From: {p.donorName} • {p.donorEmail}
                    </p>
                    <p className="text-xs text-gray-400">
                      Status: {p.status}
                    </p>
                  </div>
                  {p.status === "DELIVERED" && (
                    <button
                      onClick={() => markFulfilled(p.pledgeId)}
                      className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-green-700 transition"
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
              <h2 className="font-bold text-[#1F4E79] mb-3">
                Fulfilled Needs ({fulfilledNeeds.length})
              </h2>
              <div className="space-y-2">
                {fulfilledNeeds.map((n) => (
                  <div
                    key={n.id}
                    className="bg-white rounded-lg shadow p-3 flex items-center gap-3 opacity-70"
                  >
                    <Package className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{n.itemName}</p>
                      <p className="text-xs text-gray-400">
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-[#1F4E79] mb-4">
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
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent"
                  placeholder="e.g. Rice (5 kg bags)"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Urgency
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) =>
                      setFormData({ ...formData, urgency: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setError(null);
                  }}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-[#2E75B6] text-white py-2 rounded-lg font-semibold hover:bg-[#1F4E79] transition disabled:opacity-50"
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
