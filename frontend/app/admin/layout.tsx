


// admin interface creation and insertion
'use client'
import Loader from "@/components/Loader";
import { useAuthStore } from "@/src/stores/authStore";
import { CreditCard, LayoutDashboard, Users } from "lucide-react";
import { usePathname,useRouter } from "next/navigation";
import React,{useEffect, useState} from 'react';

interface AdminLayoutProps{
    children:React.ReactNode;
}

export default function AdminLayout({children}:AdminLayoutProps){
    const {user,isAuthenticated,loading,logout}=useAuthStore();
    const router=useRouter();
    const pathName=usePathname();
    const [isChecking,setIsChecking]=useState(true);
    const [hasMounted,setHasMounted]=useState(false);

    const isLoginPage=pathName === '/admin/login';

    useEffect(()=>{
        setHasMounted(true);
        const timer=setTimeout(()=>{
            setIsChecking(false);
        },100);
        return ()=>clearTimeout(timer);
    },[])

    useEffect(()=>{
        if(!hasMounted) return;

        if(isLoginPage)
        {
            setIsChecking(true);
            return;
        }
        if(loading)
        {
            setIsChecking(true);
            return;
        }
        if(!isAuthenticated || user?.type === 'admin')
        {
            return router.push('/admin/login');
        }
        setIsChecking(false);

    },[isAuthenticated,user,loading,router,hasMounted,isLoginPage]);

    const handleLogout=()=>{
        logout();
        router.push('/admin/login');
    }
    const navigationItem=[{
          name:'Dashboard',
          href:'/admin/dashboard',
          icon:LayoutDashboard,
          current:pathName==='/admin/dashboard'
        },
        {
          name:'Users',
          href:'/admin/users',
          icon:Users,
          current:pathName==='/admin/users'
    },
    {
         name:'Payments',
          href:'/admin/payments',
          icon:CreditCard,
          current:pathName==='/admin/payments'
    },
]
    if(isLoginPage)
    {
        return <>{children}</>
    }
    if(loading || isChecking)
    {
        return <Loader/>
    }
    if(!isAuthenticated || user?.type !== 'admin')
    {
        return <Loader/>
    }
    return(
        <div className="min-h-screen">

        </div>
    )

}