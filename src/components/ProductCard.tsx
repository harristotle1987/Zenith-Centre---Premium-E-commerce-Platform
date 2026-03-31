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
  const [currentImage, setCurrentImage] = React.useState(product.image);

  const colors = product.options?.colors || product.options?.color;
  const optionImages = product.optionImages;
  const colorKey = product.options?.colors ? 'colors' : 'color';

  return (
    <motion.div
      layout
      variants={variants}
      whileHover={{ y: -8 }}
      onClick={() => onViewDetails(product)}
      className="group relative flex flex-col bg-white border border-black/5 rounded-2xl overflow-hidden hover:border-[#d35400]/30 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(211,84,0,0.12)] cursor-pointer"
    >
      <div className="aspect-square overflow-hidden bg-gray-100 relative">
        <img
          src={currentImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-3 right-3">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-md text-[#d35400] text-[9px] font-bold rounded-full shadow-sm uppercase tracking-wider">
            {product.department}
          </span>
        </div>
        {product.discountPercentage && (
          <div className="absolute top-0 left-0 h-full w-8 flex items-center justify-center bg-red-600/90 backdrop-blur-sm z-10">
            <span className="text-white text-xs font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">
              SAVE {product.discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex justify-between items-start mb-1">
            <h3 className="text-sm sm:text-base text-[#1a1a1a] font-bold leading-tight group-hover:text-[#d35400] transition-colors line-clamp-2">
              {product.name}
            </h3>
          </div>

          {colors && Array.isArray(colors) && colors.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3" onClick={(e) => e.stopPropagation()}>
              {colors.map((color: string) => {
                const isValidHex = /^#([A-Fa-f0-9]{3}){1,2}$/.test(color);
                const colorImage = optionImages?.[colorKey]?.[color];
                return (
                  <button
                    key={color}
                    onClick={() => {
                      if (colorImage) {
                        setCurrentImage(colorImage);
                      }
                    }}
                    className={`w-4 h-4 rounded-full border border-black/10 transition-all hover:scale-125 ${currentImage === colorImage ? 'ring-2 ring-[#d35400] ring-offset-1' : ''}`}
                    style={isValidHex ? { backgroundColor: color } : {}}
                    title={color}
                  />
                );
              })}
            </div>
          )}

          {product.description && (
            <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2 mb-2 leading-relaxed">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-[9px] text-gray-400 ml-1">(4.8)</span>
          </div>

          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-[10px] text-gray-400 line-through">
                  {formatPrice(Number(product.originalPrice), currency)}
                </span>
              )}
              <p className="text-base sm:text-lg text-[#1a1a1a] font-black tracking-tight">
                {product.optionPriceModifiers && Object.keys(product.optionPriceModifiers).length > 0 && (
                  <span className="text-[9px] text-gray-400 block -mb-1 uppercase tracking-widest">Starts from</span>
                )}
                {formatPrice(Number(product.price), currency)}
              </p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (product.stock === undefined || product.stock > 0) {
                  onAddToCart();
                }
              }}
              disabled={product.stock === 0}
              className={`flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${
                product.stock === 0 
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#1a1a1a] text-white hover:bg-[#d35400] hover:scale-110 active:scale-95'
              }`}
            >
              {product.stock === 0 ? (
                <span className="hidden sm:inline">Out of Stock</span>
              ) : (
                <>
                  <span className="hidden sm:inline mr-1">Add</span>
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
