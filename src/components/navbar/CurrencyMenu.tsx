import { Globe } from 'lucide-react';
import { Currency } from '../../utils/currency';

interface CurrencyMenuProps {
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function CurrencyMenu({ currency, onCurrencyChange, isOpen, setIsOpen }: CurrencyMenuProps) {
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-gray-600 hover:text-[#d35400] transition-colors flex items-center gap-1 sm:gap-2"
      >
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">{currency}</span>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-4 w-32 bg-white rounded-2xl shadow-2xl border border-black/5 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <button 
            onClick={() => {
              onCurrencyChange('NGN');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-colors ${currency === 'NGN' ? 'bg-[#d35400] text-white' : 'text-gray-700 hover:bg-black/5'}`}
          >
            Naira (NGN)
          </button>
          <button 
            onClick={() => {
              onCurrencyChange('USD');
              setIsOpen(false);
            }}
            className={`w-full text-left px-4 py-2 text-xs font-bold rounded-xl transition-colors ${currency === 'USD' ? 'bg-[#d35400] text-white' : 'text-gray-700 hover:bg-black/5'}`}
          >
            Dollars (USD)
          </button>
        </div>
      )}
    </div>
  );
}
