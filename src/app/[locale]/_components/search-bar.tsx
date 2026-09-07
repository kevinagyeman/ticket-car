"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
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

	function apply(next: URLSearchParams) {
		startTransition(() => {
			router.replace(
				{ pathname, query: Object.fromEntries(next) },
				{ scroll: false },
			);
		});
	}

	function setParam(key: string, value: string) {
		const next = new URLSearchParams(params);
		if (value) next.set(key, value);
		else next.delete(key);
		apply(next);
	}

	return (
		<div className="flex items-center gap-2">
			<Input
				aria-label={t("search")}
				className={cn("h-8 w-full sm:w-72", pending && "opacity-70")}
				defaultValue={params.get("q") ?? ""}
				onChange={(e) => {
					const value = e.target.value;
					clearTimeout(debounce.current);
					debounce.current = setTimeout(() => setParam("q", value), 250);
				}}
				placeholder={t("search")}
				type="search"
			/>
			<select
				className="h-8 border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring"
				defaultValue={params.get("status") ?? ""}
				onChange={(e) => setParam("status", e.target.value)}
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
