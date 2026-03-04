import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../utils/categoryColors";
import { Navigation, X, History, Package } from "lucide-react";

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active"); // 'active' | 'history'
  const [activePledges, setActivePledges] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPledges = async () => {
      try {
        const [activeRes, historyRes] = await Promise.all([
          api.get("/api/pledges/donor/active"),
          api.get("/api/pledges/donor/history"),
        ]);
        setActivePledges(activeRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error("Failed to load pledges", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPledges();
  }, []);

  const cancelPledge = async (pledgeId) => {
    if (!window.confirm("Cancel this pledge?")) return;
    try {
      await api.put(`/api/pledges/${pledgeId}/cancel`);
      setActivePledges((prev) => prev.filter((p) => p.pledgeId !== pledgeId));
    } catch {
      alert("Failed to cancel pledge");
    }
  };

  const statusBadge = (status) => {
    const styles = {
      DELIVERED: "bg-green-100 text-green-700",
      CANCELLED: "bg-red-100 text-red-700",
      EXPIRED: "bg-gray-100 text-gray-500",
      FULFILLED: "bg-blue-100 text-blue-700",
    };
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          styles[status] || "bg-gray-100 text-gray-600"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-[#1F4E79] text-white px-6 py-6">
          <h1 className="text-xl font-bold">Donor Dashboard</h1>
          <p className="text-blue-200 text-sm mt-1">Manage your pledges</p>
        </div>

        {/* Tab bar */}
        <div className="flex border-b bg-white">
          <button
            onClick={() => setTab("active")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition ${
              tab === "active"
                ? "border-[#2E75B6] text-[#2E75B6]"
                : "border-transparent text-gray-500"
            }`}
          >
            <Package className="w-4 h-4 inline mr-1" />
            Active ({activePledges.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition ${
              tab === "history"
                ? "border-[#2E75B6] text-[#2E75B6]"
                : "border-transparent text-gray-500"
            }`}
          >
            <History className="w-4 h-4 inline mr-1" />
            History ({history.length})
          </button>
        </div>

        <div className="p-4 max-w-2xl mx-auto space-y-3">
          {loading && (
            <p className="text-center text-gray-400 py-8">Loading...</p>
          )}

          {/* Active pledges */}
          {!loading && tab === "active" && activePledges.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No active pledges</p>
              <button
                onClick={() => navigate("/map")}
                className="mt-3 text-sm text-[#2E75B6] underline"
              >
                Discover needs on the map →
              </button>
            </div>
          )}

          {!loading &&
            tab === "active" &&
            activePledges.map((p) => (
              <div
                key={p.pledgeId}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[p.category] || "#6B7280",
                    }}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {p.itemName} × {p.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      To: {p.ngoName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/delivery/${p.pledgeId}`)}
                    className="text-xs bg-[#2E75B6] text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-[#1F4E79] transition"
                  >
                    <Navigation className="w-3 h-3" /> Navigate
                  </button>
                  <button
                    onClick={() => cancelPledge(p.pledgeId)}
                    className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-red-50 transition"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ))}

          {/* History */}
          {!loading && tab === "history" && history.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No past pledges yet</p>
            </div>
          )}

          {!loading &&
            tab === "history" &&
            history.map((p) => (
              <div
                key={p.pledgeId}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        CATEGORY_COLORS[p.category] || "#6B7280",
                    }}
                  />
                  <div>
                    <p className="font-medium text-sm">
                      {p.itemName} × {p.quantity}
                    </p>
                    <p className="text-xs text-gray-500">
                      To: {p.ngoName} •{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {statusBadge(p.status)}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}
