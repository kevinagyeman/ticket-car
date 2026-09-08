import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { auth } from "@/server/auth";
import { listClientsWithCounts } from "@/server/clients";
import { AppHeader } from "../_components/app-header";
import { ClientSearch } from "./_components/client-search";

export default async function ClientsPage({
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

	const [clients, t] = await Promise.all([
		listClientsWithCounts(q),
		getTranslations("clients"),
	]);

	return (
		<div className="flex h-dvh flex-col bg-background">
			<AppHeader active="clients" />

			<div className="min-h-0 flex-1 overflow-y-auto">
				<div className="mx-auto max-w-3xl px-3 py-6 sm:px-6">
					<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
						<h1 className="font-semibold text-lg">{t("title")}</h1>
						<Link
							className={cn(buttonVariants({ size: "sm" }))}
							href="/clients/new"
						>
							{t("new")}
						</Link>
					</div>

					<div className="mb-3">
						<ClientSearch />
					</div>

					{clients.length === 0 ? (
						<p className="py-8 text-center text-muted-foreground text-sm">
							{t("empty")}
						</p>
					) : (
						<ul className="divide-y divide-border border border-border bg-card">
							{clients.map((c) => (
								<li key={c.id}>
									<Link
										className="block px-4 py-3 text-sm hover:bg-muted/60"
										href={`/clients/${c.id}`}
									>
										<div className="flex items-center justify-between gap-2">
											<span className="font-medium">{c.name}</span>
											{c._count.tickets > 0 ? (
												<span className="text-muted-foreground text-xs">
													{t("openTickets", { count: c._count.tickets })}
												</span>
											) : null}
										</div>
										<div className="mt-0.5 text-muted-foreground text-xs">
											{[c.email, c.phone].filter(Boolean).join(" · ") || "—"}
										</div>
										{c.vehicles.length > 0 ? (
											<div className="mt-0.5 truncate text-muted-foreground/80 text-xs">
												{c.vehicles.map((v) => v.plate).join(", ")}
											</div>
										) : null}
									</Link>
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
		</div>
	);
}
