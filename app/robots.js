export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin/", "/dashboard/"],
    },
    sitemap: "https://happygobikerentals.com/sitemap.xml",
  };
}
