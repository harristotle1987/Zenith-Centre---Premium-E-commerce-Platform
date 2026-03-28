import { X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface HamburgerMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  departments: string[];
  activeDepartment: string;
  setActiveDepartment: (dept: string) => void;
}

export function HamburgerMenu({ isOpen, setIsOpen, departments, activeDepartment, setActiveDepartment }: HamburgerMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <motion.div 
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative flex w-full max-w-sm flex-col bg-[#fdfbf7] shadow-2xl h-full"
          >
            <div className="flex items-center justify-between px-8 py-8 border-b border-black/5">
              <span className="text-2xl font-serif tracking-widest text-[#1a1a1a] uppercase">Menu</span>
              <button 
                className="p-2 text-gray-500 hover:text-[#d35400] transition-colors rounded-full hover:bg-black/5"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-8 px-6 no-scrollbar">
              <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Categories</h3>
              <div className="flex flex-col gap-2">
                {departments.map((dept, index) => (
                  <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={dept}
                    onClick={() => {
                      setActiveDepartment(dept);
                      setIsOpen(false);
                      window.scrollTo({ top: document.getElementById('menu-section')?.offsetTop || 800, behavior: 'smooth' });
                    }}
                    className={`group flex items-center justify-between px-4 py-4 rounded-2xl text-base font-medium tracking-wider uppercase transition-all duration-300 w-full ${
                      activeDepartment === dept
                        ? 'bg-[#d35400] text-white shadow-lg shadow-[#d35400]/20'
                        : 'bg-white border border-black/5 text-gray-600 hover:border-[#d35400]/30 hover:text-[#d35400] shadow-sm'
                    }`}
                  >
                    <span>{dept}</span>
                    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${activeDepartment === dept ? 'translate-x-1' : 'group-hover:translate-x-1'}`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
