"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import AadhaarVerificationModal from "@/components/aadhar-verification-modal";
import { apiService } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  CheckCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  Phone,
  Mail,
  User,
  Shield,
  Info,
  Share2,
  Copy,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmt = (n) =>
  typeof n === "number" && !isNaN(n)
    ? `₹${n.toLocaleString("en-IN")}`
    : "₹0";

const fmtDate = (d) => {
  if (!d) return "-";
  try {
    const date = new Date(d);
    if (isNaN(date)) return "-";
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
};

const fmtTime = (t) => {
  if (!t) return "-";
  try {
    const [h, m] = t.split(":");
    const d = new Date();
    d.setHours(+h, +m);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return t;
  }
};

const fmtDateTime = (d) => {
  if (!d) return "-";
  try {
    const date = new Date(d);
    if (isNaN(date)) return "-";
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "-";
  }
};

// ── Component ──────────────────────────────────────────────────────────────────
export default function BookingConfirmedPage() {
  const params = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationInitialStep, setVerificationInitialStep] = useState("intro");
  const [copied, setCopied] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  // Load booking on mount
  useEffect(() => {
    if (params?.id) loadBookingDetails();
  }, [params?.id]);

  // Auto-show Aadhaar modal after booking loads (3s delay)
  useEffect(() => {
    if (!booking) return;
    const isConfirmed = booking.status === "confirmed";
    if (!isConfirmed) return;
    const timer = setTimeout(() => {
      setVerificationInitialStep("intro");
      setShowVerificationModal(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [booking?.status]);

  const loadBookingDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiService.getBookingDetails(params.id);
      if (res?.success && res?.data) {
        setBooking(res.data);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Failed to load booking:", err);
      setError("Failed to load booking details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const text = params.id;
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    else {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const url = window.location.href;
    const text = `My bike booking is confirmed! Booking ID: ${params.id}`;
    try {
      if (navigator.share) await navigator.share({ title: "Booking Confirmed", text, url });
      else {
        navigator.clipboard?.writeText(`${text} - ${url}`);
        toast.success("Copied!", "Booking link copied to clipboard");
      }
    } catch {}
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F47B20] mx-auto mb-4" />
            <p className="text-gray-600">Loading booking details…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-xl mx-auto px-4 py-20">
          <Card>
            <CardContent className="p-10 text-center">
              <AlertTriangle className="w-14 h-14 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Booking Not Found</h2>
              <p className="text-gray-600 mb-6 text-sm">
                {error || "Unable to load booking details."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button className="bg-[#F47B20] hover:bg-[#E06A0F]" onClick={() => window.location.reload()}>
                  Retry
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/bookings">My Bookings</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // ── Data extraction (new API shape) ───────────────────────────────────────
  const isConfirmed    = booking.status === "confirmed";
  const isPartial      = booking.paymentStatus === "partial";
  const isFullyPaid    = booking.paymentStatus === "completed";

  const paySum = booking.paymentSummary || {};
  const totalAmount     = paySum.totalAmount     || 0;
  const paidAmount      = paySum.paidAmount      || 0;
  const remainingAmount = paySum.remainingAmount || 0;
  const partialPct      = paySum.partialPercentage || 25;

  const guest = booking.guest || {};

  const bikeBooking  = booking.bookings?.find((b) => b.type === "bike");
  const bikeItems    = bikeBooking?.bike?.items || [];
  const bikeDates    = bikeBooking?.dates || {};
  const priceBreak   = bikeBooking?.priceBreakdown || {};

  const headerBg = isFullyPaid
    ? "from-green-500 to-green-600"
    : isPartial
    ? "from-blue-500 to-blue-600"
    : "from-orange-500 to-orange-600";

  const accentColor = isFullyPaid ? "text-green-600" : isPartial ? "text-blue-600" : "text-orange-600";
  const accentBg    = isFullyPaid ? "bg-green-500" : isPartial ? "bg-blue-500" : "bg-orange-500";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Top bar */}
      <div className={`bg-gradient-to-r ${headerBg} text-white`}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Home</span>
          </Link>
          <div className="flex items-center gap-2">
            {isFullyPaid && (
              <Badge className="bg-white text-green-700 text-xs">Fully Paid</Badge>
            )}
            {isPartial && (
              <Badge className="bg-white text-blue-700 text-xs">25% Paid</Badge>
            )}
            {isConfirmed && (
              <Badge className="bg-white text-green-700 text-xs">Confirmed</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">

        {/* ── Success banner ── */}
        <div className="text-center py-4">
          <div className={`w-20 h-20 ${accentBg} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold ${accentColor} mb-2`}>
            {isFullyPaid ? "🎉 Booking Confirmed!" : isPartial ? "✅ Booking Reserved!" : "📝 Booking Created!"}
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto">
            {isFullyPaid
              ? "Your payment is complete. Get ready for your ride!"
              : isPartial
              ? "Reserved with 25% advance. Complete the remaining payment before pickup."
              : "Booking created. Complete payment to confirm."}
          </p>
        </div>

        {/* ── Remaining payment alert ── */}
        {isPartial && (
          <Card className="border-2 border-blue-400 bg-blue-50">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-3">Remaining Payment Required</h3>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Total Amount</span>
                      <span className="font-semibold">{fmt(totalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-green-700">
                      <span>Paid ({partialPct}%)</span>
                      <span className="font-semibold">{fmt(paidAmount)}</span>
                    </div>
                    <Separator className="bg-blue-200" />
                    <div className="flex justify-between font-bold text-blue-900">
                      <span>Remaining ({100 - partialPct}%)</span>
                      <span className="text-lg">{fmt(remainingAmount)}</span>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white h-11 font-semibold" asChild>
                    <Link href={`/payment/${params.id}`}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Remaining {fmt(remainingAmount)}
                    </Link>
                  </Button>
                  <p className="text-xs text-blue-600 text-center mt-2">
                    💡 Pay anytime before your pickup date
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Verify identity banner ── */}
        <Card className="border-2 border-orange-300 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-3">
                <Shield className="w-6 h-6 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-orange-900 text-sm">Verify Your Identity</p>
                  <p className="text-xs text-orange-700 mt-0.5">
                    Complete Aadhaar + DL verification for faster pickup — skip paperwork at the store.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  className="bg-[#F47B20] hover:bg-[#E06A0F] text-white text-xs h-9"
                  onClick={() => { setVerificationInitialStep("intro"); setShowVerificationModal(true); }}
                >
                  Verify Aadhaar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-orange-400 text-orange-700 hover:bg-orange-100 text-xs h-9"
                  onClick={() => { setVerificationInitialStep("dl"); setShowVerificationModal(true); }}
                >
                  Upload DL
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Main booking card ── */}
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader className="bg-green-50 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-lg text-green-800">Booking Details</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare}
                  className="text-green-600 border-green-300 hover:bg-green-50 text-xs h-8">
                  <Share2 className="w-3.5 h-3.5 mr-1" /> Share
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">

            {/* Booking ID */}
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Booking ID</p>
              <div className="flex items-center justify-center gap-2">
                <span className="font-mono font-semibold text-sm break-all">{params.id}</span>
                <button onClick={handleCopy} className="p-1 hover:bg-gray-200 rounded">
                  <Copy className="w-3.5 h-3.5 text-gray-500" />
                </button>
              </div>
              {copied && <p className="text-xs text-green-600 mt-1">Copied!</p>}
            </div>

            {/* Bikes */}
            {bikeItems.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
                  <span>🏍️</span> Bike{bikeItems.length > 1 ? "s" : ""} Booked
                </p>
                <div className="space-y-3">
                  {bikeItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                      <img
                        src={item.images?.[0] || "/assets/happygo.jpeg"}
                        alt={item.name}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { e.target.src = "/assets/happygo.jpeg"; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.brand} {item.model}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            {item.kmOption === "unlimited" ? "Unlimited KM" : "Limited KM"}
                          </Badge>
                          <Badge variant="outline" className="text-xs px-1.5 py-0">
                            Qty: {item.quantity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          ₹{item.pricePerUnit} × {item.quantity} ={" "}
                          <span className="font-semibold">{fmt(item.totalPrice)}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pickup / Drop */}
            {(bikeDates.pickupDate || bikeDates.dropDate) && (
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-green-600 mb-1" />
                  <span className="text-xs text-gray-500">Pickup</span>
                  <span className="font-medium text-sm text-center">{fmtDate(bikeDates.pickupDate)}</span>
                  <span className="text-xs text-gray-400">{fmtTime(bikeDates.pickupTime)}</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-red-500 mb-1" />
                  <span className="text-xs text-gray-500">Drop</span>
                  <span className="font-medium text-sm text-center">{fmtDate(bikeDates.dropDate)}</span>
                  <span className="text-xs text-gray-400">{fmtTime(bikeDates.dropTime)}</span>
                </div>
              </div>
            )}

            <Separator />

            {/* Payment Summary */}
            <div>
              <button
                onClick={() => setShowPaymentDetails(!showPaymentDetails)}
                className="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg sm:pointer-events-none"
              >
                <span className="font-semibold text-green-800 text-sm">Payment Summary</span>
                <span className="sm:hidden">
                  {showPaymentDetails
                    ? <ChevronUp className="w-4 h-4 text-green-600" />
                    : <ChevronDown className="w-4 h-4 text-green-600" />}
                </span>
              </button>
              <div className={`${showPaymentDetails ? "block" : "hidden"} sm:block mt-3 space-y-2 text-sm`}>
                {priceBreak.basePrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base Price</span>
                    <span className="font-medium">{fmt(priceBreak.basePrice)}</span>
                  </div>
                )}
                {priceBreak.helmetCharges > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Helmet Charges</span>
                    <span className="font-medium">{fmt(priceBreak.helmetCharges)}</span>
                  </div>
                )}
                {priceBreak.gst > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({priceBreak.gstPercentage || 5}%)</span>
                    <span className="font-medium">{fmt(priceBreak.gst)}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-bold text-base">
                  <span>Total Amount</span>
                  <span className="text-green-600">{fmt(totalAmount)}</span>
                </div>
                {isPartial && (
                  <>
                    <div className="flex justify-between text-green-700 text-xs">
                      <span>Paid ({partialPct}%)</span>
                      <span className="font-medium">{fmt(paidAmount)}</span>
                    </div>
                    <div className="flex justify-between text-orange-700 text-xs font-semibold">
                      <span>Remaining ({100 - partialPct}%)</span>
                      <span>{fmt(remainingAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            <Separator />

            {/* Status */}
            <div className="flex gap-4 flex-wrap">
              <div>
                <p className="text-xs text-gray-500 mb-1">Booking Status</p>
                <Badge className={isConfirmed ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {booking.status || "pending"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                <Badge className={
                  isFullyPaid ? "bg-green-100 text-green-800"
                  : isPartial ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
                }>
                  {booking.paymentStatus || "pending"}
                </Badge>
              </div>
            </div>

            {/* Guest details */}
            {(guest.name || guest.email || guest.phone) && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-800 text-sm">Customer Details</span>
                </div>
                <div className="space-y-1 text-sm">
                  {guest.name  && <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium">{guest.name}</span></div>}
                  {guest.email && <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium break-all">{guest.email}</span></div>}
                  {guest.phone && <div className="flex justify-between"><span className="text-gray-500">Phone</span><span className="font-medium">{guest.phone}</span></div>}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="font-semibold text-sm">Booking Timeline</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Booked On</span>
                <span className="font-medium">{fmtDateTime(booking.bookedOn)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Instructions ── */}
        <Card className="border-orange-200">
          <CardHeader className="bg-orange-50 pb-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between sm:pointer-events-none"
            >
              <CardTitle className="flex items-center gap-2 text-orange-800 text-base">
                <Info className="w-4 h-4" /> Important Instructions
              </CardTitle>
              <span className="sm:hidden">
                {showInstructions
                  ? <ChevronUp className="w-4 h-4 text-orange-600" />
                  : <ChevronDown className="w-4 h-4 text-orange-600" />}
              </span>
            </button>
          </CardHeader>
          <CardContent className={`${showInstructions ? "block" : "hidden"} sm:block p-4 sm:p-6`}>
            <div className="space-y-4 text-sm">
              {[
                { title: "Before Pickup", dot: "orange", items: [
                  "Carry original driving license and ID proof",
                  "Complete Aadhaar verification for faster handover",
                  "Arrive 15 minutes before pickup time",
                ]},
                { title: "During Trip", dot: "orange", items: [
                  "Fuel charges are not included",
                  "Extra charges apply for exceeding KM limit",
                  "Return on time to avoid late fees",
                  "Inform 10 minutes prior to returning the scooty",
                ]},
                { title: "Terms & Conditions", dot: "red", items: [
                  "Travel restricted to Chikmagalur surrounding areas",
                  "Amount will not be refunded if booking is cancelled",
                  "Late return: ₹200 per scooty per hour",
                  "Damage charges apply as per company showroom rates",
                  "₹1000 charged for loss of key",
                ]},
              ].map((sec) => (
                <div key={sec.title}>
                  <p className="font-semibold text-orange-800 mb-2">{sec.title}:</p>
                  <ul className="space-y-1.5">
                    {sec.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <div className={`w-2 h-2 bg-${sec.dot}-500 rounded-full mt-1.5 flex-shrink-0`} />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="text-center text-green-600 font-medium pt-2 border-t border-orange-100">
                Have a safe ride. Thank you! 🙏
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Action buttons ── */}
        <div className="space-y-3 pb-6">
          {isPartial && (
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold" asChild>
              <Link href={`/payment/${params.id}`}>
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Remaining Payment ({fmt(remainingAmount)})
              </Link>
            </Button>
          )}
          <Button className="w-full bg-[#F47B20] hover:bg-[#E06A0F] text-white h-12 font-semibold" asChild>
            <Link href="/bookings">
              <ExternalLink className="w-4 h-4 mr-2" />
              View All Bookings
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-11" asChild>
              <Link href="/">Home</Link>
            </Button>
            <Button variant="outline" className="h-11" asChild>
              <Link href="/">Book Another Bike</Link>
            </Button>
          </div>
        </div>

        {/* ── Support ── */}
        <Card className="border-blue-200 mb-6">
          <CardContent className="p-4 text-center">
            <Shield className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="font-semibold text-sm mb-1">Need Help?</p>
            <p className="text-xs text-gray-600 mb-4">Support team available 24/7</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button variant="outline" size="sm" asChild>
                <a href="tel:+919008022800" className="flex items-center gap-1">
                  <Phone className="w-4 h-4" /> +91 90080-22800
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="mailto:support@happygobike.com" className="flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Email Support
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Aadhaar / DL Verification Modal ── */}
      <AadhaarVerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        bookingId={params.id}
        initialStep={verificationInitialStep}
      />

      <Footer />
    </div>
  );
}
