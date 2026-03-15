import React, { useState, useEffect, useCallback } from 'react';
import api from '../../Services/api';
import {
  ArrowPathIcon,
  MagnifyingGlassIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

/* ── Skeleton ── */
const LogsSkeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100">
        <div className="skeleton h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-40 rounded" />
          <div className="skeleton h-3 w-56 rounded" />
        </div>
        <div className="skeleton h-3 w-20 rounded" />
        <div className="skeleton h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

const reasonConfig = {
  sale:        { label: 'Sale',        bg: '#DBEAFE', color: '#1E40AF' },
  restock:     { label: 'Restock',     bg: '#D1FAE5', color: '#065F46' },
  adjustment:  { label: 'Adjustment',  bg: '#FEF3C7', color: '#92400E' },
  bulk:        { label: 'Bulk Restock',bg: '#EDE9FE', color: '#4C1D95' },
  waste:       { label: 'Waste',       bg: '#FEE2E2', color: '#991B1B' },
};

const InventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterReason, setFilterReason] = useState('all');
  const [bulkItems, setBulkItems] = useState([{ menu_item_id: '', quantity: '' }]);
  const [menuItems, setMenuItems] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkForm, setShowBulkForm] = useState(false);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterReason !== 'all') params.reason = filterReason;
      const res = await api.get('/inventory/logs', { params });
      setLogs(res.data?.data || []);
    } catch {
      toast.error('Failed to load inventory logs');
    } finally {
      setLoading(false);
    }
  }, [filterReason]);

  useEffect(() => {
    fetchLogs();
    api.get('/menu').then(r => setMenuItems(r.data || []));
  }, [fetchLogs]);

  const handleBulkRestock = async (e) => {
    e.preventDefault();
    const validItems = bulkItems.filter(i => i.menu_item_id && i.quantity > 0);
    if (validItems.length === 0) { toast.error('Add at least one item'); return; }
    setBulkLoading(true);
    try {
      await api.post('/inventory/bulk-restock', { items: validItems.map(i => ({ menu_item_id: Number(i.menu_item_id), quantity: Number(i.quantity) })) });
      toast.success('Bulk restock completed!');
      setBulkItems([{ menu_item_id: '', quantity: '' }]);
      setShowBulkForm(false);
      fetchLogs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk restock failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const addBulkRow = () => setBulkItems(prev => [...prev, { menu_item_id: '', quantity: '' }]);
  const removeBulkRow = (idx) => setBulkItems(prev => prev.filter((_, i) => i !== idx));
  const updateBulkRow = (idx, field, val) => setBulkItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));

  const filteredLogs = logs.filter(log => {
    const name = log.menu_item?.name?.toLowerCase() || '';
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 fade-in-up">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#800000' }}>Inventory Logs</h1>
          <p className="text-gray-500 text-sm mt-0.5">Track all stock changes with timestamps and reasons</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBulkForm(v => !v)}
            className="btn-primary text-sm flex items-center gap-1.5"
          >
            <CubeIcon className="h-4 w-4" />
            {showBulkForm ? 'Cancel' : 'Bulk Restock'}
          </button>
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white hover:bg-gray-50 transition-all shadow-sm"
            style={{ color: '#800000' }}
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Bulk Restock Panel */}
      {showBulkForm && (
        <div className="mb-6 rounded-2xl p-6 border fade-in-up" style={{ background: '#fff', borderColor: '#e5e7eb', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
            <CubeIcon className="h-5 w-5" style={{ color: '#800000' }} />
            Bulk Restock Items
          </h2>
          <form onSubmit={handleBulkRestock} className="space-y-3">
            {bulkItems.map((row, idx) => (
              <div key={idx} className="flex gap-3 items-center">
                <select
                  value={row.menu_item_id}
                  onChange={e => updateBulkRow(idx, 'menu_item_id', e.target.value)}
                  className="input-primary flex-1"
                  required
                >
                  <option value="">Select item…</option>
                  {menuItems.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Stock: {m.stock_quantity})</option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  max="9999"
                  placeholder="Qty"
                  value={row.quantity}
                  onChange={e => updateBulkRow(idx, 'quantity', e.target.value)}
                  className="input-primary w-24"
                  required
                />
                {bulkItems.length > 1 && (
                  <button type="button" onClick={() => removeBulkRow(idx)} className="text-red-400 hover:text-red-600 text-lg font-bold px-1">×</button>
                )}
              </div>
            ))}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={addBulkRow} className="text-sm font-medium" style={{ color: '#800000' }}>
                + Add row
              </button>
              <button type="submit" disabled={bulkLoading} className="btn-primary text-sm ml-auto">
                {bulkLoading ? 'Restocking…' : 'Submit Restock'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by item name…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-primary pl-9"
          />
        </div>
        <select
          value={filterReason}
          onChange={e => setFilterReason(e.target.value)}
          className="input-primary w-44"
        >
          <option value="all">All Reasons</option>
          <option value="sale">Sale</option>
          <option value="restock">Restock</option>
          <option value="adjustment">Adjustment</option>
          <option value="bulk">Bulk Restock</option>
          <option value="waste">Waste</option>
        </select>
      </div>

      {/* Desktop Logs Table */}
      <div className="hidden md:block card overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide border-b border-gray-100">
          <div className="col-span-3">Item</div>
          <div className="col-span-2">Change</div>
          <div className="col-span-2">Reason</div>
          <div className="col-span-2">By</div>
          <div className="col-span-3">Timestamp</div>
        </div>

        <div className="divide-y divide-gray-50">
          {loading ? (
            <div className="p-4"><LogsSkeleton /></div>
          ) : filteredLogs.length === 0 ? (
            <div className="py-16 text-center">
              <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
              <p className="text-gray-400 text-sm">No logs found</p>
            </div>
          ) : filteredLogs.map(log => {
            const reason = reasonConfig[log.reason] || { label: log.reason, bg: '#F3F4F6', color: '#374151' };
            const isNegative = (log.quantity_change || 0) < 0;
            return (
              <div key={log.id} className="grid grid-cols-12 gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors items-center text-sm">
                <div className="col-span-3">
                  <p className="font-semibold text-gray-900">{log.menu_item?.name || `Item #${log.menu_item_id}`}</p>
                  <p className="text-xs text-gray-400">{log.notes || '—'}</p>
                </div>
                <div className="col-span-2">
                  <span className={`font-bold text-base ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                    {isNegative ? '' : '+'}{log.quantity_change}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">→ {log.new_quantity ?? '—'}</span>
                </div>
                <div className="col-span-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold"
                    style={{ background: reason.bg, color: reason.color }}>
                    {reason.label}
                  </span>
                </div>
                <div className="col-span-2 text-gray-500 text-xs">
                  {log.creator?.name || 'System'}
                </div>
                <div className="col-span-3 text-gray-400 text-xs">
                  {log.created_at ? format(new Date(log.created_at), 'MMM dd, yyyy • hh:mm a') : '—'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Logs Cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="p-1"><LogsSkeleton /></div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center card bg-white">
            <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-gray-200 mb-2" />
            <p className="text-gray-400 text-sm">No logs found</p>
          </div>
        ) : filteredLogs.map(log => {
          const reason = reasonConfig[log.reason] || { label: log.reason, bg: '#F3F4F6', color: '#374151' };
          const isNegative = (log.quantity_change || 0) < 0;
          return (
            <div key={log.id} className="card p-4 space-y-3 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-900">{log.menu_item?.name || `Item #${log.menu_item_id}`}</p>
                  <p className="text-xs text-gray-400">{log.notes || '—'}</p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-base ${isNegative ? 'text-red-600' : 'text-green-600'}`}>
                      {isNegative ? '' : '+'}{log.quantity_change}
                    </span>
                    <span className="text-xs text-gray-400">→ {log.new_quantity ?? '—'}</span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Reason</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold w-fit"
                    style={{ background: reason.bg, color: reason.color }}>
                    {reason.label}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">By & Time</span>
                  <div className="text-xs text-gray-700">
                    {log.creator?.name || 'System'}
                    <br/>
                    <span className="text-[10px] text-gray-400">{log.created_at ? format(new Date(log.created_at), 'MMM dd • hh:mm a') : '—'}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 mt-3 text-right">
        Showing {filteredLogs.length} of {logs.length} log entries
      </p>
    </div>
  );
};

export default InventoryLogs;
