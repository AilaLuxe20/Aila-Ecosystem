import type { Metadata, Viewport } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const siteUrl = "https://ailaluxe.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Aila Ecosystem | AI Software Company",
    template: "%s | Aila Ecosystem",
  },

  description:
    "Aila Ecosystem builds AI-powered websites, web applications, mobile apps, intelligent automation systems and premium digital experiences.",

  applicationName: "Aila Ecosystem",

  keywords: [
    "Aila Ecosystem",
    "AI software company",
    "AI development",
    "AI solutions",
    "AI agents",
    "Business automation",
    "Website development",
    "web application development",
    "Mobile app development",
    "Next.js development",
    "software company",
    "digital transformation",
  ],

  authors: [
    {
      name: "Aila Ecosystem",
      url: siteUrl,
    },
  ],

  creator: "Aila Ecosystem",
  publisher: "Aila Ecosystem",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Aila Ecosystem",
    title: "Aila Ecosystem | Build the Future with AI",
    description:
      "AI-powered websites, applications, automation systems and intelligent digital experiences for modern businesses.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Aila Ecosystem | Build the Future with AI",
    description:
      "AI-powered websites, applications, automation systems and intelligent digital experiences.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  category: "technology",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030303",
  colorScheme: "dark",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Aila Ecosystem",
  url: siteUrl,
  description:
    "An intelligent software company building AI-powered websites, applications, automation systems and digital experiences.",
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aila Ecosystem",
  url: siteUrl,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-black pt-16 text-white antialiased">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          afterSignOutUrl="/"
        >
          <header className="fixed inset-x-0 top-0 z-[60] flex h-16 items-center justify-end gap-4 border-b border-white/10 bg-black px-4">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="h-10 cursor-pointer rounded-full border border-white/10 bg-white/5 px-4 text-sm font-medium text-neutral-200 transition hover:bg-white/10 sm:h-12 sm:px-5 sm:text-base"
                >
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="h-10 cursor-pointer rounded-full bg-white px-4 text-sm font-medium text-black transition hover:scale-105 sm:h-12 sm:px-5 sm:text-base"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </Show>
          </header>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationSchema),
            }}
          />

          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(websiteSchema),
            }}
          />

          {children}

          <Analytics />
          <SpeedInsights />
        </ClerkProvider>
      </body>
    </html>
  );
}
