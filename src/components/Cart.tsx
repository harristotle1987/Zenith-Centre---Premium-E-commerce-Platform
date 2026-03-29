import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { ShoppingCart, X, Plus, Minus, CreditCard, ShoppingBag, ArrowRight, Receipt, ShieldCheck, Landmark, Smartphone } from 'lucide-react';
import { usePaystackPayment } from 'react-paystack';
import { getApiUrl } from '../utils/api';
import { Product } from '../constants/products';
import { Currency, formatPrice, EXCHANGE_RATE } from '../utils/currency';

interface CartItem extends Product {
  cartItemId: string;
  quantity: number;
  customizations?: any;
}

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (type: 'delivery' | 'in-shop') => void;
  user: any;
  currency: Currency;
}

export function Cart({ isOpen, onClose, items, onUpdateQuantity, onRemove, onCheckout, user, currency }: CartProps) {
  const [orderType, setOrderType] = useState<'delivery' | 'in-shop'>('delivery');
  const [paymentTiming, setPaymentTiming] = useState<'before' | 'on-delivery'>('before');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer' | 'card'>('cash');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<string | null>(null);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestContact, setGuestContact] = useState(user?.contact_info || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');

  const [errors, setErrors] = useState<{ name?: string; email?: string; contact?: string; address?: string }>({});

  // Update fields when user changes
  React.useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestContact(user.contact_info || '');
      setDeliveryAddress(user.address || '');
    }
  }, [user]);

  React.useEffect(() => {
    if (paymentMethod === 'cash' && orderType === 'delivery' && paymentTiming === 'before') {
      setPaymentMethod('transfer');
    }
  }, [orderType, paymentTiming, paymentMethod]);

  const validate = () => {
    const newErrors: { name?: string; email?: string; contact?: string; address?: string } = {};
    if (!guestName.trim()) newErrors.name = 'Full name is required';
    if (!guestEmail.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(guestEmail)) {
      newErrors.email = 'Invalid email format';
    }
    if (!guestContact.trim()) newErrors.contact = 'Contact number is required';
    if (orderType === 'delivery' && !deliveryAddress.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const finalTotal = total * 1.05;

  // Paystack expects amount in kobo (smallest currency unit)
  const paystackAmount = Math.round(finalTotal * 100);

  const paystackPublicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

  const config = {
    reference: (new Date()).getTime().toString(),
    email: guestEmail,
    amount: paystackAmount,
    publicKey: paystackPublicKey || 'pk_test_placeholder',
    currency: 'NGN',
  };

  const initializePayment = usePaystackPayment(config);

  const processOrder = async (reference?: string) => {
    console.log('Processing order...', { reference, paymentMethod, orderType });
    setIsCheckingOut(true);
    const loadingToast = toast.loading('Placing your order...');
    try {
      const endpoint = user ? '/api/orders' : '/api/guest-orders';
      const headers: any = { 'Content-Type': 'application/json' };
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const body: any = {
        items: items.map(item => ({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          customizations: item.customizations
        })),
        total_amount: finalTotal,
        order_type: orderType,
        payment_method: paymentMethod,
        payment_timing: orderType === 'delivery' ? paymentTiming : null,
        payment_status: reference ? 'paid' : 'pending',
        payment_reference: reference,
        guest_name: guestName,
        guest_email: guestEmail,
        guest_contact: guestContact,
        delivery_address: orderType === 'delivery' ? deliveryAddress : null
      };

      console.log('Sending order request to:', endpoint, body);

      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (res.ok) {
        const data = await res.json();
        console.log('Order successful:', data);
        setOrderSuccess(data.orderNumber || data.orderId);
        toast.success('Order placed successfully!');
        onCheckout(orderType);
      } else {
        const errorData = await res.json();
        console.error('Order failed response:', errorData);
        toast.error(errorData.error || 'Order recording failed. Please try again or contact support.');
      }
    } catch (err) {
      console.error('Order connection error:', err);
      toast.error('Connection error while recording order');
    } finally {
      setIsCheckingOut(false);
      toast.dismiss(loadingToast);
    }
  };

  const handleCheckout = async () => {
    console.log('Handle checkout initiated');
    if (!validate()) {
      console.log('Validation failed', errors);
      return;
    }
    
    if (paymentMethod === 'card') {
      if (!paystackPublicKey || paystackPublicKey === 'pk_test_placeholder') {
        toast.error('Payment system is not fully configured. Please contact the administrator to set the Paystack Public Key.');
        return;
      }
      initializePayment({
        onSuccess: (reference: any) => {
          processOrder(reference.reference);
        },
        onClose: () => {
          toast.info('Payment was cancelled.');
        }
      });
    } else {
      processOrder();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-[101] shadow-2xl overflow-y-auto"
          >
            <div className="p-6 border-b border-black/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-[#d35400]/10 p-2 rounded-xl">
                  <ShoppingBag className="text-[#d35400]" size={24} />
                </div>
                <h2 className="text-2xl font-serif font-bold text-[#1a1a1a]">Your Order</h2>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto p-6 custom-scrollbar">
              {orderSuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Receipt size={40} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-2">Order Placed!</h3>
                  <p className="text-gray-500 mb-6">Order {orderSuccess} has been recorded. {paymentMethod === 'transfer' ? 'Please present your transfer receipt at the counter for manual verification.' : 'Please proceed to the counter for card payment verification.'}</p>
                  <button 
                    onClick={() => {
                      setOrderSuccess(null);
                      onClose();
                    }}
                    className="w-full bg-[#1a1a1a] text-white py-4 rounded-xl font-bold hover:bg-[#d35400] transition-all"
                  >
                    Continue Shopping
                  </button>
                </motion.div>
              ) : items.length === 0 ? (
                <div className="text-center py-20">
                  <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingCart size={40} />
                  </div>
                  <p className="text-gray-400 font-medium">Your cart is empty</p>
                  <button onClick={onClose} className="mt-4 text-[#d35400] font-bold hover:underline">Start Ordering</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 pb-8">
                  {items.map((item, index) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      key={item.cartItemId || `${item.id}-${index}`} 
                      onClick={() => setEditingItemId(editingItemId === item.cartItemId ? null : item.cartItemId)}
                      className={`relative flex items-center gap-4 group cursor-pointer p-3 rounded-xl transition-all ${editingItemId === item.cartItemId ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                    >
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-black/5 flex-shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-serif font-bold text-[#1a1a1a] truncate">{item.name}</h4>
                        {item.customizations && Object.keys(item.customizations).length > 0 && (
                          <p className="text-xs text-gray-500 truncate">
                            {Object.entries(item.customizations).map(([k, v]) => `${k}: ${v}`).join(', ')}
                          </p>
                        )}
                        <p className="text-[#d35400] font-bold text-sm">{formatPrice(Number(item.price), currency)} x {item.quantity}</p>
                      </div>
                      {editingItemId === item.cartItemId && (
                        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-xl flex items-center justify-center gap-4 z-10 p-4">
                          <div className="flex items-center bg-gray-100 rounded-lg p-1">
                            <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.cartItemId, -1); }} className="p-2 hover:bg-white rounded-md"><Minus size={16} /></button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <button onClick={(e) => { e.stopPropagation(); onUpdateQuantity(item.cartItemId, 1); }} className="p-2 hover:bg-white rounded-md"><Plus size={16} /></button>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); onRemove(item.cartItemId); }} className="text-sm font-bold text-red-500 hover:underline">Remove</button>
                          <button onClick={(e) => { e.stopPropagation(); setEditingItemId(null); }} className="text-sm font-bold text-gray-500 hover:underline">Done</button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {!orderSuccess && items.length > 0 && (
              <div className="p-6 bg-gray-50 border-t border-black/5 space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => setOrderType('delivery')}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border ${orderType === 'delivery' ? 'bg-[#d35400] text-white border-[#d35400] shadow-lg shadow-[#d35400]/20' : 'bg-white text-gray-600 border-gray-200 hover:border-[#d35400]'}`}
                    >
                      Delivery
                    </button>
                    <button 
                      onClick={() => setOrderType('in-shop')}
                      className={`py-3 rounded-xl text-sm font-bold transition-all border ${orderType === 'in-shop' ? 'bg-[#d35400] text-white border-[#d35400] shadow-lg shadow-[#d35400]/20' : 'bg-white text-gray-600 border-gray-200 hover:border-[#d35400]'}`}
                    >
                      In-Shop
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-black/5">
                  <div className="mb-4 space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Order Identification</label>
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        placeholder="Full Name" 
                        value={guestName}
                        onChange={(e) => {
                          setGuestName(e.target.value);
                          if (errors.name) setErrors({ ...errors, name: undefined });
                        }}
                        className={`w-full bg-white border ${errors.name ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]`}
                        required
                      />
                      {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="email" 
                        placeholder="Email Address" 
                        value={guestEmail}
                        onChange={(e) => {
                          setGuestEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: undefined });
                        }}
                        className={`w-full bg-white border ${errors.email ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]`}
                        required
                      />
                      {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                    </div>
                    <div className="space-y-1">
                      <input 
                        type="text" 
                        placeholder="Contact Number" 
                        value={guestContact}
                        onChange={(e) => {
                          setGuestContact(e.target.value);
                          if (errors.contact) setErrors({ ...errors, contact: undefined });
                        }}
                        className={`w-full bg-white border ${errors.contact ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400]`}
                        required
                      />
                      {errors.contact && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.contact}</p>}
                    </div>

                    {orderType === 'delivery' && (
                      <div className="space-y-1">
                        <textarea 
                          placeholder="Delivery Address / Nearest Bus Stop" 
                          value={deliveryAddress}
                          onChange={(e) => {
                            setDeliveryAddress(e.target.value);
                            if (errors.address) setErrors({ ...errors, address: undefined });
                          }}
                          className={`w-full bg-white border ${errors.address ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#d35400] min-h-[80px]`}
                          required
                        />
                        {errors.address && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.address}</p>}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t border-black/5">
                    {orderType === 'delivery' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Timing</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button 
                            onClick={() => setPaymentTiming('before')}
                            className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${paymentTiming === 'before' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                          >
                            Pay Before
                          </button>
                          <button 
                            onClick={() => setPaymentTiming('on-delivery')}
                            className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${paymentTiming === 'on-delivery' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                          >
                            Pay On Delivery
                          </button>
                        </div>
                      </div>
                    )}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Method</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(orderType === 'in-shop' || paymentTiming === 'on-delivery') && (
                          <button 
                            onClick={() => setPaymentMethod('cash')}
                            className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${paymentMethod === 'cash' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                          >
                            Cash
                          </button>
                        )}
                        <button 
                          onClick={() => setPaymentMethod('transfer')}
                          className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${paymentMethod === 'transfer' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                        >
                          Transfer
                        </button>
                        <button 
                          onClick={() => setPaymentMethod('card')}
                          className={`py-2 rounded-lg text-[10px] font-bold transition-all border flex items-center justify-center gap-1 ${paymentMethod === 'card' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a] shadow-lg' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                        >
                          <CreditCard size={12} /> Card
                        </button>
                      </div>
                      <p className="text-[9px] text-gray-400 mt-1 italic">* {orderType === 'delivery' ? 'Payment method for delivery' : 'Payment method for in-shop purchase'}</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-black/5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="font-bold text-gray-900">{formatPrice(total, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Estimated Tax (5%)</span>
                        <span className="font-bold text-gray-900">{formatPrice(total * 0.05, currency)}</span>
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-black/5">
                        <span className="text-lg font-serif font-bold text-[#1a1a1a]">Total</span>
                        <span className="text-2xl font-serif font-bold text-[#d35400]">{formatPrice(total * 1.05, currency)}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={onClose}
                      className="w-full bg-white border border-gray-200 text-gray-600 py-4 rounded-xl font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
                    >
                      Continue Shopping
                    </button>
                    <button 
                      onClick={() => handleCheckout()}
                      disabled={isCheckingOut}
                      className="w-full bg-[#d35400] hover:bg-[#e67e22] text-white py-4 rounded-xl font-bold shadow-xl transition-all flex items-center justify-center gap-2 group"
                    >
                      {isCheckingOut ? 'Recording Order...' : 'Confirm & Place Order'}
                      {!isCheckingOut && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                    <p className="text-[10px] text-center text-gray-400 mt-4 uppercase tracking-widest font-bold">Manual verification required at checkout</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
