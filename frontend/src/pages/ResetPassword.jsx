import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useLocation, useNavigate } from "react-router-dom"
import TopNav from "../components/TopNav"
import api from "../api/client"

const schema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters")
})

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const params = new URLSearchParams(location.search)
  const token = params.get("token")
  const email = params.get("email")

  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setMessage("")
    setError("")

    if (!token || !email) {
      setError("Missing reset token or email")
      return
    }

    try {
      const { data } = await api.post("/auth/reset-password", {
        email,
        token,
        password: values.password
      })
      setMessage(data.message)
      setTimeout(() => navigate("/login"), 1200)
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to reset password")
    }
  }

  return (
    <div className="min-h-screen text-ink">
      <TopNav />
      <main className="px-6 py-12">
        <div className="max-w-md mx-auto glass card space-y-6">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Set a new password</p>
            <h1 className="text-3xl font-semibold">Reset password</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-600">New password</label>
              <input
                className="mt-1 w-full px-4 py-3 rounded-2xl border"
                type="password"
                placeholder="Minimum 6 characters"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
              )}
            </div>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-full bg-ink text-white"
            >
              {isSubmitting ? "Updating..." : "Update password"}
            </button>
          </form>
          <p className="text-sm text-slate-600">
            Back to <Link to="/login" className="text-ink">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
