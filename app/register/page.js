"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.mobile) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.register(formData);
      setSuccess(true);
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl">✓</span>
                </div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Registration Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your account has been created successfully. Please verify your
                  mobile number to continue.
                </p>
                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  asChild
                >
                  <Link href="/login">Login Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#F47B20] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">HG</span>
            </div>
            <h1 className="text-3xl font-bold text-[#F47B20] mb-2">Happy Go</h1>
            <p className="text-gray-600">Anywhere Everytime</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                Sign Up
              </CardTitle>
              <p className="text-center text-gray-600">
                Create your account to get started
              </p>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>

                <div className="flex">
                  <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-gray-50">
                    <span className="text-gray-600">+91</span>
                  </div>
                  <Input
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        mobile: e.target.value.replace(/\D/g, "").slice(0, 10),
                      })
                    }
                    className="rounded-l-none"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12"
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </Button>
              </form>

              <div className="text-center mt-6">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  href="/login"
                  className="text-[#F47B20] font-medium hover:underline"
                >
                  Login
                </Link>
              </div>

              <div className="text-center pt-4 border-t mt-6">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Need help? Call </span>
                  <a
                    href="tel:+919008022800"
                    className="text-[#F47B20] font-medium ml-1"
                  >
                    +91 90080-22800
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}
