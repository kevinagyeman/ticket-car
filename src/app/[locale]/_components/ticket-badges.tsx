import { useTranslations } from "next-intl";

import {
	PRIORITY_META,
	STATUS_DOT,
	type TicketPriority,
	type TicketStatus,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";

export function StatusBadge({
	status,
	className,
}: {
	status: string;
	className?: string;
}) {
	const t = useTranslations("tickets.status");
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 whitespace-nowrap text-xs",
				className,
			)}
		>
			<span
				className={cn(
					"size-2 shrink-0",
					STATUS_DOT[status as TicketStatus] ?? "bg-muted-foreground",
				)}
			/>
			{t(status)}
		</span>
	);
}

export function PriorityMark({ priority }: { priority: string }) {
	const t = useTranslations("tickets.priority");
	const meta =
		PRIORITY_META[priority as TicketPriority] ?? PRIORITY_META.NORMAL;
	return (
		<span
			className={cn("text-xs tabular-nums", meta.className)}
			title={t(priority)}
		>
			{meta.label}
		</span>
	);
}
