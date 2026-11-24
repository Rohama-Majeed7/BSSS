import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "development-secret-key-for-bright-stars-sms-2026",
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - /login (Admin Login page)
     * - /api/auth (NextAuth API routes)
     * - /_next/static (static files)
     * - /_next/image (image optimization files)
     * - /favicon.ico, /manifest.json, /sw.js, /offline.html, /icons (PWA assets)
     */
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|sw.js|offline.html|icons|login).*)",
  ],
};
