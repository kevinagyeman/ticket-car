import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { auth } from "@/server/auth";

export default async function HomePage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) redirect("/login");

	const t = await getTranslations("home");

	return (
		<main className="flex min-h-screen flex-col items-center justify-center gap-2">
			<div className="absolute top-4 right-4 flex items-center gap-2">
				<LanguageSwitcher />
				<SignOutButton />
			</div>
			<h1 className="font-bold text-4xl tracking-tight">{t("title")}</h1>
			<p className="text-muted-foreground text-sm">{t("subtitle")}</p>
			<p className="text-muted-foreground text-sm">{t("description")}</p>
			<p className="mt-4 text-muted-foreground text-xs">{session.user.email}</p>
		</main>
	);
}
