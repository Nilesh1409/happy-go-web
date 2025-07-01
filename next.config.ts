const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [
      "d3vp2rl7047vsp.cloudfront.net",
      "images.unsplash.com",
      "happygorentals.com",
      "lokeshshah.wordpress.com",
      "imgd.aeplcdn.com",
    ],
  },
  // Add this for static exports if needed
  output: "export",
  trailingSlash: true,
};

module.exports = nextConfig; // Change from export default
