import { readFile } from "node:fs/promises";

import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";
import { username } from "better-auth/plugins/username";

import { readIndustrySeedData } from "@/lib/industry";
import { prisma } from "@/lib/prisma";

type CsvUser = {
	username: string;
	email: string;
	password: string;
	name: string;
	displayUsername?: string;
	image?: string;
};

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

	const industrySeed = await readIndustrySeedData();
	const industryClient = (
		prisma as unknown as {
			industryRecord: {
				upsert: (args: {
					where: { sourceKey: string };
					create: Record<string, unknown>;
					update: Record<string, unknown>;
				}) => Promise<unknown>;
			};
		}
	).industryRecord;

	let upsertedIndustry = 0;
	for (const row of industrySeed.all) {
		const locationIds =
			row.platform === "Google Maps"
				? {
						provinsiId: row.provinsiId,
						kabupatenId: row.kabupatenId,
						kecamatanId: row.kecamatanId,
						desaId: row.desaId,
					}
				: {
						provinsiId: null,
						kabupatenId: null,
						kecamatanId: null,
						desaId: null,
					};

		await industryClient.upsert({
			where: { sourceKey: row.sourceKey },
			create: {
				sourceKey: row.sourceKey,
				platform: row.platform,
				namaUsaha: row.namaUsaha,
				kbliKategori: row.kbliKategori,
				provinsiId: locationIds.provinsiId,
				kabupatenId: locationIds.kabupatenId,
				kecamatanId: locationIds.kecamatanId,
				kecamatanNama: row.kecamatanNama,
				desaId: locationIds.desaId,
				desaNama: row.desaNama,
				status: row.status,
				isInsideKaranganyar: row.isInsideKaranganyar,
				metadata: row.metadata,
			},
			update: {
				platform: row.platform,
				namaUsaha: row.namaUsaha,
				kbliKategori: row.kbliKategori,
				provinsiId: locationIds.provinsiId,
				kabupatenId: locationIds.kabupatenId,
				kecamatanId: locationIds.kecamatanId,
				kecamatanNama: row.kecamatanNama,
				desaId: locationIds.desaId,
				desaNama: row.desaNama,
				status: row.status,
				isInsideKaranganyar: row.isInsideKaranganyar,
				metadata: row.metadata,
			},
		});
		upsertedIndustry += 1;
	}

	console.log(
		[
			`Users seed complete. Created: ${created}, Skipped: ${skipped}`,
			`Industry seed upserted: ${upsertedIndustry}`,
			`Google Maps: ${industrySeed.googleRows.length}`,
			`YouTube: ${industrySeed.youtubeRows.length}`,
			`TikTok: ${industrySeed.tiktokRows.length}`,
		].join("\n"),
	);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
