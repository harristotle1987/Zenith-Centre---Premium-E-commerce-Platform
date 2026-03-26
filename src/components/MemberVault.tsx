import React, { useState } from 'react';
import { Diamond, Star, Gift } from 'lucide-react';
import { getApiUrl } from '../utils/api';

export function MemberVault() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    try {
      const res = await fetch(getApiUrl('/api/newsletter'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className="py-24 relative overflow-hidden border-t border-black/5">
      <div className="absolute inset-0 bg-gradient-to-b from-[#fdfbf7] to-white" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-[#1a1a1a] uppercase tracking-widest mb-4">
            The Chef's Table
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto font-light">
            Unlock a world of unparalleled culinary experiences, personalized recommendations, and exclusive access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: Star, title: "Personalized Menus", desc: "Tailored selections based on your refined palate." },
            { icon: Diamond, title: "Priority Reservations", desc: "First access to our most sought-after tables and seasonal events." },
            { icon: Gift, title: "Bespoke Pairings", desc: "Complimentary sommelier consultations and tastings." }
          ].map((benefit, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white border border-black/5 shadow-sm hover:shadow-md transition-all duration-300">
              <benefit.icon className="w-8 h-8 text-[#d35400] mb-6" />
              <h3 className="text-xl text-[#1a1a1a] font-serif mb-3">{benefit.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>

        <div className="max-w-2xl mx-auto text-center bg-white p-10 rounded-3xl border border-black/5 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d35400] to-transparent opacity-50" />
          <h3 className="text-2xl text-[#1a1a1a] font-serif uppercase tracking-widest mb-4">
            Join the Inner Circle
          </h3>
          <p className="text-gray-500 mb-8 text-sm">
            Subscribe to our newsletter for curated insights and invitations to private tasting events.
          </p>
          <form className="flex flex-col sm:flex-row gap-4" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address" 
              required
              className="flex-1 bg-gray-50 border border-gray-200 rounded-none px-6 py-4 text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#d35400] transition-colors"
            />
            <button 
              type="submit"
              disabled={status === 'loading'}
              className="bg-[#1a1a1a] text-white px-8 py-4 font-semibold tracking-widest uppercase text-sm hover:bg-[#d35400] transition-all duration-300 disabled:opacity-50"
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          {status === 'success' && (
            <p className="text-[#d35400] mt-4 text-sm font-medium">Welcome to the Inner Circle.</p>
          )}
          {status === 'error' && (
            <p className="text-red-500 mt-4 text-sm">An error occurred. Please try again.</p>
          )}
        </div>
      </div>
    </section>
  );
}
