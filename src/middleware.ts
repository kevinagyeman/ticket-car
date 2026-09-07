import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";

import { authConfig } from "@/server/auth/config";
import { routing } from "./i18n/routing";

const { auth } = NextAuth(authConfig);
const intlMiddleware = createMiddleware(routing);

const LOGIN_PATH = "/login";

export default auth((req) => {
	const isLoggedIn = !!req.auth;
	const isOnLogin = req.nextUrl.pathname === LOGIN_PATH;

	// Logged-in users have no reason to see the login page.
	if (isOnLogin) {
		if (isLoggedIn) {
			return Response.redirect(new URL("/", req.nextUrl));
		}
		return intlMiddleware(req);
	}

	// Everything else requires a session.
	if (!isLoggedIn) {
		return Response.redirect(new URL(LOGIN_PATH, req.nextUrl));
	}

	const response = intlMiddleware(req);
	response.headers.set("x-pathname", req.nextUrl.pathname);
	return response;
});

export const config = {
	matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
