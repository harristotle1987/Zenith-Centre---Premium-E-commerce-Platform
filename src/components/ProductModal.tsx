import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Star, ShieldCheck, Truck, ArrowLeft, MessageSquare, Plus, Minus } from 'lucide-react';
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

          {/* Image Section */}
          <div className="w-full md:w-1/2 flex flex-col">
            <div className="h-64 md:h-[500px] relative">
              <img
                src={currentImage || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-500"
                referrerPolicy="no-referrer"
              />
              {product.discountPercentage && (
                <div className="absolute top-0 left-0 h-full w-12 flex items-center justify-center bg-red-600/90 backdrop-blur-sm z-10">
                  <span className="text-white text-base font-black uppercase tracking-tighter [writing-mode:vertical-lr] rotate-180">
                    SAVE {product.discountPercentage}% OFF
                  </span>
                </div>
              )}
              <div className="absolute bottom-4 left-4">
                <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-[#d35400] text-xs font-bold rounded-full shadow-sm uppercase tracking-wider">
                  {product.department}
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50 scrollbar-hide">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(img)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      currentImage === img ? 'border-[#d35400] scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="w-full md:w-1/2 p-8 flex flex-col overflow-y-auto">
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />
                ))}
                <span className="text-xs text-gray-500 ml-2">(4.8 / 5.0)</span>
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <p className="text-2xl font-bold text-[#d35400] mb-6">{formatPrice(currentPrice, currency)}</p>
              
              <div className="space-y-4 mb-8">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || `Experience the finest quality with our ${product.name}. Sourced directly from premium producers, this selection represents the pinnacle of taste and freshness in our ${product.department} department.`}
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <ShieldCheck size={18} className="text-green-500" />
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck size={18} className="text-blue-500" />
                    <span>Fast Delivery</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-1">Availability</p>
                  <p className={`text-sm font-medium ${product.stock && product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {product.stock && product.stock > 0 ? `${product.stock} units in stock` : 'Out of Stock'}
                  </p>
                </div>
              </div>

              {/* Customizations */}
              <div className="space-y-4 mb-8">
                {product.options && Object.keys(product.options).length > 0 ? (
                  Object.entries(product.options).map(([key, values]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-gray-400 uppercase">{key}</p>
                        {showOptionErrors && !customizations[key] && (
                          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Required</span>
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
                              className={`rounded-xl transition-all flex items-center justify-center gap-2 ${
                                isColor && isValidHex
                                  ? `w-10 h-10 border-2 ${customizations[key] === value ? 'border-[#d35400] scale-110 shadow-md' : (showOptionErrors && !customizations[key] ? 'border-red-200' : 'border-transparent hover:scale-105')}`
                                  : `px-4 py-2 text-sm font-bold ${
                                      customizations[key] === value 
                                        ? 'bg-[#1a1a1a] text-white' 
                                        : (showOptionErrors && !customizations[key] ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                                    }`
                              }`}
                              title={value}
                            >
                              {isColor && isValidHex ? (
                                <div 
                                  className="w-full h-full rounded-lg shadow-inner" 
                                  style={{ backgroundColor: value }} 
                                />
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span>{value}</span>
                                  {modifier && modifier !== 0 && (
                                    <span className={`text-[10px] ${customizations[key] === value ? 'text-white/60' : 'text-[#d35400]'}`}>
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
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-400 uppercase">Size</p>
                          {showOptionErrors && !customizations.size && (
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Required</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {['Small', 'Medium', 'Large'].map(size => (
                            <button
                              key={size}
                              onClick={() => handleCustomizationChange('size', size)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                customizations.size === size 
                                  ? 'bg-[#1a1a1a] text-white' 
                                  : (showOptionErrors && !customizations.size ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-bold text-gray-400 uppercase">Milk</p>
                          {showOptionErrors && !customizations.milk && (
                            <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Required</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {['Whole', 'Skim', 'Oat', 'Almond', 'Soy'].map(milk => (
                            <button
                              key={milk}
                              onClick={() => handleCustomizationChange('milk', milk)}
                              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                                customizations.milk === milk 
                                  ? 'bg-[#1a1a1a] text-white' 
                                  : (showOptionErrors && !customizations.milk ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
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
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2">Quantity</p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showOptionErrors && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-xs font-bold uppercase tracking-widest animate-bounce">
                <X size={14} />
                Please select all required options
              </div>
            )}

            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all duration-300 shadow-xl mb-4 ${
                product.stock === 0
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : (showOptionErrors ? 'bg-red-500 text-white' : 'bg-[#1a1a1a] text-white hover:bg-[#d35400] hover:scale-[1.02] active:scale-95')
              }`}
            >
              <ShoppingCart size={20} />
              {product.stock === 0 ? 'Out of Stock' : (showOptionErrors ? 'Select Options' : `Add to Cart - ${formatPrice(currentPrice * quantity, currency)}`)}
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 text-gray-400 hover:text-gray-600 font-bold text-sm uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
            >
              <ArrowLeft size={14} /> Back
            </button>

            {/* Feedback Section */}
            <div className="mt-12 pt-12 border-t border-black/5">
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
