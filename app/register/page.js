"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  Gift,
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  ArrowRight,
  Shield,
  Timer,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

// Loading component for Suspense fallback
function RegisterPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main register component that uses useSearchParams
function RegisterPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check if user is already logged in and redirect to home
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    
    if (token && user) {
      router.replace("/");
    }
  }, [router]);

  const [currentStep, setCurrentStep] = useState("register"); // "register" | "verify-otp" | "success"

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    referralCode: "",
  });

  const [otpData, setOtpData] = useState({
    otp: "",
    timeLeft: 600, // 10 minutes in seconds
    canResend: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [registrationData, setRegistrationData] = useState(null);
  const [authData, setAuthData] = useState(null);

  // Referral validation states
  const [referralValidation, setReferralValidation] = useState({
    isValidating: false,
    isValid: null,
    referrerName: "",
    reward: 0,
    message: "",
  });

  // OTP Timer
  useEffect(() => {
    let timer;
    if (currentStep === "verify-otp" && otpData.timeLeft > 0) {
      timer = setInterval(() => {
        setOtpData((prev) => {
          const newTimeLeft = prev.timeLeft - 1;
          return {
            ...prev,
            timeLeft: newTimeLeft,
            canResend: newTimeLeft === 0,
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentStep, otpData.timeLeft]);

  useEffect(() => {
    const refCode = searchParams.get("ref");
    if (refCode) {
      setFormData((prev) => ({ ...prev, referralCode: refCode.toUpperCase() }));
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  const validateReferralCode = useCallback(async (code) => {
    if (!code || code.length < 3) {
      setReferralValidation({
        isValidating: false,
        isValid: null,
        referrerName: "",
        reward: 0,
        message: "",
      });
      return;
    }

    setReferralValidation((prev) => ({ ...prev, isValidating: true }));

    try {
      const response = await apiService.applyReferralCode(code);
      setReferralValidation({
        isValidating: false,
        isValid: true,
        referrerName: response.data.referrer.name,
        reward: response.data.reward,
        message: response.data.message,
      });
      setError("");
    } catch (error) {
      setReferralValidation({
        isValidating: false,
        isValid: false,
        referrerName: "",
        reward: 0,
        message: error.message || "Invalid referral code",
      });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.referralCode) {
        validateReferralCode(formData.referralCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.referralCode, validateReferralCode]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const formatMobileNumber = (value) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Please enter your full name");
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError("Name must be at least 2 characters long");
      return false;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address");
      return false;
    }

    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    ) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!formData.mobile.trim()) {
      setError("Please enter your mobile number");
      return false;
    }

    if (formData.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return false;
    }

    if (formData.referralCode && !referralValidation.isValid) {
      setError("Please enter a valid referral code or leave it empty");
      return false;
    }

    return true;
  };

  const handleRegistration = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const registrationPayload = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        mobile: formData.mobile.trim(),
      };

      if (formData.referralCode && referralValidation.isValid) {
        registrationPayload.referralCode = formData.referralCode.toUpperCase();
      }

      const response = await apiService.register(registrationPayload);

      setRegistrationData(response.data);
      setCurrentStep("verify-otp");
      setOtpData((prev) => ({ ...prev, timeLeft: 600, canResend: false }));
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async (e) => {
    e.preventDefault();

    if (!otpData.otp || otpData.otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.verifyMobileOTP(
        registrationData.mobile,
        otpData.otp
      );

      // Store auth data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      setAuthData(response.data);
      setCurrentStep("success");
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setLoading(true);
    setError("");

    try {
      await apiService.sendMobileOTP(registrationData.mobile);
      setOtpData((prev) => ({ ...prev, timeLeft: 600, canResend: false }));
      setError("");
    } catch (error) {
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinueToDashboard = () => {
    router.push("/");
  };

  // Success Step
  if (currentStep === "success") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <h2 className="text-2xl font-bold text-green-600 mb-2">
                  Welcome to Happy Go! 🎉
                </h2>

                <p className="text-gray-600 mb-4">
                  Your account is now fully verified and ready to use!
                </p>

                {registrationData?.referralApplied && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-center mb-2">
                      <Gift className="w-5 h-5 text-orange-600 mr-2" />
                      <span className="font-semibold text-orange-800">
                        Referral Bonus Active!
                      </span>
                    </div>
                    <p className="text-orange-700 text-sm mb-2">
                      Referred by{" "}
                      <strong>{registrationData.referrerName}</strong>
                    </p>
                    <div className="bg-orange-100 rounded-md p-2">
                      <p className="text-orange-800 font-bold">
                        🎁 ₹{registrationData.referralReward} off your first
                        booking!
                      </p>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    Your Referral Code
                  </h3>
                  <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-3">
                    <code className="text-lg font-bold text-blue-600 tracking-wider">
                      {registrationData?.referralCode}
                    </code>
                  </div>
                  <p className="text-blue-700 text-xs mt-2">
                    Share with friends and earn ₹100 per referral!
                  </p>
                </div>

                <Button
                  onClick={handleContinueToDashboard}
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white mb-3"
                >
                  Start Booking Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <p className="text-xs text-gray-500">
                  Don't forget to check your email for the verification link!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // OTP Verification Step
  if (currentStep === "verify-otp") {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="py-12">
          <div className="max-w-md mx-auto px-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">
                  Verify Mobile Number
                </CardTitle>
                <p className="text-center text-gray-600">
                  Enter the OTP sent to +91 {registrationData?.mobile}
                </p>
              </CardHeader>

              <CardContent>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleOTPVerification} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpData.otp}
                      onChange={(e) =>
                        setOtpData((prev) => ({
                          ...prev,
                          otp: e.target.value.replace(/\D/g, "").slice(0, 6),
                        }))
                      }
                      className="h-12 text-center text-lg tracking-widest"
                      maxLength={6}
                    />
                  </div>

                  <div className="text-center">
                    {otpData.timeLeft > 0 ? (
                      <div className="flex items-center justify-center text-sm text-gray-600">
                        <Timer className="w-4 h-4 mr-2" />
                        <span>
                          OTP expires in {formatTime(otpData.timeLeft)}
                        </span>
                      </div>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleResendOTP}
                        disabled={loading}
                        className="text-[#F47B20] border-[#F47B20]"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          "Resend OTP"
                        )}
                      </Button>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12"
                    disabled={loading || otpData.otp.length !== 6}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify & Continue
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center mt-6">
                  <p className="text-xs text-gray-500">
                    Didn't receive the OTP? Check your email or wait for the
                    timer to resend.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Registration Step (existing form)
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
                Create Account
              </CardTitle>
              <p className="text-center text-gray-600">
                Join thousands of happy travelers
              </p>
            </CardHeader>

            <CardContent>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleRegistration} className="space-y-6">
                <div>
                  <Input
                    type="text"
                    placeholder="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="h-12"
                  />
                </div>

                <div>
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 border border-r-0 rounded-l-md bg-gray-50 h-12">
                      <span className="text-gray-600 font-medium">+91</span>
                    </div>
                    <Input
                      type="tel"
                      placeholder="Mobile Number"
                      value={formData.mobile}
                      onChange={(e) =>
                        handleInputChange(
                          "mobile",
                          formatMobileNumber(e.target.value)
                        )
                      }
                      className="rounded-l-none h-12"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <div className="relative">
                    <div className="flex items-center space-x-2">
                      <Input
                        type="text"
                        placeholder="Referral Code (Optional)"
                        value={formData.referralCode}
                        onChange={(e) =>
                          handleInputChange(
                            "referralCode",
                            e.target.value.toUpperCase()
                          )
                        }
                        className="flex-1 h-12 pr-10"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        {referralValidation.isValidating ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : referralValidation.isValid === true ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : referralValidation.isValid === false ? (
                          <AlertCircle className="w-4 h-4 text-red-500" />
                        ) : (
                          <Gift className="w-4 h-4 text-orange-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {referralValidation.isValid === true && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center text-green-700 text-sm">
                        <Users className="w-4 h-4 mr-2" />
                        <span>
                          Referred by{" "}
                          <strong>{referralValidation.referrerName}</strong>
                        </span>
                      </div>
                      <p className="text-green-600 text-xs mt-1">
                        🎉 You'll get ₹{referralValidation.reward} off on your
                        first booking!
                      </p>
                    </div>
                  )}

                  {referralValidation.isValid === false &&
                    formData.referralCode && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">
                          {referralValidation.message}
                        </p>
                      </div>
                    )}

                  {!formData.referralCode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Have a referral code? Enter it to get ₹500 off your first
                      booking!
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 text-base font-medium"
                  disabled={loading || referralValidation.isValidating}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account & Send OTP"
                  )}
                </Button>
              </form>

              <div className="text-center mt-6">
                <span className="text-gray-600">Already have an account? </span>
                <Link
                  href="/login"
                  className="text-[#F47B20] font-medium hover:underline"
                >
                  Sign In
                </Link>
              </div>

              <div className="text-center pt-4 border-t mt-6">
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <span>Need help? Call </span>
                  <a
                    href="tel:+919008022800"
                    className="text-[#F47B20] font-medium ml-1 hover:underline"
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

// Main export with Suspense wrapper
export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageSkeleton />}>
      <RegisterPageContent />
    </Suspense>
  );
}
