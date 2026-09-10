"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { type SaveState, saveTicketFields } from "@/server/ticket-actions";
import {
	saveButtonClass,
	TicketFormFields,
	TicketTextFields,
} from "./ticket-fields";

type Fields = {
	id: number;
	dateISO: string;
	client: string | null;
	plate: string | null;
	make: string | null;
	model: string | null;
	km: number | null;
	ol: string | null;
	systemModel: string | null;
	softwareVersion: string | null;
	status: string;
	priority: string;
	complaint: string | null;
	diagnosis: string | null;
	resolutionNote: string | null;
};

export function TicketFieldsForm({
	ticket,
	authorName,
}: {
	ticket: Fields;
	authorName: string;
}) {
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
		<form action={action} className="flex flex-col gap-5 text-sm">
			<input name="ticketId" type="hidden" value={ticket.id} />

			<TicketFormFields
				authorName={authorName}
				date={ticket.dateISO}
				values={ticket}
			/>
			<TicketTextFields values={ticket} />

			<div>
				<Button className={saveButtonClass} disabled={pending} type="submit">
					{pending ? "…" : t("detail.save")}
				</Button>
			</div>
		</form>
	);
}
