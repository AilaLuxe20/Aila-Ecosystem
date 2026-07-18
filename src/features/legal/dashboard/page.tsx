import React from 'react';

export default function AilaLegalDashboard() {
  return (
    <div className='max-w-6xl mx-auto space-y-12'>
      <header className='flex justify-between items-end'>
        <div>
          <h1 className='text-6xl font-black tracking-tight text-white'>Legal Intelligence</h1>
          <p className='text-xl text-white/40 mt-4'>Autonomous Risk Mitigation & Contract Analysis</p>
        </div>
        <button className='px-8 py-4 bg-white/5 hover:bg-luxury-gold hover:text-black transition-all rounded-full font-bold'>
          Initialize Analysis
        </button>
      </header>

      <div className='grid grid-cols-2 gap-8'>
        <div className='glass-panel glow-border h-96 flex flex-col justify-between'>
          <h2 className='text-2xl font-bold'>Real-time Risk Engine</h2>
          <div className='text-8xl font-black text-luxury-cyan'>0.00%</div>
        </div>
        <div className='glass-panel h-96'>
          <h2 className='text-2xl font-bold mb-8'>Knowledge Distribution</h2>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='h-12 w-full bg-white/5 rounded-xl animate-pulse' />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
