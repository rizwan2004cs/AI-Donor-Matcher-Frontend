import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import {
  CheckCircle,
  Circle,
  Upload,
  MapPin,
  FileText,
  User,
} from "lucide-react";

const REQUIRED_FIELDS = [
  { key: "organizationName", label: "Organization Name", icon: User },
  { key: "description", label: "Description", icon: FileText },
  { key: "address", label: "Address", icon: MapPin },
  { key: "latitude", label: "Location (Lat/Lng)", icon: MapPin },
  { key: "profilePhoto", label: "Profile Photo", icon: Upload },
  { key: "verificationDoc", label: "Verification Document", icon: FileText },
];

export default function NgoProfileCompletion() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    organizationName: "",
    description: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  useEffect(() => {
    api
      .get("/api/ngo/my/profile")
      .then((res) => {
        setProfile(res.data);
        setForm({
          organizationName: res.data.organizationName || "",
          description: res.data.description || "",
          address: res.data.address || "",
          latitude: res.data.latitude || "",
          longitude: res.data.longitude || "",
        });
      })
      .catch((err) => {
        console.error("Failed to load NGO profile", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const completed = REQUIRED_FIELDS.filter((f) => {
    if (f.key === "latitude") return profile?.latitude && profile?.longitude;
    if (f.key === "profilePhoto") return profile?.profilePhotoUrl;
    if (f.key === "verificationDoc") return profile?.verificationDocUrl;
    return profile?.[f.key];
  });

  const progress = Math.round((completed.length / REQUIRED_FIELDS.length) * 100);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put("/api/ngo/my/profile", form);
      setProfile(res.data);
      const token = localStorage.getItem("token");
      const updates = { ...user };
      if (res.data.organizationName) updates.name = res.data.organizationName;
      if (res.data.profileComplete === true) updates.profileComplete = true;
      login(updates, token);
      if (res.data.profileComplete) navigate("/ngo/dashboard");
    } catch (err) {
      console.error("Failed to save NGO profile", err);
      alert(err.response?.data?.message || "Failed to save profile");
    }
  };

  const uploadFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const fd = new FormData();
    // Backend expects the file under the `file` field name
    fd.append("file", file);

    const endpoint =
      type === "profile-photo"
        ? "/api/ngo/my/photo"
        : "/api/ngo/my/verification-doc";

    try {
      const res = await api.post(endpoint, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Backend returns { url: "..." }
      const url = res.data?.url;
      if (!url) {
        console.warn("Upload succeeded but no url in response", res.data);
      } else {
        setProfile((prev) => ({
          ...prev,
          ...(type === "profile-photo"
            ? { profilePhotoUrl: url }
            : { verificationDocUrl: url }),
        }));
      }
    } catch (err) {
      console.error("NGO upload failed", err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm({
          ...form,
          latitude: pos.coords.latitude.toFixed(6),
          longitude: pos.coords.longitude.toFixed(6),
        });
      },
      () => alert("Unable to detect location")
    );
  };

  if (loading)
    return (
      <>
        <Navbar />
        <div className="p-8 text-center text-slate-400">Loading...</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50">
        <div className="glass-nav text-white px-6 py-6">
          <h1 className="text-xl font-bold">Complete Your Profile</h1>
          <p className="text-teal-200 text-sm mt-1">
            Fill in all fields to get verified and appear on the map
          </p>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-600">Profile completion</span>
              <span className="font-medium text-teal-600">{progress}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-teal-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="glass rounded-2xl p-4 space-y-2">
            {REQUIRED_FIELDS.map((f) => {
              const done = completed.some((c) => c.key === f.key);
              const Icon = f.icon;
              return (
                <div
                  key={f.key}
                  className="flex items-center gap-3 text-sm py-1"
                >
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                  <Icon className="w-4 h-4 text-slate-400" />
                  <span className={done ? "text-slate-500" : "text-slate-800 font-medium"}>
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Profile form */}
          <form onSubmit={saveProfile} className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900">Organization Details</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Organization Name
              </label>
              <input
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                className="w-full border border-white/30 rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border border-white/30 rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
                placeholder="What does your organization do?"
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
                className="w-full border border-white/30 rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="border border-white/30 rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
                />
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="border border-white/30 rounded-xl px-3 py-2 text-sm bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-teal-400 focus:border-transparent outline-none transition-all duration-200"
                />
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="mt-2 text-xs text-teal-600 underline"
              >
                📍 Detect my location
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200"
            >
              Save Details
            </button>
          </form>

          {/* File uploads */}
          <div className="glass rounded-2xl p-6 space-y-4">
            <h3 className="font-bold text-slate-900">Upload Documents</h3>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Profile Photo
              </label>
              {profile?.profilePhotoUrl && (
                <img
                  src={profile.profilePhotoUrl}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover mb-2"
                />
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadFile(e, "profile-photo")}
                disabled={uploading}
                className="text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Verification Document (PDF/Image)
              </label>
              {profile?.verificationDocUrl && (
                <p className="text-xs text-green-600 mb-1">✅ Document uploaded</p>
              )}
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={(e) => uploadFile(e, "verification-doc")}
                disabled={uploading}
                className="text-sm"
              />
            </div>

            {uploading && (
              <p className="text-xs text-slate-400">Uploading...</p>
            )}
          </div>

          {progress === 100 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-700">
                Profile complete! Your verification is under review.
              </p>
              <button
                onClick={() => navigate("/ngo/dashboard")}
                className="mt-3 text-sm bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all duration-200"
              >
                Go to Dashboard →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
