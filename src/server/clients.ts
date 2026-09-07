import "server-only";

import { OPEN_STATUSES } from "@/lib/tickets";
import { db } from "@/server/db";

export type ClientListItem = Awaited<
	ReturnType<typeof listClientsWithCounts>
>[number];
export type ClientDetail = NonNullable<Awaited<ReturnType<typeof getClient>>>;

export async function listClientsWithCounts(q?: string) {
	const term = q?.trim();
	const where = term
		? {
				OR: [
					{ name: { contains: term } },
					{ email: { contains: term } },
					{ phone: { contains: term } },
					{ vehicles: { some: { plate: { contains: term } } } },
				],
			}
		: {};

	return db.client.findMany({
		where,
		orderBy: { name: "asc" },
		select: {
			id: true,
			name: true,
			email: true,
			phone: true,
			vehicles: { select: { plate: true }, orderBy: { plate: "asc" } },
			_count: {
				select: {
					tickets: { where: { status: { in: [...OPEN_STATUSES] } } },
				},
			},
		},
	});
}

export async function getClient(id: string) {
	return db.client.findUnique({
		where: { id },
		include: {
			vehicles: {
				orderBy: { plate: "asc" },
				include: { _count: { select: { tickets: true } } },
			},
			tickets: {
				orderBy: { updatedAt: "desc" },
				select: {
					id: true,
					status: true,
					priority: true,
					complaint: true,
					updatedAt: true,
					vehicles: { select: { plate: true } },
				},
			},
		},
	});
}
