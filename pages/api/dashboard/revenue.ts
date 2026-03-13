import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      points: [
        { month: "Jan", earnings: 420.3, invested: 320.1, expenses: 210.4 },
        { month: "Feb", earnings: 470.1, invested: 340.5, expenses: 230.2 },
        { month: "Mar", earnings: 510.8, invested: 380.6, expenses: 260.1 },
        { month: "Apr", earnings: 545.2, invested: 420.3, expenses: 285.6 },
        { month: "May", earnings: 605.8, invested: 485.4, expenses: 320.9 },
        { month: "Jun", earnings: 592.4, invested: 460.7, expenses: 310.5 }
      ]
    }
  });
});
