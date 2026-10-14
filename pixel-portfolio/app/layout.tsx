import type { Metadata } from "next";
import "@fontsource/geist/latin-400.css";
import "@fontsource/geist/latin-500.css";
import "@fontsource/geist/latin-600.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: { default: "Josh — Software Engineering Student", template: "%s — Josh" },
  description: "I'm Josh, a third-year software engineering student. Explore my web apps, multiplayer experiments, and database work. Currently building Curio for solo travellers.",
};

const themeScript = `(function(){var theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';try{var saved=localStorage.getItem('josh-theme');if(saved==='light'||saved==='dark')theme=saved;}catch(e){}document.documentElement.dataset.theme=theme;})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en-GB" data-scroll-behavior="smooth" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head>
    <body><a href="#main" className="skip-link">Skip to content</a><SiteHeader />{children}<SiteFooter /></body>
  </html>;
}
