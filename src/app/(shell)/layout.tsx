import type { ReactNode } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EcosystemSwitcher from "@/components/navigation/EcosystemSwitcher";

export default function ShellLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-[calc(4rem+env(safe-area-inset-top,0px))] sm:pt-[calc(5rem+env(safe-area-inset-top,0px))]">
        {children}
      </div>
      <EcosystemSwitcher />
      <Footer />
    </>
  );
}
