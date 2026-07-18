import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Check, 
  X, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2, 
  XCircle,
  Calendar,
  AlertCircle
} from 'lucide-react';

const ManagerDashboard = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('');

  // Processing state
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchTeamLeaves = async () => {
    try {
      setLoading(true);
      const res = await API.get('/manager/leaves');
      if (res.data && res.data.success) {
        setLeaves(res.data.data);
        setFilteredLeaves(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching team leaves:', err);
      setError('Failed to fetch team leave requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamLeaves();
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

    setFilteredLeaves(result);
  }, [searchTerm, statusFilter, typeFilter, leaves]);

  const handleActionClick = (leave) => {
    setSelectedLeave(leave);
    setComment('');
  };

  const handleProcessLeave = async (status) => {
    if (!selectedLeave) return;

    try {
      setSubmitLoading(true);
      const url = `/manager/leaves/${selectedLeave._id}/${status}`;
      const res = await API.put(url, { comment });
      
      if (res.data && res.data.success) {
        setSelectedLeave(null);
        setComment('');
        await fetchTeamLeaves(); // Refresh leaves list
      }
    } catch (err) {
      console.error(`Failed to ${status} leave:`, err);
      alert(err.response?.data?.message || `Failed to ${status} leave`);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Duration Calculator
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

  // Stats
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

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Team Approvals & Leaves</h2>
          <p className="text-slate-500 text-sm">Review, approve, or reject leave requests submitted by your team members.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Pending Approvals</span>
            <span className="text-2xl font-bold text-slate-800">{pendingCount}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Approved This Month</span>
            <span className="text-2xl font-bold text-slate-800">{approvedCount}</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <XCircle size={24} />
          </div>
          <div>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider block">Rejected Leaves</span>
            <span className="text-2xl font-bold text-slate-800">{rejectedCount}</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 pointer-events-none">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search team member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 placeholder-slate-400 transition-colors"
          />
        </div>

        {/* Dropdown filters */}
        <div className="flex items-center space-x-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-sky-500"
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
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 focus:outline-none focus:border-sky-500"
          >
            <option value="">All Leave Types</option>
            <option value="Casual Leave">Casual Leave</option>
            <option value="Sick Leave">Sick Leave</option>
            <option value="Earned Leave">Earned Leave</option>
            <option value="Work From Home">WFH</option>
            <option value="Unpaid Leave">Unpaid Leave</option>
          </select>
        </div>
      </div>

      {/* Team Leaves Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {filteredLeaves.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              No leave requests found matching filters.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Leave Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Attachment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  {statusFilter === 'pending' && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeaves.map((leave) => {
                  const duration = getDuration(leave.startDate, leave.endDate, leave.halfDay);
                  return (
                    <tr key={leave._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 overflow-hidden flex-shrink-0">
                            <img 
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${leave.employeeId?.name}`} 
                              alt="Avatar" 
                            />
                          </div>
                          <div>
                            <span className="font-semibold text-sm text-slate-800 block">{leave.employeeId?.name}</span>
                            <span className="text-[10px] text-slate-400 block">{leave.employeeId?.designation} ({leave.employeeId?.department})</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700 block">{leave.leaveType}</span>
                        {leave.isEmergency && (
                          <span className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 text-red-800 mt-0.5 uppercase tracking-wide">
                            Emergency
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-500 block">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </span>
                        <span className="text-xs font-medium text-slate-700">
                          {duration} {duration === 1 ? 'day' : 'days'} {leave.halfDay && '(Half)'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
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
                      {statusFilter === 'pending' && (
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleActionClick(leave)}
                            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center space-x-1 ml-auto"
                          >
                            <span>Process</span>
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Action Dialog / Comment Modal */}
      {selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl p-6 relative animate-zoomIn">
            <button 
              onClick={() => setSelectedLeave(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-2">Process Leave Request</h3>
            <p className="text-slate-500 text-xs mb-4">
              Submitted by <span className="font-semibold text-slate-700">{selectedLeave.employeeId?.name}</span> for{' '}
              <span className="font-semibold text-slate-700">{selectedLeave.leaveType}</span>.
            </p>

            <div className="mb-4 bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-600">
              <p><span className="font-semibold text-slate-700">Reason:</span> "{selectedLeave.reason}"</p>
              <p className="mt-1"><span className="font-semibold text-slate-700">Balance Available:</span> {selectedLeave.employeeId?.leaveBalance?.[mapLeaveTypeToKey(selectedLeave.leaveType)]} days</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Manager Review Notes / Comment *
                </label>
                <textarea
                  rows="3"
                  placeholder="Provide approval comments or reason for rejection..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleProcessLeave('reject')}
                  disabled={submitLoading}
                  className="py-2.5 bg-rose-50 border border-rose-200 hover:bg-rose-100/60 font-semibold rounded-xl text-xs text-rose-700 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <XCircle size={15} />
                  <span>Reject Request</span>
                </button>
                <button
                  onClick={() => handleProcessLeave('approve')}
                  disabled={submitLoading}
                  className="py-2.5 bg-emerald-600 hover:bg-emerald-500 font-semibold rounded-xl text-xs text-white transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/10"
                >
                  <CheckCircle2 size={15} />
                  <span>Approve Leave</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Map leave type helper
const mapLeaveTypeToKey = (leaveType) => {
  switch (leaveType) {
    case 'Casual Leave': return 'casualLeave';
    case 'Sick Leave': return 'sickLeave';
    case 'Earned Leave': return 'earnedLeave';
    case 'Work From Home': return 'wfh';
    case 'Maternity Leave': return 'maternityLeave';
    case 'Paternity Leave': return 'paternityLeave';
    case 'Unpaid Leave': return 'unpaidLeave';
    default: return null;
  }
};

export default ManagerDashboard;
