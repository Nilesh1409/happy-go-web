"use client";

import { Suspense, useState, useEffect, useCallback, useRef } from "react";
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
import { toast } from "@/lib/toast";

const formatDateForAPI = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Utility function to get next 30-minute time slot
const getNext30MinBlock = () => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  let startHour, startMinute;

  if (currentHour < 5) {
    startHour = 5;
    startMinute = 0;
  } else {
    // Round up to next 30-minute slot
    if (currentMinute < 30) {
      startHour = currentHour;
      startMinute = 30;
    } else {
      startHour = currentHour + 1;
      startMinute = 0;
    }
  }

  // If beyond operating hours, start next day at 5:00
  if (startHour > 22 || (startHour === 22 && startMinute > 30)) {
    return "05:00";
  }

  return `${startHour.toString().padStart(2, "0")}:${startMinute
    .toString()
    .padStart(2, "0")}`;
};

// Utility function to add 30 minutes to a time string
const add30Minutes = (timeStr) => {
  if (!timeStr) return "08:30";
  const [hours, minutes] = timeStr.split(":").map(Number);
  let newMinutes = minutes + 30;
  let newHours = hours;

  if (newMinutes >= 60) {
    newMinutes -= 60;
    newHours += 1;
  }

  // If beyond 22:30, set to 22:30
  if (newHours > 22 || (newHours === 22 && newMinutes > 30)) {
    return "22:30";
  }

  return `${newHours.toString().padStart(2, "0")}:${newMinutes
    .toString()
    .padStart(2, "0")}`;
};

