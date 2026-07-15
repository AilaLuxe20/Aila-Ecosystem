"use client";

import Container from "./Container";

export default function HeroSection({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen overflow-hidden py-32">
      <Container>
        {children}
      </Container>
    </section>
  );
}