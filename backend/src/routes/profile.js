const express = require("express")
const { body, validationResult } = require("express-validator")
const User = require("../models/User")
const auth = require("../middleware/auth")

const router = express.Router()

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password")
  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }
  res.json(user)
})

router.put(
  "/me",
  auth,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required")
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, email } = req.body
    const existing = await User.findOne({ email, _id: { $ne: req.user.id } })
    if (existing) {
      return res.status(400).json({ message: "Email already in use" })
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true }
    ).select("-password")

    res.json(user)
  }
)

router.post(
  "/change-password",
  auth,
  [
    body("currentPassword").isLength({ min: 6 }).withMessage("Current password required"),
    body("newPassword").isLength({ min: 6 }).withMessage("New password too short")
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const user = await User.findById(req.user.id)
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    const match = await user.comparePassword(req.body.currentPassword)
    if (!match) {
      return res.status(400).json({ message: "Current password is incorrect" })
    }

    user.password = req.body.newPassword
    await user.save()

    res.json({ message: "Password updated" })
  }
)

module.exports = router
