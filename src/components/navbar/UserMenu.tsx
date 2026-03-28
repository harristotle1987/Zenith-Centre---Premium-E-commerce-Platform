import { User } from 'lucide-react';

interface UserMenuProps {
  user: any;
  onLogout: () => void;
  onLoginClick: () => void;
  onProfileClick: (tab: 'info' | 'orders' | 'admin') => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export function UserMenu({ user, onLogout, onLoginClick, onProfileClick, isOpen, setIsOpen }: UserMenuProps) {
  return (
    <div className="relative">
      <button 
        onClick={() => user ? setIsOpen(!isOpen) : onLoginClick()}
        className="text-gray-600 hover:text-[#d35400] transition-colors flex items-center gap-2"
      >
        <User className="w-5 h-5" />
        {user && <span className="hidden sm:inline text-xs font-bold uppercase tracking-widest">{user.name.split(' ')[0]}</span>}
      </button>
      
      {isOpen && user && (
        <div className="absolute right-0 mt-4 w-48 bg-white rounded-2xl shadow-2xl border border-black/5 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-black/5 mb-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Account</p>
            <p className="text-sm font-serif font-bold text-[#1a1a1a] truncate">{user.name}</p>
          </div>
          <button 
            onClick={() => {
              onProfileClick('info');
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm font-bold text-[#d35400] hover:bg-[#d35400]/5 rounded-xl transition-colors"
          >
            My Profile
          </button>
          {(user.role === 'super_admin' || user.role === 'staff' || user.role === 'accountant' || user.role === 'secretary' || user.role === 'manager' || user.role === 'counter_staff') && (
            <button 
              onClick={() => {
                onProfileClick('admin');
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 hover:bg-black/5 rounded-xl transition-colors"
            >
              Admin Dashboard
            </button>
          )}
          <button 
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors mt-1 pt-2 border-t border-black/5"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
