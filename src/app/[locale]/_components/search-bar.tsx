"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/i18n/navigation";
import { TICKET_STATUSES } from "@/lib/tickets";
import { cn } from "@/lib/utils";

export function SearchBar() {
	const t = useTranslations("tickets");
	const tStatus = useTranslations("tickets.status");
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const [pending, startTransition] = useTransition();
	const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	// controlled from local state — seeded once from the URL
	const [q, setQ] = useState(() => params.get("q") ?? "");
	const [status, setStatus] = useState(() => params.get("status") ?? "");

	function apply(key: string, value: string) {
		const next = new URLSearchParams(params);
		if (value) next.set(key, value);
		else next.delete(key);
		startTransition(() => {
			router.replace(
				{ pathname, query: Object.fromEntries(next) },
				{ scroll: false },
			);
		});
	}

	return (
		<div className="flex w-full items-center gap-2">
			<Input
				aria-label={t("search")}
				className={cn("h-8 min-w-0 flex-1", pending && "opacity-70")}
				onChange={(e) => {
					const value = e.target.value;
					setQ(value);
					clearTimeout(debounce.current);
					debounce.current = setTimeout(() => apply("q", value), 250);
				}}
				placeholder={t("search")}
				type="search"
				value={q}
			/>
			<select
				className="h-8 shrink-0 border border-input px-2 text-sm outline-none focus-visible:border-ring"
				onChange={(e) => {
					setStatus(e.target.value);
					apply("status", e.target.value);
				}}
				value={status}
			>
				<option value="">{t("filterActive")}</option>
				<option value="all">{t("filterAll")}</option>
				{TICKET_STATUSES.map((s) => (
					<option key={s} value={s}>
						{tStatus(s)}
					</option>
				))}
			</select>
		</div>
	);
}
