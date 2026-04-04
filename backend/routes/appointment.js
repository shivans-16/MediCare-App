const express = require('express');
const Appointment = require('../model/appointment');
const { authenticate, requireRole } = require('../middleware/auth');
const { query, body } = require('express-validator');
const {validate} = require('../middleware/validator');
const router = express.Router();

// ===========================
// GET - Doctor's appointments
// ===========================
router.get('/doctor', authenticate, requireRole('doctor'), [
    query('status').optional(),
], validate, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { doctorId: req.user._id };  // ✅ Fix

        if (status) {
            const statusArray = Array.isArray(status) ? status : [status];
            filter.status = { $in: statusArray };
        }

        const appointments = await Appointment.find(filter)
            .populate('patientId', 'name email phone dob age profileImage')
            .populate('doctorId', 'name fees phone specialization profileImage')
            .sort({ slotStartIso: 1 });

        res.ok(appointments, 'Appointments fetched successfully');
    } catch (error) {
        console.error('Doctor appointment fetch error', error);
        res.serverError('Failed to fetch appointments', [error.message]);
    }
});

// ===========================
// GET - Patient's appointments
// ===========================
router.get('/patient', authenticate, requireRole('patient'), [
    query('status').optional(),
], validate, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { patientId: req.user._id };  // ✅ Fix

        if (status) {
            const statusArray = Array.isArray(status) ? status : [status];
            filter.status = { $in: statusArray };
        }

        const appointments = await Appointment.find(filter)
            .populate('doctorId', 'name fees phone specialization hospitalInfo profileImage')
            .populate('patientId', 'name email profileImage')
            .sort({ slotStartIso: 1 });

        res.ok(appointments, 'Appointments fetched successfully');
    } catch (error) {
        console.error('Patient appointment fetch error', error);
        res.serverError('Failed to fetch appointments', [error.message]);
    }
});

// ===========================
// GET - Booked slots
// ===========================
router.get('/booked-slots', async (req, res) => {
    try {
        const { doctorId, date } = req.query;

        if (!doctorId || !date) {
            return res.status(400).json({
                success: false,
                message: 'doctorId and date are required'
            });
        }

        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const bookedAppointments = await Appointment.find({
            doctorId,
            slotStartIso: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'Cancelled' }
        }).select('slotStartIso');

        const bookedSlots = bookedAppointments.map(apt => {
            const d = new Date(apt.slotStartIso);
            const hh = String(d.getHours()).padStart(2, '0');
            const mm = String(d.getMinutes()).padStart(2, '0');
            return `${hh}:${mm}:00`;
        });

        res.ok(bookedSlots, 'Booked slots retrieved');
    } catch (error) {
        res.serverError('Failed to fetch booked slots', [error.message]);
    }
});

// ===========================
// POST - Book appointment
// ===========================
router.post('/book', authenticate, requireRole('patient'), [
    body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
    body('slotStartIso').isISO8601().withMessage('Valid start time is required'),
    body('slotEndIso').isISO8601().withMessage('Valid end time is required'),
    body('consultationType')
        .isIn(['Video Consultation', 'Voice Call'])
        .withMessage('Valid consultation type is required'),
    body('symptoms').isString().trim().notEmpty().withMessage('Symptoms is required'),
    body('date').notEmpty().withMessage('Date is required'),
    body('consultationFees').isNumeric().withMessage('consultationFees is required'),
    body('platformFees').isNumeric().withMessage('platformFees is required'),
    body('totalAmount').isNumeric().withMessage('totalAmount is required'),
], validate, async (req, res) => {
    try {
        const {
            doctorId,
            slotStartIso,
            slotEndIso,
            date,
            consultationType,
            symptoms,
            consultationFees,
            totalAmount,
            platformFees
        } = req.body;

        // Check conflicting appointment
        const conflictingAppointment = await Appointment.findOne({
            doctorId,
            status: { $in: ['Scheduled', 'In Progress'] },
            $or: [{
                slotStartIso: { $lt: new Date(slotEndIso) },
                slotEndIso: { $gt: new Date(slotStartIso) },
            }]
        });

        if (conflictingAppointment) {
            return res.status(409).json({
                success: false,
                message: 'This time slot is already booked'
            });
        }

        const zegoRoomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const appointment = new Appointment({
            doctorId,
            patientId: req.user._id,  // ✅ Fix
            date: new Date(date),
            slotStartIso: new Date(slotStartIso),
            slotEndIso: new Date(slotEndIso),
            consultationType,
            symptoms,
            zegoRoomId,
            status: 'Scheduled',
            consultationFees,
            platformFees,
            totalAmount,
            paymentStatus: 'Pending',
            payoutStatus: 'Pending'
        });

        await appointment.save();
        await appointment.populate('doctorId', 'name fees phone specialization hospitalInfo profileImage');
        await appointment.populate('patientId', 'name email');

        res.created(appointment, 'Appointment booked successfully');
    } catch (error) {
        console.error('Book appointment error', error);
        res.serverError('Failed to book appointment', [error.message]);
    }
});

