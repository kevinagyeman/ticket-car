import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { getTicket } from "@/server/tickets";
import { TicketFieldsForm } from "./ticket-fields-form";

export async function TicketDetail({
	id,
	query,
}: {
	id: number;
	query: Record<string, string>;
}) {
	const [ticket, t] = await Promise.all([
		getTicket(id),
		getTranslations("tickets"),
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
				<span className="font-semibold text-lg">#{ticket.id}</span>
			</div>

			<div className="flex-1 space-y-5 overflow-y-auto p-4">
				<TicketFieldsForm
					authorName={ticket.author.name ?? ticket.author.email ?? ""}
					key={ticket.updatedAt.getTime()}
					ticket={{
						id: ticket.id,
						dateISO: ticket.date.toISOString().slice(0, 10),
						client: ticket.client,
						plate: ticket.plate,
						make: ticket.make,
						model: ticket.model,
						km: ticket.km,
						ol: ticket.ol,
						systemModel: ticket.systemModel,
						softwareVersion: ticket.softwareVersion,
						status: ticket.status,
						priority: ticket.priority,
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
