import type { DefaultSession, NextAuthConfig } from "next-auth";

/**
 * Edge-safe auth config: no adapter, no Node-only providers, no bcrypt.
 * This is what `middleware.ts` runs. The Credentials provider (which needs
 * Prisma + bcrypt) is added on top of this in `./index.ts`.
 */

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties
 * to the `session` object and keep type safety.
 */
declare module "next-auth" {
	interface Session extends DefaultSession {
		user: {
			id: string;
		} & DefaultSession["user"];
	}
}

export const authConfig = {
	pages: {
		signIn: "/login",
	},
	session: { strategy: "jwt" },
	// Real providers are attached in ./index.ts (Node runtime only).
	providers: [],
	callbacks: {
		session({ session, token }) {
			if (token.sub) {
				session.user.id = token.sub;
			}
			return session;
		},
	},
} satisfies NextAuthConfig;
