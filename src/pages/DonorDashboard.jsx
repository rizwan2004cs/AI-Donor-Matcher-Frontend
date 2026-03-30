import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../utils/categoryColors";
import { Navigation, X, History, Package } from "lucide-react";
import useOnlineStatus from "../hooks/useOnlineStatus";

export default function DonorDashboard() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("active"); // 'active' | 'history'
  const [activePledges, setActivePledges] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const online = useOnlineStatus();

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
    if (!online) {
      alert("You are offline. Reconnect before cancelling a pledge.");
      return;
    }
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
      DELIVERED: "bg-emerald-100 text-emerald-700",
      CANCELLED: "bg-red-100 text-red-700",
      EXPIRED: "bg-slate-100 text-slate-500",
      FULFILLED: "bg-teal-100 text-teal-700",
    };
    return (
      <span
        className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
          styles[status] || "bg-slate-100 text-slate-600"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        {/* Header */}
        <div className="glass-nav text-white px-6 py-6">
          <h1 className="text-xl font-bold tracking-tight">Donor Dashboard</h1>
          <p className="text-teal-200 text-sm mt-1">Manage your pledges</p>
        </div>

        {/* Tab bar */}
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

        <div className="p-4 max-w-2xl mx-auto space-y-3">
          {loading && (
            <p className="text-center text-slate-400 py-8">Loading...</p>
          )}

          {/* Active pledges */}
          {!loading && tab === "active" && activePledges.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No active pledges</p>
              <button
                onClick={() => navigate("/map")}
                className="mt-3 text-sm text-teal-600 font-medium hover:text-teal-700"
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
                className="glass rounded-2xl p-4 flex items-center justify-between"
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
                    <p className="text-xs text-slate-500">
                      To: {p.ngoName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate(`/delivery/${p.pledgeId}`)}
                    className="text-xs bg-teal-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-teal-700 transition-all duration-200"
                  >
                    <Navigation className="w-3 h-3" /> Navigate
                  </button>
                  <button
                    onClick={() => cancelPledge(p.pledgeId)}
                    disabled={!online}
                    className="text-xs bg-red-50 border border-red-200 text-red-600 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-red-100 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-3 h-3" /> {online ? "Cancel" : "Offline"}
                  </button>
                </div>
              </div>
            ))}

          {/* History */}
          {!loading && tab === "history" && history.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <History className="w-12 h-12 mx-auto mb-2 opacity-40" />
              <p>No past pledges yet</p>
            </div>
          )}

          {!loading &&
            tab === "history" &&
            history.map((p) => (
              <div
                key={p.pledgeId}
                className="glass rounded-2xl p-4 flex items-center justify-between"
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
                    <p className="text-xs text-slate-500">
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
