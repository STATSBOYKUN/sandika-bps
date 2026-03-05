import { readFile } from "node:fs/promises";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";

type CsvUser = {
  username: string;
  email: string;
  password: string;
  name: string;
  displayUsername?: string;
  image?: string;
};

const prisma = new PrismaClient();

const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [username()],
});

function parseCsv(content: string): CsvUser[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const cells = line.split(",").map((cell) => cell.trim());
    const row: Record<string, string> = {};

    headers.forEach((header, index) => {
      row[header] = cells[index] ?? "";
    });

    return {
      username: row.username,
      email: row.email,
      password: row.password,
      name: row.name,
      displayUsername: row.displayUsername || undefined,
      image: row.image || undefined,
    };
  });
}

async function main() {
  const file = await readFile("prisma/seed/users.csv", "utf8");
  const users = parseCsv(file);

  let created = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.username || !user.email || !user.password || !user.name) {
      skipped += 1;
      continue;
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: user.email }, { username: user.username }],
      },
      select: { id: true },
    });

    if (existingUser) {
      skipped += 1;
      continue;
    }

    await auth.api.signUpEmail({
      body: {
        name: user.name,
        email: user.email,
        password: user.password,
        username: user.username,
        displayUsername: user.displayUsername,
        image: user.image,
      },
    });

    created += 1;
  }

  console.log(`Seed complete. Created: ${created}, Skipped: ${skipped}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
