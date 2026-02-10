import { Link } from "react-router-dom"
import TopNav from "../components/TopNav"
import { useAuth } from "../context/AuthContext"

export default function Home() {
  const { token } = useAuth()

  return (
    <div className="min-h-screen text-ink">
      <TopNav />
      <main className="px-6 pb-20">
        <section className="max-w-5xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
          <div className="space-y-6 fade-up">
            <p className="uppercase tracking-[0.4em] text-xs text-slate-500">PulseBoard</p>
            <h1 className="text-4xl md:text-5xl font-semibold">
              A clean, fast dashboard to manage your work and prove your frontend chops.
            </h1>
            <p className="text-slate-600 text-lg">
              Authenticated flows, secure APIs, and a polished UI ready for scale. Built to help you ship the internship assignment with confidence.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to={token ? "/dashboard" : "/register"}
                className="px-6 py-3 rounded-full bg-ink text-white"
              >
                {token ? "Open Dashboard" : "Create Account"}
              </Link>
              <Link to="/login" className="px-6 py-3 rounded-full border">
                View Demo Login
              </Link>
            </div>
          </div>
          <div className="glass card space-y-4 fade-up">
            <h2 className="text-2xl font-semibold">What you get</h2>
            <ul className="space-y-3 text-slate-600">
              <li>JWT auth + protected routes</li>
              <li>Profile management & CRUD tasks</li>
              <li>Search and filters for productivity</li>
              <li>Scalable folder structure</li>
            </ul>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="p-3 rounded-2xl bg-white">
                <p className="text-slate-500">Security</p>
                <p className="font-semibold">bcrypt + JWT</p>
              </div>
              <div className="p-3 rounded-2xl bg-white">
                <p className="text-slate-500">Backend</p>
                <p className="font-semibold">Node + MongoDB</p>
              </div>
              <div className="p-3 rounded-2xl bg-white">
                <p className="text-slate-500">Frontend</p>
                <p className="font-semibold">React + Tailwind</p>
              </div>
              <div className="p-3 rounded-2xl bg-white">
                <p className="text-slate-500">Scalability</p>
                <p className="font-semibold">Modular API</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
