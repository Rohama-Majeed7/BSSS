import type { Metadata, Viewport } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import PwaProvider from "@/components/providers/PwaProvider";

export const metadata: Metadata = {
  title: "Bright Stars Science School & Academy (EMIS: 323320474) — School Management System",
  description: "Complete School ERP covering all 14 classes, fees, results, ID cards, SLC and payroll.",
  applicationName: "Bright Stars SMS",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bright Stars SMS",
  },
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f2347",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="bg-slate-100 text-slate-800 antialiased" suppressHydrationWarning>
        {/* Dedicated A4 Print Stage */}
        <div id="print-stage" className="hidden"></div>
        <AuthProvider>
          <PwaProvider>{children}</PwaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
