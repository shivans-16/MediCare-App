
const express = require('express');
const { body } = require('express-validator');
const { validate, Patient } = require('../model/patient');
const { authenticate, requireRole } = require('../middleware/auth'); // ✅ Fixed import
const { computeagefromdob } = require('../utils/date');

const router = express.Router();

// GET — patient profile
router.get('/me', authenticate, requireRole('patient'), async (req, res) => {
    try {
        const pat = await Patient.findById(req.user._id).select('-password -googleId');
        res.ok(pat, 'Profile fetched');
    } catch (error) {
        res.serverError('Failed to fetch profile', [error.message]);
    }
});

// POST — onboarding update
router.post('/onboarding/update', authenticate, requireRole('patient'), [
    body('name').optional().notEmpty(),
    body('phone').optional().isString(),
    body('dob').optional().isISO8601(),
    body('gender').optional().isIn(['male', 'female', 'others']),
    body('bloodGroup').optional().isString(),

    body('emergencyContact').optional().isObject(),
    body('emergencyContact.name').optional().isString().notEmpty(),
    body('emergencyContact.phone').optional().isString().notEmpty(),
    body('emergencyContact.relationship').optional().isString().notEmpty(),

    body('medicalHistory').optional().isObject(),
    body('medicalHistory.allergies').optional().isString(),
    body('medicalHistory.currentMedications').optional().isString(),
    body('medicalHistory.chronicConditions').optional().isString(),

], validate, async (req, res) => {
    try {
        const updated = { ...req.body };

        if (updated.dob) {
            updated.age = computeagefromdob(updated.dob);
        }

        // Strip fields that should never be updated here
        delete updated.password;
        delete updated.googleId;
        delete updated.role;

        updated.isOnboarded = true;

        const pat = await Patient.findByIdAndUpdate(
            req.user._id,
            updated,
            { new: true }
        ).select('-password -googleId');

        res.ok(pat, 'Profile Updated');
    } catch (error) {
        res.serverError('Update failed', [error.message]);
    }
});

module.exports = router;