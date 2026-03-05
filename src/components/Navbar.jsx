import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="glass-nav text-white px-6 py-3 flex items-center justify-between">
      <Link to="/" className="text-lg font-bold tracking-tight">
        AI Donor Matcher
      </Link>

      <div className="flex items-center gap-5 text-sm">
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
            <Link to="/dashboard/donor" className="hover:text-teal-200 transition-all duration-200">
              My Dashboard
            </Link>
          </>
        )}

        {user?.role === "NGO" && (
          <Link to="/dashboard/ngo" className="hover:text-teal-200 transition-all duration-200">
            Dashboard
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <Link to="/dashboard/admin" className="hover:text-teal-200 transition-all duration-200">
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
  );
}
