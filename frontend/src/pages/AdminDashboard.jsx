import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  Clock, 
  Calendar, 
  Search, 
  Building,
  ArrowRight,
  Filter
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Table filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/stats');
      if (res.data && res.data.success) {
        setStats(res.data.data);
        setLeaves(res.data.data.allLeaves || []);
        setFilteredLeaves(res.data.data.allLeaves || []);
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err);
      setError('Could not load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = leaves;

    if (searchTerm) {
      result = result.filter(leave => 
        leave.employeeId?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      result = result.filter(leave => leave.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter(leave => leave.leaveType === typeFilter);
    }

    if (deptFilter) {
      result = result.filter(leave => leave.employeeId?.department === deptFilter);
    }

    setFilteredLeaves(result);
    setCurrentPage(1); // Reset page on filter
  }, [searchTerm, statusFilter, typeFilter, deptFilter, leaves]);

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredLeaves.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLeaves.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Recharts colors
  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Admin Operations Dashboard</h2>
        <p className="text-slate-500 text-sm">System analytics, department breakdowns, monthly leave patterns, and request monitoring.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Analytics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block font-sans">Active Employees</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.counts?.totalEmployees || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <UserCheck size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Active Managers</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.counts?.totalManagers || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pending Leaves</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.counts?.pendingLeavesCount || 0}</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <Calendar size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Approved Leaves</span>
            <span className="text-2xl font-bold text-slate-800">{stats?.counts?.approvedLeavesCount || 0}</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Area Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm lg:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider text-slate-400">Monthly Approved Leaves Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats?.monthlyTrends || []} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '11px', border: 'none' }} />
                <Line type="monotone" dataKey="leaves" stroke="#0ea5e9" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdowns Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider text-slate-400">Department Size Share</h3>
          <div className="h-72 relative flex flex-col justify-center">
            {stats?.deptStats?.length === 0 ? (
              <p className="text-center text-slate-400 text-xs">No department data</p>
            ) : (
              <>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={stats?.deptStats || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {(stats?.deptStats || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '6px' }} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Custom Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-semibold px-4 mt-2">
                  {(stats?.deptStats || []).map((entry, index) => (
                    <div key={index} className="flex items-center space-x-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span>{entry.name} ({entry.value})</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Global Leaves Request Audit Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base font-bold text-slate-800">All Company Leave Requests</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400 w-44"
              />
            </div>

            {/* Filters */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-500 focus:outline-none"
            >
              <option value="">All Departments</option>
              {stats?.deptStats?.map(dept => (
                <option key={dept.name} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {currentItems.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No leave requests found matching parameters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentItems.map((leave) => {
                  // Duration calculator helper
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  let duration = 0;
                  if (leave.halfDay) {
                    duration = 0.5;
                  } else {
                    let cur = new Date(start.getTime());
                    cur.setHours(0,0,0,0);
                    let limit = new Date(end.getTime());
                    limit.setHours(0,0,0,0);
                    while (cur <= limit) {
                      const day = cur.getDay();
                      if (day !== 0 && day !== 6) duration++;
                      cur.setDate(cur.getDate() + 1);
                    }
                  }

                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm text-slate-800 block">{leave.employeeId?.name}</span>
                        <span className="text-[10px] text-slate-400 block">{leave.employeeId?.department} - {leave.employeeId?.designation}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 block">{leave.leaveType}</span>
                        <span className="text-[10px] text-slate-400 block">Submitted: {new Date(leave.createdAt).toLocaleDateString()}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 block">
                          {start.toLocaleDateString()} - {end.toLocaleDateString()}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          {duration} {duration === 1 ? 'day' : 'days'} {leave.halfDay && '(Half)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          leave.status === 'approved' 
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                            : leave.status === 'rejected'
                            ? 'bg-rose-50 border-rose-200 text-rose-700'
                            : leave.status === 'cancelled'
                            ? 'bg-slate-50 border-slate-200 text-slate-500'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                        {leave.managerComment && (
                          <span className="block text-[10px] text-slate-400 mt-1 max-w-[150px] truncate" title={leave.managerComment}>
                            💬 {leave.managerComment}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">
              Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredLeaves.length)} of {filteredLeaves.length} requests
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Previous
              </button>
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    currentPage === index + 1
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-600 rounded-lg text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
