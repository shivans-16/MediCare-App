"use client"
import React, { useEffect } from 'react'
import { useAuthStore } from '@/src/stores/authStore'
import { useRouter } from 'next/navigation'

const Layout = ({children}:{children:React.ReactNode}) => {

    const { isAuthenticated } = useAuthStore()
    const router = useRouter()

    useEffect(()=>{
        if(!isAuthenticated){
            router.push('/login/patient')
        }
    },[isAuthenticated, router])

    if(!isAuthenticated) return null

    return (
        <div className='min-h-screen bg-gray-50 flex flex-col'>
            <header className='bg-white border-b px-6 py-4'>
                <div className='max-w-4xl mx-auto'>
                    <div className='text-2xl font-bold text-blue-900'>
                       MediCare+
                    </div>
                </div>
            </header>

            <main className='flex-1 flex items-center justify-center p-6'>
                {children}
            </main>
        </div>
    )
}

export default Layout