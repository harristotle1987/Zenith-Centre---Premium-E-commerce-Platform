import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Package } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';

export const ProductsSection = ({ 
  products, departments, loading, addProduct, updateProduct, deleteProduct, 
  updateStock, startEditingProduct, editingProductId, setEditingProductId, 
  editProdName, setEditProdName, editProdPrice, setEditProdPrice, 
  editProdOriginalPrice, setEditProdOriginalPrice,
  editProdDiscountPercentage, setEditProdDiscountPercentage,
  editProdDescription, setEditProdDescription, editProdImage, setEditProdImage, 
  editProdDept, setEditProdDept, editProdStock, setEditProdStock, 
  editingStockId, setEditingStockId, editStockValue, setEditStockValue, uploadingImage, 
  handleImageUpload, uploadingEditImage, handleEditImageUpload, 
  currency, exchangeRate, minStockThreshold, newProdName, setNewProdName, 
  newProdPrice, setNewProdPrice, 
  newProdOriginalPrice, setNewProdOriginalPrice,
  newProdDiscountPercentage, setNewProdDiscountPercentage,
  newProdDescription, setNewProdDescription, 
  newProdImage, setNewProdImage, newProdDept, setNewProdDept, newProdStock, 
  setNewProdStock,
  newProdColors, setNewProdColors,
  newProdSizes, setNewProdSizes,
  editProdColors, setEditProdColors,
  editProdSizes, setEditProdSizes
}: any) => {
  const [priceCurrency, setPriceCurrency] = useState<'NGN' | 'USD'>('NGN');

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

  const [newSize, setNewSize] = useState('');
  const [newColor, setNewColor] = useState('#000000');
  const [editSize, setEditSize] = useState('');
  const [editColor, setEditColor] = useState('#000000');

  const addSize = (isEdit = false) => {
    const size = isEdit ? editSize : newSize;
    if (!size) return;
    if (isEdit) {
      setEditProdSizes([...editProdSizes, size]);
      setEditSize('');
    } else {
      setNewProdSizes([...newProdSizes, size]);
      setNewSize('');
    }
  };

  const removeSize = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditProdSizes(editProdSizes.filter((_: any, i: number) => i !== index));
    } else {
      setNewProdSizes(newProdSizes.filter((_: any, i: number) => i !== index));
    }
  };

  const addColor = (isEdit = false) => {
    const color = isEdit ? editColor : newColor;
    if (!color) return;
    if (isEdit) {
      setEditProdColors([...editProdColors, color]);
    } else {
      setNewProdColors([...newProdColors, color]);
    }
  };

  const removeColor = (index: number, isEdit = false) => {
    if (isEdit) {
      setEditProdColors(editProdColors.filter((_: any, i: number) => i !== index));
    } else {
      setNewProdColors(newProdColors.filter((_: any, i: number) => i !== index));
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
                {uploadingImage ? '...' : 'Upload'}
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload}
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Sizes */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Sizes</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. XL, 42, 500g"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#d35400]"
                />
                <button 
                  type="button"
                  onClick={() => addSize(false)}
                  className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d35400] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newProdSizes.map((size: string, idx: number) => (
                  <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1">
                    {size}
                    <button type="button" onClick={() => removeSize(idx, false)} className="text-gray-400 hover:text-red-500">
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Colors */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Available Colors</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-10 p-1 bg-white border border-gray-200 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  placeholder="#000000"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:border-[#d35400]"
                />
                <button 
                  type="button"
                  onClick={() => addColor(false)}
                  className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#d35400] transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newProdColors.map((color: string, idx: number) => (
                  <span key={idx} className="p-1 bg-gray-100 rounded-md flex items-center gap-2 pr-2">
                    <div className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                    <span className="text-[10px] font-mono text-gray-500">{color}</span>
                    <button type="button" onClick={() => removeColor(idx, false)} className="text-gray-400 hover:text-red-500">
                      <Plus size={14} className="rotate-45" />
                    </button>
                  </span>
                ))}
              </div>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Sizes */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Sizes</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={editSize}
                              onChange={(e) => setEditSize(e.target.value)}
                              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#d35400]"
                              placeholder="Add size"
                            />
                            <button type="button" onClick={() => addSize(true)} className="bg-[#1a1a1a] text-white px-2 py-1 rounded-lg text-[10px] font-bold">Add</button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {editProdSizes.map((size: string, idx: number) => (
                              <span key={idx} className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-[10px] font-medium flex items-center gap-1">
                                {size}
                                <button type="button" onClick={() => removeSize(idx, true)} className="text-gray-400 hover:text-red-500"><Plus size={10} className="rotate-45" /></button>
                              </span>
                            ))}
                          </div>
                        </div>
                        {/* Colors */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase">Colors</label>
                          <div className="flex gap-1 items-center">
                            <input
                              type="color"
                              value={editColor}
                              onChange={(e) => setEditColor(e.target.value)}
                              className="w-6 h-6 p-0.5 bg-white border border-gray-200 rounded cursor-pointer"
                            />
                            <button type="button" onClick={() => addColor(true)} className="bg-[#1a1a1a] text-white px-2 py-1 rounded-lg text-[10px] font-bold">Add</button>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {editProdColors.map((color: string, idx: number) => (
                              <span key={idx} className="p-0.5 bg-gray-100 rounded flex items-center gap-1 pr-1">
                                <div className="w-3 h-3 rounded-full border border-black/10" style={{ backgroundColor: color }} />
                                <button type="button" onClick={() => removeColor(idx, true)} className="text-gray-400 hover:text-red-500"><Plus size={10} className="rotate-45" /></button>
                              </span>
                            ))}
                          </div>
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
                      className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                      onClick={() => {
                        setEditingStockId(prod.id);
                        setEditStockValue(prod.stock?.toString() || '0');
                      }}
                    >
                      Stock: {prod.stock ?? 0}
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
