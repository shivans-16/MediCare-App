
import { consultationTypes } from "@/lib/constant";
import React from "react";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { ArrowLeft } from "lucide-react";

interface ConsultationStepInterface {
    consultationType: string;
    setConsultationType: (type: string) => void;
    symptoms: string;
    setSymptoms: (symptoms: string) => void;
    doctorFees: number;
    onBack: () => void;
    onContinue: () => void;
}

const Consultationstep = ({
    consultationType,
    setConsultationType,
    symptoms,
    setSymptoms,
    doctorFees,
    onBack,
    onContinue,
}: ConsultationStepInterface) => {
    const getConsultationPrice = (selectedType = consultationType) => {
        const typePrice =
            consultationTypes.find((ct) => ct.type === selectedType)?.price || 0;
        return Math.max(0, doctorFees + typePrice);
    };

    const handleTypeChange = (newType: string) => {
        setConsultationType(newType);
    };

    // Find selected consultation details
    const selectedConsultation = consultationTypes.find(
        (ct) => ct.type === consultationType
    );

    return (
        <div className="space-y-8">
            <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Consultation Details
                </h3>

                {/* Consultation Type Selection */}
                <div className="mb-8">
                    <Label className="text-sm font-medium text-gray-700 mb-3 block">
                        Select Consultation Type
                    </Label>
                    <div className="space-y-3">
                        {consultationTypes.map(
                            ({ type, icon: Icon, description, price, recommended }) => {
                                const currentPrice = getConsultationPrice(type);
                                const isSelected = consultationType === type;

                                return (
                                    <div
                                        key={type}
                                        className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${isSelected
                                                ? "border-blue-500 bg-blue-50 shadow-md"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                        onClick={() => handleTypeChange(type)}
                                    >
                                        {recommended && (
                                            <Badge className="absolute -top-2 left-4 bg-green-500 text-white text-xs">
                                                Recommended
                                            </Badge>
                                        )}

                                        <div className="flex items-center space-x-4">
                                            {/* Icon Box */}
                                            <div
                                                className={`w-12 h-12 rounded-lg flex items-center justify-center ${isSelected ? "bg-blue-100" : "bg-gray-100"
                                                    }`}
                                            >
                                                <Icon
                                                    className={`w-6 h-6 ${isSelected ? "text-blue-600" : "text-gray-600"
                                                        }`}
                                                />
                                            </div>

                                            {/* Type + Description */}
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900">{type}</h4>
                                                <p className="text-sm text-gray-600">{description}</p>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="font-semibold text-gray-900">
                                                    ₹{currentPrice}
                                                </p>
                                                {price !== 0 && (
                                                    <p className="text-xs text-green-600">
                                                        Save ₹{Math.abs(price)}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                        )}
                    </div>
                </div>

                {/* ✅ Selected Consultation Highlight */}
             

                {selectedConsultation && (
                    <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                            <p className="text-blue-800 font-semibold">
                                Selected Consultation:
                            </p>
                            <p className="text-blue-900 font-bold">
                                {selectedConsultation.type} – ₹{getConsultationPrice(selectedConsultation.type)}
                            </p>
                        </div>
                    </div>
                )}



                {/* Symptoms Input */}
                <div>
                    <Label className="text-sm font-medium text-gray-700 mb-2 block">
                        Describe your symptoms or concerns *
                    </Label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder="Please describe what brings you to see the doctor today..."
                        rows={4}
                        className="w-full border border-gray-200 rounded-lg p-3 text-sm text-gray-700 
              placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
              focus:border-transparent resize-none"
                    />
                </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-2">
                <button
                    onClick={onBack}
                    className="flex items-center px-5 py-2 border border-gray-200 rounded-lg text-sm 
            font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </button>
                <button
                    onClick={onContinue}
                    disabled={!symptoms.trim() || !consultationType}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm
            hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Continue to Payment
                </button>
            </div>
        </div>
    );
};

export default Consultationstep;