// ===========================
// PUT - Join consultation
// ===========================
router.put('/join/:id', authenticate, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name profileImage')
            .populate('doctorId', 'name profileImage');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // ✅ Fix: role check karo
        const isDoctor = req.userRole === 'doctor' &&
            appointment.doctorId._id.toString() === req.user._id.toString();
        const isPatient = req.userRole === 'patient' &&
            appointment.patientId._id.toString() === req.user._id.toString();

        if (!isDoctor && !isPatient) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        appointment.status = 'In Progress';
        await appointment.save();

        res.ok(
            { roomId: appointment.zegoRoomId, appointment },
            'Consultation joined successfully'
        );
    } catch (error) {
        console.error('Join consultation error', error);
        res.serverError('Failed to join consultation', [error.message]);
    }
});

// ===========================
// PUT - End consultation
// ===========================
router.put('/:id/end', authenticate, requireRole('doctor'), async (req, res) => {
    try {
        const { prescription, notes } = req.body;

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // ✅ Fix: sirf doctor hi end kar sakta hai
        if (appointment.doctorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        appointment.status = 'Completed';
        if (prescription) appointment.prescription = prescription;
        if (notes) appointment.notes = notes;
        appointment.updatedAt = new Date();
        await appointment.save();

        await appointment.populate('patientId', 'name email profileImage');
        await appointment.populate('doctorId', 'name specialization profileImage');

        res.ok(appointment, 'Consultation completed successfully');
    } catch (error) {
        console.error('End consultation error', error);
        res.serverError('Failed to end consultation', [error.message]);
    }
});

// ===========================
// PUT - Update appointment status
// ===========================
router.put('/status/:id', authenticate, requireRole('doctor'), async (req, res) => {
    try {
        const { status } = req.body;

        const validStatuses = ['Scheduled', 'Completed', 'Cancelled', 'In Progress'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const appointment = await Appointment.findById(req.params.id);

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }
        console.log(appointment);
        console.log(req.user._id);

        // ✅ Fix: req.user._id use karo
        if (appointment.doctorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        appointment.status = status;
        appointment.updatedAt = new Date();
        await appointment.save();

        await appointment.populate('patientId', 'name email profileImage');
        await appointment.populate('doctorId', 'name specialization profileImage');

        res.ok(appointment, 'Appointment status updated successfully');
    } catch (error) {
        console.error('Update appointment status error', error);
        res.serverError('Failed to update appointment status', [error.message]);
    }
});

// ===========================
// GET - Single appointment
// ✅ :id sabse LAST mein
// ===========================
router.get('/:id', authenticate, async (req, res) => {
    try {
        const appointment = await Appointment.findById(req.params.id)
            .populate('patientId', 'name email phone dob age profileImage')
            .populate('doctorId', 'name fees phone specialization hospitalInfo profileImage');

        if (!appointment) {
            return res.status(404).json({ success: false, message: 'Appointment not found' });
        }

        // ✅ Fix: req.userRole aur req.user._id use karo
        if (
            req.userRole === 'doctor' &&
            appointment.doctorId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        if (
            req.userRole === 'patient' &&
            appointment.patientId._id.toString() !== req.user._id.toString()
        ) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        res.ok(appointment, 'Appointment fetched successfully');
    } catch (error) {
        console.error('Get appointment error', error);
        res.serverError('Failed to get appointment', [error.message]);
    }
});

module.exports = router;



