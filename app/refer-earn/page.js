"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Gift,
  Copy,
  Share,
  Users,
  Wallet,
  Loader2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { apiService } from "@/lib/api";

export default function ReferEarnPage() {
  const [referralData, setReferralData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getReferralDetails();
      setReferralData(response.data);
    } catch (error) {
      setError(error.message || "Failed to load referral data");
      console.error("Failed to fetch referral data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleShare = () => {
    if (referralData?.referralCode) {
      const shareData = {
        title: "Join Happy Go",
        text: `Use my referral code ${referralData.referralCode} and get ₹500 off on your first booking!`,
        url: `${window.location.origin}/register?ref=${referralData.referralCode}`,
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        const shareUrl = `https://wa.me/?text=${encodeURIComponent(
          `${shareData.text} ${shareData.url}`
        )}`;
        window.open(shareUrl, "_blank");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "expired":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="flex items-center justify-center min-h-[70vh] px-4">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
              <div className="absolute inset-0 w-16 h-16 bg-orange-200 rounded-full animate-ping opacity-20 mx-auto"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Loading your rewards...
            </h3>
            <p className="text-gray-600 text-sm">Please wait a moment</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-md mx-auto">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-6 sm:p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-red-600 mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                  {error}
                </p>
                <Button
                  onClick={fetchReferralData}
                  className="w-full bg-[#F47B20] hover:bg-[#E06A0F]  font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                >
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      {/* Mobile-First Header */}
      <header className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative z-10 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 sm:h-16">
            <Link
              href="/"
              className="flex items-center mr-3 sm:mr-4 p-2 -ml-2 rounded-lg hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center mr-3">
                <Gift className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-xl font-semibold">Refer & Earn</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Hero Section - Mobile Optimized */}
        <Card className="mb-6 bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-0 shadow-2xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-10"></div>
          <CardContent className="relative z-10 p-6 sm:p-8 text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 flex items-center justify-center">
              <img
                src="/assets/happygo.jpeg"
                alt="Happy Go Logo"
                className="w-4/5 h-4/5 object-cover rounded-2xl"
              />
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
              Earn ₹500 for Every Friend!
            </h2>
            <p className="text-base sm:text-lg opacity-90 mb-6 sm:mb-8 leading-relaxed max-w-2xl mx-auto">
              Invite your friends to Happy Go and earn rewards when they
              complete their first booking
            </p>

            {/* Referral Code Section */}
            <div className="bg-white bg-opacity-15 backdrop-blur-sm rounded-2xl p-4 sm:p-6 max-w-md mx-auto">
              <p className="text-sm sm:text-base mb-3 opacity-90">
                Your Referral Code
              </p>
              <div className="space-y-3">
                <div className="bg-white text-orange-600 px-4 py-3 sm:py-4 rounded-xl font-bold text-lg sm:text-xl tracking-wider">
                  {referralData?.referralCode || "Loading..."}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Button
                    onClick={handleCopyCode}
                    className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-black border border-white border-opacity-30 font-medium py-3 rounded-xl transition-all duration-200"
                    disabled={!referralData?.referralCode}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {copySuccess ? "Copied!" : "Copy Code"}
                  </Button>
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-white text-orange-600 hover:bg-gray-100 font-medium py-3 rounded-xl transition-all duration-200 transform hover:scale-105"
                    disabled={!referralData?.referralCode}
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share Now
                  </Button>
                </div>
              </div>
              {copySuccess && (
                <div className="mt-3 p-2 bg-green-500 bg-opacity-20 rounded-lg">
                  <p className="text-sm text-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Code copied to clipboard!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards - Mobile Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
                {referralData?.totalReferrals || 0}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                Total Referrals
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
                ₹{referralData?.totalRewards || 0}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">
                Total Earnings
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 sm:col-span-1 col-span-1">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Clock className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-gray-900">
                {referralData?.pendingReferrals || 0}
              </div>
              <div className="text-gray-600 text-sm sm:text-base">Pending</div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works - Mobile Optimized */}
        <Card className="mb-6 border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-3 sm:gap-6">
              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-lg text-gray-900">
                  Share Your Code
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Share your unique referral code with friends and family
                </p>
              </div>

              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-lg text-gray-900">
                  Friend Signs Up
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Your friend signs up using your referral code and gets ₹500
                  off
                </p>
              </div>

              <div className="text-center group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-400 to-orange-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-200">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-lg text-gray-900">
                  You Earn Rewards
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Earn ₹500 when your friend completes their first booking
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History - Mobile Optimized */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900">
              Referral History
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            {!referralData?.referrals || referralData.referrals.length === 0 ? (
              <div className="text-center py-8 sm:py-12">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                  <Users className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2 text-gray-900">
                  No Referrals Yet
                </h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed max-w-sm mx-auto">
                  Start sharing your referral code to earn rewards and help your
                  friends save money!
                </p>
                <Button
                  onClick={handleShare}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                  disabled={!referralData?.referralCode}
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Your Code
                </Button>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {referralData.referrals.map((referral) => (
                  <div
                    key={referral._id}
                    className="bg-white border border-gray-100 rounded-xl p-4 sm:p-5 hover:shadow-md transition-all duration-200 hover:border-orange-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900 text-base sm:text-lg">
                            {referral.referred?.name || "Unknown User"}
                          </h4>
                          {getStatusIcon(referral.status)}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          Referred on {formatDate(referral.createdAt)}
                        </p>
                        {referral.expiryDate && (
                          <p className="text-xs text-gray-500">
                            Expires: {formatDate(referral.expiryDate)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center space-x-3 sm:space-x-0 sm:space-y-2">
                        <div className="font-bold text-xl sm:text-2xl text-gray-900">
                          ₹{referral.reward}
                        </div>
                        <Badge
                          className={`px-3 py-1 text-xs font-medium rounded-full ${
                            referral.status === "completed"
                              ? "bg-green-100 text-green-800 hover:bg-green-100"
                              : referral.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                              : "bg-red-100 text-red-800 hover:bg-red-100"
                          }`}
                        >
                          {referral.status.charAt(0).toUpperCase() +
                            referral.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
