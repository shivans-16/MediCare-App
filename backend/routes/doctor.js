const express = require("express");
const { body } = require("express-validator");
const { Doctor, validate } = require("../model/doctor");
const { authenticate, requireRole } = require("../middleware/auth");
const Appointment = require("../model/appointment");
const router = express.Router();

// =========================
// GET — doctor profile
// =========================
router.get("/me", authenticate, requireRole("doctor"), async (req, res) => {
  try {
    const doc = await Doctor.findById(req.user._id).select("-password -googleid");
    res.ok(doc, "Profile fetched");
  } catch (error) {
    res.serverError("Failed to fetch profile", [error.message]);
  }
});

// =========================
// Shared validation rules
// =========================
const onboardingValidation = [
  body("name").optional().notEmpty().withMessage("Name cannot be empty"),
  body("specialization").optional().notEmpty().withMessage("Specialization cannot be empty"),
  body("qualification").optional().notEmpty().withMessage("Qualification cannot be empty"),
  body("category").optional().isArray().withMessage("Category must be an array"),
  body("experience").optional().isInt({ min: 0 }).withMessage("Experience must be a non-negative number"),
  body("about").optional().isString().withMessage("About must be a string"),
  body("fees").optional().isInt({ min: 0 }).withMessage("Fees must be a non-negative number"),

  body("hospitalInfo").optional().isObject(),
  body("hospitalInfo.name").optional().isString(),
  body("hospitalInfo.address").optional().isString(),
  body("hospitalInfo.city").optional().isString(),

  body("availabilityRange.startDate").optional().isString(),
  body("availabilityRange.endDate").optional().isString(),
  body("availabilityRange.excludedWeekdays").optional().isArray(),
  body("availabilityRange.excludedWeekdays.*").optional().isInt({ min: 0, max: 6 }),

  body("dailyTimeRanges").optional().isArray({ min: 1 }),
  body("dailyTimeRanges.*.start").optional().isString(),
  body("dailyTimeRanges.*.end").optional().isString(),

  body("slotDurationMinutes").optional().isInt({ min: 5, max: 180 }),
];

// =========================
// Shared handler
// =========================
const onboardingHandler = async (req, res) => {
  try {
    const {
      name,
      specialization,
      qualification,
      category,
      experience,
      about,
      fees,
      hospitalInfo,
      availabilityRange,
      dailyTimeRanges,
      slotDurationMinutes,
    } = req.body;

    const doctor = await Doctor.findById(req.user._id);
    if (!doctor) {
      return res.status(404).json({ success: false, message: "Doctor not found" });
    }

    if (name !== undefined) doctor.name = name;
    if (specialization !== undefined) doctor.specialization = specialization;
    if (qualification !== undefined) doctor.qualification = qualification;
    if (category !== undefined) doctor.category = category;
    if (experience !== undefined) doctor.experience = experience;
    if (about !== undefined) doctor.about = about;
    if (fees !== undefined) doctor.fees = fees;

    if (hospitalInfo !== undefined) {
      doctor.hospitalInfo = {
        ...(doctor.hospitalInfo?.toObject?.() || doctor.hospitalInfo || {}),
        ...hospitalInfo,
      };
    }

    if (availabilityRange !== undefined) {
      doctor.availabilityRange = {
        startDate: availabilityRange.startDate || doctor.availabilityRange?.startDate,
        endDate: availabilityRange.endDate || doctor.availabilityRange?.endDate,
        excludedWeekDays:
          availabilityRange.excludedWeekdays ??
          doctor.availabilityRange?.excludedWeekDays ??
          [],
      };
    }

    if (dailyTimeRanges !== undefined) doctor.dailyTimeRanges = dailyTimeRanges;
    if (slotDurationMinutes !== undefined) doctor.slotDurationMinutes = slotDurationMinutes;

    // Auto mark onboarded if all required fields are present
    if (
      doctor.specialization &&
      doctor.qualification &&
      doctor.category?.length > 0 &&
      doctor.experience !== undefined &&
      doctor.fees !== undefined &&
      doctor.hospitalInfo?.name &&
      doctor.hospitalInfo?.address &&
      doctor.hospitalInfo?.city
    ) {
      doctor.isOnboarded = true;
    }

    await doctor.save();

    const updatedDoc = await Doctor.findById(req.user._id).select("-password -googleid");

    res.ok(updatedDoc, "Profile updated successfully");
  } catch (error) {
    res.serverError("Update failed", [error.message]);
  }
};

// ✅ Both POST and PUT point to same handler
router.post("/onboarding/update", authenticate, requireRole("doctor"), onboardingValidation, validate, onboardingHandler);
router.put("/onboarding/update", authenticate, requireRole("doctor"), onboardingValidation, validate, onboardingHandler);


