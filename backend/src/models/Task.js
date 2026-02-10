const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date },
    tags: [{ type: String, trim: true }],
    confidence: { type: Number, min: 0, max: 100, default: 50 },
    category: { type: String, trim: true, default: "general" }
  },
  { timestamps: true }
)

module.exports = mongoose.model("Task", taskSchema)
