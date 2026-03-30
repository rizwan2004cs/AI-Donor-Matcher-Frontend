import { useEffect, useState } from "react";
import { CATEGORY_OPTIONS } from "../utils/categoryColors";

const EMPTY_FORM = {
  itemName: "",
  category: "FOOD",
  quantityRequired: 1,
  urgency: "NORMAL",
  description: "",
  expiryDate: "",
};

function createInitialForm(initialData) {
  if (!initialData) return EMPTY_FORM;

  return {
    itemName: initialData.itemName || "",
    category: initialData.category || "FOOD",
    quantityRequired: Number(initialData.quantityRequired || 1),
    urgency: initialData.urgency || "NORMAL",
    description: initialData.description || "",
    expiryDate: initialData.expiryDate || "",
  };
}

export default function NeedEditorModal({
  initialData,
  onClose,
  onSave,
  saving,
}) {
  const [formData, setFormData] = useState(() => createInitialForm(initialData));

  useEffect(() => {
    setFormData(createInitialForm(initialData));
  }, [initialData]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900">
          {initialData ? "Edit Need" : "Add New Need"}
        </h3>
        <p className="text-sm text-slate-600 mt-1">
          Uses the agreed need payload shape for create and update.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Item Name
            </label>
            <input
              type="text"
              value={formData.itemName}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  itemName: event.target.value,
                }))
              }
              className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    category: event.target.value,
                  }))
                }
                className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
              >
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Quantity Required
              </label>
              <input
                type="number"
                min={1}
                value={formData.quantityRequired}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    quantityRequired: Math.max(Number(event.target.value || 1), 1),
                  }))
                }
                className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Urgency
              </label>
              <select
                value={formData.urgency}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    urgency: event.target.value,
                  }))
                }
                className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
              >
                <option value="NORMAL">Normal</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    expiryDate: event.target.value,
                  }))
                }
                className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
            >
              {saving ? "Saving..." : initialData ? "Save Changes" : "Add Need"}
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
