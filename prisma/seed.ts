import { hash } from "bcryptjs";

import { PrismaClient } from "../generated/prisma";

const db = new PrismaClient();

/** Password for the fallback dev user, only created if the DB has no users. */
const DEV_PASSWORD = "password";

async function reset() {
	// Children first, then parents. Users are left alone — the seed reuses
	// whatever accounts already exist (see main()).
	await db.attachment.deleteMany();
	await db.ticketEntry.deleteMany();
	await db.ticket.deleteMany();
	await db.tag.deleteMany();
	await db.vehicle.deleteMany();
	await db.client.deleteMany();

	// Make ticket numbers restart at 1 on every re-seed.
	for (const sql of [
		"DELETE FROM sqlite_sequence WHERE name = 'Ticket'", // SQLite
		"ALTER TABLE `Ticket` AUTO_INCREMENT = 1", // MySQL / MariaDB
	]) {
		try {
			await db.$executeRawUnsafe(sql);
		} catch {
			// wrong engine / table not there yet — ignore
		}
	}
}

async function main() {
	await reset();

	// Reuse existing accounts; only create a dev user if there are none.
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
	const pick = (i: number) => users[i % users.length] as (typeof users)[number];
	const [tom, luca, sara] = [pick(0), pick(1), pick(2)];

	const tagData = [
		{ name: "garanzia", color: "#f59e0b" },
		{ name: "software", color: "#3b82f6" },
		{ name: "connettività", color: "#8b5cf6" },
		{ name: "schermo", color: "#ef4444" },
		{ name: "aggiornamento", color: "#64748b" },
		{ name: "diagnosi", color: "#14b8a6" },
	];
	const tags = Object.fromEntries(
		await Promise.all(
			tagData.map(
				async (t) => [t.name, await db.tag.create({ data: t })] as const,
			),
		),
	);

	// clients + their vehicles
	const clientsSpec = [
		{
			name: "Mario Rossi",
			email: "mario.rossi@example.com",
			phone: "+41 79 123 45 67",
			vehicles: [
				{ plate: "TI 123456", make: "Volkswagen", model: "Golf 8", year: 2021 },
				{ plate: "TI 654321", make: "Fiat", model: "500e", year: 2022 },
			],
		},
		{
			name: "Giulia Bianchi",
			email: "giulia.bianchi@example.com",
			phone: "+41 78 222 33 44",
			vehicles: [
				{ plate: "ZH 887711", make: "Tesla", model: "Model 3", year: 2020 },
			],
		},
		{
			name: "Andrea Conti",
			email: "andrea.conti@example.com",
			phone: "+41 76 555 66 77",
			vehicles: [
				{ plate: "TI 445566", make: "BMW", model: "Serie 3 (G20)", year: 2019 },
			],
		},
		{
			name: "Elena Ferrari",
			email: "elena.ferrari@example.com",
			phone: "+41 79 888 99 00",
			vehicles: [
				{ plate: "LU 202020", make: "Audi", model: "A4 B9", year: 2020 },
				{ plate: "LU 303030", make: "Audi", model: "Q5 FY", year: 2022 },
			],
		},
		{
			name: "Logistica Verde SA",
			email: "flotta@logisticaverde.ch",
			phone: "+41 91 400 10 20",
			vatNumber: "CHE-123.456.789",
			vehicles: [
				{ plate: "TI 900001", make: "Ford", model: "Transit Custom", year: 2021 },
				{ plate: "TI 900002", make: "Ford", model: "Transit Custom", year: 2021 },
				{ plate: "TI 900003", make: "Mercedes", model: "Sprinter", year: 2020 },
			],
		},
		{
			name: "Davide Marchetti",
			email: "davide.marchetti@example.com",
			phone: "+41 77 111 22 33",
			vehicles: [
				{ plate: "GR 771122", make: "Renault", model: "Megane E-Tech", year: 2023 },
			],
		},
	];

	const clients = await Promise.all(
		clientsSpec.map((c) =>
			db.client.create({
				data: {
					name: c.name,
					email: c.email,
					phone: c.phone,
					vatNumber: c.vatNumber,
					vehicles: { create: c.vehicles },
				},
				include: { vehicles: true },
			}),
		),
	);

	const vehicleByPlate = new Map(
		clients.flatMap((c) => c.vehicles.map((v) => [v.plate, v] as const)),
	);
	const clientByName = new Map(clients.map((c) => [c.name, c] as const));

	type TicketSpec = {
		clientName: string;
		plates: string[];
		status: string;
		priority: string;
		km?: number;
		systemModel?: string;
		softwareVersion?: string;
		complaint?: string;
		diagnosis?: string;
		resolutionNote?: string;
		author: { id: string };
		assignee?: { id: string };
		tags: string[];
		daysAgo: number;
		closed?: boolean;
		entries: { author: { id: string }; body: string; system?: boolean }[];
		attachments?: { kind: string; filename: string; mimeType: string }[];
	};

	const day = 24 * 60 * 60 * 1000;
	const ago = (d: number) => new Date(Date.now() - d * day);

	const ticketSpecs: TicketSpec[] = [
		{
			clientName: "Mario Rossi",
			plates: ["TI 123456"],
			status: "OPEN",
			priority: "NORMAL",
			km: 42210,
			systemModel: "VW MIB3 Discover Pro",
			softwareVersion: "1928",
			complaint:
				"Apple CarPlay wireless si disconnette dopo 5-10 minuti, poi non si riconnette finché non riavvio l'auto.",
			author: tom,
			assignee: luca,
			tags: ["connettività", "software", "diagnosi"],
			daysAgo: 0,
			entries: [
				{
					author: tom,
					body: "Cliente lascia la vettura, riproduce il problema in ~10 min di guida.",
				},
			],
			attachments: [
				{
					kind: "AUDIO",
					filename: "descrizione-cliente.m4a",
					mimeType: "audio/mp4",
				},
			],
		},
		{
			clientName: "Giulia Bianchi",
			plates: ["ZH 887711"],
			status: "IN_PROGRESS",
			priority: "HIGH",
			km: 68300,
			systemModel: "Tesla MCU (Intel Atom)",
			softwareVersion: "2024.8.9",
			complaint:
				"Touchscreen centrale lento, a volte nero per qualche secondo. Retrocamera parte in ritardo.",
			diagnosis:
				"eMMC MCU verso fine vita (log di scritture elevato). Consigliata sostituzione modulo eMMC/MCU.",
			author: luca,
			assignee: luca,
			tags: ["schermo", "diagnosi", "garanzia"],
			daysAgo: 2,
			entries: [
				{ author: luca, body: "Estratti log diagnostici, wear eMMC ~92%." },
				{ author: luca, body: "status → IN_PROGRESS", system: true },
			],
			attachments: [
				{ kind: "IMAGE", filename: "log-emmc-wear.png", mimeType: "image/png" },
				{ kind: "IMAGE", filename: "schermo-nero.jpg", mimeType: "image/jpeg" },
			],
		},
		{
			clientName: "Andrea Conti",
			plates: ["TI 445566"],
			status: "WAITING_PARTS",
			priority: "NORMAL",
			km: 61050,
			systemModel: "BMW iDrive 7 (MGU)",
			softwareVersion: "07/2022.70",
			complaint:
				"Navigatore non riceve più aggiornamenti mappe e la SIM integrata risulta assente.",
			diagnosis: "Modulo telematico TCB difettoso, da sostituire.",
			author: tom,
			assignee: sara,
			tags: ["connettività", "aggiornamento"],
			daysAgo: 5,
			entries: [
				{ author: sara, body: "Ordinato modulo TCB, codifica ISTA necessaria dopo." },
				{ author: sara, body: "status → WAITING_PARTS", system: true },
			],
		},
		{
			clientName: "Elena Ferrari",
			plates: ["LU 202020"],
			status: "WAITING_CLIENT",
			priority: "LOW",
			km: 39820,
			systemModel: "Audi MMI Navigation plus (MIB2+)",
			complaint:
				"Vuole abilitare Android Auto wireless e attivare la mappa digitale del quadro (Virtual Cockpit).",
			diagnosis:
				"Fattibile via ritrofit modulo + codifica. Preventivo inviato al cliente.",
			author: sara,
			tags: ["software", "aggiornamento"],
			daysAgo: 7,
			entries: [
				{
					author: sara,
					body: "Preventivo inviato via email, in attesa di conferma.",
				},
			],
		},
		{
			clientName: "Logistica Verde SA",
			plates: ["TI 900001", "TI 900002", "TI 900003"],
			status: "IN_PROGRESS",
			priority: "HIGH",
			systemModel: "Ford SYNC 4",
			complaint:
				"Flotta: 3 furgoni con aggiornamento OTA bloccato e Bluetooth che non si accoppia con i telefoni aziendali.",
			author: tom,
			assignee: tom,
			tags: ["software", "connettività", "aggiornamento"],
			daysAgo: 3,
			entries: [
				{
					author: tom,
					body: "Furgone 1: aggiornamento forzato via USB completato, BT OK. Restano 2.",
				},
				{ author: tom, body: "status → IN_PROGRESS", system: true },
			],
		},
		{
			clientName: "Davide Marchetti",
			plates: ["GR 771122"],
			status: "RESOLVED",
			priority: "NORMAL",
			km: 12040,
			systemModel: "Renault OpenR Link (Google built-in)",
			softwareVersion: "R-Link 3 / 2024.02",
			complaint: "Assistente Google non risponde e le app dal Play Store non si installano.",
			diagnosis: "Account Google in stato inconsistente dopo un aggiornamento parziale.",
			resolutionNote:
				"Eseguito reset dati infotainment, ri-login account, aggiornamento a 2024.02. Assistente e Play Store funzionanti, testati 20 min.",
			author: luca,
			assignee: luca,
			tags: ["software", "aggiornamento", "diagnosi"],
			daysAgo: 9,
			closed: true,
			entries: [
				{ author: luca, body: "Reset dati e aggiornamento completati." },
				{ author: luca, body: "status → RESOLVED", system: true },
			],
		},
		{
			clientName: "Mario Rossi",
			plates: ["TI 654321"],
			status: "CLOSED",
			priority: "NORMAL",
			km: 21500,
			systemModel: "Fiat Uconnect 5",
			softwareVersion: "1.9.0",
			complaint:
				"Schermo si riavvia in loop all'accensione (boot loop) dopo aggiornamento OTA fallito.",
			resolutionNote:
				"Reflash software Uconnect via wiTECH, ripristinata versione stabile 1.9.0. Nessun altro sintomo. Consegnata al cliente.",
			author: tom,
			assignee: sara,
			tags: ["software", "schermo", "garanzia"],
			daysAgo: 21,
			closed: true,
			entries: [
				{ author: sara, body: "Reflash completato, boot regolare." },
				{ author: tom, body: "status → CLOSED", system: true },
			],
		},
		{
			clientName: "Giulia Bianchi",
			plates: ["ZH 887711"],
			status: "OPEN",
			priority: "URGENT",
			km: 68450,
			systemModel: "Tesla MCU (Intel Atom)",
			complaint:
				"Dopo la diagnosi precedente lo schermo è completamente nero, l'auto è guidabile ma senza comandi clima e retrocamera.",
			author: tom,
			tags: ["schermo", "garanzia"],
			daysAgo: 1,
			entries: [{ author: tom, body: "Rientro urgente, cliente senza display." }],
			attachments: [
				{
					kind: "AUDIO",
					filename: "nota-vocale-urgenza.mp3",
					mimeType: "audio/mpeg",
				},
			],
		},
		{
			clientName: "Andrea Conti",
			plates: ["TI 445566"],
			status: "CLOSED",
			priority: "LOW",
			km: 60110,
			systemModel: "BMW iDrive 7 (MGU)",
			complaint:
				"Profili guidatore non si salvano, ogni avvio riparte con impostazioni di default.",
			resolutionNote:
				"Sostituita batteria tampone e ripristinati i profili. Impostazioni ora persistono. Testati 3 cicli di spegnimento.",
			author: luca,
			assignee: luca,
			tags: ["software", "diagnosi"],
			daysAgo: 30,
			closed: true,
			entries: [{ author: luca, body: "Ripristino profili completato." }],
		},
		{
			clientName: "Elena Ferrari",
			plates: ["LU 303030"],
			status: "OPEN",
			priority: "NORMAL",
			km: 8300,
			systemModel: "Audi MMI (MIB3)",
			complaint:
				"USB non riconosce chiavette e telefoni per la riproduzione media; la ricarica funziona.",
			author: sara,
			tags: ["connettività", "diagnosi"],
			daysAgo: 4,
			entries: [
				{ author: sara, body: "Da verificare hub USB e relativa codifica." },
			],
		},
		{
			clientName: "Davide Marchetti",
			plates: ["GR 771122"],
			status: "IN_PROGRESS",
			priority: "NORMAL",
			km: 12080,
			systemModel: "Renault OpenR Link",
			complaint:
				"Radio DAB+ con ricezione intermittente e RDS/artwork che non compare.",
			diagnosis: "Amplificatore d'antenna e connettore Fakra ossidati.",
			author: tom,
			assignee: sara,
			tags: ["connettività", "diagnosi"],
			daysAgo: 2,
			entries: [
				{ author: sara, body: "Sostituito connettore Fakra, in test su strada." },
				{ author: sara, body: "status → IN_PROGRESS", system: true },
			],
		},
		{
			clientName: "Logistica Verde SA",
			plates: ["TI 900003"],
			status: "WAITING_PARTS",
			priority: "NORMAL",
			systemModel: "Mercedes MBUX (NTG7)",
			complaint: "Sprinter: display centrale con righe verticali e touch impreciso.",
			diagnosis: "Pannello LCD/digitizer da sostituire.",
			author: luca,
			assignee: tom,
			tags: ["schermo", "garanzia"],
			daysAgo: 6,
			entries: [
				{ author: tom, body: "Ordinato display, 5-7 giorni lavorativi." },
				{ author: tom, body: "status → WAITING_PARTS", system: true },
			],
		},
	];

	let created = 0;
	for (const spec of ticketSpecs) {
		const client = clientByName.get(spec.clientName);
		if (!client) continue;
		const vehicleIds = spec.plates
			.map((p) => vehicleByPlate.get(p)?.id)
			.filter((id): id is string => Boolean(id));

		const openedAt = ago(spec.daysAgo);

		await db.ticket.create({
			data: {
				date: openedAt,
				openedAt,
				createdAt: openedAt,
				closedAt: spec.closed ? ago(Math.max(0, spec.daysAgo - 1)) : null,
				status: spec.status,
				priority: spec.priority,
				km: spec.km,
				systemModel: spec.systemModel,
				softwareVersion: spec.softwareVersion,
				complaint: spec.complaint,
				diagnosis: spec.diagnosis,
				resolutionNote: spec.resolutionNote,
				client: { connect: { id: client.id } },
				author: { connect: { id: spec.author.id } },
				assignee: spec.assignee
					? { connect: { id: spec.assignee.id } }
					: undefined,
				vehicles: { connect: vehicleIds.map((id) => ({ id })) },
				tags: {
					connect: spec.tags
						.map((name) => tags[name]?.id)
						.filter((id): id is string => Boolean(id))
						.map((id) => ({ id })),
				},
				entries: {
					create: spec.entries.map((e, i) => ({
						body: e.body,
						system: e.system ?? false,
						createdAt: new Date(openedAt.getTime() + (i + 1) * 60 * 60 * 1000),
						author: { connect: { id: e.author.id } },
					})),
				},
				attachments: {
					create: (spec.attachments ?? []).map((a) => ({
						kind: a.kind,
						filename: a.filename,
						mimeType: a.mimeType,
						size: 1024 * (200 + Math.floor(Math.random() * 3000)),
						storageKey: `seed/${a.filename}`,
						uploadedBy: { connect: { id: spec.author.id } },
					})),
				},
			},
		});
		created += 1;
	}

	console.log("Seed complete:");
	console.table({
		users: await db.user.count(),
		clients: await db.client.count(),
		vehicles: await db.vehicle.count(),
		tags: await db.tag.count(),
		tickets: created,
		entries: await db.ticketEntry.count(),
		attachments: await db.attachment.count(),
	});
	console.log(
		`\nTickets assigned to: ${users.map((u) => u.email).join(", ")}`,
	);
}

main()
	.catch((error) => {
		console.error(error);
		process.exit(1);
	})
	.finally(() => db.$disconnect());
