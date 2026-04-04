
'use client'



import { useAuthStore } from "@/src/stores/authStore";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { User } from "lucide-react"
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert"
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../ui/select";
import { Button } from "../ui/button";
import { Phone } from "lucide-react";

interface EmergencyContact {
    name: string;
    phone: string;
    relationship: string;
}
interface MedicalHistory {
    allergies: string;
    currentMedications: string;
    chronicConditions: string;
}
interface PatientOnboardingData {
    phone: string;
    dob: string;
    gender: string;
    bloodGroup?: string;
    emergencyContact: EmergencyContact;
    medicalHistory: MedicalHistory;
}

const PatientOnboardingForm = () => {
    const [currentStep, setCurrentStep] = useState<number>(1)
    const [formData, setFormData] = useState<PatientOnboardingData>({
        phone: '',
        dob: "",
        gender: "",
        bloodGroup: "",
        emergencyContact: {
            name: "",
            phone: "",
            relationship: ""
        },
        medicalHistory: {
            allergies: "",
            currentMedications: "",
            chronicConditions: ""
        }
    });

    const { updateProfile, user, loading } = useAuthStore();
    const router = useRouter();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    const handleSelectChange = (name: string, value: string): void => {
        setFormData(prev => ({ ...prev, [name]: value }))
    }
    const handleEmergencyContactChange = (field: keyof EmergencyContact, value: string): void => {
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact,
                [field]: value
            }
        }))
    }
    const handleMedicalHistoryChange = (field: keyof MedicalHistory, value: string): void => {
        setFormData(prev => ({
            ...prev,
            medicalHistory: {
                ...prev.medicalHistory,
                [field]: value
            }
        }))
    }
    const handleSubmit = async (): Promise<void> => {
        try {
            await updateProfile({
                Phone: formData.phone,
                dob: formData.dob,
                gender: formData.gender,
                bloodGroup: formData.bloodGroup,
                emergencyContact: formData.emergencyContact,
                medicalHistory: formData.medicalHistory
            })
            router.push('/')
        } catch (error) {
            console.log('Profile updated failed', error)

        }
    }

    const handleNext = (): void => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        }
    }
    const handlePrevious = (): void => {
        if (currentStep < 3) {
            setCurrentStep(currentStep - 1)
        }
    }
    return (
        <div className="w-full max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome {user?.name} to MediCare+</h1>
                <p className="text-gray-600">Complete your profile to start booking appointment</p>
            </div>

            <div className="flex items-center justify-center mb-8">
                <div className="flex items-center">
                    {[1, 2, 3].map((step) => (
                        <React.Fragment key={step}>
                            <div className={`flex items-center justify-center w-10 h-10 rounded-full border -2 ${currentStep >= step ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 text-gray-400"}`}>
                                {step}
                            </div>
                            {step < 3 && (
                                <div className={`w-20 h-1 ${currentStep > step ? "bg-blue-600" : "bg-gray-300"}`}>

                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <Card className="shadow-lg">
                <CardContent className="p-8">
                    {currentStep === 1 && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <User className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold">Basic Information</h2>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        placeholder="+91 8960452235"
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dob">Date of Birth</Label>
                                    <Input
                                        id="dob"
                                        name="dob"
                                        type="date"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        value={formData.gender}
                                        onValueChange={(value) => handleSelectChange('gender', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender"></SelectValue>
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="others">Others</SelectItem>
                                        </SelectContent>

                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bloodGroup">Blood Group</Label>
                                    <Select
                                        value={formData.bloodGroup}
                                        onValueChange={(value) => handleSelectChange('bloodGroup', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select bloodGroup"></SelectValue>
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="A+">A+</SelectItem>
                                            <SelectItem value="A-">A-</SelectItem>
                                            <SelectItem value="B+">B+</SelectItem>
                                            <SelectItem value="B-">B-</SelectItem>
                                            <SelectItem value="AB-">AB-</SelectItem>
                                            <SelectItem value="AB+">AB+</SelectItem>
                                            <SelectItem value="O+">O+</SelectItem>
                                            <SelectItem value="O-">O-</SelectItem>
                                        </SelectContent>

                                    </Select>
                                </div>

                            </div>
                        </div>
                    )}
                    {currentStep === 2 && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <Phone className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold">Emergency Contact</h2>
                            </div>
                            <Alert>
                                <AlertDescription>
                                    This informtaion will be used to contact someone on your behalf in case of emergency during consultations.
                                </AlertDescription>
                            </Alert>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="emergencyName">Contact Name</Label>
                                    <Input
                                        id="emergencyName"
                                        value={formData.emergencyContact.name}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            handleEmergencyContactChange('name', e.target.value)
                                        }
                                        placeholder="Full name"
                                        required
                                    ></Input>
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                                    <Input
                                        id="emergencyPhone"
                                        value={formData.emergencyContact.phone}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            handleEmergencyContactChange('phone', e.target.value)
                                        }
                                        placeholder="+91 9800987123"
                                        required
                                    ></Input>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="relationship">Relationship</Label>
                                    <Select
                                        value={formData.emergencyContact.relationship}
                                        onValueChange={(value) => handleEmergencyContactChange('relationship', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relationShip"></SelectValue>
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="spouse">Spouse</SelectItem>
                                            <SelectItem value="sarents">Parents</SelectItem>
                                            <SelectItem value="child">Child</SelectItem>
                                            <SelectItem value="sibling">Sibling</SelectItem>
                                            <SelectItem value="friend">Friend</SelectItem>
                                            <SelectItem value="relative">Relative</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>

                                        </SelectContent>

                                    </Select>
                                </div>

                            </div>
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center space-x-2 mb-6">
                                <Phone className="w-5 h-5 text-blue-600" />
                                <h2 className="text-xl font-semibold">Medical Information</h2>
                            </div>
                            <Alert>
                                <AlertDescription>
                                    This informtaion helps doctor to provide better care. All informtaion is kept credential and secure.
                                </AlertDescription>
                            </Alert>
                            {/* <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="emergencyName">Contact Name</Label>
                                    <Input
                                    id="emergencyName"
                                    value={formData.emergencyContact.name}
                                    onChange={(e:ChangeEvent<HTMLInputElement>)=>
                                        handleEmergencyContactChange('name',e.target.value)
                                    }
                                    placeholder="Full name"
                                    required
                                    ></Input>
                                </div>
                              
                               <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                                    <Input
                                    id="emergencyPhone"
                                    value={formData.emergencyContact.phone}
                                    onChange={(e:ChangeEvent<HTMLInputElement>)=>
                                        handleEmergencyContactChange('phone',e.target.value)
                                    }
                                    placeholder="+91 9800987123"
                                    required
                                    ></Input>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="relationship">Relationship</Label>
                                    <Select
                                    value={formData.emergencyContact.relationship}
                                    onValueChange={(value)=>handleEmergencyContactChange('relationship',value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select relationShip"></SelectValue>
                                        </SelectTrigger>
                                      
                                      <SelectContent>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="sarents">Parents</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="relative">Relative</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                      
                                      </SelectContent>

                                    </Select>
                                </div>

                            </div> */}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="allergies">Known Allergies</Label>
                                    <Textarea
                                        id="allergies"
                                        value={formData.medicalHistory.allergies}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                            handleMedicalHistoryChange("allergies", e.target.value)
                                        }
                                        placeholder="e.g., Penicillin,Peanuts,Dust (or write 'None' if no known allergies)"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currentMedications">Current Medications</Label>
                                    <Textarea
                                        id="currentMedications"
                                        value={formData.medicalHistory.currentMedications}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                            handleMedicalHistoryChange("currentMedications", e.target.value)
                                        }
                                        placeholder="e.g., List any medications you are currently taking (or write 'None' if not taking any )"
                                        rows={3}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="chronicConditions">Chronic Conditions</Label>
                                    <Textarea
                                        id="chronicConditions"
                                        value={formData.medicalHistory.chronicConditions}
                                        onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                            handleMedicalHistoryChange("chronicConditions", e.target.value)
                                        }
                                        placeholder="e.g., Diabeties, Hypertension, Asthma  (or write 'None' if no chronic conditions.)"
                                        rows={3}
                                    />
                                </div>

                            </div>


                        </div>
                    )}


                    <div className="flex justify-between pt-8">
                        <Button
                            type="button"
                            variant='outline'
                            onClick={handlePrevious}
                            disabled={currentStep === 1}
                        >
                            Previous
                        </Button>
                        {currentStep < 3 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                disabled={
                                    (currentStep == 1 && (!formData.phone || !formData.dob || !formData.gender) || (currentStep === 2 && (!formData.emergencyContact.name || !formData.emergencyContact.phone || !formData.emergencyContact.relationship) || (currentStep === 3) && (!formData.medicalHistory.allergies || !formData.medicalHistory.chronicConditions || !formData.medicalHistory.currentMedications)))
                                }
                            >Next
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-green-600 hover:bg-green-700"
                            >{loading ? "Completing Setup..." : "Complete Profile"}
                            </Button>

                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default PatientOnboardingForm
