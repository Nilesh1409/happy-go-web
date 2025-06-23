"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Share, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function BookingConfirmedPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    loadBookingDetails();
    // Show verification modal after 2 seconds
    setTimeout(() => {
      setShowVerificationModal(true);
    }, 2000);
  }, [params.id]);

  const loadBookingDetails = async () => {
    try {
      const response = await apiService.getBookingDetails(params.id);
      setBooking(response.data);
    } catch (error) {
      console.error("Failed to load booking details:", error);
      // Fallback to dummy data
      setBooking({
        _id: params.id,
        bikeTitle: "Honda CB350 2022",
        bikeImage: "/placeholder.svg?height=200&width=300",
        startDate: "22 Jun 2025",
        startTime: "07:00 AM",
        endDate: "23 Jun 2025",
        endTime: "06:00 PM",
        kmLimit: "60 km",
        totalAmount: "₹1180.00",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewBooking = () => {
    window.location.href = "/bookings";
  };

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "My Bike Booking",
        text: `I just booked a ${booking?.bikeTitle} for my trip!`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20]"></div>
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
              <h2 className="text-2xl font-bold mb-4">Booking Not Found</h2>
              <p className="text-gray-600 mb-6">
                Unable to load booking details. Please try again.
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                asChild
              >
                <Link href="/bookings">View My Bookings</Link>
              </Button>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/"
              className="flex items-center mr-4 hover:text-yellow-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Booking Confirmed</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600">
            Your booking has been confirmed successfully.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="text-sm text-gray-600 mb-2">Booking ID</div>
              <div className="font-mono text-lg font-semibold">
                {booking._id}
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <Image
                src={
                  booking.bikeImage || "/placeholder.svg?height=200&width=300"
                }
                alt={booking.bikeTitle}
                width={200}
                height={150}
                className="rounded-lg"
              />
            </div>

            <h3 className="text-xl font-bold text-center mb-6">
              {booking.bikeTitle}
            </h3>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pick-up Date</span>
                  <span className="font-medium">{booking.startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drop-off Date</span>
                  <span className="font-medium">{booking.endDate}</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pick-up Time</span>
                  <span className="font-medium">{booking.startTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Drop-off Time</span>
                  <span className="font-medium">{booking.endTime}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between w-full">
                <div>
                  <span className="text-gray-600">KM Limit</span>
                  <div className="font-medium">{booking.kmLimit}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Amount</span>
                  <div className="font-bold text-lg">{booking.totalAmount}</div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Important Instructions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    Please carry your ID proof and driving license for
                    verification.
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    Fuel charges are not included in the booking amount.
                  </span>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>
                    Additional charges will apply if you exceed the KM limit or
                    return the bike late.
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center mb-6">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center"
              >
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                onClick={handleViewBooking}
              >
                View Booking
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoHome}
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Verification Required</h3>
              <p className="text-gray-600 mb-6">
                To complete your booking, please verify your Aadhar and upload
                your driving license.
              </p>
              <div className="space-y-3">
                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                  onClick={() => (window.location.href = "/verification")}
                >
                  Verify Documents
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowVerificationModal(false)}
                >
                  Skip for Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  );
}
