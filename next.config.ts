import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: [
      "d3vp2rl7047vsp.cloudfront.net",
      "images.unsplash.com",
      "happygorentals.com",
      "lokeshshah.wordpress.com",
      "imgd.aeplcdn.com",
    ],
    // alternatively, if you need pattern matching:
    // remotePatterns: [
    //   {
    //     protocol: "https",
    //     hostname: "d3vp2rl7047vsp.cloudfront.net",
    //     port: "",
    //     pathname: "/bike_models/images/**",
    //   },
    // ],
  },
};

export default nextConfig;
