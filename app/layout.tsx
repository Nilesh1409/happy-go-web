import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Happy Go Bike Rentals - Best Bike Rental Service in Chikkamagaluru",
  description:
    "Rent premium bikes in Chikkamagaluru with Happy Go. Best prices, 24/7 support, and hassle-free booking. Happy Ride Happy Stay! Call +91 90080-22800",
  keywords:
    "bike rental chikkamagaluru, happy go bike rentals, bike rental in chikkamagaluru, two wheeler rental, scooter rental chikkamagaluru, motorcycle rental",
  authors: [{ name: "Happy Go Bike Rentals" }],
  creator: "Happy Go Bike Rentals",
  publisher: "Happy Go Bike Rentals",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://happygobikerentals.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Happy Go Bike Rentals - Best Bike Rental Service in Chikkamagaluru",
    description:
      "Rent premium bikes in Chikkamagaluru with Happy Go. Best prices, 24/7 support, and hassle-free booking. Happy Ride Happy Stay!",
    url: "https://happygobikerentals.com",
    siteName: "Happy Go Bike Rentals",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Happy Go Bike Rentals",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Happy Go Bike Rentals - Best Bike Rental Service in Chikkamagaluru",
    description:
      "Rent premium bikes in Chikkamagaluru with Happy Go. Best prices, 24/7 support, and hassle-free booking. Happy Ride Happy Stay!",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/assets/happygo.jpeg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#F47B20" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Happy Go Bike Rentals",
              description:
                "Best bike rental service in Chikkamagaluru with premium bikes and 24/7 support",
              url: "https://happygobikerentals.com",
              telephone: "+91-90080-22800",
              email: "happygobikerentals@gmail.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Barlane Rd, near KSRTC Bus Stand",
                addressLocality: "Chikkamagaluru",
                addressRegion: "Karnataka",
                postalCode: "577101",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: "13.3161",
                longitude: "75.7720",
              },
              openingHours: "Mo-Su 00:00-23:59",
              priceRange: "₹₹",
              servesCuisine: [],
              serviceArea: {
                "@type": "GeoCircle",
                geoMidpoint: {
                  "@type": "GeoCoordinates",
                  latitude: "13.3161",
                  longitude: "75.7720",
                },
                geoRadius: "50000",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
