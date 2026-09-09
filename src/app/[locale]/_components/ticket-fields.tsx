"use client";

import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/tickets";

/** Shared between the new-ticket form and the ticket-detail edit form. */

export type TicketInputValues = {
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
};

export type TicketTextValues = {
	complaint: string | null;
	diagnosis: string | null;
	resolutionNote: string | null;
};

const selectClass =
	"h-8 w-full border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring";

/** One cell in the fields grid. */
function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex w-full flex-col gap-1">
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

/**
 * The single wrapping row of short inputs — identical on the new-ticket form and
 * the ticket-detail edit form. Pass `values` to edit an existing ticket; omit it
 * for a new one (plate required, brand prefilled TOYOTA, date editable).
 */
export function TicketFormFields({
	values,
	date,
	authorName,
}: {
	values?: TicketInputValues;
	/** yyyy-mm-dd */
	date: string;
	authorName: string;
}) {
	const t = useTranslations("tickets.field");
	const tStatus = useTranslations("tickets.status");
	const tPriority = useTranslations("tickets.priority");
	const isNew = !values;

	return (
		<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
			<Field label={t("date")}>
				<Input
					defaultValue={date}
					disabled={!isNew}
					name="date"
					readOnly={!isNew}
					type="date"
				/>
			</Field>
			<Field label={t("ol")}>
				<Input defaultValue={values?.ol ?? ""} name="ol" />
			</Field>
			<Field label={t("plate")}>
				<Input
					className="uppercase"
					defaultValue={values?.plate ?? ""}
					name="plate"
					required={isNew}
				/>
			</Field>
			<Field label={t("client")}>
				<Input defaultValue={values?.client ?? ""} name="client" />
			</Field>
			<Field label={t("make")}>
				<Input defaultValue={values?.make ?? "TOYOTA"} name="make" />
			</Field>
			<Field label={t("model")}>
				<Input defaultValue={values?.model ?? ""} name="model" />
			</Field>
			<Field label={t("km")}>
				<Input defaultValue={values?.km ?? ""} inputMode="numeric" name="km" />
			</Field>
			<Field label={t("systemModel")}>
				<Input defaultValue={values?.systemModel ?? ""} name="systemModel" />
			</Field>
			<Field label={t("softwareVersion")}>
				<Input
					defaultValue={values?.softwareVersion ?? ""}
					name="softwareVersion"
				/>
			</Field>
			<Field label={t("status")}>
				<select
					className={selectClass}
					defaultValue={values?.status ?? "OPEN"}
					name="status"
				>
					{TICKET_STATUSES.map((s) => (
						<option key={s} value={s}>
							{tStatus(s)}
						</option>
					))}
				</select>
			</Field>
			<Field label={t("priority")}>
				<select
					className={selectClass}
					defaultValue={values?.priority ?? "NORMAL"}
					name="priority"
				>
					{TICKET_PRIORITIES.map((p) => (
						<option key={p} value={p}>
							{tPriority(p)}
						</option>
					))}
				</select>
			</Field>
			<Field label={t("author")}>
				<Input defaultValue={authorName} disabled readOnly />
			</Field>
		</div>
	);
}

/** The three long-text fields, side by side on wide screens, one per row on mobile. */
export function TicketTextFields({ values }: { values?: TicketTextValues }) {
	const t = useTranslations("tickets.field");
	const isNew = !values;

	return (
		<div className="flex flex-wrap gap-3">
			<TextField label={t("complaint")}>
				<Textarea
					className="h-40 resize-y"
					defaultValue={values?.complaint ?? ""}
					name="complaint"
					required={isNew}
				/>
			</TextField>
			<TextField label={t("diagnosis")}>
				<Textarea
					className="h-40 resize-y"
					defaultValue={values?.diagnosis ?? ""}
					name="diagnosis"
				/>
			</TextField>
			<TextField label={t("resolutionNote")}>
				<Textarea
					className="h-40 resize-y"
					defaultValue={values?.resolutionNote ?? ""}
					name="resolutionNote"
				/>
			</TextField>
		</div>
	);
}
