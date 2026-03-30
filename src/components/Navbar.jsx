import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { CircleUserRound } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const homePath =
    user?.role === "ADMIN"
      ? "/admin/dashboard"
      : user?.role === "NGO"
        ? "/ngo/dashboard"
        : user?.role === "DONOR"
          ? "/donor/dashboard"
          : "/";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName = user?.fullName || user?.email || "";
  const profilePath =
    user?.role === "NGO"
      ? "/ngo/complete-profile"
      : user?.role === "DONOR"
        ? "/donor/dashboard"
        : user?.role === "ADMIN"
          ? "/admin/dashboard"
          : "/login";

  return (
    <header className="bg-teal-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <nav className="glass-nav text-white px-4 sm:px-6 py-3 flex items-center justify-between rounded-2xl shadow-md">
          <Link to={homePath} className="text-lg font-bold tracking-tight">
            AI Donor Matcher
          </Link>

          <div className="flex items-center gap-5 text-sm">
            {user && displayName && (
              <button
                type="button"
                onClick={() => navigate(profilePath)}
                className="hidden items-center gap-2 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-teal-50/95 transition-all duration-200 hover:bg-white/20 md:inline-flex"
                title={user?.role === "NGO" ? "Open profile settings" : "Open your dashboard"}
              >
                <CircleUserRound className="h-4 w-4 text-teal-100" />
                <span className="max-w-[220px] truncate font-medium">{displayName}</span>
              </button>
            )}

            {!user && (
              <>
                <Link to="/login" className="hover:text-teal-200 transition-all duration-200">
                  Login
                </Link>
                <Link to="/register" className="hover:text-teal-200 transition-all duration-200">
                  Register
                </Link>
              </>
            )}

            {user?.role === "DONOR" && (
              <>
                <Link to="/" className="hover:text-teal-200 transition-all duration-200">
                  Map
                </Link>
                <Link
                  to="/donor/dashboard"
                  className="hover:text-teal-200 transition-all duration-200"
                >
                  My Dashboard
                </Link>
              </>
            )}

            {user?.role === "NGO" && (
              <Link
                to="/ngo/dashboard"
                className="hover:text-teal-200 transition-all duration-200"
              >
                Dashboard
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link
                to="/admin/dashboard"
                className="hover:text-teal-200 transition-all duration-200"
              >
                Dashboard
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                className="bg-white/15 px-3.5 py-1.5 rounded-xl text-sm hover:bg-white/25 transition-all duration-200"
              >
                Logout
              </button>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
