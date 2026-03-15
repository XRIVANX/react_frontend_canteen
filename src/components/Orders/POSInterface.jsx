import React, { useState, useEffect } from 'react';
import { useCart } from '../../Context/CartContext';
import { orderService } from '../../Services/orderService';
import api from '../../Services/api';
import toast from 'react-hot-toast';

/* ── Icons ── */
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7 7 0 1116.65 16.65z" />
  </svg>
);
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);
const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

/* ── Stock badge ── */
const getStockBadge = (qty, threshold) => {
  if (qty === 0)        return { bg: '#fef2f2', color: '#991b1b', text: 'Out of Stock' };
  if (qty <= threshold) return { bg: '#fefce8', color: '#92400e', text: `Low: ${qty}` };
  return                       { bg: '#dcfce7', color: '#14532d', text: `In Stock: ${qty}` };
};

const POSInterface = () => {
  const [menuItems, setMenuItems]               = useState([]);
  const [categories, setCategories]             = useState([]);
  const [customers, setCustomers]               = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm]             = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [loading, setLoading]                   = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [paymentMethod, setPaymentMethod]       = useState('cash');
  const [notes, setNotes]                       = useState('');
  const [processing, setProcessing]             = useState(false);
  const [imageErrors, setImageErrors]           = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  // Mobile: which tab is active
  const [mobileTab, setMobileTab]               = useState('menu'); // 'menu' | 'cart'

  const { items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } = useCart();

  useEffect(() => { fetchData(); fetchCustomers(); }, []);

  useEffect(() => {
    if (customerSearchTerm.trim() === '') {
      setFilteredCustomers(customers.slice(0, 5));
    } else {
      const q = customerSearchTerm.toLowerCase();
      setFilteredCustomers(
        customers.filter(c =>
          c.name?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q) ||
          c.id?.toString().includes(q)
        ).slice(0, 5)
      );
    }
  }, [customerSearchTerm, customers]);

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([api.get('/menu'), api.get('/categories')]);
      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
      const raw = catRes.data;
      setCategories(Array.isArray(raw) ? raw : raw?.data ?? Object.values(raw ?? {}));
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      const res = await api.get('/customers');
      const list = res.data?.data ?? (Array.isArray(res.data) ? res.data : []);
      setCustomers(list);
      setFilteredCustomers(list.slice(0, 5));
    } catch (err) {
      if (err.response?.status !== 401 && err.response?.status !== 403) {
        setDemoCustomers();
      }
    } finally {
      setCustomersLoading(false);
    }
  };

  const setDemoCustomers = () => {
    const demo = [
      { id: 4, name: 'Customer 1', email: 'customer1@canteen.com' },
      { id: 5, name: 'Customer 2', email: 'customer2@canteen.com' },
    ];
    setCustomers(demo);
    setFilteredCustomers(demo);
  };

  const fmt = (p) => (parseFloat(p) || 0).toFixed(2);

  const getStock = (id) => (menuItems.find(m => m.id === id)?.stock_quantity ?? 999);

  const filteredItems = menuItems.filter(item =>
    (selectedCategory === 'all' || item.category_id === parseInt(selectedCategory)) &&
    item.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    item.is_available
  );

  const handleAddToCart = (item) => {
    if ((item.stock_quantity ?? 1) <= 0) { toast.error(`${item.name} is out of stock`); return; }
    const inCart = items.find(i => i.menu_item_id === item.id)?.quantity ?? 0;
    if (inCart >= (item.stock_quantity ?? 999)) { toast.error(`Only ${item.stock_quantity} available`); return; }
    addToCart(item);
  };

  const handleIncrease = (id, qty) => {
    const stock = getStock(id);
    if (qty >= stock) { toast.error(`Only ${stock} in stock`); return; }
    updateQuantity(id, qty + 1);
  };

  const handleSubmitOrder = async () => {
    if (!items.length)     { toast.error('Cart is empty'); return; }
    if (!selectedCustomer) { toast.error('Please select a customer'); return; }
    setProcessing(true);
    try {
      await orderService.createOrder({
        user_id: selectedCustomer.id,
        items: items.map(({ menu_item_id, quantity }) => ({ menu_item_id, quantity })),
        payment_method: paymentMethod,
        notes,
      });
      toast.success(`Order placed for ${selectedCustomer.name}!`);
      clearCart();
      setNotes('');
      setSelectedCustomer(null);
      setMobileTab('menu');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  /* ── Shared customer selector ── */
  const CustomerSelector = () => (
    <div className="mb-4 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-gray-700">
          Customer <span className="text-red-500">*</span>
        </label>
        {customersLoading && <span className="text-xs text-gray-400">Loading…</span>}
      </div>
      {!selectedCustomer ? (
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><UserIcon /></span>
          <input type="text" placeholder="Search customer…" value={customerSearchTerm}
            onChange={e => { setCustomerSearchTerm(e.target.value); setShowCustomerDropdown(true); }}
            onFocus={() => setShowCustomerDropdown(true)}
            className="input-primary pl-9" />
          {showCustomerDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowCustomerDropdown(false)} />
              <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-lg max-h-52 overflow-y-auto border border-gray-200">
                {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                  <div key={c.id} onClick={() => { setSelectedCustomer(c); setShowCustomerDropdown(false); setCustomerSearchTerm(''); toast.success(`Customer: ${c.name}`); }}
                    className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer border-b last:border-0">
                    <p className="font-semibold text-sm text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-500">{c.email}</p>
                  </div>
                )) : (
                  <p className="px-4 py-3 text-center text-sm text-gray-400">
                    {customerSearchTerm ? 'No customers found' : 'Type to search'}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: '#FEF2F2', border: '1px solid #FECACA' }}>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-full" style={{ background: '#800000' }}><span className="text-white"><UserIcon /></span></div>
            <div>
              <p className="font-semibold text-sm text-gray-900">{selectedCustomer.name}</p>
              <p className="text-xs text-gray-500">{selectedCustomer.email}</p>
            </div>
          </div>
          <button onClick={() => setSelectedCustomer(null)}
            className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg text-red-600 hover:bg-red-100">
            <CloseIcon /> Change
          </button>
        </div>
      )}
    </div>
  );

  /* ── Cart panel content ── */
  const renderCartPanel = () => (
    <div className="flex flex-col h-full">
      <CustomerSelector />

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-3">
        {items.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <CartIcon />
            <p className="mt-2 text-sm">Your cart is empty</p>
          </div>
        ) : items.map(item => {
          const stock = getStock(item.menu_item_id);
          return (
            <div key={item.menu_item_id} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm text-gray-900 flex-1 pr-2">{item.name}</span>
                <button onClick={() => removeFromCart(item.menu_item_id)}
                  className="text-red-400 hover:text-red-600 text-xl leading-none">×</button>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                    className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center justify-center">−</button>
                  <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                  <button onClick={() => handleIncrease(item.menu_item_id, item.quantity)}
                    disabled={item.quantity >= stock}
                    className="w-7 h-7 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 flex items-center justify-center disabled:opacity-40">+</button>
                </div>
                <span className="font-bold text-sm" style={{ color: '#800000' }}>
                  ₱{(parseFloat(fmt(item.price)) * item.quantity).toFixed(2)}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">₱{fmt(item.price)} each · max {stock}</p>
            </div>
          );
        })}
      </div>

      {/* Checkout */}
      <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Payment</label>
          <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
            className="input-primary text-sm">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="online">Online</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="input-primary text-sm resize-none" placeholder="Special instructions…" />
        </div>
        <div className="flex justify-between items-center py-2 px-3 rounded-xl" style={{ background: '#FEF2F2' }}>
          <span className="font-bold" style={{ color: '#800000' }}>Total</span>
          <span className="text-xl font-bold" style={{ color: '#800000' }}>₱{getTotal().toFixed(2)}</span>
        </div>
        <button onClick={handleSubmitOrder}
          disabled={processing || items.length === 0 || !selectedCustomer}
          className="w-full py-3.5 rounded-xl font-bold text-white text-sm transition-all"
          style={{
            background: (processing || !items.length || !selectedCustomer) ? '#9ca3af' : 'linear-gradient(135deg, #800000, #9B1C1C)',
            cursor: (processing || !items.length || !selectedCustomer) ? 'not-allowed' : 'pointer',
          }}>
          {processing
            ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Processing…</span>
            : `Place Order · ₱${getTotal().toFixed(2)}`}
        </button>
      </div>
    </div>
  );

  /* ── Menu grid content ── */
  const renderMenuGrid = () => (
    <>
      {/* Search + Filter */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><SearchIcon /></span>
          <input type="text" placeholder="Search…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)} className="input-primary pl-9 text-sm" />
        </div>
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="input-primary text-sm" style={{ width: '130px', flexShrink: 0 }}>
          <option value="all">All</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredItems.length > 0 ? filteredItems.map(item => {
          const oos = (item.stock_quantity ?? 1) <= 0;
          const badge = getStockBadge(item.stock_quantity ?? 0, item.low_stock_threshold ?? 5);
          return (
            <div key={item.id}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all ${oos ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-md active:scale-95'}`}
              onClick={() => !oos && handleAddToCart(item)}>
              {/* Image */}
              <div className="relative" style={{ height: '100px' }}>
                {item.image && !imageErrors[item.id] ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                    onError={() => setImageErrors(p => ({ ...p, [item.id]: true }))} loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: oos ? '#9ca3af' : 'linear-gradient(135deg,#800000,#9B1C1C)' }}>
                    <span className="text-3xl font-bold text-white">{(item.name || '?')[0]}</span>
                  </div>
                )}
                {oos && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <span className="text-white font-bold text-xs">Out of Stock</span>
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="p-2.5">
                <h3 className="font-bold text-gray-900 text-xs truncate">{item.name}</h3>
                <div className="flex items-center justify-between mt-1.5 gap-1">
                  <span className="font-bold text-sm" style={{ color: '#800000' }}>₱{fmt(item.price)}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                    style={{ background: badge.bg, color: badge.color }}>{badge.text}</span>
                </div>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-12 text-gray-400 text-sm">No items found</div>
        )}
      </div>
    </>
  );

  if (loading) return (
    <div className="p-4 animate-pulse space-y-4">
      <div className="skeleton h-10 rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-40 rounded-xl" />)}
      </div>
    </div>
  );

  return (
    <>
      {/* ════════════════════════════════════════════
          DESKTOP: classic side-by-side layout
          hidden on mobile (< md)
      ════════════════════════════════════════════ */}
      <div className="hidden md:flex h-[calc(100vh-4rem)] bg-gray-100 -mx-4">
        {/* Menu pane */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-5">Point of Sale</h1>
          <CustomerSelector />
          {renderMenuGrid()}
        </div>
        {/* Cart pane */}
        <div className="w-80 xl:w-96 bg-white shadow-xl flex flex-col p-5 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100 flex items-center gap-2">
            <CartIcon /> Order
            {items.length > 0 && (
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ background: '#800000' }}>
                {getItemCount()}
              </span>
            )}
          </h2>
          {renderCartPanel()}
        </div>
      </div>

      {/* ════════════════════════════════════════════
          MOBILE: tab-based layout
          shown only on mobile (< md)
      ════════════════════════════════════════════ */}
      <div className="md:hidden flex flex-col min-h-[calc(100vh-4rem)]">
        {/* Tab bar */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm mx-1 mb-4">
          <button onClick={() => setMobileTab('menu')}
            className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            style={mobileTab === 'menu' ? { background: '#800000', color: '#fff' } : { background: '#fff', color: '#4b5563' }}>
            🍽️ Menu
          </button>
          <button onClick={() => setMobileTab('cart')}
            className="flex-1 py-2.5 text-sm font-semibold flex items-center justify-center gap-2 transition-colors relative"
            style={mobileTab === 'cart' ? { background: '#800000', color: '#fff' } : { background: '#fff', color: '#4b5563' }}>
            <CartIcon /> Cart
            {items.length > 0 && (
              <span className="absolute top-1.5 right-6 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                style={{ background: mobileTab === 'cart' ? '#fff' : '#800000', color: mobileTab === 'cart' ? '#800000' : '#fff' }}>
                {getItemCount()}
              </span>
            )}
          </button>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-1">
          {mobileTab === 'menu' ? (
            <>
              {renderMenuGrid()}
              {/* Floating "Go to Cart" button when items exist */}
              {items.length > 0 && (
                <button onClick={() => setMobileTab('cart')}
                  className="fixed bottom-5 right-5 z-40 flex items-center gap-2 px-5 py-3 rounded-full font-bold text-white shadow-xl transition-all active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}>
                  <CartIcon />
                  {getItemCount()} item{getItemCount() !== 1 ? 's' : ''} · ₱{getTotal().toFixed(2)}
                </button>
              )}
            </>
          ) : (
            renderCartPanel()
          )}
        </div>
      </div>
    </>
  );
};

export default POSInterface;