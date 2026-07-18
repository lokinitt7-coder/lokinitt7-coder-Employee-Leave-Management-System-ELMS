import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { Building, Plus, Trash2, Edit3, X } from 'lucide-react';

const ManageDepartments = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal forms
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);

  // Inputs
  const [deptName, setDeptName] = useState('');
  const [managerId, setManagerId] = useState('');

  const fetchDepartmentsAndManagers = async () => {
    try {
      setLoading(true);
      const deptRes = await API.get('/admin/departments');
      if (deptRes.data && deptRes.data.success) {
        setDepartments(deptRes.data.data);
      }

      // Fetch manager choices
      const userRes = await API.get('/admin/users');
      if (userRes.data && userRes.data.success) {
        const mgrs = userRes.data.data.filter(u => u.role === 'manager' || u.role === 'admin');
        setManagers(mgrs);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch departments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentsAndManagers();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.post('/admin/departments', { name: deptName, managerId });
      if (res.data && res.data.success) {
        setSuccess('Department created successfully!');
        setDeptName('');
        setManagerId('');
        setShowAddModal(false);
        await fetchDepartmentsAndManagers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create department');
    }
  };

  const handleEditClick = (dept) => {
    setSelectedDept(dept);
    setDeptName(dept.name);
    setManagerId(dept.managerId?._id || '');
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await API.put(`/admin/departments/${selectedDept._id}`, { name: deptName, managerId });
      if (res.data && res.data.success) {
        setSuccess('Department updated successfully!');
        setShowEditModal(false);
        setDeptName('');
        setManagerId('');
        setSelectedDept(null);
        await fetchDepartmentsAndManagers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDeleteDept = async (id) => {
    if (!window.confirm('Are you sure you want to delete this department? This action cannot be undone.')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await API.delete(`/admin/departments/${id}`);
      if (res.data && res.data.success) {
        setSuccess('Department deleted successfully.');
        await fetchDepartmentsAndManagers();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete department.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Departments Config</h2>
          <p className="text-slate-500 text-sm">Add and configure corporate departments and assign their supervisors.</p>
        </div>
        <button
          onClick={() => { setShowAddModal(true); setDeptName(''); setManagerId(''); }}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/10 flex items-center space-x-1.5"
        >
          <Plus size={16} />
          <span>Add Department</span>
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

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                <Building size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-bold text-slate-800 truncate">{dept.name}</h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-1">Department Head</span>
                <span className="text-xs text-slate-700 font-medium block mt-0.5">
                  {dept.managerId ? dept.managerId.name : <span className="text-slate-400 italic">No Head Assigned</span>}
                </span>
                {dept.managerId && (
                  <span className="text-[10px] text-slate-400 block mt-0.5 truncate">{dept.managerId.email}</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => handleEditClick(dept)}
                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                title="Edit Department"
              >
                <Edit3 size={15} />
              </button>
              <button
                onClick={() => handleDeleteDept(dept._id)}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Department"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modals */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl p-6 relative">
            <button 
              onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedDept(null); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-6">
              {showAddModal ? 'Create New Department' : 'Edit Department Head'}
            </h3>

            <form onSubmit={showAddModal ? handleAddSubmit : handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sales, Marketing, Customer Success"
                  value={deptName}
                  onChange={(e) => setDeptName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400 text-slate-700"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Department Head / Manager
                </label>
                <select
                  value={managerId}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 text-slate-700 font-medium"
                >
                  <option value="">No Manager / Vacant</option>
                  {managers.map(m => (
                    <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setShowEditModal(false); setSelectedDept(null); }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/10"
                >
                  Save Department
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDepartments;
