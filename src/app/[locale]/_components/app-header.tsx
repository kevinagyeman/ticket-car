import { getTranslations } from "next-intl/server";

import { LanguageSwitcher } from "@/app/_components/language-switcher";
import { SignOutButton } from "@/app/_components/sign-out-button";
import { buttonVariants } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function AppHeader({ children }: { children?: React.ReactNode }) {
	const t = await getTranslations("nav");

	return (
		<header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-border border-b px-3 py-2.5 sm:px-4">
			<Link className="font-semibold" href="/">
				ticket-car
			</Link>

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
