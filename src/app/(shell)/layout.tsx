import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EcosystemSwitcher from "@/components/navigation/EcosystemSwitcher";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-20">{children}</div>
      <EcosystemSwitcher />
      <Footer />
    </>
  );
}
