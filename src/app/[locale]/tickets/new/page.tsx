import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
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
			<div className="flex items-center justify-between border-border border-b bg-card px-4 py-3 sm:px-6">
				<h1 className="font-semibold text-lg">{t("new.title")}</h1>
				<Link
					className="text-muted-foreground text-sm underline-offset-2 hover:underline"
					href="/"
				>
					{t("new.cancel")}
				</Link>
			</div>

			<div className="px-4 py-6 sm:px-6">
				<NewTicketForm
					authorName={session.user.name ?? session.user.email ?? ""}
				/>
			</div>
		</div>
	);
}
