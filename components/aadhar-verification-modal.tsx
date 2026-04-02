"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Shield,
  CheckCircle,
  Upload,
  Clock,
  AlertCircle,
  Loader2,
  Camera,
  ExternalLink,
  RefreshCw,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

interface AadhaarVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  /** Pass "dl" to open directly on the DL upload step (e.g. for updating an existing DL) */
  initialStep?: Step;
}

type Step = "intro" | "loading" | "digilocker" | "completing" | "dl" | "completed";

type VerifiedData = {
  maskedNumber: string;
  name: string;
  dob: string;
  gender: string;
  address: { full: string };
};

// Same redirect URL used in the mobile app
const REDIRECT_URL = "https://happygorentals.com/aadhaar-verified";

const authHeader = () => ({
  Authorization: `Bearer ${typeof window !== "undefined" ? localStorage.getItem("token") : ""}`,
});

export default function AadhaarVerificationModal({
  isOpen,
  onClose,
  bookingId,
  initialStep = "intro",
}: AadhaarVerificationModalProps) {
  const [step, setStep] = useState<Step>(initialStep);
  const [dlFile, setDlFile] = useState<File | null>(null);
  const [dlLoading, setDlLoading] = useState(false);
  const [error, setError] = useState("");
  const [verifiedData, setVerifiedData] = useState<VerifiedData | null>(null);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const digilockerWindowRef = useRef<Window | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Reset to initialStep whenever the modal is opened
  useEffect(() => {
    if (isOpen) {
      setStep(initialStep);
      setError("");
      setDlFile(null);
    }
  }, [isOpen, initialStep]);

  // Cleanup on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopPolling();
      digilockerWindowRef.current?.close();
    }
    return () => {
      stopPolling();
      digilockerWindowRef.current?.close();
    };
  }, [isOpen, stopPolling]);

  // ── Step 1: Initiate DigiLocker via backend ───────────────────────────────────
  const handleInitiate = async () => {
    setStep("loading");
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/api/verification/aadhaar/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({ redirect_url: REDIRECT_URL, user_flow: "signup" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to initiate verification");

      const popup = window.open(
        data.data.digilocker_url,
        "digilocker_verify",
        "width=600,height=700,scrollbars=yes,resizable=yes"
      );
      if (!popup) {
        throw new Error(
          "Popup was blocked by your browser. Please allow popups for this site and try again."
        );
      }
      digilockerWindowRef.current = popup;
      setStep("digilocker");
      startPolling();
    } catch (err: any) {
      setStep("intro");
      setError(err.message || "Failed to start verification. Please try again.");
    }
  };

  // ── Step 2: Poll /status until AUTHENTICATED ─────────────────────────────────
  const startPolling = () => {
    let attempts = 0;
    const MAX_ATTEMPTS = 30; // 30 × 2s = 60 seconds

    pollIntervalRef.current = setInterval(async () => {
      attempts += 1;

      // User manually closed the popup
      if (digilockerWindowRef.current?.closed) {
        stopPolling();
        setStep("intro");
        setError("Verification window was closed. Please try again.");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/verification/aadhaar/status`, {
          headers: authHeader(),
        });
        const data = await res.json();
        const status: string = data.data?.status;

        if (status === "AUTHENTICATED") {
          stopPolling();
          digilockerWindowRef.current?.close();
          // Inline complete to avoid stale closure
          setStep("completing");
          try {
            const completeRes = await fetch(`${API_BASE_URL}/api/verification/aadhaar/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeader() },
              body: JSON.stringify({}),
            });
            const completeData = await completeRes.json();
            if (!completeRes.ok)
              throw new Error(completeData.message || "Failed to complete verification");
            setVerifiedData(completeData.data);
            setStep("dl");
          } catch (err: any) {
            setStep("intro");
            setError(err.message || "Failed to fetch Aadhaar details. Please try again.");
          }
        } else if (status === "EXPIRED") {
          stopPolling();
          digilockerWindowRef.current?.close();
          setStep("intro");
          setError("Verification session expired. Please try again.");
        } else if (status === "CONSENT_DENIED") {
          stopPolling();
          digilockerWindowRef.current?.close();
          setStep("intro");
          setError(
            "Aadhaar consent was denied. Please try again and approve the sharing request in DigiLocker."
          );
        } else if (attempts >= MAX_ATTEMPTS) {
          stopPolling();
          digilockerWindowRef.current?.close();
          setStep("intro");
          setError("Verification timed out. Please try again.");
        }
        // PENDING → keep polling
      } catch {
        if (attempts >= MAX_ATTEMPTS) {
          stopPolling();
          setStep("intro");
          setError("Verification failed. Please try again.");
        }
      }
    }, 2000);
  };

  // ── DL Upload ─────────────────────────────────────────────────────────────────
  const handleDLUpload = async () => {
    if (!dlFile) {
      setError("Please upload your driving license");
      return;
    }
    setDlLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("dlImage", dlFile);
      formData.append("bookingId", bookingId);
      const res = await fetch(`${API_BASE_URL}/api/verification/driving-license`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload driving license");
      setStep("completed");
    } catch (err: any) {
      setError(err.message || "Failed to upload driving license. Please try again.");
    } finally {
      setDlLoading(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 gap-0 max-h-[90vh] overflow-y-auto">

        {/* ── Intro ── */}
        {step === "intro" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-3 px-4 pt-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#F47B20] to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <DialogTitle className="text-xl font-bold text-gray-900">
                Verify Your Identity
              </DialogTitle>
              <p className="text-gray-600 text-sm">
                Secure verification via DigiLocker — government-approved platform
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">Benefits:</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Skip document check at pickup</li>
                  <li>• Faster bike handover process</li>
                  <li>• Enhanced booking security</li>
                </ul>
              </div>

              <div className="space-y-2">
                {[
                  {
                    num: "1",
                    title: "Aadhaar via DigiLocker",
                    desc: "Log in with your Aadhaar-linked mobile OTP & approve consent",
                  },
                  {
                    num: "2",
                    title: "Upload Driving License",
                    desc: "Clear photo of your DL — front side",
                  },
                ].map((s) => (
                  <div key={s.num} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-[#F47B20] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-white font-bold text-sm">{s.num}</span>
                    </div>
                    <div>
                      <div className="font-medium text-sm">{s.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800">
                  We never receive your raw Aadhaar number. Your data is encrypted and handled
                  securely through Cashfree's bank-grade verification service.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1 h-10 text-sm" onClick={onClose}>
                  Skip for Now
                </Button>
                <Button
                  className="flex-1 h-10 text-sm bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={handleInitiate}
                >
                  Start Verification
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Initiating ── */}
        {step === "loading" && (
          <Card className="border-0 shadow-none">
            <CardContent className="p-10 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-[#F47B20] mx-auto" />
              <p className="text-sm font-medium text-gray-700">Opening DigiLocker…</p>
              <p className="text-xs text-gray-500">
                Please wait while we prepare your verification session
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── DigiLocker popup open / polling ── */}
        {step === "digilocker" && (
          <Card className="border-0 shadow-none">
            <CardContent className="p-8 text-center space-y-5">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <ExternalLink className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">DigiLocker Opened</p>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Complete the Aadhaar verification in the popup window. This dialog will
                  update automatically once you approve consent.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600 flex-shrink-0" />
                <span className="text-xs text-blue-700">
                  Waiting for your consent confirmation…
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 justify-center">
                <Clock className="w-3.5 h-3.5" />
                <span>Session valid for 10 minutes</span>
              </div>
              <Button
                variant="outline"
                className="w-full h-10 text-sm"
                onClick={() => {
                  stopPolling();
                  digilockerWindowRef.current?.close();
                  setStep("intro");
                  setError("");
                }}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ── Completing ── */}
        {step === "completing" && (
          <Card className="border-0 shadow-none">
            <CardContent className="p-10 text-center space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-[#F47B20] mx-auto" />
              <p className="text-sm font-medium text-gray-700">Fetching your Aadhaar details…</p>
            </CardContent>
          </Card>
        )}

        {/* ── DL Upload ── */}
        {step === "dl" && (
          <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-3 px-4 pt-6">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-purple-600" />
              </div>
              <DialogTitle className="text-lg font-bold">Upload Driving License</DialogTitle>
              <p className="text-gray-600 text-sm">Upload a clear photo of your driving license</p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-6">
              {verifiedData && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-semibold text-green-800">
                      Aadhaar Verified Successfully
                    </span>
                  </div>
                  <p className="text-xs text-green-700">
                    Name: {verifiedData.name} &nbsp;·&nbsp; Aadhaar: {verifiedData.maskedNumber}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#F47B20] transition-colors relative cursor-pointer">
                {dlFile ? (
                  <div className="space-y-2">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                    <p className="text-sm font-medium break-all">{dlFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(dlFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDlFile(null)}
                      className="text-xs h-8"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <h4 className="text-xs font-medium text-amber-800 mb-1">Photo Guidelines:</h4>
                <ul className="text-xs text-amber-700 space-y-1">
                  <li>• Ensure all text is clearly visible</li>
                  <li>• No glare or shadows on the document</li>
                  <li>• Take photo in good lighting</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1 h-10 text-sm"
                  onClick={() => setStep("completed")}
                  disabled={dlLoading}
                >
                  Skip for Now
                </Button>
                <Button
                  className="flex-1 h-10 text-sm bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={handleDLUpload}
                  disabled={dlLoading || !dlFile}
                >
                  {dlLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading…
                    </span>
                  ) : (
                    "Upload License"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Completed ── */}
        {step === "completed" && (
          <Card className="border-0 shadow-none">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-green-600">Verification Complete!</h2>
                <p className="text-gray-600 text-sm mt-1">
                  Your documents have been verified. Enjoy faster pickup at our location!
                </p>
              </div>

              {verifiedData && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-left space-y-2">
                  <InfoRow label="Name" value={verifiedData.name} />
                  {verifiedData.dob && <InfoRow label="DOB" value={verifiedData.dob} />}
                  {verifiedData.gender && <InfoRow label="Gender" value={verifiedData.gender} />}
                  {verifiedData.maskedNumber && (
                    <InfoRow label="Aadhaar" value={verifiedData.maskedNumber} />
                  )}
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-left">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">What's Next?</h4>
                <ul className="text-xs text-green-700 space-y-1">
                  <li>• Arrive at pickup location at scheduled time</li>
                  <li>• Show your booking confirmation</li>
                  <li>• Quick handover — no extra paperwork</li>
                </ul>
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-11"
                  onClick={onClose}
                >
                  Continue to Booking
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-10 text-sm gap-2"
                  onClick={() => {
                    setDlFile(null);
                    setError("");
                    setStep("dl");
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  Update Driving License
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-sm py-1">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-gray-900">{value}</span>
    </div>
  );
}
