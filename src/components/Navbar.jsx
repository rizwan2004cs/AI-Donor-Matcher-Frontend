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
    <nav className="bg-[#1F4E79] text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/" className="text-lg font-bold tracking-wide">
        AI Donor Matcher
      </Link>

      <div className="flex items-center gap-4 text-sm">
        {!user && (
          <>
            <Link to="/login" className="hover:underline">
              Login
            </Link>
            <Link to="/register" className="hover:underline">
              Register
            </Link>
          </>
        )}

        {user?.role === "DONOR" && (
          <>
            <Link to="/" className="hover:underline">
              Map
            </Link>
            <Link to="/dashboard/donor" className="hover:underline">
              My Dashboard
            </Link>
          </>
        )}

        {user?.role === "NGO" && (
          <Link to="/dashboard/ngo" className="hover:underline">
            Dashboard
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <Link to="/dashboard/admin" className="hover:underline">
            Dashboard
          </Link>
        )}

        {user && (
          <button
            onClick={handleLogout}
            className="bg-white/20 px-3 py-1 rounded hover:bg-white/30 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
