import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { User, Mail, Phone, Calendar, ShoppingBag, LogOut, Shield, Settings, ArrowLeft, Camera, Save, X, Lock, ChevronRight, MapPin, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { getApiUrl } from '../utils/api';
import { AdminDashboard } from '../AdminDashboard';

import { Currency, formatPrice } from '../utils/currency';

interface ProfileProps {
  user: any;
  onLogout: () => void;
  onBackToStore: () => void;
  onUpdateUser?: (user: any) => void;
  currency: Currency;
  initialTab?: 'info' | 'orders' | 'admin';
  onTabChange?: (tab: 'info' | 'orders' | 'admin') => void;
  cartItems?: any[];
}

export function Profile({ user: initialUser, onLogout, onBackToStore, onUpdateUser, currency, initialTab = 'info', onTabChange, cartItems = [] }: ProfileProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'orders' | 'admin'>(initialTab);

  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);
  const [user, setUser] = useState(initialUser);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'created_at', direction: 'desc' });
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialUser.name || '');
  const [editContact, setEditContact] = useState(initialUser.contact_info || '');
  const [editAddress, setEditAddress] = useState(initialUser.address || '');
  const [editImage, setEditImage] = useState(initialUser.profile_image_url || '');
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const isAdmin = user && ['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff'].includes(user.role);

  useEffect(() => {
    fetchOrders();

    const socket = io(getApiUrl(''));
    
    socket.on('orderStatusUpdate', () => {
      fetchOrders();
    });

    return () => {
      socket.disconnect();
    };
  }, [isAdmin]);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedOrders = orders
    .filter(order => filterStatus === 'all' || (order.status && order.status.toUpperCase() === filterStatus.toUpperCase()))
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = getApiUrl('/api/orders');
      try {
        const res = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        } else {
          const text = await res.text().catch(() => 'No body');
          console.error(`Fetch error for ${url}: ${res.status} ${res.statusText}`, text);
        }
      } catch (err) {
        console.error(`Network error for ${url}:`, err);
        throw err;
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    setIsChangingPassword(true);
    const loadingToast = toast.loading('Updating password...');
    try {
      const res = await fetch(getApiUrl('/api/auth/change-password'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      
      const data = await res.json();
      if (res.ok) {
        toast.success('Password changed successfully');
        setShowChangePassword(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    } finally {
      setIsChangingPassword(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const loadingToast = toast.loading('Updating profile...');
    try {
      const res = await fetch(getApiUrl('/api/auth/me'), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editName,
          contact_info: editContact,
          address: editAddress,
          profile_image_url: editImage
        })
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        setIsEditing(false);
        if (onUpdateUser) {
          onUpdateUser(updatedUser);
        }
        toast.success('Profile updated successfully!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Network error');
    } finally {
      setIsSaving(false);
      toast.dismiss(loadingToast);
    }
  };

  if (activeTab === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 flex justify-between items-center">
          <button 
            onClick={onBackToStore}
            className="text-gray-500 hover:text-[#d35400] transition-colors flex items-center gap-2 font-medium"
          >
            <ArrowLeft size={18} /> Back to Store
          </button>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('info')}
              className="text-xs font-bold text-gray-500 uppercase tracking-widest hover:text-[#d35400]"
            >
              My Profile
            </button>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
            <button onClick={onLogout} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline">Logout</button>
          </div>
        </div>
        <AdminDashboard user={user} currency={currency} onUpdateUser={(updatedUser) => {
          setUser(updatedUser);
          if (onUpdateUser) {
            onUpdateUser(updatedUser);
          }
        }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <button 
            onClick={onBackToStore}
            className="text-gray-500 hover:text-[#d35400] transition-colors flex items-center gap-2 font-medium"
          >
            <ArrowLeft size={18} /> Back to Store
          </button>
          <button 
            onClick={onLogout}
            className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-2 font-bold text-sm uppercase tracking-widest"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-black/5 overflow-hidden"
        >
          <div className="bg-[#1a1a1a] p-8 sm:p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#d35400] rounded-full blur-3xl opacity-20 -mr-32 -mt-32"></div>
            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-8">
              <div className="relative w-32 h-32 rounded-full bg-white/10 border-4 border-white/20 flex items-center justify-center overflow-hidden group">
                {isEditing ? (
                  <>
                    {editImage ? (
                      <img src={editImage} alt="Edit Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={64} className="text-white/40" />
                    )}
                    <div 
                      className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={24} className="text-white" />
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleImageUpload} 
                      accept="image/*" 
                      className="hidden" 
                    />
                  </>
                ) : (
                  user.profile_image_url ? (
                    <img src={user.profile_image_url} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} className="text-white/40" />
                  )
                )}
              </div>
              <div className="text-center sm:text-left flex-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-4xl font-serif font-bold mb-2 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white w-full max-w-md focus:outline-none focus:border-[#d35400]"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-4xl font-serif font-bold mb-2">{user.name}</h1>
                )}
                <div className="flex flex-wrap justify-center sm:justify-start gap-4 mt-2">
                  <span className="bg-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                    {user.role.replace('_', ' ')}
                  </span>
                  {isAdmin && !isEditing && (
                    <button 
                      onClick={() => setActiveTab('admin')}
                      className="bg-[#d35400] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#e67e22] transition-colors flex items-center gap-1"
                    >
                      <Shield size={12} /> Admin Panel
                    </button>
                  )}
                </div>
              </div>
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
                  title="Edit Profile"
                >
                  <Settings size={20} />
                </button>
              ) : (
                <div className="flex gap-2 absolute top-0 right-0 sm:relative sm:top-auto sm:right-auto">
                  <button 
                    onClick={() => {
                      setIsEditing(false);
                      setEditName(user.name);
                      setEditContact(user.contact_info || '');
                      setEditAddress(user.address || '');
                      setEditImage(user.profile_image_url || '');
                    }}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors text-white"
                    title="Cancel"
                  >
                    <X size={20} />
                  </button>
                  <button 
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="bg-[#d35400] hover:bg-[#e67e22] p-2 rounded-full transition-colors text-white disabled:opacity-50"
                    title="Save Profile"
                  >
                    <Save size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-8 sm:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                <h2 className="text-xl font-serif font-bold text-[#1a1a1a] border-b border-black/5 pb-4">Personal Information</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <Mail size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="font-medium text-[#1a1a1a]">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <Phone size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contact Number</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editContact}
                          onChange={(e) => setEditContact(e.target.value)}
                          className="font-medium text-[#1a1a1a] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full max-w-xs focus:outline-none focus:border-[#d35400]"
                          placeholder="Phone Number"
                        />
                      ) : (
                        <p className="font-medium text-[#1a1a1a]">{user.contact_info || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address / Bus Stop</p>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editAddress}
                          onChange={(e) => setEditAddress(e.target.value)}
                          className="font-medium text-[#1a1a1a] bg-gray-50 border border-gray-200 rounded-lg px-3 py-1 w-full max-w-xs focus:outline-none focus:border-[#d35400]"
                          placeholder="123 Main St or Nearest Bus Stop"
                        />
                      ) : (
                        <p className="font-medium text-[#1a1a1a]">{user.address || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400">
                      <Calendar size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                      <p className="font-medium text-[#1a1a1a]">{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'March 2026'}</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-black/5">
                    {!showChangePassword ? (
                      <button 
                        onClick={() => setShowChangePassword(true)}
                        className="flex items-center gap-2 text-[#d35400] hover:text-[#e67e22] transition-colors font-bold text-xs uppercase tracking-widest"
                      >
                        <Lock size={14} /> Change Password
                      </button>
                    ) : (
                      <form onSubmit={handleChangePassword} className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-black/5">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-xs font-bold uppercase tracking-widest text-[#1a1a1a]">Change Password</h3>
                          <button type="button" onClick={() => setShowChangePassword(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                          </button>
                        </div>
                        <input
                          type="password"
                          placeholder="Current Password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        />
                        <input
                          type="password"
                          placeholder="New Password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        />
                        <input
                          type="password"
                          placeholder="Confirm New Password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]"
                        />
                        <button
                          type="submit"
                          disabled={isChangingPassword}
                          className="w-full bg-[#1a1a1a] hover:bg-[#d35400] text-white py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-50"
                        >
                          {isChangingPassword ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                  <h2 className="text-xl font-serif font-bold text-[#1a1a1a]">My Orders & Tracking</h2>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{orders.length} Total</span>
                </div>

                {/* Current Cart Section */}
                {cartItems.length > 0 && (
                  <div className="bg-[#d35400]/5 rounded-2xl p-6 border border-[#d35400]/10 mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-bold text-[#d35400] uppercase tracking-widest flex items-center gap-2">
                        <ShoppingBag size={16} /> Current Cart
                      </h3>
                      <button 
                        onClick={onBackToStore}
                        className="text-[10px] font-bold text-[#d35400] hover:underline uppercase tracking-widest"
                      >
                        Go to Checkout
                      </button>
                    </div>
                    <div className="space-y-3">
                      {cartItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#d35400]">{item.quantity}x</span>
                            <span className="text-gray-700">{item.name}</span>
                          </div>
                          <span className="font-medium">{formatPrice(item.price * item.quantity, currency)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 bg-white z-10 pb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter Status:</label>
                      <select 
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-600 focus:outline-none focus:border-[#d35400]"
                      >
                        <option value="all">All Orders</option>
                        <option value="PLACED">Placed</option>
                        <option value="PAID">Paid</option>
                        <option value="IN_PROGRESS">Preparing</option>
                        <option value="READY">Ready</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#d35400]"></div>
                    </div>
                  ) : filteredAndSortedOrders.length > 0 ? (
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-black/5">
                            <th 
                              className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#d35400]"
                              onClick={() => handleSort('id')}
                            >
                              Order ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#d35400]"
                              onClick={() => handleSort('created_at')}
                            >
                              Date {sortConfig.key === 'created_at' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#d35400]"
                              onClick={() => handleSort('status')}
                            >
                              Status {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                            <th 
                              className="pb-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest cursor-pointer hover:text-[#d35400] text-right"
                              onClick={() => handleSort('total_amount')}
                            >
                              Total {sortConfig.key === 'total_amount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                          {filteredAndSortedOrders.map((order) => (
                            <tr 
                              key={order.id} 
                              className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <td className="py-4 text-xs font-bold text-gray-500 font-mono">
                                {order.order_number || `#${order.id.toString().slice(0, 8)}`}
                              </td>
                              <td className="py-4 text-xs font-medium text-gray-600">
                                {new Date(order.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${
                                    order.status === 'COMPLETED' ? 'bg-emerald-500' : 
                                    order.status === 'CANCELLED' ? 'bg-red-500' : 
                                    'bg-amber-500'
                                  }`}></div>
                                  <span className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">{order.status}</span>
                                </div>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex flex-col items-end">
                                  <span className="text-sm font-bold text-[#d35400]">{formatPrice(order.total_amount, currency)}</span>
                                  <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">View Details</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-2xl p-6 border border-black/5">
                      <div className="flex flex-col items-center justify-center py-8 text-center">
                        <ShoppingBag size={48} className="text-gray-200 mb-4" />
                        <p className="text-gray-500 font-medium">No orders found</p>
                        <button 
                          onClick={onBackToStore}
                          className="mt-4 text-[#d35400] font-bold text-sm hover:underline"
                        >
                          Start Shopping
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-serif font-bold text-[#1a1a1a]">Order Details</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedOrder.order_number || `#${String(selectedOrder.id).slice(0, 12)}`}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                <div className="space-y-6">
                  {/* Status & Date */}
                  <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4 border border-black/5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedOrder.status === 'COMPLETED' ? 'bg-emerald-500' : 
                          selectedOrder.status === 'CANCELLED' ? 'bg-red-500' : 
                          'bg-amber-500'
                        }`}></div>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-widest">{selectedOrder.status}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Date</p>
                      <p className="text-xs font-bold text-gray-700">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
                    <div className="space-y-3">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-3 p-2 bg-white border border-black/5 rounded-xl">
                          <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                            <img src={item.image} alt={item.product_name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#1a1a1a] truncate">{item.product_name}</p>
                            <p className="text-[10px] text-gray-500 font-medium">Qty: {item.quantity} × {formatPrice(item.price, currency)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-[#d35400]">{formatPrice(item.price * item.quantity, currency)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="pt-4 border-t border-black/5 space-y-2">
                    {selectedOrder.order_type === 'delivery' && selectedOrder.delivery_address && (
                      <div className="mb-4 bg-purple-50 p-3 rounded-xl border border-purple-100">
                        <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                          <MapPin size={12} /> Delivery Address
                        </p>
                        <p className="text-xs text-purple-900 font-medium leading-relaxed">
                          {selectedOrder.delivery_address}
                        </p>
                      </div>
                    )}
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">Subtotal</span>
                      <span className="text-gray-700 font-bold">{formatPrice(selectedOrder.total_amount / 1.05, currency)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500 font-medium">VAT (5%)</span>
                      <span className="text-gray-700 font-bold">{formatPrice(selectedOrder.total_amount - (selectedOrder.total_amount / 1.05), currency)}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-black/5">
                      <span className="text-sm font-bold text-[#1a1a1a]">Total Amount</span>
                      <span className="text-lg font-serif font-bold text-[#d35400]">{formatPrice(selectedOrder.total_amount, currency)}</span>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-[#d35400]/5 rounded-2xl p-4 border border-[#d35400]/10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#d35400] rounded-lg text-white">
                        <CreditCard size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-[#d35400] uppercase tracking-widest">Payment Method</p>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">{selectedOrder.payment_method}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-black/5">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-bold text-sm hover:bg-black transition-colors"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
