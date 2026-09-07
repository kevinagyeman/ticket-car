"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "@/server/auth";
import { db } from "@/server/db";

async function requireUser() {
	const session = await auth();
	if (!session?.user?.id) redirect("/login");
}

export type ClientFormState = { error: string } | undefined;
export type ActionState = { ok: boolean; error?: string } | undefined;

const clientFields = {
	name: z.string().trim().min(1),
	email: z.string().trim().optional(),
	phone: z.string().trim().optional(),
	vatNumber: z.string().trim().optional(),
	address: z.string().trim().optional(),
	notes: z.string().trim().optional(),
};

const nullify = (v?: string) => (v && v.trim() !== "" ? v.trim() : null);

// --- create (with optional vehicles) ---------------------------------------

const createSchema = z.object(clientFields);

export async function createClient(
	_prev: ClientFormState,
	formData: FormData,
): Promise<ClientFormState> {
	await requireUser();

	const parsed = createSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { error: "nameRequired" };
	const d = parsed.data;

	const plates = formData.getAll("vehiclePlate").map(String);
	const makes = formData.getAll("vehicleMake").map(String);
	const models = formData.getAll("vehicleModel").map(String);
	const years = formData.getAll("vehicleYear").map(String);

	const vehicles = plates
		.map((plate, i) => ({
			plate: plate.trim().toUpperCase(),
			make: nullify(makes[i]),
			model: nullify(models[i]),
			year: years[i] ? Number.parseInt(years[i] as string, 10) : null,
		}))
		.filter((v) => v.plate !== "");

	const seen = new Set<string>();
	for (const v of vehicles) {
		if (seen.has(v.plate)) return { error: "duplicatePlate" };
		seen.add(v.plate);
	}
	const clash = await db.vehicle.findFirst({
		where: { plate: { in: vehicles.map((v) => v.plate) } },
		select: { plate: true },
	});
	if (clash) return { error: "plateExists" };

	const client = await db.client.create({
		data: {
			name: d.name,
			email: nullify(d.email),
			phone: nullify(d.phone),
			vatNumber: nullify(d.vatNumber),
			address: nullify(d.address),
			notes: nullify(d.notes),
			vehicles: vehicles.length ? { create: vehicles } : undefined,
		},
	});

	revalidatePath("/clients");
	redirect(`/clients/${client.id}`);
}

// --- update client --------------------------------------------------------

const updateSchema = z.object({ id: z.string().min(1), ...clientFields });

export async function updateClient(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	await requireUser();
	const parsed = updateSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { ok: false, error: "nameRequired" };
	const { id, ...d } = parsed.data;

	await db.client.update({
		where: { id },
		data: {
			name: d.name,
			email: nullify(d.email),
			phone: nullify(d.phone),
			vatNumber: nullify(d.vatNumber),
			address: nullify(d.address),
			notes: nullify(d.notes),
		},
	});

	revalidatePath(`/clients/${id}`);
	revalidatePath("/clients");
	return { ok: true };
}

// --- vehicles ------------------------------------------------------------

const vehicleSchema = z.object({
	clientId: z.string().min(1),
	plate: z.string().trim().min(1),
	make: z.string().trim().optional(),
	model: z.string().trim().optional(),
	year: z.string().trim().optional(),
});

export async function addVehicle(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	await requireUser();
	const parsed = vehicleSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { ok: false, error: "plateRequired" };
	const d = parsed.data;
	const plate = d.plate.toUpperCase();

	const exists = await db.vehicle.findUnique({ where: { plate } });
	if (exists) return { ok: false, error: "plateExists" };

	await db.vehicle.create({
		data: {
			plate,
			make: nullify(d.make),
			model: nullify(d.model),
			year: d.year ? Number.parseInt(d.year, 10) : null,
			clientId: d.clientId,
		},
	});

	revalidatePath(`/clients/${d.clientId}`);
	return { ok: true };
}

const updateVehicleSchema = vehicleSchema.extend({ id: z.string().min(1) });

export async function updateVehicle(
	_prev: ActionState,
	formData: FormData,
): Promise<ActionState> {
	await requireUser();
	const parsed = updateVehicleSchema.safeParse(Object.fromEntries(formData));
	if (!parsed.success) return { ok: false, error: "plateRequired" };
	const d = parsed.data;
	const plate = d.plate.toUpperCase();

	const clash = await db.vehicle.findFirst({
		where: { plate, id: { not: d.id } },
		select: { id: true },
	});
	if (clash) return { ok: false, error: "plateExists" };

	await db.vehicle.update({
		where: { id: d.id },
		data: {
			plate,
			make: nullify(d.make),
			model: nullify(d.model),
			year: d.year ? Number.parseInt(d.year, 10) : null,
		},
	});

	revalidatePath(`/clients/${d.clientId}`);
	return { ok: true };
}

export async function deleteVehicle(id: string, clientId: string) {
	await requireUser();
	const vehicle = await db.vehicle.findUnique({
		where: { id },
		select: { _count: { select: { tickets: true } } },
	});
	if (!vehicle) return;
	if (vehicle._count.tickets > 0) return; // keep vehicles that have history

	await db.vehicle.delete({ where: { id } });
	revalidatePath(`/clients/${clientId}`);
}
