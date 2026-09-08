"use client";

import { useLinkStatus } from "next/link";
import { Loader2Icon } from "lucide-react";

/** Renders a small spinner while its parent <Link> navigation is pending. */
export function LinkSpinner() {
	const { pending } = useLinkStatus();
	if (!pending) return null;
	return (
		<Loader2Icon className="size-3 shrink-0 animate-spin text-muted-foreground" />
	);
}
