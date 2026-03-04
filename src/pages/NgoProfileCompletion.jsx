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
      .get("/api/ngo/profile")
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
      .catch(console.error)
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
      const res = await api.put("/api/ngo/profile", form);
      setProfile(res.data);
      // Update user context if name changed
      if (res.data.organizationName) {
        login({ ...user, name: res.data.organizationName }, localStorage.getItem("token"));
      }
    } catch {
      alert("Failed to save profile");
    }
  };

  const uploadFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    try {
      const res = await api.post(`/api/ngo/${type}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setProfile(res.data);
    } catch {
      alert("Upload failed");
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
        <div className="p-8 text-center text-gray-400">Loading...</div>
      </>
    );

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-[#1F4E79] text-white px-6 py-6">
          <h1 className="text-xl font-bold">Complete Your Profile</h1>
          <p className="text-blue-200 text-sm mt-1">
            Fill in all fields to get verified and appear on the map
          </p>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6">
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Profile completion</span>
              <span className="font-medium text-[#2E75B6]">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="h-3 rounded-full bg-[#2E75B6] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-lg shadow p-4 space-y-2">
            {REQUIRED_FIELDS.map((f) => {
              const done = completed.some((c) => c.key === f.key);
              const Icon = f.icon;
              return (
                <div
                  key={f.key}
                  className="flex items-center gap-3 text-sm py-1"
                >
                  {done ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                  <Icon className="w-4 h-4 text-gray-400" />
                  <span className={done ? "text-gray-500" : "text-gray-800 font-medium"}>
                    {f.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Profile form */}
          <form onSubmit={saveProfile} className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-bold text-[#1F4E79]">Organization Details</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                name="organizationName"
                value={form.organizationName}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="What does your organization do?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  name="latitude"
                  value={form.latitude}
                  onChange={handleChange}
                  placeholder="Latitude"
                  className="border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  name="longitude"
                  value={form.longitude}
                  onChange={handleChange}
                  placeholder="Longitude"
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={detectLocation}
                className="mt-2 text-xs text-[#2E75B6] underline"
              >
                📍 Detect my location
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2E75B6] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1F4E79] transition"
            >
              Save Details
            </button>
          </form>

          {/* File uploads */}
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h3 className="font-bold text-[#1F4E79]">Upload Documents</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
              <p className="text-xs text-gray-400">Uploading...</p>
            )}
          </div>

          {progress === 100 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-700">
                Profile complete! Your verification is under review.
              </p>
              <button
                onClick={() => navigate("/ngo/dashboard")}
                className="mt-3 text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
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
