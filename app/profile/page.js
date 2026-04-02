"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Shield,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  FileText,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { apiService } from "@/lib/api";
import AadhaarVerificationModal from "@/components/aadhar-verification-modal";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingDL, setUploadingDL] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showAadhaarModal, setShowAadhaarModal] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profileImage: "",
  });
  const [dlFile, setDlFile] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUserProfile();
      setUser(response.data);
      setFormData({
        name: response.data.name || "",
        email: response.data.email || "",
        profileImage: response.data.profileImage || "",
      });
    } catch (error) {
      setError("Failed to load profile. Please try again.");
      console.error("Profile fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    try {
      setUpdating(true);
      setError("");
      setSuccess("");

      const response = await apiService.updateProfile(formData);
      setUser(response.data);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      setError(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleDLUpload = async () => {
    if (!dlFile) {
      setError("Please select a driving license image");
      return;
    }

    try {
      setUploadingDL(true);
      setError("");
      setSuccess("");

      const response = await apiService.uploadDLImage(dlFile);
      setSuccess(response?.message || "Driving license updated successfully!");
      setDlFile(null);

      // Refresh profile to get updated DL info
      await fetchUserProfile();
    } catch (error) {
      setError(error.message || "Failed to upload driving license");
    } finally {
      setUploadingDL(false);
    }
  };

  const handleFileChange = (e) => {
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

  const handleAadhaarVerificationComplete = () => {
    setShowAadhaarModal(false);
    setSuccess("Aadhaar verification completed successfully!");
    fetchUserProfile(); // Refresh profile data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#F47B20]" />
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">
            Manage your account information and verification status
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 mr-2" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2 text-[#F47B20]" />
                  Profile Information
                </CardTitle>
                {!isEditing ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || "",
                          email: user?.email || "",
                          profileImage: user?.profileImage || "",
                        });
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleUpdateProfile}
                      disabled={updating}
                    >
                      {updating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Save className="w-4 h-4 mr-2" />
                      )}
                      Save
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <Input
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {user?.name || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="Enter your email"
                      />
                    ) : (
                      <div className="flex items-center">
                        <p className="text-gray-900 font-medium mr-2">
                          {user?.email || "Not provided"}
                        </p>
                        {user?.isEmailVerified && (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <div className="flex items-center">
                    <p className="text-gray-900 font-medium mr-2">
                      {user?.mobile}
                    </p>
                    {user?.isMobileVerified && (
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referral Code
                  </label>
                  <div className="flex items-center">
                    <code className="bg-gray-100 px-3 py-2 rounded font-mono text-sm">
                      {user?.referralCode}
                    </code>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Verification Status */}
          <div className="space-y-6">
            {/* Account Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-[#F47B20]" />
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Email</span>
                  {user?.isEmailVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Mobile</span>
                  {user?.isMobileVerified ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Aadhaar</span>
                  {user?.aadhaar?.maskedNumber ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Verified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Driving License</span>
                  {user?.dlImageKey ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge
                      variant="secondary"
                      className="bg-red-100 text-red-800"
                    >
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Not Uploaded
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Aadhaar Verification */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-blue-600" />
                  Aadhaar Verification
                </CardTitle>
              </CardHeader>
              <CardContent>
                {user?.aadhaar?.maskedNumber ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Verified</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Aadhaar: {user.aadhaar.maskedNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Name: {user.aadhaar.name}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Verify your Aadhaar to complete your profile and enable
                      bookings.
                    </p>
                    <Button
                      onClick={() => setShowAadhaarModal(true)}
                      className="w-full"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      Verify Aadhaar
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Driving License Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-600" />
                  Driving License
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Hidden file input always present so both branches can trigger it */}
                <input
                  id="dl-upload"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {user?.dlImageKey ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-green-600">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      <span className="font-medium">Uploaded</span>
                    </div>
                    {user.dlImageUrl && !dlFile && (
                      <div className="mt-3">
                        <img
                          src={user.dlImageUrl || "/placeholder.svg"}
                          alt="Driving License"
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    {dlFile ? (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          Selected: {dlFile.name}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            onClick={handleDLUpload}
                            disabled={uploadingDL}
                            className="flex-1"
                          >
                            {uploadingDL ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            {uploadingDL ? "Uploading..." : "Confirm Update"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDlFile(null)}
                            disabled={uploadingDL}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          document.getElementById("dl-upload").click()
                        }
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Update License
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      Upload your driving license image for verification.
                    </p>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        onClick={() =>
                          document.getElementById("dl-upload").click()
                        }
                        className="w-full"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Choose File
                      </Button>

                      {dlFile && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600">
                            Selected: {dlFile.name}
                          </p>
                          <Button
                            onClick={handleDLUpload}
                            disabled={uploadingDL}
                            className="w-full"
                          >
                            {uploadingDL ? (
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                              <Upload className="w-4 h-4 mr-2" />
                            )}
                            Upload License
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Aadhaar Verification Modal */}
      {showAadhaarModal && (
        <AadhaarVerificationModal
          isOpen={showAadhaarModal}
          onClose={() => setShowAadhaarModal(false)}
          onVerificationComplete={handleAadhaarVerificationComplete}
        />
      )}

      <Footer />
    </div>
  );
}
