"use client";

import { useTranslations } from "next-intl";
import { useActionState, useEffect, useRef, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	type ActionState,
	addVehicle,
	deleteVehicle,
	updateVehicle,
} from "@/server/client-actions";

const inputClass = "h-8";

type Vehicle = {
	id: string;
	plate: string;
	make: string | null;
	model: string | null;
	year: number | null;
};

export function VehicleRow({
	vehicle,
	clientId,
	ticketCount,
}: {
	vehicle: Vehicle;
	clientId: string;
	ticketCount: number;
}) {
	const t = useTranslations("clients");
	const [state, action, pending] = useActionState<ActionState, FormData>(
		updateVehicle,
		undefined,
	);
	const [deleting, startDelete] = useTransition();

	useEffect(() => {
		if (state?.ok) toast.success(t("saved"));
		else if (state?.error) toast.error(t(`error.${state.error}`));
	}, [state]);

	return (
		<form
			action={action}
			className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
		>
			<input name="id" type="hidden" value={vehicle.id} />
			<input name="clientId" type="hidden" value={clientId} />
			<Input
				className={`${inputClass} uppercase`}
				defaultValue={vehicle.plate}
				name="plate"
				required
			/>
			<Input
				className={inputClass}
				defaultValue={vehicle.make ?? ""}
				name="make"
				placeholder={t("field.make")}
			/>
			<Input
				className={inputClass}
				defaultValue={vehicle.model ?? ""}
				name="model"
				placeholder={t("field.model")}
			/>
			<Input
				className={`${inputClass} w-20`}
				defaultValue={vehicle.year ?? ""}
				inputMode="numeric"
				name="year"
				placeholder={t("field.year")}
			/>
			<div className="flex items-center gap-1">
				<Button disabled={pending} size="sm" type="submit" variant="outline">
					{t("save")}
				</Button>
				{ticketCount > 0 ? (
					<span
						className="px-1 text-[11px] text-muted-foreground"
						title={t("vehicleHasTickets")}
					>
						{ticketCount}
					</span>
				) : (
					<Button
						disabled={deleting}
						onClick={() =>
							startDelete(() => deleteVehicle(vehicle.id, clientId))
						}
						size="sm"
						type="button"
						variant="ghost"
					>
						{t("delete")}
					</Button>
				)}
			</div>
		</form>
	);
}

export function AddVehicleForm({ clientId }: { clientId: string }) {
	const t = useTranslations("clients");
	const formRef = useRef<HTMLFormElement>(null);
	const [state, action, pending] = useActionState<ActionState, FormData>(
		addVehicle,
		undefined,
	);

	useEffect(() => {
		if (state?.ok) {
			formRef.current?.reset();
			toast.success(t("vehicleAdded"));
		} else if (state?.error) {
			toast.error(t(`error.${state.error}`));
		}
	}, [state]);

	return (
		<form
			action={action}
			className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto_auto]"
			ref={formRef}
		>
			<input name="clientId" type="hidden" value={clientId} />
			<Input
				className={`${inputClass} uppercase`}
				name="plate"
				placeholder={t("field.plate")}
				required
			/>
			<Input className={inputClass} name="make" placeholder={t("field.make")} />
			<Input
				className={inputClass}
				name="model"
				placeholder={t("field.model")}
			/>
			<Input
				className={`${inputClass} w-20`}
				inputMode="numeric"
				name="year"
				placeholder={t("field.year")}
			/>
			<Button disabled={pending} size="sm" type="submit">
				{t("addVehicle")}
			</Button>
		</form>
	);
}
