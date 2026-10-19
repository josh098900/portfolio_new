import type { Metadata, Viewport } from "next";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import "@fontsource/geist/latin-700.css";
import "./globals.css";
import "./wallpapers.css";
import { defaultShareImage, siteName, siteUrl } from "@/lib/site";
import { preflightScript } from "@/os/preflight";

const title = "Josh, software engineering student";
const description = "I'm Josh, a third-year software engineering student. Explore my projects, see what I'm building, or ask my assistant.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: title, template: "%s · Josh" },
  description,
  openGraph: { type: "website", siteName, title, description, images: [defaultShareImage] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#a9c0e6" },
    { media: "(prefers-color-scheme: dark)", color: "#05070f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en-GB" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: preflightScript }} /></head>
    <body>
      <a href="#main" className="skip-link">Skip to content</a>
      {children}
    </body>
  </html>;
}
