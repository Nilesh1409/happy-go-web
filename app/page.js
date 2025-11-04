"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Star,
  Bike,
  Building2,
  Gift,
  User,
  Phone,
  Award,
  Users,
  StarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import ModernDateTimePicker from "@/components/modern-date-time-picker";
import { apiService } from "@/lib/api";
import { adjustDrop } from "@/lib/date-time";

// Helper function to format date consistently
const formatDateForURL = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Helper function to get next 30-minute block from current time
const getNextHalfHourBlock = () => {
  const now = new Date();
  const currentMinutes = now.getMinutes();
  const currentHours = now.getHours();

  // Round up to next 30-minute block
  let nextMinutes = currentMinutes <= 30 ? 30 : 0;
  let nextHours = currentMinutes <= 30 ? currentHours : currentHours + 1;

  // Handle day overflow
  if (nextHours >= 24) {
    nextHours = 0;
  }

  // Format as HH:MM
  return `${String(nextHours).padStart(2, "0")}:${String(nextMinutes).padStart(
    2,
    "0"
  )}`;
};

// Helper function to check if two dates are the same day
const isSameDay = (date1, date2) => {
  return date1.toDateString() === date2.toDateString();
};

export default function HomePage() {
  const tomorrow = new Date();
  const today = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const getDefaultPickupTime = () => {
    if (!isSameDay(today, new Date())) {
      return "08:00";
    }

    const nextHalfHour = getNextHalfHourBlock();
    const [hour] = nextHalfHour.split(":").map(Number);

    // If next half hour is 8 AM or later, use it; otherwise use 8:00 AM
    return hour >= 8 ? nextHalfHour : "08:00";
  };

  // Fix: Initialize with tomorrow instead of today
  const [searchData, setSearchData] = useState({
    pickupDate: today,
    pickupTime: getDefaultPickupTime(),
    dropoffDate: today,
    dropoffTime: "20:00",
    location: "Chikkamagaluru",
  });
  console.log("🚀 ~ HomePage ~ searchData:", searchData);

  const [trendingBikes, setTrendingBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoOpenStates, setAutoOpenStates] = useState({
    pickupTime: false,
    dropoffDate: false,
    dropoffTime: false,
  });

  useEffect(() => {
    loadTrendingBikes();
  }, []);

  // Fix: Add proper dependency array and prevent infinite loops
  useEffect(() => {
    const { pickupDate, pickupTime, dropoffDate, dropoffTime } = searchData;

    if (!pickupDate || !pickupTime) return;

    const { date, time } = adjustDrop(
      pickupDate,
      pickupTime,
      dropoffDate,
      dropoffTime
    );

    // Only update if anything actually changes
    if (
      !dropoffDate ||
      date.getTime() !== dropoffDate.getTime() ||
      time !== dropoffTime
    ) {
      setSearchData((prev) => ({
        ...prev,
        dropoffDate: date,
        dropoffTime: time,
      }));
    }
  }, [searchData.pickupDate, searchData.pickupTime]); // Remove dropoffDate and dropoffTime from dependencies

  // Handle pickup date changes to update time if needed
  useEffect(() => {
    if (!searchData.pickupDate) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const isToday =
      searchData.pickupDate.toDateString() === today.toDateString();

    // If pickup date is today, validate pickup time against current time
    if (isToday) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      // Convert current time and selected time to minutes for comparison
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      const selectedTimeMinutes = searchData.pickupTime
        ? parseInt(searchData.pickupTime.split(":")[0]) * 60 +
          parseInt(searchData.pickupTime.split(":")[1])
        : 0;

      // If selected time is in the past or too close, update to next available slot
      if (selectedTimeMinutes <= currentTimeMinutes + 30) {
        const nextTime = getNextHalfHourBlock();

        // Apply the same logic: if next half hour >= 8 AM, use it; otherwise use 8:00 AM
        const [hour] = nextTime.split(":").map(Number);
        const finalTime = hour >= 8 ? nextTime : "08:00";

        setSearchData((prev) => ({
          ...prev,
          pickupTime: finalTime,
        }));
      }
    }
  }, [searchData.pickupDate, searchData.pickupTime]);

  const loadTrendingBikes = async () => {
    try {
      const response = await apiService.getTrendingBikes();
      setTrendingBikes(response.data || []);
    } catch (error) {
      console.error("Failed to load trending bikes:", error);
      setTrendingBikes([
        {
          _id: "1",
          title: "Royal Enfield Classic 350",
          brand: "Royal Enfield",
          model: "Classic 350",
          year: 2024,
          pricePerDay: { limitedKm: 500, unlimited: 800 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.7,
          reviewCount: 92,
        },
        {
          _id: "2",
          title: "Honda CB350",
          brand: "Honda",
          model: "CB350",
          year: 2022,
          pricePerDay: { limitedKm: 600, unlimited: 900 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.6,
          reviewCount: 78,
        },
        {
          _id: "3",
          title: "KTM Duke 390",
          brand: "KTM",
          model: "Duke 390",
          year: 2024,
          pricePerDay: { limitedKm: 800, unlimited: 1200 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.8,
          reviewCount: 156,
        },
        {
          _id: "4",
          title: "Yamaha FZ-S",
          brand: "Yamaha",
          model: "FZ-S",
          year: 2023,
          pricePerDay: { limitedKm: 450, unlimited: 700 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.5,
          reviewCount: 64,
        },
        {
          _id: "5",
          title: "TVS Apache RTR 160",
          brand: "TVS",
          model: "Apache RTR 160",
          year: 2023,
          pricePerDay: { limitedKm: 400, unlimited: 650 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.4,
          reviewCount: 89,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Fix: Use proper date formatting function
  const handleSearch = () => {
    console.log("Search data before URL creation:", searchData); // Debug log

    const params = new URLSearchParams({
      pickupDate: formatDateForURL(searchData.pickupDate),
      pickupTime: searchData.pickupTime,
      dropoffDate: formatDateForURL(searchData.dropoffDate),
      dropoffTime: searchData.dropoffTime,
      location: searchData.location,
    }).toString();

    console.log("URL params:", params); // Debug log
    window.location.href = `/search?${params}`;
  };

  const scrollLeft = () => {
    const container = document.getElementById("trending-bikes-container");
    container.scrollBy({ left: -300, behavior: "smooth" });
  };

  const scrollRight = () => {
    const container = document.getElementById("trending-bikes-container");
    container.scrollBy({ left: 300, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative bg-[#F47B20] text-white overflow-hidden"
        style={{
          backgroundImage:
            "url('https://lokeshshah.wordpress.com/wp-content/uploads/2015/12/bikeridejawadihills_001.jpg?w=1024&h=573')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-4 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Happy Ride <span className="text-yellow-200">Happy Stay</span>
              </h2>
              <p className="text-xs sm:text-base lg:text-lg mb-6 sm:mb-4 opacity-80">
                Best Bike Rental Service in Chikkamagaluru Since 2010
              </p>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-center lg:justify-start">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm sm:text-base lg:text-lg font-semibold">
                    5 Star Rating on Google Maps
                  </span>
                </div>
                <p className="text-sm sm:text-base lg:text-lg font-semibold">
                  Served more than 3.5 lakh people
                </p>
              </div>
            </div>

            {/* Search Form - Responsive */}
            <div className="w-full max-w-lg mx-auto lg:max-w-none">
              <Card className="bg-white text-gray-900 shadow-xl rounded-xl">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg lg:text-xl text-center font-bold text-[#F47B20]">
                    Search Your Next Ride
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
                  <ModernDateTimePicker
                    label="Pickup"
                    selectedDate={searchData.pickupDate}
                    selectedTime={searchData.pickupTime}
                    onDateChange={(date) =>
                      setSearchData({ ...searchData, pickupDate: date })
                    }
                    onTimeChange={(time) =>
                      setSearchData({ ...searchData, pickupTime: time })
                    }
                    onDateSelected={() => {
                      // Auto-open pickup time after pickup date is selected
                      setAutoOpenStates((prev) => ({
                        ...prev,
                        pickupTime: true,
                      }));
                      setTimeout(
                        () =>
                          setAutoOpenStates((prev) => ({
                            ...prev,
                            pickupTime: false,
                          })),
                        200
                      );
                    }}
                    onTimeSelected={() => {
                      // Auto-open dropoff date after pickup time is selected
                      setAutoOpenStates((prev) => ({
                        ...prev,
                        dropoffDate: true,
                      }));
                      setTimeout(
                        () =>
                          setAutoOpenStates((prev) => ({
                            ...prev,
                            dropoffDate: false,
                          })),
                        200
                      );
                    }}
                    minDate={today}
                    showTimeAfterDate={true}
                    autoOpenTimePicker={autoOpenStates.pickupTime}
                  />

                  <ModernDateTimePicker
                    label="Drop-off Date & Time"
                    selectedDate={searchData.dropoffDate}
                    selectedTime={searchData.dropoffTime}
                    onDateChange={(date) =>
                      setSearchData({ ...searchData, dropoffDate: date })
                    }
                    onTimeChange={(time) =>
                      setSearchData({ ...searchData, dropoffTime: time })
                    }
                    onDateSelected={() => {
                      // Auto-open dropoff time after dropoff date is selected
                      setAutoOpenStates((prev) => ({
                        ...prev,
                        dropoffTime: true,
                      }));
                      setTimeout(
                        () =>
                          setAutoOpenStates((prev) => ({
                            ...prev,
                            dropoffTime: false,
                          })),
                        200
                      );
                    }}
                    isDropOff={true}
                    pickupDate={searchData.pickupDate || today}
                    pickupTime={searchData.pickupTime}
                    autoOpenDatePicker={autoOpenStates.dropoffDate}
                    autoOpenTimePicker={autoOpenStates.dropoffTime}
                  />

                  <Button
                    className="w-full bg-[#F47B20] hover:bg-[#e56a1c] text-white font-semibold py-2.5 sm:py-3 rounded-lg transition-all duration-200"
                    onClick={handleSearch}
                  >
                    Search Bikes
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your component remains the same... */}
      {/* Popular Bikes Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Popular Bikes in Chikkamagaluru
              </h2>
              <p className="text-gray-600 mt-2 text-sm sm:text-base">
                Most loved bikes by our customers
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Scroll buttons for desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollLeft}
                  className="p-2 bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={scrollRight}
                  className="p-2 bg-transparent"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              {/* <Button variant="outline" asChild>
                <Link href="/search">View All Bikes</Link>
              </Button> */}
            </div>
          </div>

          {loading ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse flex-shrink-0 w-72 sm:w-80"
                >
                  <CardContent className="p-0">
                    <div className="h-40 sm:h-48 bg-gray-200 rounded-t-lg"></div>
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
            <div
              id="trending-bikes-container"
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scroll-smooth"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitScrollbar: { display: "none" },
              }}
            >
              {trendingBikes.map((bike) => (
                <Card
                  key={bike._id}
                  className="hover:shadow-lg transition-shadow flex-shrink-0 w-72 sm:w-80"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={
                          bike.images?.[0] ||
                          "https://happygorentals.com/assets/images/andreas-weilguny-gZGId1GVRcc-unsplash.jpg" ||
                          "/placeholder.svg" ||
                          "/placeholder.svg"
                        }
                        alt={`${bike.title} - Bike Rental in Chikkamagaluru`}
                        className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-[#F47B20] text-xs">
                        Zero deposit
                      </Badge>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-base sm:text-lg mb-2 truncate">
                        {bike.title}
                      </h3>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xl sm:text-2xl font-bold text-gray-900">
                            ₹
                            {bike.priceLimited?.breakdown?.basePrice ||
                              bike.priceUnlimited?.breakdown?.basePrice ||
                              bike.pricePerDay?.limitedKm?.price ||
                              bike.pricePerDay?.unlimited?.price ||
                              500}
                          </span>
                          <span className="text-sm text-gray-600">
                            /
                            {bike.priceLimited?.breakdown?.duration ||
                              bike.priceUnlimited?.breakdown?.duration ||
                              "day"}
                          </span>
                        </div>
                        {/* <Button className="btn-primary text-sm" asChild>
                          <Link 
                            href={`/bike/${bike._id}${bike.defaultSearchPeriod ? `?${new URLSearchParams({
                              startDate: bike.defaultSearchPeriod.startDate,
                              endDate: bike.defaultSearchPeriod.endDate,
                              startTime: bike.defaultSearchPeriod.startTime,
                              endTime: bike.defaultSearchPeriod.endTime,
                              location: "Chikkamagaluru"
                            }).toString()}` : ''}`}
                          >
                            Book Now
                          </Link>
                        </Button> */}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Mobile scroll indicator */}
          <div className="sm:hidden text-center mt-4">
            <p className="text-xs text-gray-500">← Swipe to see more bikes →</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Why Choose Happy Go?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Experience the best bike rental service in Chikkamagaluru with our
              premium bikes and exceptional service
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <StarIcon className="w-10 h-10 sm:w-12 sm:h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  <span className="text-[#f47b20]">5 Star</span> Rating on
                  Google Map
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  All bikes are regularly serviced and safety checked
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <Phone className="w-10 h-10 sm:w-12 sm:h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  24/7 Support
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Round the clock customer support for any assistance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <Award className="w-10 h-10 sm:w-12 sm:h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Best Prices
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Competitive pricing with no hidden charges
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <Users className="w-10 h-10 sm:w-12 sm:h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-base sm:text-lg font-semibold mb-2">
                  Trusted Since 2010
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm">
                  Over a decade of reliable service in Chikkamagaluru
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              <span className="text-[#F47B20]">Happy Ride</span> Happy Stay
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Complete travel solutions for your perfect journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6 sm:p-8">
                <Bike className="w-12 h-12 sm:w-16 sm:h-16 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Bike Rental
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Premium bikes for your perfect ride in Chikkamagaluru
                </p>
                <Button className="mt-4 btn-primary" asChild>
                  <Link href="/search">Rent Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6 sm:p-8">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Hostels
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Comfortable stays at great locations
                </p>
                <Button
                  className="mt-4 bg-transparent"
                  variant="outline"
                  asChild
                >
                  <Link href="/hostels">Coming Soon</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6 sm:p-8">
                <Gift className="w-12 h-12 sm:w-16 sm:h-16 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold mb-2">
                  Products
                </h3>
                <p className="text-gray-600 text-sm sm:text-base mb-4">
                  Quality products for your journey
                </p>
                <Button
                  className="mt-4 bg-transparent"
                  variant="outline"
                  asChild
                >
                  <Link href="/products">Coming Soon</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-[#F47B20] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl mb-6 sm:mb-8 opacity-90">
            Book your perfect bike today and explore the beautiful landscapes of
            Chikkamagaluru
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#F47B20] hover:bg-gray-100"
              asChild
            >
              <Link href="/search">Book a Bike Now</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-[#F47B20] bg-transparent"
              asChild
            >
              <a href="tel:+919008022800">Call +91 90080-22800</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Bottom Navigation for Mobile */}
      {/* <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
        <div className="grid grid-cols-5 py-2">
          <Link
            href="/"
            className="flex flex-col items-center py-2 text-[#F47B20]"
          >
            <Bike className="w-5 h-5" />
            <span className="text-xs mt-1">Bike</span>
          </Link>
          <Link
            href="/bookings"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Bookings</span>
          </Link>
          <Link
            href="/products"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <Building2 className="w-5 h-5" />
            <span className="text-xs mt-1">Products</span>
          </Link>
          <Link
            href="/refer-earn"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <Gift className="w-5 h-5" />
            <span className="text-xs mt-1">Refer&Earn</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center py-2 text-gray-600"
          >
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div> */}
      <Footer />
    </div>
  );
}
