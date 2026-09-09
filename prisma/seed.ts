import { hash } from "bcryptjs";

import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

const DEV_PASSWORD = "password";

async function main() {
	// wipe ticket data, keep users
	await db.attachment.deleteMany();
	await db.ticket.deleteMany();
	try {
		await db.$executeRawUnsafe("ALTER TABLE `Ticket` AUTO_INCREMENT = 1");
	} catch {}

	let users = await db.user.findMany({ orderBy: { email: "asc" } });
	if (users.length === 0) {
		users = [
			await db.user.create({
				data: {
					name: "Dev",
					email: "dev@ticket-car.ch",
					password: await hash(DEV_PASSWORD, 12),
				},
			}),
		];
	}
	const author = users[0] as (typeof users)[number];

	const day = 24 * 60 * 60 * 1000;
	const ago = (d: number) => new Date(Date.now() - d * day);

	const tickets = [
		{
			client: "Mario Rossi",
			plate: "TI 123456",
			model: "Yaris",
			km: 42210,
			ol: "72387328",
			systemModel: "Toyota Touch 2",
			softwareVersion: "1928",
			status: "OPEN",
			priority: "NORMAL",
			daysAgo: 0,
			complaint:
				"Apple CarPlay wireless si disconnette dopo pochi minuti e non si riconnette.",
		},
		{
			client: "Giulia Bianchi",
			plate: "ZH 887711",
			model: "Corolla",
			km: 68300,
			systemModel: "Toyota Touch 2 with Go",
			status: "IN_PROGRESS",
			priority: "HIGH",
			daysAgo: 2,
			complaint: "Touchscreen lento, a volte nero per qualche secondo.",
			diagnosis: "Aggiornamento software datato, previsto reflash.",
		},
		{
			client: "Andrea Conti",
			plate: "TI 445566",
			model: "RAV4",
			km: 61050,
			ol: "50912",
			systemModel: "Toyota Smart Connect",
			status: "WAITING_PARTS",
			priority: "NORMAL",
			daysAgo: 5,
			complaint: "Microfono vivavoce con volume bassissimo.",
			diagnosis: "Microfono difettoso da sostituire.",
		},
		{
			client: "Elena Ferrari",
			plate: "LU 202020",
			make: "Audi",
			model: "A4",
			km: 39820,
			systemModel: "Audi MMI",
			status: "WAITING_CLIENT",
			priority: "LOW",
			daysAgo: 7,
			complaint: "Vuole abilitare Android Auto wireless.",
		},
		{
			client: "Davide Marchetti",
			plate: "GR 771122",
			model: "C-HR",
			km: 12040,
			systemModel: "Toyota Smart Connect",
			softwareVersion: "2024.02",
			status: "RESOLVED",
			priority: "NORMAL",
			daysAgo: 9,
			complaint: "Bluetooth non si accoppia con iPhone.",
			diagnosis: "Firmware datato.",
			resolutionNote: "Aggiornato firmware, accoppiamento OK. Testato.",
			closed: true,
		},
		{
			client: "Mario Rossi",
			plate: "TI 654321",
			model: "Aygo X",
			km: 21500,
			ol: "72388001",
			systemModel: "Toyota Touch 2",
			status: "CLOSED",
			priority: "NORMAL",
			daysAgo: 21,
			complaint: "Schermo in boot loop dopo aggiornamento OTA fallito.",
			resolutionNote: "Reflash software, ripristinata versione stabile. Consegnata.",
			closed: true,
		},
	];

	let n = 0;
	for (const spec of tickets) {
		const openedAt = ago(spec.daysAgo);
		await db.ticket.create({
			data: {
				date: openedAt,
				openedAt,
				createdAt: openedAt,
				closedAt: spec.closed ? ago(Math.max(0, spec.daysAgo - 1)) : null,
				status: spec.status,
				priority: spec.priority,
				client: spec.client,
				plate: spec.plate,
				make: spec.make ?? "TOYOTA",
				model: spec.model ?? null,
				km: spec.km ?? null,
				ol: spec.ol ?? null,
				systemModel: spec.systemModel ?? null,
				softwareVersion: spec.softwareVersion ?? null,
				complaint: spec.complaint,
				diagnosis: spec.diagnosis ?? null,
				resolutionNote: spec.resolutionNote ?? null,
				authorId: author.id,
			},
		});
		n += 1;
	}

	console.log(`Seeded ${n} tickets, assigned to ${author.email}`);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
