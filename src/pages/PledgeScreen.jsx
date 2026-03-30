import { useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../utils/categoryColors";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { saveDeliverySession } from "../utils/deliverySession";

export default function PledgeScreen() {
  const { needId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const need = useMemo(() => location.state || null, [location.state]);
  const remaining = need
    ? Math.max(Number(need.quantityRequired || 0) - Number(need.quantityPledged || 0), 0)
    : 0;

  const clampQuantity = (value) => {
    if (remaining <= 0) return 0;
    return Math.max(1, Math.min(Number(value || 1), remaining));
  };

  const increment = () => setQty((current) => clampQuantity(current + 1));
  const decrement = () => setQty((current) => clampQuantity(current - 1));

  const onSubmit = async () => {
    if (!need) return;
    if (!online) {
      setError("You are offline. This action requires an internet connection.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post("/api/pledges", {
        needId: Number(needId),
        quantity: qty,
      });

      const deliveryState = {
        ...response.data,
        quantity: qty,
        itemName: need.itemName,
        category: need.category,
        ngoName: need.ngoName,
      };

      saveDeliverySession(response.data.pledgeId, deliveryState);
      navigate(`/delivery/${response.data.pledgeId}`, { state: deliveryState });
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Pledge failed"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!need) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-lg space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Pledge Details Unavailable</h1>
            <p className="text-sm text-slate-600">
              This screen currently depends on need details being passed from the NGO
              profile because the backend has not yet confirmed `GET /api/needs/{needId}`.
            </p>
            <button
              onClick={() => navigate("/map")}
              className="bg-teal-600 text-white py-2.5 px-5 rounded-xl font-medium hover:bg-teal-700 transition-all duration-200"
            >
              Back to Discovery Map
            </button>
          </div>
        </div>
      </>
    );
  }

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
                    backgroundColor: CATEGORY_COLORS[need.category] || "#6B7280",
                  }}
                />
                {CATEGORY_LABELS[need.category] || need.category}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Urgency:</span>
              <span
                className={
                  need.urgency === "URGENT"
                    ? "text-red-500 font-medium"
                    : "text-slate-700"
                }
              >
                {need.urgency === "URGENT" ? "Urgent" : "Normal"}
              </span>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Total needed:</span>
              <span>{need.quantityRequired}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pledged by others:</span>
              <span>{need.quantityPledged}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>Still remaining:</span>
              <span>{remaining}</span>
            </div>
          </div>

          <hr className="border-slate-200" />

          <div>
            <p className="text-sm text-slate-600 mb-2">
              How many can you donate?
            </p>
            <div className="flex items-center gap-4 justify-center">
              <button
                onClick={decrement}
                disabled={qty <= 1}
                className="w-10 h-10 rounded-full border border-slate-200 text-lg font-bold hover:bg-white/40 transition-all duration-200 disabled:opacity-30"
              >
                -
              </button>
              <input
                type="number"
                value={qty}
                onChange={(event) => setQty(clampQuantity(event.target.value))}
                className="w-20 text-center text-xl font-bold bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl py-2 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                min={1}
                max={remaining}
              />
              <button
                onClick={increment}
                disabled={qty >= remaining}
                className="w-10 h-10 rounded-full border border-slate-200 text-lg font-bold hover:bg-white/40 transition-all duration-200 disabled:opacity-30"
              >
                +
              </button>
              <span className="text-xs text-slate-400">(max: {remaining})</span>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            onClick={onSubmit}
            disabled={submitting || !online || remaining <= 0}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Pledging..."
              : online
                ? `Confirm Pledge (${qty} items)`
                : "Offline"}
          </button>

          <p className="text-xs text-slate-400 text-center">
            A confirmation email will be sent to you with NGO address and contact.
          </p>
        </div>
      </div>
    </>
  );
}
