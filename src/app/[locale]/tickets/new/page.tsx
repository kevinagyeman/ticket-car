import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { AppHeader } from "../../_components/app-header";
import { NewTicketForm } from "./new-ticket-form";

export default async function NewTicketPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) redirect("/login");

	const t = await getTranslations("tickets");

	return (
		<div className="min-h-dvh bg-background">
			<AppHeader />
			<div className="px-4 py-6 sm:px-6">
				<h1 className="mb-5 font-semibold text-lg">{t("new.title")}</h1>
				<NewTicketForm
					authorName={session.user.name ?? session.user.email ?? ""}
				/>
			</div>
		</div>
	);
}
