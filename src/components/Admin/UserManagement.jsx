import React, { useState, useEffect, useCallback } from 'react';
import api from '../../Services/api';
import { useAuth } from '../../Context/AuthContext';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UserCircleIcon,
  XMarkIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';

/* ── Role badge ── */
const RoleBadge = ({ role }) => {
  const cfg = {
    admin:    { bg: '#f3e8ff', color: '#7c3aed', label: 'Admin' },
    cashier:  { bg: '#dbeafe', color: '#1d4ed8', label: 'Cashier' },
    customer: { bg: '#dcfce7', color: '#15803d', label: 'Customer' },
  }[role] || { bg: '#f3f4f6', color: '#374151', label: role };
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ background: cfg.bg, color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

/* ── Modal wrapper ── */
const Modal = ({ title, onClose, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}>
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  </div>
);

/* ── Shared form field ── */
const Field = ({ label, children }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition-all";
const focusStyle = { '--tw-ring-color': '#800000' };

const EMPTY_FORM = { name: '', email: '', password: '', role: 'cashier' };

/* ═══════════════════════════════════════════════════════════ */
const UserManagement = () => {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(Array.isArray(res.data?.data) ? res.data.data : res.data || []);
    } catch {
      toast.error('Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const openCreate = () => { setForm(EMPTY_FORM); setModal('create'); };
  const openEdit   = (u) => { setSelected(u); setForm({ name: u.name, email: u.email, password: '', role: u.role }); setModal('edit'); };
  const openDelete = (u) => { setSelected(u); setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const set = (f) => (e) => setForm(prev => ({ ...prev, [f]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/users', form);
      toast.success('User created successfully!');
      fetchUsers();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Failed to create user.';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, role: form.role };
      if (form.password) payload.password = form.password;
      await api.put(`/admin/users/${selected.id}`, payload);
      toast.success('User updated!');
      fetchUsers();
      closeModal();
    } catch (err) {
      const msg = err.response?.data?.message
        || Object.values(err.response?.data?.errors || {})[0]?.[0]
        || 'Failed to update user.';
      toast.error(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/admin/users/${selected.id}`);
      toast.success('User deleted.');
      fetchUsers();
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    } finally { setSaving(false); }
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole   = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const counts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    cashier: users.filter(u => u.role === 'cashier').length,
    customer: users.filter(u => u.role === 'customer').length,
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{users.length} total users</p>
        </div>
        <button onClick={openCreate}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
          style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}>
          <PlusIcon className="h-4 w-4" />
          Create Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search by name or email…"
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2"
              style={{ '--tw-ring-color': '#800000' }} />
          </div>
          {/* Role filter chips */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'admin', 'cashier', 'customer'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                  roleFilter === r
                    ? 'text-white shadow'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                style={roleFilter === r ? { background: '#800000' } : {}}>
                {r === 'all' ? `All (${counts.all})` : `${r.charAt(0).toUpperCase() + r.slice(1)} (${counts[r]})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-gray-200 border-t-[#800000] rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-500">Loading users…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <UserCircleIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500">No users found</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: '#f9fafb' }}>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">User</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Role</th>
                    <th className="text-left px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Joined</th>
                    <th className="text-right px-5 py-3.5 text-xs font-bold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                            style={{ background: u.id === me?.id ? '#800000' : '#6b7280' }}>
                            {u.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900">{u.name}
                            {u.id === me?.id && <span className="ml-1.5 text-xs text-gray-400">(you)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-gray-600">{u.email}</td>
                      <td className="px-5 py-3.5"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-3.5 text-sm text-gray-400">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => openEdit(u)}
                            className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors" title="Edit">
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button onClick={() => openDelete(u)} disabled={u.id === me?.id}
                            className={`p-1.5 rounded-lg transition-colors ${u.id === me?.id ? 'text-gray-300 cursor-not-allowed' : 'text-red-400 hover:bg-red-50'}`}
                            title={u.id === me?.id ? "Can't delete yourself" : 'Delete'}>
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filtered.map(u => (
                <div key={u.id} className="px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                        style={{ background: u.id === me?.id ? '#800000' : '#6b7280' }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">
                          {u.name}{u.id === me?.id && <span className="ml-1 text-xs text-gray-400">(you)</span>}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <RoleBadge role={u.role} />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3 justify-end">
                    <button onClick={() => openEdit(u)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                      <PencilSquareIcon className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button onClick={() => openDelete(u)} disabled={u.id === me?.id}
                      className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${u.id === me?.id ? 'text-gray-300 bg-gray-50 cursor-not-allowed' : 'text-red-600 bg-red-50 hover:bg-red-100'}`}>
                      <TrashIcon className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Create Modal ── */}
      {modal === 'create' && (
        <Modal title="Create Employee Account" onClose={closeModal}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Full Name">
              <input type="text" required placeholder="Juan Dela Cruz" value={form.name} onChange={set('name')}
                className={inputCls} style={focusStyle} />
            </Field>
            <Field label="Email Address">
              <input type="email" required placeholder="juan@canteen.com" value={form.email} onChange={set('email')}
                className={inputCls} style={focusStyle} />
            </Field>
            <Field label="Password">
              <input type="password" required placeholder="Min. 8 characters" value={form.password} onChange={set('password')}
                className={inputCls} style={focusStyle} />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={set('role')} className={inputCls} style={focusStyle}>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </Field>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}>
                {saving ? 'Creating…' : 'Create Account'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Edit Modal ── */}
      {modal === 'edit' && selected && (
        <Modal title="Edit User" onClose={closeModal}>
          <form onSubmit={handleEdit} className="space-y-4">
            <Field label="Full Name">
              <input type="text" required value={form.name} onChange={set('name')}
                className={inputCls} style={focusStyle} />
            </Field>
            <Field label="Email Address">
              <input type="email" required value={form.email} onChange={set('email')}
                className={inputCls} style={focusStyle} />
            </Field>
            <Field label="New Password (leave blank to keep current)">
              <input type="password" placeholder="••••••••" value={form.password} onChange={set('password')}
                className={inputCls} style={focusStyle} />
            </Field>
            <Field label="Role">
              <select value={form.role} onChange={set('role')} className={inputCls} style={focusStyle}>
                <option value="cashier">Cashier</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </Field>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #800000, #9B1C1C)' }}>
                {saving ? 'Saving…' : <><CheckIcon className="h-4 w-4" />Save Changes</>}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── Delete Modal ── */}
      {modal === 'delete' && selected && (
        <Modal title="Delete User" onClose={closeModal}>
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-3">
              <TrashIcon className="h-7 w-7 text-red-500" />
            </div>
            <p className="text-gray-700 text-sm">
              Are you sure you want to delete <span className="font-bold text-gray-900">{selected.name}</span>?
              <br /><span className="text-gray-400 text-xs">This action cannot be undone.</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={closeModal}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-60">
              {saving ? 'Deleting…' : 'Yes, Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default UserManagement;
