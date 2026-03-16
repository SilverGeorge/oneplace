import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      overview: {
        name: "Biko Lifestyle Hub",
        category: "Lifestyle Marketplace",
        location: "Lagos, Nigeria",
        rating: 4.8,
        reviewCount: 2345,
        description:
          "Biko Lifestyle Hub helps vendors sell fashion, gadgets, and essentials with a curated digital storefront experience.",
        email: "support@bikostore.com",
        phone: "+234 801 234 5678",
        website: "https://bikostore.com",
        bannerUrl: "https://images.unsplash.com/photo-1522199755839-a2bacb67c546?w=1400&q=80",
        logoUrl: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=300&q=80",
        social: {
          facebook: "facebook.com/bikostore",
          instagram: "instagram.com/bikostore",
          x: "x.com/bikostore",
          linkedin: "linkedin.com/company/bikostore"
        }
      }
    }
  });
});
