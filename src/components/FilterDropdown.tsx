import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  value: string | number;
  options: (string | number)[];
  onChange: (value: any) => void;
  className?: string;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({ label, value, options, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative flex items-center gap-2 ${className}`} ref={dropdownRef}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}:</span>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-full px-5 py-2 text-[11px] font-bold uppercase tracking-widest text-white hover:bg-black transition-all shadow-lg active:scale-95 group"
      >
        <span className="group-hover:text-[#d35400] transition-colors">{value}</span>
        <ChevronDown size={14} className={`text-[#d35400] transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] md:hidden"
              onClick={() => setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full right-0 mt-2 z-[70] min-w-[200px] md:min-w-[240px] bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl py-2 overflow-hidden"
            >
              <div className="max-h-80 overflow-y-auto custom-scrollbar px-2">
                {options.map((option) => (
                  <button
                    key={option}
                    onClick={() => {
                      onChange(option);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-[0.2em] transition-all mb-1 ${
                      String(value) === String(option)
                        ? 'bg-[#d35400] text-white shadow-lg shadow-[#d35400]/20' 
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{option}</span>
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                      String(value) === String(option)
                        ? 'border-white bg-white/20' 
                        : 'border-white/10'
                    }`}>
                      {String(value) === String(option) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
