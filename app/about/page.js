import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "About Us - Happy Go Bike Rentals",
  description:
    "Learn about Happy Go Bike Rentals, the most reliable bike rental company in Chikkamagaluru since 2010. Your happiness is our priority.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              About <span className="text-[#F47B20]">Happy Go</span>
            </h1>
            <div className="w-24 h-1 bg-[#F47B20] mx-auto mb-6"></div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The most reliable bike rental company in Chikkamagaluru since 2010
            </p>
          </div>

          {/* Main Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-gradient-to-r from-[#F47B20]/10 to-orange-100 rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Our Story
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Happy Go Bike Rentals is one of the oldest bike rental companies
                in Chikkamagaluru. We strongly believe that customer happiness
                is our utmost priority and we offer the most affordable rates
                with unlimited kilometer plans. Rent a bike from our wide range
                fleet - from scooters to bikes, you get to choose what you
                desire.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Our Mission
                </h3>
                <p className="text-gray-700">
                  If you plan a holiday in Chikkamagaluru and are looking for a
                  bike on rent, reserve the bike of your choice to make your
                  holiday memorable. Come, hire a bike and head to the scenic
                  mountains to find inner peace.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Our Goal
                </h3>
                <p className="text-gray-700">
                  The goal as a company is to have happy customer service that
                  is not just the best but legendary. We would love to create a
                  pleasant customer experience for every customer who avails our
                  service.
                </p>
              </div>
            </div>

            <div className="bg-[#F47B20]/5 border-l-4 border-[#F47B20] rounded-r-lg p-6 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Happy Go Group
              </h3>
              <p className="text-gray-700">
                Happy Go is the most reliable travel company operating in
                Chikkamagaluru since 2010, and Happy Go Bike Rental is the
                subsidiary company of Happy Go Group. Our experience and
                commitment to excellence have made us the trusted choice for
                travelers.
              </p>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-[#F47B20] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">14+</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Years of Experience
                </h4>
                <p className="text-gray-600 text-sm">
                  Serving customers since 2010
                </p>
              </div>

              <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-[#F47B20] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">∞</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Unlimited KM
                </h4>
                <p className="text-gray-600 text-sm">
                  No restrictions on distance
                </p>
              </div>

              <div className="text-center p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="w-16 h-16 bg-[#F47B20] rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">24/7</span>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Customer Support
                </h4>
                <p className="text-gray-600 text-sm">Always here to help you</p>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-[#F47B20] to-orange-600 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready for Your Adventure?
            </h3>
            <p className="mb-6">
              Experience the scenic beauty of Chikkamagaluru with our reliable
              bikes
            </p>
            <a
              href="/"
              className="inline-block bg-white text-[#F47B20] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Your Bike Now
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
