import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import { PwaProvider } from "@/components/pwa/PwaProvider";
import {
  CLERK_FAPI_PROXY_PATH,
  shouldUseClerkFrontendApiProxy,
} from "@/lib/auth/clerk-fapi-proxy";
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

  applicationName: "Aila",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aila",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },

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
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#030303" },
    { media: "(prefers-color-scheme: light)", color: "#030303" },
  ],
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
      <body className="flex min-h-full flex-col bg-black text-white antialiased">
        <ClerkProvider
          signInUrl="/sign-in"
          signUpUrl="/sign-up"
          signInFallbackRedirectUrl="/dashboard"
          signUpFallbackRedirectUrl="/dashboard"
          afterSignOutUrl="/"
          allowedRedirectOrigins={[
            "https://ailaluxe.com",
            "https://www.ailaluxe.com",
          ]}
          proxyUrl={
            shouldUseClerkFrontendApiProxy() ? CLERK_FAPI_PROXY_PATH : undefined
          }
          appearance={{
            variables: {
              colorBackground: "#111111",
              colorPrimary: "#ffffff",
              colorNeutral: "#e5e5e5",
              colorDanger: "#f87171",
              colorSuccess: "#4ade80",
              colorInput: "#1a1a1a",
              borderRadius: "0.85rem",
            },
          }}
        >
          <PwaProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
            >
              Skip to main content
            </a>
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

            <div id="main-content">{children}</div>

            <Analytics />
            <SpeedInsights />
          </PwaProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
