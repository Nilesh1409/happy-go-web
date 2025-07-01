"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Shield,
  CheckCircle,
  Upload,
  Clock,
  AlertCircle,
  Loader2,
  FileText,
  Camera,
} from "lucide-react";

interface AadhaarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

// Cashfree API configuration
const CASHFREE_CONFIG = {
  baseURL: "https://sandbox.cashfree.com/verification",
  clientId: process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID || "your-client-id",
  clientSecret:
    process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET || "your-client-secret",
};

export default function AadhaarVerificationModal({
  isOpen,
  onClose,
  bookingId,
}: AadhaarVerificationModalProps) {
  const [step, setStep] = useState("intro"); // 'intro', 'aadhaar', 'otp', 'dl', 'completed'
  const [aadhaarNumber, setAadhaarNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [refId, setRefId] = useState("");
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aadhaarData, setAadhaarData] = useState(null);

  // Cashfree API call to generate Aadhaar OTP
  const generateAadhaarOTP = async (aadhaarNumber: string) => {
    const response = await fetch(
      `${CASHFREE_CONFIG.baseURL}/offline-aadhaar/otp`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_CONFIG.clientId,
          "x-client-secret": CASHFREE_CONFIG.clientSecret,
        },
        body: JSON.stringify({
          aadhaar_number: aadhaarNumber,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate OTP");
    }

    return response.json();
  };

  // Cashfree API call to verify Aadhaar OTP
  const verifyAadhaarOTP = async (otp: string, refId: string) => {
    const response = await fetch(
      `${CASHFREE_CONFIG.baseURL}/offline-aadhaar/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": CASHFREE_CONFIG.clientId,
          "x-client-secret": CASHFREE_CONFIG.clientSecret,
        },
        body: JSON.stringify({
          otp: otp,
          ref_id: refId,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to verify OTP");
    }

    return response.json();
  };

  const handleAadhaarSubmit = async () => {
    if (!aadhaarNumber || aadhaarNumber.length !== 12) {
      setError("Please enter a valid 12-digit Aadhaar number");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await generateAadhaarOTP(aadhaarNumber);

      if (response.status === "SUCCESS") {
        setRefId(response.ref_id.toString());
        setStep("otp");
      } else {
        setError(response.message || "Failed to generate OTP");
      }
    } catch (error: any) {
      setError(error.message || "Failed to generate OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await verifyAadhaarOTP(otp, refId);

      if (response.status === "VALID") {
        setAadhaarData(response);

        // Save Aadhaar data to your backend
        try {
          const saveResponse = await fetch(
            `/api/bookings/${bookingId}/aadhaar`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                aadhaarNumber,
                verificationData: response,
              }),
            }
          );

          if (!saveResponse.ok) {
            console.warn("Failed to save Aadhaar data to backend");
          }
        } catch (saveError) {
          console.warn("Failed to save Aadhaar data:", saveError);
        }

        setStep("dl");
      } else {
        setError(response.message || "OTP verification failed");
      }
    } catch (error: any) {
      setError(error.message || "OTP verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDLUpload = async () => {
    if (!dlFile) {
      setError("Please upload your driving license");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("dlImage", dlFile);
      formData.append("bookingId", bookingId);

      const response = await fetch("/api/verification/driving-license", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload driving license");
      }

      setStep("completed");
    } catch (error: any) {
      setError(
        error.message || "Failed to upload driving license. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      setDlFile(file);
      setError("");
    }
  };

  const formatAadhaarNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    const match = cleaned.match(/^(\d{0,4})(\d{0,4})(\d{0,4})$/);
    if (match) {
      return [match[1], match[2], match[3]].filter(Boolean).join(" ");
    }
    return cleaned;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        {step === "intro" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F47B20] to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Verify Your Identity
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Complete verification for faster bike pickup on arrival
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">
                  Benefits of Verification:
                </h4>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Skip document verification at pickup</li>
                  <li>• Faster bike handover process</li>
                  <li>• Enhanced security for your booking</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      Aadhaar Verification
                    </div>
                    <div className="text-xs text-gray-600">Verify with OTP</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Driving License</div>
                    <div className="text-xs text-gray-600">
                      Upload clear photo
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Skip for Now
                </Button>
                <Button
                  className="flex-1 bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={() => setStep("aadhaar")}
                >
                  Start Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "aadhaar" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <DialogTitle className="text-lg font-bold">
                Enter Aadhaar Number
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                We'll send an OTP to your registered mobile number
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Aadhaar Number
                </label>
                <Input
                  type="text"
                  placeholder="0000 0000 0000"
                  value={formatAadhaarNumber(aadhaarNumber)}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    if (cleaned.length <= 12) {
                      setAadhaarNumber(cleaned);
                    }
                  }}
                  className="text-center text-lg tracking-widest font-mono"
                  maxLength={14}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter your 12-digit Aadhaar number
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="flex items-start space-x-2">
                  <Shield className="w-4 h-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs text-yellow-800">
                    <p className="font-medium mb-1">Your data is secure</p>
                    <p>
                      We use Cashfree's secure verification service with
                      bank-grade encryption
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("intro")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={handleAadhaarSubmit}
                  disabled={loading || aadhaarNumber.length !== 12}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Sending OTP...
                    </div>
                  ) : (
                    "Send OTP"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "otp" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
              <DialogTitle className="text-lg font-bold">Enter OTP</DialogTitle>
              <p className="text-gray-600 text-sm">
                Enter the 6-digit OTP sent to your registered mobile number
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">OTP</label>
                <Input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => {
                    const cleaned = e.target.value.replace(/\D/g, "");
                    if (cleaned.length <= 6) {
                      setOtp(cleaned);
                    }
                  }}
                  className="text-center text-xl tracking-widest font-mono"
                  maxLength={6}
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center text-sm text-blue-800">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>OTP is valid for 10 minutes</span>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("aadhaar")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={handleOTPVerification}
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Verifying...
                    </div>
                  ) : (
                    "Verify OTP"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "dl" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <DialogTitle className="text-lg font-bold">
                Upload Driving License
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Upload a clear photo of your driving license
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {aadhaarData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-green-800">
                      Aadhaar Verified Successfully
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    Name: {aadhaarData.name}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">
                  Driving License Photo
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F47B20] transition-colors relative">
                  {dlFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm font-medium">{dlFile.name}</p>
                      <p className="text-xs text-gray-500">
                        {(dlFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDlFile(null)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                  Photo Guidelines:
                </h4>
                <ul className="text-xs text-yellow-700 space-y-1">
                  <li>• Ensure all text is clearly visible</li>
                  <li>• No glare or shadows on the document</li>
                  <li>• Take photo in good lighting</li>
                </ul>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep("otp")}
                  disabled={loading}
                >
                  Back
                </Button>
                <Button
                  className="flex-1 bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={handleDLUpload}
                  disabled={loading || !dlFile}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Uploading...
                    </div>
                  ) : (
                    "Upload License"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === "completed" && (
          <Card className="border-0 shadow-none">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Verification Complete!
              </h2>
              <p className="text-gray-600 mb-6">
                Your documents have been verified successfully. You can now
                enjoy faster pickup at our location!
              </p>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-green-800 mb-2">
                  What's Next?
                </h4>
                <ul className="text-sm text-green-700 space-y-1 text-left">
                  <li>• Arrive at pickup location at scheduled time</li>
                  <li>• Show booking confirmation</li>
                  <li>• Quick verification and bike handover</li>
                </ul>
              </div>

              <Button
                className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                onClick={onClose}
              >
                Continue to Booking
              </Button>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}
