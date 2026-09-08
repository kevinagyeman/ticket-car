"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { type SaveState, addTicketEntry } from "@/server/ticket-actions";

export function AddEntryForm({ ticketId }: { ticketId: number }) {
	const t = useTranslations("tickets.detail");
	const formRef = useRef<HTMLFormElement>(null);
	const [state, action, pending] = useActionState<SaveState, FormData>(
		addTicketEntry,
		undefined,
	);

	useEffect(() => {
		if (state?.ok) formRef.current?.reset();
	}, [state]);

	return (
		<form action={action} className="flex items-start gap-2" ref={formRef}>
			<input name="ticketId" type="hidden" value={ticketId} />
			<Textarea
				className="min-h-9 flex-1 resize-none"
				name="body"
				placeholder={t("addToLog")}
				required
				rows={2}
			/>
			<Button disabled={pending} size="sm" type="submit">
				{t("addToLogAction")}
			</Button>
		</form>
	);
}
