import { useState } from "react";
import api from "../api/axios";

const REASONS = [
  { value: "FRAUD", label: "Suspected fraud or scam" },
  { value: "INACTIVE", label: "Organisation appears inactive" },
  { value: "MISLEADING", label: "Misleading information" },
  { value: "OTHER", label: "Other" },
];

export default function ReportModal({ ngoId, onClose }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    if (!reason) return;

    setLoading(true);
    setError(null);

    try {
      await api.post(`/api/ngos/${ngoId}/report`, { reason });
      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to submit report."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-lg"
        onClick={(event) => event.stopPropagation()}
      >
        {success ? (
          <>
            <h3 className="font-bold text-lg text-slate-900">Report Submitted</h3>
            <p className="text-sm text-slate-600">
              Thank you. Your report has been sent for admin review.
            </p>
            <button
              onClick={onClose}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200"
            >
              Close
            </button>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-slate-900">Report NGO</h3>
            <p className="text-sm text-slate-500">
              Select the reason that best matches your concern.
            </p>

            <div className="space-y-2">
              {REASONS.map((item) => (
                <label key={item.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="radio"
                    name="reason"
                    value={item.value}
                    checked={reason === item.value}
                    onChange={() => setReason(item.value)}
                  />
                  {item.label}
                </label>
              ))}
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={!reason || loading}
                className="flex-1 py-2 bg-red-500 text-white rounded-xl text-sm disabled:opacity-50 hover:bg-red-600 transition-all duration-200"
              >
                {loading ? "Submitting..." : "Submit Report"}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-2 border border-slate-200 rounded-xl text-sm hover:bg-white/40 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
