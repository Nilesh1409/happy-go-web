"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Star, MapPin, Fuel, Shield } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoginModal from "@/components/login-modal";
import ModernDateTimePicker from "@/components/modern-date-time-picker";
import { apiService } from "@/lib/api";

export default function BikeDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize selectedKmOption from URL params
  const [selectedKmOption, setSelectedKmOption] = useState(
    searchParams.get("kmOption") || "limited"
  );

  // Parse dates from URL params with correct parameter names
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const [bookingParams, setBookingParams] = useState({
    startDate: parseDate(searchParams.get("startDate")),
    endDate: parseDate(searchParams.get("endDate")),
    startTime: searchParams.get("startTime") || "",
    endTime: searchParams.get("endTime") || "",
  });

  // Get extra amount from URL params (from search page)
  const [searchExtraAmount] = useState(
    Number(searchParams.get("extraAmount")) || 0
  );

  const [bookingLoading, setBookingLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Build back to search URL with all original search parameters
  const buildBackToSearchUrl = () => {
    // Get all search parameters from the current URL
    const currentParams = new URLSearchParams(window.location.search);

    // Extract the specific parameters we need for search
    const searchParamsObj = {
      location: currentParams.get("location") || "",
      pickupDate: currentParams.get("startDate") || "",
      dropoffDate: currentParams.get("endDate") || "",
      pickupTime: currentParams.get("startTime") || "",
      dropoffTime: currentParams.get("endTime") || "",
    };

    // Debug log to see what we're getting
    console.log("Current URL params:", Object.fromEntries(currentParams));
    console.log("Search params object:", searchParamsObj);

    // Filter out empty values
    const filteredParams = Object.fromEntries(
      Object.entries(searchParamsObj).filter(
        ([_, value]) => value && value.trim() !== ""
      )
    );
    console.log("Filtered params:", filteredParams);

    const queryString = new URLSearchParams(filteredParams).toString();
    const finalUrl = `/search${queryString ? `?${queryString}` : ""}`;

    console.log("Final back URL:", finalUrl);
    return finalUrl;
  };

  useEffect(() => {
    loadBikeDetails();
  }, [params.id]);

  // Update selectedKmOption when URL params change
  useEffect(() => {
    const kmOption = searchParams.get("kmOption");
    if (kmOption && (kmOption === "limited" || kmOption === "unlimited")) {
      setSelectedKmOption(kmOption);
    }
  }, [searchParams]);

  const loadBikeDetails = async () => {
    try {
      const queryParams = {
        startDate: bookingParams.startDate?.toISOString().split("T")[0] || "",
        startTime: bookingParams.startTime,
        endDate: bookingParams.endDate?.toISOString().split("T")[0] || "",
        endTime: bookingParams.endTime,
      };

      const response = await apiService.getBikeDetails(params.id, queryParams);
      setBike(response.data);
    } catch (error) {
      console.error("Failed to load bike details:", error);
      // Fallback dummy data
      setBike({
        _id: params.id,
        title: "Honda CB350 2022",
        brand: "Honda",
        model: "CB350",
        year: 2022,
        pricePerDay: {
          limitedKm: { price: 500, kmLimit: 60, isActive: true },
          unlimited: { price: 800, isActive: true },
        },
        images: ["/placeholder.svg?height=200&width=300"],
        rating: 4.7,
        reviewCount: 92,
        location: "Indiranagar - Metro Station",
        kmLimit: { limited: 60, unlimited: "Unlimited" },
        additionalKmPrice: 4,
        features: ["Bluetooth", "GPS", "USB Charging", "Anti-theft", "Helmet"],
        description: "Perfect bike for city rides and short trips",
        extraAmount: searchExtraAmount, // Use the extra amount from search
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateExtraCharges = (time, type) => {
    if (!time) return 0;

    let extraAmount = 0;
    const [hour, minute] = time.split(":").map(Number);
    const timeInMinutes = hour * 60 + minute;

    if (type === "pickup") {
      // Early pickup charge (5 AM - 7 AM)
      if (timeInMinutes >= 5 * 60 && timeInMinutes < 7 * 60) {
        extraAmount += 100;
      }
    } else if (type === "dropoff") {
      // Late dropoff charges
      if (timeInMinutes >= 20 * 60 + 30 && timeInMinutes < 21 * 60)
        extraAmount += 50;
      else if (timeInMinutes >= 21 * 60 && timeInMinutes < 21 * 60 + 30)
        extraAmount += 100;
      else if (timeInMinutes >= 21 * 60 + 30 && timeInMinutes < 22 * 60)
        extraAmount += 150;
      else if (timeInMinutes >= 22 * 60 && timeInMinutes < 22 * 60 + 30)
        extraAmount += 200;
      else if (timeInMinutes >= 22 * 60 + 30) extraAmount += 300;
    }

    return extraAmount;
  };

  const calculatePricing = () => {
    if (!bike || !bookingParams.startDate || !bookingParams.endDate) {
      return {
        basePrice: 0,
        days: 0,
        subtotal: 0,
        timeExtraCharges: 0,
        // searchExtraCharges: searchExtraAmount,
        totalExtraCharges: searchExtraAmount,
        taxes: 0,
        total: 0,
      };
    }

    const startDate = new Date(bookingParams.startDate);
    const endDate = new Date(bookingParams.endDate);

    // Calculate duration based on your business rules
    const calculateDuration = (start, end, startTime, endTime) => {
      // Get day of week (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
      const startDay = start.getDay();
      const endDay = end.getDay();

      // Check if both dates fall between Monday (1) to Thursday (4)
      const isStartWeekday = startDay >= 1 && startDay <= 4;
      const isEndWeekday = endDay >= 1 && endDay <= 4;
      const isSameDate = start.toDateString() === end.toDateString();

      if (isSameDate) {
        // Same date booking
        if (isStartWeekday) {
          // Monday to Thursday: calculate hours
          if (startTime && endTime) {
            const [startHour, startMin] = startTime.split(":").map(Number);
            const [endHour, endMin] = endTime.split(":").map(Number);

            const startMinutes = startHour * 60 + startMin;
            const endMinutes = endHour * 60 + endMin;

            const durationMinutes = endMinutes - startMinutes;
            const durationHours = durationMinutes / 60;

            // Convert hours to days (assuming 8-10 hours = 1 day for billing)
            // You can adjust this conversion rate as per your business logic
            return Math.max(1, Math.ceil(durationHours / 8));
          }
          return 1; // Default to 1 day if times not specified
        } else {
          // Weekend: count as 1 day
          return 1;
        }
      } else {
        // Different dates
        if (isStartWeekday && isEndWeekday) {
          // Both dates are weekdays: calculate hours between them
          if (startTime && endTime) {
            const startDateTime = new Date(start);
            const [startHour, startMin] = startTime.split(":").map(Number);
            startDateTime.setHours(startHour, startMin, 0, 0);

            const endDateTime = new Date(end);
            const [endHour, endMin] = endTime.split(":").map(Number);
            endDateTime.setHours(endHour, endMin, 0, 0);

            const durationMs = endDateTime - startDateTime;
            const durationHours = durationMs / (1000 * 60 * 60);

            // Convert hours to days (adjust the divisor as per your business logic)
            return Math.max(1, Math.ceil(durationHours / 24));
          }
          // If no times specified, fall back to date counting
          return Math.max(
            1,
            Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1
          );
        } else {
          // At least one date is weekend: count dates
          // Count unique dates involved
          const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
          return Math.max(1, daysDiff + 1); // +1 because both start and end dates count
        }
      }
    };

    const days = calculateDuration(
      startDate,
      endDate,
      bookingParams.startTime,
      bookingParams.endTime
    );

    const basePrice =
      selectedKmOption === "limited"
        ? bike.pricePerDay?.limitedKm?.price || 0
        : bike.pricePerDay?.unlimited?.price || 0;

    let subtotal = basePrice * days;

    // Calculate time-based extra charges (early pickup/late dropoff)
    const pickupExtra = calculateExtraCharges(
      bookingParams.startTime,
      "pickup"
    );
    const dropoffExtra = calculateExtraCharges(
      bookingParams.endTime,
      "dropoff"
    );
    const timeExtraCharges = pickupExtra + dropoffExtra;

    // Add search extra charges (from API response)
    // const searchExtraCharges = bike.extraAmount || searchExtraAmount || 0;
    const totalExtraCharges = timeExtraCharges;
    // + searchExtraCharges;

    const totalBeforeTax = subtotal + totalExtraCharges;
    const taxes = Math.round(totalBeforeTax * 0.18);
    const total = totalBeforeTax + taxes;

    return {
      basePrice,
      days,
      subtotal,
      timeExtraCharges,
      // searchExtraCharges,
      totalExtraCharges,
      taxes,
      total,
    };
  };

  const handleProceedToPay = () => {
    if (!agreedToTerms) {
      setError("Please agree to the Terms & Conditions");
      return;
    }

    if (!bookingParams.startDate || !bookingParams.endDate) {
      setError("Please select booking dates");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    proceedWithBooking();
  };

  const proceedWithBooking = () => {
    setBookingLoading(true);
    setError("");

    try {
      const pricing = calculatePricing();
      const bookingData = {
        bookingType: "bike",
        bikeId: bike._id,
        startDate: bookingParams.startDate.toISOString().split("T")[0],
        endDate: bookingParams.endDate.toISOString().split("T")[0],
        startTime: bookingParams.startTime,
        endTime: bookingParams.endTime,
        priceDetails: {
          basePrice: pricing.basePrice,
          extraCharges: pricing.totalExtraCharges,
          taxes: pricing.taxes,
          discount: 0,
          totalAmount: pricing.total,
        },
        bikeDetails: {
          kmLimit:
            selectedKmOption === "limited"
              ? bike.pricePerDay?.limitedKm?.kmLimit || 60
              : "Unlimited",
          isUnlimited: selectedKmOption === "unlimited",
          additionalKmPrice: bike.additionalKmPrice || 4,
        },
      };

      // Create booking first, then redirect to payment
      apiService
        .createBooking(bookingData)
        .then((response) => {
          window.location.href = `/payment/${response.data._id}`;
        })
        .catch((error) => {
          setError(
            error.message || "Booking creation failed. Please try again."
          );
          setBookingLoading(false);
        });
    } catch (error) {
      setError("Booking creation failed. Please try again.");
      setBookingLoading(false);
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    proceedWithBooking();
  };

  if (loading) {
    return (
      <div className="min-h-screen">
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
      <div className="min-h-screen ">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="shadow-lg">
            <CardContent className="p-12 text-center">
              <h2 className="text-2xl font-bold mb-4">Bike Not Found</h2>
              <p className="text-gray-600 mb-6">
                The bike you're looking for doesn't exist or is no longer
                available.
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                asChild
              >
                <Link href={buildBackToSearchUrl()}>Browse Other Bikes</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const pricing = calculatePricing();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="min-h-screen ">
      <Header />

      {/* Header Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href={buildBackToSearchUrl()}
              className="flex items-center mr-4 text-gray-600 hover:text-[#F47B20] transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Back to Search</span>
            </Link>

            {/* Breadcrumb showing search context */}
            {searchParams.get("location") && (
              <div className="hidden sm:flex items-center text-sm text-gray-500 ml-4">
                <span>Search results for</span>
                <span className="font-medium text-gray-700 ml-1">
                  {searchParams.get("location")}
                </span>
                {bookingParams.startDate && bookingParams.endDate && (
                  <>
                    <span className="mx-2">•</span>
                    <span>
                      {bookingParams.startDate.toLocaleDateString()} -{" "}
                      {bookingParams.endDate.toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Disclaimer */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <Shield className="w-4 h-4 inline mr-2" />
            All prices are exclusive of taxes and fuel. Images for
            representation purposes only.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Bike Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bike Overview Card */}
            <Card className="shadow-lg border-0">
              <CardContent className="p-4 lg:p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Bike Image - Responsive */}
                  <div className="w-full lg:w-80 flex-shrink-0">
                    <div className="relative bg-gray-50 rounded-xl p-4">
                      <Image
                        src={
                          bike.images?.[0] ||
                          "/placeholder.svg?height=200&width=300"
                        }
                        alt={bike.title}
                        width={300}
                        height={200}
                        className="w-full h-48 object-contain rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Bike Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">
                          {bike.title}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            <span>{bike.location}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {bike.features?.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 border-orange-200"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* KM Limit Selection */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Choose KM Package
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {bike.pricePerDay?.limitedKm?.isActive && (
                          <Button
                            variant={
                              selectedKmOption === "limited"
                                ? "default"
                                : "outline"
                            }
                            className={`h-auto p-4 ${
                              selectedKmOption === "limited"
                                ? "bg-[#F47B20] hover:bg-[#E06A0F] text-white border-[#F47B20]"
                                : "border-gray-300 hover:border-[#F47B20] hover:text-[#F47B20]"
                            }`}
                            onClick={() => setSelectedKmOption("limited")}
                          >
                            <div className="text-center">
                              <div className="font-semibold">
                                {bike.pricePerDay.limitedKm.kmLimit || 60} km
                              </div>
                              <div className="text-xs opacity-80">Limited</div>
                            </div>
                          </Button>
                        )}

                        {bike.pricePerDay?.unlimited?.isActive && (
                          <Button
                            variant={
                              selectedKmOption === "unlimited"
                                ? "default"
                                : "outline"
                            }
                            className={`h-auto p-4 ${
                              selectedKmOption === "unlimited"
                                ? "bg-[#F47B20] hover:bg-[#E06A0F] text-white border-[#F47B20]"
                                : "border-gray-300 hover:border-[#F47B20] hover:text-[#F47B20]"
                            }`}
                            onClick={() => setSelectedKmOption("unlimited")}
                          >
                            <div className="text-center">
                              <div className="font-semibold">Unlimited</div>
                              <div className="text-xs opacity-80">No limit</div>
                            </div>
                          </Button>
                        )}
                      </div>
                      {selectedKmOption === "limited" &&
                        bike.additionalKmPrice && (
                          <p className="text-sm text-gray-600 mt-2">
                            <Fuel className="w-4 h-4 inline mr-1" />
                            Additional KM: ₹{bike.additionalKmPrice}/km
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modern Booking Dates Card */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg text-[#F47B20]">
                  Select Your Booking Dates & Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-4 lg:p-6">
                <ModernDateTimePicker
                  label="Pickup"
                  selectedDate={bookingParams.startDate}
                  selectedTime={bookingParams.startTime}
                  onDateChange={(date) =>
                    setBookingParams({ ...bookingParams, startDate: date })
                  }
                  onTimeChange={(time) =>
                    setBookingParams({ ...bookingParams, startTime: time })
                  }
                  minDate={tomorrow}
                  showTimeAfterDate={true}
                />

                <ModernDateTimePicker
                  label="Dropoff"
                  selectedDate={bookingParams.endDate}
                  selectedTime={bookingParams.endTime}
                  onDateChange={(date) =>
                    setBookingParams({ ...bookingParams, endDate: date })
                  }
                  onTimeChange={(time) =>
                    setBookingParams({ ...bookingParams, endTime: time })
                  }
                  minDate={bookingParams.startDate || tomorrow}
                  showTimeAfterDate={false}
                />

                {pricing.days > 0 && (
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-sm text-orange-800 font-medium">
                      📅 Total Duration:{" "}
                      <span className="font-bold">{pricing.days} day(s)</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Booking */}
          <div className="space-y-6">
            {/* Price Highlight Card */}
            <Card className="shadow-xl border-2 border-[#F47B20]">
              <CardHeader className="pb-3">
                <CardTitle className="text-center text-[#F47B20]">
                  Total Price
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  ₹{pricing.total.toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">
                  for {pricing.days} day(s)
                </p>
                <div className="mt-4 p-3 bg-white rounded-lg border space-y-1">
                  <div className="text-sm text-gray-600">
                    Base: ₹{pricing.basePrice} × {pricing.days} = ₹
                    {pricing.subtotal}
                  </div>
                  {/* {pricing.searchExtraCharges > 0 && (
                    <div className="text-sm text-orange-600">
                      Extra charges: ₹{pricing.searchExtraCharges}
                    </div>
                  )} */}
                  {pricing.timeExtraCharges > 0 && (
                    <div className="text-sm text-orange-600">
                      Time charges: ₹{pricing.timeExtraCharges}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Taxes (18%): ₹{pricing.taxes}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary */}
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vehicle</span>
                    <span className="font-medium">{bike.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">KM Package</span>
                    <span className="font-medium">
                      {selectedKmOption === "limited"
                        ? `${bike.pricePerDay?.limitedKm?.kmLimit || 60} km`
                        : "Unlimited"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pickup</span>
                    <span className="font-medium text-right">
                      {bookingParams.startDate && bookingParams.startTime
                        ? `${bookingParams.startDate.toLocaleDateString()} at ${
                            bookingParams.startTime
                          }`
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dropoff</span>
                    <span className="font-medium text-right">
                      {bookingParams.endDate && bookingParams.endTime
                        ? `${bookingParams.endDate.toLocaleDateString()} at ${
                            bookingParams.endTime
                          }`
                        : "Not selected"}
                    </span>
                  </div>
                </div>

                <Separator />

                {/* Terms & Conditions - Highlighted */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      className="mt-1 border-yellow-400 data-[state=checked]:bg-yellow-500"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="terms"
                        className="text-sm font-medium text-yellow-800 cursor-pointer"
                      >
                        I agree to the Terms & Conditions
                      </label>
                      <p className="text-xs text-yellow-700 mt-1">
                        By checking this box, you agree to our{" "}
                        <Link
                          href="/terms"
                          className="underline hover:text-yellow-900"
                        >
                          Terms & Conditions
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          className="underline hover:text-yellow-900"
                        >
                          Privacy Policy
                        </Link>
                      </p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                  onClick={handleProceedToPay}
                  disabled={
                    bookingLoading ||
                    !agreedToTerms ||
                    !bookingParams.startDate ||
                    !bookingParams.endDate
                  }
                >
                  {bookingLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Proceed to Pay"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer />
    </div>
  );
}
