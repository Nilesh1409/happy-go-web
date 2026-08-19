import Header from "@/components/header";
import Footer from "@/components/footer";
import { Trash2, Mail, Phone, Clock, ShieldAlert, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Request Data Deletion - Happy Go Bike Rentals",
  description:
    "Request complete deletion of your account and personal data from Happy Go Bike Rentals. Read our instructions to contact us via email or phone.",
};

export default function DeleteDataPage() {
  const emailAddress = "happygobikerentals@gmail.com";
  const phoneNumber = "+91 90080-22800";
  const emailSubject = encodeURIComponent("Data Deletion Request - Happy Go Bike Rentals");
  const emailBody = encodeURIComponent(
    "Dear Happy Go Team,\n\nI would like to request the permanent deletion of my account and all associated personal data from Happy Go Bike Rentals.\n\nAccount Details:\n- Registered Name: \n- Registered Mobile Number: \n- Registered Email: \n\nPlease confirm once the process is complete.\n\nBest regards,\n[Your Name]"
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <div>
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Main Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            
            {/* Top Banner Accent */}
            <div className="h-2 bg-gradient-to-r from-[#F47B20] to-orange-500 w-full" />

            <div className="p-8 md:p-12">
              {/* Page Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-50 rounded-2xl mb-4 text-[#F47B20] shadow-inner">
                  <Trash2 className="w-8 h-8" />
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                  Request <span className="text-[#F47B20]">Data Deletion</span>
                </h1>
                <div className="w-20 h-1 bg-[#F47B20] mx-auto mb-6 rounded-full" />
                <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  We respect your privacy and give you full control over your personal data.
                  If you wish to close your account and delete your information, please follow the steps below to contact us.
                </p>
              </div>

              {/* Grid: Instructions & Data Status */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                
                {/* Left Column: Contact Methods */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#F47B20] rounded-full inline-block" />
                    How to Request Deletion
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    To protect your identity and secure your data, we require requests to come directly from your registered contact details. You can request deletion through either of the following channels:
                  </p>

                  <div className="space-y-4">
                    {/* Email Option */}
                    <div className="group bg-white border border-gray-200 hover:border-[#F47B20] rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-50 text-[#F47B20] rounded-lg group-hover:bg-[#F47B20] group-hover:text-white transition-colors duration-300">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">Option 1: Write to Us</h3>
                          <p className="text-xs text-gray-500 mt-1 mb-3">
                            Send an email from your registered email address. We will verify and process it within 7 business days.
                          </p>
                          <a
                            href={`mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-[#F47B20] hover:text-orange-700 transition-colors text-ellipsis overflow-hidden block"
                          >
                            Email: {emailAddress}
                            <ArrowRight className="w-4 h-4 inline ml-1" />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Phone Option */}
                    <div className="group bg-white border border-gray-200 hover:border-[#F47B20] rounded-xl p-5 shadow-sm transition-all duration-300 hover:shadow-md">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-orange-50 text-[#F47B20] rounded-lg group-hover:bg-[#F47B20] group-hover:text-white transition-colors duration-300">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-sm">Option 2: Call Us</h3>
                          <p className="text-xs text-gray-500 mt-1 mb-3">
                            Speak to our customer support team directly to request immediate account closure and data deletion.
                          </p>
                          <a
                            href={`tel:${phoneNumber.replace(/[-\s]/g, "")}`}
                            className="inline-flex items-center gap-1 text-sm font-bold text-[#F47B20] hover:text-orange-700 transition-colors"
                          >
                            Call: {phoneNumber}
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Data Retention Info */}
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-5 bg-[#F47B20] rounded-full inline-block" />
                    What Happens to Your Data?
                  </h2>

                  <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">What is immediately deleted</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Your profile details (name, email, phone number) and driving license photos are permanently removed from our active systems and storage.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">Masked identity information</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          Aadhaar verification details are purged in 30 days. Only minimal verification log references are kept for auditing as per government regulations.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm">Legal & financial exceptions</h4>
                        <p className="text-xs text-gray-600 mt-1">
                          As a registered business in India, we are required by law to retain historical booking records and transaction invoices for up to 7 years to comply with GST and tax regulations.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Verification & Support Highlight */}
              <div className="mt-8 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-2xl p-6 border border-orange-100 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h4 className="font-bold text-gray-900 text-base mb-1">Need help with something else?</h4>
                  <p className="text-sm text-gray-600">
                    If you are having issues with verification, booking a bike, or have questions about our services, please contact our support team.
                  </p>
                </div>
                <div className="flex gap-3 w-full md:w-auto flex-shrink-0">
                  <a
                    href={`mailto:${emailAddress}?subject=Support%20Query`}
                    className="flex-1 md:flex-none text-center bg-white text-gray-700 hover:text-[#F47B20] border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300"
                  >
                    Email Support
                  </a>
                  <a
                    href={`tel:${phoneNumber.replace(/[-\s]/g, "")}`}
                    className="flex-1 md:flex-none text-center bg-[#F47B20] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-300"
                  >
                    Call Support
                  </a>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
