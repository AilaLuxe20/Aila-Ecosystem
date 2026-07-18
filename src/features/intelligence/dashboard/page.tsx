'use client';
import { useState } from 'react';

export default function IntelligenceDashboard() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');

  const sendCommand = async () => {
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    const res = await fetch('/api/intelligence', {
      method: 'POST',
      body: JSON.stringify({ messages: newMessages }),
    });

    // Reader logic will be implemented here for real-time streaming
    console.log('Neural Link Active');
  };

  return (
    <div className='max-w-4xl mx-auto'>
      <header className='mb-12'>
        <h1 className='text-5xl font-black text-white'>Neural Intelligence</h1>
        <p className='text-luxury-cyan mt-2 tracking-widest uppercase text-sm'>System Status: Online</p>
      </header>

      <div className='glass-panel min-h-[500px] flex flex-col justify-end'>
        <div className='flex-1 mb-8 text-white/50 space-y-4'>
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-luxury-gold' : 'text-white'}>
              {m.content}
            </div>
          ))}
        </div>
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
          className='w-full bg-white/5 border border-white/10 rounded-2xl p-6 text-white outline-none focus:border-luxury-gold transition-all'
          placeholder='Execute Aila command...'
        />
      </div>
    </div>
  );
}
