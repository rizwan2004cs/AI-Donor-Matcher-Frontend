import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import TrustBadge from "../components/TrustBadge";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "../utils/categoryColors";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { saveDeliverySession } from "../utils/deliverySession";

function formatTrustTier(value) {
  if (!value) return "New";

  return value
    .toString()
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeNeedDetail(need) {
  if (!need) return null;

  return {
    id: need.id,
    ngoId: need.ngoId ?? null,
    ngoName: need.ngoName || "NGO destination",
    ngoAddress: need.ngoAddress || "",
    ngoPhotoUrl: need.ngoPhotoUrl || "",
    ngoTrustScore:
      typeof need.ngoTrustScore === "number" ? need.ngoTrustScore : null,
    ngoTrustTier: need.ngoTrustTier || "",
    category: need.category || "OTHER",
    itemName: need.itemName || "Item unavailable",
    description: need.description || "",
    quantityRequired: Number(need.quantityRequired || 0),
    quantityPledged: Number(need.quantityPledged || 0),
    quantityRemaining:
      typeof need.quantityRemaining === "number"
        ? Number(need.quantityRemaining)
        : Math.max(
            Number(need.quantityRequired || 0) - Number(need.quantityPledged || 0),
            0
          ),
    urgency: need.urgency || "NORMAL",
    status: need.status || "",
  };
}

export default function PledgeScreen() {
  const { needId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [need, setNeed] = useState(() => normalizeNeedDetail(location.state));
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(!location.state);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state) {
      setNeed(normalizeNeedDetail(location.state));
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadNeed = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get(`/api/needs/${needId}`);
        if (!cancelled) {
          setNeed(normalizeNeedDetail(response.data));
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              err.response?.data?.message ||
              "Failed to load need details."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadNeed();

    return () => {
      cancelled = true;
    };
  }, [location.state, needId]);

  const remaining = useMemo(() => {
    if (!need) return 0;
    return Math.max(Number(need.quantityRemaining || 0), 0);
  }, [need]);

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

  if (loading) {
    return (
      <>
        <Navbar />
    <div className="min-h-screen page-watermark flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!need) {
    return (
      <>
        <Navbar />
    <div className="min-h-screen page-watermark flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-8 w-full max-w-lg space-y-4">
            <h1 className="text-xl font-bold text-slate-900">Pledge Details Unavailable</h1>
            <p className="text-sm text-slate-600">
              {error || "The selected need could not be loaded."}
            </p>
            <button
              onClick={() => navigate("/")}
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
    <div className="min-h-screen page-watermark flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md space-y-5">
          <h1 className="text-xl font-bold text-slate-900">
            Pledge to {need.ngoName}
          </h1>

          {typeof need.ngoTrustScore === "number" && need.ngoTrustTier && (
            <TrustBadge
              score={need.ngoTrustScore}
              label={formatTrustTier(need.ngoTrustTier)}
            />
          )}

          {need.description && (
            <p className="text-sm text-slate-600">{need.description}</p>
          )}

          <div data-tour-id="pledge-item-details" className="space-y-2 text-sm">
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
                  ["URGENT", "HIGH"].includes(need.urgency)
                    ? "text-red-500 font-medium"
                    : "text-slate-700"
                }
              >
                {["URGENT", "HIGH"].includes(need.urgency) ? "Urgent" : "Normal"}
              </span>
            </div>
            {need.status && (
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="text-slate-700">{need.status}</span>
              </div>
            )}
          </div>

          <hr className="border-slate-200" />

          <div data-tour-id="pledge-quantity-summary" className="space-y-2 text-sm">
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
            <div data-tour-id="pledge-quantity-picker" className="flex items-center gap-4 justify-center">
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
            data-tour-id="pledge-confirm-btn"
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
