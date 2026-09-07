import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";

export const metadata: Metadata = {
	title: "ticket-car",
	description: "Internal ticketing for client car problems",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-geist-mono",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html className={geistMono.variable} lang="en">
			<body>{children}</body>
		</html>
	);
}
