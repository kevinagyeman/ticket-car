import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

async function main() {
	const email = process.argv[2]?.toLowerCase();

	if (email) {
		const { count } = await db.user.deleteMany({ where: { email } });
		console.log(`✔ Deleted ${count} user(s) matching ${email}`);
	} else {
		const { count } = await db.user.deleteMany();
		console.log(`✔ Deleted all ${count} user(s)`);
	}
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
