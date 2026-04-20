import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, Plus, Minus } from 'lucide-react';
import { Product } from '../constants/products';
import { Currency, formatPrice } from '../utils/currency';
import { Feedback } from './Feedback';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, customizations: any) => void;
  currency: Currency;
  user: any;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart, currency, user }) => {
  const [quantity, setQuantity] = useState(1);
  const [customizations, setCustomizations] = useState<any>({});
  const [currentImage, setCurrentImage] = useState(product?.image || '');
  const [showOptionErrors, setShowOptionErrors] = useState(false);

  const handleCustomizationChange = (key: string, value: string) => {
    setCustomizations(prev => ({ ...prev, [key]: value }));
    setShowOptionErrors(false);
    
    // Update image if we have option-specific images
    if (product?.optionImages?.[key]?.[value]) {
      setCurrentImage(product.optionImages[key][value]);
    }
  };

  const getMissingOptions = () => {
    if (!product) return [];
    const missing: string[] = [];
    
    if (product.options) {
      Object.keys(product.options).forEach(key => {
        if (!customizations[key]) {
          missing.push(key);
        }
      });
    } else if (product.department === 'Coffee' || product.department === 'Tea & Other') {
      if (!customizations.size) missing.push('size');
      if (!customizations.milk) missing.push('milk');
    }
    
    return missing;
  };

  const handleAddToCart = () => {
    if (product) {
      const missing = getMissingOptions();
      if (missing.length > 0) {
        setShowOptionErrors(true);
        return;
      }
      onAddToCart(product, quantity, customizations);
      onClose();
    }
  };

  // Reset state when product changes
  React.useEffect(() => {
    setQuantity(1);
    setCustomizations({});
    setCurrentImage(product?.image || '');
    setShowOptionErrors(false);
  }, [product]);

  const calculateAdjustedPrice = React.useCallback(() => {
    if (!product) return 0;
    let adjustedPrice = Number(product.price);
    if (product.optionPriceModifiers) {
      Object.entries(customizations).forEach(([key, value]) => {
        const modifier = product.optionPriceModifiers?.[key]?.[value as string];
        if (modifier) {
          adjustedPrice += modifier;
        }
      });
    }
    return adjustedPrice;
  }, [product, customizations]);

  const currentPrice = calculateAdjustedPrice();

  const allImages = [product?.image, ...(product?.gallery || [])].filter(Boolean) as string[];

  return (
    <AnimatePresence>
      {product && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm"
        >
          <div className="min-h-screen flex items-center justify-center p-4 md:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8"
            >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 md:right-4 md:left-auto z-10 px-4 py-2 flex items-center gap-2 bg-white/90 backdrop-blur-md rounded-full text-gray-800 hover:bg-white transition-colors shadow-lg font-medium text-sm"
            >
              <ArrowLeft size={16} className="md:hidden" />
              <span className="md:hidden">Back</span>
              <X size={20} className="hidden md:block" />
            </button>

          {/* Image Gallery - Scrollable Pane showing ALL images */}
          <div className="w-full md:w-[55%] h-[35vh] md:h-[80vh] overflow-y-auto custom-scrollbar bg-gray-50/50">
            <div className="flex flex-col space-y-px">
              {allImages.map((img, idx) => (
                <div key={idx} className="w-full aspect-[4/3] md:aspect-[4/5] relative bg-white overflow-hidden">
                  <img
                    src={img}
                    alt={`${product.name} - view ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {idx === 0 && product.discountPercentage && (
                    <div className="absolute top-0 left-0 h-full w-8 md:w-10 flex items-center justify-center bg-red-600/90 backdrop-blur-sm z-10">
                      <span className="text-white text-[11px] md:text-[13px] font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">
                        SAVE {product.discountPercentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content Section - Sticky on desktop */}
          <div className="w-full md:w-[45%] p-5 md:p-10 flex flex-col h-[65vh] md:h-[80vh] overflow-y-auto custom-scrollbar bg-white">
            <div className="flex-1">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={10} className="fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-[9px] text-gray-400 font-sans uppercase tracking-[0.2em] font-bold">Premium Quality</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-serif font-medium text-gray-900 mb-1 leading-[1.1] tracking-tight italic">
                {product.name}
              </h2>
              
              <div className="flex items-baseline gap-3 mb-4">
                <p className="text-xl md:text-2xl font-sans font-semibold text-[#d35400] tracking-tighter">
                  {formatPrice(currentPrice, currency)}
                </p>
                <div className="px-2 py-0.5 bg-[#d35400]/5 text-[#d35400] text-[8px] md:text-[9px] font-bold rounded-sm uppercase tracking-widest border border-[#d35400]/10">
                  {product.department}
                </div>
              </div>

              {/* Customizations - MOVED UP */}
              <div className="space-y-5 mb-8 pt-4 border-t border-black/5">
                {product.options && Object.keys(product.options).length > 0 ? (
                  Object.entries(product.options).map(([key, values]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-[0.2em]">{key}</p>
                        {showOptionErrors && !customizations[key] && (
                          <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse font-sans">Selection Required</span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(values) && values.map(value => {
                          const isColor = key.toLowerCase() === 'colors' || key.toLowerCase() === 'color';
                          const isValidHex = typeof value === 'string' && /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);
                          const modifier = product.optionPriceModifiers?.[key]?.[value as string];

                          return (
                            <button
                              key={value}
                              onClick={() => handleCustomizationChange(key, value)}
                              className={`rounded-lg transition-all flex items-center justify-center gap-1.5 border ${
                                isColor && isValidHex
                                  ? `w-7 h-7 md:w-8 md:h-8 ${customizations[key] === value ? 'border-[#d35400] ring-2 ring-[#d35400]/20 scale-110' : (showOptionErrors && !customizations[key] ? 'border-red-200' : 'border-transparent hover:scale-105')}`
                                  : `px-3 md:px-4 py-1.5 md:py-2 text-[9px] md:text-[10px] font-bold tracking-widest uppercase ${
                                      customizations[key] === value 
                                        ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' 
                                        : (showOptionErrors && !customizations[key] ? 'bg-red-50 text-red-400 border-red-100' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300')
                                    }`
                              }`}
                              title={value}
                            >
                              {isColor && isValidHex ? (
                                <div 
                                  className="w-full h-full rounded shadow-inner" 
                                  style={{ backgroundColor: value }} 
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span>{value}</span>
                                  {modifier && modifier !== 0 && (
                                    <span className={`text-[7px] ${customizations[key] === value ? 'text-white/60' : 'text-[#d35400]'}`}>
                                      {modifier > 0 ? `+${formatPrice(modifier, currency)}` : formatPrice(modifier, currency)}
                                    </span>
                                  )}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  (product.department === 'Coffee' || product.department === 'Tea & Other') ? (
                    <>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Select Size</p>
                          {showOptionErrors && !customizations.size && (
                            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse font-sans">Selection Required</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {['Small', 'Medium', 'Large'].map(size => (
                            <button
                              key={size}
                              onClick={() => handleCustomizationChange('size', size)}
                              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold transition-all border tracking-widest uppercase ${
                                customizations.size === size 
                                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' 
                                  : (showOptionErrors && !customizations.size ? 'bg-red-50 text-red-400 border-red-100' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300')
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest">Choice of Milk</p>
                          {showOptionErrors && !customizations.milk && (
                            <span className="text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse font-sans">Selection Required</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Whole', 'Skim', 'Oat', 'Almond', 'Soy'].map(milk => (
                            <button
                              key={milk}
                              onClick={() => handleCustomizationChange('milk', milk)}
                              className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-[9px] md:text-[10px] font-bold transition-all border tracking-widest uppercase ${
                                customizations.milk === milk 
                                  ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' 
                                  : (showOptionErrors && !customizations.milk ? 'bg-red-50 text-red-400 border-red-100' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300')
                              }`}
                            >
                              {milk}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : null
                )}

                <div>
                  <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Quantity</p>
                  <div className="flex items-center gap-5">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                      <Minus size={11} />
                    </button>
                    <span className="text-[13px] md:text-sm font-bold w-4 text-center tabular-nums">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-7 h-7 md:w-8 md:h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
                    >
                      <Plus size={11} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="h-px w-8 bg-gray-200" />
                <p className="text-[11px] md:text-xs text-gray-500 leading-relaxed font-sans font-light max-w-sm">
                  {product.description || `Experience the unparalleled craftsmanship of our ${product.name}. A testament to quality and contemporary design.`}
                </p>
                
                <div className="flex gap-6 pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <ShieldCheck size={11} className="text-black/20" />
                      <span>Certified</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-[8px] md:text-[9px] text-gray-400 font-bold uppercase tracking-widest">
                      <Truck size={11} className="text-black/20" />
                      <span>Express Shipping</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-6 p-3 md:p-4 bg-gray-50/50 rounded-xl border border-black/[0.03]">
                <p className="text-[8px] md:text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Availability Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${product.stock && product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <p className={`text-[10px] md:text-[11px] font-medium font-sans ${product.stock && product.stock > 0 ? 'text-gray-600' : 'text-red-500'}`}>
                    {product.stock && product.stock > 0 ? `${product.stock} pieces currently available` : 'Temporarily Out of Stock'}
                  </p>
                </div>
              </div>
            </div>

            {showOptionErrors && (
              <div className="mb-4 p-2.5 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-[8px] md:text-[9px] font-bold uppercase tracking-[0.2em] animate-pulse">
                <X size={10} />
                Please complete all required selections
              </div>
            )}

            <div className="mt-8 pt-4 md:pt-8 border-t border-black/5 space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`w-full py-3.5 md:py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-[10px] md:text-[11px] uppercase tracking-[0.2em] transition-all duration-500 shadow-xl ${
                  product.stock === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                    : (showOptionErrors ? 'bg-red-500 text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#d35400] active:scale-[0.98]')
                }`}
              >
                <ShoppingCart size={14} />
                {product.stock === 0 ? 'Not Available' : (showOptionErrors ? 'Complete Options' : `Add to Bag — ${formatPrice(currentPrice * quantity, currency)}`)}
              </button>

              <button
                onClick={onClose}
                className="w-full py-1.5 text-gray-300 hover:text-gray-600 font-bold text-[8px] md:text-[9px] uppercase tracking-[0.2em] transition-colors flex items-center justify-center gap-2 group"
              >
                <ArrowLeft size={10} className="group-hover:-translate-x-1 transition-transform" /> 
                Return to Shop
              </button>
            </div>

            {/* Feedback Section */}
            <div className="mt-8 pt-6 border-t border-black/5 pb-4">
              <Feedback productId={product.id} user={user} />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )}
</AnimatePresence>
  );
};
