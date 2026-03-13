import { createMocks } from "node-mocks-http";
import handler from "@/pages/api/auth/login";
import { prisma } from "@/lib/db";
import { comparePassword } from "@/lib/auth/password";
import { signAuthToken } from "@/lib/auth/jwt";
import { serializeAuthCookie } from "@/lib/auth/cookie";

jest.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: jest.fn()
    }
  }
}));

jest.mock("@/lib/auth/password", () => ({
  comparePassword: jest.fn()
}));

jest.mock("@/lib/auth/jwt", () => ({
  signAuthToken: jest.fn()
}));

jest.mock("@/lib/auth/cookie", () => ({
  serializeAuthCookie: jest.fn()
}));

describe("POST /api/auth/login", () => {
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

  it("authenticates valid credentials", async () => {
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: "user_1",
      name: "Jane Founder",
      email: "jane@example.com",
      passwordHash: "hashed",
      bio: null,
      avatarUrl: null
    });
    (comparePassword as jest.Mock).mockResolvedValue(true);
    (signAuthToken as jest.Mock).mockResolvedValue("jwt-token");
    (serializeAuthCookie as jest.Mock).mockReturnValue("oneplace_token=jwt-token;");

    const { req, res } = createMocks({
      method: "POST",
      body: {
        email: "jane@example.com",
        password: "password123"
      }
    });

    await handler(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: "jane@example.com" }
    });
    expect(comparePassword).toHaveBeenCalledWith("password123", "hashed");
    expect(res._getStatusCode()).toBe(200);

    const body = JSON.parse(res._getData());
    expect(body.success).toBe(true);
    expect(body.data.user.id).toBe("user_1");
    expect(body.data.token).toBe("jwt-token");
  });
});
