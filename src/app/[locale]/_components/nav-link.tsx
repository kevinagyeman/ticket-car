"use client";

import { useSearchParams } from "next/navigation";

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
	const params = useSearchParams();

	const [path, qs] = href.split("?");
	const wantsNew = qs?.includes("new=1");
	const onNew = params.get("new") === "1";

	let active: boolean;
	if (wantsNew) {
		active = onNew;
	} else if (path === "/") {
		active = pathname === "/" && !onNew;
	} else {
		active = pathname.startsWith(path ?? href);
	}

	return (
		<Link
			className={cn(
				"px-2 py-1 text-sm uppercase",
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
