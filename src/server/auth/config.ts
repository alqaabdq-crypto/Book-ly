import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import {
  consumeRateLimit,
  LIMITS,
  resetRateLimit,
} from "@/server/security/rate-limit";
import type { Role } from "@/generated/prisma/client";

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

export const { handlers, auth, signIn, signOut } = NextAuth({
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
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        // Throttled before the hash comparison, and keyed by the email being
        // attacked rather than by the caller: an attacker rotates IPs freely,
        // but every attempt against one account has to land on that account's
        // counter. The refusal is the same `null` a wrong password returns, so
        // this never tells a caller which of the two happened.
        const limitKey = `login:${email.toLowerCase()}`;
        const attempt = await consumeRateLimit({ key: limitKey, ...LIMITS.login });

        if (!attempt.allowed) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        // The window counts failures, so proving you own the account clears it.
        // Otherwise a person signing in on three devices spends the same budget
        // an attacker does.
        await resetRateLimit(limitKey);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
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
});
