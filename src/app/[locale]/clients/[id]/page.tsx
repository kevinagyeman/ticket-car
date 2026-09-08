import {
	getFormatter,
	getTranslations,
	setRequestLocale,
} from "next-intl/server";
import { notFound, redirect } from "next/navigation";

import { Link } from "@/i18n/navigation";
import { auth } from "@/server/auth";
import { getClient } from "@/server/clients";
import { AppHeader } from "../../_components/app-header";
import { PriorityMark, StatusBadge } from "../../_components/ticket-badges";
import { EditClientForm } from "./edit-client-form";
import { AddVehicleForm, VehicleRow } from "./vehicles";

export default async function ClientDetailPage({
	params,
}: {
	params: Promise<{ locale: string; id: string }>;
}) {
	const { locale, id } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (!session?.user) redirect("/login");

	const [client, t, format] = await Promise.all([
		getClient(id),
		getTranslations("clients"),
		getFormatter(),
	]);
	if (!client) notFound();

	return (
		<div className="flex min-h-dvh flex-col bg-background">
			<AppHeader active="clients" />

			<div className="mx-auto w-full max-w-3xl space-y-4 px-3 py-6 sm:px-6">
				<Link
					className="text-muted-foreground text-sm underline-offset-2 hover:underline"
					href="/clients"
				>
					← {t("backToList")}
				</Link>

				<section className="border border-border bg-card p-4 sm:p-6">
					<h1 className="mb-4 font-semibold text-lg">{client.name}</h1>
					<EditClientForm
						client={{
							id: client.id,
							name: client.name,
							email: client.email,
							phone: client.phone,
							vatNumber: client.vatNumber,
							address: client.address,
							notes: client.notes,
						}}
					/>
				</section>

				<section className="border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-3 font-medium text-sm">{t("vehicles")}</h2>
					<div className="flex flex-col gap-2">
						{client.vehicles.map((v) => (
							<VehicleRow
								clientId={client.id}
								key={v.id}
								ticketCount={v._count.tickets}
								vehicle={{
									id: v.id,
									plate: v.plate,
									make: v.make,
									model: v.model,
									year: v.year,
								}}
							/>
						))}
						{client.vehicles.length === 0 ? (
							<p className="text-muted-foreground text-xs">{t("noVehicles")}</p>
						) : null}
					</div>
					<div className="mt-3 border-border border-t pt-3">
						<AddVehicleForm clientId={client.id} />
					</div>
				</section>

				<section className="border border-border bg-card p-4 sm:p-6">
					<h2 className="mb-3 font-medium text-sm">
						{t("ticketHistory", { count: client.tickets.length })}
					</h2>
					{client.tickets.length === 0 ? (
						<p className="text-muted-foreground text-xs">{t("noTickets")}</p>
					) : (
						<ul className="divide-y divide-border border border-border">
							{client.tickets.map((ticket) => (
								<li key={ticket.id}>
									<Link
										className="block px-3 py-2 text-sm hover:bg-muted/60"
										href={{ pathname: "/", query: { t: String(ticket.id) } }}
									>
										<div className="flex items-center justify-between gap-2">
											<span className="font-medium">#{ticket.id}</span>
											<span className="flex items-center gap-2">
												<PriorityMark priority={ticket.priority} />
												<StatusBadge status={ticket.status} />
											</span>
										</div>
										<div className="mt-0.5 truncate text-muted-foreground text-xs">
											{ticket.vehicles.map((v) => v.plate).join(", ")}
											{ticket.complaint ? ` · ${ticket.complaint}` : ""}
										</div>
										<div className="mt-0.5 text-[11px] text-muted-foreground">
											{format.dateTime(ticket.updatedAt, {
												dateStyle: "short",
											})}
										</div>
									</Link>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
		</div>
	);
}
