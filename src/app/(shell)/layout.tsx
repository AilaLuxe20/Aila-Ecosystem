import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EcosystemSwitcher from "@/components/navigation/EcosystemSwitcher";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <main className="pt-20">{children}</main>
      <EcosystemSwitcher />
      <Footer />
    </>
  );
}
