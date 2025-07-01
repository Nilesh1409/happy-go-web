import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "Privacy Policy - Happy Go Bike Rentals",
  description:
    "Read our privacy policy to understand how we protect and handle your personal information at Happy Go Bike Rentals.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy <span className="text-[#F47B20]">Policy</span>
            </h1>
            <div className="w-24 h-1 bg-[#F47B20] mx-auto mb-6"></div>
            <p className="text-lg text-gray-600">
              Your privacy and data protection are our top priorities
            </p>
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none">
            <div className="bg-[#F47B20]/10 border-l-4 border-[#F47B20] rounded-r-lg p-6 mb-8">
              <p className="text-gray-700 leading-relaxed mb-0">
                At Happy Go Rentals, we prioritize the protection and
                confidentiality of your personal information. When you use our
                website or services, we may collect certain personal data such
                as your name, email address, and phone number. This information
                is collected solely for the purpose of facilitating
                communication with you and enhancing your experience with our
                rental services.
              </p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Data Protection Commitment
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  We understand the importance of safeguarding your privacy, and
                  we assure you that your personal information will not be
                  shared, sold, or distributed to any third parties without your
                  explicit consent. We utilize industry-standard security
                  measures to protect your data from unauthorized access,
                  disclosure, alteration, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Data Storage & Access
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    Your personal information is stored securely on our servers
                    and is accessible only to authorized personnel who are
                    required to maintain the confidentiality of such
                    information. We may use your contact information to send you
                    updates, promotional offers, or important notifications
                    related to your rental reservations or account activity.
                    However, you have the option to opt out of receiving such
                    communications at any time.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Security Measures
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Industry Standards
                    </h3>
                    <p className="text-gray-700 text-sm">
                      We employ industry-standard security protocols to protect
                      your data
                    </p>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Authorized Access
                    </h3>
                    <p className="text-gray-700 text-sm">
                      Only authorized personnel have access to your personal
                      information
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Important Disclaimer
                </h2>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <p className="text-gray-700 leading-relaxed">
                    Please note that while we take every precaution to protect
                    your personal information, no method of transmission over
                    the internet or electronic storage is completely secure.
                    Therefore, we cannot guarantee the absolute security of your
                    data, but we strive to employ the best practices to minimize
                    any risks.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Your Consent
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  By using our website and services, you consent to the
                  collection and use of your personal information as described
                  in this Privacy Policy. If you have any questions, concerns,
                  or requests regarding the handling of your personal data,
                  please don't hesitate to contact us. Your privacy and trust
                  are of utmost importance to us, and we are committed to
                  ensuring the protection and confidentiality of your
                  information.
                </p>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-12 p-8 bg-gradient-to-r from-[#F47B20] to-orange-600 rounded-lg text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                Questions About Our Privacy Policy?
              </h3>
              <p className="mb-6">
                We're here to help clarify any concerns you may have
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
                  Call Us
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
