

const express = require("express");
const { body } = require("express-validator");
const {validate} = require("../middleware/validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../model/admin");
const { authenticate, requireAdmin } = require("../middleware/auth");
const { Patient } = require("../model/patient");
const { Doctor } = require("../model/doctor");
const Appointment = require("../model/appointment");

const router = express.Router();

const signToken = (id, type) =>
  jwt.sign({ id, type }, process.env.JWT_SECRET, { expiresIn: "7d" });

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

router.get("/profile", authenticate, requireAdmin, async (req, res) => {
  try {
    const admin = await Admin.findById(req.user._id).select("-password");
    res.status(200).json({ message: "Profile fetched successfully", admin });
  } catch (err) {
    res.status(500).json({ error: "Profile fetch failed", details: err.message });
  }
});

router.get('/dashboard', authenticate, requireAdmin, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      completedAppointments,
      pendingAppointments,
      totalRevenue
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments(),
      Appointment.countDocuments({ status: "Completed" }),
      Appointment.countDocuments({ status: "Scheduled" }),
      Appointment.aggregate([
        { $match: { status: 'Completed' } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ])
    ]);

    const monthlyRevenue = await Appointment.aggregate([
      {
        $match: {
          status: 'Completed',
          date: { $gte: sixMonthsAgo }
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const [userGrowth, appointmentStats] = await Promise.all([
      Patient.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo }
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            patients: { $sum: 1 }
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Appointment.aggregate([
        {
          $match: {
            date: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ])
    ]);

    res.ok({
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        completedAppointments,
        pendingAppointments,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      monthlyRevenue,
      userGrowth,
      appointmentStats
    }, 'Dashboard data fetched successfully');

  } catch (error) {
    res.serverError('Dashboard data fetched failed', [error.message]);
  }
});

module.exports = router;