"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  MapPin,
  Calendar,
  Users,
  Plus,
  Minus,
  CheckCircle,
  AlertCircle,
  Loader2,
  BedDouble,
  CalendarIcon,
  ShoppingCart,
  Trash2,
  Star,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
  Coffee,
  Utensils,
  Wifi,
  AirVent,
  Lock,
  Armchair,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

function HostelSearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cart, setCart] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageGallery, setSelectedImageGallery] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [roomImageIndices, setRoomImageIndices] = useState({});

  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const people = searchParams.get("people") || 1;
  const location = searchParams.get("location") || "Chikkamagaluru";
  const stayType = searchParams.get("stayType") || "hostel"; // Get stayType from URL

  // Calculate nights
  const nights = checkIn && checkOut 
    ? Math.ceil((new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24))
    : 0;

  useEffect(() => {
    if (checkIn && checkOut) {
    loadHostels();
      loadCart();
    }
  }, [checkIn, checkOut, people, stayType]); // Add stayType to dependencies

  const loadHostels = async () => {
    try {
      setLoading(true);
      setError("");

      const params = {
        checkIn,
        checkOut,
        people: parseInt(people) || 1,
        location,
        stayType, // Pass stayType to backend
      };

      const response = await apiService.getAvailableHostels(params);

      if (response.success) {
        setHostels(response.data || []);
      } else {
        throw new Error(response.message || "Failed to load hostels");
      }
    } catch (error) {
      console.error("Failed to load hostels:", error);
      setError(error.message || "Failed to load hostels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await apiService.getCart();
      if (response.success && response.data) {
        setCart(response.data.hostelItems || []);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
  };

  const getRoomQuantityInCart = (hostelId, roomType, mealOption) => {
    const item = cart.find(
      (item) =>
        (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostelId &&
        item.roomType === roomType &&
        item.mealOption === mealOption
    );
    return item ? item.quantity : 0;
  };

  const addToCart = async (hostel, room, mealOption) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Login Required", "Please login to add items to cart");
      router.push("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const response = await apiService.addHostelToCart({
        hostelId: hostel._id,
        roomType: room.type,
        mealOption,
        quantity: 1,
        checkIn,
        checkOut,
        isWorkstation: stayType === "workstation", // Use stayType from URL
      });

      if (response.success) {
        await loadCart();
        toast.success("Added to Cart", "Room added successfully");
      }
    } catch (error) {
      toast.error("Error", error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const response = await apiService.removeHostelFromCart(cartItemId);
      if (response.success) {
        await loadCart();
        toast.success("Removed", "Item removed from cart");
      }
    } catch (error) {
      toast.error("Error", error.message || "Failed to remove from cart");
    }
  };

  const openImageGallery = (hostel, startIndex = 0) => {
    setSelectedImageGallery(hostel);
    setCurrentImageIndex(startIndex);
  };

  const closeImageGallery = () => {
    setSelectedImageGallery(null);
    setCurrentImageIndex(0);
  };

  const nextImage = () => {
    if (selectedImageGallery) {
      setCurrentImageIndex((prev) => 
        prev === selectedImageGallery.images.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (selectedImageGallery) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? selectedImageGallery.images.length - 1 : prev - 1
      );
    }
  };

  const getRoomImageIndex = (hostelId, roomIdx) => {
    const key = `${hostelId}-${roomIdx}`;
    return roomImageIndices[key] || 0;
  };

  const nextRoomImage = (hostelId, roomIdx, room, hostel) => {
    const key = `${hostelId}-${roomIdx}`;
    const images = room.images?.length > 0 ? room.images : hostel.images || [];
    const currentIndex = roomImageIndices[key] || 0;
    const nextIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setRoomImageIndices({ ...roomImageIndices, [key]: nextIndex });
  };

  const prevRoomImage = (hostelId, roomIdx, room, hostel) => {
    const key = `${hostelId}-${roomIdx}`;
    const images = room.images?.length > 0 ? room.images : hostel.images || [];
    const currentIndex = roomImageIndices[key] || 0;
    const prevIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setRoomImageIndices({ ...roomImageIndices, [key]: prevIndex });
  };

  const calculateSummary = () => {
    const subtotal = cart.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
    const gst = subtotal * 0.05;
    const total = subtotal + gst;
    return { subtotal, gst, total };
  };

  const handleProceedToBook = () => {
    if (cart.length === 0) {
      toast.warning("Empty Cart", "Please add rooms to proceed");
      return;
    }

    const firstItem = cart[0];
    const hostelId = typeof firstItem.hostel === "object" 
      ? firstItem.hostel._id 
      : firstItem.hostel;

    if (!hostelId) {
      toast.error("Error", "Invalid hostel data");
      return;
    }

    const selectedRoomsData = cart.map(item => ({
      roomType: item.roomType,
      mealOption: item.mealOption,
      quantity: item.quantity,
      pricePerNight: item.pricePerNight,
      numberOfNights: item.numberOfNights,
      totalPrice: item.totalPrice,
      hostelId: typeof item.hostel === "object" ? item.hostel._id : item.hostel,
      hostelName: typeof item.hostel === "object" ? item.hostel.name : "",
    }));

    const summary = calculateSummary();
    const bookingData = {
      hostelId: hostelId,
      checkIn: checkIn,
      checkOut: checkOut,
      people: parseInt(people) || 1,
      stayType: stayType, // Pass stayType (hostel or workstation)
      selectedRooms: selectedRoomsData,
      pricing: {
        basePrice: summary.subtotal,
        taxes: summary.gst,
        total: summary.total,
        gstPercentage: 5,
      },
      nights: nights,
    };

    sessionStorage.setItem("hostelBookingData", JSON.stringify(bookingData));
    router.push(`/hostels/booking/${hostelId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getAmenityIcon = (amenity) => {
    const name = amenity.toLowerCase();
    if (name.includes("wifi")) return <Wifi className="w-4 h-4" />;
    if (name.includes("air conditioner") || name.includes("ac")) return <AirVent className="w-4 h-4" />;
    if (name.includes("locker")) return <Lock className="w-4 h-4" />;
    if (name.includes("fan")) return <Armchair className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const summary = calculateSummary();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-[#F47B20] mx-auto mb-4" />
            <p className="text-gray-600">Searching for available hostels...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Error Loading Hostels</h2>
              <p className="text-gray-600 mb-6">{error}</p>
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search Criteria Header */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#F47B20]" />
                <span className="font-medium">{location}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#F47B20]" />
                <span>{formatDate(checkIn)} - {formatDate(checkOut)}</span>
              </div>
              <Separator orientation="vertical" className="h-4" />
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#F47B20]" />
                <span>{people} Guest(s)</span>
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                {nights} Night{nights !== 1 ? "s" : ""}
              </Badge>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/hostels")}
            >
              Modify Search
            </Button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold">
            {hostels.length} {hostels.length === 1 ? "Hostel" : "Hostels"} Available
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-32 md:pb-0">
          {/* Left Column - Hostels List */}
          <div className="lg:col-span-2">
            {hostels.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
                  <BedDouble className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Hostels Available</h3>
              <p className="text-gray-600 mb-6">
                    Try adjusting your search dates or location
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F]"
                onClick={() => router.push("/hostels")}
              >
                    New Search
              </Button>
            </CardContent>
          </Card>
        ) : (
              hostels.map((hostel) => (
                <Card key={hostel._id} className="overflow-hidden shadow-lg">
                  <CardContent className="p-0">
                    {/* Image Gallery Section */}
                    <div className="grid grid-cols-4 gap-2 p-4">
                      {/* Main Large Image */}
                      <div 
                        className="col-span-4 md:col-span-2 md:row-span-2 relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer group"
                        onClick={() => openImageGallery(hostel, 0)}
                      >
                        <img
                          src={hostel.images?.[0] || "/assets/happygo.jpeg"}
                          alt={hostel.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <Maximize2 className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      {/* Thumbnail Images */}
                      {hostel.images?.slice(1, 5).map((image, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group"
                          onClick={() => openImageGallery(hostel, idx + 1)}
                        >
                          <img
                            src={image}
                            alt={`${hostel.name} ${idx + 2}`}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                        </div>
                      ))}

                      {/* Show More Images Button */}
                      {hostel.images?.length > 5 && (
                        <button
                          onClick={() => openImageGallery(hostel, 0)}
                          className="relative aspect-square rounded-lg overflow-hidden bg-black/60 text-white flex flex-col items-center justify-center hover:bg-black/70 transition-colors"
                        >
                          <Maximize2 className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">+{hostel.images.length - 5}</span>
                        </button>
                      )}
                    </div>

                    <div className="p-6">
                      {/* Hostel Header */}
                      <div className="mb-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h2 className="text-xl sm:text-2xl font-bold mb-2">{hostel.name}</h2>
                            <p className="flex items-center text-gray-600 text-sm">
                              <MapPin className="w-4 h-4 mr-1" />
                              {hostel.address || hostel.location}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {hostel.description && (
                        <p className="text-gray-700 text-sm mb-6 line-clamp-2">
                          {hostel.description}
                        </p>
                      )}

                      <Separator className="my-6" />

                      {/* Room Types & Pricing */}
                      <div>
                        <h3 className="text-lg md:text-xl font-bold mb-4">Room types & Pricing</h3>
                        <div className="space-y-4">
                          {hostel.rooms?.map((room, roomIdx) => (
                            <Card key={roomIdx} className="border-2 hover:border-[#F47B20] transition-colors">
                              <CardContent className="p-3 md:p-4">
                                <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                                  {/* Room Image Carousel */}
                                  <div className="flex-shrink-0 w-full md:w-56 self-stretch">
                                    <div className="relative h-40 md:h-full rounded-lg overflow-hidden group">
                                      {(() => {
                                        const roomImages = room.images?.length > 0 ? room.images : hostel.images || [];
                                        const currentIndex = getRoomImageIndex(hostel._id, roomIdx);
                                        const currentImage = roomImages[currentIndex] || "/assets/happygo.jpeg";
                                        const hasMultipleImages = roomImages.length > 1;

                                        return (
                                          <>
                                            <img
                                              src={currentImage}
                                              alt={room.type}
                                              className="w-full h-full object-cover transition-opacity duration-300"
                                            />

                                            {/* Image Counter */}
                                            {hasMultipleImages && (
                                              <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full">
                                                {currentIndex + 1}/{roomImages.length}
                                              </div>
                                            )}

                                            {/* Beds Badge */}
                                            <div className="absolute top-2 right-2">
                                              <Badge className="bg-white/90 text-gray-900 text-[10px] md:text-xs px-1.5 py-0.5">
                                                {room.availableBeds}/{room.totalBeds} beds
                                              </Badge>
                                            </div>

                                            {/* Navigation Arrows */}
                                            {hasMultipleImages && (
                                              <>
                                                {/* Previous Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    prevRoomImage(hostel._id, roomIdx, room, hostel);
                                                  }}
                                                  className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1 md:p-1.5 rounded-full shadow-lg transition-all duration-200 z-10"
                                                  aria-label="Previous image"
                                                >
                                                  <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
                                                </button>

                                                {/* Next Button */}
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    nextRoomImage(hostel._id, roomIdx, room, hostel);
                                                  }}
                                                  className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 p-1 md:p-1.5 rounded-full shadow-lg transition-all duration-200 z-10"
                                                  aria-label="Next image"
                                                >
                                                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
                                                </button>
                                              </>
                                            )}

                                            {/* Dot Indicators */}
                                            {hasMultipleImages && (
                                              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                                {roomImages.map((_, idx) => (
                                                  <button
                                                    key={idx}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      const key = `${hostel._id}-${roomIdx}`;
                                                      setRoomImageIndices({ ...roomImageIndices, [key]: idx });
                                                    }}
                                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                                      idx === currentIndex
                                                        ? "bg-white w-4"
                                                        : "bg-white/60 hover:bg-white/80"
                                                    }`}
                                                    aria-label={`Go to image ${idx + 1}`}
                                                  />
                                                ))}
                                              </div>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  {/* Room Details */}
                                  <div className="flex-1 flex flex-col min-h-full">
                                    {/* Title & Amenities */}
                                    <div className="mb-2 md:mb-3">
                                      <h4 className="font-semibold mb-1.5 md:mb-2 text-sm md:text-base line-clamp-2">{room.type}</h4>
                                      <div className="flex flex-wrap gap-2 md:gap-3">
                                        {room.amenities?.slice(0, 4).map((amenity, idx) => (
                                          <div key={idx} className="flex items-center gap-1 text-[10px] md:text-xs text-gray-600">
                                            {getAmenityIcon(amenity)}
                                            <span className="hidden sm:inline">{amenity}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Meal Options */}
                                    <div className="space-y-2 flex-1">
                                      {/* Bed Only */}
                                      {room.calculatedPricing?.bedOnly && (
                                        <div className="bg-gray-50 rounded-lg p-2">
                                          <div className="flex items-center justify-between mb-2 md:mb-0">
                                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                              <BedDouble className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
                                              <span className="font-medium text-xs md:text-sm truncate">Bed Only</span>
                                              <div className="flex items-baseline gap-1 ml-auto">
                                                <span className="text-base md:text-lg font-bold text-[#F47B20] whitespace-nowrap">
                                                  ₹{room.calculatedPricing.bedOnly.totalPrice?.toFixed(0)}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
                                                  ₹{room.calculatedPricing.bedOnly.pricePerNight?.toFixed(0)}/night
                                                </span>
                                              </div>
                                            </div>
                                            <div className="hidden md:block ml-2">
                                              <QuantityControl
                                                quantity={getRoomQuantityInCart(hostel._id, room.type, "bedOnly")}
                                                onAdd={() => addToCart(hostel, room, "bedOnly")}
                                                onRemove={() => {
                                                  const item = cart.find(
                                                    (item) =>
                                                      (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostel._id &&
                                                      item.roomType === room.type &&
                                                      item.mealOption === "bedOnly"
                                                  );
                                                  if (item) removeFromCart(item._id);
                                                }}
                                                maxAvailable={room.availableBeds}
                                                disabled={addingToCart}
                                              />
                                            </div>
                                          </div>
                                          <div className="md:hidden flex justify-end">
                                            <QuantityControl
                                              quantity={getRoomQuantityInCart(hostel._id, room.type, "bedOnly")}
                                              onAdd={() => addToCart(hostel, room, "bedOnly")}
                                              onRemove={() => {
                                                const item = cart.find(
                                                  (item) =>
                                                    (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostel._id &&
                                                    item.roomType === room.type &&
                                                    item.mealOption === "bedOnly"
                                                );
                                                if (item) removeFromCart(item._id);
                                              }}
                                              maxAvailable={room.availableBeds}
                                              disabled={addingToCart}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Bed & Breakfast */}
                                      {room.calculatedPricing?.bedAndBreakfast && (
                                        <div className="relative bg-orange-50 rounded-lg p-2 border border-orange-200">
                                          <Badge className="absolute top-1 left-1 bg-[#F47B20] text-white text-[8px] md:text-[10px] px-1 md:px-1.5 py-0 shadow-sm z-10 font-normal">
                                            Recommended
                                          </Badge>
                                          <div className="flex items-center justify-between mb-2 md:mb-0">
                                            <div className="flex items-center gap-2 md:gap-3 flex-1 mt-4 md:mt-5 min-w-0">
                                              <Coffee className="w-3 h-3 md:w-4 md:h-4 text-[#F47B20] flex-shrink-0" />
                                              <span className="font-medium text-xs md:text-sm truncate">Bed & Breakfast</span>
                                              <div className="flex items-baseline gap-1 ml-auto">
                                                <span className="text-base md:text-lg font-bold text-[#F47B20] whitespace-nowrap">
                                                  ₹{room.calculatedPricing.bedAndBreakfast.totalPrice?.toFixed(0)}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
                                                  ₹{room.calculatedPricing.bedAndBreakfast.pricePerNight?.toFixed(0)}/night
                                                </span>
                                              </div>
                                            </div>
                                            <div className="hidden md:block ml-2">
                                              <QuantityControl
                                                quantity={getRoomQuantityInCart(hostel._id, room.type, "bedAndBreakfast")}
                                                onAdd={() => addToCart(hostel, room, "bedAndBreakfast")}
                                                onRemove={() => {
                                                  const item = cart.find(
                                                    (item) =>
                                                      (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostel._id &&
                                                      item.roomType === room.type &&
                                                      item.mealOption === "bedAndBreakfast"
                                                  );
                                                  if (item) removeFromCart(item._id);
                                                }}
                                                maxAvailable={room.availableBeds}
                                                disabled={addingToCart}
                                              />
                                            </div>
                                          </div>
                                          <div className="md:hidden flex justify-end mt-1">
                                            <QuantityControl
                                              quantity={getRoomQuantityInCart(hostel._id, room.type, "bedAndBreakfast")}
                                              onAdd={() => addToCart(hostel, room, "bedAndBreakfast")}
                                              onRemove={() => {
                                                const item = cart.find(
                                                  (item) =>
                                                    (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostel._id &&
                                                    item.roomType === room.type &&
                                                    item.mealOption === "bedAndBreakfast"
                                                );
                                                if (item) removeFromCart(item._id);
                                              }}
                                              maxAvailable={room.availableBeds}
                                              disabled={addingToCart}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Bed + Breakfast + Dinner */}
                                      {room.calculatedPricing?.bedBreakfastAndDinner && (
                                        <div className="bg-gray-50 rounded-lg p-2">
                                          <div className="flex items-center justify-between mb-2 md:mb-0">
                                            <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                                              <Utensils className="w-3 h-3 md:w-4 md:h-4 text-gray-600 flex-shrink-0" />
                                              <span className="font-medium text-xs md:text-sm truncate">Bed + Breakfast + Dinner</span>
                                              <div className="flex items-baseline gap-1 ml-auto">
                                                <span className="text-base md:text-lg font-bold text-[#F47B20] whitespace-nowrap">
                                                  ₹{room.calculatedPricing.bedBreakfastAndDinner.totalPrice?.toFixed(0)}
                                                </span>
                                                <span className="text-[10px] md:text-xs text-gray-500 whitespace-nowrap">
                                                  ₹{room.calculatedPricing.bedBreakfastAndDinner.pricePerNight?.toFixed(0)}/night
                                                </span>
                                              </div>
                                            </div>
                                            <div className="hidden md:block ml-2">
                                              <QuantityControl
                                                quantity={getRoomQuantityInCart(hostel._id, room.type, "bedBreakfastAndDinner")}
                                                onAdd={() => addToCart(hostel, room, "bedBreakfastAndDinner")}
                                                onRemove={() => {
                                                  const item = cart.find(
                                                    (item) =>
                                                      (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostel._id &&
                                                      item.roomType === room.type &&
                                                      item.mealOption === "bedBreakfastAndDinner"
                                                  );
                                                  if (item) removeFromCart(item._id);
                                                }}
                                                maxAvailable={room.availableBeds}
                                                disabled={addingToCart}
                                              />
                                            </div>
                                          </div>
                                          <div className="md:hidden flex justify-end">
                                            <QuantityControl
                                              quantity={getRoomQuantityInCart(hostel._id, room.type, "bedBreakfastAndDinner")}
                                              onAdd={() => addToCart(hostel, room, "bedBreakfastAndDinner")}
                                              onRemove={() => {
                                                const item = cart.find(
                                                  (item) =>
                                                    (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostel._id &&
                                                    item.roomType === room.type &&
                                                    item.mealOption === "bedBreakfastAndDinner"
                                                );
                                                if (item) removeFromCart(item._id);
                                              }}
                                              maxAvailable={room.availableBeds}
                                              disabled={addingToCart}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      {/* Amenities Section */}
                      {hostel.amenities && hostel.amenities.length > 0 && (
                        <>
                          <Separator className="my-6" />
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Amenities you'll get</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {hostel.amenities.map((amenity, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                  {getAmenityIcon(amenity.name || amenity)}
                                  <span>{amenity.name || amenity}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Right Column - Sticky Summary */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-6">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Summary</h3>
                    <ShoppingCart className="w-5 h-5 text-[#F47B20]" />
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-8">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">Your cart is empty</p>
                      <p className="text-gray-400 text-xs mt-1">Add rooms to proceed</p>
                    </div>
                  ) : (
                    <>
                      {/* Cart Items */}
                      <div className="space-y-3 mb-4 max-h-[400px] overflow-y-auto">
                        {cart.map((item, idx) => {
                          const hostelName = typeof item.hostel === "object" ? item.hostel?.name : "";
                            return (
                            <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                  {hostelName && (
                                    <p className="text-xs font-semibold text-[#F47B20] mb-1">
                                      {hostelName}
                                    </p>
                                  )}
                                  <h4 className="font-semibold text-sm mb-1">
                                    {item.roomType}
                                  </h4>
                                  <p className="text-xs text-gray-600 mb-1">
                                    {item.mealOption === "bedOnly" ? "Bed Only" :
                                     item.mealOption === "bedAndBreakfast" ? "Bed & Breakfast" :
                                     "Bed + Breakfast + Dinner"}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    ₹{item.pricePerNight} × {item.quantity} bed × {item.numberOfNights} night
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => removeFromCart(item._id)}
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                              <div className="flex items-center justify-between text-sm font-semibold">
                                <span>Subtotal:</span>
                                <span className="text-[#F47B20]">₹{item.totalPrice?.toFixed(2)}</span>
                              </div>
                              </div>
                            );
                        })}
                      </div>

                      <Separator className="my-4" />

                      {/* Price Breakdown */}
                      <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Base price</span>
                          <span className="font-medium">₹{summary.subtotal.toFixed(2)}</span>
                            </div>
                              <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Taxes (5%)</span>
                          <span className="font-medium">+ ₹{summary.gst.toFixed(2)}</span>
                              </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between text-lg font-bold">
                              <span>Total price</span>
                          <span className="text-[#F47B20]">₹{summary.total.toFixed(2)}</span>
                            </div>
                          </div>

                      {/* Proceed Button */}
                      <Button
                        className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold py-6"
                        onClick={handleProceedToBook}
                      >
                        Proceed to Book
                      </Button>

                      <p className="text-xs text-center text-gray-500 mt-3">
                        You can pay 25% now and rest before check-in
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
                              </div>
                            </div>

          {/* Mobile-specific sticky bottom summary */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-40">
            <div className="max-w-7xl mx-auto px-4 py-3">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center py-2 text-gray-500 text-sm">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  <span>Your cart is empty</span>
                                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  {/* Total Price */}
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Total price</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{summary.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">incl. taxes</p>
                                </div>

                  {/* Proceed Button */}
                  <Button
                    className="bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold px-6 sm:px-8 py-5 sm:py-6 rounded-xl text-sm sm:text-base whitespace-nowrap"
                    onClick={handleProceedToBook}
                  >
                    Proceed to book
                  </Button>
                                        </div>
                                          )}
                                        </div>
                                      </div>
      {/* Image Gallery Modal */}
      {selectedImageGallery && (
        <Dialog open={!!selectedImageGallery} onOpenChange={closeImageGallery}>
          <DialogContent className="max-w-5xl w-full p-0 bg-black">
            <div className="relative w-full h-[80vh]">
              {/* Close Button */}
              <button
                onClick={closeImageGallery}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-6 h-6" />
                                    </button>

              {/* Previous Button */}
                                            <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                            >
                <ChevronLeft className="w-6 h-6" />
                                            </button>

              {/* Image */}
              <img
                src={selectedImageGallery.images[currentImageIndex]}
                alt={`${selectedImageGallery.name} ${currentImageIndex + 1}`}
                className="w-full h-full object-contain"
              />

              {/* Next Button */}
                                            <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                                            >
                <ChevronRight className="w-6 h-6" />
                                            </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {currentImageIndex + 1} / {selectedImageGallery.images.length}
                                      </div>

              {/* Thumbnail Strip */}
              <div className="absolute bottom-16 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto">
                {selectedImageGallery.images.map((image, idx) => (
                                            <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentImageIndex ? "border-[#F47B20] scale-110" : "border-white/50"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                                            </button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
        )}

        </div>
      </div>

      {/* <Footer /> */}
    </div>
  );
}

// Quantity Control Component
function QuantityControl({ quantity, onAdd, onRemove, maxAvailable, disabled }) {
  return (
    <div className="flex items-center gap-2">
      {quantity === 0 ? (
        <Button
          onClick={onAdd}
          disabled={disabled || maxAvailable === 0}
          className="bg-[#F47B20] hover:bg-[#E06A0F] text-white px-6"
          size="sm"
        >
          Add
        </Button>
      ) : (
        <div className="flex items-center gap-2 bg-[#F47B20] rounded-lg">
          <Button
            onClick={onRemove}
            disabled={disabled}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#E06A0F] rounded-lg h-8 w-8 p-0"
          >
            <Minus className="w-4 h-4" />
          </Button>
          <span className="text-white font-semibold min-w-[24px] text-center">{quantity}</span>
          <Button
            onClick={onAdd}
            disabled={disabled || quantity >= maxAvailable}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-[#E06A0F] rounded-lg h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

export default function HostelSearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-12 h-12 animate-spin text-[#F47B20]" />
    </div>}>
      <HostelSearchContent />
    </Suspense>
  );
}
