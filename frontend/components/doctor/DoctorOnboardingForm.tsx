
"use client";
import React, { ChangeEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DoctorFormData, HospitalInfo } from "@/lib/types";
import { healthcareCategoriesList, specializations } from "@/lib/constant";
import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

const DoctorOnboardingForm = () => {
    const [currentStep, setCurrentStep] = useState<number>(1);
    const [formData, setFormData] = useState<DoctorFormData>({
        specialization: "",
        categories: [],
        qualification: "",
        experience: "",
        fees: "",
        about: "",
        hospitalInfo: {
            name: "",
            address: "",
            city: "",
        },
        availabilityRange: {
            startDate: "",
            endDate: "",
            excludedWeekdays: [],
        },
        dailyTimeRanges: [
            { start: "09:00", end: "12:00" },
            { start: "14:00", end: "17:00" },
        ],
        slotDurationMinutes: 30,
    });

    const { updateProfile, loading } = useAuthStore();
    const router = useRouter();

    const handleCategoryToggle = (category: string): void => {
        setFormData((prev: DoctorFormData) => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter((c: string) => c !== category)
                : [...prev.categories, category],
        }));
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = event.target;
        setFormData((prev: DoctorFormData) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleHospitalInfoChange = (field: keyof HospitalInfo, value: string): void => {
        setFormData((prev) => ({
            ...prev,
            hospitalInfo: {
                ...prev.hospitalInfo,
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (): Promise<void> => {
        try {
            await updateProfile({
                specialization: formData.specialization,   // ✅ Fixed: was "specializations" (plural)
                category: formData.categories,
                qualification: formData.qualification,
                experience: Number(formData.experience),   // ✅ Fixed: convert to number
                about: formData.about,
                fees: Number(formData.fees),               // ✅ Fixed: convert to number
                hospitalInfo: formData.hospitalInfo,
                availabilityRange: {
                    startDate: formData.availabilityRange.startDate,   // ✅ Fixed: send as string, backend handles it
                    endDate: formData.availabilityRange.endDate,       // ✅ Fixed: was "enddDate" (typo)
                    excludedWeekdays: formData.availabilityRange.excludedWeekdays,
                },
                dailyTimeRanges: formData.dailyTimeRanges,
                slotDurationMinutes: formData.slotDurationMinutes,
            });

            router.push("/doctor/dashboard"); // ✅ This will now work correctly
        } catch (error) {
            console.error("Profile update failed:", error);
        }
    };

    const handleNext = (): void => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const handlePrevious = (): void => {
        if (currentStep > 1) setCurrentStep(currentStep - 1); // ✅ Fixed: was currentStep < 3
    };

    return (
        <div className="w-full max-w-2xl mx-auto">
            <Card className="shadow-lg">
                <CardContent className="p-8">

                    {/* Step indicator */}
                    <div className="flex items-center justify-center mb-6 space-x-2">
                        {[1, 2, 3].map((step) => (
                            <div key={step} className="flex items-center">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                                    ${currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                                    {step}
                                </div>
                                {step < 3 && <div className={`w-12 h-1 mx-1 ${currentStep > step ? "bg-blue-600" : "bg-gray-200"}`} />}
                            </div>
                        ))}
                    </div>

                    {/* ======= STEP 1: Professional Info ======= */}
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Professional Information</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="specialization">Medical Specialization</Label>
                                    <Select
                                        value={formData.specialization}
                                        onValueChange={(value: string) =>
                                            setFormData((prev) => ({ ...prev, specialization: value }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select specialization" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {specializations.map((spec: string) => (
                                                <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="experience">Years of Experience</Label>
                                    <Input
                                        id="experience"
                                        name="experience"
                                        type="number"
                                        value={formData.experience}
                                        placeholder="e.g., 5"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label>Healthcare Categories</Label>
                                <p className="text-sm text-gray-600">
                                    Select the healthcare areas you provide services for (select at least one)
                                </p>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {healthcareCategoriesList.map((category: string) => (
                                        <div className="flex items-center space-x-2" key={category}>
                                            <Checkbox
                                                id={category}
                                                checked={formData.categories.includes(category)}
                                                onCheckedChange={() => handleCategoryToggle(category)}
                                            />
                                            <label htmlFor={category} className="text-sm font-medium cursor-pointer hover:text-blue-600">
                                                {category}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                {formData.categories.length === 0 && (
                                    <p className="text-red-500 text-xs">Please select at least one category</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="qualification">Qualification</Label>
                                <Input
                                    id="qualification"
                                    name="qualification"
                                    type="text"
                                    value={formData.qualification}
                                    placeholder="e.g., MBBS, MD Cardiology"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="about">About You</Label>
                                <Input
                                    id="about"
                                    name="about"
                                    type="text"
                                    value={formData.about}
                                    placeholder="Tell patients about your expertise and approach"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="fees">Consultation Fee (₹)</Label>
                                <Input
                                    id="fees"
                                    name="fees"
                                    type="number"
                                    value={formData.fees}
                                    placeholder="e.g., 500"
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* ======= STEP 2: Hospital Info ======= */}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Hospital Information</h2>

                            <div className="space-y-2">
                                <Label htmlFor="hospitalname">Hospital Name</Label>
                                <Input
                                    id="hospitalname"
                                    type="text"
                                    value={formData.hospitalInfo.name}
                                    placeholder="e.g., Apollo Hospital"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleHospitalInfoChange("name", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input
                                    id="address"
                                    value={formData.hospitalInfo.address}
                                    placeholder="Full address of your practice..."
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleHospitalInfoChange("address", e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Input
                                    id="city"
                                    value={formData.hospitalInfo.city}
                                    placeholder="e.g., Mumbai"
                                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                        handleHospitalInfoChange("city", e.target.value)
                                    }
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* ======= STEP 3: Availability ======= */}
                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold mb-4">Availability Settings</h2>

                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="startDate">Available From</Label>  {/* ✅ Fixed: was "Form" */}
                                    <Input
                                        id="startDate"
                                        type="date"
                                        value={formData.availabilityRange.startDate}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                availabilityRange: { ...prev.availabilityRange, startDate: e.target.value },
                                            }))
                                        }
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="endDate">Available Until</Label>
                                    <Input
                                        id="endDate"
                                        type="date"
                                        value={formData.availabilityRange.endDate}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setFormData((prev) => ({
                                                ...prev,
                                                availabilityRange: { ...prev.availabilityRange, endDate: e.target.value },
                                            }))
                                        }
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Appointment Slot Duration</Label>
                                <Select
                                    value={formData.slotDurationMinutes?.toString() || "30"}
                                    onValueChange={(value: string) =>
                                        setFormData((prev) => ({ ...prev, slotDurationMinutes: parseInt(value) }))
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select slot duration" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="15">15 minutes</SelectItem>
                                        <SelectItem value="30">30 minutes</SelectItem>  {/* ✅ Fixed: added 30 as default option */}
                                        <SelectItem value="45">45 minutes</SelectItem>
                                        <SelectItem value="60">60 minutes</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-gray-600">Duration for each patient consultation slot</p>
                            </div>

                            <div className="space-y-3">
                                <Label>Working Days</Label>
                                <p className="text-sm text-gray-600">Select the days you are NOT available</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                    {[
                                        { day: "Sunday", value: 0 },
                                        { day: "Monday", value: 1 },
                                        { day: "Tuesday", value: 2 },
                                        { day: "Wednesday", value: 3 },  // ✅ Fixed: was "Wendnesday"
                                        { day: "Thursday", value: 4 },
                                        { day: "Friday", value: 5 },     // ✅ Fixed: was "Fridayday"
                                        { day: "Saturday", value: 6 },
                                    ].map(({ day, value }) => (
                                        <div key={value} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={`day-${value}`}   // ✅ Fixed: was "day=${value}" (= instead of -)
                                                checked={formData.availabilityRange.excludedWeekdays.includes(value)}
                                                onCheckedChange={(checked) => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        availabilityRange: {
                                                            ...prev.availabilityRange,
                                                            excludedWeekdays: checked
                                                                ? [...prev.availabilityRange.excludedWeekdays, value]
                                                                : prev.availabilityRange.excludedWeekdays.filter((d) => d !== value),
                                                        },
                                                    }));
                                                }}
                                            />
                                            <label htmlFor={`day-${value}`} className="text-sm font-semibold cursor-pointer">
                                                {day.slice(0, 3)}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label>Daily Working Hours</Label>
                                <p className="text-sm text-gray-600">Set your working hours for each session</p>
                                {formData.dailyTimeRanges.map((range, index) => (
                                    <div key={index} className="flex items-center space-x-4 border rounded-lg p-4">
                                        <div className="flex-1">
                                            <Label>Session {index + 1} — Start Time</Label>
                                            <Input
                                                type="time"
                                                value={range.start}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const newRanges = [...formData.dailyTimeRanges];
                                                    newRanges[index] = { ...newRanges[index], start: e.target.value };
                                                    setFormData((prev) => ({ ...prev, dailyTimeRanges: newRanges }));
                                                }}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Label>Session {index + 1} — End Time</Label>
                                            <Input
                                                type="time"
                                                value={range.end}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                                    const newRanges = [...formData.dailyTimeRanges];
                                                    newRanges[index] = { ...newRanges[index], end: e.target.value };
                                                    setFormData((prev) => ({ ...prev, dailyTimeRanges: newRanges }));
                                                }}
                                                required
                                            />
                                        </div>
                                        {formData.dailyTimeRanges.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        dailyTimeRanges: prev.dailyTimeRanges.filter((_, i) => i !== index),
                                                    }));
                                                }}
                                                className="text-red-600 hover:text-red-700 mt-5"
                                            >
                                                Remove
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            dailyTimeRanges: [...prev.dailyTimeRanges, { start: "18:00", end: "20:00" }],
                                        }))
                                    }
                                    className="w-full"
                                >
                                    + Add Another Time Session
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-8">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                        >
                            Previous
                        </Button>

                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={currentStep === 1 && formData.categories.length === 0}
                            >
                                Next
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >
                                {loading ? "Completing Setup..." : "Complete Profile"}
                            </Button>
                        )}
                    </div>

                </CardContent>
            </Card>
        </div>
    );
};

export default DoctorOnboardingForm;