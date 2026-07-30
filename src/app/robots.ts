import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dasbor", "/inovasi/editor"],
      },
    ],
    sitemap: "https://pkk.bunutwetan.id/sitemap.xml",
  };
}
