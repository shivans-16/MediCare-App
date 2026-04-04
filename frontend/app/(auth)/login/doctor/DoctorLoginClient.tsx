// frontend/app/(auth)/login/doctor/DoctorLoginClient.tsx
"use client";

import AuthForm from '@/components/auth/AuthForm';

export default function DoctorLoginClient() {
  return <AuthForm type="login" userRole="doctor" />;
}
