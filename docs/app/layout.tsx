import "./global.css";
import Script from "next/script";
import { RootProvider } from "fumadocs-ui/provider";
import {
  Geist_Mono as createMono,
  Geist as createSans,
} from "next/font/google";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Toaster } from "../components/ui/sonner";
import { TooltipProvider } from "../components/ui/tooltip";
import { ThemeProvider } from "./providers/theme";

const sans = createSans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: "variable",
});

const mono = createMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: "variable",
});

type LayoutProps = {
  readonly children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => (
  <html
    className={cn(
      "touch-manipulation scroll-smooth font-sans antialiased",
      sans.variable,
      mono.variable
    )}
    lang="en"
    suppressHydrationWarning
  >
    <body className="flex min-h-screen flex-col">
      <ThemeProvider>
        <RootProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </RootProvider>
      </ThemeProvider>
      {process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN && (
        <Script
          data-cf-beacon={JSON.stringify({
            token: process.env.NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN,
          })}
          defer
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
        />
      )}
      <Toaster />
    </body>
  </html>
);

export default Layout;
