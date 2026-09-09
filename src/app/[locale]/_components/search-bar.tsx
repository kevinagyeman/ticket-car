"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/i18n/navigation";
import { TICKET_STATUSES } from "@/lib/tickets";
import { cn } from "@/lib/utils";
import type { TicketFilterOptions } from "@/server/tickets";

const selectClass =
	"h-8 shrink-0 border border-input px-2 text-sm outline-none focus-visible:border-ring";

export function SearchBar({ options }: { options: TicketFilterOptions }) {
	const t = useTranslations("tickets");
	const tStatus = useTranslations("tickets.status");
	const tField = useTranslations("tickets.field");
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const [pending, startTransition] = useTransition();
	const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	const [q, setQ] = useState(() => params.get("q") ?? "");
	const [status, setStatus] = useState(() => params.get("status") ?? "");
	const [model, setModel] = useState(() => params.get("model") ?? "");
	const [radio, setRadio] = useState(() => params.get("radio") ?? "");
	const [sw, setSw] = useState(() => params.get("sw") ?? "");

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
		<div className="flex flex-wrap items-center gap-2">
			<Input
				aria-label={t("search")}
				className={cn("h-8 min-w-[180px] flex-1", pending && "opacity-70")}
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
				className={selectClass}
				onChange={(e) => {
					setStatus(e.target.value);
					apply("status", e.target.value);
				}}
				value={status}
			>
				<option value="">{t("filterAll")}</option>
				<option value="active">{t("filterActive")}</option>
				{TICKET_STATUSES.map((s) => (
					<option key={s} value={s}>
						{tStatus(s)}
					</option>
				))}
			</select>

			<FilterSelect
				label={tField("model")}
				onChange={(v) => {
					setModel(v);
					apply("model", v);
				}}
				options={options.model}
				value={model}
			/>
			<FilterSelect
				label={tField("systemModel")}
				onChange={(v) => {
					setRadio(v);
					apply("radio", v);
				}}
				options={options.systemModel}
				value={radio}
			/>
			<FilterSelect
				label={tField("softwareVersion")}
				onChange={(v) => {
					setSw(v);
					apply("sw", v);
				}}
				options={options.softwareVersion}
				value={sw}
			/>
		</div>
	);
}

function FilterSelect({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: string[];
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<select
			aria-label={label}
			className={cn(
				selectClass,
				"max-w-[180px] truncate",
				value && "font-medium",
			)}
			onChange={(e) => onChange(e.target.value)}
			value={value}
		>
			<option value="">{label}</option>
			{options.map((o) => (
				<option key={o} value={o}>
					{o}
				</option>
			))}
		</select>
	);
}
