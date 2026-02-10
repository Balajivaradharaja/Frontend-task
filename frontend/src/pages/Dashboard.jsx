import { useEffect, useMemo, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import TopNav from "../components/TopNav"
import api from "../api/client"

const initialTask = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "",
  tags: "",
  confidence: 50,
  category: "research"
}

const statusLabels = {
  todo: "To do",
  in_progress: "In progress",
  done: "Done"
}

const pieColors = ["#2b6ae6", "#18b47b", "#f5a524"]

export default function Dashboard() {
  const [tasks, setTasks] = useState([])
  const [filters, setFilters] = useState({ q: "", status: "", priority: "", category: "" })
  const [taskForm, setTaskForm] = useState(initialTask)
  const [editingId, setEditingId] = useState(null)
  const [taskError, setTaskError] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data } = await api.get("/profile/me")
        setCurrentUser({ id: data._id || data.id, role: data.role, name: data.name })
      } catch (error) {
        setCurrentUser(null)
      }
    }

    loadUser()
  }, [])

  const queryParams = useMemo(() => {
    const params = {}
    if (filters.q) params.q = filters.q
    if (filters.status) params.status = filters.status
    if (filters.priority) params.priority = filters.priority
    if (filters.category) params.category = filters.category
    return params
  }, [filters])

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/tasks", { params: queryParams })
      setTasks(data)
    } catch (error) {
      setTaskError(error?.response?.data?.message || "Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handle = setTimeout(() => {
      fetchTasks()
    }, 250)
    return () => clearTimeout(handle)
  }, [queryParams])

  const handleTaskSubmit = async (event) => {
    event.preventDefault()
    setTaskError("")
    const payload = {
      ...taskForm,
      tags: taskForm.tags
        ? taskForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean)
        : []
    }

    try {
      if (editingId) {
        await api.put(`/tasks/${editingId}`, payload)
      } else {
        await api.post("/tasks", payload)
      }
      setTaskForm(initialTask)
      setEditingId(null)
      fetchTasks()
    } catch (error) {
      setTaskError(error?.response?.data?.message || "Task save failed")
    }
  }

  const startEdit = (task) => {
    setEditingId(task._id)
    setTaskForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
      tags: task.tags ? task.tags.join(", ") : "",
      confidence: task.confidence ?? 50,
      category: task.category || "research"
    })
  }

  const deleteTask = async (id) => {
    const confirmed = window.confirm("Delete this task?")
    if (!confirmed) return
    try {
      await api.delete(`/tasks/${id}`)
      fetchTasks()
    } catch (error) {
      setTaskError(error?.response?.data?.message || "Delete failed")
    }
  }

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((task) => task.status === "done").length
    const high = tasks.filter((task) => task.priority === "high").length
    const avgConfidence =
      total === 0
        ? 0
        : Math.round(
            tasks.reduce((acc, task) => acc + (task.confidence ?? 50), 0) / total
          )
    return { total, done, high, avgConfidence }
  }, [tasks])

  const grouped = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      in_progress: tasks.filter((task) => task.status === "in_progress"),
      done: tasks.filter((task) => task.status === "done")
    }
  }, [tasks])

  const timeline = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 6)
  }, [tasks])

  const statusChart = useMemo(
    () => [
      { name: "To do", value: grouped.todo.length },
      { name: "In progress", value: grouped.in_progress.length },
      { name: "Done", value: grouped.done.length }
    ],
    [grouped]
  )

  const priorityChart = useMemo(() => {
    const counts = { low: 0, medium: 0, high: 0 }
    tasks.forEach((task) => {
      counts[task.priority] = (counts[task.priority] || 0) + 1
    })
    return [
      { name: "Low", value: counts.low },
      { name: "Medium", value: counts.medium },
      { name: "High", value: counts.high }
    ]
  }, [tasks])

  return (
    <div className="min-h-screen text-ink">
      <TopNav />
      <main className="px-6 pb-16">
        <section className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Dashboard</p>
              <h1 className="text-3xl md:text-4xl font-semibold">
                Signal studio for {currentUser?.name || ""}
              </h1>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="glass card">
              <p className="text-sm text-slate-500">Total signals</p>
              <p className="text-3xl font-semibold">{stats.total}</p>
            </div>
            <div className="glass card">
              <p className="text-sm text-slate-500">Completed</p>
              <p className="text-3xl font-semibold">{stats.done}</p>
            </div>
            <div className="glass card">
              <p className="text-sm text-slate-500">High priority</p>
              <p className="text-3xl font-semibold">{stats.high}</p>
            </div>
            <div className="glass card">
              <p className="text-sm text-slate-500">Avg confidence</p>
              <p className="text-3xl font-semibold">{stats.avgConfidence}%</p>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6">
            <div className="glass card space-y-4">
              <div>
                <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Analytics</p>
                <h2 className="text-2xl font-semibold">Signal distribution</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={priorityChart}>
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#2b6ae6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusChart}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={45}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {statusChart.map((entry, index) => (
                          <Cell key={`cell-${entry.name}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="glass card space-y-4">
              <div>
                <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Activity</p>
                <h2 className="text-2xl font-semibold">Recent updates</h2>
              </div>
              {timeline.length === 0 ? (
                <p className="text-slate-500">No updates yet.</p>
              ) : (
                <div className="space-y-3">
                  {timeline.map((task) => (
                    <div key={task._id} className="p-3 rounded-2xl bg-white border">
                      <p className="font-semibold">{task.title}</p>
                      <p className="text-xs text-slate-500">
                        {statusLabels[task.status]} · Updated {new Date(task.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid lg:grid-cols-[1fr_2fr] gap-6 items-start">
            <div className="space-y-6">
              <div className="glass card space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="uppercase tracking-[0.4em] text-xs text-slate-500">Signals</p>
                    <h2 className="text-2xl font-semibold">Create a new signal</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      className="px-3 py-2 rounded-full border text-sm"
                      placeholder="Search"
                      value={filters.q}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, q: event.target.value }))
                      }
                    />
                    <select
                      className="px-3 py-2 rounded-full border text-sm"
                      value={filters.status}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, status: event.target.value }))
                      }
                    >
                      <option value="">All status</option>
                      <option value="todo">To do</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                    </select>
                    <select
                      className="px-3 py-2 rounded-full border text-sm"
                      value={filters.priority}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, priority: event.target.value }))
                      }
                    >
                      <option value="">All priority</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                    <select
                      className="px-3 py-2 rounded-full border text-sm"
                      value={filters.category}
                      onChange={(event) =>
                        setFilters((prev) => ({ ...prev, category: event.target.value }))
                      }
                    >
                      <option value="">All categories</option>
                      <option value="research">Research</option>
                      <option value="trade">Trade</option>
                      <option value="risk">Risk</option>
                    </select>
                  </div>
                </div>
                <form className="grid md:grid-cols-2 gap-3" onSubmit={handleTaskSubmit}>
                  <input
                    className="px-4 py-3 rounded-2xl border"
                    placeholder="Signal title"
                    value={taskForm.title}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    required
                  />
                  <input
                    className="px-4 py-3 rounded-2xl border"
                    placeholder="Summary"
                    value={taskForm.description}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, description: event.target.value }))
                    }
                  />
                  <input
                    className="px-4 py-3 rounded-2xl border"
                    placeholder="Tags (comma separated)"
                    value={taskForm.tags}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, tags: event.target.value }))
                    }
                  />
                  <select
                    className="px-4 py-3 rounded-2xl border"
                    value={taskForm.category}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, category: event.target.value }))
                    }
                  >
                    <option value="research">Research</option>
                    <option value="trade">Trade</option>
                    <option value="risk">Risk</option>
                  </select>
                  <select
                    className="px-4 py-3 rounded-2xl border"
                    value={taskForm.status}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, status: event.target.value }))
                    }
                  >
                    <option value="todo">To do</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                  </select>
                  <select
                    className="px-4 py-3 rounded-2xl border"
                    value={taskForm.priority}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, priority: event.target.value }))
                    }
                  >
                    <option value="low">Low priority</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  <input
                    className="px-4 py-3 rounded-2xl border"
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, dueDate: event.target.value }))
                    }
                  />
                  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border">
                    <label className="text-sm text-slate-600">Confidence</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={taskForm.confidence}
                      onChange={(event) =>
                        setTaskForm((prev) => ({ ...prev, confidence: Number(event.target.value) }))
                      }
                      className="w-full"
                    />
                    <span className="text-sm font-semibold">{taskForm.confidence}%</span>
                  </div>
                  <button type="submit" className="px-4 py-3 rounded-full bg-ink text-white">
                    {editingId ? "Update signal" : "Add signal"}
                  </button>
                </form>
                {taskError && <p className="text-sm text-red-500">{taskError}</p>}
              </div>
            </div>

            <div>
              <div className="glass card pt-5 pb-5 px-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">All signals</h3>
                  {loading && <span className="text-sm text-slate-500">Loading...</span>}
                </div>
                {tasks.length === 0 ? (
                  <p className="text-slate-500">No signals yet.</p>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div key={task._id} className="p-4 rounded-2xl bg-white border">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4 className="font-semibold truncate">{task.title}</h4>
                            <p className="text-sm text-slate-600 line-clamp-2">
                              {task.description}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 capitalize">
                            {task.status.replace("_", " ")}
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                          <span className="px-2 py-1 rounded-full bg-slate-100">{task.priority}</span>
                          <span className="px-2 py-1 rounded-full bg-slate-100 capitalize">
                            {task.category}
                          </span>
                          <span className="px-2 py-1 rounded-full bg-slate-100">
                            {task.confidence ?? 50}% confidence
                          </span>
                          {task.dueDate && (
                            <span className="px-2 py-1 rounded-full bg-slate-100">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <button
                            className="px-3 py-2 rounded-full border text-sm"
                            onClick={() => startEdit(task)}
                          >
                            Edit
                          </button>
                          <button
                            className="px-3 py-2 rounded-full bg-rose-500 text-white text-sm"
                            onClick={() => deleteTask(task._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}



