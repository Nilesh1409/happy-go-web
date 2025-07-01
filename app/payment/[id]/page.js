"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

export default function PaymentPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  useEffect(() => {
    if (params?.id) {
      loadBookingDetails();
      loadRazorpayScript();
    }
  }, [params?.id]);

  const loadRazorpayScript = () => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => console.log("Razorpay script loaded");
      script.onerror = () => setError("Failed to load payment gateway");
      document.body.appendChild(script);
    }
  };

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

  const handlePayment = async () => {
    if (!booking || !window.Razorpay) {
      setError("Payment gateway not available. Please refresh and try again.");
      return;
    }

    setPaymentLoading(true);
    setError("");

    try {
      // Create payment order
      const orderResponse = await apiService.createBookingPayment(booking._id);

      if (!orderResponse?.data) {
        throw new Error("Failed to create payment order");
      }

      const { id: orderId, amount, currency } = orderResponse.data;
      const userData = JSON.parse(localStorage.getItem("user") || "{}");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency || "INR",
        name: "Happy Go Bike Rentals",
        description: `Payment for ${bike?.title || "Bike Rental"}`,
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
            setError("Payment verification failed. Please contact support.");
            setPaymentLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setError(
        error?.message || "Payment initiation failed. Please try again."
      );
      setPaymentLoading(false);
    }
  };

  // Defensive data extraction
  const bike = booking?.bike || {};
  const bikeDetails = booking?.bikeDetails || {};
  const priceDetails = booking?.priceDetails || {};
  const user = booking?.user || {};
  const images = bike?.images || [];
  const bikeImage = images[0] || "/placeholder.svg?height=120&width=180";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#F47B20] mx-auto mb-4" />
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
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
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
      <div className="bg-[#F47B20] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/"
              className="flex items-center mr-4 hover:text-yellow-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span>Back</span>
            </Link>
            <h1 className="text-xl font-semibold">Complete Payment</h1>
            {isPaymentCompleted && (
              <Badge className="ml-auto bg-green-500 hover:bg-green-600">
                Payment Completed
              </Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Security Banner */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <Shield className="w-5 h-5 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Secure Payment Gateway
              </p>
              <p className="text-xs text-green-700">
                Your payment information is encrypted and secure with 256-bit
                SSL
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Details Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CreditCard className="w-5 h-5 mr-2 text-[#F47B20]" />
                  Booking Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4 mb-6">
                  <div className="relative">
                    <Image
                      src={bikeImage}
                      alt={bikeTitle}
                      width={120}
                      height={80}
                      className="rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder.svg?height=80&width=120";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{bikeTitle}</h3>
                    {(bikeBrand || bikeModel) && (
                      <p className="text-sm text-gray-600 mb-3">
                        {bikeBrand} {bikeModel}
                      </p>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <div>
                            <span className="text-gray-600">Pickup:</span>
                            <div className="font-medium">
                              {formatDate(booking.startDate)} at{" "}
                              {formatTime(booking.startTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                          <div>
                            <span className="text-gray-600">Dropoff:</span>
                            <div className="font-medium">
                              {formatDate(booking.endDate)} at{" "}
                              {formatTime(booking.endTime)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">Duration:</span>
                      <span className="font-medium">{bookingDuration}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">KM Limit:</span>
                      <span className="font-medium">{kmLimit}</span>
                    </div>
                  </div>

                  {additionalKmPrice > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm">
                        Extra KM Rate:
                      </span>
                      <span className="font-medium">
                        {formatCurrency(additionalKmPrice)}/km
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 text-sm">
                      Payment Status:
                    </span>
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

                {/* User Details */}
                {(user?.name || user?.email || user?.mobile) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center mb-2">
                      <User className="w-4 h-4 mr-2 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Booking Details
                      </span>
                    </div>
                    <div className="text-xs text-blue-700 space-y-1">
                      {user.name && <div>Name: {user.name}</div>}
                      {user.email && <div>Email: {user.email}</div>}
                      {user.mobile && <div>Mobile: {user.mobile}</div>}
                      <div>Booking ID: {booking._id}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Methods Card */}
            {!isPaymentCompleted && (
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Payment Method</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                        paymentMethod === "razorpay"
                          ? "border-[#F47B20] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setPaymentMethod("razorpay")}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-8 bg-blue-600 rounded flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              PAY
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">Razorpay</div>
                            <div className="text-sm text-gray-600">
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

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Shield className="w-4 h-4" />
                      <span>
                        Payments are processed securely by Razorpay with 256-bit
                        SSL encryption
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Important Instructions */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Info className="w-5 h-5 mr-2 text-blue-600" />
                  Important Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Please carry your original driving license and ID proof
                      for verification.
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Fuel charges are not included in the booking amount.
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Additional charges will apply if you exceed the KM limit
                      or return late.
                    </span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-[#F47B20] rounded-full mt-2 mr-3 flex-shrink-0"></div>
                    <span>
                      Security deposit may be required at the time of pickup.
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary */}
          <div className="space-y-6">
            {/* Price Breakdown Card */}
            <Card className="shadow-xl border-2 border-[#F47B20]">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-[#F47B20]">
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Amount</span>
                    <span className="font-medium">
                      {formatCurrency(priceDetails.basePrice)}
                    </span>
                  </div>

                  {priceDetails.taxes > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Taxes & Fees</span>
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
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-[#F47B20]">
                      {formatCurrency(priceDetails.totalAmount)}
                    </span>
                  </div>
                </div>

                {!isPaymentCompleted && (
                  <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center text-sm text-blue-800">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Complete payment within 15 minutes</span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {error}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full mt-6 bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handlePayment}
                  disabled={paymentLoading || isPaymentCompleted}
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
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Our support team is available 24/7
                </p>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href="tel:+919008022800">Call +91 90080-22800</a>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href="mailto:support@happygobike.com">Email Support</a>
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
