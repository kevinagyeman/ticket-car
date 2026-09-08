"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { type ActionState, updateClient } from "@/server/client-actions";

type Client = {
	id: string;
	name: string;
	email: string | null;
	phone: string | null;
	vatNumber: string | null;
	address: string | null;
	notes: string | null;
};

export function EditClientForm({ client }: { client: Client }) {
	const t = useTranslations("clients");
	const [state, action, pending] = useActionState<ActionState, FormData>(
		updateClient,
		undefined,
	);

	useEffect(() => {
		if (state?.ok) toast.success(t("saved"));
		else if (state?.error) toast.error(t(`error.${state.error}`));
	}, [state]);

	return (
		<form action={action} className="flex flex-col gap-3 text-sm">
			<input name="id" type="hidden" value={client.id} />

			<Field label={t("field.name")}>
				<Input defaultValue={client.name} name="name" required />
			</Field>

			<div className="grid gap-3 sm:grid-cols-2">
				<Field label={t("field.email")}>
					<Input defaultValue={client.email ?? ""} name="email" type="email" />
				</Field>
				<Field label={t("field.phone")}>
					<Input defaultValue={client.phone ?? ""} name="phone" />
				</Field>
				<Field label={t("field.vatNumber")}>
					<Input defaultValue={client.vatNumber ?? ""} name="vatNumber" />
				</Field>
				<Field label={t("field.address")}>
					<Input defaultValue={client.address ?? ""} name="address" />
				</Field>
			</div>

			<Field label={t("field.notes")}>
				<Textarea defaultValue={client.notes ?? ""} name="notes" rows={2} />
			</Field>

			<div>
				<Button disabled={pending} size="sm" type="submit">
					{pending ? "…" : t("save")}
				</Button>
			</div>
		</form>
	);
}

function Field({
	label,
	children,
}: {
	label: string;
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col gap-1">
			<Label className="text-muted-foreground text-xs">{label}</Label>
			{children}
		</div>
	);
}
