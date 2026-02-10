import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Link, useNavigate } from "react-router-dom"
import TopNav from "../components/TopNav"
import { useAuth } from "../context/AuthContext"

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export default function Register() {
  const navigate = useNavigate()
  const { register: registerUser } = useAuth()
  const [serverError, setServerError] = useState("")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (values) => {
    setServerError("")
    try {
      await registerUser(values)
      navigate("/dashboard")
    } catch (error) {
      setServerError(error?.response?.data?.message || "Registration failed")
    }
  }

  return (
    <div className="min-h-screen text-ink">
      <TopNav />
      <main className="px-6 py-12">
        <div className="max-w-md mx-auto glass card space-y-6">
          <div>
            <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Get started</p>
            <h1 className="text-3xl font-semibold">Create your account</h1>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="text-sm text-slate-600">Full name</label>
              <input
                className="mt-1 w-full px-4 py-3 rounded-2xl border"
                placeholder="Jane Doe"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
              )}
            </div>
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
            <div>
              <label className="text-sm text-slate-600">Password</label>
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
            {serverError && (
              <p className="text-sm text-red-500">{serverError}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-3 rounded-full bg-ink text-white"
            >
              {isSubmitting ? "Creating..." : "Create account"}
            </button>
          </form>
          <p className="text-sm text-slate-600">
            Already have an account? <Link to="/login" className="text-ink">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
