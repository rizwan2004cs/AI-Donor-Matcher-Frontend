import { useState, useEffect, useMemo } from "react";
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const paramEmail = searchParams.get("email");
    const stateEmail = location.state?.email;
    const storedEmail = localStorage.getItem("pendingVerificationEmail");
    const resolved = paramEmail || stateEmail || storedEmail || "";
    setEmail(resolved);
  }, [searchParams, location.state]);

  const handleOtpChange = (value) => {
    const numeric = value.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(numeric);
    if (error) setError(null);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!email) {
      setError("We couldn't detect your email. Please register again.");
      return;
    }
    if (otp.length < 4) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    setVerifying(true);
    setError(null);
    setMessage(null);

    try {
      await api.post("/api/auth/verify-otp", { email, otp });
      setVerified(true);
      setMessage("Email verified successfully! You can now log in.");
      localStorage.removeItem("pendingVerificationEmail");
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid or expired code. Please try again or resend."
      );
    } finally {
      setVerifying(false);
    }
  };

  const resend = async () => {
    if (!email) {
      setMessage(null);
      setError("Could not resend — please register again.");
      return;
    }
    setResending(true);
    setMessage(null);
    setError(null);
    try {
      await api.post("/api/auth/send-otp", { email });
      setMessage("Verification code sent. Check your inbox.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Could not resend code. Please try again later."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          {verified ? (
            <>
              <div className="text-4xl">✅</div>
              <h1 className="text-xl font-bold text-slate-900">Email Verified!</h1>
              <p className="text-slate-600">{message}</p>
              <a
                href="/login"
                className="inline-block bg-teal-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-teal-700 transition-all duration-200"
              >
                Go to Login
              </a>
            </>
          ) : (
            <>
              <div className="text-4xl">✉️</div>
              <h1 className="text-xl font-bold text-slate-900">
                Verify Your Email
              </h1>
              {email ? (
                <p className="text-slate-600">
                  Enter the verification code sent to{" "}
                  <span className="font-medium text-slate-900">{email}</span>.
                </p>
              ) : (
                <p className="text-slate-600">
                  We could not detect your email address. Please return to registration and
                  sign up again.
                </p>
              )}

              {email && (
                <form onSubmit={handleVerify} className="space-y-3">
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={otp}
                    onChange={(e) => handleOtpChange(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="w-full bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl px-4 py-2.5 text-center tracking-[0.3em] text-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all duration-200"
                  />

                  <button
                    type="submit"
                    disabled={verifying || otp.length === 0}
                    className="w-full bg-teal-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-all duration-200 disabled:opacity-50"
                  >
                    {verifying ? "Verifying..." : "Verify Code"}
                  </button>
                </form>
              )}

              <button
                type="button"
                onClick={resend}
                disabled={resending || !email}
                className="mt-2 text-sm text-teal-600 hover:text-teal-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
              >
                {resending ? "Sending code..." : "Resend verification code"}
              </button>

              {message && <p className="text-sm text-emerald-600">{message}</p>}
              {error && <p className="text-sm text-red-500">{error}</p>}

              <p className="text-sm text-slate-400">
                You can browse the map while you wait, but pledging requires a verified
                email.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
