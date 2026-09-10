import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { auth } from "@/server/auth";
import { LoginForm } from "./login-form";

export default async function LoginPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);

	const session = await auth();
	if (session?.user) redirect("/");

	const t = await getTranslations("login");

	return (
		<main className="flex items-center justify-center p-4">
			<div className="w-full max-w-sm">
				<LoginForm />
			</div>
		</main>
	);
}
