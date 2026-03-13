import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/auth/signup";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { serializeAuthCookie } from "@/lib/auth/cookie";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}));

jest.mock("@/lib/auth/password", () => ({
  hashPassword: jest.fn()
}));

jest.mock("@/lib/auth/jwt", () => ({
  signAuthToken: jest.fn()
}));

jest.mock("@/lib/auth/cookie", () => ({
  serializeAuthCookie: jest.fn()
}));

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 405 for unsupported methods", async () => {
    const { req, res } = createMocks({
      method: "GET"
    });

    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("creates a user and returns token payload", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
    (hashPassword as jest.Mock).mockResolvedValue("hashed-password");
    (prisma.user.create as jest.Mock).mockResolvedValue({
      id: "user_1",
      name: "Jane Founder",
      email: "jane@example.com",
      bio: null,
      avatarUrl: null
    });
    (signAuthToken as jest.Mock).mockResolvedValue("jwt-token");
    (serializeAuthCookie as jest.Mock).mockReturnValue("oneplace_token=jwt-token;");

    const { req, res } = createMocks({
      method: "POST",
      body: {
        name: "Jane Founder",
        email: "jane@example.com",
        password: "password123"
      }
    });

    await handler(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "jane@example.com" }
    });
    expect(prisma.user.create).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(201);

    const body = JSON.parse(res._getData());
    expect(body.success).toBe(true);
    expect(body.data.user.email).toBe("jane@example.com");
    expect(body.data.token).toBe("jwt-token");
  });
});
