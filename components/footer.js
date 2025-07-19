"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  Bike,
  Building2,
  Gift,
  User,
  Phone,
  Mail,
} from "lucide-react";

export default function Footer() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hi! I need help with bike booking. Can you assist me?"
    );
    const whatsappUrl = `https://wa.me/919008022800?text=${message}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content - 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          
          {/* Column 1: HappyGo */}
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src="/assets/happygo.jpeg"
                  alt="HappyGo Logo"
                  width={48}
                  height={48}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div>
                <h3 className="text-xl font-bold">HappyGo</h3>
                <p className="text-sm text-gray-400">Anywhere Everytime</p>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              The reliable travel company operating in Chikkamagaluru since 2010. Happy Ride Happy Stay!
            </p>
          </div>

          {/* Column 2: Company */}
          <div className="text-center md:text-left">
            <h5 className="font-semibold mb-4 text-lg">Company</h5>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/about" className="hover:text-[#F47B20] transition-colors">About Us</Link></li>
              <li><Link href="/" className="hover:text-[#F47B20] transition-colors">Bike Rental</Link></li>
              <li><Link href="/products" className="hover:text-[#F47B20] transition-colors">Products</Link></li>
              <li><Link href="/hostels" className="hover:text-[#F47B20] transition-colors">Hostels</Link></li>
              <li><Link href="/refer-earn" className="hover:text-[#F47B20] transition-colors">Refer & Earn</Link></li>
              <li><Link href="/privacy" className="hover:text-[#F47B20] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-[#F47B20] transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Column 3: Contact Us */}
          <div className="text-center md:text-left">
            <h5 className="font-semibold mb-4 text-lg">Contact Us</h5>
            <div className="space-y-4">
              <a
                href="tel:+919008022800"
                className="flex items-center justify-center md:justify-start space-x-3 text-gray-400 hover:text-[#F47B20] transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span>+91 90080-22800</span>
              </a>
              <a
                href="mailto:happygobikerentals@gmail.com"
                className="flex items-center justify-center md:justify-start space-x-3 text-gray-400 hover:text-[#F47B20] transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>happygobikerentals@gmail.com</span>
              </a>
              <button
                onClick={handleWhatsAppClick}
                className="flex items-center justify-center md:justify-start space-x-3 text-gray-400 hover:text-green-500 transition-colors w-full md:w-auto"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.106" />
                </svg>
                <span>WhatsApp Support</span>
              </button>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-4 text-center text-xs text-gray-400">
          <p>© 2024 <span className="text-[#F47B20]">Happy Go Bike Rentals</span> - All rights reserved.</p>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-40">
        <div className="grid grid-cols-5 py-2">
          <Link href="/" className="flex flex-col items-center py-2 text-[#F47B20]">
            <Bike className="w-5 h-5" />
            <span className="text-xs mt-1">Bike</span>
          </Link>
          <Link href="/bookings" className="flex flex-col items-center py-2 text-gray-600">
            <Calendar className="w-5 h-5" />
            <span className="text-xs mt-1">Bookings</span>
          </Link>
          <Link href="/products" className="flex flex-col items-center py-2 text-gray-600">
            <Building2 className="w-5 h-5" />
            <span className="text-xs mt-1">Products</span>
          </Link>
          <Link href="/refer-earn" className="flex flex-col items-center py-2 text-gray-600">
            <Gift className="w-5 h-5" />
            <span className="text-xs mt-1">Refer&Earn</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center py-2 text-gray-600">
            <User className="w-5 h-5" />
            <span className="text-xs mt-1">Profile</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}