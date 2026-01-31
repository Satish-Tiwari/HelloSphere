import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TanstackProvider } from "@/providers/TanstackProvider";
import { NextAuthProvider } from "@/providers/NextAuthProvider";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ToastProvider } from "@/providers/ToastProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acme Dashboard",
  description: "SaaS daashboard talking to two microservices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
          <ReduxProvider>
            <NextAuthProvider>
              <TanstackProvider>
                {children}
                <ToastProvider />
              </TanstackProvider>
            </NextAuthProvider>
          </ReduxProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
