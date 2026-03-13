import { prisma } from "../lib/db";
import { hashPassword } from "../lib/auth/password";

async function main(): Promise<void> {
  const passwordHash = await hashPassword("password123");

  const users = [
    {
      email: "jane@example.com",
      name: "Jane Founder",
      bio: "Founder focused on product-led growth.",
      avatarUrl: null
    },
    {
      email: "alex@example.com",
      name: "Alex Operator",
      bio: "Operations lead scaling customer onboarding.",
      avatarUrl: null
    }
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatarUrl
      },
      create: {
        name: user.name,
        email: user.email,
        passwordHash,
        bio: user.bio,
        avatarUrl: user.avatarUrl
      }
    });
  }

  console.log("Seed completed: users upserted.");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
