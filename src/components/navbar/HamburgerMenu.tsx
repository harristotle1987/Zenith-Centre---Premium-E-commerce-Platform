import { X, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo } from 'react';

interface HamburgerMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  departments: string[];
  activeDepartment: string;
  setActiveDepartment: (dept: string) => void;
}

export function HamburgerMenu({ isOpen, setIsOpen, departments, activeDepartment, setActiveDepartment }: HamburgerMenuProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const groupedDepartments = useMemo(() => {
    const groups: Record<string, string[]> = {};
    departments.forEach(dept => {
      if (dept === 'All') return;
      const [parent, child] = dept.split(':').map(s => s.trim());
      if (child) {
        if (!groups[parent]) groups[parent] = [];
        groups[parent].push(dept);
      } else {
        if (!groups[parent]) groups[parent] = [];
        // If it's a top-level category without children, we still want it in the list
        // but maybe we don't add it to the groups if it's already there?
        // Actually, let's just keep it simple.
      }
    });
    return groups;
  }, [departments]);

  const topLevelCategories = useMemo(() => {
    const categories = new Set<string>();
    departments.forEach(dept => {
      if (dept === 'All') return;
      const [parent] = dept.split(':').map(s => s.trim());
      categories.add(parent);
    });
    return Array.from(categories);
  }, [departments]);

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
                <motion.button
                  onClick={() => {
                    setActiveDepartment('All');
                    setIsOpen(false);
                    window.scrollTo({ top: document.getElementById('menu-section')?.offsetTop || 800, behavior: 'smooth' });
                  }}
                  className={`group flex items-center justify-between px-4 py-4 rounded-2xl text-base font-medium tracking-wider uppercase transition-all duration-300 w-full ${
                    activeDepartment === 'All'
                      ? 'bg-[#d35400] text-white shadow-lg shadow-[#d35400]/20'
                      : 'bg-white border border-black/5 text-gray-600 hover:border-[#d35400]/30 hover:text-[#d35400] shadow-sm'
                  }`}
                >
                  <span>All Products</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>

                {topLevelCategories.map((category, index) => {
                  const subDepts = groupedDepartments[category] || [];
                  const hasSubDepts = subDepts.length > 0 && subDepts.some(d => d.includes(':'));
                  const isExpanded = expandedCategory === category;

                  return (
                    <div key={category} className="flex flex-col gap-1">
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => {
                          if (hasSubDepts) {
                            setExpandedCategory(isExpanded ? null : category);
                          } else {
                            setActiveDepartment(category);
                            setIsOpen(false);
                            window.scrollTo({ top: document.getElementById('menu-section')?.offsetTop || 800, behavior: 'smooth' });
                          }
                        }}
                        className={`group flex items-center justify-between px-4 py-4 rounded-2xl text-base font-medium tracking-wider uppercase transition-all duration-300 w-full ${
                          activeDepartment === category || (hasSubDepts && subDepts.includes(activeDepartment))
                            ? 'bg-[#d35400] text-white shadow-lg shadow-[#d35400]/20'
                            : 'bg-white border border-black/5 text-gray-600 hover:border-[#d35400]/30 hover:text-[#d35400] shadow-sm'
                        }`}
                      >
                        <span>{category}</span>
                        {hasSubDepts ? (
                          isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />
                        ) : (
                          <ChevronRight className="w-5 h-5" />
                        )}
                      </motion.button>

                      <AnimatePresence>
                        {isExpanded && hasSubDepts && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden flex flex-col gap-1 pl-4"
                          >
                            {subDepts.map(subDept => (
                              <button
                                key={subDept}
                                onClick={() => {
                                  setActiveDepartment(subDept);
                                  setIsOpen(false);
                                  window.scrollTo({ top: document.getElementById('menu-section')?.offsetTop || 800, behavior: 'smooth' });
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium tracking-wider uppercase transition-all duration-300 w-full ${
                                  activeDepartment === subDept
                                    ? 'bg-[#d35400]/10 text-[#d35400] border border-[#d35400]/20'
                                    : 'bg-black/5 text-gray-500 hover:text-[#d35400] hover:bg-black/10'
                                }`}
                              >
                                <span>{subDept.split(':')[1].trim()}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
