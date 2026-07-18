import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en' className='dark'>
      <body className='bg-[#020202] text-white'>
        <div className='flex h-screen overflow-hidden'>
          <aside className='w-72 border-r border-white/5 p-10 flex flex-col'>
            <div className='text-4xl font-black italic text-luxury-gold tracking-tighter mb-20'>AILA</div>
            <nav className='space-y-8'>
              {['Intelligence', 'Legal', 'Business', 'Automation', 'Sites', 'Apps'].map((item) => (
                <a key={item} href={'/' + item.toLowerCase()} className='block text-lg font-medium text-white/40 hover:text-luxury-cyan transition-all duration-300'>
                  {item}
                </a>
              ))}
            </nav>
            <div className='mt-auto p-6 glass-panel'>
              <p className='text-xs font-mono text-white/20 uppercase tracking-widest'>System Status</p>
              <div className='text-luxury-cyan mt-2'>● Neural Core Online</div>
            </div>
          </aside>
          <main className='flex-1 overflow-y-auto p-16'>
            {children}
          </main>
          <div className='fixed bottom-12 right-12'>
            <div className='aila-orb' />
          </div>
        </div>
      </body>
    </html>
  );
}
