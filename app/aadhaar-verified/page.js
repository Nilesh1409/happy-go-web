"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiService } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function AadhaarVerifiedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verificationId = searchParams.get("verification_id");
  
  const [status, setStatus] = useState("polling"); // polling, success, error
  const [errorMessage, setErrorMessage] = useState("");
  const initialCheckDone = useRef(false);

  useEffect(() => {
    if (!verificationId) {
      setStatus("error");
      setErrorMessage("No verification ID provided.");
      return;
    }

    if (initialCheckDone.current) return;
    initialCheckDone.current = true;

    let pollInterval;

    const pollStatus = async () => {
      try {
        const response = await apiService.checkAadhaarStatus();
        
        if (response.success && response.data) {
          const authStatus = response.data.status;
          
          if (authStatus === "AUTHENTICATED") {
            clearInterval(pollInterval);
            await completeVerification();
          } else if (authStatus === "EXPIRED" || authStatus === "CONSENT_DENIED") {
            clearInterval(pollInterval);
            setStatus("error");
            setErrorMessage(`Verification failed: ${authStatus}`);
          }
          // If status is still padding/processing, continue polling
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    const completeVerification = async () => {
      try {
        const response = await apiService.completeAadhaarVerification();
        if (response.success) {
          setStatus("success");
          
          // Let the user see the success message for 2 seconds before redirecting
          setTimeout(() => {
            const returnUrl = sessionStorage.getItem("aadhaar_return_url") || "/profile";
            sessionStorage.removeItem("aadhaar_return_url");
            router.push(returnUrl);
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage(response.message || "Failed to complete verification.");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage(err.message || "Failed to complete verification.");
      }
    };

    // Start polling every 3 seconds
    pollInterval = setInterval(pollStatus, 3000);
    pollStatus(); // Initial call

    return () => clearInterval(pollInterval); // Cleanup on unmount
  }, [verificationId, router]);

  const handleRetry = () => {
    const returnUrl = sessionStorage.getItem("aadhaar_return_url") || "/profile";
    router.push(returnUrl);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-xl font-bold">Aadhaar Verification</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-8 text-center">
            {status === "polling" && (
              <div className="flex flex-col items-center py-6">
                <Loader2 className="w-12 h-12 animate-spin text-[#F47B20] mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Verifying Please Wait...</h3>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your Aadhaar with DigiLocker. This process typically takes a few seconds.
                </p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-green-700 mb-2">Verification Successful!</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your Aadhaar has been verified successfully. Redirecting you back...
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-red-700 mb-2">Verification Failed</h3>
                <p className="text-sm text-gray-600 mb-6">
                  {errorMessage || "We couldn't verify your Aadhaar at this time."}
                </p>
                <Button 
                  onClick={handleRetry}
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
