import React, { Suspense } from "react";
import Loader from "@/components/Loader";
import DoctorListPage from "@/components/patient/DoctorListPage";
import Header from "@/components/landing/Header";
const page=()=>{
    return (
       
        <Suspense fallback={<Loader/>}>
           
          <DoctorListPage/>
        </Suspense>
    )
}
export default page