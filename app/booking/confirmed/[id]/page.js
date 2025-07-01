"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Share,
  ArrowLeft,
  Download,
  Calendar,
  Clock,
  MapPin,
  User,
  CreditCard,
  Phone,
  Mail,
  AlertTriangle,
  Info,
  Copy,
  ExternalLink,
  Fuel,
  Shield,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";
import AadhaarVerificationModal from "@/components/aadhar-verification-modal";

// Utility functions for robust data handling
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "-";
  try {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeStr;
  }
};

const formatCurrency = (amount) => {
  if (typeof amount !== "number" || isNaN(amount)) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
};

const getBookingDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "-";
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? "1 day" : `${diffDays} days`;
  } catch {
    return "-";
  }
};

const copyToClipboard = (text) => {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
};

export default function BookingConfirmedPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params?.id) {
      loadBookingDetails();
      // Show verification modal after 3 seconds if booking is confirmed
      const timer = setTimeout(() => {
        if (booking?.bookingStatus === "confirmed") {
          setShowVerificationModal(true);
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [params?.id, booking?.bookingStatus]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await apiService.getBookingDetails(params.id);

      if (response?.success && response?.data) {
        setBooking(response.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to load booking details:", error);
      setError("Failed to load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBookingId = () => {
    if (booking?._id) {
      copyToClipboard(booking._id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: "My Bike Booking Confirmed",
      text: `I just booked a ${
        bike?.title || "bike"
      } for my trip! Booking ID: ${booking?._id}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy to clipboard
        copyToClipboard(`${shareData.text} - ${shareData.url}`);
        alert("Booking details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownloadReceipt = () => {
    // This would typically generate and download a PDF receipt
    // For now, we'll just show an alert
    alert("Receipt download feature will be available soon!");
  };

  // Defensive data extraction
  const bike = booking?.bike || {};
  const bikeDetails = booking?.bikeDetails || {};
  const priceDetails = booking?.priceDetails || {};
  const user = booking?.user || {};
  const images = bike?.images || [];
  const bikeImage = images[0] || "/placeholder.svg?height=200&width=300";
  const bikeTitle = bike?.title || "Bike";
  const bikeBrand = bike?.brand || "";
  const bikeModel = bike?.model || "";
  const kmLimit = bikeDetails?.isUnlimited
    ? "Unlimited"
    : bikeDetails?.kmLimit
    ? `${bikeDetails.kmLimit} km`
    : "-";
  const additionalKmPrice = bikeDetails?.additionalKmPrice || 0;
  const additionalCharges = bikeDetails?.additionalCharges?.amount || 0;
  const bookingDuration = getBookingDuration(
    booking?.startDate,
    booking?.endDate
  );
  const isPaymentCompleted = booking?.paymentStatus === "completed";
  const isBookingConfirmed = booking?.bookingStatus === "confirmed";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || "Unable to load booking details. Please try again."}
              </p>
              <div className="space-y-3">
                <Button
                  className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bookings">View My Bookings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/"
              className="flex items-center mr-4 hover:text-green-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Home</span>
            </Link>
            <h1 className="text-xl font-semibold">Booking Confirmed</h1>
            <div className="ml-auto flex items-center space-x-2">
              {isPaymentCompleted && (
                <Badge className="bg-white text-green-600 hover:bg-gray-100">
                  Payment Completed
                </Badge>
              )}
              {isBookingConfirmed && (
                <Badge className="bg-white text-green-600 hover:bg-gray-100">
                  Confirmed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Success Banner */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600 text-lg">
            Your booking has been confirmed successfully. Get ready for your
            ride!
          </p>
        </div>

        {/* Main Booking Card */}
        <Card className="mb-6 shadow-xl border-2 border-green-200">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl text-green-800">
                Booking Details
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReceipt}
                  className="text-green-600 border-green-300 hover:bg-green-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Receipt
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {/* Booking ID */}
            <div className="text-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Booking ID</div>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-lg font-semibold">
                  {booking._id}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyBookingId}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              {copied && (
                <div className="text-xs text-green-600 mt-1">Copied!</div>
              )}
              {booking.paymentId && (
                <div className="text-xs text-gray-500 mt-2">
                  Payment ID: {booking.paymentId}
                </div>
              )}
            </div>

            {/* Bike Details */}
            <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 mb-6">
              <div className="flex-shrink-0">
                <Image
                  src={bikeImage}
                  alt={bikeTitle}
                  width={200}
                  height={150}
                  className="rounded-lg object-cover shadow-md"
                  onError={(e) => {
                    e.target.src = "/placeholder.svg?height=150&width=200";
                  }}
                />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">{bikeTitle}</h3>
                {(bikeBrand || bikeModel) && (
                  <p className="text-gray-600 mb-4">
                    {bikeBrand} {bikeModel}
                  </p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-center md:justify-start">
                      <Calendar className="w-4 h-4 mr-2 text-green-600" />
                      <div>
                        <span className="text-gray-600">Pickup:</span>
                        <div className="font-medium">
                          {formatDate(booking.startDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(booking.startTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center md:justify-start">
                      <Calendar className="w-4 h-4 mr-2 text-red-600" />
                      <div>
                        <span className="text-gray-600">Dropoff:</span>
                        <div className="font-medium">
                          {formatDate(booking.endDate)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatTime(booking.endTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6" />

            {/* Booking Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg mb-3">Trip Details</h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{bookingDuration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KM Limit:</span>
                    <span className="font-medium">{kmLimit}</span>
                  </div>
                  {additionalKmPrice > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra KM Rate:</span>
                      <span className="font-medium">
                        {formatCurrency(additionalKmPrice)}/km
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Status:</span>
                    <Badge
                      variant="secondary"
                      className={
                        isBookingConfirmed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {booking.bookingStatus || "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-lg mb-3">Payment Summary</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(priceDetails.basePrice)}
                    </span>
                  </div>
                  {priceDetails.taxes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees:</span>
                      <span className="font-medium">
                        {formatCurrency(priceDetails.taxes)}
                      </span>
                    </div>
                  )}
                  {priceDetails.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(priceDetails.discount)}
                      </span>
                    </div>
                  )}
                  {additionalCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Charges:</span>
                      <span className="font-medium">
                        {formatCurrency(additionalCharges)}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Paid:</span>
                    <span className="text-green-600">
                      {formatCurrency(priceDetails.totalAmount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            {(user?.name || user?.email || user?.mobile) && (
              <>
                <Separator className="my-6" />
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <User className="w-5 h-5 mr-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">
                      Customer Details
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    {user.name && (
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <div className="font-medium">{user.name}</div>
                      </div>
                    )}
                    {user.email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <div className="font-medium">{user.email}</div>
                      </div>
                    )}
                    {user.mobile && (
                      <div>
                        <span className="text-gray-600">Mobile:</span>
                        <div className="font-medium">{user.mobile}</div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Booking Timeline */}
            <Separator className="my-6" />
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-gray-600" />
                Booking Timeline
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Created:</span>
                  <span className="font-medium">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {formatDateTime(booking.updatedAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Instructions */}
        <Card className="mb-6 border-orange-200">
          <CardHeader className="bg-orange-50">
            <CardTitle className="flex items-center text-orange-800">
              <Info className="w-5 h-5 mr-2" />
              Important Instructions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-3 text-orange-800">
                  Before Pickup:
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Carry original driving license and ID proof</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Complete Aadhaar verification if prompted</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Arrive 15 minutes before pickup time</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="font-semibold mb-3 text-orange-800">
                  During Trip:
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Fuel charges are not included</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Extra charges apply for exceeding KM limit</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Return on time to avoid late fees</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 text-lg font-semibold"
            asChild
          >
            <Link href="/bookings">
              <ExternalLink className="w-5 h-5 mr-2" />
              View All Bookings
            </Link>
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button variant="outline" className="h-12" asChild>
              <Link href="/">Go to Home</Link>
            </Button>
            <Button variant="outline" className="h-12" asChild>
              <Link href="/bikes">Book Another Bike</Link>
            </Button>
          </div>
        </div>

        {/* Support Section */}
        <Card className="mt-6 border-blue-200">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2">Need Help?</h4>
            <p className="text-sm text-gray-600 mb-4">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" asChild>
                <a href="tel:+919008022800" className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  Call +91 90080-22800
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="mailto:support@happygobike.com"
                  className="flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Email Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Aadhaar Verification Modal */}
      {showVerificationModal && (
        <AadhaarVerificationModal
          isOpen={showVerificationModal}
          onClose={() => setShowVerificationModal(false)}
          bookingId={booking._id}
        />
      )}

      <Footer />
    </div>
  );
}
