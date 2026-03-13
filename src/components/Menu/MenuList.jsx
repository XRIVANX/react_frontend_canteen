import React, { useState, useEffect } from 'react';
import api from '../../Services/api';
import MenuItemCard from './MenuItemCard';
import MenuForm from './MenuForm';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

const MenuList = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filter, setFilter] = useState({
    category: 'all',
    search: '',
    availability: 'all',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menuRes, categoriesRes] = await Promise.all([
        api.get('/menu'),
        api.get('/categories'),
      ]);
      setMenuItems(Array.isArray(menuRes.data) ? menuRes.data : menuRes.data.data || []);
      setCategories(Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await api.delete(`/menu/${id}`);
      toast.success('Menu item deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete menu item');
    }
  };

  const handleToggleAvailability = async (id) => {
    try {
      await api.patch(`/menu/${id}/toggle`);
      toast.success('Availability updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = filter.category === 'all' || item.category_id === parseInt(filter.category);
    const matchesSearch = (item.name || '').toLowerCase().includes((filter.search || '').toLowerCase());
    const matchesAvailability = 
      filter.availability === 'all' ||
      (filter.availability === 'available' && item.is_available) ||
      (filter.availability === 'unavailable' && !item.is_available);
    
    return matchesCategory && matchesSearch && matchesAvailability;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage your canteen's menu items</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={filter.search}
            onChange={(e) => setFilter({ ...filter, search: e.target.value })}
            className="input-primary"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
            className="input-primary"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability
          </label>
          <select
            value={filter.availability}
            onChange={(e) => setFilter({ ...filter, availability: e.target.value })}
            className="input-primary"
          >
            <option value="all">All Items</option>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Menu Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onEdit={() => {
              setEditingItem(item);
              setShowForm(true);
            }}
            onDelete={() => handleDelete(item.id)}
            onToggleAvailability={() => handleToggleAvailability(item.id)}
          />
        ))}
      </div>

      {/* Menu Form Modal */}
      {showForm && (
        <MenuForm
          item={editingItem}
          categories={categories}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSuccess={() => {
            setShowForm(false);
            setEditingItem(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default MenuList;