"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Calendar,
  Users,
  User,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

export default function HostelBookingSummaryPage() {
  const params = useParams();
  const router = useRouter();
  
  const [hostel, setHostel] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [cartData, setCartData] = useState(null); // Store complete cart
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    mobile: "",
    specialRequests: "",
  });
  
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get booking data from sessionStorage (for hostel-specific info)
      const storedData = sessionStorage.getItem("hostelBookingData");
      if (!storedData) {
        throw new Error("Booking data not found. Please start over.");
      }

      const data = JSON.parse(storedData);
      setBookingData(data);

      // Fetch complete cart details (both bikes and hostels)
      try {
        const cartResponse = await apiService.getCart();
        if (cartResponse.success && cartResponse.data) {
          setCartData(cartResponse.data);
        }
      } catch (cartError) {
        console.error("Failed to load cart:", cartError);
        // Cart might be empty or not available, that's okay
      }

      // Load hostel details
      const response = await apiService.getHostelDetails(params.id);
      if (response.success && response.data) {
        setHostel(response.data);
      }

      // Pre-fill user data if available
      const userData = apiService.safeLocalStorageGet("user", {});
      if (userData) {
        setGuestDetails((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          mobile: userData.mobile || "",
        }));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Error", error.message || "Failed to load booking details");
      setTimeout(() => router.push("/hostels"), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Calculate cart totals from items (in case backend returns 0)
  const calculateCartTotals = () => {
    if (!cartData) return null;

    // Calculate bike subtotal from bikeItems
    const bikeSubtotal = cartData.bikeItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    
    // Calculate hostel subtotal from hostelItems
    const hostelSubtotal = cartData.hostelItems?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0;
    
    const subtotal = bikeSubtotal + hostelSubtotal;
    const gstPercentage = cartData.pricing?.gstPercentage || 5;
    const gst = subtotal * (gstPercentage / 100);
    const total = subtotal + gst;

    return {
      bikeSubtotal,
      hostelSubtotal,
      subtotal,
      gst,
      gstPercentage,
      total
    };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!guestDetails.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!guestDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(guestDetails.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!guestDetails.mobile.trim()) {
      newErrors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(guestDetails.mobile.replace(/\s/g, ""))) {
      newErrors.mobile = "Mobile number must be 10 digits";
    }

    if (!agreedToTerms) {
      newErrors.terms = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setGuestDetails((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleProceedToPay = async () => {
    if (!validateForm()) {
      toast.warning("Validation Error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);

    try {
      // Check authentication
      const token = localStorage.getItem("token");
      if (!token) {
        toast.warning("Login Required", "Please login to continue");
        setTimeout(() => router.push("/login"), 1500);
        return;
      }

      // Use NEW unified cart checkout API
      const checkoutData = {
        guestDetails: {
          name: guestDetails.name,
          email: guestDetails.email,
          phone: guestDetails.mobile,
        },
        specialRequests: guestDetails.specialRequests || "",
        partialPaymentPercentage: 25, // Can be changed to 100 for full payment
      };

      const response = await apiService.createCartBooking(checkoutData);

      if (response.success && response.data) {
        console.log("🎉 Cart Checkout Response:", JSON.stringify(response.data, null, 2));
        
        // Clear session storage
        sessionStorage.removeItem("hostelBookingData");
        
        // Store payment group ID and booking IDs for payment page
        const paymentData = {
          paymentGroupId: response.data.paymentGroupId,
          bookings: response.data.bookings,
          totalAmount: response.data.totalAmount,
          partialAmount: response.data.partialAmount,
          remainingAmount: response.data.remainingAmount,
          razorpay: response.data.razorpay,
        };
        
        console.log("💾 Storing cartPaymentData:", JSON.stringify(paymentData, null, 2));
        sessionStorage.setItem("cartPaymentData", JSON.stringify(paymentData));
        
        // Navigate to a unified payment/confirmation page
        // For now, navigate to the first hostel booking's payment page
        const hostelBooking = response.data.bookings.find(b => b.type === "hostel");
        if (hostelBooking) {
          router.push(`/hostels/payment/${hostelBooking.bookingId}`);
        } else if (response.data.bookings[0]) {
          // Fallback to first booking
          router.push(`/payment/${response.data.bookings[0].bookingId}`);
        }
      } else {
        throw new Error(response.message || "Failed to create bookings");
      }
    } catch (error) {
      console.error("Booking creation failed:", error);
      toast.error("Booking Failed", error.message || "Please try again");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!hostel || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Booking Data Not Found</h2>
              <p className="text-gray-600 mb-6">
                Please start the booking process again.
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

  const optionLabels = {
    bedOnly: "Bed Only",
    bedAndBreakfast: "Bed + Breakfast",
    bedBreakfastAndDinner: "Bed + Breakfast + Dinner",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Great pick! Guests love staying here</h1>
          <p className="text-gray-600">Complete your hostel bed booking details below</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Details & Guest Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hostel Summary Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <img
                    src={hostel.images?.[0] || "/assets/happygo.jpeg"}
                    alt={hostel.name}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h2 className="text-xl font-bold mb-2">{hostel.name}</h2>
                    <p className="text-gray-600 flex items-center text-sm mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hostel.location}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span>
                          {formatDate(bookingData.checkIn)} -{" "}
                          {formatDate(bookingData.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-600" />
                        <span>{bookingData.people} Guest(s)</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Selected Rooms */}
                <div>
                  <h3 className="font-semibold mb-3">Selected Rooms</h3>
                  <div className="space-y-2">
                    {bookingData.selectedRooms.map((room, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-3 rounded-lg flex justify-between items-start"
                      >
                        <div>
                          <p className="font-medium text-sm">{room.roomType}</p>
                          <p className="text-xs text-gray-600">
                            {optionLabels[room.mealOption]} × {room.quantity} bed(s)
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            ₹{room.pricePerNight?.toFixed(2)}/night × {room.numberOfNights} nights
                          </p>
                        </div>
                        <p className="font-semibold">
                          ₹{room.totalPrice?.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bikes in Cart (if any) */}
                {cartData?.bikeItems && cartData.bikeItems.length > 0 && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <span>🏍️</span> Bikes in Cart
                      </h3>
                      <div className="space-y-2">
                        {cartData.bikeItems.map((bikeItem, idx) => (
                          <div
                            key={idx}
                            className="bg-blue-50 p-3 rounded-lg flex justify-between items-start"
                          >
                            <div className="flex gap-3 flex-1">
                              <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                                <img
                                  src={bikeItem.bike?.images?.[0] || "/assets/happygo.jpeg"}
                                  alt={bikeItem.bike?.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{bikeItem.bike?.title}</p>
                                <p className="text-xs text-gray-600">
                                  Quantity: {bikeItem.quantity} × {bikeItem.kmOption === "unlimited" ? "Unlimited KM" : "Limited KM"}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  ₹{bikeItem.pricePerUnit?.toFixed(2)}/day
                                </p>
                              </div>
                            </div>
                            <p className="font-semibold">
                              ₹{bikeItem.totalPrice?.toFixed(2)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Guest Details Form */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Guest details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium mb-2">
                      First name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="Enter first name"
                        value={guestDetails.name.split(" ")[0] || ""}
                        onChange={(e) => {
                          const lastName = guestDetails.name.split(" ").slice(1).join(" ");
                          handleInputChange("name", `${e.target.value} ${lastName}`.trim());
                        }}
                        className={`pl-10 ${errors.name ? "border-red-500" : ""}`}
                      />
                    </div>
                  </div>

                  {/* Last Name */}
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium mb-2">
                      Last name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="lastName"
                        type="text"
                        placeholder="Enter last name"
                        value={guestDetails.name.split(" ").slice(1).join(" ") || ""}
                        onChange={(e) => {
                          const firstName = guestDetails.name.split(" ")[0] || "";
                          handleInputChange("name", `${firstName} ${e.target.value}`.trim());
                        }}
                        className="pl-10"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <Label htmlFor="mobile" className="text-sm font-medium mb-2">
                      Mobile number
                    </Label>
                    <div className="flex gap-2">
                      <select className="w-20 border border-gray-300 rounded-md px-2 py-2 text-sm">
                        <option value="+91">+91</option>
                      </select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          id="mobile"
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={guestDetails.mobile}
                          onChange={(e) =>
                            handleInputChange("mobile", e.target.value)
                          }
                          className={`pl-10 ${errors.mobile ? "border-red-500" : ""}`}
                        />
                      </div>
                    </div>
                    {errors.mobile && (
                      <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium mb-2">
                      Email ID
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={guestDetails.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className={`pl-10 ${errors.email ? "border-red-500" : ""}`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Special Requests */}
                <div className="mt-4">
                  <Label htmlFor="specialRequests" className="text-sm font-medium mb-2">
                    Special Requests (Optional)
                  </Label>
                  <Textarea
                    id="specialRequests"
                    placeholder="Enter any special requirements or preferences..."
                    value={guestDetails.specialRequests}
                    onChange={(e) =>
                      handleInputChange("specialRequests", e.target.value)
                    }
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Property Guidelines */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Property guidelines</h3>
                <ul className="space-y-2 text-sm">
                  {hostel.policies?.checkIn?.map((guideline, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <span>{guideline}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Price Summary (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Price Summary</h2>

                <div className="space-y-3 mb-4">
                  {/* Use calculated cart totals if cart exists, otherwise use bookingData pricing */}
                  {(() => {
                    const calculatedTotals = calculateCartTotals();
                    if (calculatedTotals) {
                      return (
                        <>
                          {calculatedTotals.bikeSubtotal > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Bikes</span>
                              <span className="font-medium">
                                ₹{calculatedTotals.bikeSubtotal.toFixed(2)}
                              </span>
                            </div>
                          )}
                          {calculatedTotals.hostelSubtotal > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Hostels</span>
                              <span className="font-medium">
                                ₹{calculatedTotals.hostelSubtotal.toFixed(2)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="font-medium">
                              ₹{calculatedTotals.subtotal.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Taxes (GST {calculatedTotals.gstPercentage}%)</span>
                            <span className="font-medium">
                              + ₹{calculatedTotals.gst.toFixed(2)}
                            </span>
                          </div>
                          <Separator />
                          <div className="flex justify-between">
                            <span className="font-bold text-lg">Total:</span>
                            <span className="font-bold text-2xl text-[#F47B20]">
                              ₹{calculatedTotals.total.toFixed(2)}
                            </span>
                          </div>
                        </>
                      );
                    }
                    return null;
                  })()}
                  
                  {!cartData && bookingData && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base price</span>
                        <span className="font-medium">
                          ₹{bookingData.pricing.basePrice.toFixed(2)}
                        </span>
                      </div>

                      {bookingData.pricing.discount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            Happy Go Discount 🔥
                          </span>
                          <span className="font-medium text-green-600">
                            - ₹{bookingData.pricing.discount.toFixed(2)}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Coupon Discount</span>
                        <span className="font-medium text-gray-400">- ₹0</span>
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes</span>
                        <span className="font-medium">
                          + ₹{bookingData.pricing.taxes.toFixed(2)}
                        </span>
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <span className="font-bold text-lg">Total:</span>
                        <span className="font-bold text-2xl text-[#F47B20]">
                          ₹{bookingData.pricing.total.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div className="mb-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={setAgreedToTerms}
                      className={errors.terms ? "border-red-500" : ""}
                    />
                    <Label
                      htmlFor="terms"
                      className="text-xs leading-tight cursor-pointer"
                    >
                      I agree to the{" "}
                      <a href="https://happygorentals.com/terms" target="_blank" rel="noopener noreferrer" className="text-[#F47B20] underline">
                        Terms and Conditions
                      </a>{" "}
                      and certify all the guests are{" "}
                      <span className="font-semibold">at least 18 years of age</span>.
                    </Label>
                  </div>
                  {errors.terms && (
                    <p className="text-red-500 text-xs mt-1 ml-6">{errors.terms}</p>
                  )}
                </div>

                {/* Proceed to Pay Button */}
                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white font-semibold py-6"
                  onClick={handleProceedToPay}
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    "Proceed to Pay"
                  )}
                </Button>

                {/* Savings Banner */}
                {bookingData.pricing.discount > 0 && (
                  <Card className="bg-yellow-50 border-yellow-200 mt-4">
                    <CardContent className="p-3">
                      <p className="text-xs text-center">
                        🎉 You are saving{" "}
                        <span className="font-bold text-green-700">
                          ₹{bookingData.pricing.discount.toFixed(2)}
                        </span>{" "}
                        in this booking
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Partial Payment Info */}
                <Card className="bg-green-50 border-green-200 mt-4">
                  <CardContent className="p-3">
                    <p className="text-xs text-center text-green-800 font-medium">
                      💰 Pay only 25% now, remaining 75% anytime before check-in!
                    </p>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

