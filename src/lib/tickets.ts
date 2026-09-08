import { z } from "zod";

/**
 * SQLite has no native enums, so these live as `String` columns. Treat the
 * arrays below as the source of truth and validate with the Zod schemas
 * everywhere data enters the system.
 */

export const TICKET_STATUSES = [
	"OPEN",
	"IN_PROGRESS",
	"WAITING_PARTS",
	"WAITING_CLIENT",
	"RESOLVED",
	"CLOSED",
] as const;

export const TICKET_PRIORITIES = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

export const ATTACHMENT_KINDS = ["AUDIO", "IMAGE", "OTHER"] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];
export type AttachmentKind = (typeof ATTACHMENT_KINDS)[number];

export const ticketStatusSchema = z.enum(TICKET_STATUSES);
export const ticketPrioritySchema = z.enum(TICKET_PRIORITIES);
export const attachmentKindSchema = z.enum(ATTACHMENT_KINDS);

/** Statuses that count as "still needs work" — the default list filter. */
export const OPEN_STATUSES: readonly TicketStatus[] = [
	"OPEN",
	"IN_PROGRESS",
	"WAITING_PARTS",
	"WAITING_CLIENT",
];

export function attachmentKindFromMime(mime: string): AttachmentKind {
	if (mime.startsWith("audio/")) return "AUDIO";
	if (mime.startsWith("image/")) return "IMAGE";
	return "OTHER";
}

/** Tailwind classes for the status dot / badge, keyed by status. */
export const STATUS_DOT: Record<TicketStatus, string> = {
	OPEN: "bg-blue-500",
	IN_PROGRESS: "bg-amber-500",
	WAITING_PARTS: "bg-violet-500",
	WAITING_CLIENT: "bg-orange-500",
	RESOLVED: "bg-emerald-500",
	CLOSED: "bg-muted-foreground",
};

export const PRIORITY_META: Record<
	TicketPriority,
	{ label: string; className: string }
> = {
	LOW: { label: "↓", className: "text-muted-foreground" },
	NORMAL: { label: "•", className: "text-muted-foreground" },
	HIGH: { label: "↑", className: "text-orange-600 dark:text-orange-400" },
	URGENT: {
		label: "!!",
		className: "font-bold text-red-600 dark:text-red-400",
	},
};

export function isValidStatus(v: string): v is TicketStatus {
	return (TICKET_STATUSES as readonly string[]).includes(v);
}
