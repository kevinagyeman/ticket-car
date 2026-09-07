"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login } from "./actions";

export function LoginForm() {
	const t = useTranslations("login");
	const [error, formAction, pending] = useActionState(login, undefined);

	return (
		<form action={formAction} className="flex flex-col gap-4">
			<div className="flex flex-col gap-1.5">
				<Label htmlFor="email">{t("email")}</Label>
				<Input
					autoComplete="email"
					id="email"
					name="email"
					required
					type="email"
				/>
			</div>

			<div className="flex flex-col gap-1.5">
				<Label htmlFor="password">{t("password")}</Label>
				<Input
					autoComplete="current-password"
					id="password"
					name="password"
					required
					type="password"
				/>
			</div>

			{error ? (
				<p className="text-destructive text-sm" role="alert">
					{t("error")}
				</p>
			) : null}

			<Button disabled={pending} type="submit">
				{pending ? t("pending") : t("submit")}
			</Button>
		</form>
	);
}
