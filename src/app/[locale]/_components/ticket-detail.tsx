import { getFormatter, getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getTicket } from "@/server/tickets";
import { PrioritySelect, StatusSelect } from "./status-select";
import { TicketFieldsForm } from "./ticket-fields-form";

export async function TicketDetail({
	id,
	query,
}: {
	id: number;
	query: Record<string, string>;
}) {
	const [ticket, t, format] = await Promise.all([
		getTicket(id),
		getTranslations("tickets"),
		getFormatter(),
	]);

	if (!ticket) {
		return (
			<div className="p-6 text-muted-foreground text-sm">
				{t("error.notFound")}
			</div>
		);
	}

	return (
		<div className="flex h-full flex-col">
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-border border-b px-4 py-3">
				<Link
					className="text-muted-foreground text-sm underline-offset-2 hover:underline md:hidden"
					href={{ pathname: "/", query }}
				>
					← {t("backToList")}
				</Link>
				<div className="flex items-baseline gap-2">
					<span className="font-semibold text-lg">#{ticket.id}</span>
					<span className="text-muted-foreground text-xs">
						{format.dateTime(ticket.date, { dateStyle: "medium" })}
					</span>
				</div>
				<div className="ml-auto flex items-center gap-2">
					<PrioritySelect ticketId={ticket.id} value={ticket.priority} />
					<StatusSelect ticketId={ticket.id} value={ticket.status} />
				</div>
			</div>

			<div className="flex-1 space-y-5 overflow-y-auto p-4">
				<dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
					<Meta label={t("field.author")}>
						{ticket.author.name ?? ticket.author.email}
					</Meta>
					{ticket.assignee ? (
						<Meta label={t("field.assignee")}>
							{ticket.assignee.name ?? ticket.assignee.email}
						</Meta>
					) : null}
				</dl>

				<TicketFieldsForm
					key={ticket.updatedAt.getTime()}
					ticket={{
						id: ticket.id,
						client: ticket.client,
						plate: ticket.plate,
						make: ticket.make,
						model: ticket.model,
						km: ticket.km,
						ol: ticket.ol,
						systemModel: ticket.systemModel,
						softwareVersion: ticket.softwareVersion,
						complaint: ticket.complaint,
						diagnosis: ticket.diagnosis,
						resolutionNote: ticket.resolutionNote,
					}}
				/>

				<section className="space-y-2">
					<h3 className="font-medium text-muted-foreground text-xs uppercase">
						{t("detail.attachments")}
					</h3>
					{ticket.attachments.length === 0 ? (
						<p className="text-muted-foreground text-xs">—</p>
					) : (
						<ul className="space-y-1 text-sm">
							{ticket.attachments.map((a) => (
								<li className="flex items-center gap-2" key={a.id}>
									<span className="text-muted-foreground">
										{a.kind === "AUDIO" ? "♪" : a.kind === "IMAGE" ? "▦" : "◈"}
									</span>
									<span className="truncate">{a.filename}</span>
									<span className="text-muted-foreground text-xs">
										{Math.round(a.size / 1024)} KB
									</span>
								</li>
							))}
						</ul>
					)}
					<p className="text-muted-foreground text-xs">
						{t("detail.uploadSoon")}
					</p>
				</section>
			</div>
		</div>
	);
}

function Meta({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div>
			<dt className="text-muted-foreground text-xs">{label}</dt>
			<dd className="truncate">{children}</dd>
		</div>
	);
}
