


import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import PatientDashboardContent from "@/components/patient/PatientDashboardContent";

export default function Page() {
    return (
        <Suspense fallback={<Loader />}>
            <PatientDashboardContent />
        </Suspense>
    )
}

