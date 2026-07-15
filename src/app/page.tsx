import {
  Hero,
  TrustedBy,
  Ecosystem,
  Features,
  Process,
  CTA,
} from "./components/home";

import Stats from "./components/home/Stats";

export default function HomePage() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050816] text-white">

      <Hero />

      <TrustedBy />

      <Stats />

      <Ecosystem />

      <Features />

      <Process />

      <CTA />

    </main>
  );
}