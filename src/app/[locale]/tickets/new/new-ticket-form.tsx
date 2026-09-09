"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets";
import { type CreateTicketState, createTicket } from "@/server/ticket-actions";

const selectClass =
	"h-8 w-full border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring";

export function NewTicketForm({ authorName }: { authorName: string }) {
	const t = useTranslations("tickets");
	const tStatus = useTranslations("tickets.status");
	const tPriority = useTranslations("tickets.priority");
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

			{/* one wrapping row of inputs */}
			<div className="flex flex-wrap gap-3">
				<Field label={t("field.plate")}>
					<Input
						autoComplete="off"
						className="uppercase"
						name="plate"
						required
					/>
				</Field>
				<Field label={t("field.client")}>
					<Input name="client" />
				</Field>
				<Field label={t("field.date")}>
					<Input defaultValue={today} name="date" type="date" />
				</Field>
				<Field label={t("field.make")}>
					<Input defaultValue="TOYOTA" name="make" />
				</Field>
				<Field label={t("field.model")}>
					<Input name="model" />
				</Field>
				<Field label={t("field.km")}>
					<Input inputMode="numeric" name="km" />
				</Field>
				<Field label={t("field.ol")}>
					<Input name="ol" />
				</Field>
				<Field label={t("field.systemModel")}>
					<Input name="systemModel" />
				</Field>
				<Field label={t("field.softwareVersion")}>
					<Input name="softwareVersion" />
				</Field>
				<Field label={t("field.status")}>
					<select className={selectClass} defaultValue="OPEN" name="status">
						{TICKET_STATUSES.map((s) => (
							<option key={s} value={s}>
								{tStatus(s)}
							</option>
						))}
					</select>
				</Field>
				<Field label={t("field.priority")}>
					<select className={selectClass} defaultValue="NORMAL" name="priority">
						{TICKET_PRIORITIES.map((p) => (
							<option key={p} value={p}>
								{tPriority(p)}
							</option>
						))}
					</select>
				</Field>
				<Field label={t("field.author")}>
					<Input defaultValue={authorName} disabled readOnly />
				</Field>
			</div>

			{/* text areas: side by side on wide screens, wrap on mobile */}
			<div className="flex flex-wrap gap-3">
				<TextField label={t("field.complaint")}>
					<Textarea className="h-40 resize-y" name="complaint" required />
				</TextField>
				<TextField label={t("field.diagnosis")}>
					<Textarea className="h-40 resize-y" name="diagnosis" />
				</TextField>
				<TextField label={t("field.resolutionNote")}>
					<Textarea className="h-40 resize-y" name="resolutionNote" />
				</TextField>
			</div>

			<div>
				<Button disabled={pending} type="submit">
					{pending ? "…" : t("new.create")}
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
		<div className="flex w-full flex-col gap-1 sm:min-w-[150px] sm:flex-1 sm:basis-40">
			<Label className="text-muted-foreground text-xs">{label}</Label>
			{children}
		</div>
	);
}

function TextField({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex w-full flex-col gap-1 sm:min-w-[280px] sm:flex-1 sm:basis-80">
			<Label className="text-muted-foreground text-xs">{label}</Label>
			{children}
		</div>
	);
}
