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

const nullify = (v?: string | null) => (v && v.trim() !== "" ? v.trim() : null);

// --- mutations on an existing ticket -----------------------------------------

export async function setTicketStatus(ticketId: number, value: string) {
	await requireUserId();
	const status = ticketStatusSchema.parse(value);

	await db.ticket.update({
		where: { id: ticketId },
		data: {
			status,
			closedAt:
				status === "CLOSED" || status === "RESOLVED" ? new Date() : null,
		},
	});

	revalidatePath("/");
}

export async function setTicketPriority(ticketId: number, value: string) {
	await requireUserId();
	const priority = ticketPrioritySchema.parse(value);
	await db.ticket.update({ where: { id: ticketId }, data: { priority } });
	revalidatePath("/");
}

const text = z.string().max(10_000).optional();
const short = z.string().max(200).optional();

const fieldsSchema = z.object({
	ticketId: z.coerce.number().int(),
	client: short,
	plate: short,
	make: short,
	model: short,
	km: z.string().optional(),
	ol: short,
	systemModel: short,
	softwareVersion: short,
	complaint: text,
	diagnosis: text,
	resolutionNote: text,
});

export type SaveState = { ok: boolean; error?: string } | undefined;

export async function saveTicketFields(
	_prev: SaveState,
	formData: FormData,
): Promise<SaveState> {
	await requireUserId();
	const parsed = fieldsSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { ok: false, error: "invalid" };
	const d = parsed.data;

	await db.ticket.update({
		where: { id: d.ticketId },
		data: {
			client: nullify(d.client),
			plate: nullify(d.plate)?.toUpperCase() ?? null,
			make: nullify(d.make),
			model: nullify(d.model),
			ol: nullify(d.ol),
			systemModel: nullify(d.systemModel),
			softwareVersion: nullify(d.softwareVersion),
			complaint: nullify(d.complaint),
			diagnosis: nullify(d.diagnosis),
			resolutionNote: nullify(d.resolutionNote),
			km: d.km && d.km.trim() !== "" ? Number.parseInt(d.km, 10) : null,
		},
	});

	revalidatePath("/");
	return { ok: true };
}

// --- create ----------------------------------------------------------------

const createSchema = z.object({
	client: short,
	plate: z.string().trim().min(1),
	make: short,
	model: short,
	km: z.string().trim().optional(),
	ol: short,
	date: z.string().optional(),
	systemModel: short,
	softwareVersion: short,
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
	const date = d.date ? new Date(d.date) : new Date();

	const ticket = await db.ticket.create({
		data: {
			date,
			openedAt: date,
			status: d.status,
			priority: d.priority,
			client: nullify(d.client),
			plate: d.plate.toUpperCase(),
			make: nullify(d.make),
			model: nullify(d.model),
			km: d.km ? Number.parseInt(d.km, 10) : null,
			ol: nullify(d.ol),
			systemModel: nullify(d.systemModel),
			softwareVersion: nullify(d.softwareVersion),
			complaint: d.complaint,
			diagnosis: nullify(d.diagnosis),
			resolutionNote: nullify(d.resolutionNote),
			authorId,
		},
	});

	revalidatePath("/");
	redirect(`/?t=${ticket.id}`);
}
