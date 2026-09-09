import "server-only";

import { OPEN_STATUSES, type TicketStatus } from "@/lib/tickets";
import { db } from "@/server/db";

export type TicketListItem = Awaited<ReturnType<typeof listTickets>>[number];
export type TicketDetail = NonNullable<Awaited<ReturnType<typeof getTicket>>>;

type ListArgs = {
	/** free-text — matched against plate, complaint, diagnosis, resolution, radio & car model */
	q?: string;
	/** a single status, "all", or undefined = the active statuses */
	status?: string;
	/** exact-match dropdown filters */
	model?: string;
	systemModel?: string;
	softwareVersion?: string;
};

export async function listTickets({
	q,
	status,
	model,
	systemModel,
	softwareVersion,
}: ListArgs = {}) {
	const where: Record<string, unknown> = { archivedAt: null };

	// default (no param) = all statuses; "active" = the open ones; else exact
	if (status === "active") {
		where.status = { in: [...OPEN_STATUSES] };
	} else if (status && status !== "all") {
		where.status = status;
	}

	if (model) where.model = model;
	if (systemModel) where.systemModel = systemModel;
	if (softwareVersion) where.softwareVersion = softwareVersion;

	const term = q?.trim();
	if (term) {
		where.OR = [
			{ plate: { contains: term } },
			{ client: { contains: term } },
			{ complaint: { contains: term } },
			{ diagnosis: { contains: term } },
			{ resolutionNote: { contains: term } },
			{ systemModel: { contains: term } },
			{ model: { contains: term } },
		];
	}

	return db.ticket.findMany({
		where,
		orderBy: [{ updatedAt: "desc" }],
		select: {
			id: true,
			status: true,
			priority: true,
			date: true,
			updatedAt: true,
			client: true,
			plate: true,
			complaint: true,
			assignee: { select: { id: true, name: true } },
			_count: { select: { attachments: true } },
		},
	});
}

export async function getTicket(id: number) {
	return db.ticket.findUnique({
		where: { id },
		include: {
			author: { select: { id: true, name: true, email: true } },
			assignee: { select: { id: true, name: true, email: true } },
			attachments: { orderBy: { createdAt: "asc" } },
		},
	});
}

/** Distinct non-empty values for the dropdown filters. */
export async function ticketFilterOptions() {
	const clean = (values: (string | null)[]) =>
		[...new Set(values)]
			.filter((v): v is string => Boolean(v?.trim()))
			.sort((a, b) => a.localeCompare(b));

	const [models, systemModels, softwareVersions] = await Promise.all([
		db.ticket.findMany({
			where: { archivedAt: null },
			distinct: ["model"],
			select: { model: true },
		}),
		db.ticket.findMany({
			where: { archivedAt: null },
			distinct: ["systemModel"],
			select: { systemModel: true },
		}),
		db.ticket.findMany({
			where: { archivedAt: null },
			distinct: ["softwareVersion"],
			select: { softwareVersion: true },
		}),
	]);

	return {
		model: clean(models.map((r) => r.model)),
		systemModel: clean(systemModels.map((r) => r.systemModel)),
		softwareVersion: clean(softwareVersions.map((r) => r.softwareVersion)),
	};
}

export type TicketFilterOptions = Awaited<
	ReturnType<typeof ticketFilterOptions>
>;

export function listUsers() {
	return db.user.findMany({
		where: { email: { not: null } },
		orderBy: { name: "asc" },
		select: { id: true, name: true, email: true },
	});
}

export function isOpenStatus(status: string) {
	return (OPEN_STATUSES as readonly string[]).includes(status as TicketStatus);
}
