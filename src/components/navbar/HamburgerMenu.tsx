import { X } from 'lucide-react';

interface HamburgerMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  departments: string[];
  activeDepartment: string;
  setActiveDepartment: (dept: string) => void;
}

export function HamburgerMenu({ isOpen, setIsOpen, departments, activeDepartment, setActiveDepartment }: HamburgerMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex">
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />
      <div className="relative flex w-full max-w-xs flex-col bg-[#fdfbf7] shadow-2xl h-full animate-in slide-in-from-left duration-300">
        <div className="flex items-center justify-between px-6 py-6 border-b border-black/5">
          <span className="text-xl font-serif tracking-widest text-[#1a1a1a] uppercase">Menu</span>
          <button 
            className="p-2 text-gray-500 hover:text-[#d35400] transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 px-4">
          <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Departments</h3>
          <div className="flex flex-col gap-1">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => {
                  setActiveDepartment(dept);
                  setIsOpen(false);
                }}
                className={`px-4 py-3 rounded-xl text-sm font-medium tracking-wider uppercase transition-all duration-300 text-left w-full ${
                  activeDepartment === dept
                    ? 'bg-[#d35400]/10 text-[#d35400]'
                    : 'bg-transparent text-gray-600 hover:bg-black/5 hover:text-[#1a1a1a]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
