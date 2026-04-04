



"use client";

export function Providers({ children }: { children: React.ReactNode }) {
  // ✅ fetchProfile yahan se hata diya — 401 loop band
  // Dashboard pe jaake profile fetch karo agar chahiye
  return <>{children}</>;
}