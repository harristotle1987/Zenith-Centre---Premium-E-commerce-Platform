import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { io } from 'socket.io-client';
import { Product } from './constants/products';
import { Trash2, Plus, Database, TrendingUp, Users, Package, Layers, DollarSign, Calendar, User as UserIcon, ShoppingBag, Menu, X, ChevronDown, Check, Edit, Activity, Settings, Search, MapPin, Phone, Shield, Printer, Eye, EyeOff } from 'lucide-react';
import { getApiUrl } from './utils/api';
import { Currency, formatPrice } from './utils/currency';
import { toast } from 'sonner';
import { Logo } from './components/Logo';
import { ProductsSection } from './components/admin/sections/ProductsSection';
import { CurrencyToggle } from './components/CurrencyToggle';
import { ProductModal } from './components/ProductModal';

interface AdminDashboardProps {
  user: any;
  currency: Currency;
  onUpdateUser?: (user: any) => void;
  onCurrencyChange: (currency: Currency) => void;
  onLogout?: () => void;
}

export function AdminDashboard({ user, currency, onUpdateUser, onCurrencyChange, onLogout }: AdminDashboardProps) {
  const baseUrl = getApiUrl('');
  const [activeTab, setActiveTab] = useState<'pos' | 'products' | 'departments' | 'accounts' | 'staff' | 'transactions' | 'activities' | 'pending_orders' | 'settings'>(() => {
    return (localStorage.getItem('adminActiveTab') as any) || 'pos';
  });

  useEffect(() => {
    localStorage.setItem('adminActiveTab', activeTab);
  }, [activeTab]);
  const [minStockThreshold, setMinStockThreshold] = useState(5);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [featuredImageUrl1, setFeaturedImageUrl1] = useState('');
  const [featuredImageUrl2, setFeaturedImageUrl2] = useState('');
  const [featuredImageUrl3, setFeaturedImageUrl3] = useState('');
  const [featuredImageUrl4, setFeaturedImageUrl4] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(user?.profile_image_url || '');
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileContact, setProfileContact] = useState(user?.contact_info || '');
  const [exchangeRate, setExchangeRate] = useState(1500);
  const [newExchangeRate, setNewExchangeRate] = useState('1500');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityRoleFilter, setActivityRoleFilter] = useState('all');
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [pendingSearchTerm, setPendingSearchTerm] = useState('');

  const filteredPendingOrders = useMemo(() => {
    let filtered = pendingOrders;
    
    if (pendingSearchTerm) {
      const term = pendingSearchTerm.toLowerCase();
      filtered = filtered.filter(order => 
        (order.order_number && order.order_number.toLowerCase().includes(term)) ||
        (order.guest_name && order.guest_name.toLowerCase().includes(term)) ||
        (order.guest_email && order.guest_email.toLowerCase().includes(term))
      );
    }

    if (filterMethod !== 'all') {
      filtered = filtered.filter(order => order.status && order.status.toUpperCase() === filterMethod.toUpperCase());
    } else {
      // Default view: show everything except completed/cancelled
      filtered = filtered.filter(order => {
        if (!order.status) return true;
        const status = order.status.toUpperCase();
        return status !== 'COMPLETED' && status !== 'CANCELLED';
      });
    }
    
    return filtered;
  }, [pendingOrders, filterMethod, pendingSearchTerm]);
  
  // POS State
  const [posCart, setPosCart] = useState<{ product: Product, quantity: number }[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [posSearch, setPosSearch] = useState('');
  const [posPaymentMethod, setPosPaymentMethod] = useState<'card' | 'cash' | 'transfer'>('cash');
  const [posCustomerName, setPosCustomerName] = useState('');
  const [posCustomerEmail, setPosCustomerEmail] = useState('');
  const [posCustomerContact, setPosCustomerContact] = useState('');
  const [isProcessingPos, setIsProcessingPos] = useState(false);
  const [posOrderSuccess, setPosOrderSuccess] = useState<string | number | null>(null);
  const [posReceiptData, setPosReceiptData] = useState<any>(null);
  const [posOrderType, setPosOrderType] = useState<'in-shop' | 'take-away' | 'delivery'>('in-shop');
  const [selectedPosProduct, setSelectedPosProduct] = useState<Product | null>(null);
  const [posProductCustomizations, setPosProductCustomizations] = useState<any>({});
  const [posShowOptionErrors, setPosShowOptionErrors] = useState(false);

  const getMissingPosOptions = () => {
    if (!selectedPosProduct) return [];
    const missing: string[] = [];
    
    if (selectedPosProduct.options) {
      Object.keys(selectedPosProduct.options).forEach(key => {
        if (!posProductCustomizations[key]) {
          missing.push(key);
        }
      });
    } else if (selectedPosProduct.department === 'Coffee' || selectedPosProduct.department === 'Tea & Other') {
      if (!posProductCustomizations.size) missing.push('size');
      if (!posProductCustomizations.milk) missing.push('milk');
    }
    
    return missing;
  };
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState<any[]>([]);
  const [showAddRoleModal, setShowAddRoleModal] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDescription, setNewRoleDescription] = useState('');
  const [reportData, setReportData] = useState<any>(null);
  const [reportPeriod, setReportPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually'>('daily');
  const [loadingReport, setLoadingReport] = useState(false);

  // Accounts State
  const [accountsData, setAccountsData] = useState<{ totalInflow: number, recentOrders: any[] }>({ totalInflow: 0, recentOrders: [] });
  
  // Staff State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('accountant');
  const [newStaffContact, setNewStaffContact] = useState('');
  const [newStaffId, setNewStaffId] = useState('');
  const [newStaffImage, setNewStaffImage] = useState('');
  const [newStaffDepartments, setNewStaffDepartments] = useState<string[]>([]);
  const [isDeptDropdownOpen, setIsDeptDropdownOpen] = useState(false);
  const [uploadingStaffImage, setUploadingStaffImage] = useState(false);

  // Edit Staff State
  const [editingStaffId, setEditingStaffId] = useState<number | null>(null);
  const [editStaffName, setEditStaffName] = useState('');
  const [editStaffRole, setEditStaffRole] = useState('');
  const [editStaffContact, setEditStaffContact] = useState('');
  const [editStaffIdVal, setEditStaffIdVal] = useState('');
  const [editStaffImage, setEditStaffImage] = useState('');
  const [editStaffDepartments, setEditStaffDepartments] = useState<string[]>([]);
  const [isEditDeptDropdownOpen, setIsEditDeptDropdownOpen] = useState(false);
  const [showEditStaffModal, setShowEditStaffModal] = useState(false);
  const [uploadingEditStaffImage, setUploadingEditStaffImage] = useState(false);
  
  const [selectedStaffActivities, setSelectedStaffActivities] = useState<any[]>([]);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [viewingStaffName, setViewingStaffName] = useState('');
  const [viewingDeptProducts, setViewingDeptProducts] = useState<string | null>(null);
  
  const [newDeptName, setNewDeptName] = useState('');
  
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdDiscountPercentage, setNewProdDiscountPercentage] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [newProdImage, setNewProdImage] = useState('');
  const [newProdDept, setNewProdDept] = useState('');
  const [newProdStock, setNewProdStock] = useState('100');
  const [newProdOptions, setNewProdOptions] = useState<Record<string, string[]>>({});
  const [newProdPriceModifiers, setNewProdPriceModifiers] = useState<Record<string, Record<string, number>>>({});
  const [newProdGallery, setNewProdGallery] = useState<string[]>([]);
  const [newProdOptionImages, setNewProdOptionImages] = useState<Record<string, Record<string, string>>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  
  // Confirmation Modal State
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    isDanger?: boolean;
  } | null>(null);

  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState('');

  const pendingCount = useMemo(() => 
    pendingOrders.filter(o => !o.status || (o.status.toUpperCase() !== 'COMPLETED' && o.status.toUpperCase() !== 'CANCELLED')).length
  , [pendingOrders]);

  const transactionCount = useMemo(() => transactions.length, [transactions]);
  const activityCount = useMemo(() => allActivities.length, [allActivities]);
  
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    const headers: any = { ...options.headers };
    
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    if (options.body && typeof options.body === 'string' && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    try {
      const res = await fetch(url, { ...options, headers });
      
      if (res.status === 401 || res.status === 403) {
        console.error('Session expired or unauthorized');
        toast.error('Session expired. Please login again.');
        if (onLogout) onLogout();
        throw new Error('Unauthorized');
      }
      
      return res;
    } catch (err) {
      console.error(`Fetch error for ${url}:`, err);
      throw err;
    }
  };

  const [editProdName, setEditProdName] = useState('');
  const [editProdPrice, setEditProdPrice] = useState('');
  const [editProdOriginalPrice, setEditProdOriginalPrice] = useState('');
  const [editProdDiscountPercentage, setEditProdDiscountPercentage] = useState('');
  const [editProdDescription, setEditProdDescription] = useState('');
  const [editProdImage, setEditProdImage] = useState('');
  const [editProdDept, setEditProdDept] = useState('');
  const [editProdStock, setEditProdStock] = useState('');
  const [editProdOptions, setEditProdOptions] = useState<Record<string, string[]>>({});
  const [editProdPriceModifiers, setEditProdPriceModifiers] = useState<Record<string, Record<string, number>>>({});
  const [editProdGallery, setEditProdGallery] = useState<string[]>([]);
  const [editProdOptionImages, setEditProdOptionImages] = useState<Record<string, Record<string, string>>>({});
  const [uploadingNewImage, setUploadingNewImage] = useState(false);
  const [uploadingEditImage, setUploadingEditImage] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [showTransactionModal, setShowTransactionModal] = useState(false);

  const handleNewImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    console.log('Files to upload:', files);

    setUploadingNewImage(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      console.log('Upload response:', data);
      if (data.urls) {
        setNewProdGallery(prev => [...prev, ...data.urls]);
        if (!newProdImage && data.urls.length > 0) {
          setNewProdImage(data.urls[0]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploadingNewImage(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    console.log('Files to upload (edit):', files);

    setUploadingEditImage(true);
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('images', files[i]);
    }

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      const data = await response.json();
      console.log('Upload response (edit):', data);
      if (data.urls) {
        setEditProdGallery(prev => [...prev, ...data.urls]);
        if (!editProdImage && data.urls.length > 0) {
          setEditProdImage(data.urls[0]);
        }
      }
    } catch (error) {
      console.error('Upload error (edit):', error);
    } finally {
      setUploadingEditImage(false);
    }
  };


  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${localStorage.getItem('token')}` };
      const [deptRes, prodRes] = await Promise.all([
        fetchWithAuth(getApiUrl('/api/departments')),
        fetchWithAuth(getApiUrl('/api/products'))
      ]);
      
      if (!deptRes.ok || !prodRes.ok) throw new Error('Failed to fetch base data');

      const depts = await deptRes.json();
      const prods = await prodRes.json();
      setDepartments(depts.filter((d: string) => d !== 'All'));
      setProducts(prods);

      if (user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') {
        const [accRes, transRes] = await Promise.all([
          fetchWithAuth(getApiUrl('/api/admin/accounts'), { headers }),
          fetchWithAuth(getApiUrl('/api/admin/transactions'), { headers })
        ]);
        if (accRes.ok) setAccountsData(await accRes.json());
        if (transRes.ok) setTransactions(await transRes.json());
      }

      if (user?.role === 'super_admin' || user?.role === 'manager') {
        const settingsRes = await fetchWithAuth(getApiUrl('/api/admin/settings'), { headers });
        if (settingsRes.ok) {
          const settings = await settingsRes.json();
          if (settings.minStockThreshold) setMinStockThreshold(Number(settings.minStockThreshold));
          if (settings.heroImageUrl) setHeroImageUrl(settings.heroImageUrl);
          if (settings.featuredImageUrl1) setFeaturedImageUrl1(settings.featuredImageUrl1);
          if (settings.featuredImageUrl2) setFeaturedImageUrl2(settings.featuredImageUrl2);
          if (settings.featuredImageUrl3) setFeaturedImageUrl3(settings.featuredImageUrl3);
          if (settings.featuredImageUrl4) setFeaturedImageUrl4(settings.featuredImageUrl4);
        }
      }

      if (user?.role === 'super_admin' || user?.role === 'manager') {
        const [staffRes, activitiesRes, usersRes, rolesRes] = await Promise.all([
          fetchWithAuth(getApiUrl('/api/admin/staff'), { headers }),
          fetchWithAuth(getApiUrl('/api/admin/activities'), { headers }),
          fetchWithAuth(getApiUrl('/api/admin/users'), { headers }),
          fetchWithAuth(getApiUrl('/api/admin/roles'), { headers })
        ]);
        if (staffRes.ok) setStaffList(await staffRes.json());
        if (activitiesRes.ok) setAllActivities(await activitiesRes.json());
        if (usersRes.ok) setAllUsers(await usersRes.json());
        if (rolesRes.ok) setRoles(await rolesRes.json());
      }

      // Fetch pending orders for all allowed roles
      if (user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') {
        const [ordersRes, rateRes] = await Promise.all([
          fetchWithAuth(getApiUrl('/api/admin/orders'), { headers }),
          fetchWithAuth(getApiUrl('/api/exchange-rate'))
        ]);
        if (ordersRes.ok) setPendingOrders(await ordersRes.json());
        if (rateRes.ok) {
          const rateData = await rateRes.json();
          setExchangeRate(Number(rateData.exchange_rate));
          setNewExchangeRate(rateData.exchange_rate);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      showMessage('Failed to load dashboard data. Please check your connection.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'accountant') {
      setActiveTab('accounts');
    } else if (user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') {
      setActiveTab('products');
    }
    fetchData();

    const socket = io();
    
    socket.on('newOrder', () => {
      fetchData(true);
      showMessage('New order received!', 'success');
    });

    socket.on('orderAdded', (newOrder) => {
      setPendingOrders(prev => [newOrder, ...prev]);
      showMessage('New order received!', 'success');
    });

    socket.on('transactionAdded', (newTransaction) => {
      setTransactions(prev => [newTransaction, ...prev]);
    });

    socket.on('activityAdded', (newActivity) => {
      setAllActivities(prev => [newActivity, ...prev]);
    });

    socket.on('productAdded', (newProduct) => {
      setProducts(prev => [...prev, newProduct]);
    });

    socket.on('productUpdated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    });

    socket.on('productDeleted', (deletedId) => {
      setProducts(prev => prev.filter(p => p.id !== deletedId));
    });

    socket.on('deliveryStatusUpdate', ({ orderId, deliveryStatus }) => {
      setPendingOrders(prev => prev.map(o => Number(o.id) === Number(orderId) ? { ...o, delivery_status: deliveryStatus } : o));
      setTransactions(prev => prev.map(t => Number(t.id) === Number(orderId) ? { ...t, delivery_status: deliveryStatus } : t));
    });

    socket.on('orderStatusUpdate', () => {
      fetchData(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // Polling fallback for orders if socket fails
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchData(true);
    }, 60000); // Poll every 60 seconds

    return () => clearInterval(interval);
  }, [user]);

  const showMessage = (msg: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(msg);
    } else {
      toast.error(msg);
    }
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 3000);
  };

  const updateExchangeRate = async () => {
    const loadingToast = toast.loading('Updating exchange rate...');
    try {
      const res = await fetch(getApiUrl('/api/admin/exchange-rate'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ exchange_rate: newExchangeRate })
      });
      if (res.ok) {
        setExchangeRate(Number(newExchangeRate));
        showMessage('Exchange rate updated successfully!');
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to update exchange rate.', 'error');
      }
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      showMessage('Error updating exchange rate.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const initDb = async () => {
    const loadingToast = toast.loading('Initializing database...');
    try {
      const res = await fetch(getApiUrl('/api/init-db?reset=true'), { 
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        showMessage('Database reset and initialized successfully!');
        fetchData();
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to initialize database.', 'error');
      }
    } catch (error) {
      showMessage('Error initializing database.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const checkDbHealth = async () => {
    const loadingToast = toast.loading('Checking database health...');
    try {
      const res = await fetch(getApiUrl('/api/db-health'));
      const data = await res.json();
      if (res.ok) {
        showMessage(`Database Connected! Status: ${data.status}`);
      } else {
        showMessage(`Database Error: ${data.message}. Details: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Health check failed:', error);
      showMessage('Failed to reach the server. Please check your internet connection.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const addDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName) return;
    const loadingToast = toast.loading('Adding department...');
    try {
      const res = await fetch(getApiUrl('/api/departments'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: newDeptName })
      });
      if (res.ok) {
        setNewDeptName('');
        showMessage('Department added!');
        fetchData();
      } else {
        const data = await res.json();
        showMessage(data.error || data.details || 'Failed to add department.', 'error');
      }
    } catch (error) {
      console.error('Error adding department:', error);
      showMessage('Error adding department. Please check your connection.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const deleteDepartment = async (name: string) => {
    setConfirmConfig({
      title: 'Delete Department',
      message: `Are you sure you want to delete "${name}"? This will permanently remove all products in this department.`,
      isDanger: true,
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting department...');
        try {
          const res = await fetch(getApiUrl(`/api/departments/${encodeURIComponent(name)}`), { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            showMessage('Department deleted!');
            fetchData();
          } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to delete department.', 'error');
          }
        } catch (error) {
          showMessage('Error deleting department.', 'error');
        } finally {
          toast.dismiss(loadingToast);
        }
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice || !newProdDept) return;
    const loadingToast = toast.loading('Adding product...');
    try {
      const res = await fetch(getApiUrl('/api/products'), {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newProdName,
          price: parseFloat(newProdPrice),
          original_price: newProdOriginalPrice ? parseFloat(newProdOriginalPrice) : null,
          discount_percentage: newProdDiscountPercentage ? parseFloat(newProdDiscountPercentage) : null,
          description: newProdDescription,
          image_url: newProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
          department_name: newProdDept,
          stock_quantity: parseInt(newProdStock, 10) || 0,
          options: Object.keys(newProdOptions).length > 0 ? newProdOptions : undefined,
          optionPriceModifiers: Object.keys(newProdPriceModifiers).length > 0 ? newProdPriceModifiers : undefined,
          gallery: newProdGallery.length > 0 ? newProdGallery : undefined,
          optionImages: Object.keys(newProdOptionImages).length > 0 ? newProdOptionImages : undefined
        })
      });
      if (res.ok) {
        setNewProdName('');
        setNewProdPrice('');
        setNewProdDescription('');
        setNewProdImage('');
        setNewProdDept('');
        setNewProdStock('100');
        setNewProdOptions({});
        setNewProdPriceModifiers({});
        setNewProdGallery([]);
        setNewProdOptionImages({});
        showMessage('Product added!');
      } else {
        const data = await res.json();
        showMessage(data.error || data.details || 'Failed to add product.', 'error');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      showMessage('Error adding product. Please check your connection.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const startEditingProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setEditProdName(prod.name || '');
    setEditProdPrice(prod.price?.toString() || '');
    setEditProdOriginalPrice(prod.originalPrice?.toString() || '');
    setEditProdDiscountPercentage(prod.discountPercentage?.toString() || '');
    setEditProdDescription(prod.description || '');
    setEditProdImage(prod.image || '');
    setEditProdDept(prod.department || '');
    setEditProdStock(prod.stock?.toString() || '0');
    setEditProdOptions(prod.options || {});
    setEditProdPriceModifiers(prod.optionPriceModifiers || {});
    setEditProdGallery(prod.gallery || []);
    setEditProdOptionImages(prod.optionImages || {});
  };

  const updateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId || !editProdName || !editProdPrice || !editProdDept) return;
    
    const loadingToast = toast.loading('Updating product...');
    try {
      const res = await fetch(getApiUrl(`/api/products/${editingProductId}`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: editProdName,
          price: parseFloat(editProdPrice),
          original_price: editProdOriginalPrice ? parseFloat(editProdOriginalPrice) : null,
          discount_percentage: editProdDiscountPercentage ? parseFloat(editProdDiscountPercentage) : null,
          description: editProdDescription,
          image_url: editProdImage || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
          department_name: editProdDept,
          stock_quantity: parseInt(editProdStock, 10) || 0,
          options: Object.keys(editProdOptions).length > 0 ? editProdOptions : undefined,
          optionPriceModifiers: Object.keys(editProdPriceModifiers).length > 0 ? editProdPriceModifiers : undefined,
          gallery: editProdGallery.length > 0 ? editProdGallery : undefined,
          optionImages: Object.keys(editProdOptionImages).length > 0 ? editProdOptionImages : undefined
        })
      });
      if (res.ok) {
        showMessage('Product updated successfully.');
        setEditingProductId(null);
        setEditProdOptions({});
        setEditProdPriceModifiers({});
        setEditProdGallery([]);
        setEditProdOptionImages({});
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to update product.', 'error');
      }
    } catch (error) {
      showMessage('Error updating product. Please check your connection.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const deleteProduct = async (id: string) => {
    setConfirmConfig({
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product from the menu?',
      isDanger: true,
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting product...');
        try {
          const res = await fetch(getApiUrl(`/api/products/${id}`), { 
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            showMessage('Product deleted!');
          } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to delete product.', 'error');
          }
        } catch (error) {
          showMessage('Error deleting product.', 'error');
        } finally {
          toast.dismiss(loadingToast);
        }
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const updateStock = async (id: string) => {
    const loadingToast = toast.loading('Updating stock...');
    try {
      const res = await fetch(getApiUrl(`/api/products/${id}/stock`), {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ stock_quantity: parseInt(editStockValue, 10) || 0 })
      });
      if (res.ok) {
        showMessage('Stock updated successfully.');
        setEditingStockId(null);
        fetchData();
      } else {
        showMessage('Failed to update stock.', 'error');
      }
    } catch (error) {
      showMessage('Error updating stock.', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const handleStaffImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingStaffImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewStaffImage(reader.result as string);
      setUploadingStaffImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleEditStaffImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingEditStaffImage(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditStaffImage(reader.result as string);
      setUploadingEditStaffImage(false);
    };
    reader.readAsDataURL(file);
  };

  const fetchActivities = async (staffId: number, staffName: string) => {
    const loadingToast = toast.loading(`Fetching activities for ${staffName}...`);
    try {
      const res = await fetch(getApiUrl(`/api/admin/staff/${staffId}/activities`), {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setSelectedStaffActivities(await res.json());
        setViewingStaffName(staffName);
        setShowActivitiesModal(true);
      } else {
        const data = await res.json();
        showMessage(data.error || data.details || 'Failed to fetch activities');
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
      showMessage('Failed to fetch activities. Please check your connection.');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const deleteStaff = async (id: number) => {
    setConfirmConfig({
      title: 'Delete Staff',
      message: 'Are you sure you want to delete this staff member? This action cannot be undone.',
      isDanger: true,
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting staff member...');
        try {
          const res = await fetch(getApiUrl(`/api/admin/staff/${id}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            showMessage('Staff member deleted successfully.');
            fetchData();
          } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to delete staff member.', 'error');
          }
        } catch (error) {
          showMessage('Error deleting staff member.', 'error');
        } finally {
          toast.dismiss(loadingToast);
        }
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const updateDeliveryStatus = async (orderId: number, status: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/delivery-status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ deliveryStatus: status })
      });

      if (res.ok) {
        // Update local state immediately for better UX and fallback if socket fails
        setPendingOrders(prev => prev.map(o => Number(o.id) === Number(orderId) ? { ...o, delivery_status: status } : o));
        setTransactions(prev => prev.map(t => Number(t.id) === Number(orderId) ? { ...t, delivery_status: status } : t));
        toast.success(`Delivery status updated to ${status}`);
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update delivery status');
      }
    } catch (error) {
      console.error('Update delivery status error:', error);
      toast.error('Failed to update delivery status');
    }
  };

  const updateOrderStatus = async (orderId: number, status: string) => {
    const loadingToast = toast.loading('Updating order status...');
    try {
      const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/status`), {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setPendingOrders(pendingOrders.map(o => o.id === orderId ? { ...o, status } : o));
        showMessage(`Order status updated to ${status}`, 'success');
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to update order status', 'error');
      }
    } catch (error) {
      showMessage('Network error', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  const completeOrder = async (orderId: number) => {
    setConfirmConfig({
      title: 'Complete Order',
      message: 'Are you sure you want to mark this order as completed? This confirms that payment has been verified.',
      onConfirm: async () => {
        const loadingToast = toast.loading('Completing order...');
        try {
          const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}/complete`), {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            showMessage('Order marked as completed!');
            fetchData();
          } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to complete order.', 'error');
          }
        } catch (error) {
          showMessage('Error completing order.', 'error');
        } finally {
          toast.dismiss(loadingToast);
        }
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const deleteOrder = async (orderId: number) => {
    setConfirmConfig({
      title: 'Delete Order',
      message: 'Are you sure you want to delete this order? This action cannot be undone and will remove all associated transaction records.',
      onConfirm: async () => {
        const loadingToast = toast.loading('Deleting order...');
        try {
          const res = await fetch(getApiUrl(`/api/admin/orders/${orderId}`), {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          if (res.ok) {
            showMessage('Order deleted successfully!');
            fetchData();
          } else {
            const data = await res.json();
            showMessage(data.error || 'Failed to delete order.', 'error');
          }
        } catch (error) {
          showMessage('Error deleting order.', 'error');
        } finally {
          toast.dismiss(loadingToast);
        }
        setShowConfirm(false);
      }
    });
    setShowConfirm(true);
  };

  const handlePrintTransactionReceipt = (transaction: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Please allow popups to print receipts');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Zenith Receipt - ${transaction.order_number || transaction.order_id}</title>
          <style>
            @page { margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              padding: 15px; 
              width: 280px; 
              margin: 0 auto; 
              color: #000;
              background: #fff;
              line-height: 1.2;
            }
            .header { text-align: center; margin-bottom: 15px; }
            .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-bottom: 2px; }
            .address { font-size: 10px; margin-bottom: 10px; text-transform: uppercase; }
            .order-info { font-size: 12px; margin-bottom: 10px; text-align: left; }
            .order-number { font-size: 20px; font-weight: 900; margin: 8px 0; border: 2px solid #000; padding: 6px 12px; display: inline-block; letter-spacing: 1px; }
            .divider { border-top: 2px dashed #000; margin: 10px 0; }
            .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .items-table th { text-align: left; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 4px; }
            .items-table td { padding: 4px 0; font-size: 12px; vertical-align: top; }
            .price-col { text-align: right; }
            .totals-section { margin-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
            .grand-total { font-weight: bold; font-size: 16px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 25px; font-size: 10px; font-style: italic; }
            .no-print { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
            .btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; font-family: sans-serif; }
            .btn-primary { background: #d35400; color: white; }
            .btn-secondary { background: #eee; color: #333; margin-left: 8px; }
            @media print {
              .no-print { display: none; }
              body { width: 100%; padding: 10px; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">ZENITH</div>
            <div class="address">Premium Dining Experience</div>
            <div class="order-number">${transaction.order_number || transaction.order_id || transaction.id}</div>
            <div class="order-info">
              <div>Date: ${new Date(transaction.created_at).toLocaleString()}</div>
              ${transaction.customer_name ? `<div>Customer: ${transaction.customer_name}</div>` : ''}
              <div>Type: ${transaction.order_type || 'In-Shop'}</div>
              ${transaction.staff_name ? `<div>Served by: ${transaction.staff_name}</div>` : ''}
            </div>
          </div>
          
          <div class="divider"></div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>ITEM</th>
                <th style="text-align: center;">QTY</th>
                <th class="price-col">PRICE</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items?.map((item: any) => `
                <tr>
                  <td>${item.product_name}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td class="price-col">${formatPrice(Number(item.price) * item.quantity, currency, exchangeRate)}</td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <div class="totals-section">
            <div class="total-row grand-total">
              <span>TOTAL</span>
              <span>${formatPrice(Number(transaction.amount), currency, exchangeRate)}</span>
            </div>
            <div class="total-row" style="margin-top: 8px; font-size: 11px;">
              <span>Payment Method:</span>
              <span style="text-transform: uppercase;">${transaction.payment_method}</span>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <div class="footer">
            <div>Thank you for dining with us!</div>
            <div style="margin-top: 5px; font-size: 8px; opacity: 0.6;">ZENITH POS v2.0</div>
          </div>

          <div class="no-print">
            <button class="btn btn-primary" onclick="window.print()">PRINT RECEIPT</button>
            <button class="btn btn-secondary" onclick="window.close()">CLOSE</button>
          </div>

          <script>
            function startPrint() {
              setTimeout(function() {
                window.print();
              }, 1000);
            }
            if (document.readyState === 'complete') {
              startPrint();
            } else {
              window.onload = startPrint;
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const fetchReport = async (period: string) => {
    setLoadingReport(true);
    try {
      const res = await fetchWithAuth(getApiUrl(`/api/admin/reports?period=${period}`));
      if (res.ok) {
        setReportData(await res.json());
      } else {
        showMessage('Failed to fetch report', 'error');
      }
    } catch (error) {
      showMessage('Error fetching report', 'error');
    } finally {
      setLoadingReport(false);
    }
  };

  const addRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName) return;
    const loadingToast = toast.loading('Creating role...');
    try {
      const res = await fetchWithAuth(getApiUrl('/api/admin/roles'), {
        method: 'POST',
        body: JSON.stringify({ name: newRoleName, description: newRoleDescription })
      });
      if (res.ok) {
        const newRole = await res.json();
        setRoles(prev => [...prev, newRole]);
        setNewRoleName('');
        setNewRoleDescription('');
        setShowAddRoleModal(false);
        showMessage('Role created successfully!');
      } else {
        const data = await res.json();
        showMessage(data.error || 'Failed to create role', 'error');
      }
    } catch (error) {
      showMessage('Error creating role', 'error');
    } finally {
      toast.dismiss(loadingToast);
    }
  };

  useEffect(() => {
    if (activeTab === 'accounts') {
      fetchReport(reportPeriod);
    }
  }, [activeTab, reportPeriod]);

  const addStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitStaff = async () => {
      const generatedStaffId = newStaffId || `STF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const loadingToast = toast.loading('Creating staff account...');
      try {
        const res = await fetchWithAuth(getApiUrl('/api/admin/staff'), {
          method: 'POST',
          body: JSON.stringify({
            email: newStaffEmail,
            password: newStaffPassword,
            name: newStaffName,
            role: newStaffRole,
            contact_info: newStaffContact,
            staff_id: generatedStaffId,
            profile_image_url: newStaffImage,
            department_ids: newStaffDepartments
          })
        });
        if (res.ok) {
          setNewStaffEmail('');
          setNewStaffPassword('');
          setNewStaffName('');
          setNewStaffContact('');
          setNewStaffId('');
          setNewStaffImage('');
          setNewStaffDepartments([]);
          showMessage('Staff account created!');
          fetchData();
        } else {
          const data = await res.json();
          showMessage(data.error || data.details || 'Failed to create staff account.', 'error');
        }
      } catch (error) {
        console.error('Error creating staff account:', error);
        showMessage('Error creating staff account. Please check your connection.', 'error');
      } finally {
        toast.dismiss(loadingToast);
      }
    };

    if (newStaffDepartments.length > 0) {
      setConfirmConfig({
        title: 'Confirm Department Assignment',
        message: `Are you sure you want to assign ${newStaffName} to ${newStaffDepartments.length} department(s)?`,
        onConfirm: () => {
          submitStaff();
          setShowConfirm(false);
        }
      });
      setShowConfirm(true);
    } else {
      submitStaff();
    }
  };

  const handleEditStaff = (staff: any) => {
    setEditingStaffId(staff.id);
    setEditStaffName(staff.name || '');
    setEditStaffRole(staff.role || '');
    setEditStaffContact(staff.contact_info || '');
    setEditStaffIdVal(staff.staff_id || '');
    setEditStaffImage(staff.profile_image_url || '');
    setEditStaffDepartments(staff.departments || []);
    setShowEditStaffModal(true);
  };

  const updateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaffId) return;

    const submitUpdate = async () => {
      const loadingToast = toast.loading('Updating staff account...');
      try {
        const res = await fetch(getApiUrl(`/api/admin/staff/${editingStaffId}`), {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            name: editStaffName,
            role: editStaffRole,
            contact_info: editStaffContact,
            staff_id: editStaffIdVal,
            profile_image_url: editStaffImage,
            department_ids: editStaffDepartments
          })
        });

        if (res.ok) {
          setShowEditStaffModal(false);
          setEditingStaffId(null);
          showMessage('Staff account updated!');
          fetchData();
        } else {
          const data = await res.json();
          showMessage(data.error || 'Failed to update staff account.');
        }
      } catch (error) {
        showMessage('Error updating staff account.');
      } finally {
        toast.dismiss(loadingToast);
      }
    };

    if (editStaffDepartments.length > 0) {
      setConfirmConfig({
        title: 'Confirm Department Assignment',
        message: `Are you sure you want to assign ${editStaffName} to ${editStaffDepartments.length} department(s)?`,
        onConfirm: () => {
          submitUpdate();
          setShowConfirm(false);
        }
      });
      setShowConfirm(true);
    } else {
      submitUpdate();
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] p-4 sm:p-8 font-sans overflow-x-hidden">
      {/* Edit Staff Modal */}
      {showEditStaffModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-black/5"
          >
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50">
              <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">Edit Staff Member</h3>
              <button 
                type="button"
                onClick={() => setShowEditStaffModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
              >
                <span className="text-sm font-bold">Exit</span>
                <X size={16} />
              </button>
            </div>
            
            <form onSubmit={updateStaff} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden group-hover:border-[#d35400] transition-colors">
                    {editStaffImage ? (
                      <img src={editStaffImage} className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={40} className="text-gray-300" />
                    )}
                    {uploadingEditStaffImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                  <label className="absolute -bottom-2 -right-2 bg-white p-2 rounded-xl shadow-lg border border-black/5 cursor-pointer hover:text-[#d35400] transition-colors">
                    <Plus size={16} />
                    <input type="file" className="hidden" accept="image/*" onChange={handleEditStaffImageUpload} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={editStaffName}
                    onChange={(e) => setEditStaffName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                  <select
                    value={editStaffRole}
                    onChange={(e) => setEditStaffRole(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors text-sm"
                  >
                    <option value="accountant">Accountant</option>
                    <option value="secretary">Secretary</option>
                    <option value="manager">Manager</option>
                    <option value="counter_staff">Counter Staff</option>
                    <option value="staff">General Staff</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Info</label>
                  <input
                    type="text"
                    value={editStaffContact}
                    onChange={(e) => setEditStaffContact(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Staff ID</label>
                  <input
                    type="text"
                    value={editStaffIdVal}
                    onChange={(e) => setEditStaffIdVal(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl focus:outline-none focus:border-[#d35400] transition-colors text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1 relative">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Departments</label>
                <div 
                  onClick={() => setIsEditDeptDropdownOpen(!isEditDeptDropdownOpen)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-black/5 rounded-xl cursor-pointer flex items-center justify-between hover:border-[#d35400]/30 transition-colors"
                >
                  <span className="truncate text-gray-600 text-sm">
                    {editStaffDepartments.length === 0 
                      ? 'Select Departments' 
                      : `${editStaffDepartments.length} selected`}
                  </span>
                  <ChevronDown size={16} className={`text-gray-400 transition-transform ${isEditDeptDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
                
                {isEditDeptDropdownOpen && (
                  <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-black/5 rounded-xl shadow-xl p-2 max-h-60 flex flex-col animate-in fade-in slide-in-from-top-2">
                    <div className="overflow-y-auto custom-scrollbar flex-1 mb-2">
                      {departments.map(dept => (
                        <div 
                          key={dept}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                            editStaffDepartments.includes(dept) ? 'bg-[#d35400]/5 text-[#d35400]' : 'hover:bg-gray-50 text-gray-600'
                          }`}
                          onClick={() => {
                            if (editStaffDepartments.includes(dept)) {
                              setEditStaffDepartments(editStaffDepartments.filter(d => d !== dept));
                            } else {
                              setEditStaffDepartments([...editStaffDepartments, dept]);
                            }
                          }}
                        >
                          <span className="text-xs font-medium">{dept}</span>
                          {editStaffDepartments.includes(dept) && <Check size={14} />}
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsEditDeptDropdownOpen(false)}
                      className="w-full bg-[#1a1a1a] hover:bg-[#d35400] text-white py-2 rounded-lg text-xs font-bold transition-colors mt-auto"
                    >
                      Confirm Selection
                    </button>
                  </div>
                )}
                
                {editStaffDepartments.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {editStaffDepartments.map(dept => (
                      <span key={dept} className="bg-[#d35400]/10 text-[#d35400] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                        {dept}
                        <X size={10} className="cursor-pointer" onClick={() => setEditStaffDepartments(editStaffDepartments.filter(d => d !== dept))} />
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditStaffModal(false)}
                  className="flex-1 px-6 py-3 border border-black/5 rounded-xl font-bold text-gray-500 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-[2] bg-[#1a1a1a] hover:bg-[#d35400] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-black/5"
                >
                  Update Staff
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Role Modal */}
      <AnimatePresence>
        {showAddRoleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddRoleModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Create New Staff Role</h2>
                <button onClick={() => setShowAddRoleModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={addRole} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role Name</label>
                  <input
                    type="text"
                    required
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                    placeholder="e.g. Inventory Manager"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Description</label>
                  <textarea
                    value={newRoleDescription}
                    onChange={(e) => setNewRoleDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400] h-24 resize-none"
                    placeholder="Describe the responsibilities of this role..."
                  />
                </div>
                <button type="submit" className="w-full bg-[#1a1a1a] hover:bg-[#d35400] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-black/5">
                  Create Role
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      {showConfirm && confirmConfig && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-black/5 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-serif font-bold text-[#1a1a1a] mb-2">{confirmConfig.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{confirmConfig.message}</p>
            <div className="flex gap-3">
              <button
                onClick={confirmConfig.onConfirm}
                className={`flex-1 py-2.5 rounded-lg font-bold transition-all ${
                  confirmConfig.isDanger 
                    ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20' 
                    : 'bg-[#d35400] hover:bg-[#e67e22] text-white shadow-lg shadow-[#d35400]/20'
                }`}
              >
                Confirm
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      {showTransactionModal && selectedTransaction && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowTransactionModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-black/5 flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">Transaction Details</h3>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full uppercase tracking-widest">
                    {selectedTransaction.status || 'Completed'}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono uppercase tracking-widest">Order #{selectedTransaction.order_id || selectedTransaction.id}</p>
              </div>
              <button 
                onClick={() => setShowTransactionModal(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200 transition-all shadow-sm"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-8">
              {/* Customer & Staff Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 pb-2 flex items-center gap-2">
                    <Users size={12} /> Customer Info
                  </h4>
                  <div className="space-y-2">
                    <p className="font-bold text-[#1a1a1a]">{selectedTransaction.customer_name}</p>
                    {selectedTransaction.customer_email && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 bg-gray-300 rounded-full" /> {selectedTransaction.customer_email}
                      </p>
                    )}
                    {selectedTransaction.customer_contact && (
                      <p className="text-sm text-gray-500 flex items-center gap-2">
                        <span className="w-1 h-1 bg-gray-300 rounded-full" /> {selectedTransaction.customer_contact}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 pb-2 flex items-center gap-2">
                    <UserIcon size={12} /> Processed By
                  </h4>
                  <div className="space-y-2">
                    <p className="font-bold text-[#1a1a1a]">{selectedTransaction.staff_name || 'System / Online'}</p>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
                      {new Date(selectedTransaction.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 pb-2 flex items-center gap-2">
                  <ShoppingBag size={12} /> Order Items
                </h4>
                <div className="bg-gray-50 rounded-2xl border border-black/5 overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left text-sm min-w-[500px]">
                    <thead>
                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5">
                        <th className="py-3 px-4 sticky left-0 bg-gray-50 z-10">Item</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {selectedTransaction.items?.map((item: any, idx: number) => (
                        <tr key={idx}>
                          <td className="py-3 px-4 font-bold text-[#1a1a1a] sticky left-0 bg-gray-50 z-10">{item.product_name}</td>
                          <td className="py-3 px-4 text-center text-gray-500">{item.quantity}</td>
                          <td className="py-3 px-4 text-right text-gray-500">{formatPrice(Number(item.price), currency, exchangeRate)}</td>
                          <td className="py-3 px-4 text-right font-bold text-[#1a1a1a]">{formatPrice(Number(item.price) * item.quantity, currency, exchangeRate)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-white/50">
                        <td colSpan={3} className="py-4 px-4 text-right font-bold text-gray-400 uppercase tracking-widest text-[10px]">Grand Total</td>
                        <td className="py-4 px-4 text-right font-bold text-emerald-600 text-lg">
                          {formatPrice(Number(selectedTransaction.amount), currency, exchangeRate)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment Info */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5 pb-2 flex items-center gap-2">
                  <DollarSign size={12} /> Payment Details
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl border border-black/5">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Method</p>
                    <p className="font-bold uppercase text-xs">{selectedTransaction.payment_method}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl border border-black/5">
                    <p className="text-[10px] text-gray-400 uppercase mb-1">Status</p>
                    <p className="font-bold uppercase text-xs text-emerald-600">{selectedTransaction.status || 'Completed'}</p>
                  </div>
                  {selectedTransaction.payment_reference && (
                    <div className="bg-gray-50 p-3 rounded-xl border border-black/5 col-span-2 md:col-span-1">
                      <p className="text-[10px] text-gray-400 uppercase mb-1">Reference</p>
                      <p className="font-mono text-[10px] truncate">{selectedTransaction.payment_reference}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-black/5 bg-gray-50/50 flex justify-end gap-4">
              <button 
                onClick={() => handlePrintTransactionReceipt(selectedTransaction)}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <Printer size={18} /> Print Receipt
              </button>
              <button 
                onClick={() => setShowTransactionModal(false)}
                className="px-8 py-3 bg-[#1a1a1a] text-white rounded-xl font-bold hover:bg-[#d35400] transition-all shadow-lg shadow-black/5"
              >
                Close Details
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Activities Modal */}
      {showActivitiesModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowActivitiesModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-black/5 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">Staff Activities</h3>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{viewingStaffName}</p>
              </div>
              <button 
                onClick={() => setShowActivitiesModal(false)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-gray-600 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
              >
                <span className="text-sm font-bold">Exit</span>
                <X size={16} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
              {selectedStaffActivities.length === 0 ? (
                <p className="text-center py-12 text-gray-400 italic">No activities recorded yet.</p>
              ) : selectedStaffActivities.map((activity) => (
                <div key={activity.id} className="bg-gray-50 p-4 rounded-xl border border-black/5">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-[#1a1a1a]">{activity.action}</p>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      {new Date(activity.created_at).toLocaleString()}
                    </span>
                  </div>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <div className="bg-white/50 p-2 rounded-lg text-xs text-gray-600 font-mono">
                      {JSON.stringify(activity.details, null, 2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Department Products Modal */}
      {viewingDeptProducts && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingDeptProducts(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-black/5 animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-6 border-b border-black/5 pb-4">
              <div>
                <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">Products in {viewingDeptProducts}</h3>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setNewProdDept(viewingDeptProducts);
                    setActiveTab('products');
                    setViewingDeptProducts(null);
                  }}
                  className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2"
                >
                  <Plus size={16} /> Add Product
                </button>
                <button onClick={() => setViewingDeptProducts(null)} className="text-gray-400 hover:text-gray-600">
                  <Plus size={24} className="rotate-45" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
              {products.filter(p => p.department === viewingDeptProducts).length === 0 ? (
                <p className="text-center py-12 text-gray-400 italic">No products in this department.</p>
              ) : products.filter(p => p.department === viewingDeptProducts).map(prod => (
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
                              {departments.map(dept => (
                                <option key={dept} value={dept}>{dept}</option>
                              ))}
                            </select>
                            <input
                              type="number"
                              value={editProdStock}
                              onChange={(e) => setEditProdStock(e.target.value)}
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
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 sm:w-10 sm:h-10" />
            <h1 className="text-3xl font-serif font-bold tracking-tight text-[#1a1a1a]">Zenith Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <CurrencyToggle currency={currency} onCurrencyChange={onCurrencyChange} />
            <button 
              onClick={checkDbHealth}
              className="flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Activity size={18} />
              Check Connection
            </button>
            <button 
              onClick={initDb}
              className="flex items-center gap-2 bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <Database size={18} />
              Reset DB
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="relative mb-8">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 bg-white px-4 py-3 rounded-xl border border-black/5 shadow-sm hover:bg-gray-50 transition-colors font-bold text-[#1a1a1a] relative"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            Menu
            {(pendingCount > 0 || transactionCount > 0 || activityCount > 0) && !isMenuOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#d35400] rounded-full border-2 border-white" />
            )}
          </button>
          
          {isMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl border border-black/5 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex flex-col p-2">
                {(user?.role === 'super_admin' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'accountant' || user?.role === 'manager' || user?.role === 'counter_staff') && (
                  <button 
                    onClick={() => { setActiveTab('pos'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'pos' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <ShoppingBag size={18} /> Take Order
                  </button>
                )}
                {(user?.role === 'super_admin' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') && (
                  <>
                    <button 
                      onClick={() => { setActiveTab('products'); setIsMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'products' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Package size={18} /> Products
                    </button>
                    <button 
                      onClick={() => { setActiveTab('departments'); setIsMenuOpen(false); }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'departments' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <Layers size={18} /> Departments
                    </button>
                  </>
                )}
                {(user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'manager') && (
                  <button 
                    onClick={() => { setActiveTab('accounts'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'accounts' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <TrendingUp size={18} /> Accounts
                  </button>
                )}
                {(user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') && (
                  <>
                    <button 
                      onClick={() => { setActiveTab('pending_orders'); setIsMenuOpen(false); }}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'pending_orders' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <ShoppingBag size={18} /> Pending Orders
                      </div>
                      {pendingCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'pending_orders' ? 'bg-white text-[#d35400]' : 'bg-[#d35400] text-white'}`}>
                          {pendingCount}
                        </span>
                      )}
                    </button>
                    <button 
                      onClick={() => { setActiveTab('transactions'); setIsMenuOpen(false); }}
                      className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'transactions' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <div className="flex items-center gap-3">
                        <DollarSign size={18} /> Transactions
                      </div>
                      {transactionCount > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'transactions' ? 'bg-white text-[#d35400]' : 'bg-[#d35400] text-white'}`}>
                          {transactionCount}
                        </span>
                      )}
                    </button>
                  </>
                )}
                {(user?.role === 'super_admin' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') && (
                  <button 
                    onClick={() => { setActiveTab('staff'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Users size={18} /> Staff
                  </button>
                )}
                {(user?.role === 'super_admin' || user?.role === 'manager') && (
                  <button 
                    onClick={() => { setActiveTab('activities'); setIsMenuOpen(false); }}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'activities' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Activity size={18} /> Activities
                    </div>
                    {activityCount > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeTab === 'activities' ? 'bg-white text-[#d35400]' : 'bg-[#d35400] text-white'}`}>
                        {activityCount}
                      </span>
                    )}
                  </button>
                )}
                {(user?.role === 'super_admin' || user?.role === 'manager') && (
                  <button 
                    onClick={() => { setActiveTab('settings'); setIsMenuOpen(false); }}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'settings' ? 'bg-[#d35400] text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                  >
                    <Settings size={18} /> Settings
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {message && (
          <div className={`p-4 rounded-lg mb-8 shadow-sm animate-in fade-in slide-in-from-top-2 border ${
            messageType === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-red-50 text-red-700 border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          <AnimatePresence mode="wait">
            {activeTab === 'pending_orders' && (user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') && (
            <motion.div 
              key="pending_orders"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-black/5 pb-4">
                <h2 className="text-xl font-serif font-bold">My Orders & Tracking</h2>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input 
                      type="text"
                      placeholder="Track Order (ZN...)"
                      value={pendingSearchTerm}
                      onChange={(e) => setPendingSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d35400]/20 transition-all"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Filter:</label>
                    <select 
                      value={filterMethod}
                      onChange={(e) => setFilterMethod(e.target.value)}
                      className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-gray-600 focus:outline-none focus:border-[#d35400]"
                    >
                      <option value="all">Active</option>
                      <option value="AWAITING_CONFIRMATION">Awaiting Confirmation</option>
                      <option value="PLACED">Placed</option>
                      <option value="PAID">Paid</option>
                      <option value="IN_PROGRESS">Preparing</option>
                      <option value="READY">Ready</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{filteredPendingOrders.length} Orders</span>
                </div>
              </div>
              
              <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredPendingOrders.length === 0 ? (
                  <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <ShoppingBag size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">No pending orders found.</p>
                  </div>
                ) : (
                  filteredPendingOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-black/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                      <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-xs font-bold bg-amber-50 text-amber-600 px-3 py-1 rounded-full uppercase tracking-widest">
                              {order.order_number || `#${order.id}`}
                            </span>
                            <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-full uppercase tracking-widest">
                              {new Date(order.created_at).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                              <p className="font-bold text-[#1a1a1a]">{order.guest_name || 'Registered User'}</p>
                              <p className="text-sm text-gray-500">{order.guest_email || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Payment Info</p>
                              <p className="font-bold text-[#1a1a1a] uppercase text-sm">{order.payment_method}</p>
                              <p className="text-xs text-gray-500 font-mono">Ref: {order.payment_reference || 'N/A'}</p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Type</p>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${order.order_type === 'delivery' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                {order.order_type}
                              </span>
                              {order.guest_contact && (
                                <p className="text-xs text-gray-600 mt-1 font-medium flex items-center gap-1">
                                  <Phone size={10} /> {order.guest_contact}
                                </p>
                              )}
                            </div>
                          </div>

                          {order.order_type === 'delivery' && order.delivery_address && (
                            <div className="mb-6 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                                <MapPin size={12} /> Delivery Address
                              </p>
                              <p className="text-sm text-purple-900 font-medium leading-relaxed">
                                {order.delivery_address}
                              </p>
                            </div>
                          )}

                          <div className="border-t border-black/5 pt-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Order Items</p>
                            <div className="space-y-4">
                              {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex flex-col text-sm border-b border-gray-100 pb-2 last:border-0">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-gray-400">{item.quantity}x</span>
                                      <span className="text-gray-700 font-medium">{item.product_name}</span>
                                      <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded uppercase font-bold">
                                        {item.department}
                                      </span>
                                    </div>
                                    <span className="font-medium">{formatPrice(Number(item.price) * item.quantity, currency, exchangeRate)}</span>
                                  </div>
                                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                                    <div className="ml-6 mt-1 text-xs text-gray-500">
                                      {Object.entries(item.customizations).map(([key, value]) => (
                                        <div key={key} className="flex gap-1">
                                          <span className="capitalize">{key}:</span>
                                          <span className="font-medium text-gray-700">{String(value)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-black/5 pt-6 md:pt-0 md:pl-6">
                          <div className="text-right mb-6">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                            <p className="text-3xl font-serif font-bold text-[#d35400]">{formatPrice(Number(order.total_amount), currency, exchangeRate)}</p>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            {order.order_type === 'delivery' && (
                              <div className="mb-3">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Delivery Status</p>
                                <select
                                  value={order.delivery_status || 'Placed'}
                                  onChange={(e) => updateDeliveryStatus(order.id, e.target.value)}
                                  className={`w-full py-2 px-3 rounded-xl font-bold focus:outline-none focus:ring-2 transition-all border cursor-pointer hover:shadow-md active:scale-95 ${
                                    (order.delivery_status || 'Placed') === 'Delivered'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 focus:ring-emerald-500'
                                      : (order.delivery_status || 'Placed') === 'Out for Delivery'
                                      ? 'bg-blue-50 border-blue-200 text-blue-700 focus:ring-blue-500'
                                      : (order.delivery_status || 'Placed') === 'Preparing'
                                      ? 'bg-amber-50 border-amber-200 text-amber-700 focus:ring-amber-500'
                                      : 'bg-gray-50 border-gray-200 text-gray-700 focus:ring-gray-400'
                                  }`}
                                >
                                  <option value="Placed">Placed</option>
                                  <option value="Preparing">Preparing</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                </select>
                              </div>
                            )}
                            <div className="mb-2">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Order Status</p>
                              <select
                                value={order.status}
                                onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2 px-3 rounded-xl font-bold focus:outline-none focus:ring-2 focus:ring-[#d35400] transition-all"
                              >
                                <option value="AWAITING_CONFIRMATION">Awaiting Confirmation</option>
                                <option value="PLACED">Placed</option>
                                <option value="PAID">Paid</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="READY">Ready</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancelled</option>
                              </select>
                            </div>
                            <button
                              onClick={() => completeOrder(order.id)}
                              disabled={order.status === 'COMPLETED'}
                              className={`w-full py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                                order.status === 'COMPLETED' 
                                  ? 'bg-emerald-50 text-emerald-400 cursor-not-allowed' 
                                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20'
                              }`}
                            >
                              <Check size={18} />
                              {order.status === 'COMPLETED' ? 'Completed' : 'Mark as Done'}
                            </button>
                            {(user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'manager') && (
                              <button
                                onClick={() => deleteOrder(order.id)}
                                className="w-full bg-white hover:bg-red-50 text-red-500 border border-red-100 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                              >
                                <Trash2 size={18} />
                                Delete Order
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (user?.role === 'super_admin' || user?.role === 'manager') && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
            >
              <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] mb-6">Settings</h2>
              <div className="space-y-6">
                {/* Exchange Rate */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-black/5">
                  <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Exchange Rate</label>
                    <p className="text-xs text-gray-400">Current exchange rate (1 USD = X Local Currency)</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={newExchangeRate}
                      onChange={(e) => setNewExchangeRate(e.target.value)}
                      className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d35400]"
                    />
                    <button 
                      onClick={updateExchangeRate}
                      className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Stock Threshold */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-black/5">
                  <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Minimum Stock Threshold</label>
                    <p className="text-xs text-gray-400">Alert when stock falls below this amount</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      value={minStockThreshold}
                      onChange={(e) => setMinStockThreshold(Number(e.target.value))}
                      className="w-24 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d35400]"
                    />
                    <button 
                      onClick={async () => {
                        const loadingToast = toast.loading('Updating threshold...');
                        try {
                          const res = await fetch(getApiUrl('/api/admin/settings'), {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ key: 'minStockThreshold', value: minStockThreshold })
                          });
                          if (res.ok) {
                            showMessage('Threshold updated!');
                          } else {
                            showMessage('Failed to update threshold', 'error');
                          }
                        } catch (err) {
                          showMessage('Connection error', 'error');
                        } finally {
                          toast.dismiss(loadingToast);
                        }
                      }}
                      className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Update
                    </button>
                  </div>
                </div>

                {/* Homepage Images */}
                <div className="p-4 bg-gray-50 rounded-xl border border-black/5 space-y-4">
                  <div>
                    <label className="text-sm font-bold text-gray-600 block mb-1">Homepage Images</label>
                    <p className="text-xs text-gray-400 mb-4">Update the images displayed on the landing page</p>
                  </div>
                  
                  {[
                    { label: 'Hero Image URL', state: heroImageUrl, setter: setHeroImageUrl, key: 'heroImageUrl' },
                    { label: 'Featured Image 1', state: featuredImageUrl1, setter: setFeaturedImageUrl1, key: 'featuredImageUrl1' },
                    { label: 'Featured Image 2', state: featuredImageUrl2, setter: setFeaturedImageUrl2, key: 'featuredImageUrl2' },
                    { label: 'Featured Image 3', state: featuredImageUrl3, setter: setFeaturedImageUrl3, key: 'featuredImageUrl3' },
                    { label: 'Featured Image 4', state: featuredImageUrl4, setter: setFeaturedImageUrl4, key: 'featuredImageUrl4' },
                  ].map((img) => (
                    <div key={img.key} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                      <label className="text-xs font-bold text-gray-500 w-32">{img.label}</label>
                      <input 
                        type="text" 
                        value={img.state}
                        onChange={(e) => img.setter(e.target.value)}
                        placeholder="https://..."
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#d35400] w-full"
                      />
                      <button 
                        onClick={async () => {
                          const loadingToast = toast.loading(`Updating ${img.label}...`);
                          try {
                            const res = await fetch(getApiUrl('/api/admin/settings'), {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('token')}`
                              },
                              body: JSON.stringify({ key: img.key, value: img.state })
                            });
                            if (res.ok) {
                              showMessage(`${img.label} updated!`);
                            } else {
                              showMessage(`Failed to update ${img.label}`, 'error');
                            }
                          } catch (err) {
                            showMessage('Connection error', 'error');
                          } finally {
                            toast.dismiss(loadingToast);
                          }
                        }}
                        className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all w-full sm:w-auto"
                      >
                        Save
                      </button>
                    </div>
                  ))}
                </div>

                {/* Profile Settings */}
                <div className="p-4 bg-gray-50 rounded-xl border border-black/5">
                  <h3 className="text-sm font-bold text-gray-600 mb-4">Profile Settings</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Contact Info</label>
                      <input 
                        type="text" 
                        value={profileContact}
                        onChange={(e) => setProfileContact(e.target.value)}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block mb-1">Profile Image</label>
                      <input 
                        type="text" 
                        value={profileImageUrl}
                        onChange={(e) => setProfileImageUrl(e.target.value)}
                        placeholder="Image URL"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm mb-2"
                      />
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileImageUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm"
                      />
                    </div>
                    <button 
                      onClick={async () => {
                        const loadingToast = toast.loading('Updating profile...');
                        try {
                          const res = await fetch(getApiUrl('/api/auth/me'), {
                            method: 'PUT',
                            headers: {
                              'Content-Type': 'application/json',
                              'Authorization': `Bearer ${localStorage.getItem('token')}`
                            },
                            body: JSON.stringify({ 
                              name: profileName, 
                              contact_info: profileContact, 
                              profile_image_url: profileImageUrl 
                            })
                          });
                          if (res.ok) {
                            const updatedUser = await res.json();
                            showMessage('Profile updated!');
                            if (onUpdateUser) {
                              onUpdateUser(updatedUser);
                            }
                          } else {
                            const errorData = await res.json().catch(() => ({}));
                            showMessage(errorData.error || 'Failed to update profile', 'error');
                          }
                        } catch (err) {
                          showMessage('Error updating profile', 'error');
                        } finally {
                          toast.dismiss(loadingToast);
                        }
                      }}
                      className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      Save Profile
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'pos' && (user?.role === 'super_admin' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'accountant' || user?.role === 'manager' || user?.role === 'counter_staff') && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-120px)]"
            >
              {/* Products Section */}
              <motion.div layout className="flex-1 bg-white p-4 sm:p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col overflow-hidden min-h-[500px] lg:min-h-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-xl font-serif font-bold">Take Order</h2>
                    <button 
                      onClick={() => {
                        setPosCart([]);
                        setPosSearch('');
                        setPosCustomerName('');
                        setPosCustomerEmail('');
                        setPosCustomerContact('');
                        setPosOrderSuccess(null);
                        setPosReceiptData(null);
                      }}
                      className="text-[10px] font-bold text-[#d35400] bg-[#d35400]/10 px-3 py-1.5 rounded-full uppercase tracking-widest hover:bg-[#d35400]/20 transition-all flex items-center gap-1.5"
                    >
                      <Plus size={12} /> New Order
                    </button>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative w-full sm:w-64"
                  >
                    <input
                      type="text"
                      placeholder="Search items..."
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d35400] transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={16} />
                    </div>
                  </motion.div>
                </div>
                
                <div className="h-[720px] overflow-y-scroll custom-scrollbar pr-2">
                  <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                    <AnimatePresence mode="popLayout">
                      {products.filter(p => p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.department.toLowerCase().includes(posSearch.toLowerCase()) || p.id.toString().includes(posSearch)).map(product => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, scale: 0.9, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                          whileHover={{ scale: product.stock > 0 ? 1.05 : 1, y: product.stock > 0 ? -5 : 0 }}
                          whileTap={{ scale: product.stock > 0 ? 0.95 : 1 }}
                          key={product.id} 
                          onClick={() => {
                            if (product.stock > 0) {
                              if (product.options && Object.keys(product.options).length > 0) {
                                setSelectedPosProduct(product);
                                setPosProductCustomizations({});
                              } else {
                                setPosCart(prev => {
                                  const existing = prev.find(item => item.product.id === product.id);
                                  if (existing) {
                                    return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
                                  }
                                  return [...prev, { product, quantity: 1 }];
                                });
                              }
                            }
                          }}
                          className={`bg-gray-50 rounded-xl p-2 border border-gray-100 cursor-pointer transition-colors hover:shadow-xl ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:border-[#d35400]'}`}
                        >
                          <div className="h-48 rounded-lg overflow-hidden mb-2 bg-white relative">
                            <span className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded-md font-mono z-10">#{product.id}</span>
                            {product.discountPercentage && product.discountPercentage > 0 && (
                              <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md font-bold z-10">-{product.discountPercentage}%</span>
                            )}
                            {product.stock < minStockThreshold && (
                              <span className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md font-bold z-10">Low Stock</span>
                            )}
                            <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          </div>
                          <h3 className="font-bold text-sm text-gray-900 truncate">{product.name}</h3>
                          <div className="flex flex-col mt-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[#d35400] font-bold text-sm">{formatPrice(Number(product.price), currency)}</span>
                              {product.originalPrice && product.originalPrice > product.price && (
                                <span className="text-[10px] text-gray-400 line-through">{formatPrice(Number(product.originalPrice), currency)}</span>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500">{product.stock} in stock</span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </motion.div>
                </div>
              </motion.div>

              {/* Cart Section */}
              <motion.div layout className="w-full lg:w-[400px] bg-white p-4 sm:p-6 rounded-2xl border border-black/5 shadow-sm flex flex-col min-h-[400px] lg:min-h-0">
                <h2 className="text-xl font-serif font-bold mb-6 flex items-center justify-between">
                  <span>Current Order</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPosCart([])}
                      className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors uppercase tracking-widest"
                    >
                      Clear
                    </button>
                    <motion.span 
                      key={posCart.reduce((sum, item) => sum + item.quantity, 0)}
                      initial={{ scale: 1.5, backgroundColor: '#e67e22' }}
                      animate={{ scale: 1, backgroundColor: '#d35400' }}
                      className="bg-[#d35400] text-white text-sm px-3 py-1 rounded-full"
                    >
                      {posCart.reduce((sum, item) => sum + item.quantity, 0)} items
                    </motion.span>
                  </div>
                </h2>

                {posOrderSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="flex-1 flex flex-col items-center justify-center text-center"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                      className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4"
                    >
                      <Check size={32} />
                    </motion.div>
                    <h3 className="text-xl font-bold mb-2">Order Completed!</h3>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 w-full">
                      <p className="text-emerald-800 font-bold text-2xl tracking-wider">{posOrderSuccess}</p>
                      <p className="text-emerald-600 text-xs mt-1">Order Number</p>
                    </div>
                    <div className="flex flex-col gap-3 w-full">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (!posReceiptData) return;
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;
                          
                          const html = `
                            <html>
                              <head>
                                <title>Zenith Receipt - ${posReceiptData.orderNumber || posReceiptData.orderId}</title>
                                <style>
                                  @page { margin: 0; }
                                  body { 
                                    font-family: 'Courier New', Courier, monospace; 
                                    padding: 15px; 
                                    width: 280px; 
                                    margin: 0 auto; 
                                    color: #000;
                                    background: #fff;
                                    line-height: 1.2;
                                  }
                                  .header { text-align: center; margin-bottom: 15px; }
                                  .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; margin-bottom: 2px; }
                                  .address { font-size: 10px; margin-bottom: 10px; text-transform: uppercase; }
                                  .order-info { font-size: 12px; margin-bottom: 10px; text-align: left; }
                                  .order-number { font-size: 20px; font-weight: 900; margin: 8px 0; border: 2px solid #000; padding: 6px 12px; display: inline-block; letter-spacing: 1px; }
                                  .divider { border-top: 2px dashed #000; margin: 10px 0; }
                                  .items-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                                  .items-table th { text-align: left; font-size: 11px; border-bottom: 1px solid #000; padding-bottom: 4px; }
                                  .items-table td { padding: 4px 0; font-size: 12px; vertical-align: top; }
                                  .price-col { text-align: right; }
                                  .totals-section { margin-top: 10px; }
                                  .total-row { display: flex; justify-content: space-between; margin-bottom: 3px; font-size: 12px; }
                                  .grand-total { font-weight: bold; font-size: 16px; margin-top: 5px; border-top: 1px solid #000; padding-top: 5px; }
                                  .footer { text-align: center; margin-top: 25px; font-size: 10px; font-style: italic; }
                                  .no-print { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; }
                                  .btn { padding: 8px 16px; border-radius: 4px; border: none; cursor: pointer; font-weight: bold; font-family: sans-serif; }
                                  .btn-primary { background: #d35400; color: white; }
                                  .btn-secondary { background: #eee; color: #333; margin-left: 8px; }
                                  @media print {
                                    .no-print { display: none; }
                                    body { width: 100%; padding: 10px; }
                                  }
                                </style>
                              </head>
                              <body>
                                <div class="header">
                                  <div class="logo">ZENITH</div>
                                  <div class="address">Premium Dining Experience</div>
                                  <div class="order-number">${posReceiptData.orderNumber || posReceiptData.orderId}</div>
                                  <div class="order-info">
                                    <div>Date: ${posReceiptData.date}</div>
                                    ${posReceiptData.customerName ? `<div>Customer: ${posReceiptData.customerName}</div>` : ''}
                                    <div>Type: ${posReceiptData.orderType}</div>
                                    ${user?.name ? `<div>Served by: ${user.name}</div>` : ''}
                                  </div>
                                </div>
                                
                                <div class="divider"></div>
                                
                                <table class="items-table">
                                  <thead>
                                    <tr>
                                      <th>ITEM</th>
                                      <th style="text-align: center;">QTY</th>
                                      <th class="price-col">PRICE</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    ${posReceiptData.items.map((item: any) => `
                                      <tr>
                                        <td>${item.product.name}</td>
                                        <td style="text-align: center;">${item.quantity}</td>
                                        <td class="price-col">${formatPrice(Number(item.product.price) * item.quantity, currency, exchangeRate)}</td>
                                      </tr>
                                    `).join('')}
                                  </tbody>
                                </table>
                                
                                <div class="divider"></div>
                                
                                <div class="totals-section">
                                  <div class="total-row grand-total">
                                    <span>TOTAL</span>
                                    <span>${formatPrice(Number(posReceiptData.total), currency, exchangeRate)}</span>
                                  </div>
                                  <div class="total-row" style="margin-top: 8px; font-size: 11px;">
                                    <span>Payment Method:</span>
                                    <span style="text-transform: uppercase;">${posReceiptData.paymentMethod}</span>
                                  </div>
                                </div>
                                
                                <div class="divider"></div>
                                
                                <div class="footer">
                                  <div>Thank you for dining with us!</div>
                                  <div style="margin-top: 5px; font-size: 8px; opacity: 0.6;">ZENITH POS v2.0</div>
                                </div>

                                <div class="no-print">
                                  <button class="btn btn-primary" onclick="window.print()">PRINT RECEIPT</button>
                                  <button class="btn btn-secondary" onclick="window.close()">CLOSE</button>
                                </div>

                                <script>
                                  function startPrint() {
                                    setTimeout(function() {
                                      window.print();
                                    }, 1000);
                                  }
                                  if (document.readyState === 'complete') {
                                    startPrint();
                                  } else {
                                    window.onload = startPrint;
                                  }
                                </script>
                              </body>
                            </html>
                          `;
                          
                          printWindow.document.write(html);
                          printWindow.document.close();
                        }}
                        className="w-full bg-white border-2 border-[#1a1a1a] text-[#1a1a1a] py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors"
                      >
                        Print Receipt
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setPosOrderSuccess(null);
                          setPosReceiptData(null);
                          setPosCustomerName('');
                          setPosCustomerEmail('');
                          setPosCustomerContact('');
                        }}
                        className="w-full bg-[#1a1a1a] text-white py-3 rounded-xl font-bold hover:bg-[#d35400] transition-colors"
                      >
                        New Order
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <motion.div layout className="h-[400px] lg:flex-1 overflow-y-scroll custom-scrollbar mb-6 pr-2 space-y-4">
                      {posCart.length === 0 ? (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="h-full flex flex-col items-center justify-center text-center p-6"
                        >
                          <motion.div
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
                          >
                            <ShoppingBag size={64} className="mb-6 text-gray-200" />
                          </motion.div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Ready for a new order?</h3>
                          <p className="text-sm text-gray-500 mb-8 max-w-[200px]">Search for products or click on items to start building an order.</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
                              if (searchInput) searchInput.focus();
                            }}
                            className="bg-[#d35400] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#d35400]/20 flex items-center gap-2"
                          >
                            <Plus size={20} /> Take Order
                          </motion.button>
                        </motion.div>
                      ) : (
                        <AnimatePresence mode="popLayout">
                          {posCart.map(item => (
                            <motion.div 
                              layout
                              initial={{ opacity: 0, y: 20, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                              key={`${item.product.id}-${JSON.stringify((item as any).customizations || {})}`} 
                              className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100"
                            >
                              <div className="w-24 h-24 rounded-lg overflow-hidden bg-white flex-shrink-0 cursor-pointer" onClick={() => setSelectedProduct(item.product)}>
                                <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-sm truncate">{item.product.name}</h4>
                                {(item as any).customizations && Object.entries((item as any).customizations).length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {Object.entries((item as any).customizations).map(([key, value]) => (
                                      <span key={key} className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded border border-black/5 text-gray-500 uppercase tracking-tighter">
                                        {key}: {String(value)}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="text-[#d35400] font-bold text-sm">{formatPrice(Number(item.product.price), currency)}</div>
                                  {item.product.originalPrice && item.product.originalPrice > item.product.price && (
                                    <div className="text-[10px] text-gray-400 line-through">{formatPrice(Number(item.product.originalPrice), currency)}</div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                                <motion.button 
                                  whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    setPosCart(prev => {
                                      const newCart = prev.map(i => 
                                        (i.product.id === item.product.id && JSON.stringify((i as any).customizations) === JSON.stringify((item as any).customizations))
                                          ? { ...i, quantity: i.quantity - 1 } 
                                          : i
                                      ).filter(i => i.quantity > 0);
                                      return newCart;
                                    });
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded"
                                >-</motion.button>
                                <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                                <motion.button 
                                  whileHover={{ scale: 1.1, backgroundColor: '#f3f4f6' }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => {
                                    if (item.quantity < item.product.stock) {
                                      setPosCart(prev => prev.map(i => 
                                        (i.product.id === item.product.id && JSON.stringify((i as any).customizations) === JSON.stringify((item as any).customizations))
                                          ? { ...i, quantity: i.quantity + 1 } 
                                          : i
                                      ));
                                    }
                                  }}
                                  className="w-6 h-6 flex items-center justify-center rounded"
                                >+</motion.button>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      )}
                    </motion.div>

                    <motion.div layout className="border-t border-black/5 pt-4 space-y-4">
                      <motion.div layout className="space-y-2">
                        <input
                          type="text"
                          placeholder="Customer Name (Optional)"
                          value={posCustomerName}
                          onChange={(e) => setPosCustomerName(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#d35400] transition-colors"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="email"
                            placeholder="Email (Optional)"
                            value={posCustomerEmail}
                            onChange={(e) => setPosCustomerEmail(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d35400] transition-colors"
                          />
                          <input
                            type="text"
                            placeholder="Contact (Optional)"
                            value={posCustomerContact}
                            onChange={(e) => setPosCustomerContact(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-[#d35400] transition-colors"
                          />
                        </div>
                      </motion.div>
                      
                      <motion.div layout className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Order Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['in-shop', 'take-away', 'delivery'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setPosOrderType(type)}
                            className={`py-2 rounded-lg text-[10px] font-bold uppercase transition-all border ${posOrderType === type ? 'bg-[#d35400] text-white border-[#d35400]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#d35400]'}`}
                          >
                            {type.replace('-', ' ')}
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    <motion.div layout className="grid grid-cols-3 gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPosPaymentMethod('cash')}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${posPaymentMethod === 'cash' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                        >
                          Cash
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPosPaymentMethod('card')}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${posPaymentMethod === 'card' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                        >
                          Card
                        </motion.button>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setPosPaymentMethod('transfer')}
                          className={`py-2 rounded-lg text-xs font-bold transition-all border ${posPaymentMethod === 'transfer' ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a1a1a]'}`}
                        >
                          Transfer
                        </motion.button>
                      </motion.div>

                      <motion.div layout className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Subtotal</span>
                          <span>{formatPrice(posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0), currency)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Tax (5%)</span>
                          <span>{formatPrice(posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) * 0.05, currency)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold pt-2 border-t border-black/5">
                          <span>Total</span>
                          <motion.span 
                            key={posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)}
                            initial={{ scale: 1.2, color: '#e67e22' }}
                            animate={{ scale: 1, color: '#d35400' }}
                            className="text-[#d35400]"
                          >
                            {formatPrice(posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) * 1.05, currency, exchangeRate)}
                          </motion.span>
                        </div>
                      </motion.div>

                      <motion.button 
                        whileHover={{ scale: (posCart.length === 0 || isProcessingPos) ? 1 : 1.02 }}
                        whileTap={{ scale: (posCart.length === 0 || isProcessingPos) ? 1 : 0.98 }}
                        disabled={posCart.length === 0 || isProcessingPos}
                        onClick={async () => {
                          if (posCart.length === 0) return;
                          
                          setIsProcessingPos(true);
                          const loadingToast = toast.loading('Processing POS sale...');
                          
                          const controller = new AbortController();
                          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

                          try {
                            const total = posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) * 1.05;
                            const res = await fetchWithAuth(getApiUrl('/api/orders'), {
                              method: 'POST',
                              signal: controller.signal,
                              body: JSON.stringify({
                                items: posCart.map(item => ({ 
                                  id: item.product.id, 
                                  quantity: item.quantity, 
                                  price: Number(item.product.price),
                                  customizations: (item as any).customizations 
                                })),
                                total_amount: total,
                                order_type: posOrderType,
                                payment_method: posPaymentMethod,
                                payment_status: 'completed',
                                guest_name: posCustomerName || 'Walk-in Customer',
                                guest_email: posCustomerEmail || null,
                                guest_contact: posCustomerContact || null
                              })
                            });
                            
                            clearTimeout(timeoutId);
                            
                            if (res.ok) {
                              const data = await res.json();
                              setPosOrderSuccess(data.orderNumber || data.orderId);
                              setPosReceiptData({
                                orderId: data.orderId,
                                orderNumber: data.orderNumber,
                                items: posCart,
                                total: total,
                                customerName: posCustomerName,
                                paymentMethod: posPaymentMethod,
                                orderType: posOrderType,
                                date: new Date().toLocaleString()
                              });
                              setPosCart([]);
                              setPosCustomerName('');
                              setPosCustomerEmail('');
                              setPosCustomerContact('');
                              toast.success('Sale processed successfully!');
                              fetchData();
                            } else {
                              const contentType = res.headers.get('content-type');
                              let errorMessage = 'Failed to process order';
                              
                              if (contentType && contentType.includes('application/json')) {
                                const err = await res.json();
                                errorMessage = err.error || errorMessage;
                              } else {
                                const text = await res.text();
                                console.error('Non-JSON error response:', text);
                              }

                              if (res.status === 401 || res.status === 403) {
                                toast.error('Session expired. Please login again.');
                                if (onLogout) onLogout();
                              } else {
                                toast.error(errorMessage);
                              }
                            }
                          } catch (error: any) {
                            console.error('Checkout error:', error);
                            if (error.name === 'AbortError') {
                              toast.error('Request timed out. Please check your connection.');
                            } else {
                              toast.error('An error occurred while processing the order');
                            }
                          } finally {
                            setIsProcessingPos(false);
                            toast.dismiss(loadingToast);
                          }
                        }}
                        className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${posCart.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#d35400] text-white shadow-lg hover:shadow-xl'}`}
                      >
                        {isProcessingPos ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          >
                            <svg className="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </motion.div>
                        ) : (
                          <ShoppingBag size={20} />
                        )}
                        {isProcessingPos ? 'Processing...' : (
                          <motion.span
                            key={posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0)}
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                          >
                            Charge {formatPrice(posCart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0) * 1.05, currency)}
                          </motion.span>
                        )}
                      </motion.button>
                    </motion.div>
                  </>
                )}
              </motion.div>

              {/* POS Product Options Modal */}
              <AnimatePresence>
                {selectedPosProduct && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedPosProduct(null)} />
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 20 }}
                      className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-black/5 flex flex-col"
                    >
                      <div className="p-6 border-b border-black/5 flex justify-between items-center bg-gray-50/50">
                        <div>
                          <h3 className="text-xl font-serif font-bold text-[#1a1a1a]">{selectedPosProduct.name}</h3>
                          <p className="text-sm text-[#d35400] font-bold">{formatPrice(Number(selectedPosProduct.price), currency)}</p>
                        </div>
                        <button 
                          onClick={() => setSelectedPosProduct(null)}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-red-500 transition-all"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      <div className="p-6 space-y-6">
                        {Object.entries(selectedPosProduct.options || {}).map(([key, values]) => (
                          <div key={key}>
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{key}</p>
                              {posShowOptionErrors && !posProductCustomizations[key] && (
                                <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest animate-pulse">Required</span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {Array.isArray(values) && values.map(value => {
                                const isColor = key.toLowerCase() === 'colors' || key.toLowerCase() === 'color';
                                const isValidHex = typeof value === 'string' && /^#([A-Fa-f0-9]{3}){1,2}$/.test(value);

                                return (
                                  <button
                                    key={value}
                                    onClick={() => {
                                      setPosProductCustomizations((prev: any) => ({ ...prev, [key]: value }));
                                      setPosShowOptionErrors(false);
                                    }}
                                    className={`rounded-xl transition-all flex items-center justify-center gap-2 ${
                                      isColor && isValidHex
                                        ? `w-10 h-10 border-2 ${posProductCustomizations[key] === value ? 'border-[#d35400] scale-110 shadow-md' : (posShowOptionErrors && !posProductCustomizations[key] ? 'border-red-200' : 'border-transparent hover:scale-105')}`
                                        : `px-4 py-2 text-sm font-bold ${
                                            posProductCustomizations[key] === value 
                                              ? 'bg-[#1a1a1a] text-white' 
                                              : (posShowOptionErrors && !posProductCustomizations[key] ? 'bg-red-50 text-red-400 border border-red-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')
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
                                      value
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 border-t border-black/5 bg-gray-50/50">
                        {posShowOptionErrors && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 text-red-600 text-[10px] font-bold uppercase tracking-widest animate-bounce">
                            <X size={14} />
                            Please select all required options
                          </div>
                        )}
                        <button
                          onClick={() => {
                            const missing = getMissingPosOptions();
                            if (missing.length > 0) {
                              setPosShowOptionErrors(true);
                              return;
                            }
                            
                            setPosCart(prev => {
                              const existing = prev.find(item => 
                                item.product.id === selectedPosProduct.id && 
                                JSON.stringify((item as any).customizations) === JSON.stringify(posProductCustomizations)
                              );
                              if (existing) {
                                return prev.map(item => 
                                  (item.product.id === selectedPosProduct.id && JSON.stringify((item as any).customizations) === JSON.stringify(posProductCustomizations))
                                    ? { ...item, quantity: item.quantity + 1 } 
                                    : item
                                );
                              }
                              return [...prev, { product: selectedPosProduct, quantity: 1, customizations: posProductCustomizations }];
                            });
                            setSelectedPosProduct(null);
                            setPosShowOptionErrors(false);
                          }}
                          className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg shadow-black/5 ${
                            posShowOptionErrors ? 'bg-red-500 text-white' : 'bg-[#1a1a1a] hover:bg-[#d35400] text-white'
                          }`}
                        >
                          {posShowOptionErrors ? 'Select Options' : 'Add to Order'}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {activeTab === 'products' ? (
            <ProductsSection 
              products={products}
              departments={departments}
              loading={loading}
              addProduct={addProduct}
              updateProduct={updateProduct}
              deleteProduct={deleteProduct}
              updateStock={updateStock}
              startEditingProduct={startEditingProduct}
              editingProductId={editingProductId}
              setEditingProductId={setEditingProductId}
              editProdName={editProdName}
              setEditProdName={setEditProdName}
              editProdPrice={editProdPrice}
              setEditProdPrice={setEditProdPrice}
              editProdOriginalPrice={editProdOriginalPrice}
              setEditProdOriginalPrice={setEditProdOriginalPrice}
              editProdDiscountPercentage={editProdDiscountPercentage}
              setEditProdDiscountPercentage={setEditProdDiscountPercentage}
              editProdDescription={editProdDescription}
              setEditProdDescription={setEditProdDescription}
              editProdImage={editProdImage}
              setEditProdImage={setEditProdImage}
              editProdDept={editProdDept}
              setEditProdDept={setEditProdDept}
              editProdStock={editProdStock}
              setEditProdStock={setEditProdStock}
              setEditStockValue={setEditStockValue}
              editingStockId={editingStockId}
              setEditingStockId={setEditingStockId}
              editStockValue={editStockValue}
              uploadingNewImage={uploadingNewImage}
              handleNewImageUpload={handleNewImageUpload}
              uploadingEditImage={uploadingEditImage}
              handleEditImageUpload={handleEditImageUpload}
              currency={currency}
              exchangeRate={exchangeRate}
              minStockThreshold={minStockThreshold}
              newProdName={newProdName}
              setNewProdName={setNewProdName}
              newProdPrice={newProdPrice}
              setNewProdPrice={setNewProdPrice}
              newProdOriginalPrice={newProdOriginalPrice}
              setNewProdOriginalPrice={setNewProdOriginalPrice}
              newProdDiscountPercentage={newProdDiscountPercentage}
              setNewProdDiscountPercentage={setNewProdDiscountPercentage}
              newProdDescription={newProdDescription}
              setNewProdDescription={setNewProdDescription}
              newProdImage={newProdImage}
              setNewProdImage={setNewProdImage}
              newProdDept={newProdDept}
              setNewProdDept={setNewProdDept}
              newProdStock={newProdStock}
              setNewProdStock={setNewProdStock}
              newProdOptions={newProdOptions}
              setNewProdOptions={setNewProdOptions}
              newProdPriceModifiers={newProdPriceModifiers}
              setNewProdPriceModifiers={setNewProdPriceModifiers}
              newProdGallery={newProdGallery}
              setNewProdGallery={setNewProdGallery}
              newProdOptionImages={newProdOptionImages}
              setNewProdOptionImages={setNewProdOptionImages}
              editProdOptions={editProdOptions}
              setEditProdOptions={setEditProdOptions}
              editProdPriceModifiers={editProdPriceModifiers}
              setEditProdPriceModifiers={setEditProdPriceModifiers}
              editProdGallery={editProdGallery}
              setEditProdGallery={setEditProdGallery}
              editProdOptionImages={editProdOptionImages}
              setEditProdOptionImages={setEditProdOptionImages}
            />
          ) : null}

          {activeTab === 'transactions' && (user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'secretary' || user?.role === 'staff' || user?.role === 'manager' || user?.role === 'counter_staff') && (
            <motion.div 
              key="transactions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-black/5 pb-4">
                <h2 className="text-xl font-serif font-bold">All Transactions</h2>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text"
                    placeholder="Search Order #..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-black/5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#d35400]/20 transition-all"
                  />
                </div>
              </div>
              
              <div className="max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5">
                      <th className="pb-4 px-4">Order #</th>
                      <th className="pb-4 px-4">Customer</th>
                      <th className="pb-4 px-4">Email</th>
                      <th className="pb-4 px-4">Items</th>
                      <th className="pb-4 px-4">Amount</th>
                      <th className="pb-4 px-4">Method</th>
                      <th className="pb-4 px-4">Status</th>
                      <th className="pb-4 px-4">Date</th>
                      {(user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'manager') && (
                        <th className="pb-4 px-4 text-right">Actions</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {transactions.filter((t: any) => 
                      !searchTerm || 
                      (t.order_number && t.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                      (t.customer_email && t.customer_email.toLowerCase().includes(searchTerm.toLowerCase()))
                    ).map((t: any) => (
                      <tr 
                        key={t.id} 
                        className="text-sm hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTransaction(t);
                          setShowTransactionModal(true);
                        }}
                      >
                        <td className="py-4 px-4 font-mono text-xs font-bold">{t.order_number || `#${t.id}`}</td>
                        <td className="py-4 px-4 font-bold">{t.customer_name}</td>
                        <td className="py-4 px-4 text-gray-500">{t.customer_email || 'N/A'}</td>
                        <td className="py-4 px-4 text-gray-500">{t.items_count || 0} items</td>
                        <td className="py-4 px-4 text-emerald-600 font-bold">{formatPrice(Number(t.amount), currency, exchangeRate)}</td>
                        <td className="py-4 px-4 uppercase text-xs font-bold text-gray-500">{t.payment_method}</td>
                        <td className="py-4 px-4 uppercase text-xs font-bold text-gray-500">{t.status || 'Completed'}</td>
                        <td className="py-4 px-4 text-gray-500">{new Date(t.created_at).toLocaleDateString()}</td>
                        {(user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'manager') && (
                          <td className="py-4 px-4 text-right">
                            <button 
                              onClick={() => deleteOrder(t.order_id)}
                              className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                              title="Delete Order"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-4">
                {transactions.filter((t: any) => 
                  !searchTerm || 
                  (t.order_number && t.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
                  (t.customer_name && t.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
                ).map((t: any) => (
                  <div 
                    key={t.id} 
                    className="bg-gray-50 p-4 rounded-xl border border-black/5 space-y-3 cursor-pointer hover:border-[#d35400]/20 transition-all"
                    onClick={() => {
                      setSelectedTransaction(t);
                      setShowTransactionModal(true);
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.order_number || `#${t.id}`}</p>
                        <p className="font-bold text-[#1a1a1a]">{t.customer_name}</p>
                      </div>
                      <p className="text-emerald-600 font-bold">{formatPrice(Number(t.amount), currency, exchangeRate)}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Method</p>
                        <p className="font-medium uppercase">{t.payment_method}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 uppercase">Date</p>
                        <p className="font-medium">{new Date(t.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-black/5">
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                        {t.status || 'Completed'}
                      </span>
                      {(user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'manager') && (
                        <button 
                          onClick={() => deleteOrder(t.order_id)}
                          className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'departments' && (
            <motion.div 
              key="departments"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm max-w-2xl"
            >
              <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
                <h2 className="text-xl font-serif font-bold">Departments</h2>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{departments.length} Categories</span>
              </div>
              
              {(user?.role === 'super_admin' || user?.role === 'manager') && (
                <form onSubmit={addDepartment} className="flex flex-col sm:flex-row gap-3 mb-8">
                  <input
                    type="text"
                    placeholder="New Department Name"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#d35400] transition-colors"
                    required
                  />
                  <button type="submit" className="bg-[#1a1a1a] hover:bg-[#d35400] text-white px-8 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 font-bold shadow-lg shadow-black/5">
                    <Plus size={18} /> Add
                  </button>
                </form>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {loading ? (
                  <div className="col-span-full flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-[#d35400] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : departments.map(dept => (
                  <div key={dept} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-black/5 hover:border-[#d35400]/20 transition-all group">
                    <span 
                      className="font-bold text-gray-700 cursor-pointer hover:text-[#d35400] transition-colors"
                      onClick={() => setViewingDeptProducts(dept)}
                    >
                      {dept}
                    </span>
                    <button onClick={() => deleteDepartment(dept)} className="text-gray-300 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'accounts' && (user?.role === 'super_admin' || user?.role === 'accountant' || user?.role === 'manager') && (
            <motion.div 
              key="accounts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-emerald-100 p-3 rounded-xl text-emerald-600">
                      <DollarSign size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {reportPeriod === 'daily' ? 'Today\'s' : 
                       reportPeriod === 'weekly' ? 'Weekly' : 
                       reportPeriod === 'monthly' ? 'Monthly' : 
                       reportPeriod === 'quarterly' ? 'Quarterly' : 'Annual'} Inflow
                    </p>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">
                    {formatPrice(Number(reportData?.total_sales || 0), currency, exchangeRate)}
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                      <ShoppingBag size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                      {reportPeriod === 'daily' ? 'Today\'s' : 
                       reportPeriod === 'weekly' ? 'Weekly' : 
                       reportPeriod === 'monthly' ? 'Monthly' : 
                       reportPeriod === 'quarterly' ? 'Quarterly' : 'Annual'} Orders
                    </p>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">
                    {reportData?.total_orders || 0}
                  </h3>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-amber-100 p-3 rounded-xl text-amber-600">
                      <TrendingUp size={24} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Avg Order Value</p>
                  </div>
                  <h3 className="text-3xl font-serif font-bold text-[#1a1a1a]">
                    {formatPrice(Number(reportData?.average_order_value || 0), currency, exchangeRate)}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                  <h2 className="text-xl font-serif font-bold">Financial Reports</h2>
                  <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-xl border border-black/5">
                    {(['daily', 'weekly', 'monthly', 'quarterly', 'annually'] as const).map((period) => (
                      <button
                        key={period}
                        onClick={() => setReportPeriod(period)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                          reportPeriod === period ? 'bg-[#1a1a1a] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {period}
                      </button>
                    ))}
                  </div>
                </div>

                {loadingReport ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-[#d35400] border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : reportData ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Sales</p>
                        <p className="text-xl font-bold text-emerald-700">{formatPrice(Number(reportData.total_sales), currency, exchangeRate)}</p>
                      </div>
                      <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">Orders</p>
                        <p className="text-xl font-bold text-blue-700">{reportData.total_orders}</p>
                      </div>
                      <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Avg Order</p>
                        <p className="text-xl font-bold text-amber-700">{formatPrice(Number(reportData.average_order_value), currency, exchangeRate)}</p>
                      </div>
                    </div>

                    {reportData.salesOverTime && reportData.salesOverTime.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Sales Trend</h3>
                        <div className="h-48 flex items-end gap-1">
                          {reportData.salesOverTime.map((item: any, idx: number) => {
                            const maxSales = Math.max(...reportData.salesOverTime.map((s: any) => Number(s.sales)));
                            const height = maxSales > 0 ? (Number(item.sales) / maxSales) * 100 : 0;
                            return (
                              <div key={idx} className="flex-1 group relative">
                                <div 
                                  className="bg-[#d35400]/20 group-hover:bg-[#d35400] transition-all rounded-t-sm"
                                  style={{ height: `${height}%` }}
                                ></div>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-[#1a1a1a] text-white text-[8px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                  {formatPrice(Number(item.sales), currency, exchangeRate)}
                                  <br />
                                  {new Date(item.date).toLocaleDateString()}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400 italic">
                    No report data available for this period.
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 border-b border-black/5 pb-4">Recent Transactions</h2>
                <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-black/5">
                        <th className="pb-4 px-4">Order ID</th>
                        <th className="pb-4 px-4">Customer</th>
                        <th className="pb-4 px-4">Amount</th>
                        <th className="pb-4 px-4">Type</th>
                        <th className="pb-4 px-4">Status</th>
                        <th className="pb-4 px-4">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                      {accountsData.recentOrders.map((order: any) => (
                        <tr key={order.id} className="text-sm hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-mono text-xs font-bold">{order.order_number || `#${order.id}`}</td>
                          <td className="py-4 px-4 font-bold">{order.customer_name}</td>
                          <td className="py-4 px-4 text-emerald-600 font-bold">{formatPrice(Number(order.total_amount), currency, exchangeRate)}</td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${order.order_type === 'delivery' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                              {order.order_type}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest ${
                              order.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' :
                              order.status === 'CANCELLED' ? 'bg-red-50 text-red-600' :
                              order.status === 'READY' ? 'bg-blue-50 text-blue-600' :
                              order.status === 'IN_PROGRESS' ? 'bg-amber-50 text-amber-600' :
                              order.status === 'AWAITING_CONFIRMATION' ? 'bg-purple-50 text-purple-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {order.status || 'PLACED'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>
        )}

          {activeTab === 'staff' && (user?.role === 'super_admin' || user?.role === 'manager') && (
            <motion.div 
              key="staff"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-black/5 shadow-sm h-fit">
                <div className="flex items-center justify-between mb-6 border-b border-black/5 pb-4">
                  <h2 className="text-xl font-serif font-bold">Add Staff</h2>
                  <button 
                    onClick={() => setShowAddRoleModal(true)}
                    className="text-[10px] font-bold text-[#d35400] hover:text-[#e67e22] uppercase tracking-widest flex items-center gap-1"
                  >
                    <Plus size={12} /> Add Role
                  </button>
                </div>
                <form onSubmit={addStaff} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                      placeholder="Staff Name"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      required
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                      placeholder="email@zenith.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                    <div className="relative">
                      <input
                        type={showStaffPassword ? "text" : "password"}
                        required
                        value={newStaffPassword}
                        onChange={(e) => setNewStaffPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowStaffPassword(!showStaffPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Staff ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newStaffId}
                        onChange={(e) => setNewStaffId(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                        placeholder="ZEN-001 (Auto-generated if empty)"
                      />
                      <button
                        type="button"
                        onClick={() => setNewStaffId(`STF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`)}
                        className="bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-gray-200"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Profile Image</label>
                    <div className="flex gap-2">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                        {newStaffImage ? (
                          <img src={newStaffImage} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <UserIcon size={20} />
                          </div>
                        )}
                      </div>
                      <label className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 text-xs font-bold text-gray-500 cursor-pointer hover:border-[#d35400] transition-colors flex items-center justify-center">
                        {uploadingStaffImage ? 'Uploading...' : 'Choose Image'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleStaffImageUpload} />
                      </label>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Role</label>
                    <div className="space-y-2">
                      <select
                        value={newStaffRole === 'other' ? 'other' : newStaffRole}
                        onChange={(e) => {
                          if (e.target.value === 'other') {
                            setNewStaffRole('other');
                          } else {
                            setNewStaffRole(e.target.value);
                          }
                        }}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#d35400]"
                      >
                        {roles.map((role: any) => (
                          <option key={role.id} value={role.name}>
                            {role.name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                          </option>
                        ))}
                        <option value="accountant">Accountant</option>
                        <option value="secretary">Secretary</option>
                        <option value="manager">Manager</option>
                        <option value="counter_staff">Counter Staff</option>
                        <option value="staff">General Staff</option>
                        <option value="super_admin">Super Admin</option>
                        <option value="other">Other (Type manually)</option>
                      </select>
                      
                      {newStaffRole === 'other' && (
                        <input
                          type="text"
                          required
                          onChange={(e) => setNewStaffRole(e.target.value)}
                          className="w-full bg-gray-50 border border-[#d35400] rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                          placeholder="Enter custom role name"
                          autoFocus
                        />
                      )}
                    </div>
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Departments</label>
                    <div 
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-2.5 text-sm cursor-pointer flex items-center justify-between hover:border-[#d35400] transition-colors"
                      onClick={() => setIsDeptDropdownOpen(!isDeptDropdownOpen)}
                    >
                      <span className="truncate text-gray-600">
                        {newStaffDepartments.length === 0 
                          ? 'Select Departments' 
                          : `${newStaffDepartments.length} selected`}
                      </span>
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${isDeptDropdownOpen ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {isDeptDropdownOpen && (
                      <div className="absolute z-50 top-full left-0 w-full mt-1 bg-white border border-black/5 rounded-xl shadow-xl p-2 max-h-60 flex flex-col animate-in fade-in slide-in-from-top-2">
                        <div className="overflow-y-auto custom-scrollbar flex-1 mb-2">
                          {departments.map(dept => (
                            <div 
                              key={dept}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                                newStaffDepartments.includes(dept) ? 'bg-[#d35400]/5 text-[#d35400]' : 'hover:bg-gray-50 text-gray-600'
                              }`}
                              onClick={() => {
                                if (newStaffDepartments.includes(dept)) {
                                  setNewStaffDepartments(newStaffDepartments.filter(d => d !== dept));
                                } else {
                                  setNewStaffDepartments([...newStaffDepartments, dept]);
                                }
                              }}
                            >
                              <span className="text-xs font-medium">{dept}</span>
                              {newStaffDepartments.includes(dept) && <Check size={14} />}
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsDeptDropdownOpen(false)}
                          className="w-full bg-[#1a1a1a] hover:bg-[#d35400] text-white py-2 rounded-lg text-xs font-bold transition-colors mt-auto"
                        >
                          Confirm Selection
                        </button>
                      </div>
                    )}
                    
                    {newStaffDepartments.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {newStaffDepartments.map(dept => (
                          <span key={dept} className="bg-[#d35400]/10 text-[#d35400] text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1">
                            {dept}
                            <X size={10} className="cursor-pointer" onClick={() => setNewStaffDepartments(newStaffDepartments.filter(d => d !== dept))} />
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button type="submit" className="w-full bg-[#1a1a1a] hover:bg-[#d35400] text-white py-3 rounded-xl font-bold transition-all shadow-lg shadow-black/5 mt-2">
                    Create Account
                  </button>
                </form>
              </div>

              <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
                <h2 className="text-xl font-serif font-bold mb-6 border-b border-black/5 pb-4">Staff Directory</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {staffList.map((staff: any) => (
                    <div key={staff.id} className="bg-gray-50 p-4 rounded-2xl border border-black/5 flex items-center gap-4 hover:border-[#d35400]/20 transition-all group">
                      <div className="w-14 h-14 bg-white rounded-xl overflow-hidden flex items-center justify-center text-[#d35400] border border-black/5 flex-shrink-0">
                        {staff.profile_image_url ? (
                          <img src={staff.profile_image_url} className="w-full h-full object-cover" />
                        ) : (
                          <UserIcon size={28} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#1a1a1a] truncate">{staff.name}</p>
                          {staff.staff_id && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">{staff.staff_id}</span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{staff.email}</p>
                        {staff.departments && staff.departments.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {staff.departments.map((dept: string) => (
                              <span key={dept} className="text-[8px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded border border-black/5">
                                {dept}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-widest ${
                            staff.role === 'super_admin' ? 'bg-purple-50 text-purple-600' : 
                            staff.role === 'manager' ? 'bg-indigo-50 text-indigo-600' :
                            staff.role === 'accountant' ? 'bg-emerald-50 text-emerald-600' :
                            staff.role === 'secretary' ? 'bg-amber-50 text-amber-600' :
                            staff.role === 'counter_staff' ? 'bg-blue-50 text-blue-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            {staff.role.replace('_', ' ')}
                          </span>
                          <button 
                            onClick={() => fetchActivities(staff.id, staff.name)}
                            className="text-[9px] font-bold text-[#d35400] bg-[#d35400]/10 px-2 py-1 rounded-md uppercase tracking-widest hover:bg-[#d35400]/20 transition-colors"
                          >
                            Activities
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 ml-auto">
                        <button 
                          onClick={() => handleEditStaff(staff)}
                          className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-600 hover:text-[#d35400] hover:border-[#d35400]/30 transition-colors rounded-lg shadow-sm"
                          title="Edit Staff"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          onClick={() => deleteStaff(staff.id)}
                          className="flex items-center justify-center w-8 h-8 bg-white border border-gray-200 text-gray-600 hover:text-red-500 hover:border-red-200 transition-colors rounded-lg shadow-sm"
                          title="Delete Staff"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'activities' && (user?.role === 'super_admin' || user?.role === 'manager') && (
            <motion.div 
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-black/5 pb-4">
                <h2 className="text-xl font-serif font-bold text-[#1a1a1a]">User Activity Logs</h2>
                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#d35400] transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Search size={16} />
                    </div>
                  </div>
                  <select
                    value={activityRoleFilter}
                    onChange={(e) => setActivityRoleFilter(e.target.value)}
                    className="w-full sm:w-auto bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#d35400] transition-colors"
                  >
                    <option value="all">All Roles</option>
                    <option value="super_admin">Super Admin</option>
                    <option value="manager">Manager</option>
                    <option value="accountant">Accountant</option>
                    <option value="secretary">Secretary</option>
                    <option value="staff">General Staff</option>
                    <option value="counter_staff">Counter Staff</option>
                    <option value="customer">Customer</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allUsers.filter(u => {
                  const matchesSearch = !activitySearch || 
                    (u.name && u.name.toLowerCase().includes(activitySearch.toLowerCase())) ||
                    (u.email && u.email.toLowerCase().includes(activitySearch.toLowerCase()));
                  const matchesRole = activityRoleFilter === 'all' || u.role === activityRoleFilter;
                  return matchesSearch && matchesRole;
                }).length === 0 ? (
                  <p className="text-center py-12 text-gray-400 italic col-span-full">No users found.</p>
                ) : allUsers.filter(u => {
                  const matchesSearch = !activitySearch || 
                    (u.name && u.name.toLowerCase().includes(activitySearch.toLowerCase())) ||
                    (u.email && u.email.toLowerCase().includes(activitySearch.toLowerCase()));
                  const matchesRole = activityRoleFilter === 'all' || u.role === activityRoleFilter;
                  return matchesSearch && matchesRole;
                }).map((u) => (
                  <div 
                    key={u.id} 
                    onClick={() => fetchActivities(u.id, u.name || 'Unknown User')}
                    className="bg-gray-50 p-4 rounded-xl border border-black/5 flex items-center gap-4 hover:border-[#d35400]/40 hover:bg-[#d35400]/5 cursor-pointer transition-all group"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-200 flex-shrink-0">
                      {u.profile_image_url ? (
                        <img src={u.profile_image_url} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[#1a1a1a] truncate">{u.name || 'Unknown User'}</p>
                      <p className="text-xs text-gray-500 truncate mb-1">{u.email}</p>
                      <span className="inline-block text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">
                        {u.role?.replace('_', ' ') || 'N/A'}
                      </span>
                    </div>
                    <div className="text-gray-300 group-hover:text-[#d35400] transition-colors">
                      <Activity size={20} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </div>
      <ProductModal 
        product={selectedProduct} 
        onClose={() => setSelectedProduct(null)} 
        onAddToCart={(product, quantity, customizations) => {
          // Handle add to cart from modal if needed
          setPosCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
              return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { product, quantity }];
          });
        }}
        currency={currency}
        user={user}
      />
    </div>
  );
}
