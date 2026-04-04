
const mongoose = require("mongoose");
const { validationResult } = require("express-validator"); 

const healthcareCategoriesList = [
  "Primary Care",
  "Manage Your Condition",
  "Mental & Behavioral Health",
  "Sexual Health",
  "Children's Health",
  "Senior Health",
  "Women's Health",
  "Men's Health",
  "Wellness",
];

const dailytimerangeSchema = new mongoose.Schema(
  { start: String, end: String },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    startDate: String,
    endDate: String,
    excludedWeekDays: { type: [Number], default: [] },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  googleid: { type: String, unique: true, sparse: true },
  profileimage: { type: String },
  specialization: {
    type: String,
    enum: [
      "Cardiologist",
      "Dermatologist",
      "Orthopedic",
      "Pediatrician",
      "Neurologist",
      "Gynecologist",
      "General Physician",
      "ENT Specialist",
      "Psychiatrist",
      "Ophthalmologist",
    ],
  },
  category: { type: [String], enum: healthcareCategoriesList },
  qualification: String,
  experience: Number,
  about: String,
  fees: Number,
  hospitalInfo: {         
    name: String,
    address: String,
    city: String,
  },
  availabilityRange: availabilitySchema,
  dailyTimeRanges: { type: [dailytimerangeSchema], default: [] }, 
  slotDurationMinutes: { type: Number, default: 30 },
  isVerified: { type: Boolean, default: false },
  isOnboarded: { type: Boolean, default: false },
  type: { type: String, default: "doctor" },
});


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

const Doctor = mongoose.model("Doctor", doctorSchema);

module.exports = { Doctor, validate };


