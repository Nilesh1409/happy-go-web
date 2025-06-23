"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Menu, X, User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <>
      {/* Top Contact Bar */}
      <div className="bg-gray-900 text-white py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>Call us 24/7: </span>
                <a
                  href="tel:+919008022800"
                  className="font-semibold hover:text-[#F47B20]"
                >
                  +91 90080-22800
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="hover:text-[#F47B20]"
                >
                  happygobikerentals@gmail.com
                </a>
              </div>
            </div>
            <div className="text-xs">
              📍 MG Road, Surya Sweets Building, Chikkamagaluru 577101
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#F47B20] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">HG</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">
                  Happy Go
                </span>
                <div className="text-xs text-gray-600 -mt-1">
                  Anywhere Everytime
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex space-x-8">
              <Link
                href="/"
                className="text-[#F47B20] font-medium hover:text-[#E06A0F]"
              >
                Bike Rental
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-[#F47B20]"
              >
                Products
              </Link>
              <Link
                href="/hostels"
                className="text-gray-600 hover:text-[#F47B20]"
              >
                Hostels
              </Link>
              <Link
                href="/refer-earn"
                className="text-gray-600 hover:text-[#F47B20]"
              >
                Refer & Earn
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-[#F47B20]"
              >
                About
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link href="/bookings">
                    <Button variant="ghost" size="sm">
                      My Bookings
                    </Button>
                  </Link>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                    >
                      <User className="w-4 h-4 mr-1" />
                      {user.name}
                    </Button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button size="sm" className="btn-primary" asChild>
                    <Link href="/register">Sign Up</Link>
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-2 space-y-2">
              <div className="py-2 border-b">
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  <a href="tel:+919008022800" className="font-semibold">
                    +91 90080-22800
                  </a>
                </div>
              </div>
              <Link href="/" className="block py-2 text-[#F47B20] font-medium">
                Bike Rental
              </Link>
              <Link href="/products" className="block py-2 text-gray-600">
                Products
              </Link>
              <Link href="/hostels" className="block py-2 text-gray-600">
                Hostels
              </Link>
              <Link href="/refer-earn" className="block py-2 text-gray-600">
                Refer & Earn
              </Link>
              <Link href="/about" className="block py-2 text-gray-600">
                About
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
