import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  ArrowLeft,
  Shield,
  GraduationCap,
  UserCheck,
  Ban,
  CheckCircle,
  X,
  Briefcase,
  AlertTriangle,
  Eye,
  EyeOff,
} from 'lucide-react';
import api from '../../api/axios';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLES = ['student', 'staff', 'guard', 'admin'];

const getRoleIcon = (role) => {
  switch (role) {
    case 'admin':   return <Shield    className="w-4 h-4 text-red-600" />;
    case 'guard':   return <UserCheck className="w-4 h-4 text-blue-600" />;
    case 'student': return <GraduationCap className="w-4 h-4 text-green-600" />;
    case 'staff':   return <Briefcase className="w-4 h-4 text-purple-600" />;
    default:        return <Users className="w-4 h-4 text-gray-600" />;
  }
};

const getRoleBadgeColor = (role) => {
  switch (role) {
    case 'admin':   return 'bg-red-100 text-red-800';
    case 'guard':   return 'bg-blue-100 text-blue-800';
    case 'student': return 'bg-green-100 text-green-800';
    case 'staff':   return 'bg-purple-100 text-purple-800';
    default:        return 'bg-gray-100 text-gray-800';
  }
};

const EMPTY_FORM = {
  username: '', password: '', first_name: '', last_name: '',
  email: '', phone: '', role: 'student', student_id: '',
  is_day_scholar: false, is_banned: false, ban_reason: '',
};

// ─── User Form Modal ──────────────────────────────────────────────────────────

