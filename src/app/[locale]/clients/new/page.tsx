import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import { AppHeader } from "../../_components/app-header";
import { NewClientForm } from "./new-client-form";

export default async function NewClientPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) redirect("/login");

	const t = await getTranslations("clients");

	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<AppHeader active="clients" />
			<div className="mx-auto w-full max-w-2xl px-3 py-6 sm:px-6 sm:py-10">
				<div className="border border-border bg-card p-4 sm:p-6">
					<div className="mb-5 flex items-center justify-between">
						<h1 className="font-semibold text-lg">{t("newTitle")}</h1>
						<Link
							className="text-muted-foreground text-sm underline-offset-2 hover:underline"
							href="/clients"
						>
							{t("cancel")}
						</Link>
					</div>
					<NewClientForm />
				</div>
			</div>
		</div>
	);
}
