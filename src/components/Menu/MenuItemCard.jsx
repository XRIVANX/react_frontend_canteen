import React from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';

const MenuItemCard = ({ item, onEdit, onDelete, onToggleAvailability }) => {
  const isLowStock = Number(item.stock_quantity || 0) <= Number(item.low_stock_threshold || 0);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="aspect-w-16 aspect-h-9">
        <img
          src={item.image || 'https://via.placeholder.com/400x225'}
          alt={item.name}
          className="w-full h-48 object-cover"
        />
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.category?.name}</p>
          </div>
          <span className="text-lg font-bold text-blue-600">
            ${Number(item.price || 0).toFixed(2)}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {item.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Stock:</span>
            <span className={`font-medium ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
              {Number(item.stock_quantity || 0)} units
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Status:</span>
            {item.is_available ? (
              <span className="badge-success">Available</span>
            ) : (
              <span className="badge-danger">Unavailable</span>
            )}
          </div>
          {isLowStock && item.is_available && (
            <div className="badge-warning">Low Stock Alert</div>
          )}
        </div>

        <div className="flex justify-between pt-3 border-t">
          <button
            onClick={onToggleAvailability}
            className={`flex items-center text-sm ${
              item.is_available ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'
            }`}
          >
            {item.is_available ? (
              <>
                <XCircleIcon className="h-4 w-4 mr-1" />
                Mark Unavailable
              </>
            ) : (
              <>
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Mark Available
              </>
            )}
          </button>
          <div className="flex space-x-3">
            <button
              onClick={onEdit}
              className="text-blue-600 hover:text-blue-800"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-600 hover:text-red-800"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;