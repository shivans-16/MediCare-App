

const express = require("express");
const { body } = require("express-validator");
const {validate} = require("../middleware/validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../model/admin");
const { authenticate, requireAdmin } = require("../middleware/auth");

const router = express.Router();

const signToken = (id, type) =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: "7d" });

// =========================
// POST — Admin login
// =========================
router.post(
  "/auth/login",
  [
    body("email").isEmail(),
    body("password").notEmpty(),
  ],
  validate,
  async (req, res) => {
    try {
      const admin = await Admin.findOne({ email: req.body.email });
      if (!admin || !admin.isActive) {
        return res.status(401).json({ error: "Invalid credentials or inactive account" });
      }

      const validatePassword = await bcrypt.compare(req.body.password, admin.password);
      if (!validatePassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      admin.lastLogin = new Date();
      await admin.save();

      const token = signToken(admin._id, "admin");
      res.status(200).json({
        message: "Admin login successfully",
        token,
        user: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
          permissions: admin.permissions,
          type: "admin",
        },
      });
    } catch (err) {
      res.status(500).json({ error: "Login failed", details: err.message });
    }
  }
);

// =========================
// GET — Admin profile
// =========================
router.get("/profile", authenticate, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    res.status(200).json({ message: "Profile fetched successfully", admin });
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed", details: err.message });
  }
});

module.exports = router;
