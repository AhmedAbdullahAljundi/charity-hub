import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    // Match only the root path for initial redirection.
    // By excluding /(ar|en)/:path*, we bypass the middleware on every navigation
    // which restores the "instant" client-side routing speed.
    "/",
  ],
};
