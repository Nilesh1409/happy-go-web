import Header from "@/components/header";
import Footer from "@/components/footer";

export const metadata = {
  title: "Privacy Policy - Happy Go Bike Rentals",
  description:
    "Read our privacy policy to understand how we collect, use, and protect your personal information at Happy Go Bike Rentals.",
};

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
      <span className="w-1 h-6 bg-[#F47B20] rounded-full inline-block" />
      {title}
    </h2>
    {children}
  </section>
);

const DataRow = ({ icon, label, collected, purpose, legal }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-5 mb-4 shadow-sm">
    <div className="flex items-start gap-4">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div className="flex-1 space-y-2">
        <h3 className="font-semibold text-gray-900 text-base">{label}</h3>
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">What we collect</span>
          <p className="text-sm text-gray-700 mt-0.5">{collected}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why we need it</span>
          <p className="text-sm text-gray-700 mt-0.5">{purpose}</p>
        </div>
        <div>
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Legal basis</span>
          <p className="text-sm text-gray-700 mt-0.5">{legal}</p>
        </div>
      </div>
    </div>
  </div>
);

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">

          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Privacy <span className="text-[#F47B20]">Policy</span>
            </h1>
            <div className="w-24 h-1 bg-[#F47B20] mx-auto mb-6" />
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Your privacy and data protection are our top priorities. This policy
              explains exactly what data we collect, why we collect it, and how we
              protect it.
            </p>
            <p className="text-sm text-gray-400 mt-3">
              Last updated: April 2025 &nbsp;·&nbsp; Effective: April 2025
            </p>
          </div>

          {/* Intro Banner */}
          <div className="bg-[#F47B20]/10 border-l-4 border-[#F47B20] rounded-r-xl p-6 mb-10">
            <p className="text-gray-700 leading-relaxed">
              Happy Go Bike Rentals ("Happy Go", "we", "our") operates the website{" "}
              <strong>happygorentals.com</strong> and the Happy Go mobile app. This
              Privacy Policy describes how we handle personal data collected when
              you create an account, make a booking, or use our identity-verification
              features. By using our services you agree to the practices described
              below.
            </p>
          </div>

          <div className="space-y-0">

            {/* ── 1. Information We Collect ── */}
            <Section title="1. Information We Collect &amp; Why">
              <p className="text-gray-600 mb-5 text-sm leading-relaxed">
                We only collect data that is strictly necessary to provide our
                services safely. The table below explains each data type, what
                exactly is stored, and the reason it is required.
              </p>

              <DataRow
                icon="👤"
                label="Full Name"
                collected="Your full name as provided during registration or profile setup."
                purpose="To personalise your booking confirmations, receipts, and customer-support interactions. Required by our rental operations to identify the person who rented the vehicle."
                legal="Contract performance — needed to fulfil the rental agreement."
              />

              <DataRow
                icon="📧"
                label="Email Address"
                collected="Your email address provided at sign-up."
                purpose="To send booking confirmations, payment receipts, OTP verification, and important service notifications (e.g. booking status changes). You may opt out of promotional emails at any time."
                legal="Contract performance & legitimate interest (service communications)."
              />

              <DataRow
                icon="📱"
                label="Mobile Phone Number"
                collected="Your 10-digit mobile number."
                purpose="Used for OTP-based login authentication to verify your identity securely. Also used for booking-related WhatsApp/SMS notifications and emergency contact during your rental period."
                legal="Contract performance & security — OTP is required for account login."
              />

              <DataRow
                icon="🪪"
                label="Aadhaar Number (Last 4 Digits Only)"
                collected={
                  "We store ONLY the last 4 digits of your Aadhaar number (masked as XXXX-XXXX-XXXX), along with the name, date of birth, gender, and address as returned by the DigiLocker verification API. The full 12-digit Aadhaar number is NEVER stored in plain text — it is encrypted at rest and inaccessible to any staff member."
                }
                purpose="Indian motor-vehicle laws and our rental agreement require us to verify the identity of every customer who rents a two-wheeler. Aadhaar-based DigiLocker verification (via Cashfree) is the government-approved digital identity verification method. Storing the masked number and basic details allows us to confirm the verified identity during bike pickup without requiring you to carry physical documents every time."
                legal="Legal obligation (Motor Vehicles Act, 1988) & contract performance."
              />

              <DataRow
                icon="🪪"
                label="Driving License Image"
                collected="A photograph of your driving license, uploaded through the app or website. The image is stored securely on Amazon S3 (encrypted storage)."
                purpose="A valid driving license is a legal requirement to ride any motor vehicle on Indian roads. We store your DL image so our staff can verify its validity at bike pickup without requiring you to present the physical card each time you rent. The image is visible only to authorised Happy Go staff handling your booking."
                legal="Legal obligation (Motor Vehicles Act, 1988) & contract performance."
              />

              <DataRow
                icon="💳"
                label="Payment Information"
                collected="Transaction reference IDs and payment status. We do NOT store card numbers, UPI PINs, or any sensitive payment credentials — all payments are processed by Razorpay, a PCI-DSS compliant gateway."
                purpose="To track payment status, issue refunds, and resolve payment disputes."
                legal="Contract performance & legal obligation (financial record-keeping)."
              />

              <DataRow
                icon="📍"
                label="Location (Pickup City)"
                collected="The city/location you choose for bike pickup (e.g. Chikkamagaluru). We do NOT collect real-time GPS location."
                purpose="To show you available bikes in your selected location and to fulfil the booking."
                legal="Contract performance."
              />
            </Section>

            {/* ── 2. How We Use Your Data ── */}
            <Section title="2. How We Use Your Information">
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                {[
                  "Create and manage your user account",
                  "Process bike and hostel bookings and send confirmations",
                  "Verify your identity (Aadhaar) and driving eligibility (DL) as required by law",
                  "Send OTPs, booking updates, payment receipts, and service alerts",
                  "Enable customer support to assist with your bookings",
                  "Comply with applicable laws and government regulations",
                  "Prevent fraud and ensure the safety of our rental fleet",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-[#F47B20] font-bold mt-0.5">✓</span>
                    <p className="text-sm text-gray-700">{item}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 3. Data Sharing ── */}
            <Section title="3. Data Sharing &amp; Third Parties">
              <p className="text-gray-700 leading-relaxed mb-4">
                We do <strong>not sell, rent, or trade</strong> your personal data.
                We share data with the following third parties only to the extent
                necessary to deliver our services:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-3 font-semibold text-gray-700 rounded-tl-lg">Service</th>
                      <th className="text-left p-3 font-semibold text-gray-700">Provider</th>
                      <th className="text-left p-3 font-semibold text-gray-700 rounded-tr-lg">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {[
                      ["Identity verification", "Cashfree (DigiLocker API)", "Aadhaar-based KYC"],
                      ["Payment processing", "Razorpay", "Secure payment gateway"],
                      ["File storage", "Amazon S3 (AWS)", "DL image & Aadhaar photo storage"],
                      ["SMS / OTP delivery", "MessageCentral / Fast2SMS", "OTP for login"],
                      ["Email delivery", "Gmail SMTP", "Booking confirmations & alerts"],
                    ].map(([svc, prov, purp], i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="p-3 text-gray-800 font-medium">{svc}</td>
                        <td className="p-3 text-gray-600">{prov}</td>
                        <td className="p-3 text-gray-600">{purp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            {/* ── 4. Data Retention ── */}
            <Section title="4. Data Retention">
              <div className="bg-gray-50 rounded-xl p-6 space-y-4 text-sm text-gray-700">
                <p>We retain your data only for as long as necessary:</p>
                <ul className="space-y-2 list-disc list-inside">
                  <li><strong>Account data</strong> (name, email, phone) — retained while your account is active, or up to 3 years after last activity for legal/accounting compliance.</li>
                  <li><strong>Driving license image</strong> — retained for the duration of your account and for 1 year after account deletion for dispute resolution, as required under applicable transport regulations.</li>
                  <li><strong>Aadhaar masked number &amp; details</strong> — retained for the duration of your account. The full encrypted number is purged within 30 days of account deletion.</li>
                  <li><strong>Booking records</strong> — retained for 7 years to comply with Indian financial and tax regulations (GST Act).</li>
                  <li><strong>Previous DL images</strong> — when you upload a new DL image, the old file is deleted from cloud storage. A reference (key + timestamp) is retained in our database for audit purposes only; the actual image is not accessible.</li>
                </ul>
              </div>
            </Section>

            {/* ── 5. Data Security ── */}
            <Section title="5. Data Security">
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: "🔒", title: "Encryption at Rest", desc: "All sensitive fields (full Aadhaar number) are encrypted using AES-256 before being stored in our database." },
                  { icon: "🌐", title: "Encrypted in Transit", desc: "All communication between your device and our servers uses TLS 1.2+ (HTTPS). Credentials are never sent over plain HTTP." },
                  { icon: "🗄️", title: "Secure Cloud Storage", desc: "DL images and Aadhaar photos are stored on Amazon S3 with server-side encryption. Direct public access is restricted." },
                  { icon: "👥", title: "Access Controls", desc: "Only authorised Happy Go staff involved in processing your booking have access to your verification documents." },
                ].map(({ icon, title, desc }, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{icon}</span>
                      <h3 className="font-semibold text-gray-900">{title}</h3>
                    </div>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* ── 6. Your Rights ── */}
            <Section title="6. Your Rights">
              <div className="bg-gray-50 rounded-xl p-6 space-y-3 text-sm text-gray-700">
                <p className="font-medium text-gray-900">You have the following rights regarding your personal data:</p>
                <ul className="space-y-2">
                  {[
                    ["Access", "Request a copy of the personal data we hold about you."],
                    ["Correction", "Ask us to correct inaccurate or incomplete information."],
                    ["Deletion", "Request deletion of your personal data (subject to legal retention requirements)."],
                    ["Restriction", "Ask us to restrict processing of your data in certain circumstances."],
                    ["Withdrawal of Consent", "Withdraw consent at any time where processing is based on consent."],
                  ].map(([right, desc], i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[#F47B20] font-bold mt-0.5">→</span>
                      <span><strong>{right}:</strong> {desc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Section>

            {/* ── 7. Data Deletion ── */}
            <Section title="7. Account &amp; Data Deletion">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  You have the right to request complete deletion of your account
                  and all associated personal data. To submit a deletion request,
                  please email us from the address registered with your account:
                </p>
                <div className="bg-white rounded-lg p-4 border border-red-100 text-center">
                  <p className="text-sm text-gray-500 mb-1">Send your deletion request to</p>
                  <a
                    href="mailto:happygobikerentals@gmail.com?subject=Data%20Deletion%20Request"
                    className="text-[#F47B20] font-bold text-lg hover:underline"
                  >
                    happygobikerentals@gmail.com
                  </a>
                  <p className="text-xs text-gray-400 mt-2">
                    Subject: <em>Data Deletion Request</em> &nbsp;·&nbsp; We will respond within 7 business days.
                  </p>
                </div>
                <p className="text-xs text-gray-500 mt-4">
                  Note: Booking records may be retained for up to 7 years to comply
                  with Indian GST and financial regulations, even after account
                  deletion. Driving license images and Aadhaar details will be
                  deleted in accordance with Section 4 above.
                </p>
              </div>
            </Section>

            {/* ── 8. Children's Privacy ── */}
            <Section title="8. Children's Privacy">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  Our services are not directed to individuals under the age of 18.
                  We do not knowingly collect personal information from minors. A
                  valid driving license is required to rent a vehicle, which in India
                  requires the rider to be at least 16–18 years of age depending on
                  the vehicle class. If you believe a minor has provided us with
                  personal data, please contact us immediately.
                </p>
              </div>
            </Section>

            {/* ── 9. Disclaimer ── */}
            <Section title="9. Important Disclaimer">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <p className="text-gray-700 leading-relaxed">
                  While we take every precaution to protect your personal
                  information, no method of transmission over the internet or
                  electronic storage is completely secure. We cannot guarantee
                  the absolute security of your data, but we employ industry best
                  practices to minimise risk.
                </p>
              </div>
            </Section>

            {/* ── 10. Changes ── */}
            <Section title="10. Changes to This Policy">
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. When we do,
                we will revise the "Last updated" date at the top of this page and,
                where the changes are significant, notify you via email or an
                in-app notification. Continued use of our services after any changes
                constitutes your acceptance of the updated policy.
              </p>
            </Section>

          </div>

          {/* Contact / CTA */}
          <div className="mt-12 p-8 bg-gradient-to-r from-[#F47B20] to-orange-600 rounded-2xl text-white text-center">
            <h3 className="text-2xl font-bold mb-2">Questions or Requests?</h3>
            <p className="mb-2 text-orange-100">
              For privacy questions, data access requests, or data deletion requests:
            </p>
            <p className="font-bold text-lg mb-6">happygobikerentals@gmail.com</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:happygobikerentals@gmail.com?subject=Privacy%20Policy%20Query"
                className="inline-block bg-white text-[#F47B20] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Email Us
              </a>
              <a
                href="tel:+919008022800"
                className="inline-block bg-white text-[#F47B20] px-6 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
              >
                Call Us
              </a>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
