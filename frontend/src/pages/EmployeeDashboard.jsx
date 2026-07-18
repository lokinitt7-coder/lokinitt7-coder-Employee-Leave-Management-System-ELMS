import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  FileText, 
  PlusCircle, 
  Trash2,
  CalendarDays
} from 'lucide-react';

const EmployeeDashboard = () => {
  const { user, updateProfileState } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch latest profile for exact balance
      const profileRes = await API.get('/users/profile');
      if (profileRes.data && profileRes.data.success) {
        updateProfileState(profileRes.data.data);
      }

      // Fetch leaves history
      const leavesRes = await API.get('/leaves/my');
      if (leavesRes.data && leavesRes.data.success) {
        setLeaves(leavesRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching employee dashboard:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelRequest = async (leaveId) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }
    
    try {
      setCancelLoading(leaveId);
      const res = await API.put(`/leaves/${leaveId}/cancel`);
      if (res.data && res.data.success) {
        // Refresh dashboard data
        await fetchDashboardData();
      }
    } catch (err) {
      console.error('Failed to cancel request:', err);
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelLoading(null);
    }
  };

  // Helper to calculate leave duration in days
  const calculateDays = (start, end, isHalfDay) => {
    if (isHalfDay) return 0.5;
    
    // We can show raw business days, or just standard calendar days for simple viewing.
    // Let's implement a quick frontend business day count.
    let count = 0;
    let curDate = new Date(start);
    curDate.setHours(0,0,0,0);
    let endLimit = new Date(end);
    endLimit.setHours(0,0,0,0);
    
    while (curDate <= endLimit) {
      const dayOfWeek = curDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        count++;
      }
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  };

  // Calculate status summaries
  const pendingCount = leaves.filter(l => l.status === 'pending').length;
  const approvedCount = leaves.filter(l => l.status === 'approved').length;
  const rejectedCount = leaves.filter(l => l.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Set up leave type balances lists
  const balanceConfig = [
    { name: 'Casual Leave', value: user?.leaveBalance?.casualLeave, max: 12, color: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    { name: 'Sick Leave', value: user?.leaveBalance?.sickLeave, max: 10, color: 'bg-rose-500', text: 'text-rose-700', bg: 'bg-rose-50' },
    { name: 'Earned Leave', value: user?.leaveBalance?.earnedLeave, max: 15, color: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' },
    { name: 'Work From Home', value: user?.leaveBalance?.wfh, max: 20, color: 'bg-indigo-500', text: 'text-indigo-700', bg: 'bg-indigo-50' },
    { name: 'Maternity/Paternity', value: user?.role === 'employee' && user?.leaveBalance?.maternityLeave > user?.leaveBalance?.paternityLeave ? user?.leaveBalance?.maternityLeave : user?.leaveBalance?.paternityLeave, max: 90, color: 'bg-purple-500', text: 'text-purple-700', bg: 'bg-purple-50' },
    { name: 'Unpaid Leave', value: user?.leaveBalance?.unpaidLeave, max: 99, color: 'bg-slate-500', text: 'text-slate-700', bg: 'bg-slate-50' }
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-2xl p-6 md:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Welcome Back, {user?.name}!</h2>
          <p className="text-sky-100 text-sm md:text-base max-w-lg">
            Manage your leaves, view company holidays, and track pending approvals inside the company HR portal.
          </p>
        </div>
        <Link 
          to="/leaves/apply" 
          className="mt-4 md:mt-0 px-5 py-3 bg-white text-sky-700 hover:bg-sky-50 font-bold rounded-xl text-sm transition-all duration-150 flex items-center space-x-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <PlusCircle size={16} />
          <span>Apply for Leave</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Leave Balances Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center space-x-2">
          <CalendarDays size={20} className="text-slate-500" />
          <span>Your Leave Balances</span>
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {balanceConfig.map((bal, idx) => (
            <div key={idx} className={`${bal.bg} rounded-2xl p-5 border border-slate-100 flex flex-col shadow-sm`}>
              <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2 block">{bal.name}</span>
              <div className="flex items-baseline space-x-1.5 mt-auto">
                <span className={`text-3xl font-extrabold ${bal.text}`}>{bal.value}</span>
                <span className="text-slate-400 text-xs font-medium">/ {bal.max} days</span>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-slate-200/60 h-1.5 rounded-full mt-4 overflow-hidden">
                <div 
                  className={`h-full ${bal.color}`} 
                  style={{ width: `${Math.min(100, (bal.value / bal.max) * 100)}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Quick Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pending Requests</span>
            <span className="text-2xl font-bold text-slate-800">{pendingCount}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Approved Leaves</span>
            <span className="text-2xl font-bold text-slate-800">{approvedCount}</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Rejected Requests</span>
            <span className="text-2xl font-bold text-slate-800">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Recent Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800">Recent Leave Requests</h3>
          <Link to="/leaves/history" className="text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors">
            View All History
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {leaves.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              No leave requests submitted yet. Click "Apply for Leave" to start.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.slice(0, 5).map((leave) => {
                  const duration = calculateDays(leave.startDate, leave.endDate, leave.halfDay);
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm text-slate-800 block">{leave.leaveType}</span>
                        {leave.isEmergency && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 text-red-800 mt-0.5">
                            Emergency
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-600">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        {leave.halfDay && <span className="block text-slate-400 mt-0.5">(Half Day)</span>}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-700 font-medium">
                        {duration} {duration === 1 ? 'day' : 'days'}
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
                            ? 'bg-slate-50 border-slate-200 text-slate-600'
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
                      <td className="px-6 py-4 text-xs text-slate-400">
                        {leave.attachment ? (
                          <a 
                            href={`http://localhost:5000${leave.attachment}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-800 font-semibold"
                          >
                            <FileText size={14} />
                            <span>View Doc</span>
                          </a>
                        ) : (
                          <span className="text-slate-300">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {(leave.status === 'pending' || leave.status === 'approved') && (
                          <button
                            onClick={() => handleCancelRequest(leave._id)}
                            disabled={cancelLoading === leave._id}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Cancel Leave"
                          >
                            {cancelLoading === leave._id ? (
                              <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Trash2 size={16} />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
