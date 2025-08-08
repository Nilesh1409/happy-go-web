"use client";
import { Suspense, useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  Calendar,
  ArrowLeft,
  X,
  Clock,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  Star,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import LoginModal from "@/components/login-modal";
import { apiService } from "@/lib/api";
import ModernDateTimePicker from "../../components/modern-date-time-picker";

// Utility functions
const formatCompactDateTime = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date?.toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  });
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
};

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hour, minute] = timeStr.split(":");
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? "PM" : "AM";
  const displayHour =
    hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
  return `${displayHour}:${minute} ${ampm}`;
};

const formatDate = (date) => {
  if (!date) return "";
  return date?.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format date for API in IST without timezone conversion
const formatDateForAPI = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Pricing logic utility
const getPricingOptions = (bike) => {
  const options = [];

  // Limited km option - only if priceLimited exists and is not null
  if (bike?.priceLimited?.breakdown) {
    const limitedKm = bike.priceLimited.breakdown.pricePerUnit
      ? bike.pricePerDay?.limitedKm?.kmLimit ||
        bike.pricePerDay?.weekday?.limitedKm?.kmLimit ||
        60
      : 60;

    options.push({
      type: "limited",
      price: bike.priceLimited.breakdown.subtotal,
      kmLimit: limitedKm,
      label: `${limitedKm} km`,
      duration: bike.priceLimited.breakdown.duration,
    });
  }

  // Unlimited km option - only if priceUnlimited exists and is not null
  if (bike?.priceUnlimited?.breakdown) {
    options.push({
      type: "unlimited",
      price: bike.priceUnlimited.breakdown.subtotal,
      kmLimit: "Unlimited",
      label: "Unlimited km",
      duration: bike.priceUnlimited.breakdown.duration,
    });
  }

  return options;
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
function SearchPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading search...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main export with Suspense wrapper
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

// Main search component that uses useSearchParams
function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // State management
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [bikeSelections, setBikeSelections] = useState({});
  const [cart, setCart] = useState({ items: [], totalItems: 0 });
  const [cartLoading, setCartLoading] = useState(false);
  const [quantities, setQuantities] = useState({}); // Track quantity for each bike
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingCartAction, setPendingCartAction] = useState(null); // Store pending cart action

  const [filters, setFilters] = useState({
    sortBy: "relevance",
    priceRange: "all",
    brand: "all",
  });

  // Calculate initial times
  const initialPickupDate = parseDate(searchParams.get("pickupDate"));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isPickupToday =
    initialPickupDate &&
    initialPickupDate.toDateString() === today.toDateString();

  const initialPickupTime =
    searchParams.get("pickupTime") ||
    (isPickupToday ? getNext30MinBlock() : "08:00");

  const initialDropoffDate =
    parseDate(searchParams.get("dropoffDate")) || initialPickupDate;
  const isSameDay =
    initialPickupDate &&
    initialDropoffDate &&
    initialPickupDate.toDateString() === initialDropoffDate.toDateString();

  const initialDropoffTime =
    searchParams.get("dropoffTime") ||
    (isSameDay ? add30Minutes(initialPickupTime) : "20:00");

  const [searchData, setSearchData] = useState({
    startDate: initialPickupDate,
    endDate: initialDropoffDate,
    startTime: initialPickupTime,
    endTime: initialDropoffTime,
    location: searchParams.get("location") || "Chikkamagaluru",
  });

  // Calculate extra charges based on time
  const calculateExtraCharges = useCallback((time, type) => {
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
  }, []);

  // Memoized extra charges calculation
  const extraCharges = useMemo(() => {
    const pickupExtra = calculateExtraCharges(searchData.startTime, "pickup");
    const dropoffExtra = calculateExtraCharges(searchData.endTime, "dropoff");
    return pickupExtra + dropoffExtra;
  }, [searchData.startTime, searchData.endTime, calculateExtraCharges]);

  // Load available bikes
  const loadAvailableBikes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: formatDateForAPI(searchData.startDate),
        endDate: formatDateForAPI(searchData.endDate),
        startTime: searchData.startTime,
        endTime: searchData.endTime,
        location: searchData.location,
      };

      const response = await apiService.searchBikes(params);
      const bikesData = response.data || [];
      setBikes(bikesData);

      // Initialize selections for bikes
      const initialSelections = bikesData.reduce((acc, bike) => {
        const pricingOptions = getPricingOptions(bike);
        const defaultOption = pricingOptions[0]; // Use first available option

        if (defaultOption) {
          acc[bike._id] = {
            price: defaultOption.price,
            km: defaultOption.kmLimit,
            type: defaultOption.type,
            duration: defaultOption.duration,
            extraAmount: extraCharges,
          };
        }
        return acc;
      }, {});

      // Initialize quantities for all bikes
      const initialQuantities = bikesData.reduce((acc, bike) => {
        acc[bike._id] = 1;
        return acc;
      }, {});

      setBikeSelections(initialSelections);
      setQuantities(initialQuantities);
    } catch (error) {
      console.error("Failed to load bikes:", error);
      setError("Failed to load bikes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [searchData, extraCharges]);

  // Update extra charges when times change
  useEffect(() => {
    setBikeSelections((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bikeId) => {
        updated[bikeId] = {
          ...updated[bikeId],
          extraAmount: extraCharges,
        };
      });
      return updated;
    });
  }, [extraCharges]);

  const formatCompactDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getAvailabilityStatus = (bike) => {
    if (bike.availableQuantity > 5)
      return { color: "bg-emerald-500", text: "In Stock", icon: CheckCircle2 };
    if (bike.availableQuantity > 0)
      return { color: "bg-amber-500", text: "Limited", icon: AlertCircle };
    return { color: "bg-red-500", text: "Out of Stock", icon: Clock };
  };

  // Cart management functions
  const loadCart = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const params = {
        startDate: formatDateForAPI(searchData.startDate),
        endDate: formatDateForAPI(searchData.endDate),
        startTime: searchData.startTime,
        endTime: searchData.endTime,
      };

      const response = await apiService.getCart(params);
      if (response.success) {
        setCart(response.data);
        // Count total items in cart
        const totalItems =
          response.data.items?.reduce((sum, item) => sum + item.quantity, 0) ||
          0;
        setCart((prev) => ({ ...prev, totalItems }));
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  }, [searchData]);

  const addToCart = useCallback(
    async (bikeId, quantity = 1) => {
      try {
        setCartLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          // Store the pending action and show login modal
          setPendingCartAction({ bikeId, quantity });
          setShowLoginModal(true);
          return;
        }

        const selection = bikeSelections[bikeId];
        if (!selection) {
          throw new Error("Please select a pricing option");
        }

        const payload = {
          bikeId,
          quantity,
          kmOption: selection.type,
          startDate: formatDateForAPI(searchData.startDate),
          endDate: formatDateForAPI(searchData.endDate),
          startTime: searchData.startTime,
          endTime: searchData.endTime,
        };

        const response = await apiService.addToCart(payload);

        if (response.success) {
          // Update cart state
          setCart(response.data);
          const totalItems =
            response.data.items?.reduce(
              (sum, item) => sum + item.quantity,
              0
            ) || 0;
          setCart((prev) => ({ ...prev, totalItems }));

          // Reset quantity for this bike
          setQuantities((prev) => ({ ...prev, [bikeId]: 1 }));

          // Show success message (you might want to use a toast instead of alert)
          alert(response.message || "Added to cart successfully!");
        } else {
          throw new Error(response.message || "Failed to add to cart");
        }
      } catch (error) {
        console.error("Failed to add to cart:", error);

        // Handle specific error cases
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setPendingCartAction({ bikeId, quantity });
          setShowLoginModal(true);
          return;
        }

        alert(
          error.response?.data?.message ||
            error.message ||
            "Failed to add to cart"
        );
      } finally {
        setCartLoading(false);
      }
    },
    [bikeSelections, searchData]
  );

  const updateQuantity = useCallback(
    (bikeId, quantity) => {
      if (quantity < 1) quantity = 1;
      const bike = bikes.find((b) => b._id === bikeId);
      if (bike && quantity > bike.availableQuantity) {
        quantity = bike.availableQuantity;
      }
      setQuantities((prev) => ({ ...prev, [bikeId]: quantity }));
    },
    [bikes]
  );

  // Login modal handlers
  const handleLoginSuccess = useCallback(async () => {
    setShowLoginModal(false);

    // Reload cart after login
    await loadCart();

    // Execute pending cart action if exists
    if (pendingCartAction) {
      const { bikeId, quantity } = pendingCartAction;
      setPendingCartAction(null);

      // Add a small delay to ensure token is properly set
      setTimeout(() => {
        addToCart(bikeId, quantity);
      }, 100);
    }
  }, [pendingCartAction, addToCart, loadCart]);
  const handleLoginModalClose = useCallback(() => {
    setShowLoginModal(false);
    setPendingCartAction(null);
    setCartLoading(false); // Reset loading state
  }, []);

  // Load cart on component mount
  useEffect(() => {
    loadCart();
  }, [loadCart]);

  // Handle pickup date changes to update time if needed
  useEffect(() => {
    if (!searchData.startDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday =
      searchData.startDate.toDateString() === today.toDateString();

    // If pickup date is today, validate pickup time against current time
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Convert current time and selected time to minutes for comparison
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      const selectedTimeMinutes = searchData.startTime
        ? parseInt(searchData.startTime.split(":")[0]) * 60 +
          parseInt(searchData.startTime.split(":")[1])
        : 0;

      // If selected time is in the past or too close, update to next available slot
      if (selectedTimeMinutes <= currentTimeMinutes + 30) {
        const nextTime = getNext30MinBlock();
        setSearchData((prev) => ({
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
  }, [searchData.startDate, searchData.startTime]);

  // Handle pickup time changes to update drop-off time if same day
  useEffect(() => {
    if (
      !searchData.startDate ||
      !searchData.endDate ||
      !searchData.startTime ||
      !searchData.endTime
    )
      return;

    const isSameDay =
      searchData.startDate.toDateString() === searchData.endDate.toDateString();

    if (isSameDay) {
      const timeToMinutes = (timeStr) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return hour * 60 + minute;
      };

      const pickupMinutes = timeToMinutes(searchData.startTime);
      const currentDropoffMinutes = timeToMinutes(searchData.endTime);

      // Only adjust if drop-off time is equal to or less than pickup time
      if (currentDropoffMinutes <= pickupMinutes) {
        const newDropoffTime = add30Minutes(searchData.startTime);
        setSearchData((prev) => ({
          ...prev,
          endTime: newDropoffTime,
        }));
      }
    }
  }, [
    searchData.startTime,
    searchData.startDate,
    searchData.endDate,
    searchData.endTime,
  ]);

  // Handle drop-off date changes to validate time restrictions
  useEffect(() => {
    if (
      !searchData.startDate ||
      !searchData.endDate ||
      !searchData.startTime ||
      !searchData.endTime
    )
      return;

    const isSameDay =
      searchData.startDate.toDateString() === searchData.endDate.toDateString();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isDropoffToday =
      searchData.endDate.toDateString() === today.toDateString();

    if (isSameDay) {
      const timeToMinutes = (timeStr) => {
        const [hour, minute] = timeStr.split(":").map(Number);
        return hour * 60 + minute;
      };

      const pickupMinutes = timeToMinutes(searchData.startTime);
      const dropoffMinutes = timeToMinutes(searchData.endTime);

      // Only adjust if drop-off time is equal to or less than pickup time
      if (dropoffMinutes <= pickupMinutes) {
        const newDropoffTime = add30Minutes(searchData.startTime);
        setSearchData((prev) => ({
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
        parseInt(searchData.endTime.split(":")[0]) * 60 +
        parseInt(searchData.endTime.split(":")[1]);

      if (dropoffTimeMinutes <= currentTimeMinutes + 30) {
        const nextTime = getNext30MinBlock();
        setSearchData((prev) => ({
          ...prev,
          endTime: nextTime,
        }));
      }
    }
  }, [
    searchData.endDate,
    searchData.startDate,
    searchData.startTime,
    searchData.endTime,
  ]);

  // Load bikes on mount and search params change
  useEffect(() => {
    loadAvailableBikes();
  }, [loadAvailableBikes]);

  // Sort bikes (filters removed for simplicity)
  const sortedBikes = useMemo(() => {
    return [...bikes].sort((a, b) => {
      const aSelection = bikeSelections[a._id];
      const bSelection = bikeSelections[b._id];

      switch (filters.sortBy) {
        case "price-low":
          const aTotalPrice = aSelection
            ? aSelection.price + aSelection.extraAmount
            : 0;
          const bTotalPrice = bSelection
            ? bSelection.price + bSelection.extraAmount
            : 0;
          return aTotalPrice - bTotalPrice;
        case "price-high":
          const aTotalPriceHigh = aSelection
            ? aSelection.price + aSelection.extraAmount
            : 0;
          const bTotalPriceHigh = bSelection
            ? bSelection.price + bSelection.extraAmount
            : 0;
          return bTotalPriceHigh - aTotalPriceHigh;
        default:
          return 0;
      }
    });
  }, [bikes, bikeSelections, filters.sortBy]);

  // Event handlers
  const handleBackClick = () => router.back();

  const applyFilters = () => {
    setMobileFiltersOpen(false);
    loadAvailableBikes();
  };

  const handlePriceChange = useCallback(
    (bikeId, price, kmType, kmLimit, duration) => {
      setBikeSelections((prev) => ({
        ...prev,
        [bikeId]: {
          price,
          km: kmLimit,
          type: kmType,
          duration,
          extraAmount: prev[bikeId]?.extraAmount || extraCharges,
        },
      }));
    },
    [extraCharges]
  );

  // Filter Component
  const FilterContent = ({ isMobile = false }) => (
    <div className="space-y-6">
      {isMobile && (
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
          <h3 className="font-bold text-xl text-gray-800">Filters & Search</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileFiltersOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      )}

      {!isMobile && (
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="font-bold text-xl text-gray-800">Filters & Search</h3>
          <p className="text-sm text-gray-600 mt-1">Refine your bike search</p>
        </div>
      )}

      <div className="space-y-6">
        {/* <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Sort by
          </label>
          <Select
            value={filters.sortBy}
            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
          >
            <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="price-low">Price - Low to High</SelectItem>
              <SelectItem value="price-high">Price - High to Low</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Pickup Date & Time
          </label>
          <ModernDateTimePicker
            label=""
            selectedDate={searchData.startDate}
            selectedTime={searchData.startTime}
            onDateChange={(date) => {
              const newSearchData = { ...searchData, startDate: date };

              // If drop-off date is before new pickup date, update it
              if (searchData.endDate && date > searchData.endDate) {
                newSearchData.endDate = date;
              }

              setSearchData(newSearchData);
            }}
            onTimeChange={(time) => {
              const newSearchData = { ...searchData, startTime: time };

              // If same day, only adjust drop-off time if it's equal to or less than new pickup time
              if (
                searchData.endDate &&
                searchData.startDate &&
                searchData.endTime &&
                searchData.endDate.toDateString() ===
                  searchData.startDate.toDateString()
              ) {
                const timeToMinutes = (timeStr) => {
                  const [hour, minute] = timeStr.split(":").map(Number);
                  return hour * 60 + minute;
                };

                const newPickupMinutes = timeToMinutes(time);
                const currentDropoffMinutes = timeToMinutes(searchData.endTime);

                // Only adjust if drop-off time is equal to or less than new pickup time
                if (currentDropoffMinutes <= newPickupMinutes) {
                  newSearchData.endTime = add30Minutes(time);
                }
              }

              setSearchData(newSearchData);
            }}
            minDate={new Date()}
            showTimeAfterDate={true}
            restrictCurrentTime={true}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Dropoff Date & Time
          </label>
          <ModernDateTimePicker
            label=""
            selectedDate={searchData.endDate}
            selectedTime={searchData.endTime}
            onDateChange={(date) => {
              const newSearchData = { ...searchData, endDate: date };

              // If same day as pickup, only adjust drop-off time if it's equal to or less than pickup time
              if (
                searchData.startDate &&
                searchData.startTime &&
                searchData.endTime &&
                date.toDateString() === searchData.startDate.toDateString()
              ) {
                const timeToMinutes = (timeStr) => {
                  const [hour, minute] = timeStr.split(":").map(Number);
                  return hour * 60 + minute;
                };

                const pickupMinutes = timeToMinutes(searchData.startTime);
                const dropoffMinutes = timeToMinutes(searchData.endTime);

                // Only adjust if drop-off time is equal to or less than pickup time
                if (dropoffMinutes <= pickupMinutes) {
                  newSearchData.endTime = add30Minutes(searchData.startTime);
                }
              }

              setSearchData(newSearchData);
            }}
            onTimeChange={(time) => {
              // Validate that drop-off time is at least 30 min after pickup if same day
              const isSameDay =
                searchData.startDate &&
                searchData.endDate &&
                searchData.startDate.toDateString() ===
                  searchData.endDate.toDateString();

              if (isSameDay && searchData.startTime) {
                const timeToMinutes = (timeStr) => {
                  const [hour, minute] = timeStr.split(":").map(Number);
                  return hour * 60 + minute;
                };

                const pickupMinutes = timeToMinutes(searchData.startTime);
                const dropoffMinutes = timeToMinutes(time);

                // Only prevent if drop-off is less than pickup + 30 minutes (not equal)
                if (dropoffMinutes < pickupMinutes + 30) {
                  return; // Don't update if invalid time selected
                }
              }

              setSearchData({ ...searchData, endTime: time });
            }}
            minDate={searchData.startDate || new Date()}
            showTimeAfterDate={true}
            isDropOff={true}
            pickupDate={searchData.startDate}
            pickupTime={searchData.startTime}
            restrictCurrentTime={true}
          />
        </div>

        {/* <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Search by location
          </label>
          <Input
            placeholder="Enter location"
            value={searchData.location}
            onChange={(e) =>
              setSearchData({ ...searchData, location: e.target.value })
            }
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div> */}

        {/* <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Price Range
          </label>
          <Select
            value={filters.priceRange}
            onValueChange={(value) =>
              setFilters({ ...filters, priceRange: value })
            }
          >
            <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500/20">
              <SelectValue placeholder="Select price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-500">₹0 - ₹500</SelectItem>
              <SelectItem value="500-1000">₹500 - ₹1000</SelectItem>
              <SelectItem value="1000-2000">₹1000 - ₹2000</SelectItem>
              <SelectItem value="2000+">₹2000+</SelectItem>
            </SelectContent>
          </Select>
        </div> */}

        {/* <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700">
            Brand
          </label>
          <Select
            value={filters.brand}
            onValueChange={(value) => setFilters({ ...filters, brand: value })}
          >
            <SelectTrigger className="border-gray-300 focus:border-orange-500 focus:ring-orange-500/20">
              <SelectValue placeholder="Select brand" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Brands</SelectItem>
              {availableBrands.map((brand) => (
                <SelectItem key={brand.value} value={brand.value}>
                  {brand.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}

        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={isMobile ? applyFilters : loadAvailableBikes}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              "Apply Filters"
            )}
          </Button>
          {/* <Button
            variant="outline"
            className="px-6 py-3 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            onClick={resetFilters}
          >
            Reset
          </Button> */}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Enhanced Mobile Header */}
      <div className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-white md:hidden">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackClick}
                className="text-white hover:bg-white/20 p-2 mr-3 rounded-full transition-all duration-200"
              >
                <ArrowLeft className="w-6 h-6" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Available Bikes</h1>
                <p className="text-sm text-orange-100">
                  in {searchData.location}
                </p>
              </div>
            </div>

            {/* Cart Icon */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-white hover:bg-white/20 p-2 rounded-full transition-all duration-200 relative"
            >
              <Link
                href={`/cart?${new URLSearchParams({
                  startDate: formatDateForAPI(searchData.startDate) || "",
                  endDate: formatDateForAPI(searchData.endDate) || "",
                  startTime: searchData.startTime || "",
                  endTime: searchData.endTime || "",
                }).toString()}`}
              >
                <ShoppingCart className="w-6 h-6" />
                {cart.totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {cart.totalItems}
                  </Badge>
                )}
              </Link>
            </Button>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-black shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Pickup
                </div>
                <div className="font-semibold text-sm">
                  {formatDate(searchData.startDate) || "Select Date"}
                </div>
                <div className="text-xs text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(searchData.startTime) || "Select Time"}
                </div>
              </div>

              <div className="w-px h-12 bg-gray-300 mx-3"></div>

              <div className="flex-1">
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Dropoff
                </div>
                <div className="font-semibold text-sm">
                  {formatDate(searchData.endDate) || "Select Date"}
                </div>
                <div className="text-xs text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(searchData.endTime) || "Select Time"}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileFiltersOpen(true)}
                className="bg-gray-800 hover:bg-gray-700 rounded-full p-3 ml-3 transition-all duration-200 transform hover:scale-105"
              >
                <Filter className="w-5 h-5 text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mobile Filter Modal */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out">
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="p-6">
                <FilterContent isMobile={true} />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Available Bikes in {searchData.location}
            </h1>
            <div className="flex items-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              {searchData.startDate && searchData.endDate
                ? `${formatDate(searchData.startDate)} to ${formatDate(
                    searchData.endDate
                  )}`
                : "Choose your dates to see availability"}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Button
              variant="outline"
              size="lg"
              asChild
              className="border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-200 relative"
            >
              <Link
                href={`/cart?${new URLSearchParams({
                  startDate: formatDateForAPI(searchData.startDate) || "",
                  endDate: formatDateForAPI(searchData.endDate) || "",
                  startTime: searchData.startTime || "",
                  endTime: searchData.endTime || "",
                }).toString()}`}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Cart
                {cart.totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center p-0">
                    {cart.totalItems}
                  </Badge>
                )}
              </Link>
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setShowFilters(!showFilters)}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 transition-all duration-200"
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Fixed Desktop Layout */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar */}
          <div
            className={`hidden lg:block transition-all duration-300 ${
              showFilters ? "w-80" : "w-0 overflow-hidden"
            }`}
          >
            <div className="sticky top-6">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <FilterContent />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Bikes Grid */}
          <div className="flex-1 transition-all duration-300">
            {/* Disclaimer */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                *All prices are exclusive of taxes and fuel. Images used for
                representation purposes only, actual prices may vary.
              </p>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse shadow-lg">
                    <CardContent className="p-0">
                      <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                      <div className="p-4 space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-8 bg-gray-200 rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              //  {/* Enhanced Bikes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6">
                {sortedBikes.map((bike) => {
                  const pricingOptions = getPricingOptions(bike);
                  const selection =
                    bikeSelections[bike._id] || pricingOptions[0];
                  const totalPrice = selection ? selection.price : 0;
                  const availabilityStatus = getAvailabilityStatus(bike);
                  const StatusIcon = availabilityStatus.icon;

                  return (
                    <Card
                      key={bike._id}
                      className={`group relative overflow-hidden transition-all duration-300 bg-white border-0 shadow-lg hover:shadow-2xl hover:-translate-y-2 rounded-3xl ${
                        !bike.isAvailable ? "opacity-90" : ""
                      }`}
                    >
                      <CardContent className="p-0">
                        {/* Image Section with Enhanced Overlay */}
                        <div className="relative overflow-hidden h-42 sm:h-40 bg-gradient-to-br from-gray-50 via-white to-gray-100">
                          <Image
                            src={
                              bike.images?.[0] ||
                              "/placeholder.svg?height=300&width=400"
                            }
                            alt={bike.title}
                            fill
                            className="object-contain transition-all duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.target.src =
                                "/placeholder.svg?height=300&width=400";
                            }}
                          />

                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                          {/* Next Available Strip - Enhanced */}
                          {!bike.isAvailable && bike.nextAvailable && (
                            <div className="absolute inset-x-0 top-1/2 transform -translate-y-1/2">
                              <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-3 px-4 mx-4 rounded-2xl backdrop-blur-md bg-opacity-95 shadow-2xl border border-white/20">
                                <div className="flex items-center justify-center text-center">
                                  <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
                                  <div className="min-w-0">
                                    <div className="text-xs font-semibold opacity-90">
                                      Next Available
                                    </div>
                                    <div className="text-sm font-bold">
                                      {formatCompactDateTime(
                                        bike.nextAvailable
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Status Badges - Enhanced */}
                          <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-xl border-0 text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
                              Zero Deposit
                            </Badge>
                            {/* <div
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-xl backdrop-blur-sm ${availabilityStatus.color}`}
                            >
                              <StatusIcon className="w-3 h-3" />
                              <span>{availabilityStatus.text}</span>
                            </div> */}
                          </div>

                          {/* Rating Badge */}
                          {/* {bike.ratings && (
                            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2.5 py-1.5 rounded-full shadow-lg">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-xs font-bold text-gray-800">
                                {bike.ratings}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({bike.numReviews})
                              </span>
                            </div>
                          )} */}
                        </div>

                        {/* Content Section - Enhanced */}
                        <div className="p-3 sm:p-4">
                          {/* Title and Brand - Enhanced Typography */}
                          <div className="mb-3">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 mb-1.5 line-clamp-1 group-hover:text-orange-600 transition-colors duration-300">
                              {bike.title}
                            </h3>
                            <p className="text-sm text-gray-500 font-semibold mb-2">
                              {bike.brand} • {bike.model} • {bike.year}
                            </p>

                            {/* Availability with Enhanced Design */}
                            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-inner">
                              <div
                                className={`w-3 h-3 rounded-full ${availabilityStatus.color} animate-pulse shadow-lg`}
                              />
                              <span className="text-sm font-bold text-gray-700">
                                {bike.availableQuantity > 0
                                  ? `${bike.availableQuantity} available`
                                  : "Out of stock"}
                              </span>
                            </div>
                          </div>

                          {/* Pricing Options - Enhanced Design */}
                          {pricingOptions.length > 0 && (
                            <div className="mb-3">
                              <div className="text-xs font-bold text-gray-500 mb-3 text-center uppercase tracking-wider">
                                Choose Your Plan
                              </div>
                              <div className="flex flex-wrap gap-2 justify-center">
                                {pricingOptions.map((option) => (
                                  <Button
                                    key={option.type}
                                    size="sm"
                                    variant={
                                      selection?.type === option.type
                                        ? "default"
                                        : "outline"
                                    }
                                    className={`px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                                      selection?.type === option.type
                                        ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-xl scale-105 border-0"
                                        : "bg-white text-gray-700 hover:bg-orange-50 border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 shadow-md hover:shadow-lg"
                                    } ${!bike.isAvailable ? "opacity-50" : ""}`}
                                    onClick={() =>
                                      handlePriceChange(
                                        bike._id,
                                        option.price,
                                        option.type,
                                        option.kmLimit,
                                        option.duration
                                      )
                                    }
                                    disabled={!bike.isAvailable}
                                  >
                                    {option.label}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Elegant Divider */}
                          <div className="relative my-3">
                            <div className="absolute inset-0 flex items-center">
                              <div className="w-full border-t border-gradient-to-r from-transparent via-gray-200 to-transparent"></div>
                            </div>
                            <div className="relative flex justify-center">
                              <div className="bg-white px-4">
                                <div className="w-3 h-3 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full shadow-lg"></div>
                              </div>
                            </div>
                          </div>

                          {/* Price and Cart Actions - Enhanced */}
                          <div className="space-y-3">
                            {/* Price Display - Enhanced */}
                            <div className="text-center bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-2xl p-3 shadow-inner border border-orange-100">
                              <div
                                className={`text-xl sm:text-2xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent ${
                                  !bike.isAvailable ? "opacity-60" : ""
                                }`}
                              >
                                ₹{totalPrice?.toLocaleString()}
                              </div>
                              <div className="text-sm text-gray-600 font-semibold mt-1">
                                {selection?.duration || "per day"}
                              </div>
                            </div>

                            {/* Quantity Selector and Add to Cart - Enhanced */}
                            {bike.isAvailable && bike.availableQuantity > 0 ? (
                              <div className="space-y-3">
                                {/* Quantity Selector - Enhanced */}
                                <div className="flex items-center justify-center">
                                  <div className="flex items-center bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl p-2 shadow-inner">
                                    <button
                                      className="w-8 h-8 rounded-2xl bg-white shadow-lg flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-400"
                                      onClick={() =>
                                        updateQuantity(
                                          bike._id,
                                          (quantities[bike._id] || 1) - 1
                                        )
                                      }
                                      disabled={
                                        (quantities[bike._id] || 1) <= 1
                                      }
                                    >
                                      <Minus className="w-4 h-4" />
                                    </button>
                                    <div className="px-6 py-2 text-center">
                                      <div className="text-xl font-black text-gray-900">
                                        {quantities[bike._id] || 1}
                                      </div>
                                    </div>
                                    <button
                                      className="w-8 h-8 rounded-2xl bg-white shadow-lg flex items-center justify-center hover:bg-orange-50 hover:text-orange-600 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-gray-400"
                                      onClick={() =>
                                        updateQuantity(
                                          bike._id,
                                          (quantities[bike._id] || 1) + 1
                                        )
                                      }
                                      disabled={
                                        (quantities[bike._id] || 1) >=
                                        bike.availableQuantity
                                      }
                                    >
                                      <Plus className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>

                                {/* Add to Cart Button - Enhanced */}
                                <Button
                                  className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white rounded-2xl font-black text-sm py-3 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] active:scale-[0.98] border-0"
                                  onClick={() =>
                                    addToCart(
                                      bike._id,
                                      quantities[bike._id] || 1
                                    )
                                  }
                                  disabled={cartLoading}
                                >
                                  {cartLoading ? (
                                    <>
                                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                      Adding to Cart...
                                    </>
                                  ) : (
                                    <>
                                      <ShoppingCart className="w-5 h-5 mr-2" />
                                      ADD TO CART
                                    </>
                                  )}
                                </Button>
                              </div>
                            ) : (
                              <Button
                                className="w-full bg-gray-300 text-gray-600 cursor-not-allowed rounded-2xl font-black text-sm py-3 border-0"
                                disabled
                              >
                                <Clock className="w-5 h-5 mr-2" />
                                UNAVAILABLE
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* No Results State */}
            {!loading && sortedBikes.length === 0 && (
              <Card className="shadow-xl bg-white/90 backdrop-blur-sm border-0">
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-6">
                    <Calendar className="w-20 h-20 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">
                    No bikes available
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    No bikes are available for the selected dates and location.
                    Try different dates or location.
                  </p>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg transform transition-all duration-200 hover:scale-105"
                    asChild
                  >
                    <Link href="/">Search Again</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={handleLoginModalClose}
        onLoginSuccess={handleLoginSuccess}
      />

      <Footer />
    </div>
  );
}
