import { db } from "../src/server/db";

/**
 * Wipes all ticket + client data so the app starts empty for real use.
 * Keeps: user accounts and tags (tags have no creation UI yet).
 * Pass `--tags` to also delete tags.
 */
async function main() {
	const alsoTags = process.argv.includes("--tags");

	await db.attachment.deleteMany();
	await db.ticketEntry.deleteMany();
	await db.ticket.deleteMany();
	await db.vehicle.deleteMany();
	await db.client.deleteMany();
	if (alsoTags) await db.tag.deleteMany();

	try {
		await db.$executeRawUnsafe("ALTER TABLE `Ticket` AUTO_INCREMENT = 1");
	} catch {
		// non-MySQL engine — ignore
	}

	console.table({
		users: await db.user.count(),
		tags: await db.tag.count(),
		clients: await db.client.count(),
		vehicles: await db.vehicle.count(),
		tickets: await db.ticket.count(),
	});
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
