"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/server/auth";
import { db } from "@/server/db";
import { ticketPrioritySchema, ticketStatusSchema } from "@/lib/tickets";

async function requireUserId() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");
	return session.user.id;
}

// --- mutations on an existing ticket -----------------------------------------

export async function setTicketStatus(ticketId: number, value: string) {
	const authorId = await requireUserId();
	const status = ticketStatusSchema.parse(value);

	const current = await db.ticket.findUnique({
		where: { id: ticketId },
		select: { status: true },
	});
	if (!current || current.status === status) return;

	await db.$transaction([
		db.ticket.update({
			where: { id: ticketId },
			data: {
				status,
				closedAt:
					status === "CLOSED" || status === "RESOLVED" ? new Date() : null,
			},
		}),
		db.ticketEntry.create({
			data: { ticketId, authorId, system: true, body: `status → ${status}` },
		}),
	]);

	revalidatePath("/");
}

export async function setTicketPriority(ticketId: number, value: string) {
	await requireUserId();
	const priority = ticketPrioritySchema.parse(value);
	await db.ticket.update({ where: { id: ticketId }, data: { priority } });
	revalidatePath("/");
}

const fieldsSchema = z.object({
	ticketId: z.coerce.number().int(),
	complaint: z.string().max(10_000),
	diagnosis: z.string().max(10_000),
	resolutionNote: z.string().max(10_000),
	km: z.string().optional(),
	systemModel: z.string().max(200).optional(),
	softwareVersion: z.string().max(200).optional(),
});

export type SaveState = { ok: boolean; error?: string } | undefined;

export async function saveTicketFields(
	_prev: SaveState,
	formData: FormData,
): Promise<SaveState> {
	await requireUserId();
	const parsed = fieldsSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { ok: false, error: "invalid" };

	const { ticketId, km, complaint, diagnosis, resolutionNote } = parsed.data;
	await db.ticket.update({
		where: { id: ticketId },
		data: {
			complaint: complaint.trim() || null,
			diagnosis: diagnosis.trim() || null,
			resolutionNote: resolutionNote.trim() || null,
			systemModel: parsed.data.systemModel?.trim() || null,
			softwareVersion: parsed.data.softwareVersion?.trim() || null,
			km: km && km.trim() !== "" ? Number.parseInt(km, 10) : null,
		},
	});

	revalidatePath("/");
	return { ok: true };
}

const entrySchema = z.object({
	ticketId: z.coerce.number().int(),
	body: z.string().trim().min(1).max(10_000),
});

export async function addTicketEntry(
	_prev: SaveState,
	formData: FormData,
): Promise<SaveState> {
	const authorId = await requireUserId();
	const parsed = entrySchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { ok: false, error: "invalid" };

	await db.ticketEntry.create({ data: { ...parsed.data, authorId } });
	revalidatePath("/");
	return { ok: true };
}

// --- create ----------------------------------------------------------------

const createSchema = z.object({
	plate: z.string().trim().min(1),
	date: z.string().optional(),
	clientId: z.string().optional(),
	newClientName: z.string().trim().optional(),
	newClientEmail: z.string().trim().optional(),
	newClientPhone: z.string().trim().optional(),
	make: z.string().trim().optional(),
	model: z.string().trim().optional(),
	year: z.string().trim().optional(),
	km: z.string().trim().optional(),
	systemModel: z.string().trim().optional(),
	softwareVersion: z.string().trim().optional(),
	complaint: z.string().trim().min(1),
	diagnosis: z.string().trim().optional(),
	resolutionNote: z.string().trim().optional(),
	status: ticketStatusSchema.catch("OPEN"),
	priority: ticketPrioritySchema.catch("NORMAL"),
});

export type CreateTicketState = { error: string } | undefined;

export async function createTicket(
	_prev: CreateTicketState,
	formData: FormData,
): Promise<CreateTicketState> {
	const authorId = await requireUserId();

	const parsed = createSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) {
		const path = parsed.error.issues[0]?.path[0];
		if (path === "plate") return { error: "plateRequired" };
		if (path === "complaint") return { error: "complaintRequired" };
		return { error: "invalid" };
	}
	const d = parsed.data;
	const plate = d.plate.toUpperCase();
	const tagIds = formData.getAll("tagIds").map(String).filter(Boolean);

	const existingVehicle = await db.vehicle.findUnique({ where: { plate } });
	if (!existingVehicle && !d.clientId?.trim() && !d.newClientName) {
		return { error: "clientRequired" };
	}

	const date = d.date ? new Date(d.date) : new Date();

	const newId = await db.$transaction(async (tx) => {
		let vehicle = existingVehicle;

		if (!vehicle) {
			let clientId = d.clientId?.trim() || undefined;
			if (!clientId) {
				const client = await tx.client.create({
					data: {
						name: d.newClientName ?? plate,
						email: d.newClientEmail || null,
						phone: d.newClientPhone || null,
					},
				});
				clientId = client.id;
			}
			vehicle = await tx.vehicle.create({
				data: {
					plate,
					make: d.make || null,
					model: d.model || null,
					year: d.year ? Number.parseInt(d.year, 10) : null,
					clientId,
				},
			});
		}

		const ticket = await tx.ticket.create({
			data: {
				date,
				openedAt: date,
				status: d.status,
				priority: d.priority,
				km: d.km ? Number.parseInt(d.km, 10) : null,
				systemModel: d.systemModel || null,
				softwareVersion: d.softwareVersion || null,
				complaint: d.complaint,
				diagnosis: d.diagnosis || null,
				resolutionNote: d.resolutionNote || null,
				clientId: vehicle.clientId,
				authorId,
				vehicles: { connect: { id: vehicle.id } },
				tags: { connect: tagIds.map((id) => ({ id })) },
			},
		});
		return ticket.id;
	});

	revalidatePath("/");
	redirect(`/?t=${newId}`);
}
