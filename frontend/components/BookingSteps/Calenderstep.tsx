'use client'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { toLocalYMD, convertTo24Hour } from '@/lib/dateUtils'

interface CalendarStepProps {
    selectedDate: Date | undefined;
    setSelectedDate: (date: Date | undefined) => void;
    selectedSlot: string;
    setSelectedSlot: (slot: string) => void;
    availableSlots: string[];
    availableDates: string[];
    excludedWeekdays: number[];
    onContinue: () => void;
    bookedSlots: string[];
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

function startOfDay(date: Date): Date {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

const CalendarStep = ({
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots = [],
    availableDates = [],
    excludedWeekdays = [],
    onContinue,
    bookedSlots = []
}: CalendarStepProps) => {

    const [showMoreSlots, setShowMoreSlots] = useState(false)
    const displaySlots = showMoreSlots ? availableSlots : availableSlots.slice(0, 10)

    const isSlotBooked = (slot: string): boolean => {
        if (!selectedDate) return false
        const dateString = toLocalYMD(selectedDate)
        const slotDateTime = new Date(`${dateString}T${convertTo24Hour(slot)}`)
        return bookedSlots.some(bookedSlot => {
            const bookedDateTime = new Date(bookedSlot)
            return bookedDateTime.getTime() === slotDateTime.getTime()
        })
    }

    const isSlotInPast = (slot: string): boolean => {
        if (!selectedDate) return false
        const now = new Date()
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const selectedDay = new Date(selectedDate)
        selectedDate.setHours(0, 0, 0, 0)

        if (selectedDay.getTime() === today.getTime()) {
            const [time, modifier] = slot.split(' ')
            let [hour, minutes] = time.split(':')
            if (hour === '12') { hour = '00' }
            if (modifier === 'PM') {
                hour = String(parseInt(hour, 10) + 12)
            }
            const slotDateTime = new Date(selectedDate)
            slotDateTime.setHours(parseInt(hour), parseInt(minutes), 0, 0)
            const bufferedCurrentTime = new Date(now.getTime() + 5 * 60 * 1000)
            return slotDateTime.getTime() <= bufferedCurrentTime.getTime()
        }
        return false
    }

    const isDateDisabled = (date: Date): boolean => {
        const today = startOfDay(new Date())
        const checkedDate = startOfDay(date)
        if (checkedDate < today) return true
        const ymd = toLocalYMD(date)
        if (!availableDates.includes(ymd)) return true
        return false
    }

    const today = new Date()
    const [viewMonth, setViewMonth] = useState(today.getMonth())
    const [viewYear, setViewYear] = useState(today.getFullYear())

    const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate()

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
        else setViewMonth(m => m - 1)
    }

    const prevMonthDate = new Date(viewYear, viewMonth - 1 === -1 ? 11 : viewMonth - 1, 1)
    const isPrevDisabled = startOfDay(prevMonthDate) < startOfDay(new Date(today.getFullYear(), today.getMonth(), 1))

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
        else setViewMonth(m => m + 1)
    }

    const handleDateClick = (date: Date) => {
        if (isDateDisabled(date)) return
        setSelectedDate(date)
        setSelectedSlot('')
    }

