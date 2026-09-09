import "server-only";

import { OPEN_STATUSES, type TicketStatus } from "@/lib/tickets";
import { db } from "@/server/db";

export type TicketListItem = Awaited<ReturnType<typeof listTickets>>[number];
export type TicketDetail = NonNullable<Awaited<ReturnType<typeof getTicket>>>;

type ListArgs = {
	/** free-text, matched against the car plate only */
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
		where.plate = { contains: term };
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
