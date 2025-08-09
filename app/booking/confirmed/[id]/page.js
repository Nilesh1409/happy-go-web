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
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";
import AadhaarVerificationModal from "@/components/aadhar-verification-modal";
import { toast } from "@/lib/toast";

// Utility functions for robust data handling
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
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
    if (!hours || !minutes) return timeStr;
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    if (isNaN(date.getTime())) return timeStr;
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
    if (isNaN(date.getTime())) return "-";
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
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";
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
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

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
        toast.success("Copied!", "Booking details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDownloadReceipt = () => {
    // This would typically generate and download a PDF receipt
    // For now, we'll show a toast notification
    toast.info(
      "Coming Soon",
      "Receipt download feature will be available soon!"
    );
  };

  // Update the data extraction section:
  const bikeItems = booking?.bikeItems || [];
  const bikeItemsWithDetails = booking?.bikeItemsWithDetails || [];
  const bikeDetails = booking?.bikeDetails || {};
  const priceDetails = booking?.priceDetails || {};
  const user = booking?.user || {};
  const helmetDetails = booking?.helmetDetails || {};

  // Multi-bike booking data
  const isMultiBike = bikeItems.length > 0;
  const totalBikes =
    booking?.totalBikes ||
    bikeItems.reduce((sum, item) => sum + item.quantity, 0);
  const bikeTypes = booking?.bikeTypes || 1;

  // For backward compatibility with single bike bookings
  const bike = booking?.bike || {};
  const primaryBike =
    isMultiBike && bikeItemsWithDetails.length > 0
      ? bikeItemsWithDetails[0].bike
      : bike;

  // Use real bike image from the API response
  const bikeImage = primaryBike?.images?.[0] || "/assets/happygo.jpeg";
  const bikeTitle = isMultiBike
    ? `${totalBikes} Bike${totalBikes > 1 ? "s" : ""} Booking (${bikeTypes} ${
        bikeTypes > 1 ? "types" : "type"
      })`
    : bike?.title || "Bike Booking";

  // Add these missing variables:
  const additionalKmPrice = bikeDetails?.additionalKmPrice || 0;
  const additionalCharges = bikeDetails?.additionalCharges?.amount || 0;
  const bookingDuration = getBookingDuration(
    booking?.startDate,
    booking?.endDate
  );
  const bikeBrand = primaryBike?.brand || "";
  const bikeModel = primaryBike?.model || "";
  const kmLimit = bikeDetails?.isUnlimited
    ? "Unlimited"
    : bikeDetails?.kmLimit
    ? `${bikeDetails.kmLimit} km`
    : "-";

  const isPaymentCompleted = booking?.paymentStatus === "completed";
  const isBookingConfirmed = booking?.bookingStatus === "confirmed";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm sm:text-base">
              Loading booking details...
            </p>
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
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:max-w-4xl lg:mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4">
                Booking Not Found
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {error || "Unable to load booking details. Please try again."}
              </p>
              <div className="space-y-3 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
                <Button
                  className="bg-[#F47B20] hover:bg-[#E06A0F] text-white w-full sm:w-auto"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" asChild>
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

      {/* Mobile-First Header */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 text-white">
        <div className="px-4 sm:px-6 lg:px-8 lg:max-w-4xl lg:mx-auto">
          <div className="flex items-center h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center mr-3 sm:mr-4 hover:text-green-200 transition-colors p-1"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Home</span>
            </Link>
            {/* <h1 className="text-lg sm:text-xl font-semibold flex-1">Booking Confirmed</h1> */}
            <div className="flex items-center space-x-1 sm:space-x-2">
              {isPaymentCompleted && (
                <Badge className="bg-white text-green-600 hover:bg-gray-100 text-xs">
                  Paid
                </Badge>
              )}
              {isBookingConfirmed && (
                <Badge className="bg-white text-green-600 hover:bg-gray-100 text-xs">
                  Confirmed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:max-w-4xl lg:mx-auto">
        {/* Success Banner - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse">
            <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
            🎉 Booking Confirmed!
          </h2>
          <p className="text-gray-600 text-base sm:text-lg px-4">
            Your booking has been confirmed successfully. Get ready for your
            ride!
          </p>
        </div>

        {/* Main Booking Card - Mobile First */}
        <Card className="mb-4 sm:mb-6 shadow-xl border-2 border-green-200">
          <CardHeader className="bg-green-50 pb-3 sm:pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
              <CardTitle className="text-lg sm:text-xl text-green-800 text-center sm:text-left">
                Booking Details
              </CardTitle>
              <div className="flex items-center justify-center sm:justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleShare}
                  className="text-green-600 border-green-300 hover:bg-green-50 text-xs sm:text-sm"
                >
                  <Share className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Share
                </Button>
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadReceipt}
                  className="text-green-600 border-green-300 hover:bg-green-50 text-xs sm:text-sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Receipt
                </Button> */}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Booking ID - Mobile Optimized */}
            <div className="text-center mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <div className="text-xs sm:text-sm text-gray-600 mb-2">
                Booking ID
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="font-mono text-sm sm:text-lg font-semibold break-all">
                  {booking._id}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyBookingId}
                  className="h-6 w-6 p-0 flex-shrink-0"
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              {copied && (
                <div className="text-xs text-green-600 mt-1">Copied!</div>
              )}
              {booking.paymentId && (
                <div className="text-xs text-gray-500 mt-2 break-all">
                  Payment ID: {booking.paymentId}
                </div>
              )}
            </div>

            {/* Bike Details - Multi-bike Support */}
            <div className="flex flex-col items-center space-y-4 mb-6">
              {!isMultiBike && (
                <div className="w-full max-w-xs sm:max-w-sm">
                  <Image
                    src={bikeImage}
                    alt={bikeTitle}
                    width={300}
                    height={200}
                    className="rounded-lg object-cover shadow-md w-full h-auto"
                    onError={(e) => {
                      e.target.src = "/assets/happygo.jpeg";
                    }}
                  />
                </div>
              )}

              <div className="text-center w-full">
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {bikeTitle}
                </h3>

                {isMultiBike ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="text-sm sm:text-base font-semibold text-blue-800 mb-3">
                      Booked Bikes:
                    </h4>
                    <div className="space-y-3">
                      {bikeItemsWithDetails.map((item, index) => (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mx-auto sm:mx-0">
                              <Image
                                src={
                                  item.bike.images?.[0] ||
                                  "/assets/happygo.jpeg"
                                }
                                alt={item.bike.title}
                                width={96}
                                height={96}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = "/assets/happygo.jpeg";
                                }}
                              />
                            </div>
                            <div className="flex-1 text-center sm:text-left">
                              <h5 className="font-semibold text-sm sm:text-base">
                                {item.bike.title}
                              </h5>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {item.bike.brand} {item.bike.model} (
                                {item.bike.year})
                              </p>
                              <div className="flex flex-col sm:flex-row sm:justify-between mt-2 text-xs sm:text-sm">
                                <span className="text-blue-600 font-medium">
                                  {item.quantity} unit
                                  {item.quantity > 1 ? "s" : ""} •{" "}
                                  {item.kmOption} ({item.kmLimit}km)
                                </span>
                                <span className="font-semibold">
                                  ₹{item.pricePerUnit} x {item.quantity} = ₹
                                  {item.totalPrice?.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  (primaryBike?.brand || primaryBike?.model) && (
                    <p className="text-gray-600 mb-4 text-sm sm:text-base">
                      {primaryBike.brand} {primaryBike.model}
                    </p>
                  )
                )}

                {/* Date/Time Info - Mobile Stacked */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-4">
                  <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-green-600 mb-2" />
                    <span className="text-gray-600 text-xs">Pickup</span>
                    <div className="font-medium text-center">
                      {formatDate(booking.startDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(booking.startTime)}
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                    <Calendar className="w-4 h-4 text-red-600 mb-2" />
                    <span className="text-gray-600 text-xs">Dropoff</span>
                    <div className="font-medium text-center">
                      {formatDate(booking.endDate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTime(booking.endTime)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4 sm:my-6" />

            {/* Trip Details - Enhanced for Multi-bike */}
            <div className="mb-4 sm:mb-6">
              <h4 className="font-semibold text-base sm:text-lg mb-3 text-center sm:text-left">
                Trip Details
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-xs mb-1">Duration</span>
                  <span className="font-medium">{bookingDuration}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-xs mb-1">
                    Total Bikes
                  </span>
                  <span className="font-medium">{totalBikes}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-xs mb-1">Bike Types</span>
                  <span className="font-medium">{bikeTypes}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600 text-xs mb-1">Status</span>
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

              {/* Bulk Discount Highlight */}
              {priceDetails.bulkDiscount?.amount > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center mb-2 sm:mb-0">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-semibold text-green-800">
                        Bulk Booking Discount (
                        {priceDetails.bulkDiscount.percentage}%)
                      </span>
                    </div>
                    <span className="text-lg font-bold text-green-600">
                      -₹{priceDetails.bulkDiscount.amount}
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    You saved ₹{priceDetails.bulkDiscount.amount} by booking
                    multiple bikes!
                  </p>
                </div>
              )}
            </div>

            {/* Payment Summary - Enhanced */}
            <div className="mb-4 sm:mb-6">
              <button
                onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg mb-3 sm:hidden"
              >
                <h4 className="font-semibold text-base text-green-800">
                  Payment Summary
                </h4>
                {showPaymentDetails ? (
                  <ChevronUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-green-600" />
                )}
              </button>

              {/* Desktop: Always show, Mobile: Collapsible */}
              <div
                className={`${
                  showPaymentDetails ? "block" : "hidden"
                } sm:block`}
              >
                <h4 className="hidden sm:block font-semibold text-lg mb-3">
                  Payment Summary
                </h4>
                <div className="space-y-2 sm:space-y-3 text-sm">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-medium">
                      {formatCurrency(priceDetails.basePrice)}
                    </span>
                  </div>

                  {priceDetails.bulkDiscount?.amount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-green-600">
                        Bulk Discount ({priceDetails.bulkDiscount.percentage}%):
                      </span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(priceDetails.bulkDiscount.amount)}
                      </span>
                    </div>
                  )}

                  {priceDetails.taxes > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">
                        Taxes & Fees ({priceDetails.gstPercentage}%):
                      </span>
                      <span className="font-medium">
                        {formatCurrency(priceDetails.taxes)}
                      </span>
                    </div>
                  )}

                  {priceDetails.discount > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(priceDetails.discount)}
                      </span>
                    </div>
                  )}

                  {helmetDetails?.charges > 0 && (
                    <div className="flex justify-between items-center py-1">
                      <span className="text-gray-600">Helmet Charges:</span>
                      <span className="font-medium">
                        {formatCurrency(helmetDetails.charges)}
                      </span>
                    </div>
                  )}

                  <Separator />
                  <div className="flex justify-between items-center text-base sm:text-lg font-bold py-1">
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
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center mb-3">
                  <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  <h4 className="font-semibold text-blue-800 text-sm sm:text-base">
                    Customer Details
                  </h4>
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs sm:text-sm">
                  {user.name && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  )}
                  {user.email && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium break-all">
                        {user.email}
                      </span>
                    </div>
                  )}
                  {user.mobile && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mobile:</span>
                      <span className="font-medium">{user.mobile}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Booking Timeline */}
            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-3 flex items-center text-sm sm:text-base">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-600" />
                Booking Timeline
              </h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Booking Created:</span>
                  <span className="font-medium text-right">
                    {formatDateTime(booking.createdAt)}
                  </span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium text-right">
                    {formatDateTime(booking.updatedAt)}
                  </span>
                </div> */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Instructions - Collapsible on Mobile */}
        <Card className="mb-4 sm:mb-6 border-orange-200">
          <CardHeader className="bg-orange-50 pb-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between sm:pointer-events-none"
            >
              <CardTitle className="flex items-center text-orange-800 text-base sm:text-lg">
                <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Important Instructions
              </CardTitle>
              <div className="sm:hidden">
                {showInstructions ? (
                  <ChevronUp className="w-4 h-4 text-orange-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-orange-600" />
                )}
              </div>
            </button>
          </CardHeader>
          <CardContent
            className={`${
              showInstructions ? "block" : "hidden"
            } sm:block p-4 sm:p-6`}
          >
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h5 className="font-semibold mb-3 text-orange-800 text-sm sm:text-base">
                  Before Pickup:
                </h5>
                <div className="space-y-2 text-xs sm:text-sm">
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
                <h5 className="font-semibold mb-3 text-orange-800 text-sm sm:text-base">
                  During Trip:
                </h5>
                <div className="space-y-2 text-xs sm:text-sm">
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

        {/* Action Buttons - Mobile Optimized */}
        <div className="space-y-3">
          <Button
            className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 sm:h-14 text-base sm:text-lg font-semibold"
            asChild
          >
            <Link href="/bookings">
              <ExternalLink className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              View All Bookings
            </Link>
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-12 text-sm sm:text-base"
              asChild
            >
              <Link href="/">Go to Home</Link>
            </Button>
            <Button
              variant="outline"
              className="h-12 text-sm sm:text-base"
              asChild
            >
              <Link href="/">Book Another Bike</Link>
            </Button>
          </div>
        </div>

        {/* Support Section - Mobile Optimized */}
        <Card className="mt-6 border-blue-200">
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold mb-2 text-sm sm:text-base">
              Need Help?
            </h4>
            <p className="text-xs sm:text-sm text-gray-600 mb-4">
              Our support team is available 24/7 to assist you
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <a
                  href="tel:+919008022800"
                  className="flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call +91 90080-22800
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
                asChild
              >
                <a
                  href="mailto:support@happygobike.com"
                  className="flex items-center justify-center"
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
