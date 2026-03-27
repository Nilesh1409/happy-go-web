"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  
  const [booking, setBooking] = useState(null);
  const [cartPaymentData, setCartPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentType, setPaymentType] = useState("partial"); // partial (25%) or full (100%)
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBookingDetails();
    loadRazorpayScript();
  }, []);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");

      // Try to load from sessionStorage first (for cart bookings)
      const storedCartData = sessionStorage.getItem("cartPaymentData");
      
      // Load the booking details from API
      const response = await apiService.getBookingDetails(params.id);
      if (response.success && response.data) {
        setBooking(response.data);
        
        // If no stored cart data, use the API response to construct payment data
        if (!storedCartData) {
          const apiData = response.data;
          
          // Construct cart payment data from API response
          const constructedCartData = {
            paymentGroupId: apiData.paymentGroupId,
            totalAmount: apiData.paymentSummary?.totalAmount || 0,
            partialAmount: apiData.paymentSummary?.partialAmount || 0,
            remainingAmount: apiData.paymentSummary?.remainingAmount || 0,
            bookings: apiData.bookings || [],
            razorpay: apiData.razorpay || null, // Will need to create order on payment
          };
          
          setCartPaymentData(constructedCartData);
        } else {
          const parsedData = JSON.parse(storedCartData);
          setCartPaymentData(parsedData);
        }
      }
    } catch (error) {
      console.error("Failed to load booking details:", error);
      setError(error.message || "Failed to load booking details");
      toast.error("Error", error.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const getPaymentAmount = () => {
    if (!cartPaymentData || !booking) return 0;
    
    const isPartiallyPaid = booking?.paymentStatus === "partial";
    
    // If already partially paid, return remaining amount
    if (isPartiallyPaid) {
      return booking.paymentSummary?.remainingAmount || cartPaymentData.remainingAmount;
    }
    
    // Otherwise, return based on payment type selection
    if (paymentType === "full") {
      return cartPaymentData.totalAmount;
    } else {
      // partial (25%)
      return cartPaymentData.partialAmount;
    }
  };

  const handlePayment = async () => {
    if (!acceptedTerms) {
      toast.warning("Terms Required", "Please accept the terms and conditions");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Error", "Payment gateway not available");
      return;
    }

    if (!cartPaymentData) {
      toast.error("Error", "Payment data not found");
      return;
    }

    setPaymentLoading(true);
    setError("");

    try {
      const isPartiallyPaid = booking?.paymentStatus === "partial";
      
      // Determine payment type and amount
      let apiPaymentType;
      let paymentAmount;
      let percentage;
      
      if (isPartiallyPaid) {
        // Already partially paid, pay remaining 75%
        apiPaymentType = "remaining";
        paymentAmount = booking.paymentSummary?.remainingAmount || cartPaymentData.remainingAmount;
        percentage = 75;
      } else if (paymentType === "full") {
        // Pay full 100%
        apiPaymentType = "full";
        paymentAmount = cartPaymentData.totalAmount;
        percentage = 100;
      } else {
        // Pay initial 25%
        apiPaymentType = "partial";
        paymentAmount = cartPaymentData.partialAmount;
        percentage = 25;
      }
      
      console.log("💰 Payment Details:", {
        totalAmount: cartPaymentData.totalAmount,
        partialAmount: cartPaymentData.partialAmount,
        remainingAmount: booking.paymentSummary?.remainingAmount,
        paymentAmount,
        percentage,
        apiPaymentType,
        isCombined: booking?.isCombined,
        isPartiallyPaid,
        paymentGroupId: booking?.paymentGroupId,
        bookingId: params.id
      });
      
      let orderId, backendAmount;
      
      // Get booking ID (needed for verification)
      const bookingId = params.id;
      
      // Check if this is a fresh cart booking with existing Razorpay order
      const hasExistingRazorpayOrder = cartPaymentData?.razorpay?.orderId && !isPartiallyPaid;
      
      if (hasExistingRazorpayOrder) {
        // ✅ Use the Razorpay order from checkout (cart booking)
        orderId = cartPaymentData.razorpay.orderId;
        backendAmount = cartPaymentData.razorpay.amount;
        
        console.log("✅ Using existing Razorpay order from checkout:", {
          orderId,
          amount: backendAmount
        });
      } else {
        // ❌ Create a new payment order (for remaining payments or single bookings)
        console.log("🔄 Creating new payment order for:", {
          bookingId,
          apiPaymentType,
          reason: isPartiallyPaid ? "Remaining payment" : "No existing order"
        });
        
        const orderResponse = await apiService.createBookingPayment(bookingId, apiPaymentType);
        
        console.log("🔔 Backend Order Response:", orderResponse);
        
        if (!orderResponse?.data?.id) {
          throw new Error("Failed to create payment order");
        }
        
        orderId = orderResponse.data.id;
        backendAmount = orderResponse.data.amount;
      }
      
      // Check if backend amount matches what we expect
      const expectedAmountInPaise = Math.round(paymentAmount * 100);
      if (backendAmount && backendAmount !== expectedAmountInPaise) {
        console.warn("⚠️ Amount Mismatch:", {
          expected: expectedAmountInPaise,
          received: backendAmount,
          difference: backendAmount - expectedAmountInPaise
        });
      }
      
      const userData = apiService.safeLocalStorageGet("user", {});

      // Razorpay options - Use backend's amount
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: backendAmount || expectedAmountInPaise, // Use backend's amount (already in paise)
        currency: "INR",
        name: "Happy Go",
        description: `${cartPaymentData.bookings.length} Booking(s) - ${percentage}% Payment`,
        order_id: orderId,
        prefill: {
          name: booking?.guest?.name || userData.name || "",
          email: booking?.guest?.email || userData.email || "",
          contact: booking?.guest?.phone || userData.mobile || "",
        },
        theme: {
          color: "#F47B20",
        },
        handler: async function (response) {
          await verifyPayment(response, bookingId);
        },
        modal: {
          ondismiss: function () {
            setPaymentLoading(false);
            toast.info("Payment Cancelled", "You cancelled the payment");
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment initialization failed:", error);
      toast.error("Payment Failed", error.message || "Failed to initialize payment");
      setPaymentLoading(false);
    }
  };

  // Payment verification
  const verifyPayment = async (paymentResponse, bookingId) => {
    try {
      // Check if this is a combined booking (cart payment)
      const isCombinedBooking = booking?.paymentGroupId || cartPaymentData?.paymentGroupId;
      
      let response;
      
      if (isCombinedBooking) {
        // Use cart verification API for combined bookings
        const verificationData = {
          paymentGroupId: booking?.paymentGroupId || cartPaymentData?.paymentGroupId,
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        };
        
        console.log("Verifying combined booking payment with data:", verificationData);
        response = await apiService.verifyCartPayment(verificationData);
      } else {
        // Use single booking verification API
        const verificationData = {
          razorpay_order_id: paymentResponse.razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
        };
        
        console.log("Verifying single booking payment with data:", verificationData);
        response = await apiService.verifyBookingPayment(bookingId, verificationData);
      }

      if (response.success) {
        // Clear cart payment data
        sessionStorage.removeItem("cartPaymentData");
        
        toast.success(
          "Payment Successful!", 
          isCombinedBooking 
            ? "All your bookings have been confirmed!" 
            : "Your booking has been confirmed!"
        );

        // Navigate to bookings page
        setTimeout(() => {
          router.push("/bookings");
        }, 2000);
      } else {
        throw new Error(response.message || "Payment verification failed");
      }
    } catch (error) {
      console.error("Payment verification failed:", error);
      setError(error.message || "Payment verification failed");
      toast.error("Verification Failed", error.message || "Please contact support");
    } finally {
      setPaymentLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading payment details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || "The booking you're looking for doesn't exist."}
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F]"
                onClick={() => router.push("/")}
              >
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const paymentAmount = getPaymentAmount();
  const isPaymentCompleted = booking?.paymentStatus === "completed";
  const isPartiallyPaid = booking?.paymentStatus === "partial";

  // Get the first booking for display
  const firstBooking = booking?.bookings?.[0];
  const hasValidBooking = firstBooking && (firstBooking.hostel || firstBooking.bike);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Secure payment powered by Razorpay</p>
        </div>

        {/* Payment Already Completed Warning */}
        {isPaymentCompleted && (
          <Card className="mb-6 border-green-200 bg-green-50">
            <CardContent className="p-4 flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <p>
                Payment already completed. You can view your booking details{" "}
                <a
                  href={`/bookings`}
                  className="underline font-semibold"
                >
                  here
                </a>
                .
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Booking Details</h2>
                  {booking?.isCombined && (
                    <Badge className="bg-purple-100 text-purple-800">
                      Combined Booking
                    </Badge>
                  )}
                </div>

                {!hasValidBooking ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Loading booking details...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Display all bookings */}
                    {booking.bookings?.map((bookingItem, index) => (
                      <div key={bookingItem.id || index} className="space-y-4">
                        {index > 0 && <Separator />}
                        
                        {/* Bike Booking */}
                        {bookingItem.type === "bike" && bookingItem.bike && (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">🏍️</span>
                              <h3 className="font-bold text-lg">Bike Rental</h3>
                            </div>
                            
                            {bookingItem.bike.items?.map((bikeItem, idx) => (
                              <div key={idx} className="flex gap-4 bg-gray-50 rounded-lg p-3">
                                <img
                                  src={bikeItem.images?.[0] || "/assets/happygo.jpeg"}
                                  alt={bikeItem.name}
                                  className="w-20 h-20 rounded-lg object-cover"
                                />
                                <div className="flex-1">
                                  <h4 className="font-bold">{bikeItem.name}</h4>
                                  <p className="text-sm text-gray-600">{bikeItem.brand} {bikeItem.model}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {bikeItem.kmOption === "unlimited" ? "Unlimited KM" : "Limited KM"}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      Qty: {bikeItem.quantity}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            ))}

                            {bookingItem.dates && (
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Pickup</p>
                                  <p className="font-medium flex items-center gap-1 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(bookingItem.dates.pickupDate)}
                                  </p>
                                  <p className="text-xs text-gray-500">{bookingItem.dates.pickupTime}</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Drop</p>
                                  <p className="font-medium flex items-center gap-1 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(bookingItem.dates.dropDate)}
                                  </p>
                                  <p className="text-xs text-gray-500">{bookingItem.dates.dropTime}</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* Hostel Booking */}
                        {bookingItem.type === "hostel" && bookingItem.hostel && (
                          <>
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg">🏨</span>
                              <h3 className="font-bold text-lg">Hostel Stay</h3>
                            </div>

                            <div className="flex gap-4 bg-gray-50 rounded-lg p-3">
                              <img
                                src={bookingItem.hostel.images?.[0] || "/assets/happygo.jpeg"}
                                alt={bookingItem.hostel.name}
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                              <div className="flex-1">
                                <h4 className="font-bold">{bookingItem.hostel.name}</h4>
                                <p className="text-sm text-gray-600 flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {bookingItem.hostel.location}
                                </p>
                                {bookingItem.hostel.rating && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <span className="text-yellow-500 text-sm">★</span>
                                    <span className="text-xs font-medium">{bookingItem.hostel.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="mt-2">
                              <p className="text-sm text-gray-600 mb-1">Room Type</p>
                              <p className="font-medium text-sm">{bookingItem.hostel.roomType}</p>
                              {bookingItem.hostel.mealOption && (
                                <Badge variant="outline" className="mt-1 text-xs">
                                  {bookingItem.hostel.mealOption === "bedOnly" ? "Bed Only" :
                                   bookingItem.hostel.mealOption === "bedAndBreakfast" ? "Bed & Breakfast" :
                                   "Bed + Breakfast + Dinner"}
                                </Badge>
                              )}
                            </div>

                            {bookingItem.dates && (
                              <div className="grid grid-cols-2 gap-4 mt-3">
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Check-in</p>
                                  <p className="font-medium flex items-center gap-1 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(bookingItem.dates.checkIn)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Check-out</p>
                                  <p className="font-medium flex items-center gap-1 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDate(bookingItem.dates.checkOut)}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Nights</p>
                                  <p className="font-medium text-sm">{bookingItem.dates.nights} night(s)</p>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600 mb-1">Beds</p>
                                  <p className="font-medium text-sm">{bookingItem.hostel.beds || 1} bed(s)</p>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}

                    <Separator className="my-4" />

                    {/* Booking Status */}
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Booking Status</p>
                        <Badge
                          className={
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {booking.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Payment Status</p>
                        <Badge
                          className={
                            isPaymentCompleted
                              ? "bg-green-100 text-green-800"
                              : isPartiallyPaid
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Options */}
            {!isPaymentCompleted && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold mb-4">Payment Options</h2>

                  {/* Show payment already made info if partial */}
                  {isPartiallyPaid && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-800 text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold">
                          ₹{booking.paymentSummary?.paidAmount?.toFixed(2)} already paid (25%)
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    {/* 25% Payment Option - Only show if NOT partially paid */}
                    {!isPartiallyPaid && cartPaymentData && (
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentType === "partial"
                            ? "border-[#F47B20] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setPaymentType("partial")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={paymentType === "partial"}
                            onChange={() => setPaymentType("partial")}
                            className="w-4 h-4 text-[#F47B20]"
                          />
                          <h3 className="font-semibold text-lg">
                            Pay 25% Now (Recommended)
                          </h3>
                          <Badge className="bg-green-500 text-white">
                            POPULAR
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 ml-6">
                          Reserve all {cartPaymentData.bookings?.length || 0} booking(s) with just 25% payment now. 
                          Pay the remaining 75% anytime before pickup/check-in.
                        </p>
                        <div className="bg-white rounded-lg p-3 mb-2 ml-6">
                          <div className="space-y-1 text-sm">
                            {cartPaymentData.bookings?.map((bookingItem, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span className="text-gray-600">
                                  {bookingItem.type === 'bike' ? '🏍️ Bike Rental' : '🏨 Hostel Stay'}
                                </span>
                                <span className="font-medium">₹{bookingItem.priceBreakdown?.totalAmount?.toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2 ml-6">
                          <span className="text-2xl font-bold text-[#F47B20]">
                            ₹{cartPaymentData.partialAmount?.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600">
                            (25% of ₹{cartPaymentData.totalAmount?.toFixed(2)})
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Remaining 75% Payment Option - Show if partially paid */}
                    {isPartiallyPaid && cartPaymentData && (
                      <div className="border-2 border-[#F47B20] bg-orange-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">
                            Pay Remaining 75%
                          </h3>
                          <Badge className="bg-orange-500 text-white">
                            REQUIRED
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Complete your booking by paying the remaining amount before pickup/check-in.
                        </p>
                        <div className="bg-white rounded-lg p-3 mb-2">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Total Amount</span>
                              <span className="font-medium">₹{cartPaymentData.totalAmount?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-green-600">
                              <span>Already Paid (25%)</span>
                              <span className="font-medium">- ₹{booking.paymentSummary?.paidAmount?.toFixed(2)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-semibold">
                              <span>Remaining Amount</span>
                              <span>₹{booking.paymentSummary?.remainingAmount?.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold text-[#F47B20]">
                            ₹{booking.paymentSummary?.remainingAmount?.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600">
                            (75% remaining)
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 100% Payment Option - Only show if NOT partially paid */}
                    {!isPartiallyPaid && cartPaymentData && (
                      <div
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          paymentType === "full"
                            ? "border-[#F47B20] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setPaymentType("full")}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="radio"
                            checked={paymentType === "full"}
                            onChange={() => setPaymentType("full")}
                            className="w-4 h-4 text-[#F47B20]"
                          />
                          <h3 className="font-semibold text-lg">
                            Pay 100% Now
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-3 ml-6">
                          Complete full payment now and you're all set! No remaining balance.
                        </p>
                        <div className="flex items-baseline gap-2 ml-6">
                          <span className="text-2xl font-bold text-[#F47B20]">
                            ₹{cartPaymentData.totalAmount?.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-600">
                            (Full amount)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Security Info */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-sm">
                      Your payment is secure
                    </p>
                    <p className="text-xs text-gray-600">
                      All transactions are encrypted and secured by Razorpay
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Payment Summary</h2>

                {cartPaymentData && (
                  <div className="space-y-3 mb-6">
                    {/* Individual Items */}
                    {cartPaymentData.bookings?.map((item, idx) => (
                      <div key={idx} className="pb-3 border-b">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-sm">
                            {item.type === 'bike' ? '🏍️ Bike Rental' : '🏨 Hostel Stay'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Base Price</span>
                          <span className="font-medium">
                            ₹{item.priceBreakdown?.basePrice?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">GST ({item.priceBreakdown?.gstPercentage || 5}%)</span>
                          <span className="font-medium">
                            + ₹{item.priceBreakdown?.gst?.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold mt-1">
                          <span>Subtotal</span>
                          <span>₹{item.priceBreakdown?.totalAmount?.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="flex justify-between">
                      <span className="font-semibold">Total Amount</span>
                      <span className="font-semibold">
                        ₹{cartPaymentData.totalAmount?.toFixed(2)}
                      </span>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-lg">
                        {isPartiallyPaid 
                          ? "Pay Now (75% Remaining)" 
                          : paymentType === "partial" 
                            ? "Pay Now (25%)" 
                            : "Pay Now (100%)"}
                      </span>
                      <span className="font-bold text-2xl text-[#F47B20]">
                        ₹{paymentAmount.toFixed(2)}
                      </span>
                    </div>

                    {!isPartiallyPaid && paymentType === "partial" && cartPaymentData.remainingAmount > 0 && (
                      <p className="text-xs text-gray-600 text-center">
                        Remaining ₹{(cartPaymentData.totalAmount - cartPaymentData.partialAmount).toFixed(2)} due before service
                      </p>
                    )}
                  </div>
                )}

                {/* Terms Checkbox */}
                {!isPaymentCompleted && (
                  <>
                    <div className="mb-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox
                          id="terms"
                          checked={acceptedTerms}
                          onCheckedChange={setAcceptedTerms}
                        />
                        <Label
                          htmlFor="terms"
                          className="text-xs leading-tight cursor-pointer"
                        >
                          I accept the{" "}
                          <a href="https://happygorentals.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#F47B20] underline">
                            terms and conditions
                          </a>{" "}
                          to proceed with payment
                        </Label>
                      </div>
                    </div>

                    {/* Pay Now Button */}
                    <Button
                      className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold py-6"
                      onClick={handlePayment}
                      disabled={paymentLoading || !acceptedTerms}
                    >
                      {paymentLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pay ₹{paymentAmount.toFixed(2)}
                        </>
                      )}
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
