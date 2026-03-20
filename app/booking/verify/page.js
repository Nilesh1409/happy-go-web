"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, ArrowLeft, UploadCloud, Smartphone } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/lib/toast";

export default function BookingVerify() {
  const router = useRouter();

  // Steps: 1 = Aadhaar Entry, 2 = OTP Verification, 3 = DL Details & Upload
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    fullName: "",
    aadhaarNumber: "",
    otp: "",
    dlNumber: "",
    dlFile: null,
  });

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (file && (file.type.includes("image") || file.type.includes("pdf"))) {
      setFormData((prev) => ({ ...prev, [field]: file }));
    } else {
      toast.error("Invalid File", "Please upload an image or PDF.");
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!formData.fullName) {
      toast.error("Validation Error", "Full Name is required.");
      return;
    }

    if (!/^\d{12}$/.test(formData.aadhaarNumber)) {
      toast.error("Validation Error", "Aadhaar Number must be 12 digits.");
      return;
    }

    setLoading(true);
    try {
      // Simulate sending OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("OTP Sent", "An OTP has been sent to your Aadhaar linked mobile number (Dummy).");
      setStep(2);
    } catch (error) {
      toast.error("Error", "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!/^\d{6}$/.test(formData.otp)) {
      toast.error("Validation Error", "Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Simulate verifying OTP
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Aadhaar Verified", "Your Aadhaar has been verified successfully.");
      setStep(3);
    } catch (error) {
      toast.error("Error", "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDL = async (e) => {
    e.preventDefault();

    if (!formData.dlNumber) {
      toast.error("Validation Error", "Driving License Number is required.");
      return;
    }

    if (!formData.dlFile) {
      toast.error("Validation Error", "Please upload your Driving License.");
      return;
    }

    setLoading(true);
    try {
      // Simulate final submission
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success("Verification Complete", "All documents submitted successfully!");
      router.push("/bookings");
    } catch (error) {
      toast.error("Error", "Failed to submit final verification details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader className="space-y-4 pb-4">

          {/* Title Row */}
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (step > 1) setStep(step - 1);
                else router.back();
              }}
              className="p-0 h-8 w-8"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </Button>

            <CardTitle className="text-2xl font-bold text-gray-900">
              Identity Verification
            </CardTitle>
          </div>

          {/* Description */}
          <CardDescription>
            {step === 1 && "Step 1/3: Verify your Aadhaar details."}
            {step === 2 && "Step 2/3: Enter OTP sent to registered mobile."}
            {step === 3 && "Step 3/3: Upload Driving License for final verification."}
          </CardDescription>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="bg-[#F47B20] h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

        </CardHeader>

        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium">Full Name (As per Aadhaar)</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadhaarNumber" className="text-sm font-medium">Aadhaar Number</Label>
                <Input
                  id="aadhaarNumber"
                  type="text"
                  placeholder="12-digit Aadhaar Number"
                  maxLength={12}
                  value={formData.aadhaarNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, aadhaarNumber: val });
                  }}
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white shadow-md hover:shadow-lg transition-all"
                  disabled={loading || formData.aadhaarNumber.length < 12}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Sending OTP...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-5 h-5" />
                      Send OTP
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg flex flex-col items-center justify-center text-center space-y-2 border border-orange-100 mb-4">
                <p className="text-sm text-gray-600">
                  OTP sent to Aadhaar linked number for <span className="font-semibold text-gray-800">XXXX-XXXX-{formData.aadhaarNumber.slice(-4)}</span>
                </p>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#F47B20] hover:underline font-medium"
                >
                  Change Aadhaar Number
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp" className="text-sm font-medium">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="XXXXXX"
                  maxLength={6}
                  value={formData.otp}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setFormData({ ...formData, otp: val });
                  }}
                  className="text-center text-lg tracking-widest font-semibold"
                />
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white shadow-md hover:shadow-lg transition-all"
                  disabled={loading || formData.otp.length < 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Verify OTP
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmitDL} className="space-y-4">
              <div className="bg-green-50 p-3 rounded-lg border border-green-200 mb-4 flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <p className="text-sm text-green-800 font-medium">Aadhaar Verification Successful</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dlNumber" className="text-sm font-medium">Driving License Number</Label>
                <Input
                  id="dlNumber"
                  placeholder="e.g. MH1220110062821"
                  value={formData.dlNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, dlNumber: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dlFile" className="text-sm font-medium">Upload Driving License</Label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <label
                        htmlFor="dlFile"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-[#F47B20] hover:text-[#E06A0F] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#F47B20]"
                      >
                        <span>Upload a file</span>
                        <Input
                          id="dlFile"
                          type="file"
                          accept="image/*,.pdf"
                          className="sr-only"
                          onChange={(e) => handleFileChange(e, "dlFile")}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, PDF up to 5MB
                    </p>
                    {formData.dlFile && (
                      <p className="text-sm text-green-600 font-medium mt-2">
                        ✓ {formData.dlFile.name} selected
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white shadow-md hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Complete Verification
                    </span>
                  )}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
