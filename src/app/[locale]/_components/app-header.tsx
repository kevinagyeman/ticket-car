import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function AppHeader({
	active,
	children,
}: {
	active: "tickets" | "clients";
	children?: React.ReactNode;
}) {
	const t = await getTranslations("nav");

	const link = (isActive: boolean) =>
		cn(
			"px-2 py-1",
			isActive ? "font-medium" : "text-muted-foreground hover:text-foreground",
		);

	return (
		<header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-border border-b px-3 py-2.5 sm:px-4">
			<nav className="flex items-center gap-1 text-sm">
				<Link className="mr-1 font-semibold" href="/">
					ticket-car
				</Link>
				<Link className={link(active === "tickets")} href="/">
					{t("tickets")}
				</Link>
				<Link className={link(active === "clients")} href="/clients">
					{t("clients")}
				</Link>
			</nav>

			<div className="ml-auto flex items-center gap-2">
				<Link
					className={cn(buttonVariants({ size: "sm" }))}
					href="/tickets/new"
				>
					{t("newTicket")}
				</Link>
				<LanguageSwitcher />
				<SignOutButton />
			</div>

			{children ? (
				<div className="order-last w-full sm:order-none sm:ml-0 sm:w-auto">
					{children}
				</div>
			) : null}
		</header>
	);
}
