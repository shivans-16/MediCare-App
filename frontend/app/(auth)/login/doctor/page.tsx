// 'use client'
// import dynamic from "next/dynamic";




export const metadata = {
  title: 'Doctor Login - MediCare+',
  description: 'Healthcare provider sign in to MediCare+ platform. Manage your practice and consultations.'
};

import DoctorLoginClient from './DoctorLoginClient';

export default function DoctorLoginPage() {
  return <DoctorLoginClient />;
}
