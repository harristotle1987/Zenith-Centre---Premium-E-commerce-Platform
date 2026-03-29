import React from 'react';
import { Currency } from '../utils/currency';

interface CurrencyToggleProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  className?: string;
}

export function CurrencyToggle({ currency, onCurrencyChange, className = '' }: CurrencyToggleProps) {
  return (
    <div className={`flex items-center bg-black/5 rounded-full p-1 ${className}`}>
      <button 
        onClick={() => onCurrencyChange('NGN')}
        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${currency === 'NGN' ? 'bg-[#d35400] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
      >
        NGN
      </button>
      <button 
        onClick={() => onCurrencyChange('USD')}
        className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${currency === 'USD' ? 'bg-[#d35400] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
      >
        USD
      </button>
    </div>
  );
}
