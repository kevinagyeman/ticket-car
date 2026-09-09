import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { Link } from "@/i18n/navigation";
import { NavLink } from "./nav-link";

export async function AppHeader() {
	const t = await getTranslations("nav");

	return (
		<header className="sticky top-0 z-40 flex flex-wrap items-center gap-x-2 gap-y-2 border-border border-b bg-card px-3 py-2.5 sm:px-4">
			<Link className="mr-2 font-semibold" href="/">
				ticket-car
			</Link>

			<nav className="flex items-center gap-1">
				<NavLink href="/">{t("dashboard")}</NavLink>
				<NavLink href="/">{t("ticketsList")}</NavLink>
				<NavLink href="/tickets/new">{t("newTicket")}</NavLink>
			</nav>

			<div className="ml-auto flex items-center gap-2">
				<LanguageSwitcher />
				<SignOutButton />
			</div>
		</header>
	);
}
