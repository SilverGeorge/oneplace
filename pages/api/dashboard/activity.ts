import type { NextApiRequest, NextApiResponse } from "next";
import { createApiHandler } from "@/lib/api-handler";

export default createApiHandler(["GET"], async (_req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).json({
    success: true,
    data: {
      items: [
        {
          id: "1",
          title: "Your account is logged in",
          description: "Wade Warren signed in from a trusted device.",
          timeAgo: "45 min ago",
          userName: "Wade Warren",
          avatarUrl: "https://i.pravatar.cc/64?img=14"
        },
        {
          id: "2",
          title: "Current language changed",
          description: "Language preference was updated to English (US).",
          timeAgo: "01 hour ago",
          userName: "Jon Smith",
          avatarUrl: "https://i.pravatar.cc/64?img=12"
        },
        {
          id: "3",
          title: "Asked about this project",
          description: "Ronald Richards asked for invoice export details.",
          timeAgo: "02 hour ago",
          userName: "Ronald Richards",
          avatarUrl: "https://i.pravatar.cc/64?img=22"
        },
        {
          id: "4",
          title: "Asked about this project",
          description: "Kristin Watson requested a store branding update.",
          timeAgo: "03 hour ago",
          userName: "Kristin Watson",
          avatarUrl: "https://i.pravatar.cc/64?img=32"
        }
      ]
    }
  });
});
