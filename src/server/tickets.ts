import "server-only";

import { db } from "@/server/db";
import { OPEN_STATUSES, type TicketStatus } from "@/lib/tickets";

export type TicketListItem = Awaited<ReturnType<typeof listTickets>>[number];
export type TicketDetail = NonNullable<Awaited<ReturnType<typeof getTicket>>>;

type ListArgs = {
	/** free-text: plate, client name, #id, complaint */
	q?: string;
	/** a single status, "all", or undefined = the active statuses */
	status?: string;
};

export async function listTickets({ q, status }: ListArgs = {}) {
	const where: Record<string, unknown> = { archivedAt: null };

	if (status && status !== "all") {
		where.status = status;
	} else if (!status) {
		where.status = { in: [...OPEN_STATUSES] };
	}

	const term = q?.trim();
	if (term) {
		const or: Record<string, unknown>[] = [
			{ client: { name: { contains: term } } },
			{ vehicles: { some: { plate: { contains: term } } } },
			{ complaint: { contains: term } },
			{ systemModel: { contains: term } },
		];
		const asNumber = Number.parseInt(term.replace(/^#/, ""), 10);
		if (!Number.isNaN(asNumber)) or.push({ id: asNumber });
		where.OR = or;
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
			complaint: true,
			client: { select: { id: true, name: true } },
			vehicles: { select: { plate: true } },
			tags: { select: { id: true, name: true, color: true } },
			assignee: { select: { id: true, name: true } },
			_count: { select: { entries: true, attachments: true } },
		},
	});
}

export async function getTicket(id: number) {
	return db.ticket.findUnique({
		where: { id },
		include: {
			client: true,
			author: { select: { id: true, name: true, email: true } },
			assignee: { select: { id: true, name: true, email: true } },
			vehicles: { orderBy: { plate: "asc" } },
			tags: { orderBy: { name: "asc" } },
			entries: {
				orderBy: { createdAt: "asc" },
				include: { author: { select: { id: true, name: true } } },
			},
			attachments: { orderBy: { createdAt: "asc" } },
		},
	});
}

export function listClients() {
	return db.client.findMany({
		orderBy: { name: "asc" },
		select: { id: true, name: true },
	});
}

export function listTags() {
	return db.tag.findMany({ orderBy: { name: "asc" } });
}

export function listUsers() {
	return db.user.findMany({
		where: { email: { not: null } },
		orderBy: { name: "asc" },
		select: { id: true, name: true, email: true },
	});
}

export function statusCounts() {
	return db.ticket.groupBy({
		by: ["status"],
		where: { archivedAt: null },
		_count: true,
	});
}

export function isOpenStatus(status: string) {
	return (OPEN_STATUSES as readonly string[]).includes(status as TicketStatus);
}
