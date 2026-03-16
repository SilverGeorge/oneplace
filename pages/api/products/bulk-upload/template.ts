import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

const csvTemplate = [
  "Product Name,SKU,Category,Price,Cost,Stock Quantity,Description,Image URL,Weight,Dimensions,Size Variants,Color Variants,Status",
  "Wireless Earbuds Pro,SKU-001,Electronics,99.99,55.00,45,Premium earbuds,https://example.com/image.jpg,0.2,10x5x5,M|L,Black|White,Active"
].join("\n");

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="products-template.csv"');
  res.status(200).send(csvTemplate);
});
