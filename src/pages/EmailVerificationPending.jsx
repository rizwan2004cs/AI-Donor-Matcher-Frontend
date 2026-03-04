import { useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";

export default function EmailVerificationPending() {
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState(null);

  const resend = async () => {
    setResending(true);
    try {
      await api.post("/api/auth/resend-verification");
      setMessage("Verification email resent. Check your inbox.");
    } catch {
      setMessage("Could not resend. Please try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md text-center space-y-4">
          <div className="text-4xl">✉️</div>
          <h1 className="text-xl font-bold text-[#1F4E79]">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            A verification link has been sent to your email address. Click the
            link to activate your account before pledging.
          </p>

          <button
            onClick={resend}
            disabled={resending}
            className="bg-[#2E75B6] text-white px-6 py-2 rounded-lg font-medium hover:bg-[#1F4E79] transition disabled:opacity-50"
          >
            {resending ? "Resending..." : "Resend Verification Email"}
          </button>

          {message && <p className="text-sm text-gray-500">{message}</p>}

          <p className="text-sm text-gray-400">
            You can browse the map while you wait.
          </p>
        </div>
      </div>
    </>
  );
}
