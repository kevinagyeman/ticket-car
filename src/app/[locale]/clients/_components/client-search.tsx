"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";

import { Input } from "@/components/ui/input";
import { usePathname, useRouter } from "@/i18n/navigation";

export function ClientSearch() {
	const t = useTranslations("clients");
	const router = useRouter();
	const pathname = usePathname();
	const params = useSearchParams();
	const debounce = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	return (
		<Input
			aria-label={t("search")}
			className="h-8 w-full sm:w-72"
			defaultValue={params.get("q") ?? ""}
			onChange={(e) => {
				const value = e.target.value;
				clearTimeout(debounce.current);
				debounce.current = setTimeout(() => {
					const next = new URLSearchParams(params);
					if (value) next.set("q", value);
					else next.delete("q");
					router.replace(
						{ pathname, query: Object.fromEntries(next) },
						{ scroll: false },
					);
				}, 250);
			}}
			placeholder={t("search")}
			type="search"
		/>
	);
}
