

const express = require("express");
const { body } = require("express-validator");
const { validate } = require("../middleware/validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin = require("../model/admin");
const { authenticate, requireAdmin, requirePermission } = require("../middleware/auth");
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

// Get all users


router.get('/users', authenticate, requireAdmin, requirePermission('userManagement'), async (req, res) => {
  try {
    const { page = 1, limit = 10, type, search } = req.query;
    const skip = (page - 1) * limit;
    let query = {};

    if (type) {
      query = { ...query, type };
    }
    if (search) {
      query = {
        ...query, $or: [
          { name: { $regex: search, $options: 'i' } },  
          { email: { $regex: search, $options: 'i' } }
        ]
      }
    }

    const [patients, doctors] = await Promise.all([
      Patient.find(query).select('-password').skip(skip).limit(parseInt(limit)),
      Doctor.find(query).select('-password').skip(skip).limit(parseInt(limit))
    ]);

    const users = [  
      ...patients.map(p => ({ ...p.toObject(), type: 'patient' })),
      ...doctors.map(d => ({ ...d.toObject(), type: 'doctor' }))
    ];

    res.ok(users, 'Users retrieved');  

  } catch (error) {
    res.serverError("failed to fetch users", [error.message]);
  }
});

// update user status
router.put('/users/:userId/status', authenticate, requireAdmin, requirePermission('userManagement'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    // First check which collection the user belong

    const patient = await Patient.findById(userId);
    const doctor = await Doctor.findById(userId);

    let updatedUser;
    if (patient) {
      updatedUser = await Patient.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');
    }
    else if (doctor) {
      updatedUser = await Doctor.findByIdAndUpdate(userId, { isActive }, { new: true }).select('-password');
    }
    else {
      return res.notFound('user not found');
    }
    res.ok(updatedUser, 'User staus updated')
  } catch (error) {
    res.serverError("failed to update user status", [error.message])
  }
});

// Api for the payments to payout the doctors

router.get('/payments',authenticate,requireAdmin,requirePermission('paymentManagement'),async(req,res)=>{
  try {
    const { page = 1, limit = 10, payoutStatus } = req.query;
    const skip = (page - 1) * limit;
    let matchedQuery={status:'Completed'};
    if(payoutStatus)
    {
      matchedQuery.payoutStatus=payoutStatus;
    }

    // Get completed appointments with payment details
    const appointments=await Appointment.aggregate([
    {
      $match:matchedQuery
    },
    {
      $lookup:{
        from:'doctors',
        localField:'doctorId',
        foreignField:'_id',
        as:'doctor'
      }
    },
    {
      $unwind:'$doctor'
    },
    {
      $lookup:{
        from:'patients',
        localField:'patientId',
        foreignField:'_id',
        as:'patient'
      }
    },
    {
      $unwind:'$patient'
    },
    {
      $project:{
        _id:1,
        date:1,
        totalAmount:1,
        doctorName:'$doctor.name',
        doctorEmail:'$doctor.email',
        patientName:'$patient.name',
        patientEmail:'$patient.email',
        consultationFees:1,
        platformFees:1,
        paymentStatus:1,
        payoutStatus:1,
        payoutDate:1,
        createdAt:1

      }
    },
    {
      $sort:{createdAt:-1}
    },
    {
      $skip:skip
    },
    {
      $limit:parseInt(limit)
    }
    ]);
    res.ok(appointments,'Payments retrieved')
  } catch (error) {
    res.serverError('Failed to fetch payments'[error.message]);
  }
})

// Processing the pauout to doctors

router.put('/payments/:appointmentId/payout', authenticate, requireAdmin, requirePermission('paymentManagement'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { payoutStatus } = req.body;  

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.notFound('Appointment not found');
    }
    if (appointment.status != 'Completed') {
      return res.badRequest('Can only process the payouts for the completed appointments');
    }

    const payoutAmount = appointment.consultationFees;
    const platformFees = appointment.platformFees;

    const updateData = { payoutStatus };
    if (payoutStatus === 'Paid') {  
      updateData.payoutDate = new Date();
    }

    const updateAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate('doctorId', 'name email').populate('patientId', 'name email');

    res.ok({
      ...updateAppointment.toObject(),
      payoutAmount,
      platformFees,
      message: payoutStatus === 'Paid'  
        ? `Payout marked as paid. Doctor receives ₹${payoutAmount}, Platform keeps ₹${platformFees}`
        : `Payout ${payoutStatus.toLowerCase()} successfully`  
    }, `Payout ${payoutStatus.toLowerCase()} successfully`);  

  } catch (error) {
    res.serverError('Failed to payout payments', [error.message]);
  }
});
module.exports = router;