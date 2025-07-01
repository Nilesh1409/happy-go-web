import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "Cancellation & Refund Policy - Happy Go Bike Rentals",
  description:
    "Learn about our cancellation and refund policy, damage charges, and rental terms at Happy Go Bike Rentals.",
};

export default function CancellationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Cancellation &{" "}
              <span className="text-[#F47B20]">Refund Policy</span>
            </h1>
            <div className="w-24 h-1 bg-[#F47B20] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">
              Understanding our cancellation terms and rental policies
            </p>
          </div>

          {/* Content */}
          <div className="space-y-8">
            {/* Cancellation Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Cancellation Policy
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                  <h3 className="font-semibold text-red-800 mb-3">
                    No Show & Less than 4 Days
                  </h3>
                  <p className="text-red-700 text-sm">
                    100% deduction of rental charges
                  </p>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="font-semibold text-yellow-800 mb-3">
                    5 Days or More Prior
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    50% rental charges will be withheld
                  </p>
                </div>
              </div>
            </section>

            {/* Riding Guidelines */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Riding Guidelines
              </h2>

              <div className="bg-[#F47B20]/10 border-l-4 border-[#F47B20] rounded-r-lg p-6 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Overspeeding Policy
                </h3>
                <p className="text-gray-700">
                  The bikes have to be ridden within permissible speed limits.
                  The speed limit for each vehicle is different and will be
                  specified at the time of booking. You must stay under the
                  speed limit specified by the company or the governing
                  authority, whichever is lesser.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="font-semibold text-green-800 mb-3">
                  Unlimited Kilometers
                </h3>
                <p className="text-green-700">
                  Happy Go offers unlimited kilometer plans for all rentals.
                </p>
              </div>
            </section>

            {/* Helmet Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Helmet Policy
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Free Helmet Provision
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Happy Go offers free helmets to riders - one helmet is
                    sufficient for each booking.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Damage/Loss Charges
                      </h4>
                      <p className="text-gray-700 text-sm">
                        ₹1,000 for damaged or lost helmets
                      </p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded p-4">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Extra Helmets
                      </h4>
                      <p className="text-gray-700 text-sm">
                        ₹50 per day for additional helmets
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Damage Policy */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Damage Policy
              </h2>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <p className="text-gray-700 leading-relaxed">
                  The User/Rider agrees to pay for any damage to, loss of, or
                  theft of parts of the vehicle, regardless of cause or fault.
                  Items damaged beyond repair will be paid for at Market Price.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Damage Assessment
                  </h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      • Pre-existing damage agreed upon during handover will not
                      be charged
                    </li>
                    <li>• Seat cover tears result in replacement charges</li>
                    <li>
                      • Damages beyond normal wear and tear will be charged to
                      the user
                    </li>
                  </ul>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <h3 className="font-semibold text-red-800 mb-3">
                      Accident Insurance
                    </h3>
                    <p className="text-red-700 text-sm mb-2">
                      Standard amount up to ₹15,000 (may vary by damage
                      severity)
                    </p>
                    <p className="text-red-600 text-xs">
                      *Not applicable for vehicles exceeding 200cc
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-blue-800 mb-3">
                      High-End Vehicles (200cc+)
                    </h3>
                    <p className="text-blue-700 text-sm">
                      Actual repair amount to be borne by rider. Insurance
                      claimed only if loss exceeds 25% of bike value.
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-800 mb-3">
                    Additional Charges
                  </h3>
                  <ul className="space-y-2 text-orange-700 text-sm">
                    <li>
                      • Towing costs due to collision are borne by the rider
                    </li>
                    <li>
                      • Inactive hours during repair: 50% of per-day rental
                      amount
                    </li>
                    <li>• Confiscation costs are rider's responsibility</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Contact for Clarifications */}
            <div className="mt-12 p-8 bg-gradient-to-r from-[#F47B20] to-orange-600 rounded-lg text-white text-center">
              <h3 className="text-2xl font-bold mb-4">Need Clarification?</h3>
              <p className="mb-6">
                Contact us for any questions about our cancellation and refund
                policy
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:happygobikerentals@gmail.com"
                  className="inline-block bg-white text-[#F47B20] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Email Support
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
