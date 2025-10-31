import type { Metadata } from "next";
import localFont from "next/font/local";
import SessionProvider from "./SessionProvider";
import StoreProvider from "./redux";
import { ThemeProvider } from "@/components/theme-provider";
import DeleteDebugger from "./DeleteDebugger";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "DevFlow - Project Management",
  description: "Modern project management tool",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <DeleteDebugger />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <SessionProvider>
            <StoreProvider>
              {children}
            </StoreProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}