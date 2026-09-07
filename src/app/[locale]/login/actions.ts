"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/server/auth";

/**
 * Server action for the login form. Returns an error key on failure;
 * on success `signIn` throws a redirect that must propagate.
 */
export async function login(
	_prevState: string | undefined,
	formData: FormData,
): Promise<string | undefined> {
	try {
		await signIn("credentials", {
			email: formData.get("email"),
			password: formData.get("password"),
			redirectTo: "/",
		});
		return undefined;
	} catch (error) {
		if (error instanceof AuthError) {
			return "invalid";
		}
		throw error;
	}
}
