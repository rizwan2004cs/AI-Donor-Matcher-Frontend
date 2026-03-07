import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post("/api/auth/login", form);
      const { token, user } = res.data;
      login(user, token);

      // Redirect based on role
      if (user.role === "ADMIN") navigate("/admin/dashboard");
      else if (user.role === "NGO") navigate("/ngo/dashboard");
      else navigate("/map");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading && <LoadingOverlay message="Logging in..." />}
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <form
          onSubmit={onSubmit}
          className="glass rounded-2xl p-8 w-full max-w-md space-y-5"
        >
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Log In
          </h1>

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

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>

          <p className="text-sm text-slate-500">
            Don&apos;t have an account?{" "}
            <Link to="/register" className="text-teal-600 hover:text-teal-700 font-medium">
              Register
            </Link>
          </p>
        </form>
      </div>
    </>
  );
}
