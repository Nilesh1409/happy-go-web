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
import { Filter, MapPin, Calendar, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function SearchPage() {
  const searchParams = useSearchParams();
  console.log(
    "🚀 ~ SearchPage ~ searchParams:",
    searchParams,
    searchParams.get("pickupDate")
  );
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    sortBy: "relevance",
    priceRange: "all",
    brand: "all",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchData, setSearchData] = useState({
    startDate: searchParams.get("pickupDate") || "",
    endDate: searchParams.get("dropoffDate") || "",
    startTime: searchParams.get("pickupTime") || "",
    endTime: searchParams.get("dropoffTime") || "",
    location: searchParams.get("location") || "Chikkamagaluru",
  });

  useEffect(() => {
    loadAvailableBikes();
  }, [searchParams]);

  const loadAvailableBikes = async () => {
    try {
      const params = {
        startDate: searchData.startDate,
        endDate: searchData.endDate,
        startTime: searchData.startTime,
        endTime: searchData.endTime,
        location: searchData.location,
      };
      console.log("🚀 ~ loadAvailableBikes ~ params:", params);

      const response = await apiService.searchBikes(params);
      console.log("🚀 ~ loadAvailableBikes ~ response:", response);
      setBikes(response.data || []);
    } catch (error) {
      console.error("Failed to load bikes:", error);
      // Fallback to dummy data
      setBikes([
        {
          _id: "1",
          title: "Honda Activa 6G",
          brand: "Honda",
          model: "Activa 6G",
          year: 2024,
          pricePerDay: { limitedKm: 563, unlimited: 800 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.5,
          reviewCount: 123,
          location: "Indiranagar - Metro Station",
          kmIncluded: 123,
          isNew: false,
        },
        {
          _id: "2",
          title: "Aprilia Tuono 457",
          brand: "Aprilia",
          model: "Tuono 457",
          year: 2024,
          pricePerDay: { limitedKm: 4091, unlimited: 5500 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.8,
          reviewCount: 245,
          location: "Indiranagar - Metro Station",
          kmIncluded: 245,
          isNew: true,
        },
        {
          _id: "3",
          title: "TVS Jupiter 110 (BS6)",
          brand: "TVS",
          model: "Jupiter 110",
          year: 2024,
          pricePerDay: { limitedKm: 563, unlimited: 800 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.6,
          reviewCount: 89,
          location: "Koramangala",
          kmIncluded: 123,
          isNew: false,
        },
        {
          _id: "4",
          title: "Royal Enfield Bear 650",
          brand: "Royal Enfield",
          model: "Bear 650",
          year: 2024,
          pricePerDay: { limitedKm: 2500, unlimited: 3500 },
          images: ["/placeholder.svg?height=200&width=300"],
          rating: 4.9,
          reviewCount: 156,
          location: "Whitefield",
          kmIncluded: 200,
          isNew: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Available Bikes in {searchData.location}
            </h1>
            <p className="text-gray-600">
              {searchData.startDate && searchData.endDate
                ? `${searchData.startDate} to ${searchData.endDate}`
                : "Choose your dates to see availability"}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showFilters ? "block" : "hidden"}`}>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Filter</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Sort by
                    </label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) =>
                        setFilters({ ...filters, sortBy: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="price-low">
                          Price - Low to High
                        </SelectItem>
                        <SelectItem value="price-high">
                          Price - High to Low
                        </SelectItem>
                        <SelectItem value="rating">Rating</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Select Date & Time
                    </label>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Pickup date</span>
                          <Input
                            type="date"
                            value={searchData.startDate}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                startDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Time</span>
                          <Input
                            type="time"
                            value={searchData.startTime}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                startTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Dropoff date</span>
                          <Input
                            type="date"
                            value={searchData.endDate}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                endDate: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <span className="text-gray-600">Time</span>
                          <Input
                            type="time"
                            value={searchData.endTime}
                            onChange={(e) =>
                              setSearchData({
                                ...searchData,
                                endTime: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
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
                    />
                  </div>

                  <Button
                    className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                    onClick={loadAvailableBikes}
                  >
                    Apply filter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bikes Grid */}
          <div className="lg:col-span-3">
            <div className="mb-4 text-sm text-gray-600">
              *All prices are exclusive of taxes and fuel. Images used for
              representation purposes only, actual color may vary.
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
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
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {bikes.map((bike) => (
                  <Card
                    key={bike._id}
                    className="hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-0">
                      <div className="relative">
                        <Image
                          src={
                            bike.images?.[0] ||
                            "/placeholder.svg?height=200&width=300"
                          }
                          alt={bike.title}
                          width={300}
                          height={200}
                          className="w-full h-48 object-cover rounded-t-lg"
                        />
                        <div className="absolute top-2 left-2 flex gap-2">
                          <Badge variant="secondary" className="bg-gray-100">
                            Zero deposit
                          </Badge>
                          {bike.isNew && (
                            <Badge className="bg-blue-600">New</Badge>
                          )}
                        </div>
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-lg mb-2">
                          {bike.title}
                        </h3>

                        <div className="flex items-center text-sm text-gray-600 mb-2">
                          <MapPin className="w-4 h-4 mr-1" />
                          Available at {bike.location}
                        </div>

                        <div className="flex items-center mb-2">
                          <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                          <span className="text-sm text-gray-600">
                            {bike.rating} ({bike.reviewCount} reviews)
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-2xl font-bold">
                              ₹ {bike.pricePerDay.limitedKm?.price}
                            </div>
                            <div className="text-sm text-gray-600">
                              ({bike.kmIncluded} km included)
                            </div>
                          </div>
                          <Button
                            className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                            asChild
                          >
                            <Link
                              href={`/bike/${bike._id}?${new URLSearchParams(
                                searchData
                              ).toString()}`}
                            >
                              Book
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && bikes.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Calendar className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    No bikes available
                  </h3>
                  <p className="text-gray-600 mb-4">
                    No bikes are available for the selected dates and location.
                    Try different dates or location.
                  </p>
                  <Button
                    className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
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
