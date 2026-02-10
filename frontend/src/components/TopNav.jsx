import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import UserMenu from "./UserMenu"

export default function TopNav() {
  const { token } = useAuth()
  const location = useLocation()

  return (
    <nav className="flex items-center justify-between px-6 py-5">
      <Link to="/" className="text-xl font-semibold tracking-tight">
        PulseBoard
      </Link>
      <div className="flex items-center gap-3 text-sm">
        {token ? (
          <>
            {location.pathname !== "/dashboard" && (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded-full bg-ink text-white"
              >
                Dashboard
              </Link>
            )}
            <UserMenu />
          </>
        ) : (
          <>
            <Link to="/login" className="px-4 py-2 rounded-full border">
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-full bg-ink text-white"
            >
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}
