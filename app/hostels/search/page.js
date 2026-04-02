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
  Tv,
  Gamepad2,
  Sparkles,
  Laptop,
  Clock,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

// Static images configuration - easily add/remove images here
// First image will be shown as large image, next 4 as small grid
const STATIC_HIGHLIGHT_IMAGES = [
  {
    url: "/assets/hostel.webp",
    title: "Happy Go Hostels — Coming Soon",
    subtitle: "Chikkamagaluru"
  },
  {
    url: "/hostel.jpg",
    title: "Cozy Stays, Great Vibes",
    subtitle: "Happy Go Hospitality"
  },
  {
    url: "/assets/hostel.webp",
    title: "Your Home Away From Home",
    subtitle: "Comfort & Community"
  },
  {
    url: "/hostel.jpg",
    title: "Explore More, Spend Less",
    subtitle: "Budget-Friendly Stays"
  },
  {
    url: "/assets/hostel.webp",
    title: "More Hostels Coming Soon",
    subtitle: "Stay Tuned"
  }
];

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

  // Get total quantity for a room across ALL meal options
  const getTotalRoomQuantityInCart = (hostelId, roomType) => {
    const items = cart.filter(
      (item) =>
        (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostelId &&
        item.roomType === roomType
    );
    return items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  };

  // Get remaining available beds for a specific meal option
  const getRemainingAvailableBeds = (hostelId, roomType, currentMealOption, totalAvailable) => {
    const totalInCart = getTotalRoomQuantityInCart(hostelId, roomType);
    const currentOptionQuantity = getRoomQuantityInCart(hostelId, roomType, currentMealOption);
    
    // Available beds = total available - (total in cart - current option quantity)
    // This allows increasing current option by moving from total pool
    return totalAvailable - (totalInCart - currentOptionQuantity);
  };

  const addToCart = async (hostel, room, mealOption) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Login Required", "Please login to add items to cart");
      router.push("/login");
      return;
    }

    // Check if adding another bed would exceed available beds
    const totalInCart = getTotalRoomQuantityInCart(hostel._id, room.type);
    if (totalInCart >= room.availableBeds) {
      toast.warning(
        "Limit Reached", 
        `Only ${room.availableBeds} bed(s) available. You have already added ${totalInCart} bed(s) across all meal options.`
      );
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

  const decrementFromCart = async (hostelId, roomType, mealOption) => {
    try {
      // Find the cart item
      const item = cart.find(
        (item) =>
          (typeof item.hostel === "object" ? item.hostel._id : item.hostel) === hostelId &&
          item.roomType === roomType &&
          item.mealOption === mealOption
      );

      if (!item) return;

      // If quantity is 1, remove the item completely
      if (item.quantity <= 1) {
        await removeFromCart(item._id);
      } else {
        // Otherwise, decrement the quantity by 1
        const response = await apiService.updateHostelCartQuantity(item._id, item.quantity - 1);
        if (response.success) {
          await loadCart();
          toast.success("Updated", "Quantity decreased");
        }
      }
    } catch (error) {
      toast.error("Error", error.message || "Failed to update cart");
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
    if (name.includes("wifi") || name.includes("internet")) return <Wifi className="w-4 h-4 text-blue-600" />;
    if (name.includes("air conditioner") || name.includes("ac")) return <AirVent className="w-4 h-4 text-cyan-600" />;
    if (name.includes("locker")) return <Lock className="w-4 h-4 text-amber-600" />;
    if (name.includes("fan")) return <Armchair className="w-4 h-4 text-gray-600" />;
    if (name.includes("theatre") || name.includes("tv")) return <Tv className="w-4 h-4 text-purple-600" />;
    if (name.includes("game") || name.includes("indoor game")) return <Gamepad2 className="w-4 h-4 text-green-600" />;
    if (name.includes("common") || name.includes("area")) return <Users className="w-4 h-4 text-orange-600" />;
    if (name.includes("desk") || name.includes("workspace") || name.includes("workstation")) return <Laptop className="w-4 h-4 text-indigo-600" />;
    if (name.includes("geyser") || name.includes("hot water")) return <Sparkles className="w-4 h-4 text-red-600" />;
    if (name.includes("parking")) return <CheckCircle className="w-4 h-4 text-green-600" />;
    if (name.includes("laundry")) return <CheckCircle className="w-4 h-4 text-blue-600" />;
    if (name.includes("washroom") || name.includes("bathroom")) return <CheckCircle className="w-4 h-4 text-teal-600" />;
    return <CheckCircle className="w-4 h-4 text-gray-600" />;
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

        {/* Static Highlight Images Gallery */}
        <div className="mb-6 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
            {/* Large Image - Left Side */}
            <div 
              className="relative aspect-[4/3] md:row-span-2 rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all"
              onClick={() => {
                // Open modal with all static images
                const staticGalleryData = {
                  images: STATIC_HIGHLIGHT_IMAGES.map(img => img.url),
                  name: `${location} Highlights`
                };
                openImageGallery(staticGalleryData, 0);
              }}
            >
              <img
                src={STATIC_HIGHLIGHT_IMAGES[0]?.url}
                alt={STATIC_HIGHLIGHT_IMAGES[0]?.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => { e.currentTarget.src = "/assets/happygo.jpeg"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <p className="text-sm font-semibold text-orange-300 mb-1">{STATIC_HIGHLIGHT_IMAGES[0]?.subtitle}</p>
                <h3 className="text-base md:text-lg font-bold leading-tight">{STATIC_HIGHLIGHT_IMAGES[0]?.title}</h3>
              </div>
            </div>

            {/* Small Images Grid - Right Side */}
            <div className="grid grid-cols-2 gap-2 md:gap-3">
              {STATIC_HIGHLIGHT_IMAGES.slice(1, 5).map((image, idx) => (
                <div 
                  key={idx}
                  className="relative aspect-[4/3] rounded-xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all"
                  onClick={() => {
                    const staticGalleryData = {
                      images: STATIC_HIGHLIGHT_IMAGES.map(img => img.url),
                      name: `${location} Highlights`
                    };
                    openImageGallery(staticGalleryData, idx + 1);
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { e.currentTarget.src = "/assets/happygo.jpeg"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                    <p className="text-[10px] font-semibold text-orange-300 mb-0.5">{image.subtitle}</p>
                    <h3 className="text-xs font-bold leading-tight line-clamp-2">{image.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gallery Button */}
          <button
            onClick={() => {
              const staticGalleryData = {
                images: STATIC_HIGHLIGHT_IMAGES.map(img => img.url),
                name: `${location} Highlights`
              };
              openImageGallery(staticGalleryData, 0);
            }}
            className="absolute bottom-3 right-3 bg-white hover:bg-gray-50 text-gray-800 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-semibold transition-all hover:shadow-xl z-10"
          >
            <Maximize2 className="w-4 h-4" />
            Gallery
          </button>
        </div>

        {/* Location Title & Description */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            {location}
          </h1>
          <p className="text-base text-gray-700 leading-relaxed">
            The perfect place to unwind and explore Chikkamagaluru's scenic beauty and serene atmosphere. 
            Surrounded by lush coffee plantations, misty mountains, and breathtaking waterfalls, our hostel 
            is ideally located for nature lovers and adventure seekers. Enjoy trekking, plantation tours, 
            and the tranquil charm of Karnataka's hill station paradise.
          </p>
        </div>

        {/* Results Title */}
        <div className="mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Room types & Pricing
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose from our available room options below
          </p>
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
              <>
                {/* All Rooms Flattened */}
                <div className="space-y-6">
                  {hostels.flatMap((hostel) =>
                    hostel.rooms?.map((room, roomIdx) => (
                      <Card key={`${hostel._id}-${roomIdx}`} className="border-2 hover:border-[#F47B20] transition-all shadow-md hover:shadow-lg rounded-xl overflow-hidden">
                  <CardContent className="p-0">
                                <div className="flex flex-col lg:flex-row">
                                  {/* Room Image Carousel */}
                                  <div className="flex-shrink-0 w-full lg:w-96 relative group">
                                    <div 
                                      className="relative h-64 lg:h-full cursor-pointer rounded-xl lg:rounded-l-xl lg:rounded-r-none overflow-hidden"
                                      onClick={() => {
                                        const roomImages = room.images?.length > 0 ? room.images : hostel.images || [];
                                        const currentIndex = getRoomImageIndex(hostel._id, roomIdx);
                                        const roomGalleryData = {
                                          images: roomImages,
                                          name: room.type
                                        };
                                        openImageGallery(roomGalleryData, currentIndex);
                                      }}
                                    >
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
                                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />

                                            {/* Hover Overlay */}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                              <div className="bg-white/90 text-gray-800 px-3 py-2 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                <Maximize2 className="w-4 h-4" />
                                                <span className="text-sm font-medium">View Larger</span>
                                              </div>
                                            </div>

                                            {/* Image Counter */}
                                            {hasMultipleImages && (
                                              <div className="absolute top-3 left-3 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-medium">
                                                {currentIndex + 1}/{roomImages.length}
                                              </div>
                                            )}

                                            {/* Navigation Arrows */}
                                            {hasMultipleImages && (
                                              <>
                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    prevRoomImage(hostel._id, roomIdx, room, hostel);
                                                  }}
                                                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-2 rounded-full shadow-xl transition-all z-10"
                                                  aria-label="Previous image"
                                                >
                                                  <ChevronLeft className="w-5 h-5" />
                                                </button>

                                                <button
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    nextRoomImage(hostel._id, roomIdx, room, hostel);
                                                  }}
                                                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white text-gray-800 p-2 rounded-full shadow-xl transition-all z-10"
                                                  aria-label="Next image"
                                                >
                                                  <ChevronRight className="w-5 h-5" />
                                                </button>
                                              </>
                                            )}
                                          </>
                                        );
                                      })()}
                                    </div>
                                  </div>

                                  {/* Room Details */}
                                  <div className="flex-1 p-4 lg:p-5">
                                    {/* Room Header */}
                                    <div className="mb-4">
                                      <div className="flex items-start justify-between gap-3 mb-3">
                                        <h4 className="font-bold text-base lg:text-lg flex-1">{room.type}</h4>
                                        {(() => {
                                          const totalInCart = getTotalRoomQuantityInCart(hostel._id, room.type);
                                          const actualRemaining = room.availableBeds - totalInCart;
                                          return (
                                            <Badge className={`whitespace-nowrap ${
                                              actualRemaining === 0 
                                                ? "bg-red-100 text-red-700 border-red-300" 
                                                : actualRemaining <= 2
                                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                                : "bg-green-100 text-green-700 border-green-300"
                                            }`}>
                                              {actualRemaining} of {room.availableBeds} beds left
                                            </Badge>
                                          );
                                        })()}
                                      </div>
                                      
                                      {/* Capacity Info */}
                                      {/* <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                                        <Users className="w-4 h-4" />
                                        <span>{room.capacity === 1 ? "1 Adult" : `${room.capacity} Adults`}</span>
                                      </div> */}

                                      {/* Amenities Grid */}
                                      <div className="flex flex-wrap gap-3 mb-3">
                                        {room.amenities?.slice(0, 6).map((amenity, idx) => (
                                          <div key={idx} className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 px-2.5 py-1.5 rounded-md">
                                            {getAmenityIcon(amenity)}
                                            <span>{amenity}</span>
                                          </div>
                                        ))}
                                        {room.amenities?.length > 6 && (
                                          <div className="text-xs text-[#F47B20] font-medium px-2.5 py-1.5">
                                            +{room.amenities.length - 6} more
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <Separator className="my-4" />

                                    {/* Meal Options */}
                              
                                    <div className="space-y-3">
                                      {/* Bed Only */}
                                      {room.calculatedPricing?.bedOnly && (
                                        <div className="border border-gray-200 rounded-lg p-3 bg-white hover:border-[#F47B20] transition-colors">
                                          <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <BedDouble className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                <span className="font-semibold text-sm">Bed Only</span>
                                              </div>
                                              <div className="flex items-baseline gap-2">
                                                {room.calculatedPricing.bedOnly.discountApplied && (
                                                  <span className="text-xs text-gray-400 line-through">
                                                    ₹{room.calculatedPricing.bedOnly.originalPrice?.toFixed(0)}
                                                  </span>
                                                )}
                                                <span className="text-xl font-bold text-[#F47B20]">
                                                  ₹{room.calculatedPricing.bedOnly.totalPrice?.toFixed(0)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  /night
                                                </span>
                                              </div>
                                             
                                            </div>
                                              <QuantityControl
                                                quantity={getRoomQuantityInCart(hostel._id, room.type, "bedOnly")}
                                                onAdd={() => addToCart(hostel, room, "bedOnly")}
                                              onRemove={() => decrementFromCart(hostel._id, room.type, "bedOnly")}
                                              maxAvailable={getRemainingAvailableBeds(hostel._id, room.type, "bedOnly", room.availableBeds)}
                                              disabled={addingToCart}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Bed & Breakfast */}
                                      {room.calculatedPricing?.bedAndBreakfast && (
                                        <div className="relative border-2 border-[#F47B20] rounded-lg p-3 bg-orange-50">
                                          <Badge className="absolute -top-2.5 left-3 bg-[#F47B20] text-white text-[10px] px-2 py-0.5 shadow-sm">
                                            Recommended
                                          </Badge>
                                          <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Coffee className="w-4 h-4 text-[#F47B20] flex-shrink-0" />
                                                <span className="font-semibold text-sm">Bed & Breakfast</span>
                                              </div>
                                              <div className="flex items-baseline gap-2">
                                                {room.calculatedPricing.bedAndBreakfast.discountApplied && (
                                                  <span className="text-xs text-gray-400 line-through">
                                                    ₹{room.calculatedPricing.bedAndBreakfast.originalPrice?.toFixed(0)}
                                                  </span>
                                                )}
                                                <span className="text-xl font-bold text-[#F47B20]">
                                                  ₹{room.calculatedPricing.bedAndBreakfast.totalPrice?.toFixed(0)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  /night
                                                </span>
                                              </div>
                                              {/* {room.calculatedPricing.bedAndBreakfast.discountApplied && (
                                                <Badge className="mt-1.5 bg-green-100 text-green-700 text-[10px] border-green-300">
                                                  Save ₹{room.calculatedPricing.bedAndBreakfast.savings?.toFixed(0)}
                                                </Badge>
                                              )} */}
                                            </div>
                                              <QuantityControl
                                                quantity={getRoomQuantityInCart(hostel._id, room.type, "bedAndBreakfast")}
                                                onAdd={() => addToCart(hostel, room, "bedAndBreakfast")}
                                              onRemove={() => decrementFromCart(hostel._id, room.type, "bedAndBreakfast")}
                                              maxAvailable={getRemainingAvailableBeds(hostel._id, room.type, "bedAndBreakfast", room.availableBeds)}
                                              disabled={addingToCart}
                                            />
                                          </div>
                                        </div>
                                      )}

                                      {/* Bed + Breakfast + Dinner */}
                                      {room.calculatedPricing?.bedBreakfastAndDinner && (
                                        <div className="border border-gray-200 rounded-lg p-3 bg-white hover:border-[#F47B20] transition-colors">
                                          <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                              <div className="flex items-center gap-2 mb-2">
                                                <Utensils className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                                <span className="font-semibold text-sm">Bed + Breakfast + Dinner</span>
                                              </div>
                                              <div className="flex items-baseline gap-2">
                                                {room.calculatedPricing.bedBreakfastAndDinner.discountApplied && (
                                                  <span className="text-xs text-gray-400 line-through">
                                                    ₹{room.calculatedPricing.bedBreakfastAndDinner.originalPrice?.toFixed(0)}
                                                  </span>
                                                )}
                                                <span className="text-xl font-bold text-[#F47B20]">
                                                  ₹{room.calculatedPricing.bedBreakfastAndDinner.totalPrice?.toFixed(0)}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                  /night
                                                </span>
                                              </div>
                                              {/* {room.calculatedPricing.bedBreakfastAndDinner.discountApplied && (
                                                <Badge className="mt-1.5 bg-green-100 text-green-700 text-[10px] border-green-300">
                                                  Save ₹{room.calculatedPricing.bedBreakfastAndDinner.savings?.toFixed(0)}
                                                </Badge>
                                              )} */}
                                            </div>
                                              <QuantityControl
                                                quantity={getRoomQuantityInCart(hostel._id, room.type, "bedBreakfastAndDinner")}
                                                onAdd={() => addToCart(hostel, room, "bedBreakfastAndDinner")}
                                              onRemove={() => decrementFromCart(hostel._id, room.type, "bedBreakfastAndDinner")}
                                              maxAvailable={getRemainingAvailableBeds(hostel._id, room.type, "bedBreakfastAndDinner", room.availableBeds)}
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
                    ))
                  ) || []}
                      </div>

                {/* Single Amenities Section at the End */}
                {hostels.length > 0 && hostels[0]?.amenities && hostels[0].amenities.length > 0 && (
                  <Card className="mt-8 shadow-lg rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-6">Amenities you'll get</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {hostels[0].amenities.map((amenity, idx) => (
                          <div key={idx} className="flex items-center gap-2.5 text-sm text-gray-700 bg-gray-50 px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors">
                                  {getAmenityIcon(amenity.name || amenity)}
                            <span className="font-medium">{amenity.name || amenity}</span>
                                </div>
                              ))}
                            </div>
                    </CardContent>
                  </Card>
                )}

                {/* Guidelines Section */}
                {hostels.length > 0 && (
                  <Card className="mt-8 shadow-lg rounded-xl overflow-hidden">
                    <CardContent className="p-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Guidelines</h3>
                      
                      {/* Check-in/Check-out Times */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-100 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                    </div>
                          <div>
                            <p className="text-sm text-gray-600">Check in:</p>
                            <p className="text-xl font-bold text-gray-900">1:00 PM</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg">
                            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Check out:</p>
                            <p className="text-xl font-bold text-gray-900">10:00 AM</p>
                          </div>
                        </div>
                      </div>

                      {/* Guidelines List */}
                      <ul className="space-y-4">
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">All guests must carry a Govt. photo ID (PAN card not accepted).</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">Local IDs are not accepted.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">Non-resident visitors are not allowed beyond the reception/common areas.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">
                            <span className="font-semibold">Cancellations/Modifications:</span> Free up to 5 days (120 hours) before the standard check-in time.
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">
                            <span className="font-semibold">Please note:</span> All bookings between 20 Dec and 3 Jan are Non-Refundable
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">No-shows are charged 100% of the reservation.</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <span className="flex-shrink-0 w-1.5 h-1.5 bg-red-500 rounded-full mt-2"></span>
                          <span className="text-gray-700">No refunds for early departures.</span>
                        </li>
                      </ul>
                  </CardContent>
                </Card>
                )}
              </>
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
