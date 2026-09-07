import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (session?.user) redirect("/");

	const t = await getTranslations("login");

	return (
		<main className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-sm">
				<h1 className="mb-1 font-bold text-2xl tracking-tight">{t("title")}</h1>
				<p className="mb-6 text-muted-foreground text-sm">{t("subtitle")}</p>
				<LoginForm />
			</div>
		</main>
	);
}
