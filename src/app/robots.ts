import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/auth/", "/login", "/signup"],
    },
    sitemap: "https://www.natutorflow.com/sitemap.xml",
    host: "https://www.natutorflow.com",
  };
}
