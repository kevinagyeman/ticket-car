"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { type CreateTicketState, createTicket } from "@/server/ticket-actions";
import {
	submitButtonClass,
	TicketFormFields,
	TicketTextFields,
} from "./ticket-fields";

export function NewTicketForm({ authorName }: { authorName: string }) {
	const t = useTranslations("tickets");
	const [state, action, pending] = useActionState<CreateTicketState, FormData>(
		createTicket,
		undefined,
	);

	const today = new Date().toISOString().slice(0, 10);

	return (
		<form action={action} className="flex flex-col gap-5 text-sm">
			{state?.error ? (
				<p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive">
					{t(`error.${state.error}`)}
				</p>
			) : null}

			<TicketFormFields authorName={authorName} date={today} />
			<TicketTextFields />

			<div>
				<Button
					className={submitButtonClass}
					disabled={pending}
					size="lg"
					type="submit"
				>
					{pending ? "…" : t("new.create")}
				</Button>
			</div>
		</form>
	);
}
