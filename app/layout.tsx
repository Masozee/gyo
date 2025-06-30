import type { Metadata } from "next";
import { Fira_Code, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"
import { ConditionalNavbar } from "@/components/conditional-navbar"
import { ConditionalFooter } from "@/components/conditional-footer"
import { FontProvider } from "@/components/font-provider"
import { AnalyticsProvider } from "@/lib/analytics-client"
import { StickyGeminiChat } from "@/components/sticky-gemini-chat"

const firaCode = Fira_Code({
  variable: "--font-fira-code",
  subsets: ["latin"],
});

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Developer Portfolio",
  description: "Full-stack developer specializing in Django, Next.js, TypeScript, and UI/UX design",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;600;700&family=Poppins:wght@400;500;600;700&family=Nunito:wght@400;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={`${firaCode.variable} ${geist.variable} ${geistMono.variable} font-mono antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
          <AnalyticsProvider>
            <FontProvider />
            <ConditionalNavbar />
            <main className="min-h-screen">
              {children}
            </main>
            <ConditionalFooter />
            <StickyGeminiChat />
            <Toaster richColors position="top-right" />
          </AnalyticsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
