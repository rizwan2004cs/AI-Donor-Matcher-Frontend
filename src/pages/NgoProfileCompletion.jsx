import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  CheckCircle2,
  Circle,
  ImagePlus,
  Mail,
  Phone,
  Save,
  Shapes,
  Type,
} from "lucide-react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";
import { CATEGORY_OPTIONS } from "../utils/categoryColors";
import {
  NGO_PROFILE_FIELDS,
  getNgoProfileCompletion,
  normalizeNgoProfile,
} from "../utils/ngoProfile";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { useTour } from "../tour/TourContext";
import { queuePendingTour, takePendingTour, TOUR_IDS } from "../tour/tours";

const FIELD_ICONS = {
  name: Building2,
  address: Type,
  contactEmail: Mail,
  contactPhone: Phone,
  description: Type,
  categoryOfWork: Shapes,
};

const EMPTY_FORM = {
  name: "",
  address: "",
  contactEmail: "",
  contactPhone: "",
  description: "",
  categoryOfWork: "",
};

export default function NgoProfileCompletion() {
  const navigate = useNavigate();
  const { activeTourId, startTour } = useTour();
  const [profile, setProfile] = useState(() => normalizeNgoProfile());
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const online = useOnlineStatus();

  const completion = getNgoProfileCompletion(form);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/api/ngo/my/profile");
      const normalized = normalizeNgoProfile(res.data);
      setProfile(normalized);
      setForm({
        name: normalized.name,
        address: normalized.address,
        contactEmail: normalized.contactEmail,
        contactPhone: normalized.contactPhone,
        description: normalized.description,
        categoryOfWork: normalized.categoryOfWork,
      });
    } catch (err) {
      setError(err.response?.data?.error || "Failed to load NGO profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    if (activeTourId || !takePendingTour(TOUR_IDS.FULL_NGO)) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      startTour(TOUR_IDS.FULL_NGO);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [activeTourId, startTour]);

  const handleChange = ({ target: { name, value } }) => {
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    if (!online) {
      setError("You are offline. Reconnect before saving profile details.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      await api.put("/api/ngo/my/profile", form);
      await loadProfile();
      setMessage("Profile details saved.");

      if (getNgoProfileCompletion(form).isComplete) {
        queuePendingTour(TOUR_IDS.NGO_DASHBOARD);
        navigate("/ngo/dashboard");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async ({ target }) => {
    const file = target.files?.[0];

    if (!file) return;
    if (!online) {
      setError("You are offline. Reconnect before uploading a profile photo.");
      target.value = "";
      return;
    }

    setUploading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/api/ngo/my/photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setProfile((current) => ({ ...current, photoUrl: res.data?.url ?? "" }));
      setMessage("Profile photo updated.");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to upload profile photo.");
    } finally {
      setUploading(false);
      target.value = "";
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
    <div className="min-h-screen page-watermark">
          <main className="max-w-4xl mx-auto px-6 py-12">
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {(saving || uploading) && (
        <LoadingOverlay
          message={
            saving
              ? "Saving profile and locating your NGO..."
              : "Uploading NGO photo..."
          }
        />
      )}
    <div className="min-h-screen page-watermark">
        <main className="max-w-4xl mx-auto px-6 py-8">
          <header>
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Complete NGO Profile
            </h1>
            <p className="text-slate-600 mt-1">
              Finish your organization details using the current frontend-backend
              agreement fields before continuing to the dashboard.
            </p>
          </header>

          <div className="mt-8 space-y-6">
            <section className="glass rounded-2xl p-6" data-tour-id="ngo-profile-progress">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Profile Progress
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    {completion.filledCount} of {completion.totalCount} required
                    fields filled
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-teal-700">
                    {completion.percent}%
                  </p>
                  <p className="text-xs text-slate-500">Completion</p>
                </div>
              </div>

              <div className="mt-4 w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-teal-600 h-3 rounded-full transition-all duration-200"
                  style={{ width: `${completion.percent}%` }}
                />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {NGO_PROFILE_FIELDS.map(({ key, label }) => {
                  const complete = Boolean(form[key]?.trim());
                  const Icon = FIELD_ICONS[key] || Type;

                  return (
                    <div
                      key={key}
                      className="glass-subtle rounded-2xl px-4 py-3 flex items-center gap-3"
                    >
                      {complete ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300" />
                      )}
                      <Icon className="h-4 w-4 text-slate-500" />
                      <span className="text-sm text-slate-700">{label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="glass rounded-2xl p-6" data-tour-id="ngo-profile-photo">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Profile Photo
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Upload a profile image using the agreed `file` multipart field.
                  </p>
                </div>

                <div className="h-20 w-20 rounded-2xl bg-white/70 border border-slate-200 overflow-hidden flex items-center justify-center">
                  {profile.photoUrl ? (
                    <img
                      src={profile.photoUrl}
                      alt="NGO profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ImagePlus className="h-8 w-8 text-slate-300" />
                  )}
                </div>
              </div>

              <label
                className={`mt-4 inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 ${
                  online
                    ? "cursor-pointer hover:bg-slate-50"
                    : "cursor-not-allowed opacity-50"
                }`}
              >
                <ImagePlus className="h-4 w-4" />
                <span>
                  {uploading ? "Uploading..." : online ? "Upload Photo" : "Offline"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploading || !online}
                  className="hidden"
                />
              </label>
            </section>

            <section className="glass rounded-2xl p-6" data-tour-id="ngo-profile-form">
              <h2 className="text-2xl font-semibold text-slate-900">
                Organization Details
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                These fields are saved with the agreement field names, including
                `categoryOfWork`.
              </p>

              <form onSubmit={handleSave} className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Organization Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Email
                    </label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={form.contactEmail}
                      onChange={handleChange}
                      className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Contact Phone
                    </label>
                    <input
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleChange}
                      className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Category of Work
                  </label>
                  <select
                    name="categoryOfWork"
                    value={form.categoryOfWork}
                    onChange={handleChange}
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:outline-none transition-all duration-200"
                    required
                  >
                    <option value="">Select a category</option>
                    {CATEGORY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
                {message && <p className="text-sm text-emerald-600">{message}</p>}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={saving || !online}
                    data-tour-id="ngo-profile-save"
                    className="bg-teal-600 text-white hover:bg-teal-700 rounded-xl px-5 py-2.5 font-medium transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50 inline-flex items-center justify-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{saving ? "Saving..." : "Save Profile"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/ngo/dashboard")}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl px-5 py-2.5 font-medium transition-all duration-200"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </form>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
