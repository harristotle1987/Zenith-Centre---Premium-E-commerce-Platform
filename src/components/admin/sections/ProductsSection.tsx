import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Package, AlertTriangle } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';

export const ProductsSection = ({ 
  products, departments, loading, addProduct, updateProduct, deleteProduct, 
  updateStock, startEditingProduct, editingProductId, setEditingProductId, 
  editProdName, setEditProdName, editProdPrice, setEditProdPrice, 
  editProdOriginalPrice, setEditProdOriginalPrice,
  editProdDiscountPercentage, setEditProdDiscountPercentage,
  editProdDescription, setEditProdDescription, editProdImage, setEditProdImage, 
  editProdDept, setEditProdDept, editProdStock, setEditProdStock, 
  editingStockId, setEditingStockId, editStockValue, setEditStockValue, uploadingNewImage, 
  handleNewImageUpload, uploadingEditImage, handleEditImageUpload, 
  currency, exchangeRate, minStockThreshold, newProdName, setNewProdName, 
  newProdPrice, setNewProdPrice, 
  newProdOriginalPrice, setNewProdOriginalPrice,
  newProdDiscountPercentage, setNewProdDiscountPercentage,
  newProdDescription, setNewProdDescription, 
  newProdImage, setNewProdImage, newProdDept, setNewProdDept, newProdStock, 
  setNewProdStock,
  newProdOptions, setNewProdOptions,
  newProdPriceModifiers, setNewProdPriceModifiers,
  editProdOptions, setEditProdOptions,
  editProdPriceModifiers, setEditProdPriceModifiers,
  newProdGallery, setNewProdGallery,
  newProdOptionImages, setNewProdOptionImages,
  editProdGallery, setEditProdGallery,
  editProdOptionImages, setEditProdOptionImages
}: any) => {
  const [priceCurrency, setPriceCurrency] = useState<'NGN' | 'USD'>('NGN');

  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [editGalleryUrl, setEditGalleryUrl] = useState('');

  const [newOptImgKey, setNewOptImgKey] = useState('');
  const [newOptImgValue, setNewOptImgValue] = useState('');
  const [newOptImgUrl, setNewOptImgUrl] = useState('');

  const [editOptImgKey, setEditOptImgKey] = useState('');
  const [editOptImgValue, setEditOptImgValue] = useState('');
  const [editOptImgUrl, setEditOptImgUrl] = useState('');

  const addGalleryImage = (isEdit = false) => {
    const urlStr = isEdit ? editGalleryUrl : newGalleryUrl;
    if (!urlStr.trim()) return;
    
    // Split by commas, spaces, or newlines to allow multiple URLs
    const urls = urlStr.split(/[\s,]+/).filter(url => url.trim().length > 0);
    
    if (isEdit) {
      setEditProdGallery(prev => [...prev, ...urls]);
      setEditGalleryUrl('');
    } else {
      setNewProdGallery(prev => [...prev, ...urls]);
      setNewGalleryUrl('');
    }
  };

  const removeGalleryImage = (idx: number, isEdit = false) => {
    if (isEdit) {
      setEditProdGallery(editProdGallery.filter((_: any, i: number) => i !== idx));
    } else {
      setNewProdGallery(newProdGallery.filter((_: any, i: number) => i !== idx));
    }
  };

  const addOptionImage = (isEdit = false) => {
    const key = isEdit ? editOptImgKey : newOptImgKey;
    const value = isEdit ? editOptImgValue : newOptImgValue;
    const url = isEdit ? editOptImgUrl : newOptImgUrl;

    if (!key || !value || !url) return;

    if (isEdit) {
      const updated = { ...editProdOptionImages };
      if (!updated[key]) updated[key] = {};
      updated[key][value] = url;
      setEditProdOptionImages(updated);
      setEditOptImgUrl('');
    } else {
      const updated = { ...newProdOptionImages };
      if (!updated[key]) updated[key] = {};
      updated[key][value] = url;
      setNewProdOptionImages(updated);
      setNewOptImgUrl('');
    }
  };

  const removeOptionImage = (key: string, value: string, isEdit = false) => {
    if (isEdit) {
      const updated = { ...editProdOptionImages };
      if (updated[key]) {
        delete updated[key][value];
        if (Object.keys(updated[key]).length === 0) delete updated[key];
      }
      setEditProdOptionImages(updated);
    } else {
      const updated = { ...newProdOptionImages };
      if (updated[key]) {
        delete updated[key][value];
        if (Object.keys(updated[key]).length === 0) delete updated[key];
      }
      setNewProdOptionImages(updated);
    }
  };

  const toggleCurrency = () => {
    setPriceCurrency(prev => prev === 'NGN' ? 'USD' : 'NGN');
  };

  const calculateDiscount = (original: string, current: string) => {
    const orig = parseFloat(original);
    const curr = parseFloat(current);
    if (orig && curr && orig > curr) {
      return Math.round(((orig - curr) / orig) * 100).toString();
    }
    return '';
  };

  const calculatePriceFromDiscount = (original: string, percentage: string) => {
    const orig = parseFloat(original);
    const perc = parseFloat(percentage);
    if (orig && perc) {
      return (orig - (orig * perc / 100)).toFixed(2);
    }
    return '';
  };

  const [newOptKey, setNewOptKey] = useState('size');
  const [newOptValue, setNewOptValue] = useState('');
  const [editOptKey, setEditOptKey] = useState('size');
  const [editOptValue, setEditOptValue] = useState('');

  // Price Modifiers Local State
  const [newModOption, setNewModOption] = useState('size');
  const [newModValue, setNewModValue] = useState('');
  const [newModPrice, setNewModPrice] = useState('');

  const [editModOption, setEditModOption] = useState('size');
  const [editModValue, setEditModValue] = useState('');
  const [editModPrice, setEditModPrice] = useState('');

  const addPriceModifier = (isEdit = false) => {
    const option = isEdit ? editModOption : newModOption;
    const value = isEdit ? editModValue : newModValue;
    const price = parseFloat(isEdit ? editModPrice : newModPrice);

    if (!option || !value || isNaN(price)) return;

    if (isEdit) {
      const updated = { ...editProdPriceModifiers };
      if (!updated[option]) updated[option] = {};
      updated[option][value] = price;
      setEditProdPriceModifiers(updated);
      setEditModValue('');
      setEditModPrice('');
    } else {
      const updated = { ...newProdPriceModifiers };
      if (!updated[option]) updated[option] = {};
      updated[option][value] = price;
      setNewProdPriceModifiers(updated);
      setNewModValue('');
      setNewModPrice('');
    }
  };

  const removePriceModifier = (option: string, value: string, isEdit = false) => {
    if (isEdit) {
      const updated = { ...editProdPriceModifiers };
      if (updated[option]) {
        delete updated[option][value];
        if (Object.keys(updated[option]).length === 0) delete updated[option];
      }
      setEditProdPriceModifiers(updated);
    } else {
      const updated = { ...newProdPriceModifiers };
      if (updated[option]) {
        delete updated[option][value];
        if (Object.keys(updated[option]).length === 0) delete updated[option];
      }
      setNewProdPriceModifiers(updated);
    }
  };

  const addOption = (isEdit = false) => {
    const key = isEdit ? editOptKey.toLowerCase().trim() : newOptKey.toLowerCase().trim();
    const value = isEdit ? editOptValue.trim() : newOptValue.trim();
    if (!key || !value) return;

    if (isEdit) {
      const updated = { ...editProdOptions };
      if (!updated[key]) updated[key] = [];
      if (!updated[key].includes(value)) updated[key].push(value);
      setEditProdOptions(updated);
      setEditOptValue('');
    } else {
      const updated = { ...newProdOptions };
      if (!updated[key]) updated[key] = [];
      if (!updated[key].includes(value)) updated[key].push(value);
      setNewProdOptions(updated);
      setNewOptValue('');
    }
  };

  const removeOption = (key: string, value: string, isEdit = false) => {
    if (isEdit) {
      const updated = { ...editProdOptions };
      updated[key] = updated[key].filter((v: string) => v !== value);
      if (updated[key].length === 0) delete updated[key];
      setEditProdOptions(updated);
    } else {
      const updated = { ...newProdOptions };
      updated[key] = updated[key].filter((v: string) => v !== value);
      if (updated[key].length === 0) delete updated[key];
      setNewProdOptions(updated);
    }
  };

  return (
    <motion.div 
      key="products"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
        <h2 className="text-xl font-serif font-bold">Product Management</h2>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{products.length} Items</span>
      </div>
      
      <form onSubmit={addProduct} className="space-y-4 mb-8 bg-gray-50/50 p-4 rounded-xl border border-black/5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Wagyu Ribeye"
              value={newProdName}
              onChange={(e) => setNewProdName(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors"
              required
            />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Original Price ({priceCurrency === 'NGN' ? '₦' : '$'})</label>
              <button type="button" onClick={toggleCurrency} className="text-[10px] font-bold text-[#d35400] bg-[#d35400]/10 px-2 py-0.5 rounded uppercase tracking-widest hover:bg-[#d35400]/20">
                Switch to {priceCurrency === 'NGN' ? 'USD' : 'Naira'}
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProdOriginalPrice}
              onChange={(e) => {
                const val = e.target.value;
                setNewProdOriginalPrice(val);
                if (newProdDiscountPercentage) {
                  setNewProdPrice(calculatePriceFromDiscount(val, newProdDiscountPercentage));
                } else if (newProdPrice) {
                  setNewProdDiscountPercentage(calculateDiscount(val, newProdPrice));
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Discount Percentage (%)</label>
            <input
              type="number"
              placeholder="0"
              value={newProdDiscountPercentage}
              onChange={(e) => {
                const val = e.target.value;
                setNewProdDiscountPercentage(val);
                if (newProdOriginalPrice) {
                  setNewProdPrice(calculatePriceFromDiscount(newProdOriginalPrice, val));
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Final Price ({priceCurrency === 'NGN' ? '₦' : '$'})</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProdPrice}
              onChange={(e) => {
                const val = e.target.value;
                setNewProdPrice(val);
                if (newProdOriginalPrice) {
                  setNewProdDiscountPercentage(calculateDiscount(newProdOriginalPrice, val));
                }
              }}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Description (Optional)</label>
          <textarea
            placeholder="Describe the product..."
            value={newProdDescription}
            onChange={(e) => setNewProdDescription(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors resize-none"
            rows={2}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Department</label>
            <select
              value={newProdDept}
              onChange={(e) => setNewProdDept(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors text-[#1a1a1a]"
              required
            >
              <option value="" disabled>Select Department</option>
              {departments.map((dept: string) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Product Image</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Image URL"
                value={newProdImage}
                onChange={(e) => setNewProdImage(e.target.value)}
                className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors text-sm min-w-0"
              />
              <label className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-4 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-all duration-300 whitespace-nowrap text-sm font-medium">
                {uploadingNewImage ? '...' : 'Upload'}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={handleNewImageUpload}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Initial Stock</label>
            <input
              type="number"
              placeholder="100"
              value={newProdStock}
              onChange={(e) => setNewProdStock(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:border-[#d35400] transition-colors"
            />
          </div>
        </div>

        {/* Product Options Section */}
        <div className="space-y-4 p-4 bg-white rounded-xl border border-black/5">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Product Options (Optional)</h3>
          
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option Name</label>
                <input
                  type="text"
                  placeholder="e.g. size, color, bean, milk"
                  value={newOptKey}
                  onChange={(e) => setNewOptKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <div className="space-y-1 flex-[2] min-w-[150px]">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option Value</label>
                <input
                  type="text"
                  placeholder="e.g. Large, Red, Arabica, Oat Milk"
                  value={newOptValue}
                  onChange={(e) => setNewOptValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <button 
                type="button"
                onClick={() => addOption(false)}
                className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d35400] transition-colors h-[34px]"
              >
                Add Option
              </button>
            </div>
            
            <div className="flex flex-col gap-2 mt-2">
              {Object.entries(newProdOptions).map(([key, values]: any) => (
                <div key={key} className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 uppercase">{key}:</span>
                  {values.map((val: string, idx: number) => (
                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                      {key === 'color' && val.startsWith('#') && (
                        <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: val }} />
                      )}
                      {val}
                      <button type="button" onClick={() => removeOption(key, val, false)} className="text-gray-400 hover:text-red-500">
                        <Plus size={14} className="rotate-45" />
                      </button>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Price Modifiers */}
          <div className="space-y-2 pt-4 border-t border-black/5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Modifiers (Optional)</label>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 flex-1 min-w-[120px]">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Option</label>
                <select 
                  value={newModOption} 
                  onChange={(e) => {
                    setNewModOption(e.target.value);
                    setNewModValue('');
                  }}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                >
                  <option value="">Select Option</option>
                  {Object.keys(newProdOptions).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 flex-[2] min-w-[150px]">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Value</label>
                {newModOption && newProdOptions[newModOption] && newProdOptions[newModOption].length > 0 ? (
                  <select
                    value={newModValue}
                    onChange={(e) => setNewModValue(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                  >
                    <option value="">Select Value</option>
                    {newProdOptions[newModOption].map((v: string) => <option key={v} value={v}>{v}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    value={newModValue} 
                    onChange={(e) => setNewModValue(e.target.value)}
                    placeholder="e.g. Large, #FF0000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                  />
                )}
              </div>
              <div className="space-y-1 flex-1 min-w-[100px]">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Price +</label>
                <input 
                  type="number" 
                  value={newModPrice} 
                  onChange={(e) => setNewModPrice(e.target.value)}
                  placeholder="Price"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                />
              </div>
              <button 
                type="button" 
                onClick={() => addPriceModifier(false)}
                className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d35400] transition-colors h-[34px]"
              >
                Add Modifier
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(newProdPriceModifiers).map(([opt, values]: any) => (
                Object.entries(values).map(([val, price]: any) => (
                  <span key={`${opt}-${val}`} className="bg-orange-50 text-[#d35400] border border-orange-100 px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-2">
                    <span className="uppercase opacity-60">{opt}:</span> {val} (+{formatPrice(price, currency, exchangeRate)})
                    <button type="button" onClick={() => removePriceModifier(opt, val, false)} className="text-orange-300 hover:text-red-500">
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </span>
                ))
              ))}
            </div>
          </div>

          {/* Gallery Images */}
          <div className="space-y-2 pt-4 border-t border-black/5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Gallery Images (Optional)</label>
            <p className="text-[10px] text-gray-400 italic">Add multiple URLs separated by spaces or commas, or upload multiple files.</p>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Image URL(s)"
                value={newGalleryUrl}
                onChange={(e) => setNewGalleryUrl(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#d35400]"
              />
              <label className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs font-bold whitespace-nowrap">
                {uploadingNewImage ? '...' : 'Upload'}
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={(e) => handleNewImageUpload(e)}
                />
              </label>
              <button 
                type="button"
                onClick={() => addGalleryImage(false)}
                className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d35400] transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-nowrap overflow-x-auto gap-2 mt-2 pb-2">
              {newProdGallery.map((url: string, idx: number) => (
                <div key={idx} className="relative group flex-shrink-0">
                  <img src={url} alt="Gallery" className="w-20 h-20 object-cover rounded-lg border border-black/5" />
                  <button 
                    type="button"
                    onClick={() => removeGalleryImage(idx, false)}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus size={10} className="rotate-45" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Option Images */}
          <div className="space-y-2 pt-4 border-t border-black/5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Option-Specific Images (Optional)</label>
            <div className="flex flex-wrap gap-2 items-end">
              <div className="space-y-1 flex-1 min-w-[100px]">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Option</label>
                <select 
                  value={newOptImgKey} 
                  onChange={(e) => setNewOptImgKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                >
                  <option value="">Select Option</option>
                  {Object.keys(newProdOptions).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 flex-1 min-w-[100px]">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Value</label>
                <select
                  value={newOptImgValue}
                  onChange={(e) => setNewOptImgValue(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                >
                  <option value="">Select Value</option>
                  {newOptImgKey && newProdOptions[newOptImgKey]?.map((v: string) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="space-y-1 flex-[2] min-w-[150px]">
                <label className="text-[10px] text-gray-400 uppercase font-bold">Image URL</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    value={newOptImgUrl} 
                    onChange={(e) => setNewOptImgUrl(e.target.value)}
                    placeholder="Image URL"
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#d35400]"
                  />
                  <label className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-3 py-1.5 rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs font-bold whitespace-nowrap">
                    {uploadingNewImage ? '...' : 'Upload'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleNewImageUpload(e)}
                    />
                  </label>
                </div>
              </div>
              <button 
                type="button" 
                onClick={() => addOptionImage(false)}
                className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d35400] transition-colors h-[34px]"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {Object.entries(newProdOptionImages).map(([opt, values]: any) => (
                Object.entries(values).map(([val, url]: any) => (
                  <div key={`${opt}-${val}`} className="flex items-center gap-2 bg-gray-50 border border-black/5 p-1 rounded-lg">
                    <img src={url} alt={`${opt}-${val}`} className="w-8 h-8 object-cover rounded" />
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase">{opt}</span>
                      <span className="text-[10px] font-medium text-gray-700">{val}</span>
                    </div>
                    <button type="button" onClick={() => removeOptionImage(opt, val, false)} className="text-gray-400 hover:text-red-500 ml-1">
                      <Plus size={12} className="rotate-45" />
                    </button>
                  </div>
                ))
              ))}
            </div>
          </div>
        </div>

        <button type="submit" className="w-full bg-[#d35400] hover:bg-[#e67e22] text-white px-4 py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 font-bold shadow-lg shadow-[#d35400]/20">
          <Plus size={20} /> Add Product to Menu
        </button>
      </form>

      <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#d35400] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : products.map((prod: any) => (
          <div key={prod.id} className="flex flex-col bg-white p-4 rounded-xl border border-black/5 hover:border-[#d35400]/20 transition-all duration-300 shadow-sm">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-black/5 flex-shrink-0 relative">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                  {prod.discountPercentage && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-[8px] font-bold px-1 rounded-bl">
                      -{prod.discountPercentage}%
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-serif font-bold text-lg text-[#1a1a1a]">{prod.name}</p>
                  {prod.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{prod.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex flex-col">
                      {prod.originalPrice && (
                        <span className="text-[10px] text-gray-400 line-through leading-none">
                          {formatPrice(Number(prod.originalPrice), currency)}
                        </span>
                      )}
                      <span className="text-sm font-medium text-[#d35400]">{formatPrice(Number(prod.price), currency)}</span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{prod.department}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {editingProductId === prod.id ? (
                  <div className="flex flex-col gap-3 w-full bg-gray-50 p-4 rounded-xl border border-black/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Name</label>
                        <input
                          type="text"
                          value={editProdName}
                          onChange={(e) => setEditProdName(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                          placeholder="Name"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Original Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editProdOriginalPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditProdOriginalPrice(val);
                            if (editProdDiscountPercentage) {
                              setEditProdPrice(calculatePriceFromDiscount(val, editProdDiscountPercentage));
                            } else if (editProdPrice) {
                              setEditProdDiscountPercentage(calculateDiscount(val, editProdPrice));
                            }
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                          placeholder="Original Price"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Discount %</label>
                        <input
                          type="number"
                          value={editProdDiscountPercentage}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditProdDiscountPercentage(val);
                            if (editProdOriginalPrice) {
                              setEditProdPrice(calculatePriceFromDiscount(editProdOriginalPrice, val));
                            }
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                          placeholder="Discount %"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Final Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={editProdPrice}
                          onChange={(e) => {
                            const val = e.target.value;
                            setEditProdPrice(val);
                            if (editProdOriginalPrice) {
                              setEditProdDiscountPercentage(calculateDiscount(editProdOriginalPrice, val));
                            }
                          }}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                          placeholder="Final Price"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Department</label>
                        <select
                          value={editProdDept}
                          onChange={(e) => setEditProdDept(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        >
                          {departments.map((dept: string) => (
                            <option key={dept} value={dept}>{dept}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Stock</label>
                        <input
                          type="number"
                          value={editProdStock}
                          onChange={(e) => setEditProdStock(e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                          placeholder="Stock"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Description</label>
                      <textarea
                        value={editProdDescription}
                        onChange={(e) => setEditProdDescription(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400] resize-none"
                        placeholder="Description (Optional)"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL</label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={editProdImage}
                          onChange={(e) => setEditProdImage(e.target.value)}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400] min-w-0"
                          placeholder="Image URL"
                        />
                        <label className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-3 py-2 rounded-lg cursor-pointer flex items-center justify-center transition-all text-xs font-medium whitespace-nowrap">
                          {uploadingEditImage ? '...' : 'Upload'}
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={handleEditImageUpload}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Edit Product Options */}
                    <div className="space-y-3 p-3 bg-white rounded-xl border border-black/5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Options</p>
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-1 items-end">
                          <div className="space-y-1 flex-1 min-w-[80px]">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">Option Name</label>
                            <input
                              type="text"
                              value={editOptKey}
                              onChange={(e) => setEditOptKey(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                              placeholder="e.g. size"
                            />
                          </div>
                          <div className="space-y-1 flex-[2] min-w-[100px]">
                            <label className="text-[8px] font-bold text-gray-500 uppercase">Option Value</label>
                            <input
                              type="text"
                              value={editOptValue}
                              onChange={(e) => setEditOptValue(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                              placeholder="e.g. Large"
                            />
                          </div>
                          <button type="button" onClick={() => addOption(true)} className="bg-[#1a1a1a] text-white px-3 py-1 rounded text-[10px] font-bold h-[26px]">Add</button>
                        </div>
                        <div className="flex flex-col gap-1 mt-1">
                          {Object.entries(editProdOptions).map(([key, values]: any) => (
                            <div key={key} className="flex flex-wrap items-center gap-1">
                              <span className="text-[10px] font-bold text-gray-600 uppercase">{key}:</span>
                              {values.map((val: string, idx: number) => (
                                <span key={idx} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                                  {key === 'color' && val.startsWith('#') && (
                                    <div className="w-2 h-2 rounded-full border border-black/10" style={{ backgroundColor: val }} />
                                  )}
                                  {val}
                                  <button type="button" onClick={() => removeOption(key, val, true)} className="text-gray-400 hover:text-red-500"><Plus size={10} className="rotate-45" /></button>
                                </span>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Edit Price Modifiers */}
                      <div className="space-y-2 pt-3 border-t border-black/5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Price Modifiers</label>
                        <div className="flex flex-wrap gap-1 items-end">
                          <div className="space-y-1 flex-1 min-w-[80px]">
                            <label className="text-[8px] text-gray-400 uppercase font-bold">Option</label>
                            <select 
                              value={editModOption} 
                              onChange={(e) => {
                                setEditModOption(e.target.value);
                                setEditModValue('');
                              }}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                            >
                              <option value="">Select Option</option>
                              {Object.keys(editProdOptions).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1 flex-[2] min-w-[100px]">
                            <label className="text-[8px] text-gray-400 uppercase font-bold">Value</label>
                            {editModOption && editProdOptions[editModOption] && editProdOptions[editModOption].length > 0 ? (
                              <select
                                value={editModValue}
                                onChange={(e) => setEditModValue(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                              >
                                <option value="">Select Value</option>
                                {editProdOptions[editModOption].map((v: string) => <option key={v} value={v}>{v}</option>)}
                              </select>
                            ) : (
                              <input 
                                type="text" 
                                value={editModValue} 
                                onChange={(e) => setEditModValue(e.target.value)}
                                placeholder="Value"
                                className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                              />
                            )}
                          </div>
                          <div className="space-y-1 flex-1 min-w-[60px]">
                            <label className="text-[8px] text-gray-400 uppercase font-bold">Price +</label>
                            <input 
                              type="number" 
                              value={editModPrice} 
                              onChange={(e) => setEditModPrice(e.target.value)}
                              placeholder="Price"
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => addPriceModifier(true)}
                            className="bg-[#1a1a1a] text-white px-3 py-1 rounded text-[10px] font-bold hover:bg-[#d35400] transition-colors h-[26px]"
                          >
                            Add
                          </button>
                        </div>
                        
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(editProdPriceModifiers).map(([opt, values]: any) => (
                            Object.entries(values).map(([val, price]: any) => (
                              <span key={`${opt}-${val}`} className="bg-orange-50 text-[#d35400] border border-orange-100 px-1.5 py-0.5 rounded text-[9px] font-bold flex items-center gap-1">
                                <span className="uppercase opacity-60">{opt}:</span> {val} (+{formatPrice(price, currency, exchangeRate)})
                                <button type="button" onClick={() => removePriceModifier(opt, val, true)} className="text-orange-300 hover:text-red-500">
                                  <Plus size={10} className="rotate-45" />
                                </button>
                              </span>
                            ))
                          ))}
                        </div>
                      </div>

                      {/* Edit Gallery Images */}
                      <div className="space-y-2 pt-3 border-t border-black/5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Gallery Images</label>
                        <p className="text-[8px] text-gray-400 italic">Add multiple URLs separated by spaces or commas, or upload multiple files.</p>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder="Image URL(s)"
                            value={editGalleryUrl}
                            onChange={(e) => setEditGalleryUrl(e.target.value)}
                            className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                          />
                          <button 
                            type="button"
                            onClick={() => addGalleryImage(true)}
                            className="bg-[#1a1a1a] text-white px-3 py-1 rounded text-[10px] font-bold"
                          >
                            Add
                          </button>
                          <label className="bg-gray-100 text-gray-600 px-3 py-1 rounded text-[10px] font-bold cursor-pointer hover:bg-gray-200 transition-colors flex items-center justify-center">
                            {uploadingEditImage ? '...' : 'Upload'}
                            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleEditImageUpload(e)} />
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {editProdGallery.map((url: string, idx: number) => (
                            <div key={idx} className="relative group">
                              <img src={url} alt="Gallery" className="w-10 h-10 object-cover rounded border border-black/5" />
                              <button 
                                type="button"
                                onClick={() => removeGalleryImage(idx, true)}
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Plus size={8} className="rotate-45" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Edit Option Images */}
                      <div className="space-y-2 pt-3 border-t border-black/5">
                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Option-Specific Images</label>
                        <div className="flex flex-wrap gap-1 items-end">
                          <div className="space-y-1 flex-1 min-w-[80px]">
                            <label className="text-[8px] text-gray-400 uppercase font-bold">Option</label>
                            <select 
                              value={editOptImgKey} 
                              onChange={(e) => setEditOptImgKey(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                            >
                              <option value="">Select Option</option>
                              {Object.keys(editProdOptions).map((opt) => (
                                <option key={opt} value={opt}>{opt}</option>
                              ))}
                            </select>
                          </div>
                          <div className="space-y-1 flex-1 min-w-[80px]">
                            <label className="text-[8px] text-gray-400 uppercase font-bold">Value</label>
                            <select
                              value={editOptImgValue}
                              onChange={(e) => setEditOptImgValue(e.target.value)}
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                            >
                              <option value="">Select Value</option>
                              {editOptImgKey && editProdOptions[editOptImgKey]?.map((v: string) => <option key={v} value={v}>{v}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1 flex-[2] min-w-[100px]">
                            <label className="text-[8px] text-gray-400 uppercase font-bold">Image URL</label>
                            <input 
                              type="url" 
                              value={editOptImgUrl} 
                              onChange={(e) => setEditOptImgUrl(e.target.value)}
                              placeholder="Image URL"
                              className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-[#d35400]"
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => addOptionImage(true)}
                            className="bg-[#1a1a1a] text-white px-3 py-1 rounded text-[10px] font-bold h-[26px]"
                          >
                            Add
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Object.entries(editProdOptionImages).map(([opt, values]: any) => (
                            Object.entries(values).map(([val, url]: any) => (
                              <div key={`${opt}-${val}`} className="flex items-center gap-1 bg-gray-50 border border-black/5 p-1 rounded">
                                <img src={url} alt={`${opt}-${val}`} className="w-6 h-6 object-cover rounded" />
                                <div className="flex flex-col">
                                  <span className="text-[7px] font-bold text-gray-400 uppercase">{opt}</span>
                                  <span className="text-[8px] font-medium text-gray-700">{val}</span>
                                </div>
                                <button type="button" onClick={() => removeOptionImage(opt, val, true)} className="text-gray-400 hover:text-red-500 ml-1">
                                  <Plus size={10} className="rotate-45" />
                                </button>
                              </div>
                            ))
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button 
                        onClick={updateProduct}
                        className="flex-1 bg-[#d35400] hover:bg-[#e67e22] text-white py-2 rounded-lg text-sm font-bold transition-all"
                      >
                        Save Changes
                      </button>
                      <button 
                        onClick={() => setEditingProductId(null)}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : editingStockId === prod.id ? (
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={editStockValue}
                      onChange={(e) => setEditStockValue(e.target.value)}
                      className="w-20 bg-white border border-[#d35400] rounded-lg px-3 py-1.5 text-sm focus:outline-none"
                      autoFocus
                    />
                    <button 
                      onClick={() => updateStock(prod.id)}
                      className="bg-[#d35400] hover:bg-[#e67e22] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => setEditingStockId(null)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      className={`text-xs font-bold px-3 py-2 rounded-lg transition-colors ${
                        (prod.stock ?? 0) <= (minStockThreshold || 0) 
                          ? 'bg-red-50 text-red-600 hover:bg-red-100 ring-1 ring-red-200' 
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                      onClick={() => {
                        setEditingStockId(prod.id);
                        setEditStockValue(prod.stock?.toString() || '0');
                      }}
                    >
                      Stock: {prod.stock ?? 0}
                      {(prod.stock ?? 0) <= (minStockThreshold || 0) && (
                        <span className="ml-2 inline-flex items-center gap-1">
                          <AlertTriangle size={10} />
                          Low
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => startEditingProduct(prod)} 
                      className="text-xs font-bold text-[#d35400] bg-[#d35400]/10 px-3 py-2 rounded-lg hover:bg-[#d35400]/20 transition-colors uppercase tracking-wider"
                    >
                      Edit
                    </button>
                    <button onClick={() => deleteProduct(prod.id)} className="text-gray-400 hover:text-red-500 transition-colors p-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && !loading && (
          <p className="text-gray-400 italic text-center py-12">No products found in the menu.</p>
        )}
      </div>
    </motion.div>
  );
};
