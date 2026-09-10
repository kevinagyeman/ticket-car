import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { listTickets, ticketFilterOptions } from "@/server/tickets";
import { AppHeader } from "./_components/app-header";
import { NewTicketForm } from "./_components/new-ticket-form";
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
	const str = (v: string | string[] | undefined) =>
		typeof v === "string" && v ? v : undefined;
	const q = str(sp.q);
	const status = str(sp.status);
	const model = str(sp.model);
	const systemModel = str(sp.radio);
	const softwareVersion = str(sp.sw);
	const newMode = sp.new === "1";
	const parsedId =
		typeof sp.t === "string" ? Number.parseInt(sp.t, 10) : Number.NaN;
	const activeId = Number.isNaN(parsedId) ? undefined : parsedId;

	const [tickets, filterOptions, t] = await Promise.all([
		listTickets({ q, status, model, systemModel, softwareVersion }),
		ticketFilterOptions(),
		getTranslations("tickets"),
	]);

	const query: Record<string, string> = {};
	if (q) query.q = q;
	if (status) query.status = status;
	if (model) query.model = model;
	if (systemModel) query.radio = systemModel;
	if (softwareVersion) query.sw = softwareVersion;

	const paneOpen = newMode || activeId !== undefined;

	return (
		<div className="flex h-dvh flex-col bg-background">
			<AppHeader />

			<div className="border-border border-b-[3px] bg-background px-3 py-2 sm:px-4">
				<SearchBar options={filterOptions} />
			</div>

			<div className="flex min-h-0 flex-1 flex-col md:grid md:grid-cols-[minmax(280px,340px)_1fr]">
				<aside
					className={cn(
						"min-h-0 overflow-y-auto border-border pb-8 md:block md:border-r-[3px]",
						paneOpen ? "hidden md:block" : "flex-1 md:flex-none",
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
						paneOpen ? "block" : "hidden md:block",
					)}
				>
					{newMode ? (
						<div className="flex h-full flex-col">
							<div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-border border-b-[3px] px-4 py-3">
								<Link
									className="text-muted-foreground text-sm underline-offset-2 hover:underline md:hidden"
									href={{ pathname: "/", query }}
								>
									← {t("backToList")}
								</Link>
								<span className="font-semibold text-lg">{t("new.title")}</span>
							</div>
							<div className="flex-1 overflow-y-auto p-4 pb-10">
								<NewTicketForm
									authorName={session.user.name ?? session.user.email ?? ""}
								/>
							</div>
						</div>
					) : activeId !== undefined ? (
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
