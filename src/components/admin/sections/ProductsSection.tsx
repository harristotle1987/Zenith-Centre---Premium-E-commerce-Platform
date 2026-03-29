import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Package } from 'lucide-react';
import { formatPrice } from '../../../utils/currency';

export const ProductsSection = ({ 
  products, departments, loading, addProduct, updateProduct, deleteProduct, 
  updateStock, startEditingProduct, editingProductId, setEditingProductId, 
  editProdName, setEditProdName, editProdPrice, setEditProdPrice, 
  editProdDescription, setEditProdDescription, editProdImage, setEditProdImage, 
  editProdDept, setEditProdDept, editProdStock, setEditStockValue, 
  editingStockId, setEditingStockId, editStockValue, uploadingImage, 
  handleImageUpload, uploadingEditImage, handleEditImageUpload, 
  currency, exchangeRate, minStockThreshold, newProdName, setNewProdName, 
  newProdPrice, setNewProdPrice, newProdDescription, setNewProdDescription, 
  newProdImage, setNewProdImage, newProdDept, setNewProdDept, newProdStock, 
  setNewProdStock 
}: any) => {
  const [priceCurrency, setPriceCurrency] = useState<'NGN' | 'USD'>('NGN');

  const toggleCurrency = () => {
    setPriceCurrency(prev => prev === 'NGN' ? 'USD' : 'NGN');
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
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Price ({priceCurrency === 'NGN' ? '₦' : '$'})</label>
              <button type="button" onClick={toggleCurrency} className="text-[10px] font-bold text-[#d35400] bg-[#d35400]/10 px-2 py-0.5 rounded uppercase tracking-widest hover:bg-[#d35400]/20">
                Switch to {priceCurrency === 'NGN' ? 'USD' : 'Naira'}
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newProdPrice}
              onChange={(e) => setNewProdPrice(e.target.value)}
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
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-black/5 flex-shrink-0">
                  <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="font-serif font-bold text-lg text-[#1a1a1a]">{prod.name}</p>
                  {prod.description && (
                    <p className="text-xs text-gray-500 line-clamp-1 mb-1">{prod.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-[#d35400]">{formatPrice(Number(prod.price), currency)}</span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">{prod.department}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                {editingProductId === prod.id ? (
                  <div className="flex flex-col gap-3 w-full bg-gray-50 p-4 rounded-xl border border-black/5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={editProdName}
                        onChange={(e) => setEditProdName(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        placeholder="Name"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={editProdPrice}
                        onChange={(e) => setEditProdPrice(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        placeholder={`Price (${currency === 'USD' ? '$' : '₦'})`}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <select
                        value={editProdDept}
                        onChange={(e) => setEditProdDept(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                      >
                        {departments.map((dept: string) => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={editProdStock}
                        onChange={(e) => setEditStockValue(e.target.value)}
                        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        placeholder="Stock"
                      />
                    </div>
                    <textarea
                      value={editProdDescription}
                      onChange={(e) => setEditProdDescription(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400] resize-none"
                      placeholder="Description (Optional)"
                      rows={2}
                    />
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
