import { Phone, Mail, MapPin } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-[#F47B20] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">HG</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">HappyGo</h3>
                <p className="text-sm text-gray-400">Anywhere Everytime</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4 max-w-md">
              The reliable travel company operating in Chikkamagaluru since 2010
              and Happy Go Bike Rental is the subsidiary company of Happy Go
              Group. Happy Ride Happy Stay!
            </p>
            <div className="flex space-x-4">
              <a
                href="tel:+919008022800"
                className="text-gray-400 hover:text-[#F47B20]"
              >
                <Phone className="w-5 h-5" />
              </a>
              <a
                href="mailto:happygobikerentals@gmail.com"
                className="text-gray-400 hover:text-[#F47B20]"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Our Location */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Our Location</h4>
            <div className="space-y-2 text-gray-400">
              <div className="flex items-start">
                <MapPin className="w-4 h-4 mr-2 mt-1 flex-shrink-0" />
                <div>
                  <p>MG ROAD, SURYA SWEETS BUILDING,</p>
                  <p>CHIKKAMAGALURU 577101</p>
                </div>
              </div>
            </div>
          </div>

          {/* Get In Touch */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Get In Touch</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span className="text-sm">CHIKKAMAGALURU 577101</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="text-sm hover:text-[#F47B20]"
                >
                  happygobikerentals@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <a
                  href="tel:+919008022800"
                  className="text-sm hover:text-[#F47B20]"
                >
                  +91 90080-22800
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div>
              <h5 className="font-semibold mb-3">About Happygorentals</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/about" className="hover:text-[#F47B20]">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-[#F47B20]">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/cancellation" className="hover:text-[#F47B20]">
                    Cancellation & Refund Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-[#F47B20]">
                    Terms & Condition
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Services</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-[#F47B20]">
                    Bike Rental
                  </Link>
                </li>
                <li>
                  <Link href="/products" className="hover:text-[#F47B20]">
                    Products
                  </Link>
                </li>
                <li>
                  <Link href="/hostels" className="hover:text-[#F47B20]">
                    Hostels
                  </Link>
                </li>
                <li>
                  <Link href="/refer-earn" className="hover:text-[#F47B20]">
                    Refer & Earn
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Popular Bikes</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link
                    href="/search?brand=honda"
                    className="hover:text-[#F47B20]"
                  >
                    Honda Bikes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?brand=yamaha"
                    className="hover:text-[#F47B20]"
                  >
                    Yamaha Bikes
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?brand=royal-enfield"
                    className="hover:text-[#F47B20]"
                  >
                    Royal Enfield
                  </Link>
                </li>
                <li>
                  <Link
                    href="/search?brand=ktm"
                    className="hover:text-[#F47B20]"
                  >
                    KTM Bikes
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-3">Support</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/contact" className="hover:text-[#F47B20]">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-[#F47B20]">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:text-[#F47B20]">
                    Help Center
                  </Link>
                </li>
                <li>
                  <a href="tel:+919008022800" className="hover:text-[#F47B20]">
                    24/7 Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-400">
          <p>
            © 2024 <span className="text-[#F47B20]">Happy Go Bike Rentals</span>{" "}
            - All rights reserved.
          </p>
          <p className="mt-1">
            Best Bike Rental Service in Chikkamagaluru | Happy Ride Happy Stay
          </p>
        </div>
      </div>
    </footer>
  );
}
