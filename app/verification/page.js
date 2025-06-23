"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Upload, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function VerificationPage() {
  const [step, setStep] = useState("aadhar") // 'aadhar', 'dl', 'completed'
  const [aadharNumber, setAadharNumber] = useState("")
  const [dlFile, setDlFile] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleAadharVerification = async () => {
    if (!aadharNumber || aadharNumber.length !== 12) {
      alert("Please enter a valid 12-digit Aadhar number")
      return
    }

    setLoading(true)
    try {
      // Simulate Aadhar verification API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStep("dl")
    } catch (error) {
      alert("Aadhar verification failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleDLUpload = async () => {
    if (!dlFile) {
      alert("Please upload your driving license")
      return
    }

    setLoading(true)
    try {
      // Simulate DL upload API call
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setStep("completed")
    } catch (error) {
      alert("Driving license upload failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setDlFile(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center text-gray-600 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Document Verification</h1>
          </div>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-8">
        {step === "aadhar" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Verify Aadhar</CardTitle>
              <p className="text-center text-gray-600">Enter your Aadhar number for verification</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Aadhar Number</label>
                <Input
                  type="text"
                  placeholder="Enter 12-digit Aadhar number"
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value.replace(/\D/g, "").slice(0, 12))}
                  className="text-center tracking-widest"
                />
              </div>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleAadharVerification}
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify Aadhar"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "dl" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Upload Driving License</CardTitle>
              <p className="text-center text-gray-600">Upload a clear photo of your driving license</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Driving License</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  {dlFile ? (
                    <div className="space-y-2">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto" />
                      <p className="text-sm font-medium">{dlFile.name}</p>
                      <p className="text-xs text-gray-500">File uploaded successfully</p>
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
              </div>

              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={handleDLUpload}
                disabled={loading || !dlFile}
              >
                {loading ? "Uploading..." : "Upload License"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === "completed" && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Verification Complete!</h2>
              <p className="text-gray-600 mb-6">
                Your documents have been verified successfully. You can now enjoy your ride!
              </p>
              <Button
                className="w-full bg-orange-600 hover:bg-orange-700"
                onClick={() => (window.location.href = "/bookings")}
              >
                View My Bookings
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
