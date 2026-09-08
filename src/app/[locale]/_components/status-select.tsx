"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { setTicketPriority, setTicketStatus } from "@/server/ticket-actions";

const selectClass =
	"h-7 border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring disabled:opacity-60";

export function StatusSelect({
	ticketId,
	value,
}: {
	ticketId: number;
	value: string;
}) {
	const t = useTranslations("tickets.status");
	const [pending, startTransition] = useTransition();

	return (
		<select
			className={cn(selectClass, pending && "opacity-60")}
			disabled={pending}
			onChange={(e) => {
				const next = e.target.value;
				startTransition(() => setTicketStatus(ticketId, next));
			}}
			value={value}
		>
			{TICKET_STATUSES.map((s) => (
				<option key={s} value={s}>
					{t(s)}
				</option>
			))}
		</select>
	);
}

export function PrioritySelect({
	ticketId,
	value,
}: {
	ticketId: number;
	value: string;
}) {
	const t = useTranslations("tickets.priority");
	const [pending, startTransition] = useTransition();

	return (
		<select
			className={cn(selectClass, pending && "opacity-60")}
			disabled={pending}
			onChange={(e) => {
				const next = e.target.value;
				startTransition(() => setTicketPriority(ticketId, next));
			}}
			value={value}
		>
			{TICKET_PRIORITIES.map((p) => (
				<option key={p} value={p}>
					{t(p)}
				</option>
			))}
		</select>
	);
}
