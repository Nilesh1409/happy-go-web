import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "Terms & Conditions - Happy Go Bike Rentals",
  description:
    "Read our comprehensive terms and conditions for bike rental services at Happy Go Bike Rentals in Chikkamagaluru.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Terms & <span className="text-[#F47B20]">Conditions</span>
            </h1>
            <div className="w-24 h-1 bg-[#F47B20] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">
              Please read these terms carefully before using our services
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Introduction */}
            <section>
              <div className="bg-[#F47B20]/10 border-l-4 border-[#F47B20] rounded-r-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  The terms and conditions of Happy Go Bike Rentals constitute a
                  legally valid and binding contract. Use of any services
                  through our Website or Application shall be deemed acceptance
                  of all terms set forth herein. We reserve the right to alter
                  these terms at our discretion.
                </p>
              </div>
            </section>

            {/* Registration Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                1. Registration Process
              </h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>
                    • Complete registration through our Website/App is mandatory
                  </li>
                  <li>
                    • Registration acceptance is subject to Happy Go's approval
                  </li>
                  <li>
                    • We reserve the right to verify authenticity of provided
                    documentation
                  </li>
                  <li>
                    • Registered mobile number will be used for all
                    communications
                  </li>
                </ul>
              </div>
            </section>

            {/* Payment Process */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                2. Payment Process
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Booking Payment
                  </h3>
                  <p className="text-gray-700 text-sm">
                    Booking amount must be paid online during reservation.
                    Extensions require additional payment subject to
                    availability.
                  </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Payment Methods
                  </h3>
                  <ul className="text-gray-700 text-sm space-y-1">
                    <li>• Net Banking</li>
                    <li>• UPI</li>
                    <li>• Paytm</li>
                    <li>• Debit/Credit Cards</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Delay Charges */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                3. Delay Charges
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-800 mb-3">
                    After Grace Period (30 mins)
                  </h3>
                  <p className="text-red-700 text-sm">
                    ₹1,000 + 3X rental charges per hour
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-800 mb-3">
                    Standard Delay
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    ₹200 + rental charges per hour
                  </p>
                </div>
              </div>
            </section>

            {/* Documents Required */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                4. Required Documents
              </h2>

              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-800 mb-4">
                    For Domestic Users
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Driving License
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Original Indian license required (learner's license not
                        accepted)
                      </p>
                    </div>
                    <div className="bg-white rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Aadhar Card
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Original Aadhar with registered mobile number
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-4">
                    For International Users
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Driving License
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Valid home country license + International Driving
                        Permit
                      </p>
                    </div>
                    <div className="bg-white rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Travel Documents
                      </h4>
                      <p className="text-gray-700 text-sm">
                        Valid visa and passport
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Age Restrictions */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                5. Age Restrictions
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-800 mb-3">
                    Ages 18-20
                  </h3>
                  <p className="text-orange-700 text-sm">
                    Allowed to ride vehicles below 200cc (except Yamaha R15)
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-green-800 mb-3">
                    Ages 21 & Above
                  </h3>
                  <p className="text-green-700 text-sm">
                    Allowed to ride any vehicle, including superbikes
                  </p>
                </div>
              </div>
            </section>

            {/* Safety Requirements */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                6. Safety Requirements
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="font-semibold text-red-800 mb-4">
                  Mandatory Safety Gear
                </h3>
                <ul className="space-y-2 text-red-700">
                  <li>• Helmet must be worn at all times</li>
                  <li>• Appropriate riding gear required</li>
                  <li>• Boots or closed-toe shoes mandatory</li>
                  <li>• Long pants required</li>
                  <li>• No flip-flops, sandals, or shorts allowed</li>
                </ul>
              </div>
            </section>

            {/* Prohibited Uses */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                7. Prohibited Uses
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Strictly Forbidden
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Use under influence of alcohol/drugs</li>
                    <li>• Carrying illegal substances</li>
                    <li>• Professional competitions/rallies</li>
                    <li>• Performing stunts</li>
                    <li>• Vehicle modifications</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Usage Limits
                  </h3>
                  <ul className="space-y-2 text-gray-700 text-sm">
                    <li>• Personal use only</li>
                    <li>• No overloading passengers</li>
                    <li>• No sharing with minors</li>
                    <li>• No criminal activities</li>
                    <li>• No sharp objects/weapons</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* GPS Tracking */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                8. GPS Tracking & Speed Monitoring
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <p className="text-gray-700 leading-relaxed">
                  All bikes have GPS tracking devices. We monitor speed limits
                  and can penalize users for rash driving up to ₹500 per
                  instance. Follow speed guidelines for your safety.
                </p>
              </div>
            </section>

            {/* Liability Waiver */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                9. Assumption of Risk & Liability Waiver
              </h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-700 leading-relaxed font-medium">
                  By using our services, you acknowledge that operating
                  motorcycles involves inherent risks and agree to assume entire
                  risk of accidents, property damage, or personal injury. You
                  release Happy Go Bike Rentals from any claims arising from
                  vehicle use.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <div className="mt-12 p-8 bg-gradient-to-r from-[#F47B20] to-orange-600 rounded-lg text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                Questions About Our Terms?
              </h3>
              <p className="mb-6">
                Contact us for clarification on any terms and conditions
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="inline-block bg-white text-[#F47B20] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Email Us
                </a>
                <a
                  href="tel:+919008022800"
                  className="inline-block bg-white text-[#F47B20] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Call +91 90080-22800
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
