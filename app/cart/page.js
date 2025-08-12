"use client";

import { Suspense } from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  Shield,
  AlertTriangle,
  Gift,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";

// Loading component for Suspense fallback
function CartPageSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading cart...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main cart component that uses useSearchParams
function CartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [error, setError] = useState("");
  const [helmetQuantity, setHelmetQuantity] = useState(0);

  // Helper function to get and validate search parameters
  const getSearchParams = () => {
    // Ensure consistent time formatting by properly decoding URL parameters
    const rawStartTime = searchParams.get("startTime") || "";
    const rawEndTime = searchParams.get("endTime") || "";

    const params = {
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      startTime: rawStartTime,
      endTime: rawEndTime,
    };

    // Log for debugging
    console.log("🔍 URL Search Params:", {
      raw: {
        startDate: searchParams.get("startDate"),
        endDate: searchParams.get("endDate"),
        startTime: rawStartTime,
        endTime: rawEndTime,
      },
      processed: params,
      note: "These should match exactly in both GET /cart and PUT /cart/helmets",
    });

    return params;
  };

  const loadCart = async () => {
    try {
      setLoading(true);

      // Get search parameters for cart loading
      const params = getSearchParams();
      console.log("🛒 Cart Load - Sending to API:", params);

      const response = await apiService.getCart(params);
      setCart(response.data);
      setHelmetQuantity(response.data?.helmetDetails?.quantity || 0);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 0) return;

    setUpdating((prev) => ({ ...prev, [itemId]: true }));

    try {
      if (newQuantity === 0) {
        await apiService.removeFromCart(itemId);
      } else {
        await apiService.updateCartQuantity(itemId, newQuantity);
      }
      await loadCart();
    } catch (error) {
      console.error("Failed to update quantity:", error);
      setError(error.message || "Failed to update quantity");
    } finally {
      setUpdating((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  const updateHelmetQuantity = async (newQuantity) => {
    if (newQuantity < 0) return;

    try {
      // Use cart's booking data instead of URL parameters for consistency
      const formatCartDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // YYYY-MM-DD format
      };

      const params = {
        quantity: newQuantity,
        startDate: formatCartDate(cart?.startDate),
        endDate: formatCartDate(cart?.endDate),
        startTime: cart?.startTime || "",
        endTime: cart?.endTime || "",
      };

      console.log("🪖 Helmet Update - Using Cart Data:", {
        cartDates: {
          startDate: cart?.startDate,
          endDate: cart?.endDate,
          startTime: cart?.startTime,
          endTime: cart?.endTime,
        },
        urlParams: {
          startDate: searchParams.get("startDate"),
          endDate: searchParams.get("endDate"),
          startTime: searchParams.get("startTime"),
          endTime: searchParams.get("endTime"),
        },
        finalApiParams: params,
        note: "✅ Now using cart data instead of URL params for consistency",
      });
      console.log(
        "🔍 API will call:",
        `PUT /api/cart/helmets?startDate=${params.startDate}&endDate=${
          params.endDate
        }&startTime=${encodeURIComponent(
          params.startTime
        )}&endTime=${encodeURIComponent(params.endTime)}`
      );
      console.log(
        "🔍 Request body:",
        JSON.stringify({ quantity: params.quantity }, null, 2)
      );

      const response = await apiService.updateHelmetQuantity(params);
      if (response.success) {
        setHelmetQuantity(newQuantity);
        await loadCart(); // Reload to get updated pricing and message

        // Show backend message if available
        if (response.message) {
          toast.info("Helmet updated", response.message);
        }
      }
    } catch (error) {
      console.error("Failed to update helmet quantity:", error);
      setError(error.message || "Failed to update helmet quantity");
    }
  };

  const proceedToCheckout = async () => {
    try {
      // Check if user is authenticated
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      // Validate cart has items
      if (!cart || !cart.items || cart.items.length === 0) {
        setError("Your cart is empty");
        return;
      }

      // Validate required booking fields
      if (
        !cart.startDate ||
        !cart.endDate ||
        !cart.startTime ||
        !cart.endTime
      ) {
        setError(
          "Missing booking dates or times. Please refresh and try again."
        );
        return;
      }

      if (!cart.pricing) {
        setError(
          "Pricing information is missing. Please refresh and try again."
        );
        return;
      }

      setLoading(true);
      setError("");

      // Format dates properly (remove time component)
      const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toISOString().split("T")[0]; // YYYY-MM-DD format
      };

      // Prepare booking data according to API documentation
      const bookingData = {
        bookingType: "bike",
        bikeItems: cart.items.map((item) => ({
          bike: item.bike.id || item.bike._id,
          quantity: item.quantity,
          kmOption: item.kmOption,
          pricePerUnit: item.pricePerUnit,
          totalPrice: item.totalPrice,
        })),
        startDate: formatDate(cart.startDate),
        endDate: formatDate(cart.endDate),
        startTime: cart.startTime,
        endTime: cart.endTime,
        helmetQuantity: cart.helmetDetails?.quantity || 0,
        priceDetails: {
          basePrice: cart.pricing.subtotal - (cart.helmetDetails?.charges || 0),
          subtotal: cart.pricing.subtotal,
          bulkDiscount: cart.pricing.bulkDiscount || {
            amount: 0,
            percentage: 0,
          },
          surgeMultiplier: cart.pricing.surgeMultiplier || 1,
          extraCharges: cart.pricing.extraCharges || 0,
          helmetCharges: cart.helmetDetails?.charges || 0,
          taxes: cart.pricing.gst,
          gstPercentage: cart.pricing.gstPercentage || 5,
          discount: 0,
          totalAmount: cart.pricing.total,
        },
      };

      console.log("Cart data:", cart);
      console.log("Booking data being sent:", bookingData);

      // Create booking using regular booking API
      const response = await apiService.createBooking(bookingData);

      if (response.success && response.data?._id) {
        // Redirect to payment page
        router.push(`/payment/${response.data._id}`);
      } else {
        throw new Error(response.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Failed to create booking:", error);

      // Handle specific error cases
      if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        router.push("/login");
        return;
      }

      setError(
        error.response?.data?.message ||
          error.message ||
          "Failed to proceed to checkout"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading cart...</p>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Header Navigation */}
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center h-14 sm:h-16">
              <Link
                href="/"
                className="flex items-center text-gray-600 hover:text-[#F47B20] transition-colors mr-4"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="font-medium text-sm sm:text-base">
                  Back to Home
                </span>
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <Card className="shadow-lg text-center py-8 sm:py-12">
            <CardContent>
              <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-lg sm:text-xl font-bold mb-4">
                Your cart is empty
              </h2>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Add some bikes to your cart to get started
              </p>
              <Button
                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white px-6 py-2 sm:px-8 sm:py-3"
                asChild
              >
                <Link href="/">Browse Bikes</Link>
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

      {/* Header Navigation */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-[#F47B20] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="font-medium text-sm sm:text-base">
                Continue Shopping
              </span>
            </Link>

            <div className="flex items-center">
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2 text-[#F47B20]" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {cart.items.reduce((sum, item) => sum + item.quantity, 0)} Items
                <span className="hidden sm:inline"> in Cart</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-3 rounded-lg mb-4 sm:mb-6 flex items-start">
            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="shadow-lg">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg text-[#F47B20] flex items-center">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Your Bikes ({cart.items.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.items.map((item) => (
                  <div key={item._id} className="border rounded-lg p-3">
                    <div className="flex gap-3">
                      {/* Bike Image */}
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <Image
                          src={item.bike.images?.[0] || "/assets/happygo.jpeg"}
                          alt={item.bike.title}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Bike Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {item.bike.title}
                        </h3>
                        <p className="text-xs text-gray-600 mb-3">
                          {item.kmOption === "unlimited"
                            ? "Unlimited KM"
                            : (() => {
                                // Get km limit from bike pricing structure similar to search page
                                const getKmLimit = () => {
                                  // Check if bike has pricePerDay structure
                                  if (item.bike?.pricePerDay) {
                                    // Try weekday first, then weekend
                                    const weekdayLimit = item.bike.pricePerDay.weekday?.limitedKm?.kmLimit;
                                    const weekendLimit = item.bike.pricePerDay.weekend?.limitedKm?.kmLimit;
                                    return weekdayLimit || weekendLimit || 0;
                                  }
                                  // Fallback to item's kmLimit or 0
                                  return item.kmLimit || 0;
                                };
                                const kmLimit = getKmLimit();
                                return kmLimit > 0 ? `${kmLimit} KM Limited` : "0 KM Limited";
                              })()}
                        </p>

                        <div className="flex flex-col gap-3">
                          {/* Quantity Controls - Mobile First */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full"
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity - 1)
                                }
                                disabled={updating[item._id]}
                              >
                                {updating[item._id] ? (
                                  <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                                ) : (
                                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                )}
                              </Button>

                              <span className="font-semibold text-sm sm:text-lg min-w-[1.5rem] sm:min-w-[2rem] text-center">
                                {item.quantity}
                              </span>

                              <Button
                                variant="outline"
                                size="sm"
                                className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full"
                                onClick={() =>
                                  updateQuantity(item._id, item.quantity + 1)
                                }
                                disabled={
                                  updating[item._id] ||
                                  item.quantity >= item.bike.availableQuantity
                                }
                              >
                                {updating[item._id] ? (
                                  <Loader2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 animate-spin" />
                                ) : (
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                )}
                              </Button>
                            </div>

                            <div className="text-right">
                              <div className="font-bold text-sm text-[#F47B20]">
                                ₹{item.pricePerUnit}/bike
                              </div>
                            </div>
                          </div>
                        </div>

                        {item.quantity >= item.bike.availableQuantity && (
                          <p className="text-xs text-amber-600 mt-1">
                            Maximum available quantity reached
                          </p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 self-start"
                        onClick={() => updateQuantity(item._id, 0)}
                        disabled={updating[item._id]}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Helmet Section */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg text-[#F47B20] flex items-center">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Add Helmets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <Shield className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Helmet Rental Available
                      </p>
                      <p className="text-xs text-blue-700">
                        {cart.helmetDetails?.message ||
                          "1 helmet FREE per bike, additional helmets at ₹60 each"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0 mr-3">
                      <span className="font-medium text-gray-900 text-sm">
                        Number of Helmets
                      </span>
                      <div className="text-xs text-gray-600 mt-1">
                        {helmetQuantity} helmet(s) selected
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full"
                        onClick={() =>
                          updateHelmetQuantity(Math.max(0, helmetQuantity - 1))
                        }
                      >
                        <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>

                      <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">
                        {helmetQuantity}
                      </span>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 sm:w-8 sm:h-8 p-0 rounded-full"
                        onClick={() =>
                          updateHelmetQuantity(Math.min(20, helmetQuantity + 1))
                        }
                      >
                        <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Show helmet charges info only if there are charges */}
                {cart.helmetDetails?.charges > 0 && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800 flex items-center">
                      <Shield className="w-4 h-4 inline mr-2" />
                      Helmet charges: ₹{cart.helmetDetails.charges}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <Card className="shadow-xl border-2 border-[#F47B20] lg:sticky lg:top-4">
              <CardHeader className="pb-3 sm:pb-6">
                <CardTitle className="text-base sm:text-lg text-[#F47B20]">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>₹{cart.pricing.subtotal.toLocaleString()}</span>
                  </div>

                  {cart.pricing.bulkDiscount?.amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>
                        Bulk Discount ({cart.pricing.bulkDiscount.percentage}%):
                      </span>
                      <span>
                        -₹{cart.pricing.bulkDiscount.amount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {cart.pricing.surgeMultiplier > 1 && (
                    <div className="flex justify-between text-orange-600">
                      <span>Peak Time Charges:</span>
                      <span>
                        +₹
                        {(
                          (cart.pricing.surgeMultiplier - 1) *
                          cart.pricing.subtotal
                        ).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {cart.pricing.extraCharges > 0 && (
                    <div className="flex justify-between">
                      <span>Extra Charges:</span>
                      <span>₹{cart.pricing.extraCharges.toLocaleString()}</span>
                    </div>
                  )}

                  {cart.helmetDetails?.charges > 0 && (
                    <div className="flex justify-between">
                      <span>Helmet Charges:</span>
                      <span>
                        ₹{cart.helmetDetails.charges.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between">
                    <span>GST (18%):</span>
                    <span>₹{cart.pricing.gst.toLocaleString()}</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold text-[#F47B20]">
                    <span>Total Amount:</span>
                    <span>₹{cart.pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                {cart.pricing.bulkDiscount?.amount > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center text-green-700">
                      <Gift className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">
                        You saved ₹{cart.pricing.bulkDiscount.amount} with bulk
                        booking!
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={proceedToCheckout}
                  disabled={loading || !cart?.items?.length}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Proceed to Checkout"
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Secure payment • No hidden charges
                </p>
              </CardContent>
            </Card>

            {/* Booking Details */}
            <Card className="shadow-lg">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-gray-900">
                  Booking Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Pickup:</span>
                  <span className="font-medium text-right">
                    {new Date(cart.startDate).toLocaleDateString()}
                    <br />
                    {cart.startTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dropoff:</span>
                  <span className="font-medium text-right">
                    {new Date(cart.endDate).toLocaleDateString()}
                    <br />
                    {cart.endTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Bikes:</span>
                  <span className="font-medium">
                    {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

// Main export with Suspense wrapper
export default function CartPage() {
  return (
    <Suspense fallback={<CartPageSkeleton />}>
      <CartPageContent />
    </Suspense>
  );
}
