


const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { computeagefromdob } = require("../utils/date");

const emergencyDetailSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
  },
  { _id: false }
);

const medicalHistorySchema = new mongoose.Schema(
  {
    allergies: { type: String, default: "" },
    currentMedications: { type: String, default: "" },
    chronicConditions: { type: String, default: "" },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    googleId: { type: String, unique: true, sparse: true },
    profileImage: { type: String },
    phone: { type: String },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String, enum: ["male", "female", "others"] },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
    },
    emergencyContact: emergencyDetailSchema,  
    medicalHistory: medicalHistorySchema,
    isVerified: { type: Boolean, default: false },
    isOnboarded: { type: Boolean, default: false },
    type: { type: String, default: "patient" },
  },
  { timestamps: true }
);


patientSchema.pre("save", function () {
  if (this.dob && this.isModified("dob")) {
    this.age = computeagefromdob(this.dob);
  }
});

const Patient = mongoose.model("Patient", patientSchema);


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

module.exports = { Patient, validate }; 