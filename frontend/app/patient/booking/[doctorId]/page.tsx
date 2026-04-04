'use client'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useDoctorStore } from '@/src/stores/doctorStore'
import { useAppointmentStore } from '@/src/stores/appointmentStore'
import { toLocalYMD, convertTo24Hour } from '@/lib/dateUtils'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Check } from 'lucide-react'
import Link from 'next/link'
import DoctorProfile from '@/components/BookingSteps/DoctorProfile'
import { Card, CardContent } from '@/components/ui/card'
import {AnimatePresence,motion} from 'framer-motion'
import Consultationstep from '@/components/BookingSteps/Consultationstep'
import Calenderstep from '@/components/BookingSteps/Calenderstep'
import Paymentstep from '@/components/BookingSteps/Paymentstep'
const page = () => {
    const params = useParams()
    const router = useRouter()
    const doctorId = params.doctorId as string

    // Store
    const { currentDoctor, fetchDoctorById } = useDoctorStore()
    const { bookAppointment, loading, fetchBookedSlots, bookedSlots } = useAppointmentStore()

    // State
    const [currentStep, setCurrentStep] = useState(1)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>()
    const [selectedSlot, setSelectedSlot] = useState('')
    const [symptoms, setSymptoms] = useState('')
    const [consultationType, setConsultationType] = useState<string>('Video Consultation')
   // const [consultationType, setConsultationType] = useState<'Video Consultation' | 'Voice Call'>('Video Consultation')
    const [isPaymentProcessing, setIsPaymentProcessing] = useState(false)
    const [availableDates, setAvailableDates] = useState<string[]>([])
    const [availableSlots, setAvailableSlots] = useState<string[]>([])
    const [createdAppointmentId,setCreatedAppointmentId]=useState<string | null>(null)
    const [patientName,setPatientName]=useState<string>('')
    // ✅ Fetch doctor on mount
    useEffect(() => {
        if (doctorId) {
            fetchDoctorById(doctorId)
        }
    }, [doctorId, fetchDoctorById])

    // ✅ Fetch booked slots when date or doctor changes
    useEffect(() => {
        if (selectedDate && doctorId) {
            const dateString = toLocalYMD(selectedDate)
            fetchBookedSlots(doctorId, dateString)
        }
    }, [selectedDate, doctorId, fetchBookedSlots])

    // ✅ Generate available dates from doctor's availability range
    useEffect(() => {
        if (currentDoctor?.availabilityRange) {
            const startDate = new Date(currentDoctor.availabilityRange.startDate)
            const endDate = new Date(currentDoctor.availabilityRange.endDate)

            // Convert doctor's start/end dates to midnight
            startDate.setHours(0, 0, 0, 0)
            endDate.setHours(0, 0, 0, 0)

            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const dates: string[] = []

            // Start from today or startDate, whichever is later
            const iterationStart = new Date(Math.max(today.getTime(), startDate.getTime()))

            for (
                let d = new Date(iterationStart);
                d <= endDate && dates.length < 90;
                d.setDate(d.getDate() + 1)
            ) {
                const dayOfWeek = d.getDay()
                const excluded = currentDoctor.availabilityRange.excludedWeekdays ?? []

                if (!excluded.includes(dayOfWeek)) {
                    dates.push(toLocalYMD(d))
                }
            }

            setAvailableDates(dates)
        }
    }, [currentDoctor])

    // ✅ Generate available slots based on selected date
    useEffect(() => {
        if (selectedDate && currentDoctor?.dailyTimeRanges) {
            const slots: string[] = []
            const slotDuration = currentDoctor.slotDurationMinutes || 30

            currentDoctor.dailyTimeRanges.forEach((range: { start: string; end: string }) => {
                const [startHour, startMin] = range.start.split(':').map(Number)
                const [endHour, endMin] = range.end.split(':').map(Number)

                let current = startHour * 60 + startMin
                const end = endHour * 60 + endMin

                while (current + slotDuration <= end) {
                    const hours = Math.floor(current / 60)
                    const mins = current % 60
                    const period = hours >= 12 ? 'PM' : 'AM'
                    const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours
                    const timeStr = `${displayHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${period}`
                    slots.push(timeStr)
                    current += slotDuration
                }
            })

            // Filter out booked slots
            const filtered = slots.filter(slot => {
                const slot24 = convertTo24Hour(slot)
                return !bookedSlots.includes(slot24)
            })

            setAvailableSlots(filtered)
        }
    }, [currentDoctor, selectedDate, bookedSlots])

    // ✅ Time string to minutes helper
    const timeToMinutes = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number)
        return hours * 60 + minutes
    }

    // ✅ Handle booking
    const handleBooking = async () => {
    if (!selectedDate || !selectedSlot || !symptoms.trim()) {
        alert('Please complete all required fields')
        return
    }

    setIsPaymentProcessing(true)
    try {
        const dateString = toLocalYMD(selectedDate)
        const slot24 = convertTo24Hour(selectedSlot)
        const slotStart = new Date(`${dateString}T${slot24}`)
        const slotEnd = new Date(slotStart)
        slotEnd.setMinutes(slotEnd.getMinutes() + (currentDoctor?.slotDurationMinutes || 30))

        const appointment = await bookAppointment({
            doctorId,
            slotStartIso: slotStart.toISOString(),
            slotEndIso: slotEnd.toISOString(),
            consultationType,
            symptoms,
            date: dateString,
            consultationFees: currentDoctor?.fees || 0,
            platformFees: 20,
            totalAmount: (currentDoctor?.fees || 0) + 20
        })

        console.log('bookAppointment returned:', appointment) // ← dekho console mein kya aata hai

        if (appointment?._id) {
            setCreatedAppointmentId(appointment._id)
            setPatientName(appointment.patientId?.name || 'Patient')
            // ✅ Bas itna — PaymentStep ka useEffect auto-trigger karega Razorpay
        } else {
            // ❌ else mein dashboard redirect mat karo — console mein dekho kya return hua
            console.error('appointment._id missing, appointment =', appointment)
            alert('Appointment created but ID missing. Check console.')
        }

    } catch (error) {
        console.error('Booking failed:', error)
        alert('Booking failed. Please try again.')
    } finally {
        setIsPaymentProcessing(false)
    }
}
    const handlePaymentSuccess=(appointment:any)=>{
      router.push('/patient/dashboard');
    }

    return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    {/* Header */}
    <div className="bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Left: Back button + Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/doctor-list')}
              className="flex items-center text-gray-600 hover:text-gray-900 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2"/>
              Back to Doctors
            </button>
            <div className="h-6 w-px bg-gray-200"></div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Book Appointment</h1>
              {currentDoctor && (
                <p className="text-sm text-gray-500">with Dr {currentDoctor.name}</p>
              )}
            </div>
          </div>

          {/* Right: Step Indicator */}
          <div className="hidden md:flex items-center space-x-2">
            {[1, 2, 3].map((step) => (
              <React.Fragment key={step}>
                <div className={`flex items-center space-x-2 ${currentStep >= step ? 'text-blue-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                    ${currentStep >= step
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-gray-300 bg-white'
                    }`}>
                    {currentStep > step ? (
                      <Check className="w-4 h-4 text-white"/>
                    ) : (
                      <span className={`text-sm font-semibold ${currentStep >= step ? 'text-white' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {step === 1 ? "Select Time" : step === 2 ? "Details" : "Payment"}
                  </span>
                </div>
                {step < 3 && <div className="w-12 h-px bg-gray-300"></div>}
              </React.Fragment>
            ))}
          </div>

        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Doctor Profile */}
        <div className="lg:col-span-1">
          <DoctorProfile doctor={currentDoctor}/>
        </div>

        {/* Right: Step Content */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg border-0">
            <CardContent className="p-8">
              <AnimatePresence mode="wait">

                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Calenderstep 
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedSlot={selectedSlot}
                    setSelectedSlot={setSelectedSlot}
                    availableSlots={availableSlots}
                    availableDates={availableDates}
                    excludedWeekdays={currentDoctor?.availabilityRange?.excludedWeekdays ||[] }
                    bookedSlots={bookedSlots}
                    onContinue={()=>setCurrentStep(2)}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Consultationstep
                    consultationType={consultationType}
                    setConsultationType={setConsultationType}
                    setSymptoms={setSymptoms}
                    symptoms={symptoms}
                    doctorFees={currentDoctor?.fees?? 0}
                    onBack={()=> setCurrentStep(1)}
                    onContinue={()=>setCurrentStep(3)}
                     />
                  </motion.div>
                )}

               {currentStep === 3 && selectedDate && (
  <motion.div
    key="step3"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
  >
    <Paymentstep
      selectedDate={selectedDate}                              // ✅ guaranteed Date now
      selectedSlot={selectedSlot}
      consultationType={consultationType}
      doctorName={currentDoctor?.name ?? 'Doctor'}             // ✅ fallback string
      slotDuration={currentDoctor?.slotDurationMinutes ?? 30}  // ✅ fallback number
      consultationFee={currentDoctor?.fees ?? 0}               // ✅ fixed prop name, no function needed
      isProcessing={isPaymentProcessing}
      onBack={() => setCurrentStep(2)}
      onConfirm={handleBooking}
      onPaymentSuccess={handlePaymentSuccess}
      loading={loading}
      appointmentId={createdAppointmentId ?? undefined}
      patientName={patientName || 'Patient'}
    />
  </motion.div>
)}

              </AnimatePresence>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  </div>
);
}
export default page