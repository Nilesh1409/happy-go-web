"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Star,
  MapPin,
  Fuel,
  Shield,
  AlertTriangle,
  Clock,
  Calendar,
  Info,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoginModal from "@/components/login-modal";
import ModernDateTimePicker from "@/components/modern-date-time-picker";
import { apiService } from "@/lib/api";

const formatDateForAPI = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function BikeDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Initialize selectedKmOption from URL params
  const [selectedKmOption, setSelectedKmOption] = useState(
    searchParams.get("kmOption") || "limited"
  );

  // Parse dates from URL params with better error handling
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      // Create date in local timezone to avoid UTC conversion issues
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day); // month is 0-indexed
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return "07:00";
    // Validate time format HH:MM
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr) ? timeStr : "07:00";
  };

  const [bookingParams, setBookingParams] = useState({
    startDate: parseDate(searchParams.get("startDate")),
    endDate: parseDate(searchParams.get("endDate")),
    startTime: parseTime(searchParams.get("startTime")),
    endTime: parseTime(searchParams.get("endTime")) || "18:00",
  });

  // Build back to search URL
  const buildBackToSearchUrl = useCallback(() => {
    const currentParams = new URLSearchParams(window.location.search);
    const searchParamsObj = {
      location: currentParams.get("location") || "",
      pickupDate: currentParams.get("startDate") || "",
      dropoffDate: currentParams.get("endDate") || "",
      pickupTime: currentParams.get("startTime") || "",
      dropoffTime: currentParams.get("endTime") || "",
    };

    const filteredParams = Object.fromEntries(
      Object.entries(searchParamsObj).filter(
        ([_, value]) => value && value.trim() !== ""
      )
    );

    const queryString = new URLSearchParams(filteredParams).toString();
    return `/search${queryString ? `?${queryString}` : ""}`;
  }, []);

  // Debounced API call to prevent excessive requests
  const [debounceTimer, setDebounceTimer] = useState(null);

  const loadBikeDetails = useCallback(
    async (immediate = false) => {
      if (!params.id) return;

      // Clear existing timer
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const makeApiCall = async () => {
        try {
          setPricingLoading(true);
          setError("");

          const queryParams = {};

          // Only add date/time params if all required fields are present
          if (
            bookingParams.startDate &&
            bookingParams.endDate &&
            bookingParams.startTime &&
            bookingParams.endTime
          ) {
            queryParams.startDate = formatDateForAPI(bookingParams.startDate);
            queryParams.startTime = bookingParams.startTime;
            queryParams.endDate = formatDateForAPI(bookingParams.endDate);
            queryParams.endTime = bookingParams.endTime;
            queryParams.kmOption = selectedKmOption;
          }

          console.log("API Call Params:", queryParams); // Debug log

          const response = await apiService.getBikeDetails(
            params.id,
            queryParams
          );
          setBike(response.data);

          // Auto-select unlimited for weekend bookings if limited is currently selected
          if (
            response.data.pricing?.isWeekendBooking &&
            selectedKmOption === "limited"
          ) {
            setSelectedKmOption("unlimited");
          }
        } catch (error) {
          console.error("Failed to load bike details:", error);
          setError("Failed to load bike details. Please try again.");
        } finally {
          setLoading(false);
          setPricingLoading(false);
        }
      };

      if (immediate) {
        await makeApiCall();
      } else {
        // Debounce API calls by 500ms
        const timer = setTimeout(makeApiCall, 500);
        setDebounceTimer(timer);
      }
    },
    [params.id, bookingParams, selectedKmOption, debounceTimer]
  );

  // Initial load
  useEffect(() => {
    loadBikeDetails(true);
  }, []);

  // Load bike details when booking params change (debounced)
  useEffect(() => {
    if (
      bookingParams.startDate &&
      bookingParams.endDate &&
      bookingParams.startTime &&
      bookingParams.endTime
    ) {
      loadBikeDetails(false);
    }
  }, [bookingParams, selectedKmOption]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleBookingParamChange = useCallback((key, value) => {
    setBookingParams((prev) => {
      const newParams = { ...prev, [key]: value };

      // Auto-adjust end date if start date is after end date
      if (
        key === "startDate" &&
        value &&
        prev.endDate &&
        value > prev.endDate
      ) {
        const nextDay = new Date(value);
        nextDay.setDate(nextDay.getDate() + 1);
        newParams.endDate = nextDay;
      }

      return newParams;
    });
    setError(""); // Clear any existing errors
  }, []);

  const handleKmOptionChange = useCallback((option) => {
    setSelectedKmOption(option);
    setError("");
  }, []);

  const getPricingDisplay = useCallback(() => {
    if (!bike?.pricing) {
      return {
        totalPrice: 0,
        breakdown: {
          type: "standard",
          duration: "0 day(s)",
          basePrice: 0,
          extraCharges: 0,
          subtotal: 0,
          gst: 0,
          total: 0,
        },
        isWeekendBooking: false,
      };
    }

    return bike.pricing;
  }, [bike?.pricing]);

  const validateBookingData = useCallback(() => {
    if (!agreedToTerms) {
      return "Please agree to the Terms & Conditions";
    }

    if (!bookingParams.startDate || !bookingParams.endDate) {
      return "Please select booking dates";
    }

    if (!bookingParams.startTime || !bookingParams.endTime) {
      return "Please select booking times";
    }

    if (bookingParams.startDate >= bookingParams.endDate) {
      if (
        bookingParams.startDate.toDateString() ===
        bookingParams.endDate.toDateString()
      ) {
        // Same day booking - check times
        if (bookingParams.startTime >= bookingParams.endTime) {
          return "End time must be after start time for same-day bookings";
        }
      } else {
        return "End date must be after start date";
      }
    }

    if (!bike?.availableQuantity || bike.availableQuantity <= 0) {
      return "This bike is not available for the selected dates";
    }

    return null;
  }, [agreedToTerms, bookingParams, bike?.availableQuantity]);

  const handleProceedToPay = useCallback(async () => {
    const validationError = validateBookingData();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setShowLoginModal(true);
      return;
    }

    await proceedWithBooking();
  }, [validateBookingData]);

  const proceedWithBooking = useCallback(async () => {
    setBookingLoading(true);
    setError("");

    try {
      const pricing = getPricingDisplay();

      const bookingData = {
        bookingType: "bike",
        bikeId: bike._id,
        startDate: formatDateForAPI(bookingParams.startDate),
        endDate: formatDateForAPI(bookingParams.endDate),
        startTime: bookingParams.startTime,
        endTime: bookingParams.endTime,
        kmOption: selectedKmOption,
        priceDetails: {
          basePrice: pricing.breakdown.basePrice,
          extraCharges: pricing.breakdown.extraCharges,
          subtotal: pricing.breakdown.subtotal,
          taxes: pricing.breakdown.gst,
          totalAmount: pricing.breakdown.total,
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

      const response = await apiService.createBooking(bookingData);
      router.push(`/payment/${response.data._id}`);
    } catch (error) {
      console.error("Booking creation failed:", error);
      setError(error.message || "Booking creation failed. Please try again.");
    } finally {
      setBookingLoading(false);
    }
  }, [bike, bookingParams, selectedKmOption, getPricingDisplay, router]);

  const handleLoginSuccess = useCallback(() => {
    setShowLoginModal(false);
    proceedWithBooking();
  }, [proceedWithBooking]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading bike details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Bike not found state
  if (!bike) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="shadow-lg">
            <CardContent className="p-8 text-center">
              <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-4">Bike Not Found</h2>
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

  const pricing = getPricingDisplay();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Header Navigation - Ultra Compact Mobile */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-10 sm:h-16">
            {/* Mobile: Floating back button */}
            <Link
              href={buildBackToSearchUrl()}
              className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto rounded-full bg-gray-100 hover:bg-gray-200 sm:bg-transparent sm:hover:bg-transparent text-gray-600 hover:text-[#F47B20] transition-colors sm:mr-4"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" />
              <span className="hidden sm:inline font-medium">
                Back to Search
              </span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Important Notices - Mobile optimized */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* General Disclaimer */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <div className="flex items-start">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs sm:text-sm text-blue-800 font-medium mb-1">
                  Important Information
                </p>
                <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                  All prices are exclusive of fuel. Images are for
                  representation purposes only. Please verify bike condition
                  during pickup.
                </p>
              </div>
            </div>
          </div>

          {/* Availability Notice */}
          {bike.availableQuantity <= 3 && bike.availableQuantity > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-orange-800 font-medium mb-1">
                    Limited Availability
                  </p>
                  <p className="text-xs sm:text-sm text-orange-700 leading-relaxed">
                    Only {bike.availableQuantity} bike(s) available for your
                    selected dates. Book now to secure your reservation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* No Availability */}
          {bike.availableQuantity <= 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm text-red-800 font-medium mb-1">
                    Not Available
                  </p>
                  <p className="text-xs sm:text-sm text-red-700 leading-relaxed">
                    This bike is not available for your selected dates. Please
                    try different dates or choose another bike.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left Column - Bike Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bike Overview Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                  {/* Bike Image */}
                  <div className="lg:w-1/2">
                    <div className="relative bg-gray-50 rounded-xl p-3 sm:p-4 border">
                      <Image
                        src={
                          bike.images?.[0] ||
                          "/placeholder.svg?height=200&width=300"
                        }
                        alt={bike.title}
                        width={300}
                        height={200}
                        className="w-full h-40 sm:h-48 object-contain rounded-lg"
                        priority
                      />
                      {bike.availableQuantity <= 0 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                          <span className="text-white font-bold text-base sm:text-lg">
                            Not Available
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bike Info */}
                  <div className="lg:w-1/2">
                    <div className="mb-3 sm:mb-4">
                      <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                        {bike.title}
                      </h1>
                      <div className="flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3">
                        <div className="flex items-center">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          <span>{bike.location}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-yellow-400 fill-current" />
                            <span>
                              {bike.ratings} ({bike.numReviews} reviews)
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-green-500" />
                            <span className="text-green-600 font-medium">
                              {bike.availableQuantity} Available
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-4 sm:mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Features
                      </h3>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {bike.features?.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-1"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* KM Limit Selection - Mobile optimized */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Choose KM Package
                      </h3>
                      <div className="flex gap-2 sm:gap-3">
                        {/* Show limited km option only if it's NOT a weekend booking */}
                        {bike.pricePerDay?.limitedKm?.isActive &&
                          !pricing.isWeekendBooking && (
                            <Button
                              variant={
                                selectedKmOption === "limited"
                                  ? "default"
                                  : "outline"
                              }
                              className={`flex-1 h-auto p-2.5 sm:p-3 ${
                                selectedKmOption === "limited"
                                  ? "bg-[#F47B20] hover:bg-[#E06A0F] text-white border-[#F47B20]"
                                  : "border-gray-300 hover:border-[#F47B20] hover:text-[#F47B20]"
                              }`}
                              onClick={() => handleKmOptionChange("limited")}
                              disabled={bike.availableQuantity <= 0}
                            >
                              <div className="text-center">
                                <div className="font-semibold text-sm sm:text-base">
                                  {bike.pricePerDay.limitedKm.kmLimit || 60} km
                                </div>
                                <div className="text-xs opacity-80">
                                  Limited
                                </div>
                                <div className="text-xs font-medium">
                                  ₹{bike.pricePerDay.limitedKm.price}/day
                                </div>
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
                            className={`flex-1 h-auto p-2.5 sm:p-3 ${
                              selectedKmOption === "unlimited"
                                ? "bg-[#F47B20] hover:bg-[#E06A0F] text-white border-[#F47B20]"
                                : "border-gray-300 hover:border-[#F47B20] hover:text-[#F47B20]"
                            }`}
                            onClick={() => handleKmOptionChange("unlimited")}
                            disabled={bike.availableQuantity <= 0}
                          >
                            <div className="text-center">
                              <div className="font-semibold text-sm sm:text-base">
                                Unlimited
                              </div>
                              <div className="text-xs opacity-80">No limit</div>
                              <div className="text-xs font-medium">
                                ₹{bike.pricePerDay.unlimited.price}/day
                              </div>
                            </div>
                          </Button>
                        )}
                      </div>

                      {selectedKmOption === "limited" &&
                        bike.additionalKmPrice && (
                          <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <p className="text-xs sm:text-sm text-yellow-800">
                              <Fuel className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                              Additional KM charges: ₹{bike.additionalKmPrice}
                              /km beyond the limit
                            </p>
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Dates Card */}
            <Card className="shadow-lg border-0 bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg text-[#F47B20] flex items-center">
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Select Your Booking Dates & Times
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <ModernDateTimePicker
                  label="Pickup"
                  selectedDate={bookingParams.startDate}
                  selectedTime={bookingParams.startTime}
                  onDateChange={(date) =>
                    handleBookingParamChange("startDate", date)
                  }
                  onTimeChange={(time) =>
                    handleBookingParamChange("startTime", time)
                  }
                  minDate={tomorrow}
                  showTimeAfterDate={true}
                />

                <ModernDateTimePicker
                  label="Dropoff"
                  selectedDate={bookingParams.endDate}
                  selectedTime={bookingParams.endTime}
                  onDateChange={(date) =>
                    handleBookingParamChange("endDate", date)
                  }
                  onTimeChange={(time) =>
                    handleBookingParamChange("endTime", time)
                  }
                  minDate={bookingParams.startDate || tomorrow}
                  showTimeAfterDate={false}
                  isDropOff={true}
                  pickupDate={bookingParams.startDate}
                  pickupTime={bookingParams.startTime}
                />

                {pricing.breakdown.duration && (
                  <div className="border rounded-lg p-3 sm:p-4 bg-gray-50 border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium flex items-center text-sm sm:text-base">
                          <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          {pricing.breakdown.duration}
                        </p>
                      </div>
                      {pricingLoading && (
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-[#F47B20]"></div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Pricing & Booking - Mobile optimized */}
          <div className="space-y-2 sm:space-y-2">
            {/* Price Highlight Card - Mobile Ultra Compact */}
            <Card className="shadow-xl border-2 sm:py-0 py-2 border-[#F47B20] bg-white">
              <CardContent className="py-2 p-3 sm:p-2">
                {/* Mobile: Inline layout, Desktop: Stacked */}
                <div className="flex items-center justify-between sm:block sm:text-center">
                  <div className="sm:mb-2">
                    <div className="text-base sm:text-lg text-[#F47B20] font-medium sm:mb-1">
                      Total Price
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold text-gray-900">
                      ₹{pricing.totalPrice.toLocaleString()}
                    </div>
                    <p className="text-sm sm:text-sm text-gray-600 hidden sm:block">
                      {pricing.breakdown.duration}
                    </p>
                  </div>

                  {/* Mobile: Compact breakdown beside price */}
                  <div className="text-sm text-right sm:hidden">
                    <div className="text-gray-600">
                      {pricing.breakdown.duration}
                    </div>
                    <div className="text-gray-600">
                      Base: ₹
                      {pricing.breakdown.basePrice?.toLocaleString() || 0}
                    </div>
                    {pricing.breakdown.extraCharges > 0 && (
                      <div className="text-orange-600">
                        Extra: ₹
                        {pricing.breakdown.extraCharges?.toLocaleString()}
                      </div>
                    )}
                    <div className="text-gray-600">
                      GST: ₹{pricing.breakdown.gst?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                {/* Desktop: Full breakdown */}
                <div className="hidden sm:block p-4 bg-gray-50 rounded-lg border space-y-2 text-left mt-4">
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>Base Price:</span>
                    <span>
                      ₹{pricing.breakdown.basePrice?.toLocaleString() || 0}
                    </span>
                  </div>

                  {pricing.breakdown.extraCharges > 0 && (
                    <div className="text-sm text-orange-600 flex justify-between">
                      <span>Extra Charges:</span>
                      <span>
                        ₹{pricing.breakdown.extraCharges?.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Separator className="my-2" />

                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>Subtotal:</span>
                    <span>
                      ₹{pricing.breakdown.subtotal?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>GST (5%):</span>
                    <span>₹{pricing.breakdown.gst?.toLocaleString() || 0}</span>
                  </div>

                  <Separator className="my-2" />

                  <div className="text-sm font-bold flex justify-between text-[#F47B20]">
                    <span>Total Amount:</span>
                    <span>
                      ₹{pricing.breakdown.total?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Summary - Mobile Ultra Compact */}
            <Card className="shadow-lg border-0 bg-white">
              <CardContent className="p-3 sm:p-6">
                {/* Mobile: Grid layout, Desktop: List */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:space-y-3 sm:block text-sm sm:text-sm">
                  <div className="sm:flex sm:justify-between">
                    <span className="text-gray-600 block sm:inline font-medium">
                      Vehicle:
                    </span>
                    <span className="font-semibold text-right sm:text-left">
                      {bike.title}
                    </span>
                  </div>

                  <div className="sm:flex sm:justify-between">
                    <span className="text-gray-600 block sm:inline font-medium">
                      Location:
                    </span>
                    <span className="font-semibold text-right sm:text-left">
                      {bike.location}
                    </span>
                  </div>

                  <div className="sm:flex sm:justify-between">
                    <span className="text-gray-600 block sm:inline font-medium">
                      KM Package:
                    </span>
                    <span className="font-semibold text-right sm:text-left">
                      {selectedKmOption === "limited"
                        ? `${bike.pricePerDay?.limitedKm?.kmLimit || 60} km`
                        : "Unlimited"}
                    </span>
                  </div>

                  <div className="sm:flex sm:justify-between">
                    <span className="text-gray-600 block sm:inline font-medium">
                      Duration:
                    </span>
                    <span className="font-semibold text-right sm:text-left">
                      {pricing.breakdown.duration}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 sm:flex sm:justify-between">
                    <span className="text-gray-600 block sm:inline font-medium">
                      Pickup:
                    </span>
                    <span className="font-semibold text-right sm:text-left">
                      {bookingParams.startDate && bookingParams.startTime
                        ? `${bookingParams.startDate.toLocaleDateString()} ${
                            bookingParams.startTime
                          }`
                        : "Not selected"}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 sm:flex sm:justify-between">
                    <span className="text-gray-600 block sm:inline font-medium">
                      Dropoff:
                    </span>
                    <span className="font-semibold text-right sm:text-left">
                      {bookingParams.endDate && bookingParams.endTime
                        ? `${bookingParams.endDate.toLocaleDateString()} ${
                            bookingParams.endTime
                          }`
                        : "Not selected"}
                    </span>
                  </div>
                </div>

                <Separator className="my-2 sm:my-4" />

                {/* Terms & Conditions - Mobile Ultra Compact */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      className="mt-0.5 border-yellow-400 data-[state=checked]:bg-yellow-500 h-4 w-4 sm:h-4 sm:w-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <label
                        htmlFor="terms"
                        className="text-sm sm:text-sm font-medium text-yellow-800 cursor-pointer block"
                      >
                        I agree to the{" "}
                        <Link href="/terms" className="underline">
                          Terms
                        </Link>
                        {" & "}
                        <Link href="/privacy" className="underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1.5 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-sm mt-2">
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    {error}
                  </div>
                )}

                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-10 sm:h-12 text-sm sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2 sm:mt-4"
                  onClick={handleProceedToPay}
                  disabled={
                    bookingLoading ||
                    pricingLoading ||
                    !agreedToTerms ||
                    !bookingParams.startDate ||
                    !bookingParams.endDate ||
                    !bookingParams.startTime ||
                    !bookingParams.endTime ||
                    bike.availableQuantity <= 0
                  }
                >
                  {bookingLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-b-2 border-white mr-1 sm:mr-2"></div>
                      <span className="hidden sm:inline">Processing...</span>
                      <span className="sm:hidden">Processing...</span>
                    </div>
                  ) : bike.availableQuantity <= 0 ? (
                    "Not Available"
                  ) : (
                    <>
                      <span className="sm:hidden">
                        Pay ₹{pricing.totalPrice.toLocaleString()}
                      </span>
                      <span className="hidden sm:inline">
                        Proceed to Pay ₹{pricing.totalPrice.toLocaleString()}
                      </span>
                    </>
                  )}
                </Button>

                {bike.availableQuantity > 0 && (
                  <p className="text-sm text-gray-500 text-center mt-1 sm:mt-2 sm:block">
                    Secure payment • No hidden charges
                  </p>
                )}
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
