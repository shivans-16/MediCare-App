
// "use client";
// import React, { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAuthStore } from "@/src/stores/authStore";

// const Layout = ({ children }: { children: React.ReactNode }) => {
//   const router = useRouter();
//   const { user, isAuthenticated } = useAuthStore();

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       if (!user.onboarded) {
//         // ✅ Correct paths
//         const onboardingPath =
//           user.type === "doctor"
//             ? "/onboarding/doctor"
//             : "/onboarding/patient";
//         router.push(onboardingPath);
//       } else {
//         const dashboardPath =
//           user.type === "doctor"
//             ? "/doctor/dashboard"
//             : "/patient/dashboard";
//         router.push(dashboardPath);
//       }
//     }
//   }, [isAuthenticated, user, router]);

//   return (
//     <div className="min-h-screen flex">
//       {/* Left side: form container */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
//         <div className="w-full max-w-md">{children}</div>
//       </div>

//       {/* Right side: branding */}
//       <div className="hidden lg:block w-1/2 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent z-10" />
//         <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
//           <div className="text-center text-white p-8 max-w-md">
//             <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
//               {/* Logo */}
//               <svg
//                 className="w-12 h-12 text-white"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
//                 />
//               </svg>
//             </div>
//             <h2 className="text-4xl font-bold mb-4">Welcome to MediCare+</h2>
//             <p className="text-xl opacity-90 mb-4">Your health, our priority</p>
//             <p className="text-lg opacity-75">
//               Connecting patients with certified healthcare for quality medical
//               consultation.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Layout;


/*
"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/authStore";
import {redirect} from 'next/navigation'
const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
     const {isAuthenticated,user}=useAuthStore();
  // const isAuthenticated = false;
  // const user = {
  //   type: "patient",
  //   name: "Shivansh",
  //   profileImage: "/placeholder.png",
  //   email: "shivans0018@gmail.com",
  // };

  useEffect(() => {
 
     if (isAuthenticated && user) {
 
       // If onboarding not completed
       if (!user.onboarded) {
         router.push(`/onboarding/${user.type}`);
         return;
       }
 
       // If onboarding completed
       if (user.type === "doctor") {
         router.push("/doctor/dashboard");
       } else {
         router.push("/patient/dashboard");
       }
 
     }
 
   }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen flex">
     
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>

     
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent z-10" />
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-md">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome to MediCare+</h2>
            <p className="text-xl opacity-90 mb-4">Your health, our priority</p>
            <p className="text-lg opacity-75">
              Connecting patients with certified healthcare for quality medical
              consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
*/




"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/src/stores/authStore";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated && user) {
      if (!user.onboarded) {
        // ✅ Onboarding complete nahi → onboarding pe bhejo
        router.push(`/onboarding/${user.type}`);
      } else {
        // ✅ Onboarding complete → dashboard pe bhejo
        router.push(`/${user.type}/dashboard`);
      }
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen flex">
      {/* Left side: form container */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side: branding */}
      <div className="hidden lg:block w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-transparent z-10" />
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 flex items-center justify-center">
          <div className="text-center text-white p-8 max-w-md">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="text-4xl font-bold mb-4">Welcome to MediCare+</h2>
            <p className="text-xl opacity-90 mb-4">Your health, our priority</p>
            <p className="text-lg opacity-75">
              Connecting patients with certified healthcare for quality medical
              consultation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;