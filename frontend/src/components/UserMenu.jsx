import { useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function UserMenu() {
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const initials = useMemo(() => {
    if (!user?.name) return "U"
    return user.name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }, [user?.name])

  return (
    <div className="relative">
      <button
        className="px-4 py-2 rounded-full border text-sm flex items-center gap-2 bg-white/70"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="w-7 h-7 rounded-full bg-ink text-white text-xs flex items-center justify-center">
          {initials}
        </span>
        <span className="hidden sm:inline">{user?.name || "User"}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white/95 backdrop-blur shadow-xl p-2 text-sm z-50">
          <div className="px-3 py-2 border-b mb-2">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="font-semibold">{user?.name || "User"}</p>
            <span className="mt-1 inline-flex px-2 py-1 rounded-full bg-slate-100 text-xs capitalize">
              {user?.role || "analyst"}
            </span>
          </div>
          <Link
            to="/settings"
            className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Profile settings
          </Link>
          <Link
            to="/settings#theme"
            className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Theme settings
          </Link>
          <Link
            to="/settings#password"
            className="block px-3 py-2 rounded-xl hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            Change password
          </Link>
          <button
            className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100"
            onClick={() => {
              logout()
              setOpen(false)
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
