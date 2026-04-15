import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AdminUserFormSchema } from '../../utils/schemas';
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
  AlertCircle
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
    case 'admin':   return 'bg-red-100 text-red-800 border-red-800';
    case 'guard':   return 'bg-blue-100 text-blue-800 border-blue-800';
    case 'student': return 'bg-green-100 text-green-800 border-green-800';
    case 'staff':   return 'bg-purple-100 text-purple-800 border-purple-800';
    default:        return 'bg-gray-100 text-gray-800 border-gray-800';
  }
};

// ─── User Form Modal ──────────────────────────────────────────────────────────

const UserFormModal = ({ open, onClose, onSaved, editUser }) => {
  const [saved, setSaved] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const isEditing = Boolean(editUser);

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(AdminUserFormSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      username: '',
      email: '',
      phone: '',
      role: 'student',
      student_id: '',
      is_day_scholar: false,
      password: ''
    }
  });

  const selectedRole = watch('role');

  useEffect(() => {
    if (open) {
      setGlobalError('');
      setSaved(false);
      setShowPassword(false);
      
      if (editUser) {
        reset({
          first_name: editUser.first_name || '',
          last_name: editUser.last_name || '',
          username: editUser.username || '',
          email: editUser.email || '',
          phone: editUser.phone || '',
          role: editUser.role || 'student',
          student_id: editUser.student_id || '',
          is_day_scholar: editUser.is_day_scholar || false,
          password: ''
        });
      } else {
        reset({
          first_name: '',
          last_name: '',
          username: '',
          email: '',
          phone: '',
          role: 'student',
          student_id: '',
          is_day_scholar: false,
          password: ''
        });
      }
    }
  }, [open, editUser, reset]);

  const onSubmit = async (data) => {
    setGlobalError('');

    if (!isEditing && (!data.password || data.password.length < 6)) {
      setGlobalError('Password must be at least 6 characters for new users.');
      return;
    }

    try {
      const payload = { ...data };
      if (isEditing && !payload.password) {
        delete payload.password;
      }
      if (payload.role !== 'student') { 
        payload.student_id = ''; 
        payload.is_day_scholar = false; 
      }

      if (isEditing) {
        await api.patch(`/api/users/${editUser.id}/`, payload);
      } else {
        await api.post('/api/users/', payload);
      }
      onSaved();
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 1200);
    } catch (err) {
      const respData = err.response?.data;
      if (respData && typeof respData === 'object') {
        const msgs = Object.entries(respData).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`);
        setGlobalError(msgs.join('\n'));
      } else {
        setGlobalError('Failed to save user. Please check the form.');
      }
    }
  };

  if (!open) return null;

  if (saved) return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 font-sans backdrop-blur-sm">
      <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm p-8 flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-brand-primary border-2 border-gray-900 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <CheckCircle className="w-8 h-8 text-white" />
        </div>
        <p className="text-xl font-display font-black text-gray-900 uppercase">
          {isEditing ? 'Changes Saved!' : 'User Created!'}
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 font-sans backdrop-blur-sm">
      <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-gray-900 bg-gray-50">
          <h2 className="text-2xl font-display font-black text-gray-900 uppercase tracking-tight">
            {isEditing ? 'Edit User' : 'New User'}
          </h2>
          <button onClick={onClose} className="p-2 border-2 border-transparent hover:border-gray-900 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white transition-all">
            <X className="w-5 h-5 text-gray-900" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {globalError && (
            <div className="bg-red-50 border-2 border-red-600 text-red-800 p-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 shrink-0" />
              <span className="whitespace-pre-wrap uppercase tracking-wide text-xs">{globalError}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">First Name</label>
              <input 
                {...register('first_name')} 
                className="gate-input" 
              />
              {errors.first_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Last Name</label>
              <input 
                {...register('last_name')} 
                className="gate-input" 
              />
              {errors.last_name && <p className="mt-1 text-xs font-bold text-red-600">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Username</label>
            <input 
              {...register('username')} 
              className="gate-input" 
            />
            {errors.username && <p className="mt-1 text-xs font-bold text-red-600">{errors.username.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Email (Opt)</label>
              <input 
                type="email" 
                {...register('email')} 
                className="gate-input" 
              />
              {errors.email && <p className="mt-1 text-xs font-bold text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Phone (Opt)</label>
              <input 
                type="tel" 
                {...register('phone')} 
                className="gate-input" 
              />
              {errors.phone && <p className="mt-1 text-xs font-bold text-red-600">{errors.phone.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Role</label>
            <select 
              {...register('role')} 
              className="gate-input uppercase tracking-wider font-bold text-sm"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {errors.role && <p className="mt-1 text-xs font-bold text-red-600">{errors.role.message}</p>}
          </div>

          {selectedRole === 'student' && (
            <div className="space-y-4 border-2 border-gray-900 bg-gray-50 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div>
                <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">Student ID *</label>
                <input 
                  {...register('student_id')} 
                  className="gate-input" 
                />
                {errors.student_id && <p className="mt-1 text-xs font-bold text-red-600">{errors.student_id.message}</p>}
              </div>
              <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-gray-900 uppercase tracking-wider">
                <input 
                  type="checkbox" 
                  {...register('is_day_scholar')} 
                  className="w-5 h-5 border-2 border-gray-900 text-brand-primary focus:ring-0 rounded-none bg-white checked:bg-brand-primary" 
                />
                Day Scholar
              </label>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2 uppercase tracking-wider">
              Password {isEditing && <span className="text-gray-500 font-normal ml-1">(Leave blank to keep)</span>}
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                {...register('password')} 
                className="gate-input pr-10" 
              />
              <button type="button" onClick={() => setShowPassword(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs font-bold text-red-600">{errors.password.message}</p>}
          </div>

          <div className="flex gap-4 pt-4 mt-8 border-t-4 border-gray-900">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-900 text-gray-900 bg-white font-bold uppercase tracking-wider hover:bg-gray-50 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting}
              className="gate-btn flex-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">
              {isSubmitting ? 'SAVING...' : isEditing ? 'SAVE CHANGES' : 'CREATE USER'}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 font-sans backdrop-blur-sm">
      <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-red-100 border-2 border-red-600 shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-display font-black text-gray-900 text-center mb-2 uppercase tracking-wide">Delete User</h3>
        <p className="text-sm text-gray-700 font-medium text-center mb-6 px-2">
          Are you sure you want to delete <span className="font-black bg-yellow-200 px-1">{user.first_name} {user.last_name}</span>?<br/>
          This action is permanent.
        </p>
        <div className="flex gap-4 mt-6">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-900 font-bold uppercase tracking-wider text-gray-900 bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Cancel
          </button>
          <button onClick={confirm} disabled={deleting}
            className="flex-1 px-4 py-3 border-2 border-red-600 font-bold uppercase tracking-wider text-white bg-red-600 shadow-[4px_4px_0px_0px_rgba(153,27,27,1)] hover:bg-red-700 transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(153,27,27,1)]">
            {deleting ? 'DELETING...' : 'DELETE'}
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

  useEffect(() => {
    let t;
    if (open) t = setTimeout(() => setReason(''), 0);
    return () => clearTimeout(t);
  }, [open]);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 p-4 font-sans backdrop-blur-sm">
      <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-sm p-6">
        <div className="flex items-center justify-center w-16 h-16 bg-amber-100 border-2 border-amber-600 shadow-[4px_4px_0px_0px_rgba(217,119,6,1)] mx-auto mb-6">
          <Ban className="w-8 h-8 text-amber-600" />
        </div>
        <h3 className="text-xl font-display font-black text-gray-900 text-center mb-2 uppercase tracking-wide">Ban User</h3>
        <p className="text-sm font-medium text-gray-700 text-center mb-4 px-2">
          Banning <span className="font-black bg-yellow-200 px-1">{user.first_name} {user.last_name}</span> will block their access.
        </p>
        <textarea
          placeholder="REASON FOR BAN (OPTIONAL)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          rows={3}
          className="gate-input resize-none mb-6 uppercase text-sm tracking-wider"
        />
        <div className="flex gap-4 mt-2">
          <button onClick={onClose}
            className="flex-1 px-4 py-3 border-2 border-gray-900 font-bold uppercase tracking-wider text-gray-900 bg-white hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            Cancel
          </button>
          <button onClick={confirm} disabled={saving}
            className="flex-1 px-4 py-3 border-2 border-amber-600 font-bold uppercase tracking-wider text-white bg-amber-600 shadow-[4px_4px_0px_0px_rgba(180,83,9,1)] hover:bg-amber-700 transition-all active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(180,83,9,1)]">
            {saving ? 'BANNING...' : 'BAN USER'}
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
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [bannedFilter, setBannedFilter] = useState('all');

  // Modal state
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [banTarget, setBanTarget] = useState(null);

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    let filtered = users;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
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
  }, [users, debouncedSearch, roleFilter, bannedFilter]);

  const fetchUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const res = await api.get('/api/users/');
      setUsers(res.data.results || res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const openCreate = () => { setEditUser(null); setShowForm(true); };
  const openEdit   = (u) => { setEditUser(u);   setShowForm(true); };

  const unban = async (u) => {
    try {
      await api.post(`/api/users/${u.id}/unban/`);
      fetchUsers(true);
    } catch (err) {
      console.error('Unban failed:', err);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-sans tracking-wide">
      <div className="gate-card p-10 flex flex-col items-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4">
        <div className="w-16 h-16 border-4 border-gray-900 border-t-brand-primary rounded-full animate-spin mb-6" />
        <p className="text-xl font-display font-black text-gray-900 uppercase">Loading Directory...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f4f4f5] font-sans">
      {/* Modals */}
      <UserFormModal
        open={showForm}
        editUser={editUser}
        onClose={() => setShowForm(false)}
        onSaved={() => fetchUsers(true)}
      />
      <DeleteModal
        open={Boolean(deleteTarget)}
        user={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onDeleted={() => fetchUsers(true)}
      />
      <BanModal
        open={Boolean(banTarget)}
        user={banTarget}
        onClose={() => setBanTarget(null)}
        onUpdated={() => fetchUsers(true)}
      />

      {/* Header */}
      <div className="bg-white border-b-4 border-gray-900 sticky top-0 z-10 shadow-[0_4px_0_0_rgba(0,0,0,1)]">
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-3 bg-white border-2 border-gray-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none transition-all">
              <ArrowLeft className="w-6 h-6 text-gray-900" />
            </Link>
            <div>
              <h1 className="text-3xl font-display font-black text-gray-900 uppercase tracking-tight">System Directory</h1>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mt-1">Manage Personnel & Access</p>
            </div>
          </div>
          <button
            onClick={openCreate}
            className="gate-btn flex items-center justify-center gap-2 px-6 py-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none"
          >
            <UserPlus className="w-5 h-5" />
            NEW RECORD
          </button>
        </div>
      </div>

      <div className="p-6 max-w-7xl mx-auto mt-6">
        {/* Filters */}
        <div className="bg-white p-6 border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900" />
              <input
                type="text"
                placeholder="SEARCH DIRECTORY..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-900 bg-gray-50 font-bold uppercase tracking-wider focus:outline-none focus:bg-white focus:ring-0"
              />
            </div>
            {/* Role filter */}
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900" />
              <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
                className="pl-12 pr-10 py-3 border-2 border-gray-900 bg-gray-50 font-bold uppercase tracking-wider focus:outline-none focus:bg-white appearance-none min-w-[150px]">
                <option value="all">ALL ROLES</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            {/* Ban filter */}
            <div>
              <select value={bannedFilter} onChange={e => setBannedFilter(e.target.value)}
                className="px-4 py-3 border-2 border-gray-900 bg-gray-50 font-bold uppercase tracking-wider focus:outline-none focus:bg-white appearance-none min-w-[150px]">
                <option value="all">ALL STATUSES</option>
                <option value="active">ACTIVE ONLY</option>
                <option value="banned">BANNED ONLY</option>
              </select>
            </div>
          </div>

          {/* Stats md/lg screens */}
          <div className="mt-6 pt-4 border-t-2 border-gray-900 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold uppercase tracking-widest text-gray-900">
            <span className="bg-gray-200 px-2 py-1 border border-gray-900">
              {Math.min(filteredUsers.length, 50)} / {filteredUsers.length} SHOWN
            </span>
            <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4"/> STU: {users.filter(u => u.role === 'student').length}</span>
            <span className="flex items-center gap-2"><Briefcase className="w-4 h-4"/> STF: {users.filter(u => u.role === 'staff').length}</span>
            <span className="flex items-center gap-2"><UserCheck className="w-4 h-4"/> GRD: {users.filter(u => u.role === 'guard').length}</span>
            <span className="flex items-center gap-2"><Shield className="w-4 h-4"/> ADM: {users.filter(u => u.role === 'admin').length}</span>
            <span className="flex items-center gap-2 text-red-600 ml-auto"><Ban className="w-4 h-4"/> BANNED: {users.filter(u => u.is_banned).length}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border-4 border-gray-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-4 divide-gray-900">
              <thead className="bg-gray-100 border-b-4 border-gray-900">
                <tr>
                  {['User', 'Role', 'Contact', 'Status', 'Actions'].map(col => (
                    <th key={col} className="px-6 py-4 text-left text-sm font-black text-gray-900 uppercase tracking-widest">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y-2 divide-gray-200">
                {filteredUsers.slice(0, 50).map(user => (
                  <tr key={user.id} className={`hover:bg-amber-50 transition-colors ${user.is_banned ? 'bg-red-50 hover:bg-red-100' : ''}`}>
                    {/* User */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 border-2 border-gray-900 bg-white flex items-center justify-center flex-shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                          {user.photo
                            ? <img className="h-12 w-12 object-cover" src={user.photo} alt="" />
                            : <span className="text-xl font-display font-black text-gray-900">
                                {(user.first_name?.[0] || user.username?.[0] || '?').toUpperCase()}
                              </span>
                          }
                        </div>
                        <div>
                          <div className="text-base font-bold text-gray-900 uppercase">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-xs font-bold text-gray-500 flex items-center gap-2 mt-1 uppercase tracking-wider">
                            @{user.username}
                            {user.student_id && (
                              <span className="bg-gray-200 text-gray-900 px-2 py-0.5 border border-gray-900">{user.student_id}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(user.role)}
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-black uppercase tracking-wider border-2 ${getRoleBadgeColor(user.role)}`}>
                          {user.role}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{user.email || <span className="text-gray-400">—</span>}</div>
                      {user.phone && <div className="text-xs font-bold text-gray-600 mt-1 tracking-widest">{user.phone}</div>}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-2">
                        {user.is_banned ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-black uppercase tracking-wider text-xs border-2 border-red-800 bg-red-100 text-red-800 w-max shadow-[2px_2px_0px_0px_rgba(153,27,27,1)]">
                            <Ban className="w-3 h-3" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 font-black uppercase tracking-wider text-xs border-2 border-green-800 bg-green-100 text-green-800 w-max shadow-[2px_2px_0px_0px_rgba(22,101,52,1)]">
                            <CheckCircle className="w-3 h-3" />
                            Active
                          </span>
                        )}
                        {user.is_day_scholar && (
                          <span className="inline-flex items-center px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] border border-blue-800 bg-blue-50 text-blue-800 w-max">
                            Day Scholar 
                          </span>
                        )}
                        {user.must_change_password && (
                          <span className="inline-flex items-center px-2 py-0.5 font-bold uppercase tracking-wider text-[10px] border border-yellow-800 bg-yellow-50 text-yellow-800 w-max">
                            Needs PW Change
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {/* Edit */}
                        <button
                          onClick={() => openEdit(user)}
                          title="Edit user"
                          className="p-2 border-2 border-gray-900 bg-white text-gray-900 hover:bg-brand-primary hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Ban / Unban */}
                        {user.is_banned ? (
                          <button
                            onClick={() => unban(user)}
                            title="Unban user"
                            className="p-2 border-2 border-gray-900 bg-white text-green-600 hover:bg-green-600 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setBanTarget(user)}
                            title="Ban user"
                            className="p-2 border-2 border-gray-900 bg-white text-amber-600 hover:bg-amber-600 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTarget(user)}
                          title="Delete user"
                          className="p-2 border-2 border-gray-900 bg-white text-red-600 hover:bg-red-600 hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none"
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
            <div className="text-center py-24 bg-gray-50">
              <div className="w-20 h-20 bg-white border-4 border-gray-900 flex items-center justify-center mx-auto mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Users className="h-10 w-10 text-gray-900" />
              </div>
              <h3 className="mt-4 text-2xl font-display font-black text-gray-900 uppercase">Record Not Found</h3>
              <p className="mt-2 text-sm font-bold text-gray-500 uppercase tracking-widest">Adjust filters or create a new entry.</p>
              <button onClick={openCreate}
                className="mt-8 gate-btn inline-flex items-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:shadow-none">
                <UserPlus className="w-5 h-5" />
                NEW RECORD
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;