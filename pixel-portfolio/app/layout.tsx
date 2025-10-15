import type { Metadata } from "next";
import { Geist, Geist_Mono, Press_Start_2P } from "next/font/google";
import { MainNavbar, MainFooter, WelcomeScreenProvider } from "@/components/layout";
import { ScrollProgress, ArcadeButton } from "@/components/ui";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

export const metadata: Metadata = {
  title: {
    default: "Josh's Portfolio",
    template: "%s | Josh's Portfolio"
  },
  description: "A pixel art themed developer portfolio showcasing projects, skills, and experience in modern web development",
  keywords: [
    "developer",
    "portfolio",
    "pixel art",
    "web development",
    "frontend",
    "backend",
    "full stack",
    "TypeScript",
    "React",
    "Next.js"
  ],
  authors: [{ name: "Joshua Mathers" }],
  creator: "Joshua Mathers",
  publisher: "Josh's Portfolio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pixel-portfolio.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://pixel-portfolio.vercel.app",
    title: "Josh's Portfolio - Developer Showcase",
    description: "A pixel art themed developer portfolio showcasing projects, skills, and experience",
    siteName: "Josh's Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Josh's Portfolio - Developer Showcase",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Josh's Portfolio - Developer Showcase",
    description: "A pixel art themed developer portfolio showcasing projects, skills, and experience",
    images: ["/og-image.png"],
    creator: "@pixeldev",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth dark" data-theme="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#00ff41" />
        <meta name="msapplication-TileColor" content="#0d1117" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${pixelFont.variable} antialiased min-h-screen flex flex-col`}
      >
        <WelcomeScreenProvider>
          {/* Scroll Progress Indicator */}
          <ScrollProgress />
          
          {/* Navigation */}
          <MainNavbar />
          
          {/* Main Content */}
          <main className="flex-1 pt-16" id="main-content">
            {children}
          </main>
          
          {/* Footer */}
          <MainFooter />
          
          {/* Floating Arcade Button */}
          <ArcadeButton />
          
          {/* Skip to main content link for accessibility */}
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-pixel-primary text-pixel-dark font-pixel text-sm px-4 py-2 z-50"
          >
            Skip to main content
          </a>
        </WelcomeScreenProvider>
      </body>
    </html>
  );
}
