import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import {
  consumeRateLimit,
  LIMITS,
  resetRateLimit,
} from "@/server/security/rate-limit";
import { authConfig } from "@/server/auth/auth.config";

// The full auth config: the shared half from auth.config.ts plus the one thing
// that needs the database — checking a password. Everything except the proxy
// imports from here; the proxy builds its own `auth` from auth.config.ts alone,
// so Prisma and bcryptjs stay out of the bundle that runs on every request.
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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
});
