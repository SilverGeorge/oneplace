import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/user/profile";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth/require-auth";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn()
    }
  }
}));

jest.mock("@/lib/auth/require-auth", () => ({
  requireAuth: jest.fn()
}));

describe("/api/user/profile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (requireAuth as jest.Mock).mockResolvedValue({
      sub: "user_1",
      email: "jane@example.com",
      name: "Jane Founder"
    });
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({
      method: "POST"
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("returns profile for authenticated user on GET", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user_1",
      name: "Jane Founder",
      email: "jane@example.com",
      bio: "Founder bio",
      avatarUrl: null
    });

    const { req, res } = createMocks({
      method: "GET"
    });

    await handler(req, res);

    expect(requireAuth).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("jane@example.com");
  });

  it("updates profile on PUT", async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.user.update as jest.Mock).mockResolvedValue({
      id: "user_1",
      name: "Jane Updated",
      email: "jane.updated@example.com",
      bio: "Updated bio",
      avatarUrl: null
    });

    const { req, res } = createMocks({
      method: "PUT",
      body: {
        name: "Jane Updated",
        email: "jane.updated@example.com",
        bio: "Updated bio",
        avatarUrl: null
      }
    });

    await handler(req, res);

    expect(prisma.user.update).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(200);
    const body = JSON.parse(res._getData());
    expect(body.success).toBe(true);
    expect(body.data.user.name).toBe("Jane Updated");
  });
});
