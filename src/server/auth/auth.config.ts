import type { DefaultSession, NextAuthConfig } from "next-auth";
import type { Role } from "@/generated/prisma/client";

// The half of the auth config the proxy can afford. The proxy runs on every
// request, and it only ever *reads* a session — it decodes the JWT cookie and
// checks the role — so it needs the session strategy and the callbacks, and
// nothing that signs anyone in. The Credentials provider, with Prisma and
// bcryptjs behind it, lives in config.ts and is added on top there. Importing
// config.ts from the proxy put both libraries in a bundle that never calls them.
//
// Keep this file free of runtime imports from the database, the hashing library
// or anything that reaches them. `import type` is fine: it is erased.

// `JWT` (from @auth/core/jwt) extends Record<string, unknown>, so `id`/`role`
// on the token are read back via casts below rather than augmenting
// "next-auth/jwt" — that module re-exports from @auth/core's broader type
// surface, which fails to resolve unless optional peers (nodemailer,
// @simplewebauthn/*) are installed.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

export const authConfig = {
  // Auth.js derives `trustHost` from AUTH_URL / AUTH_TRUST_HOST / VERCEL /
  // CF_PAGES / NODE_ENV !== "production" — it never reads NEXTAUTH_URL. Without
  // this, every auth request in a production build throws UntrustedHost; `next
  // dev` hides it because NODE_ENV isn't "production" there. Set explicitly so
  // the app behaves the same self-hosted as it does on Vercel.
  //
  // Deliberately paired with *not* setting AUTH_URL/NEXTAUTH_URL: those route
  // requests through Auth.js's reqWithEnvURL, which rebases req.url onto the env
  // origin and would send next-intl's locale redirects to the wrong host.
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/login",
  },
  // Filled in by config.ts. The proxy never signs anyone in.
  providers: [],
  callbacks: {
    jwt: ({ token, user }) => {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session: ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.role = token.role as Role;
      return session;
    },
  },
} satisfies NextAuthConfig;
