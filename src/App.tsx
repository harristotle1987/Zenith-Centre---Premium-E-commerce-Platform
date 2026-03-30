import { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { AnimatePresence } from 'motion/react';
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
import { InfoModal } from './components/InfoModal';
import { ProductModal } from './components/ProductModal';
import { getApiUrl } from './utils/api';
import { Currency } from './utils/currency';
import { Toaster, toast } from 'sonner';
import { CurrencyToggle } from './components/CurrencyToggle';

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
  const [infoModal, setInfoModal] = useState<{ type: string; title: string; content: React.ReactNode } | null>(null);
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
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

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
      if (token && token !== 'undefined' && token !== 'null') {
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
      } else if (token) {
        handleLogout();
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
    const socket = io(getApiUrl(''));

    socket.on('productAdded', (newProduct) => {
      setProducts(prev => [...prev, newProduct]);
    });

    socket.on('productUpdated', (updatedProduct) => {
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
    });

    socket.on('productDeleted', (deletedId) => {
      setProducts(prev => prev.filter(p => p.id !== deletedId));
    });

    socket.on('settingsUpdated', (newSettings) => {
      setSettings(newSettings);
    });

    return () => {
      socket.disconnect();
    };
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

  const handleFooterLink = (link: string) => {
    switch (link) {
      case 'our-story':
        setInfoModal({
          type: 'our-story',
          title: 'Our Story',
          content: (
            <div className="space-y-6">
              <p className="text-lg font-serif italic text-[#d35400]">Founded on the principles of quality, integrity, and community.</p>
              <p>Zenith Centre began as a small artisanal pantry in the heart of the city. Our mission has always been simple: to curate the world's finest goods and make them accessible to those who appreciate the art of living well.</p>
              <p>Every product in our collection is hand-selected for its exceptional quality, sustainable sourcing, and unique character. We believe that the items we surround ourselves with should tell a story and inspire our daily rituals.</p>
              <p>Today, Zenith Centre stands as a beacon for quality, serving a global community of discerning individuals who seek more than just products—they seek experiences.</p>
            </div>
          )
        });
        break;
      case 'journal':
        setInfoModal({
          type: 'journal',
          title: 'The Zenith Journal',
          content: (
            <div className="space-y-8">
              <div className="border-b border-black/5 pb-6">
                <span className="text-[10px] font-bold text-[#d35400] uppercase tracking-[0.2em] mb-2 block">Spring 2026</span>
                <h4 className="text-xl font-serif font-bold mb-3">The Art of the Morning Ritual</h4>
                <p className="text-sm text-gray-500">Exploring the meditative process of pour-over coffee and how it sets the tone for a productive day.</p>
              </div>
              <div className="border-b border-black/5 pb-6">
                <span className="text-[10px] font-bold text-[#d35400] uppercase tracking-[0.2em] mb-2 block">Winter 2025</span>
                <h4 className="text-xl font-serif font-bold mb-3">Sourcing from the Source</h4>
                <p className="text-sm text-gray-500">A journey to the high-altitude tea gardens of Darjeeling to meet the families behind our exclusive blends.</p>
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#d35400] uppercase tracking-[0.2em] mb-2 block">Autumn 2025</span>
                <h4 className="text-xl font-serif font-bold mb-3">The Sustainable Pantry</h4>
                <p className="text-sm text-gray-500">Practical tips for reducing waste and choosing ethically produced essentials for your home.</p>
              </div>
            </div>
          )
        });
        break;
      case 'privacy':
        setInfoModal({
          type: 'privacy',
          title: 'Privacy Policy',
          content: (
            <div className="space-y-6 text-sm">
              <p>At Zenith Centre, we take your privacy seriously. This policy outlines how we collect, use, and protect your personal information.</p>
              <h4 className="font-bold text-[#1a1a1a]">Information Collection</h4>
              <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or subscribe to our newsletter.</p>
              <h4 className="font-bold text-[#1a1a1a]">Use of Information</h4>
              <p>We use your information to process orders, provide customer support, and send you updates about our products and services (if you've opted in).</p>
              <h4 className="font-bold text-[#1a1a1a]">Data Security</h4>
              <p>We implement industry-standard security measures to protect your data from unauthorized access or disclosure.</p>
              <p>For more detailed information, please contact our privacy team at privacy@zenithcentre.com.</p>
            </div>
          )
        });
        break;
      case 'terms':
        setInfoModal({
          type: 'terms',
          title: 'Terms of Service',
          content: (
            <div className="space-y-6 text-sm">
              <p>By accessing or using Zenith Centre, you agree to be bound by these terms of service.</p>
              <h4 className="font-bold text-[#1a1a1a]">Product Availability</h4>
              <p>All products are subject to availability. We reserve the right to limit quantities or discontinue products at any time.</p>
              <h4 className="font-bold text-[#1a1a1a]">Pricing</h4>
              <p>Prices are subject to change without notice. We are not responsible for typographical errors in pricing or descriptions.</p>
              <h4 className="font-bold text-[#1a1a1a]">User Conduct</h4>
              <p>You agree to use our services only for lawful purposes and in a manner that does not infringe upon the rights of others.</p>
              <p>These terms are governed by the laws of the jurisdiction in which Zenith Centre operates.</p>
            </div>
          )
        });
        break;
      case 'member-vault':
        window.scrollTo({ top: document.getElementById('member-vault-section')?.offsetTop || 2000, behavior: 'smooth' });
        break;
      case 'departments':
        window.scrollTo({ top: document.getElementById('menu-section')?.offsetTop || 800, behavior: 'smooth' });
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#d35400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (profileTab && user) {
    return (
      <Profile 
        user={user} 
        onLogout={handleLogout} 
        onBackToStore={() => setProfileTab(null)} 
        onUpdateUser={(updatedUser) => setUser(updatedUser)}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
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
            <CurrencyToggle currency={currency} onCurrencyChange={handleCurrencyChange} />
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">{user.role.replace('_', ' ')}</span>
            <button onClick={handleLogout} className="text-xs font-bold text-red-500 uppercase tracking-widest hover:underline">Logout</button>
          </div>
        </div>
        <AdminDashboard user={user} currency={currency} onCurrencyChange={handleCurrencyChange} onUpdateUser={(updatedUser) => setUser(updatedUser)} />
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
        onLoginClick={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
        onSignUpClick={() => {
          setAuthMode('signup');
          setShowAuth(true);
        }}
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
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-4">
                <h2 className="text-2xl font-serif font-bold text-[#1a1a1a] uppercase tracking-tight">Featured Products</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {products
                  .sort(() => 0.5 - Math.random())
                  .slice(0, 6)
                  .map(product => (
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

        <div id="member-vault-section" />
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
        onLinkClick={handleFooterLink}
      />

      <InfoModal 
        isOpen={!!infoModal}
        onClose={() => setInfoModal(null)}
        title={infoModal?.title || ''}
        content={infoModal?.content || null}
      />
      <AnimatePresence>
        {showAuth && (
          <Auth 
            onLogin={handleLogin} 
            onClose={() => setShowAuth(false)} 
            initialMode={authMode}
          />
        )}
      </AnimatePresence>
      <Toaster position="top-right" richColors />
    </div>
  );
}
