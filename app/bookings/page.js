"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Clock,
  Phone,
  ArrowRight,
  Plus,
  CreditCard,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bike,
  Search,
  Filter,
  Calendar,
  MapPin,
  Timer,
  IndianRupee,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [extendData, setExtendData] = useState({
    newEndDate: "",
    newEndTime: "",
    reason: "",
  });
  const [extendLoading, setExtendLoading] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await apiService.getBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendBooking = async () => {
    if (!selectedBooking || !extendData.newEndDate || !extendData.newEndTime) {
      toast.warning("Missing info", "Please fill in all required fields");
      return;
    }

    setExtendLoading(true);
    try {
      await apiService.extendBooking(selectedBooking._id, extendData);
      setShowExtendModal(false);
      setExtendData({ newEndDate: "", newEndTime: "", reason: "" });
      loadBookings();
      toast.success("Extended!", "Your booking has been extended successfully");
    } catch (error) {
      toast.error(
        "Extension failed",
        error.message || "Failed to extend booking"
      );
    } finally {
      setExtendLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "cancelled":
        return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "completed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  // Helper function to get bike info from bikeItems
  const getBikeInfo = (booking) => {
    if (booking.bikeItems && booking.bikeItems.length > 0) {
      const firstBike = booking.bikeItems[0];
      return {
        title: firstBike.bike?.title || `Bike ${firstBike.bike || "Unknown"}`,
        images: firstBike.bike?.images || [],
        totalQuantity: booking.bikeItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        ),
        totalPrice: booking.bikeItems.reduce(
          (sum, item) => sum + item.totalPrice,
          0
        ),
      };
    }
    return {
      title: "Unknown Bike",
      images: [],
      totalQuantity: 0,
      totalPrice: 0,
    };
  };

  const filteredBookings = bookings.filter((booking) => {
    const bikeInfo = getBikeInfo(booking);
    const matchesStatus =
      filterStatus === "all" || booking.bookingStatus === filterStatus;
    const matchesSearch =
      bikeInfo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statusOptions = [
    { value: "all", label: "All", count: bookings.length },
    {
      value: "confirmed",
      label: "Confirmed",
      count: bookings.filter((b) => b.bookingStatus === "confirmed").length,
    },
    {
      value: "pending",
      label: "Pending",
      count: bookings.filter((b) => b.bookingStatus === "pending").length,
    },
    {
      value: "completed",
      label: "Completed",
      count: bookings.filter((b) => b.bookingStatus === "completed").length,
    },
    {
      value: "cancelled",
      label: "Cancelled",
      count: bookings.filter((b) => b.bookingStatus === "cancelled").length,
    },
  ];

  // Mobile Filter Modal Component
  const MobileFilterModal = () => (
    <Dialog open={showFilters} onOpenChange={setShowFilters}>
      <DialogContent className="sm:max-w-md mx-4 sm:mx-auto max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Filter Bookings
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(false)}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-3">
          <div>
            <Label className="text-base font-medium mb-3 block">Status</Label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    filterStatus === status.value ? "default" : "outline"
                  }
                  className={`w-full justify-between ${
                    filterStatus === status.value
                      ? "bg-[#F47B20] hover:bg-[#E06A0F]"
                      : ""
                  }`}
                  onClick={() => {
                    setFilterStatus(status.value);
                    setShowFilters(false);
                  }}
                >
                  <span>{status.label}</span>
                  <Badge variant="secondary" className="ml-2">
                    {status.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-[#F47B20]"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        {/* Mobile Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F47B20] rounded-xl flex items-center justify-center mr-3 sm:mr-4">
              <Image
                src="/assets/happygo.jpeg"
                alt="Happy Go"
                width={20}
                height={20}
                className="object-contain sm:w-6 sm:h-6"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                My Bookings
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your bike rentals
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3 sm:space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by bike name or booking ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 sm:h-11"
              />
            </div>

            {/* Desktop Filters */}
            <div className="hidden lg:flex gap-2 flex-wrap">
              {statusOptions.map((status) => (
                <Button
                  key={status.value}
                  variant={
                    filterStatus === status.value ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setFilterStatus(status.value)}
                  className={`${
                    filterStatus === status.value
                      ? "bg-[#F47B20] hover:bg-[#E06A0F]"
                      : ""
                  }`}
                >
                  {status.label}
                  {status.count > 0 && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {status.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>

            {/* Mobile Filter Button */}
            <div className="flex lg:hidden justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(true)}
                className="flex items-center"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown className="w-4 h-4 ml-1" />
              </Button>
              <div className="text-sm text-gray-600">
                {filteredBookings.length} booking
                {filteredBookings.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 text-sm sm:text-base">
            {error}
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <Card className="text-center py-8 sm:py-12">
            <CardContent className="px-4 sm:px-6">
              <Bike className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                No Bookings Found
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-md mx-auto">
                {searchTerm || filterStatus !== "all"
                  ? "No bookings match your current filters."
                  : "You haven't made any bookings yet. Start exploring our bikes!"}
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white w-full sm:w-auto"
                asChild
              >
                <Link href="/">Browse Bikes</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {filteredBookings.map((booking) => {
              const bikeInfo = getBikeInfo(booking);

              return (
                <Card
                  key={booking._id}
                  className="hover:shadow-lg transition-all duration-200 overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      {/* Header with Status */}
                      <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`${getStatusColor(
                              booking.bookingStatus
                            )} border text-xs`}
                          >
                            {getStatusIcon(booking.bookingStatus)}
                            <span className="ml-1 capitalize">
                              {booking.bookingStatus}
                            </span>
                          </Badge>
                          <Badge
                            className={`${getStatusColor(
                              booking.paymentStatus
                            )} border text-xs`}
                          >
                            <CreditCard className="w-3 h-3" />
                            <span className="ml-1 capitalize">
                              {booking.paymentStatus}
                            </span>
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">
                          ID: {booking._id.slice(-8)}
                        </p>
                      </div>

                      {/* Content */}
                      <div className="p-4 space-y-4">
                        {/* Bike Info */}
                        <div className="flex space-x-3">
                          <div className="w-20 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                            <Image
                              src={
                                bikeInfo.images[0] ||
                                "/placeholder.svg?height=64&width=80"
                              }
                              alt={bikeInfo.title}
                              width={80}
                              height={64}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-sm truncate">
                              {bikeInfo.title}
                            </h3>
                            {bikeInfo.totalQuantity > 1 && (
                              <p className="text-xs text-gray-500">
                                {bikeInfo.totalQuantity} bikes
                              </p>
                            )}
                            <div className="flex items-center mt-1">
                              <IndianRupee className="w-4 h-4 text-[#F47B20]" />
                              <span className="font-bold text-[#F47B20] text-lg">
                                {booking.priceDetails?.totalAmount?.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Pickup
                            </div>
                            <div className="font-medium">
                              {new Date(booking.startDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </div>
                            <div className="text-gray-600">
                              {booking.startTime}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center text-gray-500">
                              <Calendar className="w-3 h-3 mr-1" />
                              Dropoff
                            </div>
                            <div className="font-medium">
                              {new Date(booking.endDate).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                }
                              )}
                            </div>
                            <div className="text-gray-600">
                              {booking.endTime}
                            </div>
                          </div>
                        </div>

                        {/* Bike Items Summary */}
                        {booking.bikeItems && booking.bikeItems.length > 0 && (
                          <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                            <h4 className="text-xs font-medium text-gray-700">
                              Bikes:
                            </h4>
                            {booking.bikeItems.map((item, index) => (
                              <div
                                key={index}
                                className="flex justify-between text-xs"
                              >
                                <span className="text-gray-600">
                                  {item.bike?.title || `Bike ${item.bike}`} ×{" "}
                                  {item.quantity}
                                </span>
                                <span className="font-medium">
                                  ₹{item.totalPrice?.toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="space-y-2">
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="text-xs"
                            >
                              <Link href={`/booking/confirmed/${booking._id}`}>
                                View Details
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="text-xs"
                            >
                              <a href="tel:+919008022800">
                                <Phone className="w-3 h-3 mr-1" />
                                Support
                              </a>
                            </Button>
                          </div>

                          {/* {booking.bookingStatus === "confirmed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowExtendModal(true);
                              }}
                              className="w-full border-[#F47B20] text-[#F47B20] hover:bg-[#F47B20] hover:text-white text-xs"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Extend Booking
                            </Button>
                          )} */}

                          {/* {booking.paymentStatus === "pending" && (
                            <Button
                              size="sm"
                              className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-xs"
                              asChild
                            >
                              <Link href={`/payment/${booking._id}`}>
                                <CreditCard className="w-3 h-3 mr-1" />
                                Pay Now
                              </Link>
                            </Button>
                          )} */}
                        </div>
                      </div>
                    </div>

                    {/* Desktop/Tablet Layout */}
                    <div className="hidden sm:block p-4 sm:p-6">
                      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                        {/* Bike Image */}
                        <div className="w-full sm:w-48 lg:w-56 flex-shrink-0">
                          <div className="relative bg-gray-50 rounded-lg p-3 sm:p-4 h-32 sm:h-36 lg:h-40">
                            <Image
                              src={
                                bikeInfo.images[0] ||
                                "/placeholder.svg?height=160&width=224"
                              }
                              alt={bikeInfo.title}
                              width={224}
                              height={160}
                              className="w-full h-full object-contain rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4">
                            <div className="mb-3 sm:mb-0">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                                {bikeInfo.title}
                              </h3>
                              {bikeInfo.totalQuantity > 1 && (
                                <p className="text-sm text-gray-600 mb-1">
                                  {bikeInfo.totalQuantity} bikes booked
                                </p>
                              )}
                              <p className="text-gray-600 text-sm mb-2">
                                Booking ID: {booking._id.slice(-8)}
                              </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge
                                className={`${getStatusColor(
                                  booking.bookingStatus
                                )} border text-xs sm:text-sm`}
                              >
                                {getStatusIcon(booking.bookingStatus)}
                                <span className="ml-1 capitalize">
                                  {booking.bookingStatus}
                                </span>
                              </Badge>
                              <Badge
                                className={`${getStatusColor(
                                  booking.paymentStatus
                                )} border text-xs sm:text-sm`}
                              >
                                <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="ml-1 capitalize">
                                  {booking.paymentStatus}
                                </span>
                              </Badge>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                Pickup Date
                              </p>
                              <p className="font-medium text-sm sm:text-base">
                                {new Date(
                                  booking.startDate
                                ).toLocaleDateString()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {booking.startTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                Dropoff Date
                              </p>
                              <p className="font-medium text-sm sm:text-base">
                                {new Date(booking.endDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs sm:text-sm text-gray-600">
                                {booking.endTime}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                Booking Type
                              </p>
                              <p className="font-medium text-sm sm:text-base capitalize">
                                {booking.bookingType}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                                Total Amount
                              </p>
                              <p className="font-bold text-base sm:text-lg text-[#F47B20]">
                                ₹
                                {booking.priceDetails?.totalAmount?.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          {/* Bike Items Details */}
                          {booking.bikeItems &&
                            booking.bikeItems.length > 0 && (
                              <div className="bg-gray-50 p-3 rounded-lg mb-4">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">
                                  Booked Bikes:
                                </h4>
                                <div className="space-y-2">
                                  {booking.bikeItems.map((item, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-center text-sm"
                                    >
                                      <div>
                                        <span className="font-medium">
                                          {item.bike?.title ||
                                            `Bike ${item.bike}`}
                                        </span>
                                        <span className="text-gray-600 ml-2">
                                          × {item.quantity} | {item.kmOption}
                                        </span>
                                      </div>
                                      <span className="font-medium text-[#F47B20]">
                                        ₹{item.totalPrice?.toLocaleString()}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2 sm:gap-3">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/booking/confirmed/${booking._id}`}>
                                View Details
                                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                              </Link>
                            </Button>

                            {/* {booking.bookingStatus === "confirmed" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowExtendModal(true);
                                }}
                                className="border-[#F47B20] text-[#F47B20] hover:bg-[#F47B20] hover:text-white"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Extend
                              </Button>
                            )}

                            {booking.paymentStatus === "pending" && (
                              <Button
                                size="sm"
                                className="bg-[#F47B20] hover:bg-[#E06A0F]"
                                asChild
                              >
                                <Link href={`/payment/${booking._id}`}>
                                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                  Pay Now
                                </Link>
                              </Button>
                            )} */}

                            <Button variant="outline" size="sm" asChild>
                              <a href="tel:+919008022800">
                                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                Support
                              </a>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile Filter Modal */}
      <MobileFilterModal />

      {/* Extend Booking Modal */}
      <Dialog open={showExtendModal} onOpenChange={setShowExtendModal}>
        <DialogContent className="sm:max-w-md mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Extend Booking
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newEndDate" className="text-sm font-medium">
                New End Date
              </Label>
              <Input
                id="newEndDate"
                type="date"
                value={extendData.newEndDate}
                onChange={(e) =>
                  setExtendData({ ...extendData, newEndDate: e.target.value })
                }
                min={selectedBooking?.endDate?.split("T")[0]}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="newEndTime" className="text-sm font-medium">
                New End Time
              </Label>
              <Input
                id="newEndTime"
                type="time"
                value={extendData.newEndTime}
                onChange={(e) =>
                  setExtendData({ ...extendData, newEndTime: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason (Optional)
              </Label>
              <Input
                id="reason"
                placeholder="Why do you need to extend?"
                value={extendData.reason}
                onChange={(e) =>
                  setExtendData({ ...extendData, reason: e.target.value })
                }
                className="mt-1"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 order-2 sm:order-1"
                onClick={() => setShowExtendModal(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-[#F47B20] hover:bg-[#E06A0F] order-1 sm:order-2"
                onClick={handleExtendBooking}
                disabled={extendLoading}
              >
                {extendLoading ? "Extending..." : "Extend Booking"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}
