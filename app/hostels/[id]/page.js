"use client";

import { useState, useEffect, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Users,
  Star,
  Wifi,
  Coffee,
  Home,
  Clock,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ImageIcon,
  Phone,
  Mail,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import { apiService } from "@/lib/api";

function HostelDetailsContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [hostel, setHostel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedRooms, setSelectedRooms] = useState({});
  const [showAllImages, setShowAllImages] = useState(false);

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const people = parseInt(searchParams.get("people") || "2");
  const stayType = searchParams.get("stayType") || "hostel";

  useEffect(() => {
    if (params.id) {
      loadHostelDetails();
    }
  }, [params.id]);

  const loadHostelDetails = async () => {
    try {
      setLoading(true);
      setError("");

      const queryParams = {
        checkIn,
        checkOut,
        people: people.toString(),
        stayType,
      };

      const response = await apiService.getHostelDetails(params.id, queryParams);

      if (response.success && response.data) {
        setHostel(response.data);
      } else {
        throw new Error(response.message || "Failed to load hostel details");
      }
    } catch (error) {
      console.error("Failed to load hostel details:", error);
      setError(error.message || "Failed to load hostel details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAmenityIcon = (amenityName) => {
    const name = amenityName.toLowerCase();
    if (name.includes("wifi")) return <Wifi className="w-5 h-5" />;
    if (name.includes("desk")) return <Coffee className="w-5 h-5" />;
    if (name.includes("common")) return <Home className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  const handleRoomQuantityChange = (roomId, priceOption, quantity) => {
    setSelectedRooms((prev) => {
      const newSelected = { ...prev };
      if (quantity === 0) {
        delete newSelected[roomId];
      } else {
        newSelected[roomId] = {
          quantity,
          priceOption,
        };
      }
      return newSelected;
    });
  };

  const getTotalSelectedRooms = () => {
    return Object.values(selectedRooms).reduce(
      (sum, room) => sum + room.quantity,
      0
    );
  };

  const calculateSummary = () => {
    let basePrice = 0;
    let totalSavings = 0;

    Object.entries(selectedRooms).forEach(([roomId, selection]) => {
      const room = hostel?.rooms?.find((r) => r._id === roomId);
      if (room && room.calculatedPricing) {
        const pricing = room.calculatedPricing[selection.priceOption];
        if (pricing) {
          basePrice += pricing.totalPrice * selection.quantity;
          totalSavings += (pricing.savings || 0) * selection.quantity;
        }
      }
    });

    const gstPercentage = 5;
    const taxes = (basePrice * gstPercentage) / 100;
    const discount = totalSavings;
    const total = basePrice + taxes - discount;

    return {
      basePrice,
      taxes,
      discount,
      total,
      gstPercentage,
    };
  };

  const handleProceedToBook = () => {
    if (getTotalSelectedRooms() === 0) {
      return;
    }

    const summary = calculateSummary();
    
    // Prepare booking data
    const bookingData = {
      hostelId: hostel._id,
      checkIn,
      checkOut,
      people,
      stayType,
      selectedRooms: Object.entries(selectedRooms).map(([roomId, selection]) => {
        const room = hostel.rooms.find((r) => r._id === roomId);
        return {
          roomId,
          roomType: room.type,
          quantity: selection.quantity,
          priceOption: selection.priceOption,
          pricePerUnit:
            room.calculatedPricing[selection.priceOption].pricePerNight,
          totalPrice:
            room.calculatedPricing[selection.priceOption].totalPrice *
            selection.quantity,
        };
      }),
      pricing: summary,
    };

    // Store in sessionStorage and navigate
    sessionStorage.setItem("hostelBookingData", JSON.stringify(bookingData));
    router.push(`/hostels/booking/${hostel._id}`);
  };

  const nextImage = () => {
    if (hostel?.images) {
      setCurrentImageIndex((prev) =>
        prev === hostel.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (hostel?.images) {
      setCurrentImageIndex((prev) =>
        prev === 0 ? hostel.images.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading hostel details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Hostel Not Found</h2>
              <p className="text-gray-600 mb-6">
                {error || "The hostel you're looking for doesn't exist."}
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F]"
                onClick={() => router.push("/hostels")}
              >
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const summary = calculateSummary();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Images */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Results
          </Button>

          {/* Image Gallery */}
          <div className="relative h-96 rounded-xl overflow-hidden mb-6">
            <img
              src={hostel.images?.[currentImageIndex] || "/assets/happygo.jpeg"}
              alt={hostel.name}
              className="w-full h-full object-cover"
            />
            
            {hostel.images && hostel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {hostel.images.length}
                </div>
              </>
            )}
            
            <Button
              variant="secondary"
              size="sm"
              className="absolute bottom-4 right-4"
              onClick={() => setShowAllImages(true)}
            >
              <ImageIcon className="w-4 h-4 mr-2" />
              View all photos
            </Button>
          </div>

          {/* Hostel Header Info */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hostel.name}</h1>
                <p className="text-gray-600 flex items-center mb-2">
                  <MapPin className="w-5 h-5 mr-2" />
                  {hostel.address || hostel.location}
                </p>
              </div>
              <Badge className="bg-yellow-400 text-black text-sm px-3 py-1">
                Booked by 200+ this week
              </Badge>
            </div>

            <p className="text-gray-700 mb-4">{hostel.description}</p>

            {/* Booking Details Summary */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Check-in</p>
                    <p className="font-semibold">
                      {formatDate(checkIn)} | {hostel.checkInTime || "1:00 PM"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Check-out</p>
                    <p className="font-semibold">
                      {formatDate(checkOut)} | {hostel.checkOutTime || "10:00 AM"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Duration</p>
                    <p className="font-semibold">
                      {hostel.bookingDetails?.nights || 1} Night(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Guests</p>
                    <p className="font-semibold">{people} Guest(s)</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Rooms & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Room Types & Pricing */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-6">Room types & Pricing</h2>

                <div className="space-y-6">
                  {hostel.rooms?.map((room) => (
                    <Card key={room._id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4">
                          {/* Room Image */}
                          {room.images && room.images[0] && (
                            <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={room.images[0]}
                                alt={room.type}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Room Details */}
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">
                              {room.type}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                              {room.description}
                            </p>

                            {/* Room Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities.map((amenity, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-xs"
                                  >
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            <p className="text-sm text-gray-600">
                              <Users className="w-4 h-4 inline mr-1" />
                              Capacity: {room.capacity} person(s) • Available:{" "}
                              {room.availableRooms || 0} room(s)
                            </p>

                            {/* Price Options */}
                            {room.calculatedPricing && (
                              <div className="mt-4 space-y-3">
                                {Object.entries(room.calculatedPricing).map(
                                  ([option, pricing]) => {
                                    if (!pricing) return null;
                                    
                                    const optionLabels = {
                                      bedOnly: "Bed Only",
                                      bedAndBreakfast: "Bed + Breakfast",
                                      bedBreakfastAndDinner:
                                        "Bed + Breakfast + Dinner",
                                    };

                                    const currentSelection = selectedRooms[room._id];
                                    const isSelected =
                                      currentSelection?.priceOption === option;
                                    const quantity = isSelected
                                      ? currentSelection.quantity
                                      : 0;

                                    return (
                                      <div
                                        key={option}
                                        className={`border rounded-lg p-4 ${
                                          isSelected
                                            ? "border-[#F47B20] bg-orange-50"
                                            : "border-gray-200"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <p className="font-semibold mb-1">
                                              {optionLabels[option]}
                                            </p>
                                            <div className="flex items-baseline gap-2">
                                              <span className="text-2xl font-bold text-[#F47B20]">
                                                ₹{pricing.pricePerNight.toFixed(2)}
                                              </span>
                                              <span className="text-sm text-gray-600">
                                                /night
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-600">
                                              Total: ₹{pricing.totalPrice.toFixed(2)}{" "}
                                              for {hostel.bookingDetails?.nights || 1}{" "}
                                              night(s)
                                            </p>
                                            {pricing.savings > 0 && (
                                              <Badge
                                                variant="secondary"
                                                className="mt-2 bg-green-100 text-green-800"
                                              >
                                                Save ₹{pricing.savings.toFixed(2)}
                                              </Badge>
                                            )}
                                          </div>

                                          {/* Quantity Selector */}
                                          <div className="flex items-center gap-3">
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="h-8 w-8 p-0"
                                              onClick={() =>
                                                handleRoomQuantityChange(
                                                  room._id,
                                                  option,
                                                  Math.max(0, quantity - 1)
                                                )
                                              }
                                              disabled={quantity === 0}
                                            >
                                              <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="w-8 text-center font-semibold">
                                              {quantity}
                                            </span>
                                            <Button
                                              size="sm"
                                              className="h-8 w-8 p-0 bg-[#F47B20] hover:bg-[#E06A0F]"
                                              onClick={() =>
                                                handleRoomQuantityChange(
                                                  room._id,
                                                  option,
                                                  quantity + 1
                                                )
                                              }
                                              disabled={
                                                quantity >= (room.availableRooms || 0)
                                              }
                                            >
                                              <Plus className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Amenities & Other Details */}
            <Card>
              <CardContent className="p-6">
                <Tabs defaultValue="amenities">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="amenities">Amenities</TabsTrigger>
                    <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
                    <TabsTrigger value="policies">Policies</TabsTrigger>
                  </TabsList>

                  <TabsContent value="amenities" className="mt-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {hostel.amenities?.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          {getAmenityIcon(amenity.name)}
                          <div>
                            <p className="font-medium text-sm">{amenity.name}</p>
                            {amenity.description && (
                              <p className="text-xs text-gray-600">
                                {amenity.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="guidelines" className="mt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <Clock className="w-5 h-5 text-[#F47B20]" />
                          Check-in/Check-out
                        </h3>
                        <div className="space-y-2 ml-7">
                          <p className="text-sm">
                            Check-in: {hostel.checkInTime || "1:00 PM"}
                          </p>
                          <p className="text-sm">
                            Check-out: {hostel.checkOutTime || "10:00 AM"}
                          </p>
                        </div>
                      </div>

                      {hostel.policies?.checkIn && (
                        <div>
                          <h3 className="font-semibold mb-3">Check-in Guidelines</h3>
                          <ul className="space-y-2">
                            {hostel.policies.checkIn.map((policy, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                                <span>{policy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {hostel.policies?.house && (
                        <div>
                          <h3 className="font-semibold mb-3">Property Guidelines</h3>
                          <ul className="space-y-2">
                            {hostel.policies.house.map((policy, idx) => (
                              <li key={idx} className="text-sm flex items-start gap-2">
                                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                                <span>{policy}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="policies" className="mt-6">
                    {hostel.policies?.cancellation && (
                      <div>
                        <h3 className="font-semibold mb-3">
                          Cancellation policy
                        </h3>
                        <ul className="space-y-2">
                          {hostel.policies.cancellation.map((policy, idx) => (
                            <li key={idx} className="text-sm flex items-start gap-2">
                              <XCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                              <span>{policy}</span>
                            </li>
                          ))}
                        </ul>
                        <Card className="bg-red-50 border-red-200 mt-4">
                          <CardContent className="p-4">
                            <p className="text-sm text-red-800 font-medium">
                              ⚠️ This will be a fully non-refundable booking
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Getting Here Section */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Getting Here</h2>
                <p className="text-gray-700 mb-4">{hostel.address}</p>
                
                {hostel.contactInfo && (
                  <div className="space-y-2">
                    {hostel.contactInfo.phone && (
                      <a
                        href={`tel:${hostel.contactInfo.phone}`}
                        className="flex items-center gap-2 text-[#F47B20] hover:underline"
                      >
                        <Phone className="w-4 h-4" />
                        {hostel.contactInfo.phone}
                      </a>
                    )}
                    {hostel.contactInfo.email && (
                      <a
                        href={`mailto:${hostel.contactInfo.email}`}
                        className="flex items-center gap-2 text-[#F47B20] hover:underline"
                      >
                        <Mail className="w-4 h-4" />
                        {hostel.contactInfo.email}
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Price Summary</h2>

                {getTotalSelectedRooms() === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600 text-sm mb-2">
                      No rooms selected
                    </p>
                    <p className="text-gray-500 text-xs">
                      Select room type and quantity to see pricing
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base price</span>
                        <span className="font-medium">
                          ₹{summary.basePrice.toFixed(2)}
                        </span>
                      </div>

                      {summary.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Discount</span>
                          <span className="font-medium text-green-600">
                            - ₹{summary.discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          Taxes ({summary.gstPercentage}%)
                        </span>
                        <span className="font-medium">
                          + ₹{summary.taxes.toFixed(2)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <span className="font-bold text-lg">Total</span>
                        <span className="font-bold text-2xl text-[#F47B20]">
                          ₹{summary.total.toFixed(2)}
                        </span>
                      </div>

                      <Card className="bg-yellow-50 border-yellow-200">
                        <CardContent className="p-3">
                          <p className="text-xs text-center">
                            🎉 You are saving{" "}
                            <span className="font-bold text-green-700">
                              ₹{summary.discount.toFixed(2)}
                            </span>{" "}
                            in this booking
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Button
                      className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold py-6"
                      onClick={handleProceedToBook}
                    >
                      Proceed to Book
                    </Button>

                    <Card className="bg-blue-50 border-blue-200 mt-4">
                      <CardContent className="p-3">
                        <p className="text-xs text-center text-blue-800">
                          💰 Pay only 25% now, rest later
                        </p>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* Selected Rooms Summary */}
                {getTotalSelectedRooms() > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-semibold text-sm mb-3">
                      Selected Rooms ({getTotalSelectedRooms()})
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(selectedRooms).map(([roomId, selection]) => {
                        const room = hostel.rooms.find((r) => r._id === roomId);
                        const optionLabels = {
                          bedOnly: "Bed Only",
                          bedAndBreakfast: "Bed + Breakfast",
                          bedBreakfastAndDinner: "Bed + Breakfast + Dinner",
                        };

                        return (
                          <div key={roomId} className="text-xs bg-gray-50 p-2 rounded">
                            <p className="font-medium">{room?.type}</p>
                            <p className="text-gray-600">
                              {optionLabels[selection.priceOption]} × {selection.quantity}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default function HostelDetailsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20]"></div>
        </div>
      }
    >
      <HostelDetailsContent />
    </Suspense>
  );
}

