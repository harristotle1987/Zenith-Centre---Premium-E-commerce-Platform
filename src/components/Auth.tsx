import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import { Mail, Lock, User, Phone, ArrowRight, Eye, EyeOff, MapPin, X } from 'lucide-react';
import { getApiUrl } from '../utils/api';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: any, token: string) => void;
  onClose?: () => void;
  initialMode?: 'login' | 'signup';
}

export function Auth({ onLogin, onClose, initialMode = 'login' }: AuthProps) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsLogin(initialMode === 'login');
  }, [initialMode]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        onLogin(event.data.user, event.data.token);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onLogin]);

  const handleGoogleLogin = async () => {
    const loadingToast = toast.loading('Initializing Google Login...');
    try {
      const res = await fetch(getApiUrl('/api/auth/google/url'));
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to get Google Auth URL');
      }
      
      window.open(data.url, 'google_oauth', 'width=600,height=700');
    } catch (err: any) {
      console.error('Google Login error:', err);
      setError(err.message || 'Google Login failed to initialize. Please check your GOOGLE_CLIENT_ID and ensure you are on the correct App URL.');
      toast.error('Google Login failed to initialize');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const loadingToast = toast.loading(isLogin ? 'Signing in...' : 'Creating account...');

    const endpoint = isLogin ? getApiUrl('/api/auth/login') : getApiUrl('/api/auth/register');
    const body = isLogin 
      ? { email, password } 
      : { email, password, name, contact_info: contact, address };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          toast.success('Login successful!');
          onLogin(data.user, data.token);
        } else {
          setIsLogin(true);
          setEmail(data.email);
          toast.success('Registration successful! Please login.');
        }
      } else {
        setError(data.error || 'Authentication failed');
        toast.error(data.error || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(`Connection error: ${err.message || 'Please ensure the backend is reachable.'}`);
      toast.error('Connection error');
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white p-8 rounded-3xl shadow-2xl border border-black/5 w-full max-w-md relative my-8"
      >
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-[#d35400] transition-colors p-2 hover:bg-black/5 rounded-full"
          >
            <X size={20} />
          </button>
        )}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-[#1a1a1a] mb-2">
            {isLogin ? 'Welcome Back' : 'Join Zenith'}
          </h1>
          <p className="text-gray-500 text-sm">
            {isLogin ? 'Enter your credentials to access your account' : 'Create an account to start ordering'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors"
                    placeholder="John Doe"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="tel"
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors"
                    placeholder="+1 234 567 890"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Address / Closest Bus Stop</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors"
                    placeholder="123 Main St or Nearest Bus Stop"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors"
                placeholder="email@example.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#d35400] transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d35400] hover:bg-[#e67e22] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#d35400]/20 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            {!loading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-gray-500 hover:text-[#d35400] transition-colors"
          >
            {isLogin ? (
              <>Don't have an account? <span className="font-bold text-[#d35400]">Sign Up</span></>
            ) : (
              <>Already have an account? <span className="font-bold text-[#d35400]">Sign In</span></>
            )}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
          <p className="text-gray-500 text-sm mb-4">Or continue with</p>
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Google Account
          </button>
        </div>

      </motion.div>
    </div>
  );
}
