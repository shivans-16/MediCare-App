
const express = require("express");
const { body } = require("express-validator");

const router = express.Router();
const {Doctor} = require("../model/doctor");
const {Patient} = require("../model/patient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validate } = require('../middleware/validator');
console.log('validate type:', typeof validate); 


const signToken = (id, type) => {
  return jwt.sign({ _id: id, type }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// =========================
// Doctor Register
// =========================
router.post(
  "/doctor/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const exists = await Doctor.findOne({ email: req.body.email });
      if (exists) {
        return res.status(400).json({ success: false, message: "Doctor already exists" });
      }

      const hashed = await bcrypt.hash(req.body.password, 12);
      const doc = await Doctor.create({
        name: req.body.name,
        email: req.body.email,
        password: hashed,
      });

      const token = signToken(doc._id, "doctor");

     
      return res.status(201).json({
        success: true,
        message: "Doctor registered successfully",
        data: { id: doc._id, name: doc.name, type: "doctor", token },
      });
    } catch (error) {
      console.error("Doctor register error:", error);
      return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
  }
);

// =========================
// Doctor Login
// =========================
router.post(
  "/doctor/login",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,


  async (req, res) => {
    try {
      console.log("Doctor model:", Doctor);
      const doc = await Doctor.findOne({ email: req.body.email });
      if (!doc) return res.status(401).json({ success: false, message: "Invalid credentials" });

      const match = await bcrypt.compare(req.body.password, doc.password);
      if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

      const token = signToken(doc._id, "doctor");

      // ✅ Fixed: token inside data
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: { id: doc._id, name: doc.name, type: "doctor", token },
      });
    } catch (error) {
      console.error("Doctor login error:", error);
      return res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
  }
);

// =========================
// Patient Register
// =========================
router.post(
  "/patient/register",
  [
    body("name").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const exists = await Patient.findOne({ email: req.body.email });
      if (exists) {
        return res.status(400).json({ success: false, message: "Patient already exists" });
      }

      const hashed = await bcrypt.hash(req.body.password, 12);
      const pat = await Patient.create({
        name: req.body.name,
        email: req.body.email,
        password: hashed,
      });

      const token = signToken(pat._id, "patient");

      // ✅ Fixed: token inside data
      return res.status(201).json({
        success: true,
        message: "Patient registered successfully",
        data: { id: pat._id, name: pat.name, type: "patient", token },
      });
    } catch (error) {
      console.error("Patient register error:", error);
      return res.status(500).json({ success: false, message: "Registration failed", error: error.message });
    }
  }
);

// =========================
// Patient Login
// =========================
router.post(
  "/patient/login",
  [
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  validate,
  async (req, res) => {
    try {
      const pat = await Patient.findOne({ email: req.body.email });
      if (!pat) return res.status(401).json({ success: false, message: "Invalid credentials" });

      const match = await bcrypt.compare(req.body.password, pat.password);
      if (!match) return res.status(401).json({ success: false, message: "Invalid credentials" });

      const token = signToken(pat._id, "patient");

      // ✅ Fixed: token inside data
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: { id: pat._id, name: pat.name, type: "patient", token },
      });
    } catch (error) {
      console.error("Patient login error:", error);
      return res.status(500).json({ success: false, message: "Login failed", error: error.message });
    }
  }
);

module.exports = router;