import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";

export const metadata: Metadata = {
  title: "Bright Stars Science School & Academy (EMIS: 323320474) — School Management System",
  description: "Complete School ERP covering all 14 classes, fees, results, ID cards, SLC and payroll.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-slate-100 text-slate-800 antialiased">
        {/* Dedicated A4 Print Stage */}
        <div id="print-stage" className="hidden"></div>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
