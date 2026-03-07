import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Register() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [role, setRole] = useState("DONOR");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If already logged in, don't allow access to register page
  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
    else if (user.role === "NGO") {
      navigate(user.profileComplete ? "/ngo/dashboard" : "/ngo/complete-profile", { replace: true });
    } else navigate("/map", { replace: true });
  }, [user, navigate]);

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
        formData.append("role", "NGO");
        if (file) {
          formData.append("document", file);
        }

        const res = await api.post("/api/auth/register", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (res.data?.token && res.data?.user) {
          login(res.data.user, res.data.token);
        }
      } else {
        const res = await api.post("/api/auth/register", { ...form, role: "DONOR" });
        if (res.data?.token && res.data?.user) {
          login(res.data.user, res.data.token);
        }
      }
      localStorage.setItem("pendingVerificationEmail", form.email);
      navigate("/verify-email", { state: { email: form.email } });
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading && <LoadingOverlay message="Creating Account..." />}
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="glass rounded-2xl p-8 w-full max-w-md space-y-5"
        >
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>

          {/* Role selector */}
          <div className="flex gap-2">
            {["DONOR", "NGO"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 ${role === r
                  ? "bg-teal-600 text-white shadow-sm"
                  : "bg-white/70 border border-slate-200 text-slate-600 hover:bg-white"
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
            className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={onChange}
            required
            className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={onChange}
            required
            className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
          />

          {/* NGO document upload */}
          {role === "NGO" && (
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white/40">
              <label className="block text-sm text-slate-500 mb-1">
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
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-sm text-slate-500">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
              Log In
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
