import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import DoctorDashboardContent from "@/components/doctor/DoctorDashboardContent";
const page=()=>{
    return (
        <Suspense fallback={<Loader/>}>
          <DoctorDashboardContent/>
        </Suspense>
    )
}
export default page
