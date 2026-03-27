import React from 'react';
import { Product } from '../constants/products';
import { ShoppingCart, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Currency, formatPrice } from '../utils/currency';

interface Props {
  product: Product;
  onAddToCart: () => void;
  onViewDetails: (product: Product) => void;
  currency: Currency;
  variants?: any;
}

export const ProductCard: React.FC<Props> = ({ product, onAddToCart, onViewDetails, currency, variants }) => {
  return (
    <motion.div
      layout
      variants={variants}
      whileHover={{ y: -8 }}
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white border border-black/5 rounded-[2rem] overflow-hidden hover:border-[#d35400]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(211,84,0,0.12)] cursor-pointer"
    >
      <div className="aspect-[4/5] overflow-hidden bg-gray-100 relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#d35400] text-[10px] font-bold rounded-full shadow-sm uppercase tracking-wider">
            {product.department}
          </span>
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg text-[#1a1a1a] font-bold leading-tight group-hover:text-[#d35400] transition-colors">
              {product.name}
            </h3>
          </div>

          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-[10px] text-gray-400 ml-1">(4.8)</span>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xl text-[#1a1a1a] font-black tracking-tight">
              {formatPrice(Number(product.price), currency)}
            </p>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock === undefined || product.stock > 0) {
                  onAddToCart();
                }
              }}
              disabled={product.stock === 0}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 shadow-lg ${
                product.stock === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#1a1a1a] text-white hover:bg-[#d35400] hover:scale-110 active:scale-95'
              }`}
            >
              {product.stock === 0 ? 'Out of Stock' : (
                <>
                  Add to Cart
                  <ShoppingCart size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
