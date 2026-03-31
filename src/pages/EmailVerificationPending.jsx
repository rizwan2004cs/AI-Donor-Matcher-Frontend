import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { sendEmailVerification } from "firebase/auth";
import { MailCheck, MailWarning } from "lucide-react";
import Navbar from "../components/Navbar";
import useOnlineStatus from "../hooks/useOnlineStatus";
import { firebaseAuth } from "../firebase";

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const online = useOnlineStatus();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    setEmail(firebaseAuth.currentUser?.email || location.state?.email || "");
    if (location.state?.sent) {
      setMessage("Verification email sent. Please check your inbox.");
    }
  }, [location.state]);

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
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-700">
            <MailCheck className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold text-slate-900">Check Your Inbox</h1>
          {email ? (
            <p className="text-slate-600">
              A verification email was sent to <span className="font-semibold text-slate-900">{email}</span>.
            </p>
          ) : (
            <p className="text-slate-600">
              If you need a fresh verification email, log in again and we can resend it.
            </p>
          )}

          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full rounded-xl bg-teal-600 px-6 py-2.5 text-white font-medium transition-all duration-200 hover:bg-teal-700"
            >
              Continue to app
            </button>
            <button
              type="button"
              onClick={resendVerification}
              disabled={resending || !online}
              className="w-full rounded-xl border border-teal-200 bg-teal-50 px-6 py-2.5 text-teal-700 font-medium transition-all duration-200 hover:bg-teal-100 disabled:opacity-50"
            >
              {resending ? "Sending email..." : online ? "Resend verification email" : "Offline"}
            </button>
          </div>

          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && (
            <div className="flex items-center justify-center gap-2 text-sm text-red-500">
              <MailWarning className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-slate-400">
            Need to switch accounts? <Link to="/login" className="text-teal-600 hover:text-teal-700 font-medium">Log in again</Link>
          </p>
        </div>
      </div>
    </>
  );
}