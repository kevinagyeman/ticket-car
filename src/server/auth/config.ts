import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

import { env } from "@/env";
import { db } from "@/server/db";

const allowedEmails = env.ALLOWED_EMAILS.split(",")
	.map((e) => e.trim().toLowerCase())
	.filter(Boolean);

const googleConfigured = !!env.AUTH_GOOGLE_ID && !!env.AUTH_GOOGLE_SECRET;

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
			// ...other properties
			// role: UserRole;
		} & DefaultSession["user"];
	}

	// interface User {
	//   // ...other properties
	//   // role: UserRole;
	// }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authConfig = {
	providers: googleConfigured
		? [
				GoogleProvider({
					clientId: env.AUTH_GOOGLE_ID,
					clientSecret: env.AUTH_GOOGLE_SECRET,
				}),
			]
		: [],
	adapter: PrismaAdapter(db),
	callbacks: {
		signIn: ({ user }) => {
			const email = user.email?.toLowerCase();
			if (!email) return false;
			// If no allowlist is configured, deny everyone (fail closed).
			return allowedEmails.includes(email);
		},
		session: ({ session, user }) => ({
			...session,
			user: {
				...session.user,
				id: user.id,
			},
		}),
	},
} satisfies NextAuthConfig;
