"use client";

import { useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export default function NotFound() {
	const t = useTranslations("notFound");

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
			<h1 className="font-bold text-3xl tracking-tight">{t("heading")}</h1>
			<p className="text-muted-foreground text-sm">{t("description")}</p>
			<Link className={cn(buttonVariants({ variant: "outline" }))} href="/">
				{t("backHome")}
			</Link>
		</main>
	);
}
