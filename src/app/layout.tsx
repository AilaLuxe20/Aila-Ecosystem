import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

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
    "business automation",
    "website development",
    "web application development",
    "mobile app development",
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
  knowsAbout: [
    "Artificial Intelligence",
    "Web Development",
    "Mobile Application Development",
    "Business Automation",
    "AI Agents",
    "Software Development",
  ],
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Aila Ecosystem",
  url: siteUrl,
  description:
    "Build AI-powered websites, applications, automation systems and intelligent digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className="bg-black text-white antialiased">
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