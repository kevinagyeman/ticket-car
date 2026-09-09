import { db } from "../src/server/db";

/** Wipes all tickets + attachments. Keeps user accounts. */
async function main() {
	await db.attachment.deleteMany();
	await db.ticket.deleteMany();

	try {
		await db.$executeRawUnsafe("ALTER TABLE `Ticket` AUTO_INCREMENT = 1");
	} catch {
		// non-MySQL engine — ignore
	}

	console.table({
		users: await db.user.count(),
		tickets: await db.ticket.count(),
		attachments: await db.attachment.count(),
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
