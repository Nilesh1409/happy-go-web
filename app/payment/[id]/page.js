"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Shield,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  User,
  Calendar,
  MapPin,
  Fuel,
  Info,
  Phone,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

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

const getBookingDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return "-";
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return "-";
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 1 ? "1 day" : `${diffDays} days`;
  } catch {
    return "-";
  }
};

const validateBookingData = (booking) => {
  if (!booking || typeof booking !== "object") return false;
  return booking._id && booking.priceDetails && typeof booking.priceDetails.totalAmount === "number";
};

export default function PaymentPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isOnline, setIsOnline] = useState(true);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (params?.id) {
      loadBookingDetails();
      loadRazorpayScript();
    } else {
      setError("Invalid booking ID");
      setLoading(false);
    }
  }, [params?.id]);

  const loadRazorpayScript = () => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded");
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
        setError("Payment gateway unavailable. Please check your internet connection and try again.");
      };
      document.body.appendChild(script);
    }
  };

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      if (!isOnline) {
        throw new Error("No internet connection. Please check your network and try again.");
      }

      const response = await apiService.getBookingDetails(params.id);

      if (response?.success && response?.data && validateBookingData(response.data)) {
        setBooking(response.data);
        setRetryCount(0);
      } else {
        throw new Error("Invalid booking data received");
      }
    } catch (error) {
      console.error("Failed to load booking details:", error);
      const errorMessage = error?.message || "Failed to load booking details";
      
      if (error?.status === 404) {
        setError("Booking not found. Please check your booking ID.");
      } else if (error?.status === 401) {
        setError("Session expired. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } else if (!isOnline) {
        setError("No internet connection. Please check your network and try again.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      loadBookingDetails();
    } else {
      setError("Maximum retry attempts reached. Please refresh the page or contact support.");
    }
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      setError("Please accept the terms and conditions to proceed with payment.");
      return;
    }

    if (!booking || !window.Razorpay) {
      setError("Payment gateway not available. Please refresh and try again.");
      return;
    }

    if (!isOnline) {
      setError("No internet connection. Please check your network and try again.");
      return;
    }

    setPaymentLoading(true);
    setError("");

    try {
      // Validate booking before payment
      if (!validateBookingData(booking)) {
        throw new Error("Invalid booking data. Please refresh and try again.");
      }

      // Create payment order
      const orderResponse = await apiService.createBookingPayment(booking._id);

      if (!orderResponse?.data?.id) {
        throw new Error("Failed to create payment order");
      }

      const { id: orderId, amount, currency } = orderResponse.data;
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      // Validate Razorpay key
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("Payment configuration error. Please contact support.");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency || "INR",
        name: "Happy Go Bike Rentals",
        description: `Payment for ${bikeTitle}`,
        order_id: orderId,
        prefill: {
          name: user?.name || userData?.name || "",
          email: user?.email || userData?.email || "",
          contact: user?.mobile || userData?.mobile || "",
        },
        theme: {
          color: "#F47B20",
        },
        handler: async (response) => {
          try {
            await apiService.verifyBookingPayment(booking._id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            window.location.href = `/booking/confirmed/${booking._id}`;
          } catch (error) {
            console.error("Payment verification failed:", error);
            setError("Payment verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id);
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
          escape: false,
          confirm_close: true,
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
        timeout: 300, // 5 minutes
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description || 'Unknown error'}`);
        setPaymentLoading(false);
      });
      
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      const errorMessage = error?.message || "Payment initiation failed. Please try again.";
      setError(errorMessage);
      setPaymentLoading(false);
    }
  };

  // Defensive data extraction with fallbacks for multi-bike bookings
  const bikeItems = booking?.bikeItems || [];
  const bikeDetails = booking?.bikeDetails || {};
  const priceDetails = booking?.priceDetails || {};
  const user = booking?.user || {};
  const helmetDetails = booking?.helmetDetails || {};
  
  // For single bike legacy support
  const bike = booking?.bike || {};
  
  // Multi-bike booking data
  const isMultiBike = bikeItems.length > 0;
  const totalBikes = isMultiBike ? bikeItems.reduce((sum, item) => sum + item.quantity, 0) : 1;
  
  // Default fallback image that exists
  const defaultBikeImage = "/assets/happygo.jpeg";
  
  // Get primary bike info (first bike or legacy bike)
  const primaryBike = isMultiBike ? bikeItems[0] : bike;
  const bikeImage = defaultBikeImage; // Use default since API doesn't return bike details
  const bikeTitle = isMultiBike 
    ? `${totalBikes} Bike${totalBikes > 1 ? 's' : ''} Booking` 
    : (bike?.title || "Bike Booking");
  const bikeBrand = bike?.brand || "";
  const bikeModel = bike?.model || "";
  
  const kmLimit = bikeDetails?.isUnlimited
    ? "Unlimited"
    : bikeDetails?.kmLimit
    ? `${bikeDetails.kmLimit} km`
    : isMultiBike && bikeItems[0]?.kmOption === "unlimited"
    ? "Unlimited"
    : isMultiBike && bikeItems[0]?.kmLimit
    ? `${bikeItems[0].kmLimit} km`
    : "-";
    
  const additionalKmPrice = bikeDetails?.additionalKmPrice || 0;
  const additionalCharges = bikeDetails?.additionalCharges?.amount || 0;
  const helmetQuantity = helmetDetails?.quantity || bikeDetails?.helmetQuantity || 0;
  const helmetCharges = priceDetails?.helmetCharges || helmetDetails?.charges || 0;
  const bookingDuration = getBookingDuration(
    booking?.startDate,
    booking?.endDate
  );
  const isPaymentCompleted = booking?.paymentStatus === "completed";

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20 px-4">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#F47B20] mx-auto mb-4" />
            <p className="text-gray-600 text-sm sm:text-base">Loading booking details...</p>
            {!isOnline && (
              <p className="text-red-600 text-sm mt-2">
                No internet connection detected
              </p>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:max-w-4xl lg:mx-auto">
          <Card>
            <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
              <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Booking Not Found</h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                {error || "Unable to load booking details. Please try again."}
              </p>
              <div className="space-y-3 flex flex-col sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
                {retryCount < 3 && (
                  <Button
                    className="bg-[#F47B20] hover:bg-[#E06A0F] text-white w-full sm:w-auto"
                    onClick={handleRetry}
                    disabled={!isOnline}
                  >
                    Retry ({3 - retryCount} attempts left)
                  </Button>
                )}
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/bookings">View My Bookings</Link>
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/">Go Home</Link>
                </Button>
              </div>
              {!isOnline && (
                <p className="text-red-600 text-sm mt-4">
                  Please check your internet connection and try again
                </p>
              )}
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
      <div className="bg-[#F47B20] text-white">
        <div className="px-4 sm:px-6 lg:px-8 lg:max-w-6xl lg:mx-auto">
          <div className="flex items-center h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center mr-3 sm:mr-4 hover:text-yellow-200 transition-colors p-1"
            >
              <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back</span>
            </Link>
            <h1 className="text-lg sm:text-xl font-semibold flex-1">Complete Payment</h1>
            {isPaymentCompleted && (
              <Badge className="bg-green-500 hover:bg-green-600 text-xs sm:text-sm">
                Paid
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Offline Banner */}
      {!isOnline && (
        <div className="bg-red-500 text-white px-4 py-2 text-center text-sm">
          <AlertCircle className="w-4 h-4 inline mr-2" />
          No internet connection. Please check your network.
        </div>
      )}

      <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:max-w-6xl lg:mx-auto">
        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 sm:mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Secure Payment Gateway
              </p>
              <p className="text-xs text-green-700 mt-1">
                Your payment information is encrypted and secure with 256-bit SSL
              </p>
            </div>
          </div>
        </div>

        {/* Mobile-First Layout */}
        <div className="space-y-6 lg:grid lg:grid-cols-3 lg:gap-8 lg:space-y-0">
          {/* Main Content - Mobile First */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Booking Details Card */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-[#F47B20]" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                {/* Booking Info - No Image, Fully Responsive */}
                <div className="w-full">
                  <div className="text-center sm:text-left">
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-gray-900">{bikeTitle}</h3>
                    {isMultiBike ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4">
                        <h4 className="text-sm sm:text-base font-semibold text-blue-800 mb-2">Multi-bike booking details:</h4>
                        <div className="space-y-1 sm:space-y-2">
                          {bikeItems.map((item, index) => (
                            <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs sm:text-sm text-blue-700 bg-white rounded p-2">
                              <span className="font-medium">
                                Bike {index + 1}: {item.quantity} unit{item.quantity > 1 ? 's' : ''} ({item.kmOption} - {item.kmLimit}km)
                              </span>
                              <span className="font-semibold mt-1 sm:mt-0">
                                ₹{item.pricePerUnit} x {item.quantity} = ₹{item.totalPrice?.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (bikeBrand || bikeModel) && (
                      <p className="text-sm sm:text-base text-gray-600 mb-3">
                        {bikeBrand} {bikeModel}
                      </p>
                    )}
                    
                    {/* Date/Time Info - Fully Responsive */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                        <div className="flex items-center justify-center sm:justify-start mb-2">
                          <Calendar className="w-4 h-4 text-orange-600 mr-2" />
                          <span className="text-sm font-semibold text-orange-800">Pickup</span>
                        </div>
                        <div className="text-center sm:text-left">
                          <div className="font-bold text-sm sm:text-base text-gray-900">
                            {formatDate(booking.startDate)}
                          </div>
                          <div className="font-medium text-sm text-orange-700">
                            {formatTime(booking.startTime)}
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center justify-center sm:justify-start mb-2">
                          <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                          <span className="text-sm font-semibold text-blue-800">Dropoff</span>
                        </div>
                        <div className="text-center sm:text-left">
                          <div className="font-bold text-sm sm:text-base text-gray-900">
                            {formatDate(booking.endDate)}
                          </div>
                          <div className="font-medium text-sm text-blue-700">
                            {formatTime(booking.endTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Details Grid */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-4">
                  {/* Basic Info - Responsive Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex justify-between items-center p-2 bg-white rounded text-sm">
                      <span className="text-gray-600 font-medium">Duration:</span>
                      <span className="font-semibold text-gray-900">{bookingDuration}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-white rounded text-sm">
                      <span className="text-gray-600 font-medium">Total Bikes:</span>
                      <span className="font-semibold text-gray-900">{totalBikes}</span>
                    </div>
                  </div>

                  {/* Bulk Discount Info */}
                  {priceDetails.bulkDiscount?.amount > 0 && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center mb-2 sm:mb-0">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-sm font-semibold text-green-800">
                            Bulk Booking Discount ({priceDetails.bulkDiscount.percentage}%)
                          </span>
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          -₹{priceDetails.bulkDiscount.amount}
                        </span>
                      </div>
                      <p className="text-xs text-green-700 mt-1">
                        You saved ₹{priceDetails.bulkDiscount.amount} by booking multiple bikes!
                      </p>
                    </div>
                  )}

                  {/* Helmet Information */}
                  {helmetQuantity > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <Shield className="w-4 h-4 mr-2 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Helmet Rental
                          </span>
                        </div>
                        <span className="text-sm font-medium text-blue-800">
                          {helmetQuantity} helmet{helmetQuantity !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        {helmetQuantity === 1 ? (
                          <div>1 helmet included FREE</div>
                        ) : (
                          <>
                            <div>1 helmet FREE + {helmetQuantity - 1} paid</div>
                            <div>
                              Additional helmet charges: {formatCurrency(helmetCharges)}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {additionalKmPrice > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Extra KM Rate:</span>
                      <span className="font-medium">
                        {formatCurrency(additionalKmPrice)}/km
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge
                      variant="secondary"
                      className={
                        isPaymentCompleted
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {isPaymentCompleted ? "Completed" : "Pending"}
                    </Badge>
                  </div>
                </div>

                {/* User Details - Responsive */}
                {(user?.name || user?.email || user?.mobile) && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <User className="w-5 h-5 mr-2 text-blue-600" />
                      <span className="text-base font-semibold text-blue-800">
                        Booking Information
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {user.name && (
                        <div className="bg-white rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name</span>
                          <div className="text-sm font-semibold text-gray-900 mt-1">{user.name}</div>
                        </div>
                      )}
                      {user.email && (
                        <div className="bg-white rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</span>
                          <div className="text-sm font-semibold text-gray-900 mt-1 break-all">{user.email}</div>
                        </div>
                      )}
                      {user.mobile && (
                        <div className="bg-white rounded-lg p-3">
                          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Mobile</span>
                          <div className="text-sm font-semibold text-gray-900 mt-1">{user.mobile}</div>
                        </div>
                      )}
                      <div className="bg-white rounded-lg p-3">
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Booking ID</span>
                        <div className="text-sm font-semibold text-gray-900 mt-1 break-all">{booking._id}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Card */}
            {!isPaymentCompleted && (
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className={`border-2 rounded-lg p-3 sm:p-4 cursor-pointer transition-colors ${
                        paymentMethod === "razorpay"
                          ? "border-[#F47B20] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("razorpay")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-6 sm:w-12 sm:h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">PAY</span>
                          </div>
                          <div>
                            <div className="font-medium text-sm sm:text-base">Razorpay</div>
                            <div className="text-xs sm:text-sm text-gray-600">
                              UPI, Cards, Wallets & More
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            paymentMethod === "razorpay"
                              ? "border-[#F47B20] bg-[#F47B20]"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentMethod === "razorpay" && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start space-x-2 text-xs sm:text-sm text-gray-600">
                      <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Payments are processed securely by Razorpay with 256-bit SSL encryption
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Important Instructions */}
            <Card className="shadow-lg border-0">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-base sm:text-lg">
                  <Info className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Please carry your original driving license and ID proof for verification.
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Fuel charges are not included in the booking amount.</span>
                  </div>
                  {helmetQuantity > 0 && (
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span>
                        Helmets will be provided at pickup. Please check helmet condition before accepting.
                      </span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Additional charges will apply if you exceed the KM limit or return late.
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>Security deposit may be required at the time of pickup.</span>
                  </div>
                  
                  {/* Additional Terms & Conditions */}
                  <div className="border-t border-gray-200 pt-3 mt-4">
                    <h6 className="font-semibold text-gray-800 mb-2 text-xs sm:text-sm">Terms & Conditions:</h6>
                    <div className="space-y-2">
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Travelling is restricted to only Chikmagalur surrounding areas.</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="font-medium">Amount will not be refunded if booking is cancelled.</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="font-medium">Late return INR 200 will be charged per scooty per hour.</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="font-medium">
                          Damage of scooty & helmet cost will be completely charged on you. All damages will be charged as per company exclusive showroom only.
                        </span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span className="font-medium">INR 1000 will be charged for loss of key.</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Duplicate key delivery will be extra chargeable.</span>
                      </div>
                      <div className="flex items-start">
                        <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                        <span>Inform 10 minutes prior to returning the scooty.</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                      <span className="text-green-600 font-medium text-sm">Have a safe ride. Thank you!</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Summary - Mobile Optimized */}
          <div className="space-y-4 sm:space-y-6">
            {/* Price Breakdown Card */}
            <Card className="shadow-xl border-2 border-[#F47B20] sticky top-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-[#F47B20] text-base sm:text-lg">
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Mobile: Collapsible Price Breakdown */}
                <div className="sm:hidden">
                  <button
                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                    className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-4"
                  >
                    <span className="text-sm font-medium">Price Breakdown</span>
                    {showPriceBreakdown ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                  
                  {showPriceBreakdown && (
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Amount</span>
                        <span className="font-medium">
                          {formatCurrency(priceDetails.basePrice)}
                        </span>
                      </div>

                      {priceDetails.extraCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Extra Charges</span>
                          <span className="font-medium">
                            {formatCurrency(priceDetails.extraCharges)}
                          </span>
                        </div>
                      )}

                      {priceDetails.bulkDiscount?.amount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-green-600">Bulk Discount ({priceDetails.bulkDiscount.percentage}%)</span>
                          <span className="font-medium text-green-600">
                            -{formatCurrency(priceDetails.bulkDiscount.amount)}
                          </span>
                        </div>
                      )}

                      {helmetCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-600">Helmet Charges</span>
                          <span className="font-medium text-blue-600">
                            {formatCurrency(helmetCharges)}
                          </span>
                        </div>
                      )}

                      {priceDetails.taxes > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">GST ({priceDetails?.gstPercentage || 0}%)</span>
                          <span className="font-medium">
                            {formatCurrency(priceDetails.taxes)}
                          </span>
                        </div>
                      )}

                      {priceDetails.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-green-600">
                            -{formatCurrency(priceDetails.discount)}
                          </span>
                        </div>
                      )}

                      {additionalCharges > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Additional Charges</span>
                          <span className="font-medium">
                            {formatCurrency(additionalCharges)}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Desktop: Always Show Price Breakdown */}
                <div className="hidden sm:block space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-medium">
                      {formatCurrency(priceDetails.basePrice)}
                    </span>
                  </div>

                  {priceDetails.extraCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Extra Charges</span>
                      <span className="font-medium">
                        {formatCurrency(priceDetails.extraCharges)}
                      </span>
                    </div>
                  )}

                  {priceDetails.bulkDiscount?.amount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-green-600">Bulk Discount ({priceDetails.bulkDiscount.percentage}%)</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(priceDetails.bulkDiscount.amount)}
                      </span>
                    </div>
                  )}

                  {helmetCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-blue-600">Helmet Charges</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(helmetCharges)}
                      </span>
                    </div>
                  )}

                  {priceDetails.taxes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">GST ({priceDetails?.gstPercentage || 0}%)</span>
                      <span className="font-medium">
                        {formatCurrency(priceDetails.taxes)}
                      </span>
                    </div>
                  )}

                  {priceDetails.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -{formatCurrency(priceDetails.discount)}
                      </span>
                    </div>
                  )}

                  {additionalCharges > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional Charges</span>
                      <span className="font-medium">
                        {formatCurrency(additionalCharges)}
                      </span>
                    </div>
                  )}

                  <Separator />
                </div>

                {/* Total Amount */}
                <div className="flex justify-between text-lg sm:text-xl font-bold py-2 border-t sm:border-t-0">
                  <span>Total Amount</span>
                  <span className="text-[#F47B20]">
                    {formatCurrency(priceDetails.totalAmount)}
                  </span>
                </div>

                {/* Helmet Summary */}
                {helmetQuantity > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <Shield className="w-4 h-4 mr-2 text-blue-600" />
                        <span className="text-blue-800 font-medium">Helmet Summary</span>
                      </div>
                    </div>
                    <div className="text-xs text-blue-700 mt-2 space-y-1">
                      <div>Total helmets: {helmetQuantity}</div>
                      <div>Free helmets: 1</div>
                      {helmetQuantity > 1 && (
                        <div>Paid helmets: {helmetQuantity - 1} × ₹60</div>
                      )}
                    </div>
                  </div>
                )}

                {!isPaymentCompleted && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Complete payment within 15 minutes</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-3 py-3 rounded-lg text-sm">
                    <div className="flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions Checkbox */}
                {!isPaymentCompleted && (
                  <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Checkbox
                        id="terms"
                        checked={acceptedTerms}
                        onCheckedChange={setAcceptedTerms}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-[#F47B20] hover:text-[#E06A0F] underline font-medium"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Terms and Conditions
                          </Link>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Button */}
                <Button
                  className="w-full mt-6 bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handlePayment}
                  disabled={paymentLoading || isPaymentCompleted || !isOnline || !acceptedTerms}
                >
                  {paymentLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </div>
                  ) : isPaymentCompleted ? (
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Payment Completed
                    </div>
                  ) : !isOnline ? (
                    "No Internet Connection"
                  ) : (
                    `Pay ${formatCurrency(priceDetails.totalAmount)}`
                  )}
                </Button>

                {isPaymentCompleted && (
                  <Button variant="outline" className="w-full mt-3" asChild>
                    <Link href={`/booking/confirmed/${booking._id}`}>
                      View Confirmation
                    </Link>
                  </Button>
                )}

                <div className="mt-4 text-center">
                  <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                    <Shield className="w-3 h-3" />
                    <span>Secured by Razorpay</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-4 sm:p-6 text-center">
                <h4 className="font-semibold mb-2 text-sm sm:text-base">Need Help?</h4>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  Our support team is available 24/7
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                    <a href="tel:+919008022800" className="flex items-center justify-center">
                      <Phone className="w-4 h-4 mr-2" />
                      Call +91 90080-22800
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" asChild>
                    <a href="mailto:support@happygobike.com" className="flex items-center justify-center">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Support
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}