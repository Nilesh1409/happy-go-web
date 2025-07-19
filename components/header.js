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
      {/* ───── Top Contact Bar ───── */}
      <div className="bg-gray-900 text-white py-2 sm:py-2.5">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            {/* Contact Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 lg:space-x-6">
              <div className="flex items-center">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="hidden lg:inline">Call us 24/7: </span>
                <a
                  href="tel:+919008022800"
                  className="font-semibold hover:text-[#F47B20] transition-colors whitespace-nowrap"
                >
                  +91 90080-22800
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 flex-shrink-0" />
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="hover:text-[#F47B20] transition-colors"
                >
                  <span className="hidden sm:inline">happygobikerentals@gmail.com</span>
                  <span className="sm:hidden">Email Us</span>
                </a>
              </div>
            </div>

            {/* Location */}
            <div className="text-xs flex-shrink-0">
              <span className="hidden lg:inline">📍 Barlane Rd, near KSRTC Bus Stand, Chikkamagaluru 577101</span>
              <span className="lg:hidden">📍 Chikkamagaluru</span>
            </div>
          </div>
        </div>
      </div>

      {/* ───── Main Header ───── */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18">
            
            {/* ── LOGO ── */}
            <Link
              href="/"
              className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0 min-w-0"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
                <Image
                  src="/assets/happygo.jpeg"
                  alt="Happy Go"
                  fill
                  sizes="40px"
                  className="object-contain rounded-lg"
                  priority
                />
              </div>
              <div className="min-w-0">
                <span className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 whitespace-nowrap">
                  Happy Go
                </span>
                <div className="text-xs text-gray-600 -mt-0.5 hidden sm:block whitespace-nowrap">
                  Anywhere Everytime
                </div>
              </div>
            </Link>

            {/* ───── Desktop Navigation ───── */}
            <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
              <Link
                href="/"
                className="text-[#F47B20] font-medium hover:text-[#E06A0F] transition-colors whitespace-nowrap"
              >
                Bike Rental
              </Link>
              <Link
                href="/products"
                className="text-gray-600 hover:text-[#F47B20] transition-colors whitespace-nowrap"
              >
                Products
              </Link>
              <Link
                href="/hostels"
                className="text-gray-600 hover:text-[#F47B20] transition-colors whitespace-nowrap"
              >
                Hostels
              </Link>
              <Link
                href="/refer-earn"
                className="text-gray-600 hover:text-[#F47B20] transition-colors whitespace-nowrap"
              >
                Refer & Earn
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-[#F47B20] transition-colors whitespace-nowrap"
              >
                About
              </Link>
            </nav>

            {/* ───── Right Actions ───── */}
            <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3">
              
              {/* WhatsApp Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWhatsAppClick}
                className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 sm:px-3 rounded-lg transition-all duration-200"
                title="Chat with us on WhatsApp"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
                </svg>
                <span className="hidden lg:inline ml-2 whitespace-nowrap">
                  Chat with us
                </span>
              </Button>

              {/* User Authentication */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* My Bookings - Desktop only */}
                  <Link href="/bookings" className="hidden lg:block">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="whitespace-nowrap hover:bg-gray-50 transition-colors"
                    >
                      My Bookings
                    </Button>
                  </Link>

                  {/* User Dropdown */}
                  <div
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-1 hover:bg-gray-50 transition-colors rounded-lg"
                    >
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:inline max-w-20 truncate">
                        {user.name}
                      </span>
                    </Button>
                    
                    {/* Dropdown Menu */}
                    <div
                      className={`absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg py-2 border transition-all duration-200 ${
                        isDropdownOpen
                          ? "opacity-100 visible transform translate-y-0"
                          : "opacity-0 invisible transform -translate-y-2"
                      }`}
                    >
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        href="/bookings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors lg:hidden"
                      >
                        My Bookings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Auth Buttons - Mobile First Design */
                <div className="flex items-center space-x-2">
                  {/* Login Button - Hidden on mobile, visible on tablet+ */}
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="hidden md:inline-flex hover:bg-gray-50 transition-colors rounded-lg px-4"
                  >
                    <Link href="/login">Login</Link>
                  </Button>
                  
                  {/* Sign Up Button - Always visible, responsive design */}
                  <Button
                    size="sm"
                    className="bg-[#F47B20] hover:bg-[#E06A0F] text-white font-medium px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
                    asChild
                  >
                    <Link href="/register">
                      <span className="text-sm">Sign Up</span>
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden p-2 hover:bg-gray-50 transition-colors rounded-lg"
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

        {/* ───── Mobile Menu ───── */}
        <div
          className={`lg:hidden bg-white border-t transition-all duration-300 ease-in-out ${
            isMenuOpen 
              ? "max-h-100 opacity-100" 
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="px-4 py-4 space-y-1">
            {/* Navigation Links */}
            <div className="space-y-1 mb-4">
              <Link
                href="/"
                className="block py-3 px-2 text-[#F47B20] font-medium rounded-lg hover:bg-orange-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Bike Rental
              </Link>
              <Link
                href="/products"
                className="block py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/hostels"
                className="block py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hostels
              </Link>
              <Link
                href="/refer-earn"
                className="block py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Refer & Earn
              </Link>
              <Link
                href="/about"
                className="block py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
            </div>

            {/* Mobile Auth Section */}
            {!user && (
              <div className="pt-4 border-t border-gray-100 space-y-3">
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-center py-3 text-gray-700 hover:bg-gray-50 transition-colors rounded-lg border border-gray-200"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full justify-center py-3 bg-[#F47B20] hover:bg-[#E06A0F] text-white font-medium rounded-lg transition-all duration-200 shadow-sm">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* User Menu Items for Mobile */}
            {user && (
              <div className="pt-4 border-t border-gray-100 space-y-1">
                <Link
                  href="/bookings"
                  className="block py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  href="/profile"
                  className="block py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left py-3 px-2 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}