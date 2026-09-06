import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { cookies } from "next/headers";
import Parent from "@/components/layout/Parent";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { PermissionProvider } from "@/contexts/PermissionContext";
import { EventProvider } from "@/contexts/EventContext";
import { Lato } from "next/font/google";
import TopProgressBar from "@/components/preloaders/TopProgressBar";
import { NotificationProvider } from "@/contexts/NotificationContext";
import "react-datepicker/dist/react-datepicker.css";

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

const lato = Lato({ subsets: ["latin"], weight: ["300", "400", "700", "900"] });

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <>
        <Parent>
          <NotificationProvider>
            <PermissionProvider>
              <EventProvider>
                <ThemeProvider
                  attribute="class"
                  defaultTheme="system"
                  enableSystem
                  disableTransitionOnChange
                >
                  <div className="flex flex-row">
                    <TopProgressBar></TopProgressBar>
                    <AppSidebar />
                    <div className="flex-1">{children}</div>
                    <Toaster />
                  </div>
                </ThemeProvider>
              </EventProvider>
            </PermissionProvider>
          </NotificationProvider>
        </Parent>
      </>
    </SidebarProvider>
  );
}
