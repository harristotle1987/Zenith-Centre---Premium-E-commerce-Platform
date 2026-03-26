import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Instagram, Twitter, Facebook, ArrowRight, Activity } from 'lucide-react';
import { getApiUrl } from '../utils/api';

interface FooterProps {
  user: any;
  onAdminClick: () => void;
}

export function Footer({ user, onAdminClick }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'checking' | 'ok' | 'error'>('checking');

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await fetch(getApiUrl('/api/health'));
        if (res.ok) {
          setHealthStatus('ok');
        } else {
          setHealthStatus('error');
        }
      } catch (err) {
        setHealthStatus('error');
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <footer className="bg-[#1a1a1a] text-white pt-20 pb-12 border-t border-black/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand & Description */}
          <div className="col-span-1 lg:col-span-1">
            <h3 className="text-2xl font-serif font-bold mb-6 tracking-tight">Zenith Centre</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Curating the finest selection of premium goods, from artisanal pantry essentials to exclusive lifestyle products. Elevate your everyday.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d35400] hover:text-white transition-all duration-300">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d35400] hover:text-white transition-all duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-[#d35400] hover:text-white transition-all duration-300">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Explore</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-300 hover:text-[#d35400] text-sm transition-colors">Our Story</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d35400] text-sm transition-colors">Departments</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d35400] text-sm transition-colors">Member Vault</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#d35400] text-sm transition-colors">Journal</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-[#d35400] mt-0.5 flex-shrink-0" />
                <span className="text-gray-300 text-sm leading-relaxed">
                  123 Zenith Avenue<br />
                  Metropolis, NY 10001
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-[#d35400] flex-shrink-0" />
                <span className="text-gray-300 text-sm">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-[#d35400] flex-shrink-0" />
                <span className="text-gray-300 text-sm">hello@zenithcentre.com</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form onSubmit={handleSubscribe} className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#d35400] transition-colors pr-12"
                required
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#d35400] rounded-lg flex items-center justify-center text-white hover:bg-[#e65c00] transition-colors"
                title="Subscribe"
              >
                <ArrowRight size={16} />
              </button>
            </form>
            {subscribed && (
              <p className="text-[#d35400] text-xs mt-3 font-medium animate-in fade-in">
                Thank you for subscribing!
              </p>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-xs tracking-widest uppercase">
              &copy; {new Date().getFullYear()} Zenith Centre. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-2 py-1 rounded-full bg-white/5 border border-white/10">
              <Activity size={10} className={healthStatus === 'ok' ? 'text-emerald-500' : healthStatus === 'error' ? 'text-red-500' : 'text-gray-500'} />
              <span className="text-[9px] uppercase tracking-tighter text-gray-500">
                Backend: {healthStatus === 'ok' ? 'Online' : healthStatus === 'error' ? 'Offline' : 'Checking...'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-500 hover:text-gray-300 text-xs tracking-widest uppercase transition-colors">Privacy</a>
            <a href="#" className="text-gray-500 hover:text-gray-300 text-xs tracking-widest uppercase transition-colors">Terms</a>
            <button 
              onClick={onAdminClick}
              className="text-gray-500 hover:text-[#d35400] text-xs tracking-widest uppercase transition-colors"
            >
              Admin
            </button>
          </div>
        </div>
      </div>
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-[#d35400]/5 blur-[120px]"></div>
        <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-[#d35400]/5 blur-[120px]"></div>
      </div>
    </footer>
  );
}
