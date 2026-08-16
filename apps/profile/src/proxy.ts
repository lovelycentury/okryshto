import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 renamed the `middleware` file convention to `proxy`; next-intl's
// locale negotiation still ships as a middleware factory.
export default createMiddleware(routing);

export const config = {
  // Skip Next internals and anything with a file extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
