


import { httpService } from '@/src/services/httpService';
import { useAuthStore } from '@/src/stores/authStore';
import React, { useEffect, useRef, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { CheckCircle, Shield, CreditCard, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatePresence, motion } from 'framer-motion';

interface PaymentStepInterface {
  selectedDate: Date;
  selectedSlot: string;
  consultationType: string;
  doctorName: string;
  slotDuration: number;
  consultationFee: number;
  isProcessing: boolean;
  onBack: () => void;
  onConfirm: () => void;
  onPaymentSuccess?: (appointment: any) => void;
  loading: boolean;
  appointmentId?: string;
  patientName?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentStep = ({
  selectedDate,
  selectedSlot,
  consultationType,
  doctorName,
  slotDuration,
  consultationFee,
  isProcessing,
  onBack,
  onConfirm,
  onPaymentSuccess,
  loading,
  appointmentId,
  patientName,
}: PaymentStepInterface) => {
  const { user } = useAuthStore();
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'failed'>('idle');
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [scriptLoaded, setScriptLoaded] = useState<boolean>(false);
  const hasAutoTriggered = useRef(false); // ✅ prevent double trigger

  const platformFees = Math.round(consultationFee * 0.1);
  const totalAmount = consultationFee + platformFees;

  // ✅ FIX 1: Load Razorpay script on mount — don't wait for appointmentId
  useEffect(() => {
    if (!window.Razorpay) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []); // ✅ empty deps — runs once on mount

  // ✅ FIX 2: Auto-trigger payment when appointmentId arrives + script is ready
  useEffect(() => {
    if (
      appointmentId &&
      patientName &&
      scriptLoaded &&
      paymentStatus === 'idle' &&
      !hasAutoTriggered.current
    ) {
      hasAutoTriggered.current = true;
      handlePayment();
    }
  }, [appointmentId, scriptLoaded]); // triggers when either changes

  const handlePayment = async () => {
    if (!appointmentId || !patientName) {
      onConfirm();
      return;
    }
    if (!scriptLoaded || !window.Razorpay) {
      alert('Payment gateway is still loading. Please wait a moment.');
      return;
    }

    try {
      setIsPaymentLoading(true);
      setPaymentStatus('processing');

      // Step 1: Create Razorpay order from backend
      const orderRes = await httpService.postWithAuth('/payment/create-order', { appointmentId });

      if (!orderRes.success) {
        throw new Error(orderRes.message || 'Failed to create payment order');
      }

      const { orderId, amount, currency, key } = orderRes.data;

      // Step 2: Open Razorpay checkout
      const options = {
        key,
        amount: amount * 100,
        currency,
        name: 'MediCare-Doctor Consultancy Platform',
        description: `Consultation with Dr. ${doctorName}`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            // Step 3: Verify payment on backend
            const verifyRes = await httpService.postWithAuth('/payment/verify-payment', {
              appointmentId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setPaymentStatus('success');
              if (onPaymentSuccess) {
                onPaymentSuccess(verifyRes.data);
              } else {
                onConfirm();
              }
            } else {
              throw new Error(verifyRes.message || 'Payment verification failed');
            }
          } catch (err: any) {
            console.error('Payment Verification failed', err);
            setPaymentStatus('failed');
          } finally {
            setIsPaymentLoading(false);
          }
        },
        prefill: {
          name: patientName,
          email: user?.email,
          contact: user?.phone,
        },
        notes: { appointmentId, doctorName, patientName },
        theme: { color: '#3B82F6' },
        modal: {
          ondismiss: () => {
            setPaymentStatus('idle');
            setIsPaymentLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      console.error('Payment error', err);
      setPaymentStatus('failed');
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handlePayNow = () => {
    if (appointmentId && patientName) {
      handlePayment();
    } else {
      onConfirm(); // triggers handleBooking in page.tsx to create appointment first
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Payment & Confirmation</h3>

        {/* Booking Summary Card */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h4 className="font-semibold text-gray-900 mb-4">Booking Summary</h4>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Date & Time</span>
              <span className="font-medium">
                {selectedDate?.toLocaleDateString()} at {selectedSlot}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Doctor</span>
              <span className="font-medium">{doctorName}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Type</span>
              <span className="font-medium">{consultationType}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Duration</span>
              <span className="font-medium">{slotDuration} minutes</span>
            </div>

            <Separator />

            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Fee</span>
              <span className="font-medium">₹{consultationFee}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Platform Fee (10%)</span>
              <span className="font-medium">₹{platformFees}</span>
            </div>

            <Separator />

            <div className="flex justify-between font-bold text-lg">
              <span className="text-gray-900">Total Amount</span>
              <span className="text-blue-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* AnimatePresence for status screens */}
        <AnimatePresence mode="wait">

          {/* Processing state */}
          {paymentStatus === 'processing' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-12"
            >
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-600 animate-spin" />
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment...</h4>
              <p className="text-gray-600 mb-4">Please complete the payment in the Razorpay window</p>
              <Progress value={50} className="w-full" />
            </motion.div>
          )}

          {/* Success state */}
          {paymentStatus === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
              <h4 className="text-lg font-semibold text-green-800 mb-2">Payment Successful!</h4>
              <p className="text-gray-600 mb-4">Your appointment has been confirmed</p>
              <Progress value={100} className="w-full" />
            </motion.div>
          )}

          {/* Failed state */}
          {paymentStatus === 'failed' && (
            <motion.div
              key="failed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-12"
            >
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Payment Failed</h4>
              <p className="text-gray-600 mb-4">Something went wrong. Please try again.</p>
              <Button
                onClick={() => {
                  setPaymentStatus('idle');
                  hasAutoTriggered.current = false;
                }}
                className="mt-2 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Secure Payment Badge */}
        <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg mb-8">
          <Shield className="w-6 h-6 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Secure Payment</p>
            <p>Your payment is protected by 256-bit SSL encryption</p>
          </div>
        </div>

        {/* Idle state — Action Buttons */}
        {paymentStatus === 'idle' && (
          <div className="flex justify-between gap-2">
            <Button
              variant="outline"
              onClick={onBack}
              className="px-8 py-3"
            >
              Back
            </Button>

            <div>
              <Button
                onClick={handlePayNow}
                disabled={loading || isPaymentLoading}
                className="px-8 py-3 bg-green-600 hover:bg-green-700 text-lg font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span className="text-sm md:text-lg">Creating Appointment...</span>
                  </>
                ) : isPaymentLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    <span className="text-sm md:text-lg">Processing...</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5 mr-2" />
                    <span className="text-sm md:text-lg">Pay ₹{totalAmount} & Book</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentStep;