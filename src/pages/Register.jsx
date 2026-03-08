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
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;

    setOtp(prevOtp => {
      const newOtp = [...prevOtp];
      newOtp[index] = element.value;
      return newOtp;
    });

    // Focus next input
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }
  };

  // Effect to trigger auto-submit when all 6 digits are filled
  useEffect(() => {
    // Only proceed if all 6 boxes have a value
    if (otp.every(digit => digit !== "")) {
      // Small timeout feels more natural to let the user see the final digit appear
      const timeoutId = setTimeout(() => {
        // Find our hidden submit button to trigger form submission
        const submitBtn = document.getElementById('hidden-submit-btn');
        if (submitBtn) {
          submitBtn.click();
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    }
  }, [otp]);

  const handleOtpKeyDown = (e, index) => {
    // Focus previous input on backspace if current is empty
    if (e.key === "Backspace" && e.target.previousSibling && otp[index] === "") {
      e.target.previousSibling.focus();
    }
  }

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text/plain").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    // Focus the last filled input or the first empty one
    const focusIndex = Math.min(pastedData.length, 5);
    const inputs = document.querySelectorAll('.otp-input');
    if (inputs[focusIndex]) {
      inputs[focusIndex].focus();
    }
  };

  const onSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 1: Request OTP from backend
      await api.post("/api/auth/send-registration-otp", { email: form.email });
      setStep(2); // Move to OTP verification step
    } catch (err) {
      console.error("SEND OTP ERROR:", err);
      setError(err.response?.data?.message || err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Step 2: Submit all data + OTP to finally register
      const otpString = otp.join("");
      if (otpString.length !== 6) {
        setError("Please enter a valid 6-digit OTP.");
        setLoading(false);
        return;
      }

      if (role === "NGO") {
        const formData = new FormData();
        formData.append("fullName", form.fullName);
        formData.append("email", form.email);
        formData.append("password", form.password);
        formData.append("role", "NGO");
        formData.append("otp", otpString); // Include OTP String
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
        const res = await api.post("/api/auth/register", { ...form, role: "DONOR", otp: otpString });
        if (res.data?.token && res.data?.user) {
          login(res.data.user, res.data.token);
        }
      }
      // Registration successful, AuthContext will handle redirect based on user role
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
          onSubmit={step === 1 ? onSendOtp : onRegister}
          className="glass rounded-2xl p-8 w-full max-w-md space-y-5"
        >
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Create Account
          </h1>

          {step === 1 ? (
            <>
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
                    required
                  />
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-center space-y-2 mb-4">
                <p className="text-slate-600">
                  We've sent a 6-digit code to <span className="font-semibold">{form.email}</span>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp(["", "", "", "", "", ""]); // Reset OTP
                    setError(null);
                  }}
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium"
                >
                  Change Email
                </button>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3 py-4" onPaste={handleOtpPaste}>
                {otp.map((data, index) => {
                  return (
                    <input
                      className="otp-input w-12 h-12 sm:w-14 sm:h-14 text-center text-xl font-semibold bg-white/70 backdrop-blur-sm border-2 border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200 shadow-sm text-slate-700"
                      type="text"
                      name="otp"
                      maxLength="1"
                      key={index}
                      value={data}
                      onChange={e => handleOtpChange(e.target, index)}
                      onFocus={e => e.target.select()}
                      onKeyDown={e => handleOtpKeyDown(e, index)}
                      required
                    />
                  );
                })}
              </div>
            </>
          )}

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <button
            id="hidden-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2.5 rounded-xl font-semibold hover:bg-teal-700 transition-all duration-200 shadow-sm hover:shadow disabled:opacity-50"
          >
            {loading ? "Please wait..." : step === 1 ? "Verify Email" : "Complete Registration"}
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
