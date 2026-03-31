import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { CheckCircle2, MailCheck, MailWarning } from "lucide-react";
import Navbar from "../components/Navbar";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { firebaseAuth } from "../firebase";

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("pending");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setEmail(firebaseAuth.currentUser?.email || "");
  }, []);

  const refreshVerification = async () => {
    if (!firebaseAuth.currentUser) {
      setError("We could not find your session. Please log in again.");
      return;
    }
    if (!online) {
      setError("You are offline. Reconnect before checking verification.");
      return;
    }

    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      await firebaseAuth.currentUser.reload();
      if (firebaseAuth.currentUser.emailVerified) {
        setStatus("verified");
        setMessage("Email verified successfully!");
      } else {
        setStatus("pending");
        setMessage("Your email is not verified yet. Please check your inbox.");
      }
    } catch (err) {
      setError("Could not refresh verification status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  const resendVerification = async () => {
    if (!firebaseAuth.currentUser) {
      setError("We could not find your session. Please log in again.");
      return;
    }
    if (!online) {
      setError("You are offline. Reconnect before resending the email.");
      return;
    }

    setResending(true);
    setError(null);
    setMessage(null);
    try {
      await sendEmailVerification(firebaseAuth.currentUser);
      setMessage("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError("Could not send verification email. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          {status === "verified" ? (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Email Verified</h1>
              <p className="text-slate-600">{message}</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center rounded-xl bg-teal-600 px-6 py-2 text-white font-medium hover:bg-teal-700 transition-all duration-200"
              >
                Continue to app
              </button>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
                <MailCheck className="h-7 w-7" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verify Your Email</h1>
              {email ? (
                <p className="text-slate-600">
                  We sent a verification email to{" "}
                  <span className="font-semibold text-slate-900">{email}</span>.
                </p>
              ) : (
                <p className="text-slate-600">
                  We could not detect your email. Please log in again to resend the
                  verification email.
                </p>
              )}

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={refreshVerification}
                  disabled={checking || !online}
                  className="w-full rounded-xl bg-teal-600 px-6 py-2.5 text-white font-medium transition-all duration-200 hover:bg-teal-700 disabled:opacity-50"
                >
                  {checking ? "Checking..." : online ? "I have verified" : "Offline"}
                </button>
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={resending || !online}
                  className="w-full rounded-xl border border-teal-200 bg-teal-50 px-6 py-2.5 text-teal-700 font-medium transition-all duration-200 hover:bg-teal-100 disabled:opacity-50"
                >
                  {resending ? "Sending email..." : "Resend verification email"}
                </button>
              </div>

              {message && <p className="text-sm text-emerald-600">{message}</p>}
              {error && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                  <MailWarning className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <p className="text-sm text-slate-400">
                You can browse the map while you wait, but pledging requires a verified
                email.
              </p>

              <p className="text-xs text-slate-400">
                Need to switch accounts?{" "}
                <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">
                  Log in again
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