// Loading component for Suspense fallback
function BikeDetailsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bike details...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main bike detail component that uses useSearchParams
function BikeDetailsPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  // NEW: Ref to track if we're in the middle of a login process
  const isLoginInProgress = useRef(false);

  // NEW: State to preserve user data during login
  const [preservedBookingData, setPreservedBookingData] = useState(null);

  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [helmetQuantity, setHelmetQuantity] = useState(1);

  // Initialize selectedKmOption from URL params
  const [selectedKmOption, setSelectedKmOption] = useState(
    searchParams.get("kmOption") || "limited"
  );

  // Parse dates from URL params with better error handling
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const [year, month, day] = dateStr.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  };

  const parseTime = (timeStr) => {
    if (!timeStr) return "07:00";
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeStr) ? timeStr : "07:00";
  };

  const [bookingParams, setBookingParams] = useState({
    startDate: parseDate(searchParams.get("startDate")),
    endDate: parseDate(searchParams.get("endDate")),
    startTime: parseTime(searchParams.get("startTime")),
    endTime: parseTime(searchParams.get("endTime")) || "18:00",
  });
  console.log("bookingParams", bookingParams);

  // NEW: Function to preserve current user selections
  const preserveCurrentBookingData = useCallback(() => {
    const currentData = {
      bookingParams: { ...bookingParams },
      selectedKmOption,
      helmetQuantity,
      agreedToTerms,
    };
    setPreservedBookingData(currentData);
    console.log("Preserved booking data:", currentData);
    return currentData;
  }, [bookingParams, selectedKmOption, helmetQuantity, agreedToTerms]);

  // NEW: Function to restore preserved data
  const restorePreservedData = useCallback(() => {
    if (preservedBookingData) {
      console.log("Restoring preserved data:", preservedBookingData);
      setBookingParams(preservedBookingData.bookingParams);
      setSelectedKmOption(preservedBookingData.selectedKmOption);
      setHelmetQuantity(preservedBookingData.helmetQuantity);
      setAgreedToTerms(preservedBookingData.agreedToTerms);
      // Clear preserved data after restoration
      setPreservedBookingData(null);
    }
  }, [preservedBookingData]);

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

  const [debounceTimer, setDebounceTimer] = useState(null);

  // MODIFIED: Reset helmet quantity when dates change or bike changes, but not during login
  useEffect(() => {
    if (!isLoginInProgress.current) {
      setHelmetQuantity(1);
    }
  }, [bookingParams.startDate, bookingParams.endDate, params.id]);

  // Handle pickup date changes to update time if needed
  useEffect(() => {
    if (!bookingParams.startDate || isLoginInProgress.current) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday =
      bookingParams.startDate.toDateString() === today.toDateString();

    // If pickup date is today, validate pickup time against current time
    if (isToday && bookingParams.startTime) {
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const selectedTimeMinutes =
        parseInt(bookingParams.startTime.split(":")[0]) * 60 +
        parseInt(bookingParams.startTime.split(":")[1]);

      // If selected time is in the past or too close, update to next available slot
      if (selectedTimeMinutes <= currentTimeMinutes + 30) {
        const nextTime = getNext30MinBlock();
        setBookingParams((prev) => ({
          ...prev,
          startTime: nextTime,
          endTime:
            prev.endDate &&
            prev.startDate.toDateString() === prev.endDate.toDateString() &&
            prev.startTime === prev.endTime
              ? add30Minutes(nextTime)
              : prev.endTime,
        }));
      }
    }
  }, [bookingParams.startDate]);

  // Handle pickup time changes to update drop-off time if same day
  useEffect(() => {
    if (
      !bookingParams.startDate ||
      !bookingParams.endDate ||
      !bookingParams.startTime ||
      !bookingParams.endTime ||
      isLoginInProgress.current
    )
      return;

    const isSameDay =
      bookingParams.startDate.toDateString() ===
      bookingParams.endDate.toDateString();

    if (isSameDay) {
      const timeToMinutes = (timeStr) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return hour * 60 + minute;
      };

      const pickupMinutes = timeToMinutes(bookingParams.startTime);
      const currentDropoffMinutes = timeToMinutes(bookingParams.endTime);

      // Only adjust if drop-off time is equal to or less than pickup time
      if (currentDropoffMinutes <= pickupMinutes) {
        const newDropoffTime = add30Minutes(bookingParams.startTime);
        setBookingParams((prev) => ({
          ...prev,
          endTime: newDropoffTime,
        }));
      }
    }
  }, [bookingParams.startTime, bookingParams.startDate, bookingParams.endDate]);

  // Handle drop-off date changes to validate time restrictions
  useEffect(() => {
    if (
      !bookingParams.startDate ||
      !bookingParams.endDate ||
      !bookingParams.startTime ||
      !bookingParams.endTime ||
      isLoginInProgress.current
    )
      return;

    const isSameDay =
      bookingParams.startDate.toDateString() ===
      bookingParams.endDate.toDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isDropoffToday =
      bookingParams.endDate.toDateString() === today.toDateString();

    if (isSameDay) {
      const timeToMinutes = (timeStr) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return hour * 60 + minute;
      };

      const pickupMinutes = timeToMinutes(bookingParams.startTime);
      const dropoffMinutes = timeToMinutes(bookingParams.endTime);

      // Only adjust if drop-off time is equal to or less than pickup time
      if (dropoffMinutes <= pickupMinutes) {
        const newDropoffTime = add30Minutes(bookingParams.startTime);
        setBookingParams((prev) => ({
          ...prev,
          endTime: newDropoffTime,
        }));
      }
    }

    // If drop-off is today and time is in the past, update to next available time
    if (isDropoffToday && !isSameDay) {
      const now = new Date();
      const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
      const dropoffTimeMinutes =
        parseInt(bookingParams.endTime.split(":")[0]) * 60 +
        parseInt(bookingParams.endTime.split(":")[1]);

      if (dropoffTimeMinutes <= currentTimeMinutes + 30) {
        const nextTime = getNext30MinBlock();
        setBookingParams((prev) => ({
          ...prev,
          endTime: nextTime,
        }));
      }
    }
  }, [bookingParams.endDate]);

  const loadBikeDetails = useCallback(
    async (immediate = false) => {
      if (!params.id) return;

      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }

      const makeApiCall = async () => {
        try {
          setPricingLoading(true);
          setError("");

          const queryParams = {};

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

          const response = await apiService.getBikeDetails(
            params.id,
            queryParams
          );
          setBike(response.data);

          // MODIFIED: Auto-select unlimited for weekend bookings if limited is currently selected, but not during login
          if (
            response.data.pricing?.isWeekendBooking &&
            selectedKmOption === "limited" &&
            !isLoginInProgress.current
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

  // MODIFIED: Load bike details when booking params change (debounced), but not during login
  useEffect(() => {
    if (
      bookingParams.startDate &&
      bookingParams.endDate &&
      bookingParams.startTime &&
      bookingParams.endTime &&
      !isLoginInProgress.current
    ) {
      loadBikeDetails(false);
    }
  }, [bookingParams, selectedKmOption]);

  // NEW: Effect to restore data after login
  useEffect(() => {
    if (preservedBookingData && !isLoginInProgress.current) {
      restorePreservedData();
    }
  }, [preservedBookingData, restorePreservedData]);

  useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  const handleBookingParamChange = useCallback((key, value) => {
    // NEW: Don't update if login is in progress
    if (isLoginInProgress.current) return;

    setBookingParams((prev) => {
      const newParams = { ...prev, [key]: value };

      // Date validation
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

      // Time validation for pickup time changes
      if (
        key === "startTime" &&
        value &&
        prev.endDate &&
        prev.startDate &&
        prev.endTime
      ) {
        const isSameDay =
          prev.startDate.toDateString() === prev.endDate.toDateString();

        if (isSameDay) {
          const timeToMinutes = (timeStr) => {
            const [hour, minute] = timeStr.split(":").map(Number);
            return hour * 60 + minute;
          };

          const newPickupMinutes = timeToMinutes(value);
          const currentDropoffMinutes = timeToMinutes(prev.endTime);

          // Only adjust if drop-off time is equal to or less than new pickup time
          if (currentDropoffMinutes <= newPickupMinutes) {
            newParams.endTime = add30Minutes(value);
          }
        }
      }

      // Time validation for pickup date changes
      if (
        key === "startDate" &&
        value &&
        prev.endDate &&
        prev.startTime &&
        prev.endTime
      ) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = value.toDateString() === today.toDateString();

        // If pickup date is today, validate pickup time against current time
        if (isToday) {
          const now = new Date();
          const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
          const selectedTimeMinutes =
            parseInt(prev.startTime.split(":")[0]) * 60 +
            parseInt(prev.startTime.split(":")[1]);

          // If selected time is in the past or too close, update to next available slot
          if (selectedTimeMinutes <= currentTimeMinutes + 30) {
            const nextTime = getNext30MinBlock();
            newParams.startTime = nextTime;

            // If same day, also update drop-off time
            if (
              prev.endDate &&
              value.toDateString() === prev.endDate.toDateString()
            ) {
              newParams.endTime = add30Minutes(nextTime);
            }
          }
        }
      }

      // Time validation for drop-off date changes
      if (
        key === "endDate" &&
        value &&
        prev.startDate &&
        prev.startTime &&
        prev.endTime
      ) {
        const isSameDay =
          prev.startDate.toDateString() === value.toDateString();

        if (isSameDay) {
          const timeToMinutes = (timeStr) => {
            const [hour, minute] = timeStr.split(":").map(Number);
            return hour * 60 + minute;
          };

          const pickupMinutes = timeToMinutes(prev.startTime);
          const dropoffMinutes = timeToMinutes(prev.endTime);

          // Only adjust if drop-off time is equal to or less than pickup time
          if (dropoffMinutes <= pickupMinutes) {
            newParams.endTime = add30Minutes(prev.startTime);
          }
        }
      }

      // Time validation for drop-off time changes
      if (
        key === "endTime" &&
        value &&
        prev.startDate &&
        prev.endDate &&
        prev.startTime
      ) {
        const isSameDay =
          prev.startDate.toDateString() === prev.endDate.toDateString();

        if (isSameDay) {
          const timeToMinutes = (timeStr) => {
            const [hour, minute] = timeStr.split(":").map(Number);
            return hour * 60 + minute;
          };

          const pickupMinutes = timeToMinutes(prev.startTime);
          const dropoffMinutes = timeToMinutes(value);

          // Only allow if drop-off is at least 30 minutes after pickup
          if (dropoffMinutes < pickupMinutes + 30) {
            return prev; // Don't update if invalid time selected
          }
        }
      }

      return newParams;
    });
    setError("");
  }, []);

  const handleKmOptionChange = useCallback((option) => {
    // NEW: Don't update if login is in progress
    if (isLoginInProgress.current) return;

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
          helmetCharges: 0,
          subtotal: 0,
          gst: 0,
          total: 0,
        },
        isWeekendBooking: false,
      };
    }

    const freeHelmets = bike?.helmetInfo?.freeHelmetPerBooking || 1;
    const helmetPrice = bike?.helmetInfo?.pricePerHelmet || 60;
    const helmetCharges =
      helmetQuantity > freeHelmets
        ? (helmetQuantity - freeHelmets) * helmetPrice
        : 0;

    const updatedPricing = {
      ...bike.pricing,
      breakdown: {
        ...bike.pricing.breakdown,
        helmetCharges,
        subtotal: (bike.pricing.breakdown.subtotal || 0) + helmetCharges,
        total: (bike.pricing.breakdown.total || 0) + helmetCharges,
      },
      totalPrice: (bike.pricing.totalPrice || 0) + helmetCharges,
    };

    return updatedPricing;
  }, [bike?.pricing, helmetQuantity]);

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

  // MODIFIED: Handle proceed to pay with data preservation
  const handleProceedToPay = useCallback(async () => {
    const validationError = validateBookingData();
    if (validationError) {
      setError(validationError);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      // NEW: Preserve current data before showing login modal
      preserveCurrentBookingData();
      isLoginInProgress.current = true;
      setShowLoginModal(true);
      return;
    }

    await proceedWithBooking();
  }, [validateBookingData, preserveCurrentBookingData]);

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
          helmetCharges: pricing.breakdown.helmetCharges,
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
          helmetQuantity: helmetQuantity,
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
  }, [
    bike,
    bookingParams,
    selectedKmOption,
    helmetQuantity,
    getPricingDisplay,
    router,
  ]);

  // MODIFIED: Handle login success with data restoration
  const handleLoginSuccess = useCallback(() => {
    console.log("Login successful, restoring data...");
    setShowLoginModal(false);

    // NEW: Small delay to ensure login state is properly set
    setTimeout(() => {
      isLoginInProgress.current = false;
      restorePreservedData();

      // NEW: Small delay before proceeding with booking to ensure data is restored
      setTimeout(() => {
        proceedWithBooking();
      }, 100);
    }, 100);
  }, [restorePreservedData, proceedWithBooking]);

  // NEW: Handle login modal close (user cancels login)
  const handleLoginModalClose = useCallback(() => {
    setShowLoginModal(false);
    isLoginInProgress.current = false;
    // Keep preserved data in case user tries to login again
  }, []);

  // NEW: Modified helmet quantity handler to prevent updates during login
  const handleHelmetQuantityChange = useCallback((newQuantity) => {
    if (isLoginInProgress.current) return;
    setHelmetQuantity(newQuantity);
  }, []);

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
                    <div className="mb-4 sm:mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Choose KM Package
                      </h3>
                      <div className="flex gap-2 sm:gap-3">
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

                    {/* Helmet Selection */}
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 sm:mb-3 text-sm sm:text-base">
                        Add Helmets
                      </h3>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-3">
                        <div className="flex items-start">
                          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 sm:mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-xs sm:text-sm text-blue-800 font-medium mb-1">
                              Helmet Rental Available
                            </p>
                            <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                              {bike?.helmetInfo?.freeHelmetPerBooking || 1}{" "}
                              helmet FREE, additional helmets at ₹
                              {bike?.helmetInfo?.pricePerHelmet || 60} each
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
                        <div>
                          <span className="text-sm sm:text-base font-medium text-gray-900">
                            Number of Helmets
                          </span>
                          <div className="text-xs sm:text-sm text-gray-600 mt-1">
                            {helmetQuantity <=
                            (bike?.helmetInfo?.freeHelmetPerBooking || 1)
                              ? `${helmetQuantity} helmet - FREE`
                              : `${
                                  bike?.helmetInfo?.freeHelmetPerBooking || 1
                                } FREE + ${
                                  helmetQuantity -
                                  (bike?.helmetInfo?.freeHelmetPerBooking || 1)
                                } paid`}
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 rounded-full"
                            onClick={() =>
                              handleHelmetQuantityChange(
                                Math.max(0, helmetQuantity - 1)
                              )
                            }
                            disabled={
                              helmetQuantity <= 0 || bike.availableQuantity <= 0
                            }
                          >
                            -
                          </Button>

                          <span className="w-8 text-center font-medium text-sm sm:text-base">
                            {helmetQuantity}
                          </span>

                          <Button
                            variant="outline"
                            size="sm"
                            className="w-8 h-8 p-0 rounded-full"
                            onClick={() =>
                              handleHelmetQuantityChange(
                                Math.min(
                                  bike?.helmetInfo?.maxQuantity || 10,
                                  helmetQuantity + 1
                                )
                              )
                            }
                            disabled={
                              helmetQuantity >=
                                (bike?.helmetInfo?.maxQuantity || 10) ||
                              bike.availableQuantity <= 0
                            }
                          >
                            +
                          </Button>
                        </div>
                      </div>

                      {helmetQuantity > 1 && (
                        <div className="mt-2 sm:mt-3 p-2.5 sm:p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-xs sm:text-sm text-orange-800">
                            <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                            Additional helmet charges: ₹
                            {(helmetQuantity - 1) *
                              (bike?.helmetInfo?.pricePerHelmet || 60)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Booking Dates Card */}
            <Card className="shadow-lg border-0 bg-white gap-0">
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
                  minDate={new Date()}
                  showTimeAfterDate={true}
                  restrictCurrentTime={true}
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
                  minDate={bookingParams.startDate || new Date()}
                  showTimeAfterDate={false}
                  isDropOff={true}
                  pickupDate={bookingParams.startDate}
                  pickupTime={bookingParams.startTime}
                  restrictCurrentTime={true}
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

                  <div className="text-sm text-right sm:hidden">
                    <div className="text-gray-600">
                      {pricing.breakdown.duration}
                    </div>
                    <div className="text-gray-600">
                      Base: ₹
                      {pricing.breakdown.basePrice?.toLocaleString() || 0}
                    </div>
                    {pricing.breakdown.extraCharges > 0 && (
                      <div className="text-gray-600">
                        Extra: ₹
                        {pricing.breakdown.extraCharges?.toLocaleString()}
                      </div>
                    )}
                    {pricing.breakdown.helmetCharges > 0 && (
                      <div className="text-gray-600">
                        Helmet: ₹
                        {pricing.breakdown.helmetCharges?.toLocaleString()}
                      </div>
                    )}
                    <div className="text-gray-600">
                      GST ({pricing.breakdown.gstPercentage || 0}%): ₹
                      {pricing.breakdown.gst?.toLocaleString() || 0}
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block p-4 bg-gray-50 rounded-lg border space-y-2 text-left mt-4">
                  <div className="text-sm text-gray-600 flex justify-between">
                    <span>Base Price:</span>
                    <span>
                      ₹{pricing.breakdown.basePrice?.toLocaleString() || 0}
                    </span>
                  </div>

                  {pricing.breakdown.extraCharges > 0 && (
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>Extra Charges:</span>
                      <span>
                        ₹{pricing.breakdown.extraCharges?.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {pricing.breakdown.helmetCharges > 0 && (
                    <div className="text-sm text-gray-600 flex justify-between">
                      <span>Helmet Charges:</span>
                      <span>
                        ₹{pricing.breakdown.helmetCharges?.toLocaleString()}
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
                    <span>
                      GST (
                      {pricing.breakdown.gstPercentage?.toLocaleString() || 0}
                      %):
                    </span>
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
                <div className="space-y-3 text-sm sm:text-sm">
                  {/* Mobile: 2-column grid, Desktop: flexbox with justify-between */}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Vehicle:</span>
                    <span className="font-semibold ml-4 sm:ml-0">
                      {bike.title}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Location:</span>
                    <span className="font-semibold ml-4 sm:ml-0">
                      {bike.location}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      KM Package:
                    </span>
                    <span className="font-semibold ml-4 sm:ml-0">
                      {selectedKmOption === "limited"
                        ? `${bike.pricePerDay?.limitedKm?.kmLimit || 60} km`
                        : "Unlimited"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Duration:</span>
                    <span className="font-semibold ml-4 sm:ml-0">
                      {pricing.breakdown.duration}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Helmets:</span>
                    <span className="font-semibold ml-4 sm:ml-0">
                      {helmetQuantity > 0
                        ? `${helmetQuantity} helmet${
                            helmetQuantity !== 1 ? "s" : ""
                          }`
                        : "None"}
                    </span>
                  </div>

                  {helmetQuantity > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        Helmet Charges:
                      </span>
                      <span className="font-semibold ml-4 sm:ml-0">
                        {helmetQuantity <= 1
                          ? "FREE"
                          : `₹${(
                              (helmetQuantity - 1) *
                              (bike?.helmetInfo?.pricePerHelmet || 60)
                            ).toLocaleString()}`}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Pickup:</span>
                    <span className="font-semibold ml-4 sm:ml-0 flex-shrink-0">
                      {bookingParams.startDate && bookingParams.startTime
                        ? `${bookingParams.startDate.toLocaleDateString()} ${
                            bookingParams.startTime
                          }`
                        : "Not selected"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">Dropoff:</span>
                    <span className="font-semibold ml-4 sm:ml-0 flex-shrink-0">
                      {bookingParams.endDate && bookingParams.endTime
                        ? `${bookingParams.endDate.toLocaleDateString()} ${
                            bookingParams.endTime
                          }`
                        : "Not selected"}
                    </span>
                  </div>
                </div>

                <Separator className="my-2 sm:my-4" />

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
        onClose={handleLoginModalClose}
        onLoginSuccess={handleLoginSuccess}
        proceedWithBooking={proceedWithBooking}
      />

      <Footer />
    </div>
  );
}

// Main export with Suspense wrapper
export default function BikeDetailsPage() {
  return (
    <Suspense fallback={<BikeDetailsPageSkeleton />}>
      <BikeDetailsPageContent />
    </Suspense>
  );
}
