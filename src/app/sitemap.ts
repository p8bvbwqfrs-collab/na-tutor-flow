import type { MetadataRoute } from "next";
import { LATEST_PRODUCT_UPDATE_DATE } from "@/lib/product-updates";

const baseUrl = "https://www.natutorflow.com";
const lastModified = new Date("2026-08-10");

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/resources`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/how-it-works`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/updates`,
      lastModified: new Date(LATEST_PRODUCT_UPDATE_DATE),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/maths-tutor`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/tutor-lesson-notes-template`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tutor-payment-tracker`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/how-to-write-parent-updates-after-tutoring`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
