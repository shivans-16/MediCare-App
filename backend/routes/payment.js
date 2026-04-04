const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { authenticate, requireRole } = require('../middleware/auth');
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const Appointment = require('../model/appointment');

const router = express.Router();

const razorPay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post('/create-order', authenticate, requireRole('patient'),
    [
        body('appointmentId').isMongoId().withMessage('Valid appointment ID is required')
    ], validate, async (req, res) => {
        try {
            const { appointmentId } = req.body;

            const appointment = await Appointment.findById(appointmentId)
                .populate('doctorId', 'name specialization')
                .populate('patientId', 'name email phone');

            if (!appointment) return res.notFound('Appointment not found');

            // ✅ Fixed: req.auth undefined tha — auth.js req.user set karta hai
            if (appointment.patientId._id.toString() !== req.user._id.toString()) {
                return res.status(403).json({ success: false, message: 'Access denied' });
            }

            if (appointment.paymentStatus === 'Paid') {
                return res.status(400).json({ success: false, message: 'Payment already completed' });
            }

            const order = await razorPay.orders.create({
                amount: appointment.totalAmount * 100,
                currency: 'INR',
                receipt: `appointment_${appointmentId}`,
                notes: {
                    appointmentId,
                    doctorName: appointment.doctorId.name,
                    patientName: appointment.patientId.name,
                    consultationType: appointment.consultationType,
                    date: appointment.date,
                    slotStart: appointment.slotStartIso,
                    slotEnd: appointment.slotEndIso
                }
            });

            return res.status(200).json({
                success: true,
                message: 'Payment order created successfully',
                data: {
                    orderId: order.id,
                    amount: appointment.totalAmount,
                    currency: 'INR',
                    key: process.env.RAZORPAY_KEY_ID
                }
            });

        } catch (error) {
            console.error('create-order error:', error);
            return res.status(500).json({ success: false, message: 'Failed to create order', errors: [error.message] });
        }
    });


router.post('/verify-payment', authenticate, requireRole('patient'), [
    body('appointmentId').isMongoId().withMessage('Valid appointment ID is required'),
    body('razorpay_order_id').isString().withMessage('Razorpay order ID is required'),
    body('razorpay_payment_id').isString().withMessage('Razorpay payment ID is required'),
    body('razorpay_signature').isString().withMessage('Razorpay signature is required'),
], validate, async (req, res) => {
    try {
        const { appointmentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const appointment = await Appointment.findById(appointmentId)
            .populate('doctorId', 'name specialization')
            .populate('patientId', 'name email phone');

        if (!appointment) return res.notFound('Appointment not found');

        // ✅ Fixed: req.auth undefined tha — auth.js req.user set karta hai
        if (appointment.patientId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Access denied' });
        }

        // Verify Razorpay signature
        const payloadBody = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(payloadBody)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment verification failed' });
        }

        appointment.paymentStatus = 'Paid';
        appointment.paymentMethod = 'Razorpay';
        appointment.razorpayPaymentId = razorpay_payment_id;
        appointment.razorpayOrderId = razorpay_order_id;
        appointment.razorpaySignature = razorpay_signature;
        appointment.paymentDate = new Date();

        await appointment.save();

        await appointment.populate('doctorId', 'name specialization fees hospitalInfo profileImage');
        await appointment.populate('patientId', 'name email phone profileImage');

        return res.status(200).json({
            success: true,
            message: 'Payment verified and appointment confirmed successfully',
            data: appointment
        });

    } catch (error) {
        console.error('verify-payment error:', error);
        return res.status(500).json({ success: false, message: 'Failed to verify payment', errors: [error.message] });
    }
});

module.exports = router;
