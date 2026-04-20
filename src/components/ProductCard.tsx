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
          <span className="px-2 py-1 bg-white/90 backdrop-blur-md text-[#d35400] text-[8px] font-bold rounded-full shadow-sm uppercase tracking-[0.1em]">
            {product.department}
          </span>
        </div>
        {product.discountPercentage && (
          <div className="absolute top-0 left-0 h-full w-8 flex items-center justify-center bg-red-600/90 backdrop-blur-sm z-10">
            <span className="text-white text-[10px] font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">
              SAVE {product.discountPercentage}% OFF
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1 justify-between bg-white">
        <div>
          <div className="flex justify-between items-start mb-1.5">
            <h3 className="text-sm sm:text-[15px] text-[#1a1a1a] font-serif font-medium leading-tight group-hover:text-[#d35400] transition-colors line-clamp-2 tracking-tight">
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
                    className={`w-3 h-3 rounded-full border border-black/10 transition-all hover:scale-125 ${currentImage === colorImage ? 'ring-1 ring-[#d35400] ring-offset-1' : ''}`}
                    style={isValidHex ? { backgroundColor: color } : {}}
                    title={color}
                  />
                );
              })}
            </div>
          )}

          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={8} className="fill-yellow-400 text-yellow-400" />
            ))}
            <span className="text-[8px] text-gray-400 font-sans uppercase tracking-widest ml-1">(4.8)</span>
          </div>
          
          <div className="flex justify-between items-end gap-2">
            <div className="flex flex-col">
              {product.originalPrice && (
                <span className="text-[9px] text-gray-300 font-sans line-through">
                  {formatPrice(Number(product.originalPrice), currency)}
                </span>
              )}
              <p className="text-sm sm:text-base text-[#1a1a1a] font-sans font-bold tracking-tight">
                {product.optionPriceModifiers && Object.keys(product.optionPriceModifiers).length > 0 && (
                  <span className="text-[8px] text-gray-300 block -mb-0.5 uppercase tracking-widest font-bold">From</span>
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
              className={`flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all duration-300 shadow-sm ${
                product.stock === 0 
                  ? 'bg-gray-100 text-gray-300 cursor-not-allowed' 
                  : 'bg-[#1a1a1a] text-white hover:bg-[#d35400] active:scale-95'
              }`}
            >
              {product.stock === 0 ? (
                <span className="hidden sm:inline">Sold Out</span>
              ) : (
                <>
                  <span className="hidden sm:inline mr-1">Add</span>
                  <ShoppingCart size={12} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
