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
} from "lucide-react";
import { apiService } from "@/lib/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleStartDigilockerVerification = async () => {
    setLoading(true);
    setError("");

    try {
      sessionStorage.setItem("aadhaar_return_url", window.location.pathname);
      const payload = {
        user_flow: "signup",
        redirect_url: window.location.origin + "/aadhaar-verified",
      };
      
      const response = await apiService.initiateAadhaarVerification(payload);
      
      if (response && response.digilocker_url) {
        window.location.href = response.digilocker_url;
      } else {
        setError("Failed to initialize verification. Please try again.");
      }
    } catch (error: any) {
      setError(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto p-0 gap-0 max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
            <CardHeader className="text-center pb-3 px-4 pt-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-[#F47B20] to-orange-600 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900">
                Verify Your Identity
              </DialogTitle>
              <p className="text-gray-600 text-xs sm:text-sm">
                Complete verification for faster bike pickup on arrival
              </p>
            </CardHeader>
            <CardContent className="space-y-4 px-4 pb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <h4 className="font-semibold text-green-800 mb-2 text-sm">
                  Benefits of Verification:
                </h4>
                <ul className="text-xs sm:text-sm text-green-700 space-y-1">
                  <li>• Skip document verification at pickup</li>
                  <li>• Faster bike handover process</li>
                  <li>• Enhanced security for your booking</li>
                </ul>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs sm:text-sm">1</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-xs sm:text-sm">
                      Aadhaar Verification
                    </div>
                    <div className="text-xs text-gray-600">Verify via DigiLocker</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-blue-600 font-bold text-xs sm:text-sm">2</span>
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-xs sm:text-sm">Driving License</div>
                    <div className="text-xs text-gray-600">
                      Upload clear photo
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 text-sm h-10" 
                  onClick={onClose}
                >
                  Skip for Now
                </Button>
                <Button
                  className="flex-1 bg-[#F47B20] hover:bg-[#E06A0F] text-white text-sm h-10"
                  onClick={handleStartDigilockerVerification}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      <span className="text-xs sm:text-sm">Initiating...</span>
                    </div>
                  ) : (
                    "Verify via DigiLocker"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
      </DialogContent>
    </Dialog>
  );
}