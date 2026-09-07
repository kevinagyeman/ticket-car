import { compare } from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { cache } from "react";
import { z } from "zod";

import { db } from "@/server/db";
import { authConfig } from "./config";

const credentialsSchema = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

const {
	auth: uncachedAuth,
	handlers,
	signIn,
	signOut,
} = NextAuth({
	...authConfig,
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email" },
				password: { label: "Password", type: "password" },
			},
			authorize: async (raw) => {
				const parsed = credentialsSchema.safeParse(raw);
				if (!parsed.success) return null;

				const { email, password } = parsed.data;
				const user = await db.user.findUnique({
					where: { email: email.toLowerCase() },
				});
				if (!user?.password) return null;

				const valid = await compare(password, user.password);
				if (!valid) return null;

				return { id: user.id, email: user.email, name: user.name };
			},
		}),
	],
});

const auth = cache(uncachedAuth);

export { auth, handlers, signIn, signOut };
