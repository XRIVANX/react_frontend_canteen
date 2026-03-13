import React, { useState, useEffect } from 'react';
import api from '../../Services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const CustomerMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [error, setError] = useState(null);

  // Helper function to safely format price
  const formatPrice = (price) => {
    const num = parseFloat(price) || 0;
    return num.toFixed(2);
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  useEffect(() => {
    fetchMenu();
    fetchCategories();
  }, []);

  const fetchMenu = async () => {
    try {
      const response = await api.get('/menu');
      const menuData = response.data?.data || response.data || [];
      setMenuItems(Array.isArray(menuData) ? menuData : []);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setError('Failed to load menu');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      
      // Handle different response formats
      let categoriesData = [];
      if (Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // If it's an object with numeric keys
        categoriesData = Object.values(response.data);
      }
      
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    if (!item) return false;
    const matchesCategory = selectedCategory === 'all' || item.category_id === parseInt(selectedCategory);
    const matchesSearch = item.name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && item.is_available;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error Loading Menu</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Our Menu</h1>
        <p className="text-gray-600 mb-6">Browse our delicious food and beverages</p>
        
        {/* Search and Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full md:w-64 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <MenuItemCard 
              key={item.id} 
              item={item} 
              imageError={imageErrors[item.id]}
              onImageError={handleImageError}
              formatPrice={formatPrice}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No menu items found</p>
            <p className="text-gray-400">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Menu Item Card Component
const MenuItemCard = ({ item, imageError, onImageError, formatPrice }) => {
  const getCategoryColor = (categoryId) => {
    const colors = {
      1: 'bg-red-100 text-red-800',
      2: 'bg-green-100 text-green-800',
      3: 'bg-blue-100 text-blue-800',
      4: 'bg-purple-100 text-purple-800',
      5: 'bg-yellow-100 text-yellow-800',
    };
    return colors[categoryId] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="relative h-48 overflow-hidden bg-gray-100">
        {!imageError ? (
          <img
            src={item.image || `https://placehold.co/300x200/4A90E2/FFFFFF?text=${item.name?.charAt(0) || '?'}`}
            alt={item.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={() => onImageError(item.id)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-blue-500 to-blue-600">
            <span className="text-4xl font-bold text-white">
              {item.name?.charAt(0) || '?'}
            </span>
          </div>
        )}
        {!item.is_available && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
            Out of Stock
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category_id)}`}>
            {item.category?.name || 'Food'}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold text-blue-600">
            ${formatPrice(item.price)}
          </span>
          {item.stock_quantity <= item.low_stock_threshold && item.stock_quantity > 0 && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
              Only {item.stock_quantity} left!
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerMenu;