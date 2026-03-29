import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Search, Check, ShoppingBag } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';

export const POSSection = ({ 
  user, products, posCart, setPosCart, posSearch, setPosSearch, 
  posCustomerName, setPosCustomerName, posCustomerEmail, setPosCustomerEmail, 
  posCustomerContact, setPosCustomerContact, posOrderSuccess, setPosOrderSuccess, 
  posReceiptData, setPosReceiptData, posOrderType, setPosOrderType, 
  posPaymentMethod, setPosPaymentMethod, currency, exchangeRate, minStockThreshold 
}: any) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)] lg:h-[calc(100vh-120px)]"
    >
      {/* Products Section */}
      <motion.div layout className="flex-1 bg-white p-4 sm:p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-serif font-bold">Take Order</h2>
            <button 
              onClick={() => {
                setPosCart([]);
                setPosSearch('');
                setPosCustomerName('');
                setPosCustomerEmail('');
                setPosCustomerContact('');
                setPosOrderSuccess(null);
                setPosReceiptData(null);
              }}
              className="text-[10px] font-bold text-[#d35400] bg-[#d35400]/10 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-[#d35400]/20 transition-all flex items-center gap-1.5"
            >
              <Plus size={12} /> New Order
            </button>
          </div>
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative w-full sm:w-64"
          >
            <input
              type="text"
              placeholder="Search items..."
              value={posSearch}
              onChange={(e) => setPosSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d35400] transition-colors"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
          </motion.div>
        </div>
        
        <div className="h-[720px] overflow-y-scroll custom-scrollbar pr-2">
          <motion.div layout className="grid grid-cols-2 gap-3 sm:gap-4">
            <AnimatePresence mode="popLayout">
              {products.filter((p: any) => p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.department.toLowerCase().includes(posSearch.toLowerCase()) || p.id.toString().includes(posSearch)).map((product: any) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  whileHover={{ scale: product.stock > 0 ? 1.05 : 1, y: product.stock > 0 ? -5 : 0 }}
                  whileTap={{ scale: product.stock > 0 ? 0.95 : 1 }}
                  key={product.id} 
                  onClick={() => {
                    if (product.stock > 0) {
                      setPosCart((prev: any[]) => {
                        const existing = prev.find(item => item.product.id === product.id);
                        if (existing) {
                          return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                        }
                        return [...prev, { product, quantity: 1 }];
                      });
                    }
                  }}
                  className={`bg-gray-50 rounded-xl p-2 border border-gray-100 cursor-pointer transition-colors hover:shadow-xl ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#d35400]'}`}
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-2 bg-white relative">
                    <span className="absolute top-2 left-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-mono">#{product.id}</span>
                    {product.stock < minStockThreshold && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md font-bold">Low Stock</span>
                    )}
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[#d35400] font-bold text-sm">{formatPrice(Number(product.price), currency)}</span>
                    <span className="text-xs text-gray-500">{product.stock} in stock</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Cart Section would be here, but it's too big, I'll do it in chunks */}
    </motion.div>
  );
};
