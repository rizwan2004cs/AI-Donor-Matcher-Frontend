import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import useOnlineStatus from "../hooks/useOnlineStatus";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Ban,
  RotateCcw,
  FileText,
  Flag,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [reports, setReports] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [tab, setTab] = useState("verify"); // 'verify' | 'reports' | 'ngos'
  const [loading, setLoading] = useState(true);
  const online = useOnlineStatus();

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, verifyRes, reportsRes, ngosRes] = await Promise.all([
          api.get("/api/admin/stats"),
          api.get("/api/admin/verifications/pending"),
          api.get("/api/admin/reports"),
          api.get("/api/admin/ngos"),
        ]);
        setStats(statsRes.data);
        setPendingVerifications(verifyRes.data);
        setReports(reportsRes.data);
        setNgos(ngosRes.data);
      } catch (err) {
        console.error("Failed to load admin data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const approveNgo = async (ngoId) => {
    if (!online) {
      alert("You are offline. Reconnect before approving NGOs.");
      return;
    }
    try {
      await api.put(`/api/admin/verify/${ngoId}/approve`);
      setPendingVerifications((prev) => prev.filter((v) => v.id !== ngoId));
      setStats((s) => s && { ...s, pendingVerifications: s.pendingVerifications - 1 });
    } catch {
      alert("Failed to approve");
    }
  };

  const rejectNgo = async (ngoId) => {
    if (!online) {
      alert("You are offline. Reconnect before rejecting NGOs.");
      return;
    }
    const reason = prompt("Rejection reason:");
    if (!reason) return;
    try {
      await api.put(`/api/admin/verify/${ngoId}/reject`, { reason });
      setPendingVerifications((prev) => prev.filter((v) => v.id !== ngoId));
    } catch {
      alert("Failed to reject");
    }
  };

  const dismissReport = async (reportId) => {
    if (!online) {
      alert("You are offline. Reconnect before dismissing reports.");
      return;
    }
    try {
      await api.put(`/api/admin/reports/${reportId}/dismiss`);
      setReports((prev) => prev.filter((r) => r.id !== reportId));
    } catch {
      alert("Failed to dismiss report");
    }
  };

  const suspendNgo = async (ngoId) => {
    if (!online) {
      alert("You are offline. Reconnect before suspending NGOs.");
      return;
    }
    if (!window.confirm("Suspend this NGO?")) return;
    try {
      await api.put(`/api/admin/ngos/${ngoId}/suspend`);
      setNgos((prev) =>
        prev.map((n) => (n.id === ngoId ? { ...n, suspended: true } : n))
      );
    } catch {
      alert("Failed to suspend");
    }
  };

  const reinstateNgo = async (ngoId) => {
    if (!online) {
      alert("You are offline. Reconnect before reinstating NGOs.");
      return;
    }
    try {
      await api.put(`/api/admin/ngos/${ngoId}/reinstate`);
      setNgos((prev) =>
        prev.map((n) => (n.id === ngoId ? { ...n, suspended: false } : n))
      );
    } catch {
      alert("Failed to reinstate");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        {/* Header */}
        <div className="glass-nav text-white px-6 py-6">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <p className="text-teal-200 text-sm mt-1">
            Platform management & moderation
          </p>
        </div>

        {/* Stats strip */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 max-w-4xl mx-auto">
            <StatCard
              icon={Users}
              label="Total Donors"
              value={stats.totalDonors}
              color="blue"
            />
            <StatCard
              icon={ShieldCheck}
              label="Verified NGOs"
              value={stats.verifiedNgos}
              color="green"
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Verif."
              value={stats.pendingVerifications}
              color="yellow"
            />
            <StatCard
              icon={Flag}
              label="Open Reports"
              value={stats.openReports}
              color="red"
            />
          </div>
        )}

        {/* Tab bar */}
        <div className="flex border-b glass-subtle max-w-4xl mx-auto rounded-t-xl">
          {[
            { id: "verify", label: "Verifications", count: pendingVerifications.length },
            { id: "reports", label: "Reports", count: reports.length },
            { id: "ngos", label: "NGO Management", count: ngos.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-all duration-200 ${
                tab === t.id
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="max-w-4xl mx-auto p-4 space-y-3">
          {loading && (
            <p className="text-center text-slate-400 py-8">Loading...</p>
          )}

          {/* Verification Queue */}
          {!loading && tab === "verify" && (
            <>
              {pendingVerifications.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                  No pending verifications.
                </p>
              )}
              {pendingVerifications.map((v) => (
                <div
                  key={v.id}
                  className="glass rounded-2xl p-4 flex items-start justify-between"
                >
                  <div className="flex items-start gap-3">
                    {v.profilePhotoUrl ? (
                      <img
                        src={v.profilePhotoUrl}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-400">
                        <Users className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {v.organizationName}
                      </p>
                      <p className="text-xs text-slate-500">{v.email}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {v.address}
                      </p>
                      {v.verificationDocUrl && (
                        <a
                          href={v.verificationDocUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-teal-600 underline flex items-center gap-1 mt-1"
                        >
                          <FileText className="w-3 h-3" /> View Document
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => approveNgo(v.id)}
                      disabled={!online}
                      className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CheckCircle className="w-3 h-3" /> {online ? "Approve" : "Offline"}
                    </button>
                    <button
                      onClick={() => rejectNgo(v.id)}
                      disabled={!online}
                      className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <XCircle className="w-3 h-3" /> {online ? "Reject" : "Offline"}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Reports Queue */}
          {!loading && tab === "reports" && (
            <>
              {reports.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                  No open reports.
                </p>
              )}
              {reports.map((r) => (
                <div
                  key={r.id}
                  className={`glass rounded-2xl p-4 ${
                    r.reportCount >= 3 ? "border-l-4 border-red-500" : ""
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-sm flex items-center gap-2">
                        {r.ngoName}
                        {r.reportCount >= 3 && (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                            ⚠ {r.reportCount} reports
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        Reason: {r.reason}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Reported by: {r.reporterEmail} •{" "}
                        {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => suspendNgo(r.ngoId)}
                        disabled={!online}
                        className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Ban className="w-3 h-3" /> {online ? "Suspend" : "Offline"}
                      </button>
                      <button
                        onClick={() => dismissReport(r.id)}
                        disabled={!online}
                        className="text-xs border border-slate-300 text-slate-600 px-3 py-1.5 rounded-xl hover:bg-white/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {online ? "Dismiss" : "Offline"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* NGO Management */}
          {!loading && tab === "ngos" && (
            <>
              {ngos.length === 0 && (
                <p className="text-center text-slate-400 py-8">
                  No NGOs registered yet.
                </p>
              )}
              {ngos.map((n) => (
                <div
                  key={n.id}
                  className="glass rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {n.profilePhotoUrl ? (
                      <img
                        src={n.profilePhotoUrl}
                        alt=""
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs">
                        NGO
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-sm">
                        {n.organizationName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {n.email} •{" "}
                        <span
                          className={
                            n.verified ? "text-green-600" : "text-yellow-600"
                          }
                        >
                          {n.verified ? "Verified" : "Unverified"}
                        </span>
                        {n.suspended && (
                          <span className="text-red-500 ml-1">• Suspended</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div>
                    {n.suspended ? (
                      <button
                        onClick={() => reinstateNgo(n.id)}
                        disabled={!online}
                        className="text-xs border border-emerald-400 text-emerald-600 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-emerald-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <RotateCcw className="w-3 h-3" /> {online ? "Reinstate" : "Offline"}
                      </button>
                    ) : (
                      <button
                        onClick={() => suspendNgo(n.id)}
                        disabled={!online}
                        className="text-xs border border-red-300 text-red-500 px-3 py-1.5 rounded-xl flex items-center gap-1 hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Ban className="w-3 h-3" /> {online ? "Suspend" : "Offline"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  const colorClasses = {
    blue: "bg-teal-50 text-teal-700",
    green: "bg-emerald-50 text-emerald-700",
    yellow: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-2xl p-4 backdrop-blur-sm ${colorClasses[color] || colorClasses.blue}`}>
      <Icon className="w-5 h-5 mb-1 opacity-70" />
      <p className="text-2xl font-bold">{value ?? "–"}</p>
      <p className="text-xs opacity-70">{label}</p>
    </div>
  );
}
