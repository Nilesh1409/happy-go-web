"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Menu, X, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const handleWhatsAppClick = () => {
    const msg = encodeURIComponent(
      "Hi! I need help with bike booking. Can you assist me?"
    );
    window.open(`https://wa.me/919008022800?text=${msg}`, "_blank");
  };

  return (
    <>
      {/* ───── Top Contact Bar (desktop) ───── */}
      <div className="bg-gray-900 text-white py-2 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            {/* phone + mail */}
            <div className="flex items-center space-x-4 xl:space-x-6">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span className="hidden xl:inline">Call us 24/7: </span>
                <a
                  href="tel:+919008022800"
                  className="font-semibold hover:text-[#F47B20] transition-colors"
                >
                  +91&nbsp;90080-22800
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="hover:text-[#F47B20] transition-colors hidden xl:inline"
                >
                  happygobikerentals@gmail.com
                </a>
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="hover:text-[#F47B20] transition-colors xl:hidden"
                >
                  Email&nbsp;Us
                </a>
              </div>
            </div>

            <div className="text-xs hidden xl:block">
              📍 Barlane Rd, near KSRTC Bus Stand, Chikkamagaluru&nbsp;577101
            </div>
            <div className="text-xs xl:hidden">📍 Chikkamagaluru</div>
          </div>
        </div>
      </div>

      {/* ───── Mobile Top Contact Bar ───── */}
      <div className="bg-gray-900 text-white py-1.5 lg:hidden">
        <div className="px-4">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Phone className="w-3 h-3 mr-1" />
                <a
                  href="tel:+919008022800"
                  className="font-semibold hover:text-[#F47B20] transition-colors"
                >
                  +91&nbsp;90080-22800
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 mr-1" />
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="hover:text-[#F47B20] transition-colors"
                >
                  Email&nbsp;Us
                </a>
              </div>
            </div>
            <div className="text-xs">📍 Chikkamagaluru</div>
          </div>
        </div>
      </div>

      {/* ───── Main Header ───── */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* ── LOGO (background‐color removed) ── */}
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0"
            >
              {/* container kept only for sizing / centering */}
              <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                {/*
                  1️⃣ bg-[#F47B20] removed
                  2️⃣ Image fills container, keeps rounded-lg corners
                */}
                <Image
                  src="/assets/happygo.jpeg"
                  alt="Happy Go"
                  fill
                  sizes="40px"
                  className="object-contain rounded-lg"
                  priority
                />
              </div>

              {/* Brand name / tagline */}
              <div className="hidden xs:block">
                <span className="text-lg sm:text-2xl font-bold text-gray-900">
                  Happy&nbsp;Go
                </span>
                <div className="text-xs text-gray-600 -mt-1 hidden sm:block">
                  Anywhere&nbsp;Everytime
                </div>
              </div>
            </Link>

            {/* ───── Desktop Navigation ───── */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8">
              <Link
                href="/"
                className="text-[#F47B20] font-medium hover:text-[#E06A0F] transition-colors"
              >
                Bike&nbsp;Rental
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-[#F47B20] transition-colors"
              >
                Products
              </Link>
              <Link
                href="/hostels"
                className="text-gray-600 hover:text-[#F47B20] transition-colors"
              >
                Hostels
              </Link>
              <Link
                href="/refer-earn"
                className="text-gray-600 hover:text-[#F47B20] transition-colors"
              >
                Refer&nbsp;&amp;&nbsp;Earn
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-[#F47B20] transition-colors"
              >
                About
              </Link>
            </nav>

            {/* ───── Right-side actions (WhatsApp, user, burger) ───── */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* WhatsApp */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsAppClick}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2"
                title="Chat with us on WhatsApp"
              >
                {/* svg icon */}
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
                </svg>
                <span className="hidden sm:inline ml-1">
                  Chat&nbsp;with&nbsp;us
                </span>
              </Button>

              {/* User / auth */}
              {user ? (
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Link href="/bookings" className="hidden sm:block">
                    <Button variant="ghost" size="sm">
                      My&nbsp;Bookings
                    </Button>
                  </Link>

                  {/* dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center"
                    >
                      <User className="w-4 h-4 mr-1" />
                      <span className="hidden sm:inline max-w-20 truncate">
                        {user.name}
                      </span>
                    </Button>
                    <div
                      className={`absolute right-0 top-full w-48 bg-white rounded-md shadow-lg py-1 border transition-all duration-150 ${
                        isDropdownOpen
                          ? "opacity-100 visible"
                          : "opacity-0 invisible"
                      }`}
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 sm:hidden"
                      >
                        My&nbsp;Bookings
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
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden sm:inline-flex"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button
                    size="sm"
                    className="btn-primary text-xs sm:text-sm"
                    asChild
                  >
                    <Link href="/register">
                      <span className="hidden sm:inline">Sign&nbsp;Up</span>
                      <span className="sm:hidden">Sign-Up</span>
                    </Link>
                  </Button>
                </div>
              )}

              {/* Burger */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2"
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

        {/* ───── Mobile menu ───── */}
        {isMenuOpen && (
          <div className="lg:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              {/* nav links */}
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block py-2 text-[#F47B20] font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Bike&nbsp;Rental
                </Link>
                <Link
                  href="/products"
                  className="block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Products
                </Link>
                <Link
                  href="/hostels"
                  className="block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hostels
                </Link>
                <Link
                  href="/refer-earn"
                  className="block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Refer&nbsp;&amp;&nbsp;Earn
                </Link>
                <Link
                  href="/about"
                  className="block py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  About
                </Link>
              </div>

              {/* auth */}
              {!user && (
                <div className="pt-3 border-t border-gray-100">
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start mb-2"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full btn-primary">Sign&nbsp;Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
    </>
  );
}
