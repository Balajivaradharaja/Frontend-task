import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link } from "react-router-dom"
import TopNav from "../components/TopNav"
import api from "../api/client"

const schema = z.object({
  email: z.string().email("Enter a valid email")
})

export default function ForgotPassword() {
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
    try {
      const { data } = await api.post("/auth/forgot-password", values)
      setMessage(data.message)
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to send reset link")
    }
  }

  return (
    <div className="min-h-screen text-ink">
      <TopNav />
      <main className="px-6 py-12">
        <div className="max-w-md mx-auto glass card space-y-6">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Password help</p>
            <h1 className="text-3xl font-semibold">Forgot password</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-600">Email</label>
              <input
                className="mt-1 w-full px-4 py-3 rounded-2xl border"
                type="email"
                placeholder="you@domain.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>
              )}
            </div>
            {message && <p className="text-sm text-emerald-600">{message}</p>}
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-full bg-ink text-white"
            >
              {isSubmitting ? "Sending..." : "Send reset link"}
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
