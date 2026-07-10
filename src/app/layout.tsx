import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "./components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Aila Ecosystem",
    template: "%s | Aila Ecosystem",
  },

  description:
    "AI-powered websites, mobile apps, AI solutions and intelligent digital experiences built by Aila.",

  keywords: [
    "AI",
    "Artificial Intelligence",
    "Website Development",
    "Mobile App Development",
    "Next.js",
    "React",
    "Software Company",
    "AI Chatbot",
    "Business Automation",
    "Aila",
  ],

  authors: [
    {
      name: "Aila Ecosystem",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-black text-white antialiased">
        <Navbar />

        {children}
        <Analytics />
      </body>
    </html>
  );
}