"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      const response = await apiService.getBookings("bike");
      setBookings(response.data || []);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      // Fallback to dummy data
      setBookings([
        {
          _id: "1",
          bikeTitle: "Honda CB350 2022",
          bikeImage: "/placeholder.svg?height=100&width=150",
          startDate: "22 Jun 2025",
          startTime: "07:00 AM",
          endDate: "23 Jun 2025",
          endTime: "06:00 PM",
          status: "confirmed",
          totalAmount: "₹1180.00",
          location: "Indiranagar Metro Station",
          bookingId: "6857dcefce835f18e648a51d",
        },
        {
          _id: "2",
          bikeTitle: "Royal Enfield Classic 350",
          bikeImage: "/placeholder.svg?height=100&width=150",
          startDate: "15 Jun 2025",
          startTime: "09:00 AM",
          endDate: "16 Jun 2025",
          endTime: "08:00 PM",
          status: "completed",
          totalAmount: "₹850.00",
          location: "Koramangala",
          bookingId: "6857dcefce835f18e648a52e",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const activeBookings = bookings.filter((b) => b.status === "confirmed");
  const pastBookings = bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="text-gray-600">Manage your bike rental bookings</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-32 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Bookings</TabsTrigger>
              <TabsTrigger value="past">Past Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4">
              {activeBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Active Bookings
                    </h3>
                    <p className="text-gray-600 mb-4">
                      You don't have any active bookings at the moment.
                    </p>
                    <Button
                      className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                      asChild
                    >
                      <Link href="/">Book a Ride</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                activeBookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={
                            booking.bikeImage ||
                            "/placeholder.svg?height=100&width=150"
                          }
                          alt={booking.bikeTitle}
                          width={120}
                          height={80}
                          className="rounded-lg flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {booking.bikeTitle}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.location}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <div className="text-gray-600">Pickup</div>
                              <div className="font-medium">
                                {booking.startDate}
                              </div>
                              <div className="font-medium">
                                {booking.startTime}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Dropoff</div>
                              <div className="font-medium">
                                {booking.endDate}
                              </div>
                              <div className="font-medium">
                                {booking.endTime}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold">
                              {booking.totalAmount}
                            </div>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/booking/extend/${booking._id}`}>
                                  Extend
                                </Link>
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                                asChild
                              >
                                <Link href={`/booking/details/${booking._id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4">
              {pastBookings.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No Past Bookings
                    </h3>
                    <p className="text-gray-600">
                      Your completed bookings will appear here.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pastBookings.map((booking) => (
                  <Card
                    key={booking._id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <Image
                          src={
                            booking.bikeImage ||
                            "/placeholder.svg?height=100&width=150"
                          }
                          alt={booking.bikeTitle}
                          width={120}
                          height={80}
                          className="rounded-lg flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-semibold text-lg">
                              {booking.bikeTitle}
                            </h3>
                            {getStatusBadge(booking.status)}
                          </div>

                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-1" />
                            {booking.location}
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                            <div>
                              <div className="text-gray-600">Pickup</div>
                              <div className="font-medium">
                                {booking.startDate}
                              </div>
                              <div className="font-medium">
                                {booking.startTime}
                              </div>
                            </div>
                            <div>
                              <div className="text-gray-600">Dropoff</div>
                              <div className="font-medium">
                                {booking.endDate}
                              </div>
                              <div className="font-medium">
                                {booking.endTime}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold">
                              {booking.totalAmount}
                            </div>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href="/">Book Again</Link>
                              </Button>
                              <Button
                                size="sm"
                                className="bg-[#F47B20] hover:bg-[#E06A0F] text-white"
                                asChild
                              >
                                <Link href={`/booking/details/${booking._id}`}>
                                  View Details
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <Footer />
    </div>
  );
}
