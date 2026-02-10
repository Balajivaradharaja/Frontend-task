const express = require("express")
const { body, validationResult } = require("express-validator")
const Task = require("../models/Task")
const auth = require("../middleware/auth")

const router = express.Router()

const canViewAll = (role) => role === "manager" || role === "founder"
const canManageAll = (role) => role === "founder"

router.get("/", auth, async (req, res) => {
  const { q, status, priority, category } = req.query
  const filter = canViewAll(req.user.role) ? {} : { user: req.user.id }

  if (status) filter.status = status
  if (priority) filter.priority = priority
  if (category) filter.category = category
  if (q) {
    filter.$or = [
      { title: { $regex: q, $options: "i" } },
      { description: { $regex: q, $options: "i" } },
      { tags: { $regex: q, $options: "i" } }
    ]
  }

  const tasks = await Task.find(filter).sort({ updatedAt: -1 })
  res.json(tasks)
})

router.post(
  "/",
  auth,
  [body("title").trim().notEmpty().withMessage("Title is required")],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { title, description, status, priority, dueDate, tags, confidence, category } = req.body
    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      confidence,
      category
    })

    res.status(201).json(task)
  }
)

router.put("/:id", auth, async (req, res) => {
  const updates = {
    title: req.body.title,
    description: req.body.description,
    status: req.body.status,
    priority: req.body.priority,
    dueDate: req.body.dueDate,
    tags: req.body.tags,
    confidence: req.body.confidence,
    category: req.body.category
  }

  const query = canViewAll(req.user.role)
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.id }

  const task = await Task.findOneAndUpdate(query, updates, { new: true })

  if (!task) {
    return res.status(404).json({ message: "Task not found" })
  }

  res.json(task)
})

router.delete("/:id", auth, async (req, res) => {
  const query = canManageAll(req.user.role)
    ? { _id: req.params.id }
    : { _id: req.params.id, user: req.user.id }

  const task = await Task.findOneAndDelete(query)
  if (!task) {
    return res.status(404).json({ message: "Task not found" })
  }
  res.json({ message: "Task deleted" })
})

module.exports = router
