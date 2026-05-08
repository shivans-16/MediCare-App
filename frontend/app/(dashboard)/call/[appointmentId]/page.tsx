// 'use client'
// import dynamic from 'next/dynamic'; 
// import { useAppointmentStore } from '@/src/stores/appointmentStore'
// import { useAuthStore } from '@/src/stores/authStore';
// import { useParams } from 'next/navigation';
// import { useRouter } from 'next/navigation';
// import React, { useCallback, useEffect, useState } from 'react'


// const AppointmentCall = dynamic(
//   () => import('@/components/call/AppointmentCall'),
//   { 
//     ssr: false,
//     loading: () => (
//       <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading call room...</p>
//         </div>
//       </div>
//     )
//   }
// );

// const Page = () => { // ✅ Capital P — Next.js convention
//       const params = useParams();
//       const router = useRouter();
//       const appointmentId = params.appointmentId as string; 
//       const {currentAppointment, fetchAppointmentById, joinConsultation} = useAppointmentStore();
//       const {user} = useAuthStore();
//       const [isNavigating, setIsNavigating] = useState(false);

//       useEffect(() => {
//          console.log("🔍 appointmentId:", appointmentId);
//     console.log("🔍 currentAppointment:", currentAppointment);
//     console.log("🔍 user:", user);
//         if(appointmentId){
//             fetchAppointmentById(appointmentId)
            
//         }
//       }, [appointmentId, fetchAppointmentById])

//       const handleCallEnd = useCallback(async () => {
//         if(isNavigating) return;
//         try {
//           setIsNavigating(true);
//           if(user?.type === 'doctor') {
//             router.push(`/doctor/dashboard?completedCall=${appointmentId}`)
//           } else {
//             router.push('/patient/dashboard')
//           }
//         } catch (error) {
//           console.error(error)
//           router.push('/')
//         } finally {
//           setIsNavigating(false)
//         }
//       }, [user?.type, router, appointmentId, isNavigating])

//   if (!currentAppointment || !user) {
//     return(
//       <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
//         <div className="text-center">
//           <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading call room...</p>
//         </div>
//       </div>
//     );
//   }

//   const currentUserData = {
//     id: user.id,
//     name: user.name,
//     role: user.type as 'doctor' | 'patient' 
//   }

//   return (
//     <AppointmentCall
//       appointment={currentAppointment}
//       currentUser={currentUserData}
//       onCallEnd={handleCallEnd}
//       joinConsultation={joinConsultation}
//     />
//   )
// }

// export default Page




'use client'
import dynamic from 'next/dynamic'; 
import { useAppointmentStore } from '@/src/stores/appointmentStore'
import { useAuthStore } from '@/src/stores/authStore';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react'

const LoadingScreen = () => (
  <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Loading call room...</p>
    </div>
  </div>
);

const AppointmentCall = dynamic(
  () => import('@/components/call/AppointmentCall'),
  { 
    ssr: false,
    loading: () => <LoadingScreen />
  }
);

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const appointmentId = params.appointmentId as string; 
  const { currentAppointment, fetchAppointmentById, joinConsultation } = useAppointmentStore();
  const { user } = useAuthStore();
  const [isNavigating, setIsNavigating] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { 
    setHydrated(true); 
  }, []);
useEffect(() => {
    console.log("💧 hydrated:", hydrated);
    console.log("👤 user:", user);
    console.log("📋 currentAppointment:", currentAppointment);
}, [hydrated, user, currentAppointment]);
  useEffect(() => {
    if (hydrated && appointmentId) {
      fetchAppointmentById(appointmentId);
    }
  }, [appointmentId, fetchAppointmentById, hydrated]);

  const handleCallEnd = useCallback(async () => {
    if (isNavigating) return;
    try {
      setIsNavigating(true);
      if (user?.type === 'doctor') {
        router.push(`/doctor/dashboard?completedCall=${appointmentId}`)
      } else {
        router.push('/patient/dashboard')
      }
    } catch (error) {
      console.error(error)
      router.push('/')
    } finally {
      setIsNavigating(false)
    }
  }, [user?.type, router, appointmentId, isNavigating])

  if (!hydrated || !currentAppointment || !user) {
    return <LoadingScreen />;
  }

  const currentUserData = {
    id: user.id,
    name: user.name,
    role: user.type as 'doctor' | 'patient' 
  }

  return (
    <AppointmentCall
      appointment={currentAppointment}
      currentUser={currentUserData}
      onCallEnd={handleCallEnd}
      joinConsultation={joinConsultation}
    />
  )
}

export default Page