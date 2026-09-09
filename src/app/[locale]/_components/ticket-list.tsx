import { useFormatter, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TicketListItem } from "@/server/tickets";
import { LinkSpinner } from "./link-spinner";
import { PriorityMark, StatusBadge } from "./ticket-badges";

export function TicketList({
	tickets,
	activeId,
	query,
	now,
}: {
	tickets: TicketListItem[];
	activeId?: number;
	query: Record<string, string>;
	now: Date;
}) {
	const t = useTranslations("tickets");
	const format = useFormatter();

	if (tickets.length === 0) {
		return <p className="p-4 text-muted-foreground text-sm">{t("empty")}</p>;
	}

	return (
		<ul className="divide-y divide-border">
			{tickets.map((ticket) => {
				const active = ticket.id === activeId;
				return (
					<li key={ticket.id}>
						<Link
							className={cn(
								"block px-3 py-2.5 text-sm hover:bg-muted/60",
								active && "bg-muted",
							)}
							href={{
								pathname: "/",
								query: { ...query, t: String(ticket.id) },
							}}
						>
							<div className="flex items-center justify-between gap-2">
								<span className="flex items-center gap-1.5 font-medium">
									#{ticket.id}
									<LinkSpinner />
								</span>
								<span className="flex items-center gap-2">
									<PriorityMark priority={ticket.priority} />
									<StatusBadge status={ticket.status} />
								</span>
							</div>
							<div className="mt-0.5 truncate text-muted-foreground">
								{[ticket.plate, ticket.client].filter(Boolean).join(" · ") ||
									"—"}
							</div>
							{ticket.complaint ? (
								<div className="mt-0.5 line-clamp-1 text-muted-foreground/80 text-xs">
									{ticket.complaint}
								</div>
							) : null}
							<div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
								<span>{format.relativeTime(ticket.updatedAt, now)}</span>
								{ticket._count.attachments > 0 ? (
									<span>· {ticket._count.attachments} file</span>
								) : null}
							</div>
						</Link>
					</li>
				);
			})}
		</ul>
	);
}
