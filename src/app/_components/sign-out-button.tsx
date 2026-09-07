import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { signOut } from "@/server/auth";

export async function SignOutButton() {
	const t = await getTranslations("auth");

	return (
		<form
			action={async () => {
				"use server";
				await signOut({ redirectTo: "/login" });
			}}
		>
			<Button size="sm" type="submit" variant="outline">
				{t("signOut")}
			</Button>
		</form>
	);
}
