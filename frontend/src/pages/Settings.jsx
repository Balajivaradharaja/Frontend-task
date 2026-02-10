import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import TopNav from "../components/TopNav"
import { useAuth } from "../context/AuthContext"
import { useTheme } from "../context/ThemeContext"
import api from "../api/client"

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required")
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, "Current password required"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm your new password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })

export default function Settings() {
  const { user, updateProfile } = useAuth()
  const { theme, setTheme } = useTheme()
  const [profileMessage, setProfileMessage] = useState("")
  const [passwordMessage, setPasswordMessage] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors }
  } = useForm({ resolver: zodResolver(profileSchema) })

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    formState: { errors: passwordErrors, isSubmitting: passwordSubmitting },
    reset: resetPasswordForm
  } = useForm({ resolver: zodResolver(passwordSchema) })

  useEffect(() => {
    if (user) {
      setProfileMessage("")
    }
  }, [user])

  const onProfileSubmit = async (values) => {
    setProfileMessage("")
    try {
      await updateProfile(values)
      setProfileMessage("Profile updated")
    } catch (error) {
      setProfileMessage(error?.response?.data?.message || "Update failed")
    }
  }

  const onPasswordSubmit = async (values) => {
    setPasswordMessage("")
    setPasswordError("")
    try {
      const { data } = await api.post("/profile/change-password", {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      })
      setPasswordMessage(data.message)
      resetPasswordForm()
    } catch (error) {
      setPasswordError(error?.response?.data?.message || "Password update failed")
    }
  }

  return (
    <div className="min-h-screen text-ink">
      <TopNav />
      <main className="px-6 pb-16">
        <section className="max-w-5xl mx-auto space-y-8">
          <header>
            <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Settings</p>
            <h1 className="text-3xl font-semibold">Account preferences</h1>
          </header>

          <div id="profile" className="glass card space-y-4">
            <div>
              <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Profile</p>
              <h2 className="text-2xl font-semibold">Profile settings</h2>
              <p className="text-slate-600">Keep your analyst profile sharp.</p>
            </div>
            <form className="space-y-4" onSubmit={handleProfileSubmit(onProfileSubmit)}>
              <div>
                <label className="text-sm text-slate-600">Name</label>
                <input
                  className="mt-1 w-full px-4 py-3 rounded-2xl border"
                  defaultValue={user?.name || ""}
                  {...registerProfile("name")}
                />
                {profileErrors.name && (
                  <p className="text-sm text-red-500 mt-1">{profileErrors.name.message}</p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-600">Email</label>
                <input
                  className="mt-1 w-full px-4 py-3 rounded-2xl border"
                  defaultValue={user?.email || ""}
                  {...registerProfile("email")}
                />
                {profileErrors.email && (
                  <p className="text-sm text-red-500 mt-1">{profileErrors.email.message}</p>
                )}
              </div>
              {profileMessage && (
                <p className="text-sm text-emerald-600">{profileMessage}</p>
              )}
              <button type="submit" className="px-5 py-3 rounded-full bg-ink text-white">
                Update profile
              </button>
            </form>
          </div>

          <div id="theme" className="glass card space-y-4">
            <div>
              <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Theme</p>
              <h2 className="text-2xl font-semibold">Theme settings</h2>
              <p className="text-slate-600">Choose a focus-friendly theme.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                { label: "Light", value: "light" },
                { label: "Dark", value: "dark" }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`px-5 py-3 rounded-full border ${
                    theme === option.value ? "bg-ink text-white" : "bg-white"
                  }`}
                  onClick={() => setTheme(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div id="password" className="glass card space-y-4">
            <div>
              <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Security</p>
              <h2 className="text-2xl font-semibold">Change password</h2>
              <p className="text-slate-600">Rotate credentials regularly.</p>
            </div>
            <form className="space-y-4" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
              <div>
                <label className="text-sm text-slate-600">Current password</label>
                <input
                  className="mt-1 w-full px-4 py-3 rounded-2xl border"
                  type="password"
                  {...registerPassword("currentPassword")}
                />
                {passwordErrors.currentPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordErrors.currentPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-600">New password</label>
                <input
                  className="mt-1 w-full px-4 py-3 rounded-2xl border"
                  type="password"
                  {...registerPassword("newPassword")}
                />
                {passwordErrors.newPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordErrors.newPassword.message}
                  </p>
                )}
              </div>
              <div>
                <label className="text-sm text-slate-600">Confirm new password</label>
                <input
                  className="mt-1 w-full px-4 py-3 rounded-2xl border"
                  type="password"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && (
                  <p className="text-sm text-red-500 mt-1">
                    {passwordErrors.confirmPassword.message}
                  </p>
                )}
              </div>
              {passwordMessage && (
                <p className="text-sm text-emerald-600">{passwordMessage}</p>
              )}
              {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="px-5 py-3 rounded-full bg-ink text-white"
              >
                {passwordSubmitting ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}
