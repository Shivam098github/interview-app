import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — NO database/prisma imports here.
// Used by middleware (Edge Runtime).
export const authConfig = {
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  providers: [],
  callbacks: {
    // Mirror the jwt/session callbacks from auth.ts so the middleware
    // can see custom token fields (role, onboardingComplete) on auth.user.
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role ?? "candidate";
        token.onboardingComplete = user.onboardingComplete ?? false;
      }
      if (trigger === "update" && session) {
        if (session.role) token.role = session.role;
        if (session.onboardingComplete !== undefined)
          token.onboardingComplete = session.onboardingComplete;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as string) ?? "candidate";
        session.user.onboardingComplete =
          (token.onboardingComplete as boolean) ?? false;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }: any) {
      const isLoggedIn = !!auth?.user;
      const isOnboarded = !!(auth?.user as any)?.onboardingComplete;

      const PUBLIC_ROUTES = ["/", "/auth/login", "/auth/register", "/auth/error", "/blog"];
      const isPublic =
        PUBLIC_ROUTES.some((r: string) => nextUrl.pathname.startsWith(r)) ||
        nextUrl.pathname.startsWith("/profile/") ||
        nextUrl.pathname.startsWith("/api/auth");

      if (!isLoggedIn && !isPublic) return false; // redirect to signIn page

      if (isLoggedIn && !isOnboarded && !isPublic && nextUrl.pathname !== "/onboarding") {
        return Response.redirect(new URL("/onboarding", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
