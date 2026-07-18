import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  UserPlus, 
  Edit2, 
  Trash, 
  Search, 
  Shield, 
  ToggleLeft, 
  ToggleRight, 
  X, 
  CheckCircle,
  Plus
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Table filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal forms states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
    designation: '',
    managerId: '',
    leaveBalance: {
      casualLeave: 12,
      sickLeave: 10,
      earnedLeave: 15,
      wfh: 20,
      maternityLeave: 90,
      paternityLeave: 15,
      unpaidLeave: 99
    }
  });

  const fetchUsersAndMetadata = async () => {
    try {
      setLoading(true);
      const userRes = await API.get('/admin/users');
      if (userRes.data && userRes.data.success) {
        setUsers(userRes.data.data);
        setFilteredUsers(userRes.data.data);
        
        // Extract manager listings
        const mgrs = userRes.data.data.filter(u => u.role === 'manager' || u.role === 'admin');
        setManagers(mgrs);
      }

      const deptRes = await API.get('/admin/departments');
      if (deptRes.data && deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load user list:', err);
      setError('Failed to fetch employee directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndMetadata();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = users;

    if (searchTerm) {
      result = result.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }

    if (roleFilter) {
      result = result.filter(u => u.role === roleFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, users]);

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBalanceChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      leaveBalance: {
        ...prev.leaveBalance,
        [name]: Number(value)
      }
    }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.post('/admin/users', formData);
      if (res.data && res.data.success) {
        setSuccess('User created successfully!');
        setShowAddModal(false);
        resetForm();
        await fetchUsersAndMetadata();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditClick = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Keep blank
      role: user.role,
      department: user.department || '',
      designation: user.designation || '',
      managerId: user.managerId?._id || '',
      leaveBalance: user.leaveBalance ? { ...user.leaveBalance } : {
        casualLeave: 12,
        sickLeave: 10,
        earnedLeave: 15,
        wfh: 20,
        maternityLeave: 90,
        paternityLeave: 15,
        unpaidLeave: 99
      }
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.put(`/admin/users/${selectedUser._id}`, formData);
      if (res.data && res.data.success) {
        setSuccess('User updated successfully!');
        setShowEditModal(false);
        resetForm();
        await fetchUsersAndMetadata();
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      const res = await API.put(`/admin/users/${user._id}`, { status: newStatus });
      if (res.data && res.data.success) {
        setSuccess(`User status changed to ${newStatus}`);
        await fetchUsersAndMetadata();
      }
    } catch (err) {
      console.error(err);
      setError('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'employee',
      department: '',
      designation: '',
      managerId: '',
      leaveBalance: {
        casualLeave: 12,
        sickLeave: 10,
        earnedLeave: 15,
        wfh: 20,
        maternityLeave: 90,
        paternityLeave: 15,
        unpaidLeave: 99
      }
    });
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Manage Employees</h2>
          <p className="text-slate-500 text-sm">Configure credentials, roles, supervisor mappings, and balances.</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowAddModal(true); }}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/10 flex items-center space-x-1.5 self-start"
        >
          <UserPlus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          {success}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search employee by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400"
          />
        </div>

        {/* Filters */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 focus:outline-none focus:border-sky-500"
        >
          <option value="">All Roles</option>
          <option value="employee">Employees Only</option>
          <option value="manager">Managers Only</option>
          <option value="admin">Admins Only</option>
        </select>
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Role & Dept</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reports To</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Balances</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${u.name}`} 
                          alt="Avatar" 
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-sm text-slate-800 block">{u.name}</span>
                        <span className="text-[10px] text-slate-400 block">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="capitalize text-xs font-bold text-slate-700 block">{u.role}</span>
                    <span className="text-[10px] text-slate-400 block">{u.designation} ({u.department || 'No Dept'})</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                    {u.managerId ? u.managerId.name : <span className="text-slate-300">None</span>}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-medium max-w-[220px]">
                    {u.leaveBalance ? (
                      <span className="block truncate">
                        CL:{u.leaveBalance.casualLeave} | SL:{u.leaveBalance.sickLeave} | EL:{u.leaveBalance.earnedLeave} | WFH:{u.leaveBalance.wfh}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                      u.status === 'active' 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                        : 'bg-slate-100 border-slate-200 text-slate-500'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleToggleStatus(u)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          u.status === 'active' 
                            ? 'text-emerald-600 hover:bg-emerald-50' 
                            : 'text-slate-400 hover:bg-slate-100'
                        }`}
                        title={u.status === 'active' ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {u.status === 'active' ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      </button>
                      <button
                        onClick={() => handleEditClick(u)}
                        className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                        title="Edit Details"
                      >
                        <Edit2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl shadow-2xl p-6 relative my-8 max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-6">
              {showAddModal ? 'Register New Employee' : 'Edit Employee Settings'}
            </h3>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="space-y-6">
              
              {/* Profile Details Block */}
              <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Account Credentials</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>

                  {showAddModal && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Portal Password *</label>
                      <input
                        type="password"
                        required
                        name="password"
                        value={formData.password}
                        onChange={handleFieldChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Roles and Supervisor Mappings */}
              <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Corporate Mapping</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role *</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Department *</label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      <option value="">Select Department</option>
                      {departments.map(d => (
                        <option key={d.name} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Designation *</label>
                    <input
                      type="text"
                      name="designation"
                      value={formData.designation}
                      onChange={handleFieldChange}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      placeholder="e.g. Sales Director"
                    />
                  </div>

                  {formData.role === 'employee' && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Reporting Supervisor *</label>
                      <select
                        name="managerId"
                        value={formData.managerId}
                        onChange={handleFieldChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      >
                        <option value="">No Manager Assigned</option>
                        {managers.map(m => (
                          <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Leave Policy Balances Configuration */}
              <div className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Policy Balances (Adjust days)</h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Casual Leave</label>
                    <input
                      type="number"
                      name="casualLeave"
                      value={formData.leaveBalance.casualLeave}
                      onChange={handleBalanceChange}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Sick Leave</label>
                    <input
                      type="number"
                      name="sickLeave"
                      value={formData.leaveBalance.sickLeave}
                      onChange={handleBalanceChange}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">Earned Leave</label>
                    <input
                      type="number"
                      name="earnedLeave"
                      value={formData.leaveBalance.earnedLeave}
                      onChange={handleBalanceChange}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-1">WFH</label>
                    <input
                      type="number"
                      name="wfh"
                      value={formData.leaveBalance.wfh}
                      onChange={handleBalanceChange}
                      className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/10"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
