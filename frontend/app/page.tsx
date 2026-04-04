'use client'
import Header from "@/components/landing/Header";
import Image from "next/image";
import{useRouter} from "next/navigation";
import { useEffect } from "react";
import LandingHero from "@/components/landing/LandingHero"
import TestimonialSection from '@/components/landing/TestimonialSection';
import FAQSection from '@/components/landing/FAQSection';
import Footer from '@/components/landing/Footer';
import { useAuthStore } from "@/src/stores/authStore";
export default function Home() {
  const {user}=useAuthStore();
  const router=useRouter();
  useEffect(()=>{
    if(user?.type==="doctor")
    {
      router.replace('/doctor/dashboard')
    }
  },[user,router])
  

  if(user?.type === 'doctor'){
    return null;
  }
    return (
     <div className="min-h-screen bg-white">
      <Header showDashboardNav={false}/>
      <main className="pt-16">
        <LandingHero/>
        <TestimonialSection/>
        <FAQSection/>
        <Footer/>

      </main>
     </div>
  );
}


