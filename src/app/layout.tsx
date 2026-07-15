import type { Metadata } from "next";
import "./globals.css";

import AilaShell from "./components/os/shell/AilaShell";

export const metadata: Metadata = {
  title: "Aila Ecosystem",
  description:
    "Premium AI software, automation and enterprise solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased overflow-x-hidden bg-black text-white">
        <AilaShell>
          {children}
        </AilaShell>
      </body>
    </html>
  );
}