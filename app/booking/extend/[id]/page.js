"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Calendar, Clock } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function ExtendBookingPage() {
  const params = useParams()
  const [booking, setBooking] = useState(null)
  const [newEndDate, setNewEndDate] = useState("")
  const [newEndTime, setNewEndTime] = useState("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Simulate API call for booking details
    setBooking({
      _id: params.id,
      bikeTitle: "Honda CB350 2022",
      bikeImage: "/placeholder.svg?height=100&width=150",
      currentEndDate: "23 Jun 2025",
      currentEndTime: "06:00 PM",
      pricePerDay: 500,
    })
  }, [params.id])

  const handleExtendBooking = async () => {
    if (!newEndDate || !newEndTime) {
      alert("Please select new end date and time")
      return
    }

    setLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Booking extended successfully!")
      window.location.href = "/bookings"
    } catch (error) {
      alert("Failed to extend booking. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!booking) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/bookings" className="flex items-center text-gray-600 mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-semibold">Extend Booking</h1>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Current Booking Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 mb-4">
              <Image
                src={booking.bikeImage || "/placeholder.svg"}
                alt={booking.bikeTitle}
                width={100}
                height={80}
                className="rounded-lg"
              />
              <div>
                <h3 className="font-semibold text-lg">{booking.bikeTitle}</h3>
                <p className="text-gray-600">
                  Current end: {booking.currentEndDate} at {booking.currentEndTime}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extend Your Booking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">New End Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="date"
                    className="pl-10"
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    min={booking.currentEndDate}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">New End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    type="time"
                    className="pl-10"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Reason for Extension (Optional)</label>
              <Textarea
                placeholder="Please provide a reason for extending your booking..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </div>

            {newEndDate && newEndTime && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">Extension Summary</h4>
                <div className="text-sm space-y-1">
                  <div>
                    New end date: {newEndDate} at {newEndTime}
                  </div>
                  <div>Additional charges may apply based on extended duration</div>
                  <div className="font-medium text-orange-600">Estimated additional cost: ₹{booking.pricePerDay}</div>
                </div>
              </div>
            )}

            <Button
              className="w-full bg-orange-600 hover:bg-orange-700"
              onClick={handleExtendBooking}
              disabled={loading || !newEndDate || !newEndTime}
            >
              {loading ? "Extending..." : "Extend Booking"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
