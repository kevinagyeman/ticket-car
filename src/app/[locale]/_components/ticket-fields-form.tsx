"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type SaveState, saveTicketFields } from "@/server/ticket-actions";

type Fields = {
	id: number;
	client: string | null;
	plate: string | null;
	make: string | null;
	model: string | null;
	km: number | null;
	ol: string | null;
	systemModel: string | null;
	softwareVersion: string | null;
	complaint: string | null;
	diagnosis: string | null;
	resolutionNote: string | null;
};

export function TicketFieldsForm({ ticket }: { ticket: Fields }) {
	const t = useTranslations("tickets");
	const [state, action, pending] = useActionState<SaveState, FormData>(
		saveTicketFields,
		undefined,
	);

	useEffect(() => {
		if (state?.ok) toast.success(t("detail.saved"));
		else if (state?.error) toast.error(t("error.invalid"));
	}, [state]);

	return (
		<form action={action} className="flex flex-col gap-3">
			<input name="ticketId" type="hidden" value={ticket.id} />

			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				<Small label={t("field.client")}>
					<Input defaultValue={ticket.client ?? ""} name="client" />
				</Small>
				<Small label={t("field.plate")}>
					<Input
						className="uppercase"
						defaultValue={ticket.plate ?? ""}
						name="plate"
					/>
				</Small>
				<Small label={t("field.ol")}>
					<Input defaultValue={ticket.ol ?? ""} name="ol" />
				</Small>
				<Small label={t("field.make")}>
					<Input defaultValue={ticket.make ?? ""} name="make" />
				</Small>
				<Small label={t("field.model")}>
					<Input defaultValue={ticket.model ?? ""} name="model" />
				</Small>
				<Small label={t("field.km")}>
					<Input defaultValue={ticket.km ?? ""} inputMode="numeric" name="km" />
				</Small>
				<Small label={t("field.systemModel")}>
					<Input defaultValue={ticket.systemModel ?? ""} name="systemModel" />
				</Small>
				<Small label={t("field.softwareVersion")}>
					<Input
						defaultValue={ticket.softwareVersion ?? ""}
						name="softwareVersion"
					/>
				</Small>
			</div>

			<Box
				defaultValue={ticket.complaint ?? ""}
				label={t("field.complaint")}
				name="complaint"
			/>
			<Box
				defaultValue={ticket.diagnosis ?? ""}
				label={t("field.diagnosis")}
				name="diagnosis"
			/>
			<Box
				defaultValue={ticket.resolutionNote ?? ""}
				label={t("field.resolutionNote")}
				name="resolutionNote"
			/>

			<div>
				<Button disabled={pending} size="sm" type="submit">
					{pending ? "…" : t("detail.save")}
				</Button>
			</div>
		</form>
	);
}

function Small({
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

function Box({
	label,
	name,
	defaultValue,
}: {
	label: string;
	name: string;
	defaultValue: string;
}) {
	return (
		<div className="flex flex-col gap-1">
			<Label className="text-muted-foreground text-xs" htmlFor={name}>
				{label}
			</Label>
			<Textarea
				className="h-36 resize-none overflow-y-auto"
				defaultValue={defaultValue}
				id={name}
				name={name}
			/>
		</div>
	);
}
