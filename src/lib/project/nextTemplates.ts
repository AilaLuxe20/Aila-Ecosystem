export const nextTemplates = {
  page: `export default function Home() {
  return <main>Hello Aila</main>;
}`,

  layout: `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`,

  navbar: `export default function Navbar() {
  return null;
}`,

  hero: `export default function Hero() {
  return null;
}`,

  footer: `export default function Footer() {
  return null;
}`,
};