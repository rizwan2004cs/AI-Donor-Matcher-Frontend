import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import NeedProgressBar from "../components/NeedProgressBar";
import { CATEGORY_COLORS } from "../utils/categoryColors";
import useOnlineStatus from "../hooks/useOnlineStatus";

const REPORT_REASONS = ["FRAUD", "INACTIVE", "MISLEADING", "OTHER"];

export default function NgoProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reporting, setReporting] = useState(false);
  const online = useOnlineStatus();

  useEffect(() => {
    api
      .get(`/api/ngos/${id}`)
      .then((res) => setNgo(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load NGO profile")
      )
      .finally(() => setLoading(false));
  }, [id]);

  const handlePledge = (needId) => {
    if (!user) return navigate("/login");
    if (!user.emailVerified) return;
    navigate(`/pledge/${needId}`);
  };

  const submitReport = async () => {
    if (!reportReason) return;
    if (!online) {
      alert("You are offline. Reconnect before sending a report.");
      return;
    }
    setReporting(true);
    try {
      await api.post(`/api/ngos/${id}/report`, { reason: reportReason });
      setShowReport(false);
      setReportReason("");
    } catch {
      // silently fail for now
    } finally {
      setReporting(false);
    }
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-slate-400">Loading...</div>
      </>
    );
  if (error)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-red-500">{error}</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          {ngo.photoUrl ? (
            <img
              src={ngo.photoUrl}
              alt={ngo.name}
              className="w-20 h-20 rounded-2xl object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">
              {ngo.name?.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{ngo.name}</h1>
            <TrustBadge score={ngo.trustScore} label={ngo.trustLabel} />
            <p className="text-sm text-slate-500 mt-1">📍 {ngo.address}</p>
            <p className="text-sm text-slate-500">✉ {ngo.contactEmail}</p>
            {ngo.verifiedSince && (
              <p className="text-xs text-slate-400 mt-1">
                Verified since: {ngo.verifiedSince}
              </p>
            )}
          </div>
        </div>

        {/* About */}
        {ngo.description && (
          <div className="glass rounded-2xl p-4">
            <p className="text-sm text-slate-700">{ngo.description}</p>
          </div>
        )}

        {/* Active Needs */}
        <div>
          <h2 className="text-lg font-bold mb-3">Active Needs</h2>
          {ngo.activeNeeds?.length === 0 ? (
            <p className="text-sm text-slate-400">
              No active needs right now.
            </p>
          ) : (
            <div className="space-y-4">
              {ngo.activeNeeds?.map((need) => {
                const remaining =
                  need.quantityRequired - need.quantityPledged;
                return (
                  <div
                    key={need.id}
                    className="glass rounded-2xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            CATEGORY_COLORS[need.category] || "#6B7280",
                        }}
                      />
                      <span className="font-medium">{need.itemName}</span>
                      {need.urgency === "URGENT" && (
                        <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                          🔴 Urgent
                        </span>
                      )}
                      {need.expiryDate && (
                        <span className="text-xs text-slate-400 ml-auto">
                          ⏰ Expires: {need.expiryDate}
                        </span>
                      )}
                    </div>
                    <NeedProgressBar
                      pledged={need.quantityPledged}
                      required={need.quantityRequired}
                    />
                    <p className="text-xs text-slate-500">
                      {remaining} remaining of {need.quantityRequired}
                    </p>
                    <button
                      onClick={() => handlePledge(need.id)}
                      disabled={
                        user && !user.emailVerified
                      }
                      title={
                        user && !user.emailVerified
                          ? "Verify your email to pledge."
                          : ""
                      }
                      className="bg-teal-600 text-white text-sm px-4 py-1.5 rounded-xl hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Pledge This Item
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Fulfilled History */}
        {ngo.fulfilledHistory?.length > 0 && (
          <div>
            <h2 className="text-lg font-bold mb-3">Past Fulfilled Needs</h2>
            <div className="space-y-2">
              {ngo.fulfilledHistory.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 text-sm text-slate-600"
                >
                  <span className="text-green-500">✓</span>
                  <span>
                    {item.itemName} ({item.quantity})
                  </span>
                  <span className="ml-auto text-slate-400">
                    {item.fulfilledDate}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report button */}
        <div className="border-t pt-4">
          <button
            onClick={() => setShowReport(true)}
            className="text-sm text-slate-400 hover:text-red-500 transition-all duration-200"
          >
            ⚑ Report this organisation
          </button>
        </div>

        {/* Report modal */}
        {showReport && (
          <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-lg">
              <h3 className="font-bold text-lg">Report NGO</h3>
              <div className="space-y-2">
                {REPORT_REASONS.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <input
                      type="radio"
                      name="reason"
                      value={r}
                      checked={reportReason === r}
                      onChange={(e) => setReportReason(e.target.value)}
                    />
                    {r.charAt(0) + r.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReport(false)}
                  className="flex-1 py-2 border border-slate-200 rounded-xl text-sm hover:bg-white/40 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReport}
                  disabled={reporting || !reportReason || !online}
                  className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm disabled:opacity-50 hover:bg-red-600 transition-all duration-200"
                >
                  {reporting ? "Submitting..." : online ? "Submit Report" : "Offline"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
