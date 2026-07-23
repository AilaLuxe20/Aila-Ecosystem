'use client';

import './globals.css';
import Link from 'next/link';
import { SessionProvider } from 'next-auth/react';
import { OrbProvider } from '@/core/OrbContext';
import { PlatformProvider } from '@/core/platform/providers/PlatformProvider';
import { products } from '@/config/products';
import AIOrb from '@/components/AIOrb';
import ProductLauncher from '@/components/platform/ProductLauncher';
import GlobalHotkeys from '@/components/platform/GlobalHotkeys';
import { Toaster } from 'sonner';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#020202] text-white">
        <SessionProvider>
          <PlatformProvider>
            <OrbProvider>
              <div className="flex h-screen overflow-hidden">
                <aside className="w-72 border-r border-white/5 bg-black/30 backdrop-blur-xl p-10 flex flex-col">
                  <div className="mb-20 text-4xl font-black italic tracking-tighter text-luxury-gold">
                    AILA
                  </div>

                  <nav className="space-y-8">
                    {products
                      .filter((product) => product.status === 'live')
                      .map((product) => (
                        <Link
                          key={product.id}
                          href={product.href}
                          className="block text-lg font-medium text-white/40 transition-all duration-300 hover:text-luxury-cyan"
                        >
                          {product.name.replace('Aila ', '')}
                        </Link>
                      ))}
                  </nav>

                  <div className="glass-panel mt-auto p-6">
                    <p className="text-xs font-mono uppercase tracking-widest text-white/20">
                      System Status
                    </p>

                    <div className="mt-2 text-luxury-cyan">
                      ? Neural Core Online
                    </div>

                    <div className="mt-1 text-xs text-white/40">
                      Platform Core Active
                    </div>
                  </div>
                </aside>

                <main className="flex-1 overflow-y-auto p-16">
                  {children}
                </main>

                <AIOrb />
                <ProductLauncher />
                <GlobalHotkeys />
              </div>

              <Toaster
                position="top-right"
                richColors
                theme="dark"
                closeButton
                duration={4000}
              />
            </OrbProvider>
          </PlatformProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
