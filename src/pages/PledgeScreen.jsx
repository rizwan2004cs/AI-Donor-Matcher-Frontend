import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../utils/categoryColors";

export default function PledgeScreen() {
  const { needId } = useParams();
  const navigate = useNavigate();
  const [need, setNeed] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .get(`/api/needs/${needId}`)
      .then((res) => setNeed(res.data))
      .catch((err) =>
        setError(err.response?.data?.message || "Failed to load need")
      )
      .finally(() => setLoading(false));
  }, [needId]);

  const remaining = need
    ? need.quantityRequired - need.quantityPledged
    : 0;

  const increment = () => setQty((q) => Math.min(q + 1, remaining));
  const decrement = () => setQty((q) => Math.max(q - 1, 1));

  const onSubmit = async () => {
    if (!navigator.onLine) {
      alert("You are offline. This action requires an internet connection.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/api/pledges", { needId, quantity: qty });
      navigate(`/delivery/${res.data.pledgeId}`, { state: res.data });
    } catch (err) {
      setError(err.response?.data?.message || "Pledge failed");
    } finally {
      setSubmitting(false);
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
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md space-y-5">
          <h1 className="text-xl font-bold text-slate-900">
            Pledge to {need.ngoName}
          </h1>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Item:</span>
              <span className="font-medium">{need.itemName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="flex items-center gap-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{
                    backgroundColor:
                      CATEGORY_COLORS[need.category] || "#6B7280",
                  }}
                />
                {CATEGORY_LABELS[need.category] || need.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Urgency:</span>
              <span
                className={
                  need.urgency === "URGENT"
                    ? "text-red-500 font-medium"
                    : "text-slate-700"
                }
              >
                {need.urgency === "URGENT" ? "🔴 Urgent" : "● Normal"}
              </span>
            </div>
          </div>

          <hr />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total needed:</span>
              <span>{need.quantityRequired}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pledged by others:</span>
              <span>{need.quantityPledged}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Still remaining:</span>
              <span>{remaining}</span>
            </div>
          </div>

          <hr />

          <div>
            <p className="text-sm text-slate-600 mb-2">
              How many can you donate?
            </p>
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={decrement}
                className="w-10 h-10 rounded-full border text-lg font-bold hover:bg-white/40 transition-all duration-200"
              >
                −
              </button>
              <span className="text-2xl font-bold w-12 text-center">
                {qty}
              </span>
              <button
                onClick={increment}
                className="w-10 h-10 rounded-full border text-lg font-bold hover:bg-white/40 transition-all duration-200"
              >
                +
              </button>
              <span className="text-xs text-slate-400">(max: {remaining})</span>
            </div>
          </div>

          <button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 disabled:opacity-50"
          >
            {submitting ? "Pledging..." : "Confirm Pledge"}
          </button>

          <p className="text-xs text-slate-400 text-center">
            A confirmation email will be sent to you with NGO address and
            contact.
          </p>
        </div>
      </div>
    </>
  );
}