// GET — all doctors list with filters
router.get("/list", async (req, res) => {
  try {
    const {
      search,
      specialization,
      category,
      city,
      sortBy = "experience",
      sortOrder = "desc",
      page = 1,
      limit = 20,
    } = req.query;

    // Build filter object
    const filter = { isOnboarded: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    if (specialization) {
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    if (category) {
      filter.category = { $in: [category] };
    }

    if (city) {
      filter["hospitalInfo.city"] = { $regex: city, $options: "i" };
    }

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Doctor.countDocuments(filter);

    const doctors = await Doctor.find(filter)
      .select("-password -googleid")
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    res.ok({ 
      data: doctors,
      meta: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      }
    }, "Doctors fetched successfully");

  } catch (error) {
    res.serverError("Failed to fetch doctors", [error.message]);
  }
});

// ✅ Dashboard route - PEHLE rakho /:doctorId se upar
router.get('/dashboard', authenticate, requireRole('doctor'), async (req, res) => {
  try {
    const doctorId = req.user._id;  // ✅ req.id nahi, req.user._id
    const now = new Date();

    const doctor = await Doctor.findById(doctorId); // ✅ doctor fetch karo
    if (!doctor) {
      return res.notFound('Doctor not found');
    }

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const todayAppointment = await Appointment.find({
      doctorId,
      slotStartIso: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: 'Cancelled' }
    })
    .populate('patientId', 'name profileImage age email phone')
    .populate('doctorId', 'name fees profileImage specialization')
    .sort({ slotStartIso: 1 });

    const upcomingAppointment = await Appointment.find({
      doctorId,
      slotStartIso: { $gt: endOfDay },
      status: { $ne: 'Cancelled' }  // ✅ 'Scheduled' nahi, 'Cancelled' hona chahiye
    })
    .populate('patientId', 'name profileImage age email phone')
    .populate('doctorId', 'name fees profileImage specialization')
    .sort({ slotStartIso: 1 })
    .limit(5);

    const uniquePatientIds = await Appointment.distinct('patientId', { doctorId }); // ✅ typo fix
    const totalPatients = uniquePatientIds.length;

    const completedAppointmentCount = await Appointment.countDocuments({
      doctorId,
      status: 'Completed'
    });

    const totalAppointment = await Appointment.find({
      doctorId,
      status: 'Completed'
    });

    const totalRevenue = totalAppointment.reduce((sum, apt) => sum + (apt.fees || doctor.fees || 0), 0);

    const dashboardData = {
      user: {
        name: doctor.name,
        fees: doctor.fees,
        profileImage: doctor.profileImage,
        specialization: doctor.specialization,
        hospitalInfo: doctor.hospitalInfo
      },
      stats: {
        totalPatients,
        todayAppointments: todayAppointment.length, // ✅ todayAppointment.length
        totalRevenue,
        completedAppointments:completedAppointmentCount,
        averageRating: 4.8
      },
      todayAppointment,       // ✅
      upcomingAppointment,
      performance: {
        patientSatisfaction: 4.8,
        completionRate: 98,
        responseTime: '< 2min'
      }
    };

    res.ok(dashboardData, 'Dashboard data retrieved');

  } catch (error) {
    console.error('Dashboard error', error);
    res.serverError('failed to fetch doctor dashboard', [error.message]);
  }
}); // ✅ closing sahi hai


// ✅ Dynamic route - BAAD mein rakho
router.get('/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const doctor = await Doctor.findById(doctorId).select('-password -googleId').lean();
    if (!doctor) {
      return res.notFound('Doctor not found');
    }
    res.ok(doctor, 'doctor details fetched successfully');
  } catch (error) {
    res.serverError('fetching doctor failed', [error.message]);
  }
});



http://localhost:8000/api/doctor/list
// router.get('/dashbaord',authenticate,requireRole('doctor',async(req,res)=>{
//   try{
//     const doctorId=req.id;
//     const now=new Date();

//     const startOfDay=new Date(now.getFullYear(),now.getMonth(),now.getDate(),0,0,0,0)
//     const endOfDay=new Date(now.getFullYear(),now.getMonth(),now.getDate(),23,59,59,999)

//     if(!doctor)
//     {
//       return res.notFound('Doctot not found')
//     }
//     const todayAppointment=await Appointment.find({
//       doctorId,
//       slotStartIso:{$gte:startOfDay,$lte:endOfDay},
//       status:{$ne:'Cancelled'}
//     })
//     .populate('patientId','name profileImage age email phone')
//     .populate('doctorId','name fees profileImage specialization')
//     .sort({slotStartIso:1})


//     const upcomingAppointment=await Appointment.find({
//       doctorId,
//       slotStartIso:{$gt:endOfDay},
//       status:{$ne:'Scheduled'}
//     })
//     .populate('patientId','name profileImage age email phone')
//     .populate('doctorId','name fees profileImage specialization')
//     .sort({slotStartIso:1})
//     .limit(5)


//     const uniquePatiendIds=await Appointment.distinct('patiendId',{doctorId});
//     const totalPatients=uniquePatiendIds.length;

//     const completedAppointment=await Appointment.countDocuments({
//       doctorId,
//       status:'Completed'
//     });

//     const totalAppointment=await Appointment.find({
//       doctorId,
//       status:'Completed'
//     });

//     const totalRevenue=totalAppointment.reduce((sum,apt)=>sum + (apt.fees || doctor.fees || 0),0);
//      const dashboardData={
//       user:{
//         name:doctor.name,
//         fees:doctor.fees,
//         profileImage:doctor.profileImage,
//         specialization:doctor.specialization,
//         hospitalInfo:doctor.hospitalInfo

//       },
//       stats:{
//         totalPatients,
//         todayAppointment:totalAppointment.length,
//         totalRevenue,
//         completedAppointment,
//         averageRating:4.8
//       },
//       totalAppointment,
//       upcomingAppointment,
//       performance:{
//         patientSatisfaction:4.8,
//         completionRate:98,
//         responseTime:'< 2min'
//             }
//      }
//      res.ok(dashboardData,'Dashboard data retireved')
//   }catch(error){
//     console.error('Dashboard error',error);
//     res.serverError('failed to fetch doctor dashboard',[error.message]);
//   }
// }))



// router.get('/:doctorId',validate,async(req,res)=>{
//   try{
//     const {doctorId}=req.params;
//     const doctor=await Doctor.findById(doctorId).select(
//       '-password -googleId'
//     ).lean();
//     if(!doctor){
//       return res.notFound('Doctor not found')
//     }
//     res.ok(doctor,'doctor details fetched successfully')

//   }catch(error){
//     res.serverError('fetching doctor failed',[error.message])
//   }
// })


module.exports = router;