    const cells: { date: Date; currentMonth: boolean }[] = []

    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        cells.push({
            date: new Date(viewYear, viewMonth - 1, daysInPrevMonth - i),
            currentMonth: false
        })
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(viewYear, viewMonth, d), currentMonth: true })
    }
    const remaining = 42 - cells.length
    for (let d = 1; d <= remaining; d++) {
        cells.push({
            date: new Date(viewYear, viewMonth + 1, d),
            currentMonth: false
        })
    }

    const isSelected = (date: Date) =>
        selectedDate ? toLocalYMD(date) === toLocalYMD(selectedDate) : false

    const isToday = (date: Date) =>
        toLocalYMD(date) === toLocalYMD(new Date())

    return (
        <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Select Date & Time</h2>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* ── Calendar ── */}
                <div className="flex-1">
                    <p className="text-sm font-bold text-gray-700 mb-3">Choose Date</p>

                    {/* Month Nav */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={prevMonth}
                            disabled={isPrevDisabled}
                            className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <span className="text-sm font-semibold text-gray-800">
                            {MONTHS[viewMonth]} {viewYear}
                        </span>
                        <button
                            onClick={nextMonth}
                            className="p-1 rounded-full hover:bg-gray-100"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Calendar wrapped in light border */}
                    <div className="border border-gray-500 rounded-xl p-3">

                        {/* Day Headers */}
                        <div className="grid grid-cols-7 mb-1">
                            {DAYS.map(day => (
                                <div key={day} className="text-center text-xs font-medium text-gray-400 py-1">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Date Grid */}
                        <div className="grid grid-cols-7 gap-y-1">
                            {cells.map(({ date, currentMonth }, idx) => {
                                const disabled = !currentMonth || isDateDisabled(date)
                                const selected = isSelected(date)
                                const todayDate = isToday(date)

                                let cls = 'mx-auto w-8 h-8 rounded-md text-sm flex items-center justify-center transition-colors '

                                if (!currentMonth) {
                                    cls += 'text-gray-300 cursor-default'
                                } else if (selected) {
                                    // ✅ selected → dark/black square
                                    cls += 'bg-gray-900 text-white font-bold'
                              } else if (todayDate && !selectedDate) {
    cls += 'bg-blue-600 text-white font-bold'
                                } else if (disabled) {
                                    cls += 'text-gray-300 cursor-not-allowed'
                                } else {
                                    // ✅ hover → blue, normal → gray text
                                    cls += 'text-gray-700 hover:bg-blue-600 hover:text-white cursor-pointer'
                                }

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => currentMonth && handleDateClick(date)}
                                        disabled={disabled}
                                        className={cls}
                                    >
                                        {date.getDate()}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Time Slots ── */}
                <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-gray-700">Available Time Slots</p>
                        {availableSlots.length > 0 && (
                            <span className="text-xs text-gray-500">
                                ({availableSlots.length} slots available)
                            </span>
                        )}
                    </div>

                    {!selectedDate ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            Please select a date first
                        </div>
                    ) : availableSlots.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                            No slots available for this date
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-2">
                                {displaySlots.map((slot) => {
                                    const booked = isSlotBooked(slot)
                                    const past = isSlotInPast(slot)
                                    const unavailable = booked || past
                                    const isActive = selectedSlot === slot

                                    let slotCls = 'group flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm transition-colors '

                                    if (isActive) {
                                        // ✅ selected → black
                                        slotCls += 'bg-gray-900 border-gray-900 text-white'
                                    } else if (unavailable) {
                                        slotCls += 'bg-gray-50 border-gray-200 text-gray-300 cursor-not-allowed line-through'
                                    } else {
                                        // ✅ hover → blue
                                        slotCls += 'bg-white border-gray-200 text-gray-700 hover:bg-blue-600 hover:border-blue-600 hover:text-white cursor-pointer'
                                    }

                                    return (
                                        <button
                                            key={slot}
                                            onClick={() => !unavailable && setSelectedSlot(slot)}
                                            disabled={unavailable}
                                            className={slotCls}
                                        >
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>{slot}</span>
                                        </button>
                                    )
                                })}
                            </div>

                            {availableSlots.length > 10 && (
                                <button
                                    onClick={() => setShowMoreSlots(!showMoreSlots)}
                                    className="mt-3 text-xs text-black-600 hover:underline"
                                >
                                    {showMoreSlots ? 'Show less' : `+${availableSlots.length - 10} more slots`}
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Continue Button */}
            <div className="mt-8 flex justify-end">
                <button
                    onClick={onContinue}
                    disabled={!selectedDate || !selectedSlot}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm
                        hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    )
}

export default CalendarStep
