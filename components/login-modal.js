"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Phone,
  Loader2,
  CheckCircle,
  ArrowLeft,
  Gift,
  Users,
  AlertCircle,
  Timer,
  Shield,
  ArrowRight,
} from "lucide-react";
import { apiService } from "@/lib/api";

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [step, setStep] = useState("mobile"); // 'mobile', 'login-otp', 'register', 'register-otp', 'success'
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    mobile: "",
    referralCode: "",
  });

  const [registrationResponse, setRegistrationResponse] = useState(null);

  // OTP Timer
  const [otpData, setOtpData] = useState({
    timeLeft: 600, // 10 minutes
    canResend: false,
  });

  // Referral validation
  const [referralValidation, setReferralValidation] = useState({
    isValidating: false,
    isValid: null,
    referrerName: "",
    reward: 0,
    message: "",
  });

  // OTP Timer Effect
  useEffect(() => {
    let timer;
    if (
      (step === "login-otp" || step === "register-otp") &&
      otpData.timeLeft > 0
    ) {
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
  }, [step, otpData.timeLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const validateReferralCode = async (code) => {
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
      const response = await apiService.validateReferralCode(code);
      setReferralValidation({
        isValidating: false,
        isValid: true,
        referrerName: response.data.referrer.name,
        reward: response.data.reward,
        message: response.data.message,
      });
    } catch (error) {
      setReferralValidation({
        isValidating: false,
        isValid: false,
        referrerName: "",
        reward: 0,
        message: error.message || "Invalid referral code",
      });
    }
  };

  // Debounced referral validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (registerData.referralCode) {
        validateReferralCode(registerData.referralCode);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [registerData.referralCode]);

  const handleSendOTP = async () => {
    if (!mobile || mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await apiService.sendMobileOTP(mobile);
      setStep("login-otp");
      setOtpData({ timeLeft: 600, canResend: false });
    } catch (error) {
      console.log("🚀 ~ handleSendOTP ~ error:", error);
      if (
        error.message.includes("not found") ||
        error.message.includes("not registered")
      ) {
        setIsNewUser(true);
        setRegisterData((prev) => ({ ...prev, mobile }));
        setStep("register");
      } else {
        setError(error.message || "Failed to send OTP. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginOTP = async () => {
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

      // Success callback
      if (onLoginSuccess) {
        onLoginSuccess(response.data);
      }

      onClose();
      window.location.reload(); // Refresh to update header
    } catch (error) {
      setError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!registerData.name || !registerData.email || !registerData.mobile) {
      setError("Please fill in all required fields");
      return;
    }

    if (registerData.mobile.length !== 10) {
      setError("Please enter a valid 10-digit mobile number");
      return;
    }

    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        registerData.email
      )
    ) {
      setError("Please enter a valid email address");
      return;
    }

    if (registerData.referralCode && !referralValidation.isValid) {
      setError("Please enter a valid referral code or leave it empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const registrationPayload = {
        name: registerData.name.trim(),
        email: registerData.email.toLowerCase().trim(),
        mobile: registerData.mobile.trim(),
      };

      if (registerData.referralCode && referralValidation.isValid) {
        registrationPayload.referralCode =
          registerData.referralCode.toUpperCase();
      }

      const response = await apiService.register(registrationPayload);

      setRegistrationResponse(response.data);
      setStep("register-otp");
      setOtpData({ timeLeft: 600, canResend: false });
    } catch (error) {
      setError(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyRegisterOTP = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await apiService.verifyMobileOTP(
        registrationResponse.mobile,
        otp
      );

      // Store token and user data
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.data));

      setStep("success");
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
      const mobileToUse =
        step === "register-otp" ? registrationResponse.mobile : mobile;
      await apiService.sendMobileOTP(mobileToUse);
      setOtpData({ timeLeft: 600, canResend: false });
    } catch (error) {
      setError(error.message || "Failed to resend OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (onLoginSuccess) {
      onLoginSuccess();
    }
    onClose();
    window.location.reload();
  };

  const resetModal = () => {
    setStep("mobile");
    setMobile("");
    setOtp("");
    setError("");
    setIsNewUser(false);
    setRegisterData({ name: "", email: "", mobile: "", referralCode: "" });
    setRegistrationResponse(null);
    setOtpData({ timeLeft: 600, canResend: false });
    setReferralValidation({
      isValidating: false,
      isValid: null,
      referrerName: "",
      reward: 0,
      message: "",
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          resetModal();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md mx-auto p-0 overflow-hidden">
        {/* Mobile Number Step */}
        {step === "mobile" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-[#F47B20] to-orange-600 text-white rounded-t-lg">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 flex items-center justify-center">
                <img
                  src="/assets/happygo.jpeg"
                  alt="Happy Go Logo"
                  className="w-4/5 h-4/5 object-cover rounded-2xl"
                />
              </div>

              <DialogTitle className="text-2xl font-bold">
                Welcome to Happy Go!
              </DialogTitle>
              <p className="text-orange-100">
                Enter your mobile number to continue
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Mobile Number
                </label>
                <div className="flex">
                  <div className="flex items-center px-4 py-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-600 font-medium h-12">
                    +91
                  </div>
                  <Input
                    type="tel"
                    placeholder="Enter mobile number"
                    value={mobile}
                    onChange={(e) =>
                      setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    className="rounded-l-none border-l-0 focus:border-l focus:border-[#F47B20] h-12"
                    maxLength={10}
                  />
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold bg-[#F47B20] hover:bg-[#E06A0F]"
                onClick={handleSendOTP}
                disabled={loading || mobile.length !== 10}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Checking...
                  </div>
                ) : (
                  "Continue"
                )}
              </Button>

              <div className="text-center pt-4 border-t">
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
        )}

        {/* Login OTP Step */}
        {step === "login-otp" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-t-lg">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Verify OTP
              </DialogTitle>
              <p className="text-green-100">
                Enter the 6-digit code sent to +91 {mobile}
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  OTP Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-xl tracking-widest font-mono h-12"
                  maxLength={6}
                />
              </div>

              <div className="text-center">
                {otpData.timeLeft > 0 ? (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Timer className="w-4 h-4 mr-2" />
                    <span>OTP expires in {formatTime(otpData.timeLeft)}</span>
                  </div>
                ) : (
                  <Button
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
                className="w-full h-12 text-lg font-semibold bg-green-600 hover:bg-green-700"
                onClick={handleVerifyLoginOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify & Login
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setStep("mobile");
                    setOtp("");
                    setError("");
                  }}
                  className="text-gray-600 flex items-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Change Mobile Number
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration Step */}
        {step === "register" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-t-lg">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 flex items-center justify-center">
                <img
                  src="/assets/happygo.jpeg"
                  alt="Happy Go Logo"
                  className="w-4/5 h-4/5 object-cover rounded-2xl"
                />
              </div>

              <DialogTitle className="text-xl font-bold">
                Create Account
              </DialogTitle>
              <p className="text-blue-100">Join thousands of happy travelers</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    value={registerData.name}
                    onChange={(e) =>
                      setRegisterData({ ...registerData, name: e.target.value })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      })
                    }
                    className="h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Mobile Number
                  </label>
                  <div className="flex">
                    <div className="flex items-center px-4 py-3 border border-r-0 rounded-l-lg bg-gray-50 text-gray-600 font-medium h-12">
                      +91
                    </div>
                    <Input
                      type="tel"
                      placeholder="Mobile number"
                      value={registerData.mobile}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          mobile: e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10),
                        })
                      }
                      className="rounded-l-none border-l-0 focus:border-l focus:border-[#F47B20] h-12"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Referral Code (Optional)
                  </label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Enter referral code"
                      value={registerData.referralCode}
                      onChange={(e) =>
                        setRegisterData({
                          ...registerData,
                          referralCode: e.target.value.toUpperCase(),
                        })
                      }
                      className="h-12 pr-10"
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
                    registerData.referralCode && (
                      <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm">
                          {referralValidation.message}
                        </p>
                      </div>
                    )}

                  {!registerData.referralCode && (
                    <p className="text-xs text-gray-500 mt-1">
                      Have a referral code? Enter it to get ₹500 off your first
                      booking!
                    </p>
                  )}
                </div>
              </div>

              <Button
                className="w-full h-12 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
                onClick={handleRegister}
                disabled={loading || referralValidation.isValidating}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creating Account...
                  </div>
                ) : (
                  "Create Account & Send OTP"
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  onClick={() => {
                    setStep("mobile");
                    setError("");
                  }}
                  className="text-gray-600 flex items-center mx-auto"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to Login
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Registration OTP Step */}
        {step === "register-otp" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-t-lg">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold">
                Verify Mobile Number
              </DialogTitle>
              <p className="text-purple-100">
                Enter the OTP sent to +91 {registrationResponse?.mobile}
              </p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  OTP Code
                </label>
                <Input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-xl tracking-widest font-mono h-12"
                  maxLength={6}
                />
              </div>

              <div className="text-center">
                {otpData.timeLeft > 0 ? (
                  <div className="flex items-center justify-center text-sm text-gray-600">
                    <Timer className="w-4 h-4 mr-2" />
                    <span>OTP expires in {formatTime(otpData.timeLeft)}</span>
                  </div>
                ) : (
                  <Button
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
                className="w-full h-12 text-lg font-semibold bg-purple-600 hover:bg-purple-700"
                onClick={handleVerifyRegisterOTP}
                disabled={loading || otp.length !== 6}
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Verifying...
                  </div>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Verify & Complete Registration
                  </>
                )}
              </Button>

              <div className="text-center">
                <p className="text-xs text-gray-500">
                  Didn't receive the OTP? Check your email or wait for the timer
                  to resend.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === "success" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-t-lg">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <DialogTitle className="text-2xl font-bold">
                Welcome to Happy Go! 🎉
              </DialogTitle>
              <p className="text-green-100">Your account is ready to use</p>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {registrationResponse?.referralApplied && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Gift className="w-5 h-5 text-orange-600 mr-2" />
                    <span className="font-semibold text-orange-800">
                      Referral Bonus Active!
                    </span>
                  </div>
                  <p className="text-orange-700 text-sm mb-2 text-center">
                    Referred by{" "}
                    <strong>{registrationResponse.referrerName}</strong>
                  </p>
                  <div className="bg-orange-100 rounded-md p-2 text-center">
                    <p className="text-orange-800 font-bold">
                      🎁 ₹{registrationResponse.referralReward} off your first
                      booking!
                    </p>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-2 text-center">
                  Your Referral Code
                </h3>
                <div className="bg-white border-2 border-dashed border-blue-300 rounded-lg p-3 text-center">
                  <code className="text-lg font-bold text-blue-600 tracking-wider">
                    {registrationResponse?.referralCode}
                  </code>
                </div>
                <p className="text-blue-700 text-xs mt-2 text-center">
                  Share with friends and earn ₹100 per referral!
                </p>
              </div>

              <Button
                onClick={handleContinue}
                className="w-full h-12 text-lg font-semibold bg-[#F47B20] hover:bg-[#E06A0F]"
              >
                Start Booking Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Don't forget to check your email for the verification link!
              </p>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
