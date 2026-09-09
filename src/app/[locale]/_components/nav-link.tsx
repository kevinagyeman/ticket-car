"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export function NavLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

	return (
		<Link
			className={cn(
				"px-2 py-1 text-sm",
				active
					? "font-medium text-foreground"
					: "text-muted-foreground hover:text-foreground",
			)}
			href={href}
		>
			{children}
		</Link>
	);
}
