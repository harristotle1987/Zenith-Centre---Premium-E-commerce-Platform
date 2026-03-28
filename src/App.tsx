import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RecommendedCategories } from './components/RecommendedCategories';
import { ProductCard } from './components/ProductCard';
import { MemberVault } from './components/MemberVault';
import { Product } from './constants/products';
import { AdminDashboard } from './AdminDashboard';
import { Auth } from './components/Auth';
import { Cart } from './components/Cart';
import { Profile } from './components/Profile';
import { Footer } from './components/Footer';
import { ProductModal } from './components/ProductModal';
import { getApiUrl } from './utils/api';
import { Currency } from './utils/currency';
import { Toaster, toast } from 'sonner';

export default function App() {
  const [activeDepartment, setActiveDepartment] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [recommendedCategories, setRecommendedCategories] = useState<string[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [isAdminView, setIsAdminView] = useState(() => {
    return localStorage.getItem('isAdminView') === 'true';
  });
  const [profileTab, setProfileTab] = useState<'info' | 'orders' | 'admin' | null>(() => {
    return localStorage.getItem('profileTab') as 'info' | 'orders' | 'admin' | null;
  });

  useEffect(() => {
    localStorage.setItem('isAdminView', isAdminView.toString());
  }, [isAdminView]);

  useEffect(() => {
    if (profileTab) {
      localStorage.setItem('profileTab', profileTab);
    } else {
      localStorage.removeItem('profileTab');
    }
  }, [profileTab]);
  const [currency, setCurrency] = useState<Currency>((localStorage.getItem('currency') as Currency) || 'NGN');
  
  // Auth State
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showAuth, setShowAuth] = useState(false);

  // Cart State
  const [cartItems, setCartItems] = useState<any[]>(() => {
    const savedCart = localStorage.getItem('cartItems');
    if (!savedCart) return [];
    try {
      const items = JSON.parse(savedCart);
      // Migrate old items to include cartItemId if missing
      return items.map((item: any) => {
        if (!item.cartItemId) {
          const customizationString = JSON.stringify(item.customizations || {});
          return { ...item, cartItemId: `${item.id}-${customizationString}` };
        }
        return item;
      });
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleLogin = (userData: any, userToken: string) => {
    setUser(userData);
    setToken(userToken);
    localStorage.setItem('token', userToken);
    setShowAuth(false);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    setIsAdminView(false);
    setProfileTab(null);
    setCartItems([]);
    localStorage.removeItem('cartItems');
    localStorage.removeItem('isAdminView');
    localStorage.removeItem('profileTab');
    localStorage.removeItem('adminActiveTab');
    localStorage.removeItem('profileActiveTab');
  };

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  const addToCart = (product: Product, quantity: number = 1, customizations: any = {}) => {
    setCartItems(prev => {
      // Create a unique ID for the cart item based on product ID and customizations
      const customizationString = JSON.stringify(customizations);
      const cartItemId = `${product.id}-${customizationString}`;
      
      const existing = prev.find(item => item.cartItemId === cartItemId);
      if (existing) {
        toast.success(`Updated ${product.name} in cart`);
        return prev.map(item => item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + quantity } : item);
      }
      toast.success(`Added ${product.name} to cart`);
      return [...prev, { ...product, cartItemId, quantity, customizations }];
    });
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (cartItemId: string) => {
    setCartItems(prev => prev.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cartItems');
  };

  const fetchData = useCallback(async () => {
    try {
      const fetchWithLogging = async (url: string, options?: RequestInit) => {
        try {
          const res = await fetch(url, options);
          if (!res.ok) {
            const text = await res.text().catch(() => 'No body');
            console.error(`Fetch error for ${url}: ${res.status} ${res.statusText}`, text);
          }
          return res;
        } catch (err) {
          console.error(`Network error for ${url}:`, err);
          throw err;
        }
      };

      const [deptRes, prodRes, settingsRes] = await Promise.all([
        fetchWithLogging(getApiUrl('/api/departments')),
        fetchWithLogging(getApiUrl('/api/products')),
        fetchWithLogging(getApiUrl('/api/settings/public'))
      ]);
      
      if (!deptRes.ok) {
        throw new Error(`Departments fetch failed: ${deptRes.status}`);
      }
      if (!prodRes.ok) {
        throw new Error(`Products fetch failed: ${prodRes.status}`);
      }

      const depts = await deptRes.json();
      const prods = await prodRes.json();
      if (settingsRes.ok) {
        setSettings(await settingsRes.json());
      }

      setDepartments(depts);
      setProducts(prods);
    } catch (error: any) {
      console.error("Failed to fetch data", error);
      // Only alert if it's not a MetaMask error (though this is data fetch)
      if (!error.message?.includes('MetaMask')) {
        console.warn(`Data fetch error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await fetch(getApiUrl('/api/auth/me'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
          } else {
            handleLogout();
          }
        } catch (err) {
          console.error('Auth check failed', err);
          handleLogout();
        }
      }
    };
    checkAuth();
  }, [token]);

  useEffect(() => {
    const handleToggleAdmin = (e: any) => {
      setIsAdminView(e.detail);
    };
    window.addEventListener('toggleAdminView', handleToggleAdmin);
    return () => window.removeEventListener('toggleAdminView', handleToggleAdmin);
  }, []);

  useEffect(() => {
    if (!isAdminView) {
      fetchData();
    }
  }, [isAdminView, fetchData]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await fetch(getApiUrl('/api/recommendations/categories'), {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        if (res.ok) {
          setRecommendedCategories(await res.json());
        }
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      }
    };
    fetchRecommendations();
  }, [token]);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    
    const timer = setTimeout(async () => {
      try {
        await fetch(getApiUrl('/api/log-search'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ query: searchQuery })
        });
      } catch (err) {
        console.error('Failed to log search', err);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery, token]);

  const filteredProducts = products.filter(p => {
    const matchesDept = activeDepartment === 'All' || p.department === activeDepartment;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d35400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (showAuth) {
    return <Auth onLogin={handleLogin} onClose={() => setShowAuth(false)} />;
  }

  if (profileTab && user) {
    return (
      <Profile 
        user={user} 
        onLogout={handleLogout} 
        onBackToStore={() => setProfileTab(null)} 
        onUpdateUser={(updatedUser) => setUser(updatedUser)}
        currency={currency}
        initialTab={profileTab}
        onTabChange={(tab) => setProfileTab(tab)}
        cartItems={cartItems}
      />
    );
  }

  if (isAdminView && user && (user.role === 'super_admin' || user.role === 'staff' || user.role === 'accountant' || user.role === 'secretary')) {
    return (
      <div className="min-h-screen bg-[#fdfbf7]">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 flex justify-between items-center">
          <button 
            onClick={() => setIsAdminView(false)}
            className="text-gray-500 hover:text-[#d35400] transition-colors flex items-center gap-2 font-medium"
          >
            &larr; Back to Store
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-black/5 rounded-full p-1 mr-4">
              <button 
                onClick={() => handleCurrencyChange('NGN')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${currency === 'NGN' ? 'bg-[#d35400] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
              >
                NGN
              </button>
              <button 
                onClick={() => handleCurrencyChange('USD')}
                className={`px-3 py-1 text-[10px] font-bold rounded-full transition-all ${currency === 'USD' ? 'bg-[#d35400] text-white' : 'text-gray-500 hover:text-[#1a1a1a]'}`}
              >
                USD
              </button>
            </div>
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline">Logout</button>
          </div>
        </div>
        <AdminDashboard user={user} currency={currency} onUpdateUser={(updatedUser) => setUser(updatedUser)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#1a1a1a] selection:bg-[#d35400] selection:text-white font-sans">
      <Navbar 
        departments={departments}
        activeDepartment={activeDepartment}
        setActiveDepartment={setActiveDepartment}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setShowAuth(true)}
        onProfileClick={(tab) => setProfileTab(tab)}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        onCartClick={() => setIsCartOpen(true)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <main>
        <Hero searchQuery={searchQuery} setSearchQuery={setSearchQuery} settings={settings} />
        
        <RecommendedCategories 
          categories={recommendedCategories} 
          onCategoryClick={(cat) => {
            setActiveDepartment(cat);
            window.scrollTo({ top: document.getElementById('menu-section')?.offsetTop || 800, behavior: 'smooth' });
          }} 
          settings={settings}
        />
        
        <div id="menu-section" />

        {activeDepartment === 'All' && !searchQuery ? (
          <div className="py-16 bg-[#fdfbf7] space-y-20">
            {departments.filter(d => d !== 'All').map(dept => {
              const deptProducts = products.filter(p => p.department === dept).slice(0, 3);
              if (deptProducts.length === 0) return null;
              
              return (
                <section key={dept} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
                    <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] uppercase tracking-tight">{dept}</h2>
                    <button 
                      onClick={() => setActiveDepartment(dept)}
                      className="text-sm font-bold text-[#d35400] uppercase tracking-widest hover:underline"
                    >
                      View All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {deptProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={() => addToCart(product)}
                        onViewDetails={(p) => setSelectedProduct(p)}
                        currency={currency}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <section className="py-16 bg-[#fdfbf7]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] uppercase tracking-tight">
                  {searchQuery ? 'Search Results' : activeDepartment}
                </h2>
                {activeDepartment !== 'All' && !searchQuery && (
                  <button 
                    onClick={() => setActiveDepartment('All')}
                    className="text-sm font-bold text-gray-500 uppercase tracking-widest hover:text-[#1a1a1a]"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-12">
                <main className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {filteredProducts.map(product => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={() => addToCart(product)}
                        onViewDetails={(p) => setSelectedProduct(p)}
                        currency={currency}
                      />
                    ))}
                  </div>
                  {filteredProducts.length === 0 && (
                    <div className="text-center py-20">
                      <p className="text-gray-500 text-lg">No products found.</p>
                    </div>
                  )}
                </main>
              </div>
            </div>
          </section>
        )}

        <MemberVault />
      </main>

      <Cart 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateCartQuantity}
        onRemove={removeFromCart}
        onCheckout={clearCart}
        user={user}
        currency={currency}
      />

      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={addToCart}
        currency={currency}
        user={user}
      />

      <Footer 
        user={user} 
        onAdminClick={() => {
          if (user && (user.role === 'super_admin' || user.role === 'staff' || user.role === 'accountant' || user.role === 'secretary')) {
            setIsAdminView(true);
          } else {
            setShowAuth(true);
          }
        }} 
      />
      <Toaster position="top-right" richColors />
    </div>
  );
}
