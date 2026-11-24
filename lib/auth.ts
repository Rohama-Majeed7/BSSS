import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

// ---------------------------------------------------------------------------
// Local / offline admin fallback credentials
// Set LOCAL_ADMIN_EMAIL and LOCAL_ADMIN_PASSWORD in .env to enable local mode.
// When the Neon database is connected, the DB record takes precedence.
// ---------------------------------------------------------------------------
const LOCAL_ADMIN_EMAIL = (
  process.env.LOCAL_ADMIN_EMAIL || "admin@brightstars.edu.pk"
).toLowerCase();
const LOCAL_ADMIN_PASSWORD = process.env.LOCAL_ADMIN_PASSWORD || "Admin@BSS2026";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours session
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        email: { label: "Email / Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter both email/username and password.");
        }

        const inputIdentifier = credentials.email.trim().toLowerCase();

        // ---- Try Neon DB first (when database is connected) ----
        try {
          const { prisma } = await import("@/lib/prisma");
          const user = await prisma.user.findFirst({
            where: {
              email: {
                equals: inputIdentifier,
                mode: "insensitive",
              },
            },
          });

          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isValid) throw new Error("Invalid email/username or password.");
            return { id: user.id, name: user.name, email: user.email };
          }
          // No DB user found — fall through to local fallback below
        } catch (dbErr: any) {
          // DB unreachable or not yet configured — use local fallback
          const isDbError =
            dbErr?.message?.includes("Can't reach database") ||
            dbErr?.message?.includes("ECONNREFUSED") ||
            dbErr?.message?.includes("connect ETIMEDOUT") ||
            dbErr?.code === "P1001";

          if (!isDbError) {
            // Re-throw real auth errors (wrong password from DB, etc.)
            throw dbErr;
          }
          console.warn("[Auth] Database unreachable — using local fallback credentials.");
        }

        // ---- Local fallback: compare against .env credentials ----
        if (inputIdentifier !== LOCAL_ADMIN_EMAIL) {
          throw new Error("Invalid email/username or password.");
        }
        const isValid = await bcrypt.compare(credentials.password, LOCAL_ADMIN_PASSWORD)
          // bcrypt.compare returns false if the stored value isn't a hash (plain text match)
          .catch(() => false);

        // Also accept plain-text match for convenience during local dev
        const plainMatch = credentials.password === LOCAL_ADMIN_PASSWORD;

        if (!isValid && !plainMatch) {
          throw new Error("Invalid email/username or password.");
        }

        return {
          id: "local-admin",
          name: "Administrator",
          email: LOCAL_ADMIN_EMAIL,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as any).id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-for-bright-stars-sms-2026",
};
