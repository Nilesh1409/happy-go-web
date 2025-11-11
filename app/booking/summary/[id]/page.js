"use client";

import { Suspense, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

// Loading component for Suspense fallback
function BookingSummaryPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking summary...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main export with Suspense wrapper
export default function BookingSummaryPage() {
  return (
    <Suspense fallback={<BookingSummaryPageSkeleton />}>
      <BookingSummaryPageContent />
    </Suspense>
  );
}

// Main booking summary component that uses useSearchParams
function BookingSummaryPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");

  const kmOption = searchParams.get("kmOption") || "limited";
  const bookingParams = {
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    startTime: searchParams.get("startTime") || "",
    endTime: searchParams.get("endTime") || "",
  };

  useEffect(() => {
    loadBikeDetails();
  }, [params.id]);

  const loadBikeDetails = async () => {
    try {
      const response = await apiService.getBikeDetails(
        params.id,
        bookingParams
      );
      setBike(response.data);
    } catch (error) {
      console.error("Failed to load bike details:", error);
      // Fallback to dummy data
      setBike({
        _id: params.id,
        title: "Honda CB350 2022",
        brand: "Honda",
        model: "CB350",
        year: 2022,
        pricePerDay: { limitedKm: 500, unlimited: 800 },
        images: ["/placeholder.svg?height=200&width=300"],
        kmLimit: { limited: 60, unlimited: "Unlimited" },
        additionalKmPrice: 4,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePricing = () => {
    if (!bike || !bookingParams.startDate || !bookingParams.endDate) {
      return { basePrice: 0, days: 0, subtotal: 0, taxes: 0, total: 0 };
    }

    const startDate = new Date(bookingParams.startDate);
    const endDate = new Date(bookingParams.endDate);
    const days = Math.max(
      1,
      Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
    );

    const basePrice =
      kmOption === "limited"
        ? bike.pricePerDay.limitedKm?.price
        : bike.pricePerDay.unlimited?.price;
    const subtotal = basePrice * days;
    const taxes = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal + taxes;

    return {
      basePrice: basePrice,
      days: days,
      subtotal: subtotal,
      taxes: taxes,
      total: total,
    };
  };

  const handleProceedToPay = async () => {
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }

    setBookingLoading(true);
    setError("");
    console.log("🚀 ~ handleProceedToPay ~ bike:", bike);

    try {
      const pricing = calculatePricing();
      const bookingData = {
        bookingType: "bike",
        bikeId: bike._id,
        startDate: bookingParams.startDate,
        endDate: bookingParams.endDate,
        startTime: bookingParams.startTime,
        endTime: bookingParams.endTime,
        priceDetails: {
          basePrice: pricing.basePrice,
          taxes: pricing.taxes,
          discount: 0,
          totalAmount: pricing.total,
        },
        bikeDetails: {
          kmLimit: 60,
          isUnlimited: kmOption === "unlimited",
          additionalKmPrice: bike.additionalKmPrice || 4,
        },
      };

      const response = await apiService.createBooking(bookingData);

      // Navigate to payment page to select payment option (25% or 100%)
      window.location.href = `/payment/${response.data._id}`;
    } catch (error) {
      setError(error.message || "Booking failed. Please try again.");
    } finally {
      setBookingLoading(false);
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

  if (!bike) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Bike Not Found</h2>
              <p className="text-gray-600 mb-6">
                Unable to load bike details. Please try again.
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                asChild
              >
                <Link href="/search">Browse Other Bikes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pricing = calculatePricing();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header */}
      <div className="bg-[#F47B20] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href={`/bike/${params.id}`}
              className="flex items-center mr-4 hover:text-yellow-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Booking Summary</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Image
                src={
                  bike.images?.[0] || "/placeholder.svg?height=120&width=180"
                }
                alt={bike.title}
                width={120}
                height={80}
                className="rounded-lg"
              />
              <div>
                <h2 className="text-xl font-bold">{bike.title}</h2>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold mb-3">Booking Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pick-up Date</span>
                    <span className="font-medium">
                      {bookingParams.startDate || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pick-up Time</span>
                    <span className="font-medium">
                      {bookingParams.startTime || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drop-off Date</span>
                    <span className="font-medium">
                      {bookingParams.endDate || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Drop-off Time</span>
                    <span className="font-medium">
                      {bookingParams.endTime || "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium">{pricing.days} day(s)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KM Limit</span>
                    <span className="font-medium">
                      {kmOption === "limited"
                        ? `${bike.kmLimit?.limited || 60} km`
                        : "Unlimited km"}
                    </span>
                  </div>
                  {kmOption === "limited" && bike.additionalKmPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Additional KM Price</span>
                      <span className="font-medium">
                        ₹{bike.additionalKmPrice}/km
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Price Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">
                      ₹{pricing.basePrice} x {pricing.days} day(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{pricing.subtotal}.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Early/Late</span>
                    <span className="font-medium">₹0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Taxes (5%)</span>
                    <span className="font-medium">₹{pricing.taxes}.00</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-[#F47B20]">₹{pricing.total}.00</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 mb-6">
              <Checkbox
                id="terms"
                checked={agreedToTerms}
                onCheckedChange={setAgreedToTerms}
              />
              <label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-[#F47B20] underline">
                  Terms & Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#F47B20] underline">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12"
              onClick={handleProceedToPay}
              disabled={
                bookingLoading ||
                !agreedToTerms ||
                !bookingParams.startDate ||
                !bookingParams.endDate
              }
            >
              {bookingLoading ? "Processing..." : "Proceed to Pay"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
