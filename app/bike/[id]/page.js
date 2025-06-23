"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Settings } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function BikeDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const [bike, setBike] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedKmOption, setSelectedKmOption] = useState("limited");
  const [bookingParams, setBookingParams] = useState({
    startDate: searchParams.get("startDate") || "",
    endDate: searchParams.get("endDate") || "",
    startTime: searchParams.get("startTime") || "",
    endTime: searchParams.get("endTime") || "",
  });

  useEffect(() => {
    loadBikeDetails();
  }, [params.id]);

  const loadBikeDetails = async () => {
    try {
      const queryParams = {
        startDate: bookingParams.startDate,
        startTime: bookingParams.startTime,
        endDate: bookingParams.endDate,
        endTime: bookingParams.endTime,
      };

      const response = await apiService.getBikeDetails(params.id, queryParams);
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
        images: ["/placeholder.svg?height=300&width=400"],
        rating: 4.7,
        reviewCount: 92,
        location: "Indiranagar - Metro Station",
        kmLimit: { limited: 60, unlimited: "Unlimited" },
        additionalKmPrice: 4,
        features: ["Bluetooth", "GPS", "USB Charging"],
        description: "Perfect bike for city rides and short trips",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    const params = new URLSearchParams({
      ...bookingParams,
      kmOption: selectedKmOption,
    }).toString();
    window.location.href = `/booking/summary/${bike._id}?${params}`;
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
                The bike you're looking for doesn't exist or is no longer
                available.
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Booking Info Header */}
      <div className="bg-[#F47B20] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href="/search"
              className="flex items-center mr-4 hover:text-yellow-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="opacity-80">Pickup</div>
                  <div className="font-medium">
                    {bookingParams.startDate || "Select Date"}{" "}
                    {bookingParams.startTime && `at ${bookingParams.startTime}`}
                  </div>
                </div>
                <div>
                  <div className="opacity-80">Dropoff</div>
                  <div className="font-medium">
                    {bookingParams.endDate || "Select Date"}{" "}
                    {bookingParams.endTime && `at ${bookingParams.endTime}`}
                  </div>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-sm text-gray-600 mb-4">
          *All prices are exclusive of taxes and fuel.
          <br />
          *Images for representation purposes only, actual prices may vary.
        </div>

        <Card className="mb-6">
          <CardContent className="p-6">
            <h1 className="text-2xl font-bold mb-4">{bike.title}</h1>

            <div className="relative mb-6">
              <Image
                src={
                  bike.images?.[0] || "/placeholder.svg?height=300&width=400"
                }
                alt={bike.title}
                width={400}
                height={300}
                className="w-full max-w-md mx-auto rounded-lg"
              />
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-3">km limit</h3>
              <div className="flex gap-3">
                <Button
                  variant={
                    selectedKmOption === "limited" ? "default" : "outline"
                  }
                  className={
                    selectedKmOption === "limited"
                      ? "bg-[#F47B20] hover:bg-[#E06A0F]"
                      : ""
                  }
                  onClick={() => setSelectedKmOption("limited")}
                >
                  {bike.kmLimit?.limited || 60} km
                </Button>
                <Button
                  variant={
                    selectedKmOption === "unlimited" ? "default" : "outline"
                  }
                  className={
                    selectedKmOption === "unlimited"
                      ? "bg-[#F47B20] hover:bg-[#E06A0F]"
                      : ""
                  }
                  onClick={() => setSelectedKmOption("unlimited")}
                >
                  Unlimited km
                </Button>
              </div>
            </div>

            <div className="flex items-center mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
              <span className="font-medium">{bike.rating}</span>
              <span className="text-gray-600 ml-1">
                ({bike.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold">
                  ₹
                  {selectedKmOption === "limited"
                    ? bike.pricePerDay.limitedKm?.price
                    : bike.pricePerDay.unlimited?.price}
                  .00
                </div>
                {selectedKmOption === "limited" && bike.additionalKmPrice && (
                  <div className="text-sm text-gray-600">
                    Additional km: ₹{bike.additionalKmPrice}/km
                  </div>
                )}
              </div>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white px-8"
                onClick={handleBookNow}
              >
                BOOK NOW
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        {bike.features && bike.features.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4">Features</h3>
              <div className="flex flex-wrap gap-2">
                {bike.features.map((feature, index) => (
                  <Badge key={index} variant="secondary">
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Similar Bikes */}
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Similar Bikes</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Image
                    src="/placeholder.svg?height=80&width=120"
                    alt="Royal Enfield Classic 350"
                    width={120}
                    height={80}
                    className="rounded"
                  />
                  <div>
                    <h4 className="font-medium">Royal Enfield Classic 350</h4>
                    <Badge className="bg-orange-100 text-orange-800 mt-1">
                      Trending
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">₹600.00</div>
                  <div className="text-sm text-gray-600">80 km included</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
