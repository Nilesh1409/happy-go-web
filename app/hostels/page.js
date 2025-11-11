"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  Building2,
  Wifi,
  Coffee,
  Sparkles,
  TrendingUp,
  BedDouble,
  Briefcase,
  CalendarIcon,
} from "lucide-react";
import Image from "next/image";
import ModernCalendar from "@/components/modern-calendar";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function HostelsPage() {
  const router = useRouter();
  const [stayType, setStayType] = useState("hostel"); // "hostel" or "workstation"
  
  // Initialize with today and tomorrow
  const getDefaultDates = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { checkIn: today, checkOut: tomorrow };
  };
  
  const defaultDates = getDefaultDates();
  const [checkInDate, setCheckInDate] = useState(defaultDates.checkIn);
  const [checkOutDate, setCheckOutDate] = useState(defaultDates.checkOut);
  const [location, setLocation] = useState("Chikkamagaluru");
  const [trendingHostels, setTrendingHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [shouldOpenCheckout, setShouldOpenCheckout] = useState(false);

  useEffect(() => {
    loadTrendingHostels();
  }, []);

  useEffect(() => {
    // Update checkout date when stay type changes
    const newCheckOut = new Date(checkInDate);
    if (stayType === "workstation") {
      // Workstation: minimum 7 days
      newCheckOut.setDate(newCheckOut.getDate() + 7);
    } else {
      // Hostel: 1 day
      newCheckOut.setDate(newCheckOut.getDate() + 1);
    }
    setCheckOutDate(newCheckOut);
  }, [stayType]);

  const formatDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const loadTrendingHostels = async () => {
    try {
      const response = await apiService.getAllHostels();
      if (response.success && response.data) {
        setTrendingHostels(response.data.slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to load trending hostels:", error);
    }
  };

  const validateSearch = () => {
    if (!location.trim()) {
      toast.error("Error", "Please enter a location");
      return false;
    }
    
    if (!checkInDate) {
      toast.error("Error", "Please select check-in date");
      return false;
    }
    
    if (!checkOutDate) {
      toast.error("Error", "Please select check-out date");
      return false;
    }
    
    if (checkOutDate <= checkInDate) {
      toast.error("Error", "Check-out must be after check-in");
      return false;
    }
    
    // Enforce minimum 7 days for workstation bookings
    if (stayType === "workstation") {
      const daysDiff = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        toast.error("Error", "Workstation bookings require minimum 7 days stay");
        return false;
      }
    }
    
    return true;
  };

  const handleSearch = async () => {
    if (!validateSearch()) {
      return;
    }

    const query = new URLSearchParams({
      location: location,
      checkIn: formatDate(checkInDate),
      checkOut: formatDate(checkOutDate),
      people: "1", // Default to 1 since we removed the field
      stayType: stayType, // Pass workstation or hostel
    }).toString();

    router.push(`/hostels/search?${query}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Background Image */}
      <div 
        className="relative bg-gradient-to-r from-[#F47B20]/90 to-[#FF8C3A]/90 text-white"
        style={{
          backgroundImage: "url('/assets/hostel.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "multiply",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Find Your Perfect Stay
            </h1>
            <p className="text-lg sm:text-xl text-white/90">
              Hostels, Hotels & Workspaces in Chikkamagaluru
            </p>
          </div>

          {/* Search Card */}
          <Card className="max-w-4xl mx-auto shadow-2xl">
            <CardContent className="p-6">
              {/* Stay Type Tabs */}
              <div className="mb-6">
                <Tabs value={stayType} onValueChange={setStayType} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger 
                      value="hostel" 
                      className="data-[state=active]:bg-[#F47B20] data-[state=active]:text-white"
                    >
                      <BedDouble className="w-4 h-4 mr-2" />
                      Hostels
                    </TabsTrigger>
                    <TabsTrigger 
                      value="workstation"
                      className="data-[state=active]:bg-[#F47B20] data-[state=active]:text-white"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Workstation
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                {stayType === "workstation" && (
                  <p className="text-xs text-center text-gray-600 mt-2">
                    📌 Minimum 7 days stay required for workstation bookings
                  </p>
                )}
              </div>

              {/* Location - Full Width */}
              <div className="mb-4">
                <Label htmlFor="location" className="text-sm font-medium mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#F47B20]" />
                  Where
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    value={location}
                    readOnly
                    placeholder="Select hostel"
                    className="mt-1 bg-gray-50 cursor-not-allowed"
                  />
                  <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Date Pickers - 2 columns on all screens */}
              <div className="grid grid-cols-2 gap-4">
                {/* Check In Date Picker */}
                <ModernCalendar
                  label="Check-in"
                  selectedDate={checkInDate}
                  onDateChange={(date) => {
                    setCheckInDate(date);
                    // Auto-update checkout if needed
                    if (checkOutDate <= date) {
                      const newCheckOut = new Date(date);
                      if (stayType === "workstation") {
                        newCheckOut.setDate(newCheckOut.getDate() + 7);
                      } else {
                        newCheckOut.setDate(newCheckOut.getDate() + 1);
                      }
                      setCheckOutDate(newCheckOut);
                    }
                    // Auto-open checkout calendar after selecting check-in
                    setShouldOpenCheckout(true);
                  }}
                  minDate={new Date()}
                />

                {/* Check Out Date Picker */}
                <ModernCalendar
                  label="Check-out"
                  selectedDate={checkOutDate}
                  onDateChange={(date) => {
                    setCheckOutDate(date);
                    setShouldOpenCheckout(false);
                  }}
                  autoOpen={shouldOpenCheckout}
                  onClose={() => setShouldOpenCheckout(false)}
                  minDate={(() => {
                    const minDate = new Date(checkInDate);
                    if (stayType === "workstation") {
                      minDate.setDate(minDate.getDate() + 7);
                    } else {
                      minDate.setDate(minDate.getDate() + 1);
                    }
                    return minDate;
                  })()}
                />
              </div>

              {/* Search Button */}
              <Button
                className="w-full mt-6 bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 text-lg font-semibold"
                onClick={handleSearch}
                disabled={loading}
              >
                <Search className="w-5 h-5 mr-2" />
                {loading ? "Searching..." : "BOOK NOW"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BedDouble className="w-8 h-8 text-[#F47B20]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Comfortable Stays</h3>
              <p className="text-gray-600">
                Clean, comfortable rooms with modern amenities at affordable prices
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wifi className="w-8 h-8 text-[#F47B20]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">High-Speed WiFi</h3>
              <p className="text-gray-600">
                Fast, reliable internet perfect for remote work and streaming
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Coffee className="w-8 h-8 text-[#F47B20]" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Common Areas</h3>
              <p className="text-gray-600">
                Spacious common areas to relax, work, and meet fellow travelers
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trending Hostels */}
      {trendingHostels.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <TrendingUp className="w-8 h-8 text-[#F47B20]" />
              Trending Hostels
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingHostels.map((hostel) => (
              <Card key={hostel._id} className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer" onClick={() => router.push("/hostels")}>
                <div className="relative h-48">
                  <Image
                    src={hostel.images?.[0] || "/assets/happygo.jpeg"}
                    alt={hostel.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.src = "/assets/happygo.jpeg";
                    }}
                  />
                  {hostel.supportsWorkstation && (
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#F47B20]" />
                      Workstation
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="text-lg font-bold mb-2">{hostel.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span>{hostel.location}</span>
                  </div>
                  {hostel.ratings && (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold">{hostel.ratings}/5</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#F47B20] to-[#FF8C3A] text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Book Your Stay?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Search from our wide range of hostels and find the perfect match for your trip
          </p>
          <Button
            size="lg"
            className="bg-white text-[#F47B20] hover:bg-gray-100 text-lg font-semibold px-8"
            onClick={() => document.getElementById("checkIn")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Search className="w-5 h-5 mr-2" />
            Start Searching
          </Button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
