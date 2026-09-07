import { hash } from "bcryptjs";

import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

async function main() {
	const [email, password] = process.argv.slice(2);
	const name = process.argv.slice(4).join(" ").trim() || undefined;

	if (!email || !password) {
		console.error(
			'Usage: npm run user:create -- <email> <password> ["Full Name"]',
		);
		process.exit(1);
	}

	const passwordHash = await hash(password, 12);
	const normalizedEmail = email.toLowerCase();

	const user = await db.user.upsert({
		where: { email: normalizedEmail },
		update: { password: passwordHash, ...(name ? { name } : {}) },
		create: {
			email: normalizedEmail,
			password: passwordHash,
			name: name ?? null,
		},
	});

	console.log(`✔ User ready: ${user.email} (${user.id})`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
