"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets";
import { type CreateTicketState, createTicket } from "@/server/ticket-actions";

type Option = { id: string; name: string };

const selectClass =
	"h-8 w-full border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring";

export function NewTicketForm({
	clients,
	tags,
	authorName,
}: {
	clients: Option[];
	tags: { id: string; name: string; color: string | null }[];
	authorName: string;
}) {
	const t = useTranslations("tickets");
	const tStatus = useTranslations("tickets.status");
	const tPriority = useTranslations("tickets.priority");
	const [state, action, pending] = useActionState<CreateTicketState, FormData>(
		createTicket,
		undefined,
	);

	const today = new Date().toISOString().slice(0, 10);

	return (
		<form action={action} className="flex flex-col gap-4 text-sm">
			{state?.error ? (
				<p className="border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive">
					{t(`error.${state.error}`)}
				</p>
			) : null}

			<Field label={t("field.plate")}>
				<Input autoComplete="off" className="uppercase" name="plate" required />
				<p className="mt-1 text-muted-foreground text-xs">
					{t("new.plateHint")}
				</p>
			</Field>

			<Field label={t("new.existingClient")}>
				<select className={selectClass} defaultValue="" name="clientId">
					<option value="">—</option>
					{clients.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name}
						</option>
					))}
				</select>
			</Field>

			<fieldset className="grid grid-cols-1 gap-2 border border-border p-3 sm:grid-cols-3">
				<legend className="px-1 text-muted-foreground text-xs">
					{t("new.orNewClient")}
				</legend>
				<Field label={t("new.clientName")}>
					<Input name="newClientName" />
				</Field>
				<Field label={t("new.clientEmail")}>
					<Input name="newClientEmail" type="email" />
				</Field>
				<Field label={t("new.clientPhone")}>
					<Input name="newClientPhone" />
				</Field>
			</fieldset>

			<fieldset className="grid grid-cols-1 gap-2 border border-border p-3 sm:grid-cols-3">
				<legend className="px-1 text-muted-foreground text-xs">
					{t("new.vehicleHint")}
				</legend>
				<Field label={t("new.make")}>
					<Input name="make" />
				</Field>
				<Field label={t("new.model")}>
					<Input name="model" />
				</Field>
				<Field label={t("new.year")}>
					<Input inputMode="numeric" name="year" />
				</Field>
			</fieldset>

			<div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
				<Field label={t("field.date")}>
					<Input defaultValue={today} name="date" type="date" />
				</Field>
				<Field label={t("field.orderNumber")}>
					<Input name="orderNumber" />
				</Field>
				<Field label={t("field.km")}>
					<Input inputMode="numeric" name="km" />
				</Field>
				<Field label={t("field.systemModel")}>
					<Input name="systemModel" />
				</Field>
				<Field label={t("field.softwareVersion")}>
					<Input name="softwareVersion" />
				</Field>
			</div>

			<Field label={t("field.complaint")}>
				<Textarea name="complaint" required rows={3} />
			</Field>
			<Field label={t("field.diagnosis")}>
				<Textarea name="diagnosis" rows={2} />
			</Field>
			<Field label={t("field.resolutionNote")}>
				<Textarea name="resolutionNote" rows={2} />
			</Field>

			<div className="grid grid-cols-2 gap-2">
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
			</div>

			{tags.length > 0 ? (
				<Field label={t("field.tags")}>
					<div className="flex flex-wrap gap-2">
						{tags.map((tag) => (
							<label
								className="flex items-center gap-1.5 border border-border px-2 py-1 text-xs"
								key={tag.id}
							>
								<input name="tagIds" type="checkbox" value={tag.id} />
								{tag.name}
							</label>
						))}
					</div>
				</Field>
			) : null}

			<Field label={t("field.author")}>
				<Input defaultValue={authorName} disabled readOnly />
			</Field>

			<div className="flex gap-2">
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
		<div className="flex flex-col gap-1">
			<Label className="text-muted-foreground text-xs">{label}</Label>
			{children}
		</div>
	);
}
