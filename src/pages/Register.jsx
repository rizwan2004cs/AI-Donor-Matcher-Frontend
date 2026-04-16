import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { useAuth } from "../auth/AuthContext";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import LoadingOverlay from "../components/LoadingOverlay";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { firebaseAuth } from "../firebase";
import { queuePendingTour, TOUR_IDS } from "../tour/tours";

function normalizeAuthUser(data) {
  return (
    data.user ?? {
      id: data.userId ?? null,
      fullName: data.fullName ?? "",
      email: data.email ?? "",
      role: data.role ?? "",
    }
  );
}

export default function Register() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [role, setRole] = useState("DONOR");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    location: "",
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Creating Account...");
  const [error, setError] = useState(null);
  const [existingAccountEmail, setExistingAccountEmail] = useState("");
  const online = useOnlineStatus();

  useEffect(() => {
    if (!user) return;

    if (user.role === "ADMIN") navigate("/admin/dashboard", { replace: true });
    else if (user.role === "NGO") navigate("/ngo/dashboard", { replace: true });
    else navigate("/", { replace: true });
  }, [user, navigate]);

  const onChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const onRegister = async (e) => {
    e.preventDefault();
    if (!online) {
      setError("You are offline. Reconnect before completing registration.");
      return;
    }

    if (role === "NGO" && !file) {
      setError("Please upload the NGO registration certificate.");
      return;
    }

    setLoading(true);
    setLoadingMessage(
      role === "NGO"
        ? "Creating NGO account and preparing your workspace..."
        : "Creating your account..."
    );
    setError(null);
    setExistingAccountEmail("");

    try {
      const credential = await createUserWithEmailAndPassword(
        firebaseAuth,
        form.email,
        form.password
      );
      const firebaseUser = credential.user;
      await sendEmailVerification(firebaseUser);
      const idToken = await firebaseUser.getIdToken();

      let authPayload;
      if (role === "NGO") {
        const formData = new FormData();
        formData.append("fullName", form.fullName);
        formData.append("role", "NGO");
        formData.append("location", form.location || "");
        if (file) {
          formData.append("document", file);
        }

        const res = await api.post("/api/auth/firebase/register", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${idToken}`,
          },
        });
        authPayload = res.data;
      } else {
        const res = await api.post(
          "/api/auth/firebase/register",
          {
            fullName: form.fullName,
            role: "DONOR",
            location: form.location || "",
          },
          {
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        authPayload = res.data;
      }

      const registeredUser = normalizeAuthUser(authPayload);
      if (!registeredUser?.role) {
        throw new Error("Registration succeeded but auth payload was incomplete.");
      }

      if (registeredUser.role === "NGO") {
        queuePendingTour(TOUR_IDS.FULL_NGO);
      } else if (registeredUser.role === "DONOR") {
        queuePendingTour(TOUR_IDS.FULL_DONOR);
      } else if (registeredUser.role === "ADMIN") {
        queuePendingTour(TOUR_IDS.FULL_ADMIN);
      }

      login(registeredUser, idToken);

      if (registeredUser.role === "ADMIN") {
        navigate("/admin/dashboard", { replace: true });
        return;
      }

      if (registeredUser.role === "NGO") {
        navigate("/ngo/complete-profile", { replace: true });
        return;
      }

      navigate("/", { replace: true });
    } catch (err) {
      console.error("REGISTRATION ERROR:", err);
      const code = err?.code;
      const status = err?.response?.status;
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed";

      if (
        status === 400 ||
        /already registered|already exists/i.test(message) ||
        code === "auth/email-already-in-use"
      ) {
        setExistingAccountEmail(form.email);
        setError("An account with this email already exists.");
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {loading && <LoadingOverlay message={loadingMessage} />}
      <div className="page-watermark min-h-screen flex items-center justify-center p-4">
        <form
          onSubmit={onRegister}
          className="glass rounded-2xl p-8 w-full max-w-md space-y-5"
        >
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>

          <div className="flex gap-2">
            {["DONOR", "NGO"].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                  role === r
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
            name="location"
            placeholder="Location (City, District)"
            value={form.location}
            onChange={onChange}
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

          {role === "NGO" && (
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-white/40">
              <label className="block text-sm text-slate-600 mb-1">
                Upload Registration Certificate
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <p className="text-red-500 text-sm">{error}</p>
              {existingAccountEmail && (
                <button
                  type="button"
                  onClick={() =>
                    navigate("/login", {
                      state: { prefillEmail: existingAccountEmail },
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-xl border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-medium text-teal-700 transition-all duration-200 hover:bg-teal-100"
                >
                  Go to login with this email
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !online}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? "Creating Account..." : online ? "Create Account" : "Offline"}
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
