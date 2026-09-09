import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { listTickets } from "@/server/tickets";
import { AppHeader } from "./_components/app-header";
import { SearchBar } from "./_components/search-bar";
import { TicketDetail } from "./_components/ticket-detail";
import { TicketDetailSkeleton } from "./_components/ticket-detail-skeleton";
import { TicketList } from "./_components/ticket-list";

export default async function HomePage({
	params,
	searchParams,
}: {
	params: Promise<{ locale: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) redirect("/login");

	const sp = await searchParams;
	const q = typeof sp.q === "string" && sp.q ? sp.q : undefined;
	const status =
		typeof sp.status === "string" && sp.status ? sp.status : undefined;
	const parsedId =
		typeof sp.t === "string" ? Number.parseInt(sp.t, 10) : Number.NaN;
	const activeId = Number.isNaN(parsedId) ? undefined : parsedId;

	const [tickets, t] = await Promise.all([
		listTickets({ q, status }),
		getTranslations("tickets"),
	]);

	const query: Record<string, string> = {};
	if (q) query.q = q;
	if (status) query.status = status;

	return (
		<div className="flex h-dvh flex-col bg-background">
			<AppHeader>
				<SearchBar />
			</AppHeader>

			<div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(280px,340px)_1fr]">
				<aside
					className={cn(
						"min-h-0 overflow-y-auto border-border md:block md:border-r",
						activeId ? "hidden md:block" : "flex-1 md:flex-none",
					)}
				>
					<TicketList
						activeId={activeId}
						now={new Date()}
						query={query}
						tickets={tickets}
					/>
				</aside>
				<main
					className={cn(
						"min-h-0 flex-1 overflow-hidden md:flex-none",
						activeId ? "block" : "hidden md:block",
					)}
				>
					{activeId ? (
						<Suspense fallback={<TicketDetailSkeleton />} key={activeId}>
							<TicketDetail id={activeId} query={query} />
						</Suspense>
					) : (
						<div className="flex h-full items-center justify-center p-6 text-muted-foreground text-sm">
							{t("selectPrompt")}
						</div>
					)}
				</main>
			</div>
		</div>
	);
}
