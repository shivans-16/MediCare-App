'use client'
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/src/stores/authStore";
import { Loader2, Shield } from "lucide-react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
const page=()=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const {loginAdmin,loading,error,cleanError,isAuthenticated,user}=useAuthStore();
    const router=useRouter();
    useEffect(()=>{
    if(!isAuthenticated && user)
    {
        redirect('/admin/dashboard');
    }
    },[isAuthenticated,user])

    const handleSubmit=async(e:React.FormEvent)=>{
        e.preventDefault();
        cleanError();
         if(!email || !password)
            {
                toast.error('please fill in all field')
            }
        try{
            await loginAdmin(email,password);
            toast.success("Login successfully");
            router.push('/admin/dashboard');
        }catch(error:any)
        {
             console.error("Error during login",error);
             toast.error(error.message);
        }
    }
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Shield className="h-4 w-6 text-blue-600"/>
                    </div>
                    <h2 className="mt-2 text-sm text-gray-1000">
                        Admin Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-900">
                        Sign in to access the admin dashboard
                    </p>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Admin Login
                        </CardTitle>
                        <CardDescription>
                            Enter your admin credentials to access the management portal
                        </CardDescription>
                        
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant='destructive'>
                                    <AlertDescription>
                                        {
                                            error
                                        }
                                    </AlertDescription>
                                    </Alert>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                id='email'
                                type='email'
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                placeholder="admin@medicare.com"
                                required
                                />
                            </div>
                             
                              <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                id='password'
                                type='password'
                                value={password}
                                onChange={(e)=>setPassword(e.target.value)}
                                placeholder="Enter your password"
                                required
                                />
                            </div>
                            <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                            >
                                {loading ? (
                                    <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin">
                                        Signing in...
                                        </Loader2></>
                                ):
                                (
                                   'Sign in' 
                                )}
                            </Button>

                        </form>
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Default credentials: admin@medicare.com / admin123
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

export default page