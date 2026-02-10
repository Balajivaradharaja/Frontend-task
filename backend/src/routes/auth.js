const express = require("express")
const { body, validationResult } = require("express-validator")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const nodemailer = require("nodemailer")
const User = require("../models/User")

const router = express.Router()

const createToken = (user) => {
  const role = user.role || "analyst"
  return jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "7d" })
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

const sendResetEmail = async ({ to, name, resetUrl }) => {
  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  return transporter.sendMail({
    from,
    to,
    subject: "Reset your PulseBoard password",
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.6">
        <h2>Password reset request</h2>
        <p>Hi ${name || "there"},</p>
        <p>Click the button below to reset your password. This link will expire in 30 minutes.</p>
        <p><a href="${resetUrl}" style="display:inline-block;padding:10px 18px;background:#0c0f14;color:#fff;text-decoration:none;border-radius:18px">Reset Password</a></p>
        <p>If you did not request this, you can safely ignore this email.</p>
      </div>
    `
  })
}

router.post(
  "/register",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password too short")
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { name, email, password } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: "Email already in use" })
    }

    const user = await User.create({ name, email, password })
    const token = createToken(user)

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || "analyst" }
    })
  }
)

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("password").notEmpty().withMessage("Password required")
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const match = await user.comparePassword(password)
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const token = createToken(user)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role || "analyst" }
    })
  }
)

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Valid email required")],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { email } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.json({ message: "If that email exists, a reset link was sent." })
    }

    const token = crypto.randomBytes(32).toString("hex")
    user.resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")
    user.resetPasswordExpires = Date.now() + 30 * 60 * 1000
    await user.save()

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173"
    const resetUrl = `${clientUrl}/reset-password?token=${token}&email=${encodeURIComponent(
      email
    )}`

    try {
      await sendResetEmail({ to: email, name: user.name, resetUrl })
      res.json({ message: "Reset link sent to your email." })
    } catch (error) {
      console.error("Email send failed", error)
      res.status(500).json({ message: "Unable to send reset email" })
    }
  }
)

router.post(
  "/reset-password",
  [
    body("email").isEmail().withMessage("Valid email required"),
    body("token").notEmpty().withMessage("Token required"),
    body("password").isLength({ min: 6 }).withMessage("Password too short")
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg })
    }

    const { email, token, password } = req.body
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" })
    }

    user.password = password
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    res.json({ message: "Password updated successfully" })
  }
)

module.exports = router
