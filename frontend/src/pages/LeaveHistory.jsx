import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import { FileText, ArrowLeft, Trash2, CalendarDays, Search } from 'lucide-react';

const LeaveHistory = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoading, setCancelLoading] = useState(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchReason, setSearchReason] = useState('');

  const navigate = useNavigate();

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaves/my');
      if (res.data && res.data.success) {
        setLeaves(res.data.data);
        setFilteredLeaves(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load leave history:', err);
      setError('Failed to retrieve leave history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, []);

  // Filter application
  useEffect(() => {
    let result = leaves;

    if (statusFilter) {
      result = result.filter(leave => leave.status === statusFilter);
    }

    if (typeFilter) {
      result = result.filter(leave => leave.leaveType === typeFilter);
    }

    if (searchReason) {
      result = result.filter(leave => 
        leave.reason.toLowerCase().includes(searchReason.toLowerCase())
      );
    }

    setFilteredLeaves(result);
  }, [statusFilter, typeFilter, searchReason, leaves]);

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this leave request?')) {
      return;
    }

    try {
      setCancelLoading(id);
      const res = await API.put(`/leaves/${id}/cancel`);
      if (res.data && res.data.success) {
        await fetchLeaveHistory();
      }
    } catch (err) {
      console.error('Error cancelling request:', err);
      alert(err.response?.data?.message || 'Failed to cancel request');
    } finally {
      setCancelLoading(null);
    }
  };

  // Helper to calculate days count (excluding weekends)
  const getDuration = (start, end, halfDay) => {
    if (halfDay) return 0.5;
    let count = 0;
    let cur = new Date(start);
    cur.setHours(0,0,0,0);
    let limit = new Date(end);
    limit.setHours(0,0,0,0);
    while (cur <= limit) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
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
      {/* Back button */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-500">Back to Dashboard</span>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">My Leave History</h2>
        <p className="text-slate-500 text-sm">Full track history of all leave requests, status changes, and manager comments.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Search by reason..."
            value={searchReason}
            onChange={(e) => setSearchReason(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-500 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Leave Types</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Work From Home">Work From Home</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
            <option value="Maternity Leave">Maternity Leave</option>
            <option value="Paternity Leave">Paternity Leave</option>
          </select>
        </div>
      </div>

      {/* History table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredLeaves.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No leave records found matching filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Requested Period</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Supporting File</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => {
                  const duration = getDuration(leave.startDate, leave.endDate, leave.halfDay);
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-sm text-slate-800 block">{leave.leaveType}</span>
                        {leave.isEmergency && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800 mt-0.5 uppercase tracking-wide">
                            Emergency
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        {leave.halfDay && <span className="block text-slate-400 mt-0.5">(Half Day)</span>}
                      </td>
                      <td className="px-6 py-4 font-semibold text-xs text-slate-700">
                        {duration} {duration === 1 ? 'day' : 'days'}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
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
                          <span className="block text-[10px] text-slate-400 mt-1 max-w-[200px]" title={leave.managerComment}>
                            💬 <span className="italic">{leave.managerComment}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {leave.attachment ? (
                          <a 
                            href={`http://localhost:5000${leave.attachment}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-800 font-semibold text-xs"
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
                            title="Cancel Request"
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

export default LeaveHistory;
