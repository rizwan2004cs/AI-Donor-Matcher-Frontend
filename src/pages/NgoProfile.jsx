import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import ReportModal from "../components/ReportModal";
import TrustBadge from "../components/TrustBadge";
import NeedProgressBar from "../components/NeedProgressBar";
import { CATEGORY_COLORS } from "../utils/categoryColors";
import { ArrowLeft } from "lucide-react";

function titleCase(value) {
  if (!value) return "";

  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString();
}

export default function NgoProfile() {
  const { ngoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ngo, setNgo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    api
      .get(`/api/ngos/${ngoId}`)
      .then((res) => setNgo(res.data))
      .catch((err) =>
        setError(
          err.response?.data?.error ||
            err.response?.data?.message ||
            "Failed to load NGO profile"
        )
      )
      .finally(() => setLoading(false));
  }, [ngoId]);

  const activeNeeds = useMemo(
    () => (Array.isArray(ngo?.activeNeeds) ? ngo.activeNeeds : []),
    [ngo]
  );
  const fulfilledHistory = useMemo(
    () => (Array.isArray(ngo?.fulfilledHistory) ? ngo.fulfilledHistory : []),
    [ngo]
  );

  const handlePledge = (need) => {
    if (!user) {
      navigate("/login");
      return;
    }

    navigate(`/pledge/${need.id}`, {
      state: {
        ...need,
        ngoId: ngo.id,
        ngoName: ngo.name,
      },
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-slate-400">Loading...</div>
      </>
    );
  }

  if (error || !ngo) {
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-red-500">
          {error || "NGO profile unavailable."}
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        <main className="max-w-3xl mx-auto p-6 space-y-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>

          <div className="glass rounded-2xl p-6">
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
                {typeof ngo.trustScore === "number" && ngo.trustTier && (
                  <TrustBadge
                    score={ngo.trustScore}
                    label={titleCase(ngo.trustTier)}
                  />
                )}
                {ngo.address && (
                  <p className="text-sm text-slate-500 mt-2">{ngo.address}</p>
                )}
                {ngo.contactEmail && (
                  <p className="text-sm text-slate-500">{ngo.contactEmail}</p>
                )}
                {ngo.verifiedAt && (
                  <p className="text-xs text-slate-400 mt-1">
                    Verified since {formatDate(ngo.verifiedAt)}
                  </p>
                )}
              </div>
            </div>

            {ngo.description && (
              <p className="text-sm text-slate-700 mt-4">{ngo.description}</p>
            )}
          </div>

          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-3">Active Needs</h2>
            {activeNeeds.length === 0 ? (
              <p className="text-sm text-slate-500">
                The current backend response does not expose active needs for this NGO
                yet. Once that data is included, this page will render the shared
                progress bars here.
              </p>
            ) : (
              <div className="space-y-4">
                {activeNeeds.map((need) => {
                  const remaining = need.quantityRequired - need.quantityPledged;

                  return (
                    <div key={need.id} className="glass-subtle rounded-2xl p-4 space-y-2">
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
                            Urgent
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
                        onClick={() => handlePledge(need)}
                        className="bg-teal-600 text-white text-sm px-4 py-1.5 rounded-xl hover:bg-teal-700 transition-all duration-200"
                      >
                        Pledge This Item
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {fulfilledHistory.length > 0 && (
            <section className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-3 text-slate-900">Past Fulfilled Needs</h2>
              <div className="space-y-2">
                {fulfilledHistory.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-sm text-slate-600"
                  >
                    <span className="text-green-500">OK</span>
                    <span>
                      {item.itemName} ({item.quantity})
                    </span>
                    <span className="ml-auto text-slate-400">
                      {item.fulfilledDate}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="border-t border-slate-200 pt-4">
            <button
              onClick={() => setShowReportModal(true)}
              className="text-sm text-slate-500 hover:text-red-500 transition-all duration-200"
            >
              Report this organisation
            </button>
          </div>
        </main>
      </div>

      {showReportModal && (
        <ReportModal ngoId={ngo.id} onClose={() => setShowReportModal(false)} />
      )}
    </>
  );
}