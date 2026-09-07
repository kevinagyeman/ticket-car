import { defineRouting } from "next-intl/routing";
import { LOCALE_ENUM } from "@/lib/constants";

export const routing = defineRouting({
	locales: LOCALE_ENUM,
	defaultLocale: "en",
	localePrefix: "never",
});
