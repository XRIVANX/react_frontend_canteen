import React, { useState, useEffect } from 'react';
import { useCart } from '../../Context/CartContext';
import { orderService } from '../../Services/orderService';
import api from '../../Services/api';
import toast from 'react-hot-toast';
import { MagnifyingGlassIcon, UserIcon, XMarkIcon } from '@heroicons/react/24/outline';

const POSInterface = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  const { items, addToCart, removeFromCart, updateQuantity, clearCart, getTotal, getItemCount } = useCart();

  useEffect(() => {
    fetchData();
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customerSearchTerm.trim() === '') {
      setFilteredCustomers(customers.slice(0, 5));
    } else {
      const filtered = customers.filter(customer => {
        const searchLower = customerSearchTerm.toLowerCase();
        return (
          customer.name?.toLowerCase().includes(searchLower) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.id?.toString().includes(searchLower)
        );
      });
      setFilteredCustomers(filtered.slice(0, 5));
    }
  }, [customerSearchTerm, customers]);

  const fetchData = async () => {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories'),
      ]);
      
      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : []);
      
      let categoriesArray = [];
      if (Array.isArray(categoriesRes.data)) {
        categoriesArray = categoriesRes.data;
      } else if (categoriesRes.data && typeof categoriesRes.data === 'object') {
        if (categoriesRes.data.data && Array.isArray(categoriesRes.data.data)) {
          categoriesArray = categoriesRes.data.data;
        } else {
          categoriesArray = Object.values(categoriesRes.data);
        }
      }
      
      setCategories(categoriesArray);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load menu');
      setMenuItems([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    setCustomersLoading(true);
    try {
      console.log('Fetching customers from /api/customers...');
      
      const response = await api.get('/customers');
      console.log('Customers response:', response.data);
      
      let customersData = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        customersData = response.data;
      }
      
      console.log('Processed customers:', customersData);
      setCustomers(customersData);
      setFilteredCustomers(customersData.slice(0, 5));
      
      if (customersData.length === 0) {
        toast.success('No customers found. Add customers first.');
      } else {
        toast.success(`Loaded ${customersData.length} customers`);
      }
      
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
      } else if (error.response?.status === 403) {
        toast.error('You do not have permission to view customers.');
      } else if (error.response?.status === 404) {
        toast.error('Customer endpoint not found. Please check backend routes.');
      } else {
        toast.error('Could not load customer list. Using demo data.');
        setDemoCustomers();
      }
    } finally {
      setCustomersLoading(false);
    }
  };

  const setDemoCustomers = () => {
    const demoCustomers = [
      { id: 4, name: 'Customer 1', email: 'customer1@canteen.com' },
      { id: 5, name: 'Customer 2', email: 'customer2@canteen.com' },
      { id: 6, name: 'Customer 3', email: 'customer3@canteen.com' },
      { id: 7, name: 'Customer 4', email: 'customer4@canteen.com' },
      { id: 8, name: 'Customer 5', email: 'customer5@canteen.com' },
    ];
    setCustomers(demoCustomers);
    setFilteredCustomers(demoCustomers);
    toast.success('Using demo customer data for testing');
  };

  const formatPrice = (price) => {
    if (typeof price === 'number') return price.toFixed(2);
    if (typeof price === 'string') {
      const parsed = parseFloat(price);
      return isNaN(parsed) ? '0.00' : parsed.toFixed(2);
    }
    return '0.00';
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === parseInt(selectedCategory);
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available;
  });

  const handleSelectCustomer = (customer) => {
    console.log('Selected customer:', customer); // Debug log
    setSelectedCustomer(customer);
    setShowCustomerDropdown(false);
    setCustomerSearchTerm('');
    toast.success(`Selected customer: ${customer.name} (ID: ${customer.id})`);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
  };

  const handleSubmitOrder = async () => {
    if (items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    if (!selectedCustomer) {
      toast.error('Please select a customer');
      return;
    }

    console.log('🚀 Submitting order with customer:', selectedCustomer);
    console.log('Customer ID being used:', selectedCustomer.id);

    setProcessing(true);
    try {
      const orderData = {
        user_id: selectedCustomer.id, // This should be the customer's ID
        items: items.map(({ menu_item_id, quantity }) => ({
          menu_item_id,
          quantity,
        })),
        payment_method: paymentMethod,
        notes: notes,
      };

      console.log('📦 Order data being sent:', JSON.stringify(orderData, null, 2));

      const response = await orderService.createOrder(orderData);
      console.log('✅ Order response:', response);
      
      toast.success(`Order created for ${selectedCustomer.name}!`);
      clearCart();
      setNotes('');
      setSelectedCustomer(null);
    } catch (error) {
      console.error('❌ Order error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create order');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Menu Items Section */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Point of Sale</h1>
        </div>

        {/* Customer Selection */}
        <div className="mb-6 bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Customer <span className="text-red-500">*</span>
            </label>
            {customersLoading && (
              <span className="text-xs text-gray-500">Loading customers...</span>
            )}
          </div>
          
          {!selectedCustomer ? (
            <div className="relative">
              <div className="flex items-center">
                <UserIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customer by name, email, or ID..."
                  value={customerSearchTerm}
                  onChange={(e) => {
                    setCustomerSearchTerm(e.target.value);
                    setShowCustomerDropdown(true);
                  }}
                  onFocus={() => setShowCustomerDropdown(true)}
                  className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              
              {/* Debug info - remove after fixing */}
              {customers.length > 0 && (
                <div className="text-xs text-green-600 mt-1">
                  {customers.length} customers loaded
                </div>
              )}
              
              {showCustomerDropdown && (
                <>
                  {/* Backdrop to close dropdown when clicking outside */}
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setShowCustomerDropdown(false)}
                  ></div>
                  
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg rounded-md max-h-60 overflow-y-auto border border-gray-200">
                    {filteredCustomers.length > 0 ? (
                      filteredCustomers.map(customer => (
                        <div
                          key={customer.id}
                          onClick={() => handleSelectCustomer(customer)}
                          className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                          <p className="text-xs text-gray-400">ID: {customer.id}</p>
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        {customerSearchTerm ? 'No customers found' : 'Type to search customers'}
                      </div>
                    )}
                    
                    {customers.length === 0 && !customersLoading && (
                      <div className="px-4 py-3 text-gray-500 text-center">
                        No customers in system
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between bg-blue-50 p-3 rounded-md border border-blue-200">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-sm text-gray-600">{selectedCustomer.email}</p>
                  <p className="text-xs text-blue-500">ID: {selectedCustomer.id}</p>
                </div>
              </div>
              <button
                onClick={handleClearCustomer}
                className="text-sm text-red-600 hover:text-red-800 flex items-center"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Change
              </button>
            </div>
          )}
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition"
                onClick={() => addToCart(item)}
              >
                <div className="aspect-w-1 aspect-h-1 mb-4 bg-gray-200 rounded-lg flex items-center justify-center h-32">
                  {!imageErrors[item.id] ? (
                    <img
                      src={item.image || `https://via.placeholder.com/150/4A90E2/FFFFFF?text=${item.name.charAt(0)}`}
                      alt={item.name}
                      className="object-cover rounded-lg w-full h-32"
                      onError={() => handleImageError(item.id)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-32 flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600 rounded-lg">
                      <span className="text-4xl font-bold text-white">
                        {item.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-500 truncate">{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-blue-600">
                    ${formatPrice(item.price)}
                  </span>
                  {item.stock_quantity <= item.low_stock_threshold && (
                    <span className="text-xs text-red-600">Low Stock</span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500">No menu items available</p>
            </div>
          )}
        </div>
      </div>

      {/* Cart Section */}
      <div className="w-96 bg-white shadow-lg flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Current Order</h2>
          <p className="text-sm text-gray-500">{getItemCount()} items</p>
          {selectedCustomer && (
            <div className="mt-2 text-xs bg-blue-50 p-2 rounded">
              <span className="font-medium text-blue-700">Customer:</span>
              <p className="text-blue-600">{selectedCustomer.name}</p>
              <p className="text-blue-400 text-xs">ID: {selectedCustomer.id}</p>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length > 0 ? (
            items.map((item) => (
              <div key={item.menu_item_id} className="mb-4 p-2 border rounded">
                <div className="flex justify-between">
                  <span className="font-medium">{item.name}</span>
                  <button
                    onClick={() => removeFromCart(item.menu_item_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ×
                  </button>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600">
                    ${formatPrice(item.price)} each
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                      className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="text-right mt-1 font-medium">
                  ${(parseFloat(formatPrice(item.price)) * item.quantity).toFixed(2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              No items in cart
            </div>
          )}
        </div>

        <div className="p-4 border-t">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Special instructions..."
            />
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span>${getTotal().toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmitOrder}
            disabled={processing || items.length === 0 || !selectedCustomer}
            className={`w-full py-3 rounded-lg font-semibold ${
              processing || items.length === 0 || !selectedCustomer
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {processing ? 'Processing...' : 'Complete Order'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default POSInterface;