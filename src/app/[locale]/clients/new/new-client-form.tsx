"use client";

import { useTranslations } from "next-intl";
import { useActionState, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ClientFormState, createClient } from "@/server/client-actions";

export function NewClientForm() {
	const t = useTranslations("clients");
	const [state, action, pending] = useActionState<ClientFormState, FormData>(
		createClient,
		undefined,
	);
	const [rows, setRows] = useState(1);

	return (
		<form action={action} className="flex flex-col gap-4 text-sm">
			{state?.error ? (
				<p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive">
					{t(`error.${state.error}`)}
				</p>
			) : null}

			<Field label={t("field.name")}>
				<Input name="name" required />
			</Field>

			<div className="grid gap-3 sm:grid-cols-2">
				<Field label={t("field.email")}>
					<Input name="email" type="email" />
				</Field>
				<Field label={t("field.phone")}>
					<Input name="phone" />
				</Field>
				<Field label={t("field.vatNumber")}>
					<Input name="vatNumber" />
				</Field>
				<Field label={t("field.address")}>
					<Input name="address" />
				</Field>
			</div>

			<Field label={t("field.notes")}>
				<Textarea name="notes" rows={2} />
			</Field>

			<fieldset className="border border-border p-3">
				<legend className="px-1 text-muted-foreground text-xs">
					{t("vehicles")}
				</legend>
				<div className="flex flex-col gap-2">
					{Array.from({ length: rows }, (_, i) => i).map((i) => (
						<div className="grid grid-cols-2 gap-2 sm:grid-cols-4" key={i}>
							<Input
								className="uppercase"
								name="vehiclePlate"
								placeholder={t("field.plate")}
							/>
							<Input name="vehicleMake" placeholder={t("field.make")} />
							<Input name="vehicleModel" placeholder={t("field.model")} />
							<Input
								inputMode="numeric"
								name="vehicleYear"
								placeholder={t("field.year")}
							/>
						</div>
					))}
				</div>
				<button
					className="mt-2 text-muted-foreground text-xs underline-offset-2 hover:underline"
					onClick={() => setRows((r) => r + 1)}
					type="button"
				>
					+ {t("addVehicleRow")}
				</button>
			</fieldset>

			<div className="flex gap-2">
				<Button disabled={pending} type="submit">
					{pending ? "…" : t("create")}
				</Button>
			</div>
		</form>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<Label className="text-muted-foreground text-xs">{label}</Label>
			{children}
		</div>
	);
}
