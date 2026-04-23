import NextAuth from "next-auth";
import { authConfig } from "@/server/auth.config";

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: [
    "/((?!login|register|onboarding|api/auth|api/register|api/webhooks|_next|favicon.ico).*)",
  ],
};
