"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Gift, Copy, Share, Users, Wallet } from "lucide-react"
import Link from "next/link"

export default function ReferEarnPage() {
  const [referralCode, setReferralCode] = useState("")
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
  })
  const [referralHistory, setReferralHistory] = useState([])

  useEffect(() => {
    // Simulate API call for user referral data
    setReferralCode("HAPPY123")
    setReferralStats({
      totalReferrals: 5,
      totalEarnings: 2500,
      pendingEarnings: 500,
    })
    setReferralHistory([
      {
        id: "1",
        friendName: "John Doe",
        status: "completed",
        earnings: 500,
        date: "2025-06-20",
      },
      {
        id: "2",
        friendName: "Jane Smith",
        status: "pending",
        earnings: 500,
        date: "2025-06-18",
      },
    ])
  }, [])

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode)
    alert("Referral code copied to clipboard!")
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join Happy Go",
        text: `Use my referral code ${referralCode} and get ₹500 off on your first booking!`,
        url: `https://happygo.com/signup?ref=${referralCode}`,
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center mr-4">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center">
              <Gift className="w-6 h-6 mr-2" />
              <h1 className="text-xl font-semibold">Refer & Earn</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hero Section */}
        <Card className="mb-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <CardContent className="p-8 text-center">
            <Gift className="w-16 h-16 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-2">Earn ₹500 for Every Friend!</h2>
            <p className="text-lg opacity-90 mb-6">
              Invite your friends to Happy Go and earn rewards when they complete their first booking
            </p>
            <div className="bg-white bg-opacity-20 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm mb-2">Your Referral Code</p>
              <div className="flex items-center space-x-2">
                <div className="bg-white text-orange-600 px-4 py-2 rounded-lg font-bold text-xl flex-1">
                  {referralCode}
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyCode}
                  className="bg-white text-orange-600 hover:bg-gray-100"
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShare}
                  className="bg-white text-orange-600 hover:bg-gray-100"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">{referralStats.totalReferrals}</div>
              <div className="text-gray-600">Total Referrals</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Wallet className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">₹{referralStats.totalEarnings}</div>
              <div className="text-gray-600">Total Earnings</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Gift className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <div className="text-2xl font-bold mb-1">₹{referralStats.pendingEarnings}</div>
              <div className="text-gray-600">Pending Earnings</div>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>How it Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  1
                </div>
                <h3 className="font-semibold mb-2">Share Your Code</h3>
                <p className="text-gray-600 text-sm">Share your unique referral code with friends and family</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  2
                </div>
                <h3 className="font-semibold mb-2">Friend Signs Up</h3>
                <p className="text-gray-600 text-sm">Your friend signs up using your referral code and gets ₹500 off</p>
              </div>

              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  3
                </div>
                <h3 className="font-semibold mb-2">You Earn Rewards</h3>
                <p className="text-gray-600 text-sm">Earn ₹500 when your friend completes their first booking</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referralHistory.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
                <p className="text-gray-600">Start sharing your referral code to earn rewards!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {referralHistory.map((referral) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{referral.friendName}</h4>
                      <p className="text-sm text-gray-600">Referred on {referral.date}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">₹{referral.earnings}</div>
                      <Badge
                        variant={referral.status === "completed" ? "default" : "secondary"}
                        className={referral.status === "completed" ? "bg-green-100 text-green-800" : ""}
                      >
                        {referral.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
