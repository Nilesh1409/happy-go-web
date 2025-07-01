"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Filter,
  Calendar,
  Star,
  ArrowLeft,
  X,
  MapPin,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";
import ModernDateTimePicker from "../../components/modern-date-time-picker";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sortBy: "relevance",
    priceRange: "all",
    brand: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Parse dates from URL params
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  const [searchData, setSearchData] = useState({
    startDate: parseDate(searchParams.get("pickupDate")),
    endDate: parseDate(searchParams.get("dropoffDate")),
    startTime: searchParams.get("pickupTime") || "",
    endTime: searchParams.get("dropoffTime") || "",
    location: searchParams.get("location") || "Chikkamagaluru",
  });

  // State to manage selected price and km for each bike
  const [bikeSelections, setBikeSelections] = useState({});

  useEffect(() => {
    loadAvailableBikes();
  }, [searchParams]);

  const handleBackClick = () => {
    router.back();
  };

  const loadAvailableBikes = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        startDate: searchData.startDate
          ? searchData.startDate.toISOString().split("T")[0]
          : "",
        endDate: searchData.endDate
          ? searchData.endDate.toISOString().split("T")[0]
          : "",
        startTime: searchData.startTime,
        endTime: searchData.endTime,
        location: searchData.location,
      };

      console.log("🚀 ~ loadAvailableBikes ~ params:", params);

      const response = await apiService.searchBikes(params);
      console.log("🚀 ~ loadAvailableBikes ~ response:", response);

      const bikesData = response.data || [];
      setBikes(bikesData);

      // Initialize selections for new bikes
      const initialSelections = bikesData.reduce((acc, bike) => {
        acc[bike._id] = {
          price: bike.pricePerDay?.limitedKm?.isActive
            ? bike.pricePerDay.limitedKm.price
            : bike.pricePerDay?.unlimited?.price || 0,
          km: bike.pricePerDay?.limitedKm?.isActive
            ? bike.pricePerDay.limitedKm.kmLimit
            : "Unlimited",
          type: bike.pricePerDay?.limitedKm?.isActive ? "limited" : "unlimited",
          extraAmount: 0,
        };
        return acc;
      }, {});
      setBikeSelections(initialSelections);
    } catch (error) {
      console.error("Failed to load bikes:", error);
      setError("Failed to load bikes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate extra charges based on time
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

  // Update extra charges when times change
  useEffect(() => {
    const pickupExtra = calculateExtraCharges(searchData.startTime, "pickup");
    const dropoffExtra = calculateExtraCharges(searchData.endTime, "dropoff");
    const totalExtra = pickupExtra + dropoffExtra;

    setBikeSelections((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((bikeId) => {
        updated[bikeId] = {
          ...updated[bikeId],
          extraAmount: totalExtra,
        };
      });
      return updated;
    });
  }, [searchData.startTime, searchData.endTime]);

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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

  // Apply filters to bikes
  const filteredBikes = bikes.filter((bike) => {
    // Price range filter
    if (filters.priceRange !== "all") {
      const currentSelection = bikeSelections[bike._id];
      const totalPrice = currentSelection
        ? currentSelection.price + currentSelection.extraAmount
        : 0;

      switch (filters.priceRange) {
        case "0-500":
          if (totalPrice > 500) return false;
          break;
        case "500-1000":
          if (totalPrice < 500 || totalPrice > 1000) return false;
          break;
        case "1000-2000":
          if (totalPrice < 1000 || totalPrice > 2000) return false;
          break;
        case "2000+":
          if (totalPrice < 2000) return false;
          break;
      }
    }

    // Brand filter
    if (filters.brand !== "all") {
      if (bike.brand?.toLowerCase() !== filters.brand.toLowerCase())
        return false;
    }

    return true;
  });

  // Sort filtered bikes
  const sortedBikes = [...filteredBikes].sort((a, b) => {
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
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      default:
        return 0;
    }
  });

  const applyFilters = () => {
    setMobileFiltersOpen(false);
    loadAvailableBikes();
  };

  const resetFilters = () => {
    setFilters({
      sortBy: "relevance",
      priceRange: "all",
      brand: "all",
    });
  };

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
        <div>
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
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Pickup Date & Time
          </label>
          <ModernDateTimePicker
            label=""
            selectedDate={searchData.startDate}
            selectedTime={searchData.startTime}
            onDateChange={(date) =>
              setSearchData({ ...searchData, startDate: date })
            }
            onTimeChange={(time) =>
              setSearchData({ ...searchData, startTime: time })
            }
            minDate={new Date()}
            showTimeAfterDate={true}
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
            onDateChange={(date) =>
              setSearchData({ ...searchData, endDate: date })
            }
            onTimeChange={(time) =>
              setSearchData({ ...searchData, endTime: time })
            }
            minDate={searchData.startDate || new Date()}
            showTimeAfterDate={true}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-3 text-gray-700 flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Search by location
          </label>
          <Input
            placeholder="Enter location"
            value={searchData.location}
            onChange={(e) =>
              setSearchData({
                ...searchData,
                location: e.target.value,
              })
            }
            className="border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
          />
        </div>

        <div>
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
        </div>

        <div>
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
              <SelectItem value="honda">Honda</SelectItem>
              <SelectItem value="royal-enfield">Royal Enfield</SelectItem>
              <SelectItem value="tvs">TVS</SelectItem>
              <SelectItem value="aprilia">Aprilia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105"
            onClick={isMobile ? applyFilters : loadAvailableBikes}
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            className="px-6 py-3 border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            onClick={resetFilters}
          >
            Reset
          </Button>
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
          <div className="flex items-center mb-4">
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

          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 text-black shadow-lg">
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Pickup
                </div>
                <div className="font-semibold text-sm">
                  {formatDate(searchData.startDate) || "22 Jun 2025"}
                </div>
                <div className="text-xs text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(searchData.startTime) || "07:00AM"}
                </div>
              </div>

              <div className="w-px h-12 bg-gray-300 mx-3"></div>

              <div className="flex-1">
                <div className="flex items-center text-xs text-gray-600 mb-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  Dropoff
                </div>
                <div className="font-semibold text-sm">
                  {formatDate(searchData.endDate) || "23 Jun 2025"}
                </div>
                <div className="text-xs text-gray-600 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(searchData.endTime) || "06:00PM"}
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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Fixed Desktop Layout */}
        <div className="flex gap-8">
          {/* Desktop Filter Sidebar - Fixed Position */}
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

          {/* Bikes Grid - Responsive Width */}
          <div className={`flex-1 transition-all duration-300`}>
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-blue-700">
                *All prices are exclusive of taxes and fuel. Images used for
                representation purposes only, actual prices may vary.
              </p>
            </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedBikes.map((bike) => {
                  const initialSelection = bike.pricePerDay?.limitedKm?.isActive
                    ? {
                        price: bike.pricePerDay.limitedKm.price,
                        km: bike.pricePerDay.limitedKm.kmLimit,
                        type: "limited",
                        extraAmount: bikeSelections[bike._id]?.extraAmount || 0,
                      }
                    : {
                        price: bike.pricePerDay?.unlimited?.price || 0,
                        km: "Unlimited",
                        type: "unlimited",
                        extraAmount: bikeSelections[bike._id]?.extraAmount || 0,
                      };

                  const selection =
                    bikeSelections[bike._id] || initialSelection;
                  const totalPrice = selection.price + selection.extraAmount;

                  const handlePriceChange = (price, kmType) => {
                    setBikeSelections((prev) => ({
                      ...prev,
                      [bike._id]: {
                        price,
                        km:
                          kmType === "limited"
                            ? bike.pricePerDay?.limitedKm?.kmLimit || 0
                            : "Unlimited",
                        type: kmType,
                        extraAmount: prev[bike._id]?.extraAmount || 0,
                      },
                    }));
                  };

                  return (
                    <Card
                      key={bike._id}
                      className="hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white/90 backdrop-blur-sm border-0 shadow-lg"
                    >
                      <CardContent className="p-0">
                        <div className="relative overflow-hidden">
                          <Image
                            src={
                              bike.images?.[0] ||
                              "/placeholder.svg?height=200&width=300"
                            }
                            alt={bike.title}
                            width={300}
                            height={200}
                            className="w-full h-48 object-cover rounded-t-lg transition-transform duration-300 hover:scale-105"
                          />
                          {!bike.isAvailable && bike.nextAvailable && (
                            <div className="absolute top-1/2 left-0 right-0 transform -translate-y-1/2 bg-gray-900/80 backdrop-blur-sm text-white text-center py-3">
                              <span className="text-sm font-medium">
                                Next Available:{" "}
                                {new Date(
                                  bike.nextAvailable
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {bike.isTrending && (
                            <Badge className="absolute top-3 right-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
                              🔥 Trending
                            </Badge>
                          )}
                        </div>

                        <div className="p-5">
                          <h3 className="font-bold text-lg mb-3 text-gray-800">
                            {bike.title}
                          </h3>

                          <div className="text-center text-gray-500 text-sm mb-3 font-medium">
                            Choose km limit
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4 justify-center">
                            {bike.pricePerDay?.limitedKm?.isActive && (
                              <Button
                                size="sm"
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm transform hover:scale-105
                                  ${
                                    selection.type === "limited"
                                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                                      : "bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50"
                                  }`}
                                onClick={() =>
                                  handlePriceChange(
                                    bike.pricePerDay.limitedKm.price,
                                    "limited"
                                  )
                                }
                              >
                                {bike.pricePerDay.limitedKm.kmLimit} km
                              </Button>
                            )}

                            {bike.pricePerDay?.unlimited?.isActive && (
                              <Button
                                size="sm"
                                className={`px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm transform hover:scale-105
                                  ${
                                    selection.type === "unlimited"
                                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                                      : "bg-white text-orange-600 border-2 border-orange-300 hover:bg-orange-50"
                                  }`}
                                onClick={() =>
                                  handlePriceChange(
                                    bike.pricePerDay.unlimited.price,
                                    "unlimited"
                                  )
                                }
                              >
                                Unlimited km
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-gray-100 mx-5"></div>

                        <div className="flex items-center justify-between p-5 pt-4">
                          <div>
                            <div className="text-2xl font-bold text-gray-900">
                              ₹{totalPrice}.00
                            </div>
                            {selection.extraAmount > 0 && (
                              <div className="text-xs text-gray-500 mt-1">
                                Base: ₹{selection.price} + Extra: ₹
                                {selection.extraAmount}
                              </div>
                            )}
                          </div>

                          <Button
                            size="lg"
                            className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105 text-sm
                              ${
                                bike.isAvailable
                                  ? "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                                  : "bg-gray-400 text-gray-600 cursor-not-allowed"
                              }`}
                            disabled={!bike.isAvailable}
                            asChild={bike.isAvailable}
                          >
                            {bike.isAvailable ? (
                              <Link
                                href={`/bike/${bike._id}?${new URLSearchParams({
                                  ...Object.fromEntries(
                                    Object.entries({
                                      startDate:
                                        searchData.startDate
                                          ?.toISOString()
                                          .split("T")[0] || "",
                                      endDate:
                                        searchData.endDate
                                          ?.toISOString()
                                          .split("T")[0] || "",
                                      startTime: searchData.startTime || "",
                                      endTime: searchData.endTime || "",
                                      location: searchData.location || "",
                                      kmOption: selection.type,
                                      basePrice: selection.price.toString(),
                                    }).filter(([_, value]) => value)
                                  ),
                                  price: totalPrice.toString(),
                                  km: selection.km.toString(),
                                }).toString()}`}
                              >
                                BOOK NOW
                              </Link>
                            ) : (
                              <span>BOOK NOW</span>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

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

      <Footer />
    </div>
  );
}
