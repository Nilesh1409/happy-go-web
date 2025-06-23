"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Star,
  Bike,
  Building2,
  Gift,
  User,
  Phone,
  Shield,
  Award,
  Users,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function HomePage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date();
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const [searchData, setSearchData] = useState({
    pickupDate: tomorrow,
    pickupTime: new Date(tomorrow.setHours(8, 0, 0, 0)),
    dropoffDate: dayAfterTomorrow,
    dropoffTime: new Date(dayAfterTomorrow.setHours(20, 0, 0, 0)),
    location: "Chikkamagaluru",
  });

  const [trendingBikes, setTrendingBikes] = useState([]);
  const [loading, setLoading] = useState(true);

  const pickupTimeRef = useRef(null);
  const dropoffDateRef = useRef(null);
  const dropoffTimeRef = useRef(null);

  useEffect(() => {
    loadTrendingBikes();
  }, []);

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
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const times = [];
    let current = new Date();
    current.setHours(5, 0, 0, 0);
    const end = new Date();
    end.setHours(22, 0, 0, 0);

    while (current <= end) {
      times.push(new Date(current));
      current.setMinutes(current.getMinutes() + 30);
    }
    return times;
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      pickupDate: searchData.pickupDate.toISOString().split("T")[0],
      pickupTime: searchData.pickupTime.toTimeString().slice(0, 5),
      dropoffDate: searchData.dropoffDate.toISOString().split("T")[0],
      dropoffTime: searchData.dropoffTime.toTimeString().slice(0, 5),
      location: searchData.location,
    }).toString();
    window.location.href = `/search?${params}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative bg-[#F47B20] text-white overflow-hidden"
        style={{
          backgroundImage:
            "url('https://happygorentals.com/assets/images/andreas-weilguny-gZGId1GVRcc-unsplash.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                Happy Ride <span className="text-yellow-300">Happy Stay</span>
              </h1>
              <p className="text-lg mb-8 opacity-80">
                Best Bike Rental Service in Chikkamagaluru Since 2010
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-6 h-6 text-yellow-400 fill-current"
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-lg font-semibold">
                    5 Star Rating on Google Maps
                  </span>
                </div>
                <p className="text-lg font-semibold">
                  Served more than 3.5 lakh people
                </p>
              </div>
            </div>

            {/* Search Form */}
            <Card className="bg-white text-gray-900 max-w-md w-[600px] shadow-xl rounded-xl">
              <CardHeader>
                <CardTitle className="text-xl text-center font-bold text-[#F47B20]">
                  Search Your Next Ride
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Pickup
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#F47B20] z-10" />
                      <DatePicker
                        selected={searchData.pickupDate}
                        onChange={(date) => {
                          setSearchData({ ...searchData, pickupDate: date });
                          pickupTimeRef.current.setOpen(true);
                        }}
                        dateFormat="yyyy-MM-dd"
                        className="pl-10 w-full rounded-lg border border-gray-200 p-3 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-[#F47B20] focus:border-[#F47B20] transition-all duration-200"
                        minDate={tomorrow}
                        popperClassName="custom-datepicker"
                        calendarClassName="custom-calendar"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-[#F47B20] z-10" />
                      <DatePicker
                        ref={pickupTimeRef}
                        selected={searchData.pickupTime}
                        onChange={(time) => {
                          setSearchData({ ...searchData, pickupTime: time });
                          dropoffDateRef.current.setOpen(true);
                        }}
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Pickup Time"
                        dateFormat="h:mm aa"
                        className="pl-10 w-full rounded-lg border border-gray-200 p-3 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-[#F47B20] focus:border-[#F47B20] transition-all duration-200"
                        includeTimes={generateTimeOptions()}
                        popperClassName="custom-timepicker"
                        renderCustomHeader={({
                          date,
                          changeYear,
                          changeMonth,
                        }) => (
                          <div className="flex justify-between items-center p-3 bg-[#F47B20] text-white rounded-t-lg">
                            <select
                              value={date.getMonth()}
                              onChange={({ target: { value } }) =>
                                changeMonth(value)
                              }
                              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
                            >
                              {[
                                "January",
                                "February",
                                "March",
                                "April",
                                "May",
                                "June",
                                "July",
                                "August",
                                "September",
                                "October",
                                "November",
                                "December",
                              ].map((month, index) => (
                                <option key={month} value={index}>
                                  {month}
                                </option>
                              ))}
                            </select>
                            <select
                              value={date.getFullYear()}
                              onChange={({ target: { value } }) =>
                                changeYear(value)
                              }
                              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
                            >
                              {Array.from(
                                { length: 10 },
                                (_, i) => new Date().getFullYear() + i
                              ).map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        renderTime={({ time }) => {
                          const hours = time.getHours();
                          const isEarlyMorning = hours >= 5 && hours < 7;
                          return (
                            <div
                              className={`p-3 hover:bg-[#F47B20] hover:text-white rounded flex justify-between items-center transition-colors duration-200 ${
                                isEarlyMorning ? "bg-red-50" : ""
                              }`}
                            >
                              <span>
                                {time.toLocaleTimeString("en", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isEarlyMorning && (
                                <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded">
                                  +₹100
                                </span>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                  {searchData.pickupTime &&
                    searchData.pickupTime.getHours() >= 5 &&
                    searchData.pickupTime.getHours() < 7 && (
                      <p className="text-red-600 text-sm mt-2 font-medium bg-red-50 p-2 rounded">
                        Note: ₹100 extra for early pickup (5 AM - 7 AM)
                      </p>
                    )}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-900">
                    Dropoff
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 w-5 h-5 text-[#F47B20] z-10" />
                      <DatePicker
                        ref={dropoffDateRef}
                        selected={searchData.dropoffDate}
                        onChange={(date) => {
                          setSearchData({ ...searchData, dropoffDate: date });
                          dropoffTimeRef.current.setOpen(true);
                        }}
                        dateFormat="yyyy-MM-dd"
                        className="pl-10 w-full rounded-lg border border-gray-200 p-3 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-[#F47B20] focus:border-[#F47B20] transition-all duration-200"
                        minDate={searchData.pickupDate}
                        popperClassName="custom-datepicker"
                        calendarClassName="custom-calendar"
                      />
                    </div>
                    <div className="relative">
                      <Clock className="absolute left-3 top-3 w-5 h-5 text-[#F47B20] z-10" />
                      <DatePicker
                        ref={dropoffTimeRef}
                        selected={searchData.dropoffTime}
                        onChange={(time) =>
                          setSearchData({ ...searchData, dropoffTime: time })
                        }
                        showTimeSelect
                        showTimeSelectOnly
                        timeIntervals={30}
                        timeCaption="Dropoff Time"
                        dateFormat="h:mm aa"
                        className="pl-10 w-full rounded-lg border border-gray-200 p-3 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-[#F47B20] focus:border-[#F47B20] transition-all duration-200"
                        includeTimes={generateTimeOptions()}
                        popperClassName="custom-timepicker"
                        renderCustomHeader={({
                          date,
                          changeYear,
                          changeMonth,
                        }) => (
                          <div className="flex justify-between items-center p-3 bg-[#F47B20] text-white rounded-t-lg">
                            <select
                              value={date.getMonth()}
                              onChange={({ target: { value } }) =>
                                changeMonth(value)
                              }
                              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
                            >
                              {[
                                "January",
                                "February",
                                "March",
                                "April",
                                "May",
                                "June",
                                "July",
                                "August",
                                "September",
                                "October",
                                "November",
                                "December",
                              ].map((month, index) => (
                                <option key={month} value={index}>
                                  {month}
                                </option>
                              ))}
                            </select>
                            <select
                              value={date.getFullYear()}
                              onChange={({ target: { value } }) =>
                                changeYear(value)
                              }
                              className="p-2 rounded bg-white text-gray-900 focus:outline-none"
                            >
                              {Array.from(
                                { length: 10 },
                                (_, i) => new Date().getFullYear() + i
                              ).map((year) => (
                                <option key={year} value={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        renderTime={({ time }) => {
                          const hours = time.getHours();
                          const isLateEvening = hours >= 20;
                          return (
                            <div
                              className={`p-3 hover:bg-[#F47B20] hover:text-white rounded flex justify-between items-center transition-colors duration-200 ${
                                isLateEvening ? "bg-red-50" : ""
                              }`}
                            >
                              <span>
                                {time.toLocaleTimeString("en", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                })}
                              </span>
                              {isLateEvening && (
                                <span className="text-red-600 text-xs font-semibold bg-red-100 px-2 py-1 rounded">
                                  +₹200
                                </span>
                              )}
                            </div>
                          );
                        }}
                      />
                    </div>
                  </div>
                  {searchData.dropoffTime &&
                    searchData.dropoffTime.getHours() >= 20 && (
                      <p className="text-red-600 text-sm mt-2 font-medium bg-red-50 p-2 rounded">
                        Note: ₹200 extra for late drop-off (after 8 PM)
                      </p>
                    )}
                </div>

                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#e56a1c] text-white font-semibold py-3 rounded-lg transition-all duration-200"
                  onClick={handleSearch}
                >
                  Search Bikes
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <style jsx>{`
          .custom-datepicker {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
          }
          .custom-datepicker .react-datepicker__header {
            background: #f47b20;
            color: white;
            border-radius: 0.5rem 0.5rem 0 0;
            padding: 0.75rem;
            border-bottom: none;
            font-weight: 600;
          }
          .custom-calendar {
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }
          .custom-calendar .react-datepicker__day-name,
          .custom-calendar .react-datepicker__day,
          .custom-calendar .react-datepicker__time-name {
            color: #1a202c;
            font-weight: 500;
          }
          .custom-calendar .react-datepicker__day:hover,
          .custom-calendar .react-datepicker__day--selected,
          .custom-calendar .react-datepicker__day--keyboard-selected {
            background: #f47b20;
            color: white;
            border-radius: 50%;
            transition: background 0.2s;
          }
          .custom-timepicker {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
            padding: 0.5rem;
            border: 1px solid #e2e8f0;
          }
          .custom-timepicker .react-datepicker__time-container {
            background: white;
            border-left: none;
          }
          .custom-timepicker
            .react-datepicker__time-box
            ul.react-datepicker__time-list {
            padding: 0;
            margin: 0;
          }
          .custom-timepicker
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item {
            padding: 0.75rem 1rem;
            color: #1a202c;
            font-weight: 500;
            border-radius: 0.375rem;
            margin: 0.25rem 0;
            transition: all 0.2s;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .custom-timepicker
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item:hover {
            background: #f4f4f4;
            color: #f47b20;
          }
          .custom-timepicker
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item--selected {
            background: #f47b20;
            color: white;
            font-weight: 600;
          }
          .custom-timepicker
            .react-datepicker__time-box
            ul.react-datepicker__time-list
            li.react-datepicker__time-list-item--selected:hover {
            background: #e56a1c;
          }
          .custom-datepicker .react-datepicker__triangle {
            border-bottom-color: #f47b20;
          }
          .custom-datepicker .react-datepicker__navigation-icon::before {
            border-color: white;
          }
        `}</style>
      </section>

      {/* Rest of the component remains unchanged */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Popular Bikes in Chikkamagaluru
              </h2>
              <p className="text-gray-600 mt-2">
                Most loved bikes by our customers
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/search">View All Bikes</Link>
            </Button>
          </div>

          {loading ? (
            <div className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse min-w-[300px] max-w-[300px]"
                >
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
            <div className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-[#F47B20] scrollbar-track-gray-100">
              {trendingBikes.map((bike) => (
                <Card
                  key={bike._id}
                  className="hover:shadow-lg transition-shadow min-w-[300px] max-w-[300px] snap-center"
                >
                  <CardContent className="p-0">
                    <div className="relative">
                      <img
                        src={
                          bike.images?.[0] ||
                          "https://happygorentals.com/assets/images/andreas-weilguny-gZGId1GVRcc-unsplash.jpg"
                        }
                        alt={`${bike.title} - Bike Rental in Chikkamagaluru`}
                        className="w-full h-48 object-cover rounded-t-lg"
                      />
                      <Badge className="absolute top-2 right-2 bg-[#F47B20]">
                        Zero deposit
                      </Badge>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg mb-2">
                        {bike.title}
                      </h3>

                      <div className="flex items-center mb-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">
                          {bike.rating} ({bike.reviewCount} reviews)
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-2xl font-bold text-gray-900">
                            ₹{bike.pricePerDay?.limitedKm?.price || 500}
                          </span>
                          <span className="text-sm text-gray-600">/day</span>
                        </div>
                        <Button className="btn-primary" asChild>
                          <Link href={`/bike/${bike._id}`}>Book Now</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <style jsx>{`
          .scrollbar-thin::-webkit-scrollbar {
            height: 8px;
          }
          .scrollbar-thin::-webkit-scrollbar-thumb {
            background-color: #f47b20;
            border-radius: 4px;
          }
          .scrollbar-thin::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }
        `}</style>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Happy Go?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the best bike rental service in Chikkamagaluru with our
              premium bikes and exceptional service
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <StarIcon className="w-12 h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  <span className="text-[#f47b20]">5 Star</span> Rating on
                  Google Map
                </h3>
                <p className="text-gray-600 text-sm">
                  All bikes are regularly serviced and safety checked
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Phone className="w-12 h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600 text-sm">
                  Round the clock customer support for any assistance
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Award className="w-12 h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Best Prices</h3>
                <p className="text-gray-600 text-sm">
                  Competitive pricing with no hidden charges
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <Users className="w-12 h-12 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Trusted Since 2010
                </h3>
                <p className="text-gray-600 text-sm">
                  Over a decade of reliable service in Chikkamagaluru
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span className="text-[#F47B20]">Happy Ride</span> Happy Stay
            </h2>
            <p className="text-gray-600">
              Complete travel solutions for your perfect journey
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Bike className="w-16 h-16 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Bike Rental</h3>
                <p className="text-gray-600">
                  Premium bikes for your perfect ride in Chikkamagaluru
                </p>
                <Button className="mt-4 btn-primary" asChild>
                  <Link href="/search">Rent Now</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Building2 className="w-16 h-16 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Hostels</h3>
                <p className="text-gray-600">
                  Comfortable stays at great locations
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/hostels">Coming Soon</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <Gift className="w-16 h-16 text-[#F47B20] mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Products</h3>
                <p className="text-gray-600">
                  Quality products for your journey
                </p>
                <Button className="mt-4" variant="outline" asChild>
                  <Link href="/products">Coming Soon</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#F47B20] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready for Your Next Adventure?
          </h2>
          <p className="text-xl mb-8 opacity-90">
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
              className="border-white text-white hover:bg-white hover:text-[#F47B20]"
              asChild
            >
              <a href="tel:+919008022800">Call +91 90080-22800</a>
            </Button>
          </div>
        </div>
      </section>

      <Footer />

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
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
      </div>
    </div>
  );
}
