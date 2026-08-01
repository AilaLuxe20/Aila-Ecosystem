import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
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
    "Mobile app development",
    "Next.js",
  ],

  creator: "Aila Ecosystem",
  publisher: "Aila Ecosystem",

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: siteUrl,
    title: "Aila Ecosystem | Build the Future with AI",
    description:
      "AI-powered websites, applications, automation systems and intelligent digital experiences.",
    siteName: "Aila Ecosystem",
  },

  twitter: {
    card: "summary_large_image",
    title: "Aila Ecosystem | Build the Future with AI",
    description:
      "AI-powered websites, applications, automation systems and intelligent digital experiences.",
  },
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
    <ClerkProvider>
      <html
        lang="en"
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable}`}
      >
        <body className="min-h-screen bg-black text-white antialiased">
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
        </body>
      </html>
    </ClerkProvider>
  );
}