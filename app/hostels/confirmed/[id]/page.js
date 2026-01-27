"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Users,
  CheckCircle,
  Copy,
  Share2,
  Phone,
  Mail,
  Clock,
  Download,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function HostelBookingConfirmedPage() {
  const params = useParams();
  const router = useRouter();
  
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadBookingDetails();
    }
  }, [params.id]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await apiService.getBookingDetails(params.id);

      if (response.success && response.data) {
        setBooking(response.data);
      } else {
        throw new Error(response.message || "Failed to load booking details");
      }
    } catch (error) {
      console.error("Failed to load booking details:", error);
      setError(error.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyBookingId = () => {
    const bookingId = booking?.bookings?.[0]?.id || params.id;
    if (bookingId) {
      navigator.clipboard.writeText(bookingId);
      setCopied(true);
      toast.success("Copied!", "Booking ID copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    const hostelName = booking?.bookings?.[0]?.hostel?.name || "hostel";
    const shareData = {
      title: "My Hostel Booking Confirmed",
      text: `Booking confirmed at ${hostelName}!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: copy link
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link Copied!", "Booking link copied to clipboard");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handlePayRemaining = () => {
    const bookingId = booking?.bookings?.[0]?.id || params.id;
    router.push(`/hostels/payment/${bookingId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
                onClick={() => router.push("/hostels")}
              >
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const isPaymentCompleted = booking.paymentStatus === "completed";
  const isPartiallyPaid = booking.paymentStatus === "partial";
  const remainingAmount = booking.paymentSummary?.remainingAmount || 0;
  
  // Get first booking for display
  const hostelBooking = booking.bookings?.[0];
  const hostelData = hostelBooking?.hostel;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        <Card className="mb-8 border-green-200 bg-gradient-to-r from-green-50 to-green-100">
          <CardContent className="p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2 text-green-900">
              Booking Confirmed!
            </h1>
            <p className="text-green-800 mb-4">
              {isPaymentCompleted
                ? "Your hostel booking has been confirmed and payment is complete."
                : "Your hostel has been reserved. Complete remaining payment before check-in."}
            </p>
            
            {/* Booking ID */}
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">Booking ID:</span>
              <code className="text-sm font-mono">{hostelBooking?.id || params.id}</code>
              <button
                onClick={handleCopyBookingId}
                className="text-[#F47B20] hover:text-[#E06A0F]"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Status Alert */}
        {isPartiallyPaid && remainingAmount > 0 && (
          <Card className="mb-6 border-yellow-200 bg-yellow-50">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <CreditCard className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    Remaining Payment Required
                  </h3>
                  <p className="text-sm text-yellow-800 mb-4">
                    You have paid 25% (₹
                    {(booking.paymentSummary?.paidAmount || 0).toFixed(2)}). Please
                    complete the remaining payment of{" "}
                    <span className="font-bold">₹{remainingAmount.toFixed(2)}</span>{" "}
                    before check-in.
                  </p>
                  <Button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={handlePayRemaining}
                  >
                    Pay Remaining Amount
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hostel Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Booking Details</h2>

                {/* Hostel Info */}
                {hostelData && (
                  <div className="flex gap-4 mb-6">
                    <img
                      src={hostelData.images?.[0] || "/assets/happygo.jpeg"}
                      alt={hostelData.name}
                      className="w-32 h-32 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {hostelData.name}
                      </h3>
                      <p className="text-gray-600 flex items-center mb-2">
                        <MapPin className="w-4 h-4 mr-2" />
                        {hostelData.address || hostelData.location}
                      </p>
                      {hostelData.rating && (
                        <div className="flex items-center gap-1 mb-2">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm font-medium">{hostelData.rating}</span>
                        </div>
                      )}
                      
                      {/* Contact Info */}
                      {hostelData.contact && (
                        <div className="space-y-1">
                          {hostelData.contact.phone && (
                            <a
                              href={`tel:${hostelData.contact.phone}`}
                              className="flex items-center text-sm text-[#F47B20] hover:underline"
                            >
                              <Phone className="w-4 h-4 mr-2" />
                              {hostelData.contact.phone}
                            </a>
                          )}
                          {hostelData.contact.email && (
                            <a
                              href={`mailto:${hostelData.contact.email}`}
                              className="flex items-center text-sm text-[#F47B20] hover:underline"
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              {hostelData.contact.email}
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Separator className="my-6" />

                {/* Room & Stay Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Room Type</p>
                    <p className="font-medium">{hostelData?.roomType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Meal Option</p>
                    <Badge variant="secondary" className="capitalize">
                      {hostelData?.mealOption === "bedOnly" ? "Bed Only" :
                       hostelData?.mealOption === "bedAndBreakfast" ? "Bed & Breakfast" :
                       hostelData?.mealOption === "bedBreakfastAndDinner" ? "Bed + Breakfast + Dinner" :
                       "N/A"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Number of Beds</p>
                    <p className="font-medium flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {hostelData?.beds || 1} Bed(s)
                    </p>
                  </div>
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
                </div>

                <Separator className="my-6" />

                {/* Check-in/Check-out */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Check-in</p>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-[#F47B20] mt-1" />
                      <div>
                        <p className="font-semibold">{formatDate(hostelBooking?.dates?.checkIn)}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {hostelData?.checkInTime || "1:00 PM"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Check-out</p>
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="font-semibold">{formatDate(hostelBooking?.dates?.checkOut)}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {hostelData?.checkOutTime || "10:00 AM"}
                        </p>
                        {hostelBooking?.dates?.nights && (
                          <p className="text-xs text-gray-500 mt-1">
                            {hostelBooking.dates.nights} night(s)
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guest Details */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Guest Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.guest?.name && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Name</p>
                      <p className="font-medium">{booking.guest.name}</p>
                    </div>
                  )}
                  {booking.guest?.email && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-medium">{booking.guest.email}</p>
                    </div>
                  )}
                  {booking.guest?.phone && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mobile</p>
                      <p className="font-medium">{booking.guest.phone}</p>
                    </div>
                  )}
                </div>

                {booking.specialRequests && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-1">Special Requests</p>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">
                      {booking.specialRequests}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Important Instructions */}
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  Important Instructions
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      Please carry a valid government photo ID (PAN cards not
                      accepted)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>Local IDs are not accepted</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      Foreign guests: Passport with a valid visa is required
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-1">•</span>
                    <span>
                      Non-resident visitors are not allowed beyond reception/common
                      areas
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share Booking
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                asChild
              >
                <a href="tel:+919008022800">
                  <Phone className="w-4 h-4 mr-2" />
                  Contact Support
                </a>
              </Button>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Payment Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">
                      ₹{(hostelBooking?.priceBreakdown?.basePrice || 0).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST ({hostelBooking?.priceBreakdown?.gstPercentage || 5}%)</span>
                    <span className="font-medium">
                      + ₹{(hostelBooking?.priceBreakdown?.gst || 0).toFixed(2)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between">
                    <span className="font-semibold">Total Amount</span>
                    <span className="font-semibold">
                      ₹{(booking.paymentSummary?.totalAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-sm text-green-600">
                    <span>Paid Amount</span>
                    <span className="font-medium">
                      ₹{(booking.paymentSummary?.paidAmount || 0).toFixed(2)}
                    </span>
                  </div>

                  {!isPaymentCompleted && remainingAmount > 0 && (
                    <div className="flex justify-between text-sm text-yellow-700">
                      <span className="font-medium">Remaining Amount</span>
                      <span className="font-bold">
                        ₹{remainingAmount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Payment Status */}
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                  <Badge
                    className={`text-sm py-1 px-3 ${
                      isPaymentCompleted
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {booking.paymentStatus === "completed"
                      ? "✓ Payment Complete"
                      : booking.paymentStatus === "partial"
                      ? "⚡ Partially Paid"
                      : "⏳ Pending"}
                  </Badge>
                </div>

                {/* Pay Remaining Button */}
                {isPartiallyPaid && remainingAmount > 0 && (
                  <Button
                    className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold py-6 mb-4"
                    onClick={handlePayRemaining}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    Pay Remaining ₹{remainingAmount.toFixed(2)}
                  </Button>
                )}

                {/* View All Bookings */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push("/bookings")}
                >
                  View All Bookings
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


