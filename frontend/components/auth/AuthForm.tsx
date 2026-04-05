
'use client'

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuthStore } from "@/src/stores/authStore";

import { Card, CardContent } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

interface AuthFormProps {
  type: "login" | "signup";
  userRole: "patient" | "doctor";
}

const AuthForm = ({ type, userRole }: AuthFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const {
    registerDoctor,
    registerPatient,
    loginDoctor,
    loginPatient,
    loading,
    error,
  } = useAuthStore();

  const router = useRouter();
  const isSignup = type === "signup";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSignup && !agreeTerms) return;

    try {
      if (isSignup) {
      
        if (userRole === "doctor") {
          await registerDoctor(formData);
          router.push("/onboarding/doctor");
        } else {
          await registerPatient(formData);
          router.push("/onboarding/patient");
        }
      } else {
       
        if (userRole === "doctor") {
          await loginDoctor(formData.email, formData.password);
        } else {
          await loginPatient(formData.email, formData.password);
        }

        
        const { user } = useAuthStore.getState();

        if (user) {
          if (user.onboarded) {
            
            router.push(`/${user.type}/dashboard`);
          } else {
            
            router.push(`/onboarding/${user.type}`);
          }
        }
      }
    } catch (error: any) {
      console.error(`${type} failed`, error);
    }
  };

  const title = isSignup ? "Create a secure account" : "Welcome back!";
  const buttonText = isSignup ? "Create Account" : "Sign in";
  const altTextLink = isSignup ? "Already a member?" : "Don't have an account?";
  const altLinkAction = isSignup ? "Sign In" : "Sign Up";
  const altLinkPath = isSignup ? `/login/${userRole}` : `/signup/${userRole}`;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-blue-900">MediCare+</h1>
      </div>

      <Card className="border-0 shadow-xl">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2 relative">
              <Label>Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-7"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>

            {isSignup && (
              <div className="flex items-start space-x-2">
                <Checkbox
                  checked={agreeTerms}
                  onCheckedChange={(checked) =>
                    setAgreeTerms(checked as boolean)
                  }
                />
                <label className="text-xs text-gray-600">
                  I agree to Terms and Privacy Policy
                </label>
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading || (isSignup && !agreeTerms)}
            >
              {loading ? "Please wait..." : buttonText}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-gray-600">{altTextLink}</span>
            <Link
              href={altLinkPath}
              className="text-blue-600 hover:underline ml-1"
            >
              {altLinkAction}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthForm;