import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function Register() {
  const navigate = useNavigate();
  const [role, setRole] = useState("DONOR");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    location: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (role === "NGO") {
        const formData = new FormData();
        formData.append("fullName", form.fullName);
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("location", form.location);
        formData.append("role", "NGO");
        if (file) formData.append("documents", file);

        await api.post("/api/auth/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/auth/register", { ...form, role: "DONOR" });
      }
      navigate("/verify-email");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md space-y-5"
        >
          <h1 className="text-2xl font-bold text-center text-[#1F4E79]">
            AI Donation Matcher
          </h1>

          {/* Role selector */}
          <div className="flex gap-2">
            {["DONOR", "NGO"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  role === r
                    ? "bg-[#2E75B6] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {r === "DONOR" ? "Donor" : "NGO"}
              </button>
            ))}
          </div>

          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={onChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            name="location"
            placeholder="Location"
            value={form.location}
            onChange={onChange}
            required
            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* NGO document upload */}
          {role === "NGO" && (
            <div className="border border-dashed border-gray-300 rounded-lg p-4">
              <label className="block text-sm text-gray-500 mb-1">
                Upload Registration Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
          )}

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#2E75B6] text-white py-2.5 rounded-lg font-semibold hover:bg-[#1F4E79] transition disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-sm text-center text-gray-500">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
