import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "1",
          product: "DJI Mavic Pro 2",
          category: "Tech gadget",
          brand: "Apple",
          price: "$990.00",
          stock: 20,
          rating: 4.8,
          order: 540,
          sales: "$34k"
        },
        {
          id: "2",
          product: "AeroNoise Cancelling Headset",
          category: "Audio",
          brand: "Sony",
          price: "$320.00",
          stock: 54,
          rating: 4.7,
          order: 420,
          sales: "$21k"
        },
        {
          id: "3",
          product: "FitPulse Smartwatch",
          category: "Wearables",
          brand: "Samsung",
          price: "$240.00",
          stock: 67,
          rating: 4.6,
          order: 390,
          sales: "$18k"
        },
        {
          id: "4",
          product: "Nimbus Mechanical Keyboard",
          category: "Accessories",
          brand: "Logitech",
          price: "$140.00",
          stock: 78,
          rating: 4.9,
          order: 350,
          sales: "$15k"
        },
        {
          id: "5",
          product: "Volt USB-C Hub Pro",
          category: "Productivity",
          brand: "Anker",
          price: "$89.00",
          stock: 95,
          rating: 4.5,
          order: 260,
          sales: "$9k"
        },
        {
          id: "6",
          product: "Luma Ring Light",
          category: "Studio",
          brand: "Neewer",
          price: "$75.00",
          stock: 112,
          rating: 4.4,
          order: 240,
          sales: "$7k"
        }
      ]
    }
  });
});
