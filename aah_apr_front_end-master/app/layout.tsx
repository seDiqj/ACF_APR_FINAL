import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Parent from "@/components/layout/Parent";
import GlobaleListenersRegisterer from "@/providers/GlobalListeners";
import TopProgressBar from "@/components/preloaders/TopProgressBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Action Against Hunger - APR",
  description: "ACTION AGAINST HUNGER",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <TopProgressBar></TopProgressBar>
        <GlobaleListenersRegisterer></GlobaleListenersRegisterer>
        <Parent>{children}</Parent>
        <Toaster />
      </body>
    </html>
  );
}