const UserFormModal = ({ open, onClose, onSaved, editUser }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = Boolean(editUser);

  useEffect(() => {
    if (open) {
      setError('');
      setShowPassword(false);
      setForm(editUser
        ? { ...EMPTY_FORM, ...editUser, password: '' }
        : EMPTY_FORM
      );
    }
  }, [open, editUser]);

  const handle = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Client-side validation
    if (form.username.trim().length < 3) {
      setError('Username must be at least 3 characters.');
      setSaving(false);
      return;
    }
    const usernameRegex = /^[a-zA-Z0-9@.+\-_]+$/;
    if (!usernameRegex.test(form.username)) {
      setError('Username may only contain letters, digits, and @/./+/-/_ characters.');
      setSaving(false);
      return;
    }
    if (form.role === 'student' && !form.student_id.trim()) {
      setError('Student ID is required for student accounts.');
      setSaving(false);
      return;
    }
    if (!isEditing && form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      setSaving(false);
      return;
    }

    try {
      const payload = { ...form };
      if (isEditing && !payload.password) delete payload.password;
      if (payload.role !== 'student') { payload.student_id = ''; payload.is_day_scholar = false; }

      if (isEditing) {
        await api.patch(`/api/users/${editUser.id}/`, payload);
      } else {
        await api.post('/api/users/', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === 'object') {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setError(msgs.join('\n'));
      } else {
        setError('Failed to save user. Please check the form.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit User' : 'Add New User'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm whitespace-pre-wrap">
              {error}
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input name="first_name" value={form.first_name} onChange={handle} required
                minLength={1} maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input name="last_name" value={form.last_name} onChange={handle} required
                minLength={1} maxLength={50}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input name="username" value={form.username} onChange={handle} required
              minLength={3} maxLength={150}
              pattern="^[a-zA-Z0-9@.+\-_]+$"
              title="Only letters, digits, and @/./+/-/_ characters"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handle}
                maxLength={254}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input name="phone" type="tel" value={form.phone} onChange={handle}
                pattern="(\+254|0)[17]\d{8}"
                title="Enter a valid Kenyan phone number (e.g. +254712345678)"
                maxLength={15}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
            </div>
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select name="role" value={form.role} onChange={handle} required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white capitalize">
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>

          {/* Student-only fields */}
          {form.role === 'student' && (
            <div className="space-y-3 border border-green-100 bg-green-50 rounded-lg p-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                <input name="student_id" value={form.student_id} onChange={handle}
                  required={form.role === 'student'}
                  minLength={form.role === 'student' ? 1 : 0}
                  maxLength={20}
                  placeholder={form.role === 'student' ? 'Required' : ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-700">
                <input type="checkbox" name="is_day_scholar" checked={form.is_day_scholar} onChange={handle}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                Day Scholar
              </label>
            </div>
          )}

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {isEditing && <span className="text-gray-400 font-normal">(leave blank to keep current)</span>}
            </label>
            <div className="relative">
              <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handle}
                required={!isEditing}
                minLength={!isEditing ? 6 : undefined}
                maxLength={128}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm" />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-60">
              {saving ? 'Saving…' : isEditing ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

const DeleteModal = ({ open, user, onClose, onDeleted }) => {
  const [deleting, setDeleting] = useState(false);

  const confirm = async () => {
    setDeleting(true);
    try {
      await api.delete(`/api/users/${user.id}/`);
      onDeleted();
      onClose();
    } catch {
      setDeleting(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete User</h3>
        <p className="text-sm text-gray-600 text-center mb-6">
          Are you sure you want to delete <span className="font-semibold">{user.first_name} {user.last_name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={confirm} disabled={deleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-60">
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Ban Modal ────────────────────────────────────────────────────────────────

const BanModal = ({ open, user, onClose, onUpdated }) => {
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (open) setReason(''); }, [open]);

  const confirm = async () => {
    setSaving(true);
    try {
      await api.post(`/api/users/${user.id}/ban/`, { ban_reason: reason });
      onUpdated();
      onClose();
    } catch {
      setSaving(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-4">
          <Ban className="w-6 h-6 text-orange-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Ban User</h3>
        <p className="text-sm text-gray-600 text-center mb-4">
          Banning <span className="font-semibold">{user.first_name} {user.last_name}</span> will block their campus access.
        </p>
        <textarea
          placeholder="Reason for ban (optional)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none mb-4"
        />
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={confirm} disabled={saving}
            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium disabled:opacity-60">
            {saving ? 'Banning…' : 'Ban User'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bannedFilter, setBannedFilter] = useState('all');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banTarget, setBanTarget] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    let filtered = users;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.username?.toLowerCase().includes(q) ||
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.student_id?.toLowerCase().includes(q)
      );
    }
    if (roleFilter !== 'all') filtered = filtered.filter(u => u.role === roleFilter);
    if (bannedFilter === 'banned') filtered = filtered.filter(u => u.is_banned);
    if (bannedFilter === 'active') filtered = filtered.filter(u => !u.is_banned);
    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, bannedFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/users/');
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => { setEditUser(null); setShowForm(true); };
  const openEdit   = (u) => { setEditUser(u);   setShowForm(true); };

  const unban = async (u) => {
    try {
      await api.post(`/api/users/${u.id}/unban/`);
      fetchUsers();
    } catch (err) {
      console.error('Unban failed:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto" />
        <p className="mt-4 text-gray-600">Loading users…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Modals */}
      <UserFormModal
        open={showForm}
        editUser={editUser}
        onClose={() => setShowForm(false)}
        onSaved={fetchUsers}
      />
      <DeleteModal
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={fetchUsers}
      />
      <BanModal
        open={Boolean(banTarget)}
        user={banTarget}
        onClose={() => setBanTarget(null)}
        onUpdated={fetchUsers}
      />

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
              <p className="text-sm text-gray-500">Create, edit, and manage system users</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <UserPlus className="w-4 h-4" />
            Add User
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, username, email, student ID…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
            {/* Role filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg appearance-none bg-white min-w-[130px] text-sm">
                <option value="all">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
            {/* Ban filter */}
            <div>
              <select value={bannedFilter} onChange={e => setBannedFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white min-w-[130px] text-sm">
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="banned">Banned Only</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-700">Showing {filteredUsers.length} of {users.length}</span>
            <span>Students: <b>{users.filter(u => u.role === 'student').length}</b></span>
            <span>Staff: <b>{users.filter(u => u.role === 'staff').length}</b></span>
            <span>Guards: <b>{users.filter(u => u.role === 'guard').length}</b></span>
            <span>Admins: <b>{users.filter(u => u.role === 'admin').length}</b></span>
            <span className="text-red-600">Banned: <b>{users.filter(u => u.is_banned).length}</b></span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['User', 'Role', 'Contact', 'Status', 'Actions'].map(col => (
                    <th key={col} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${user.is_banned ? 'bg-red-50' : ''}`}>
                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {user.photo
                            ? <img className="h-10 w-10 object-cover" src={user.photo} alt="" />
                            : <span className="text-sm font-semibold text-gray-600">
                                {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                              </span>
                          }
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            @{user.username}
                            {user.student_id && (
                              <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{user.student_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        {getRoleIcon(user.role)}
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>{user.email || <span className="text-gray-400">—</span>}</div>
                      {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        {user.is_banned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <Ban className="w-3 h-3" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                        {user.is_day_scholar && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Day Scholar · {user.day_scholar_status?.replace('_', ' ')}
                          </span>
                        )}
                        {user.must_change_password && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Needs PW Change
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit user"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Ban / Unban */}
                        {user.is_banned ? (
                          <button
                            onClick={() => unban(user)}
                            title="Unban user"
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setBanTarget(user)}
                            title="Ban user"
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Delete user"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <Users className="mx-auto h-12 w-12 text-gray-300" />
              <h3 className="mt-3 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filters.</p>
              <button onClick={openCreate}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                <UserPlus className="w-4 h-4" />
                Add the first user
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;