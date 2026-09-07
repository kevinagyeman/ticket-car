import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageSwitcher } from "@/app/_components/language-switcher";

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const t = await getTranslations("home");

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-2">
			<div className="absolute top-4 right-4">
				<LanguageSwitcher />
			</div>
			<h1 className="font-bold text-4xl tracking-tight">{t("title")}</h1>
			<p className="text-muted-foreground text-sm">{t("subtitle")}</p>
			<p className="text-muted-foreground text-sm">{t("description")}</p>
		</main>
	);
}
