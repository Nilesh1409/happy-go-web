"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone } from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState("mobile"); // 'mobile' or 'otp'
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Check if user is already logged in and redirect to home
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      router.replace("/");
    }
  }, [router]);

  const handleSendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.sendMobileOTP(mobile);
      setStep("otp");
    } catch (error) {
      setError(error.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.verifyMobileOTP(mobile, otp);

      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      // Redirect to home page
      router.push("/");
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="py-12">
        <div className="max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-[#F47B20] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">
                <img src={"/assets/happygo.jpeg"} />
              </span>
            </div>
            <h1 className="text-3xl font-bold text-[#F47B20] mb-2">Happy Go</h1>
            <p className="text-gray-600">Anywhere Everytime</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-center">
                {step === "mobile" ? "Login" : "Verify OTP"}
              </CardTitle>
              <p className="text-center text-gray-600">
                {step === "mobile"
                  ? "Enter your mobile number to continue"
                  : `Enter the OTP sent to +91 ${mobile}`}
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                  {error}
                </div>
              )}

              {step === "mobile" ? (
                <>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-gray-50">
                      <span className="text-gray-600">+91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Mobile Number"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                      className="rounded-l-none"
                    />
                  </div>

                  <Button
                    className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12"
                    onClick={handleSendOTP}
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </Button>
                </>
              ) : (
                <>
                  <Input
                    type="text"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) =>
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    className="text-center text-lg tracking-widest"
                  />

                  <Button
                    className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12"
                    onClick={handleVerifyOTP}
                    disabled={loading}
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                  </Button>

                  <div className="text-center">
                    <Button
                      variant="link"
                      onClick={() => setStep("mobile")}
                      className="text-[#F47B20]"
                    >
                      Change Mobile Number
                    </Button>
                  </div>
                </>
              )}

              <div className="text-center">
                <span className="text-gray-600">Don't have an account? </span>
                <Link
                  href="/register"
                  className="text-[#F47B20] font-medium hover:underline"
                >
                  Sign Up
                </Link>
              </div>

              <div className="text-center pt-4 border-t">
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
