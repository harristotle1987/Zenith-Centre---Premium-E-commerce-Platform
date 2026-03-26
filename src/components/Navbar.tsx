import { Search, ShoppingBag, Menu } from 'lucide-react';
import { useState } from 'react';
import { Currency } from '../utils/currency';
import { CurrencyMenu } from './navbar/CurrencyMenu';
import { UserMenu } from './navbar/UserMenu';
import { HamburgerMenu } from './navbar/HamburgerMenu';

interface NavbarProps {
  departments: string[];
  activeDepartment: string;
  setActiveDepartment: (dept: string) => void;
  user: any;
  onLogout: () => void;
  onLoginClick: () => void;
  onProfileClick: (tab: 'info' | 'orders' | 'admin') => void;
  cartCount: number;
  onCartClick: () => void;
  currency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export function Navbar({ 
  departments, 
  activeDepartment, 
  setActiveDepartment,
  user,
  onLogout,
  onLoginClick,
  onProfileClick,
  cartCount,
  onCartClick,
  currency,
  onCurrencyChange,
  searchQuery,
  setSearchQuery
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCurrencyMenuOpen, setIsCurrencyMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#fdfbf7]/90 backdrop-blur-md border-b border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-[#d35400] transition-colors"
                onClick={() => setIsMenuOpen(true)}
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-0 sm:gap-2 group cursor-pointer">
                <span className="text-lg sm:text-2xl font-serif font-black tracking-tighter text-[#1a1a1a] uppercase leading-none group-hover:text-[#d35400] transition-colors">Zenith</span>
                <span className="text-[8px] sm:text-[10px] font-bold tracking-[0.2em] text-[#d35400] uppercase leading-none sm:mt-1">Centre</span>
              </div>
            </div>
            
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-black/10 rounded-full leading-5 bg-white text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400] sm:text-sm transition-all duration-300 shadow-sm"
                  placeholder="Search Zenith Centre..."
                />
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <button 
                className="lg:hidden p-2 text-gray-600 hover:text-[#d35400] transition-colors"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
              >
                <Search className="w-5 h-5" />
              </button>
              <CurrencyMenu 
                currency={currency} 
                onCurrencyChange={onCurrencyChange} 
                isOpen={isCurrencyMenuOpen} 
                setIsOpen={setIsCurrencyMenuOpen} 
              />
              <UserMenu 
                user={user} 
                onLogout={onLogout} 
                onLoginClick={onLoginClick} 
                onProfileClick={onProfileClick} 
                isOpen={isUserMenuOpen} 
                setIsOpen={setIsUserMenuOpen} 
              />
              
              <button 
                onClick={onCartClick}
                className="text-gray-600 hover:text-[#d35400] transition-colors relative"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#d35400] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          {isSearchOpen && (
            <div className="lg:hidden pb-4">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-black/10 rounded-full leading-5 bg-white text-[#1a1a1a] placeholder-gray-400 focus:outline-none focus:border-[#d35400] focus:ring-1 focus:ring-[#d35400] sm:text-sm transition-all duration-300 shadow-sm"
                  placeholder="Search Zenith Centre..."
                />
              </div>
            </div>
          )}
        </div>
      </nav>

      <HamburgerMenu 
        isOpen={isMenuOpen} 
        setIsOpen={setIsMenuOpen} 
        departments={departments} 
        activeDepartment={activeDepartment} 
        setActiveDepartment={setActiveDepartment} 
      />
    </>
  );
}
