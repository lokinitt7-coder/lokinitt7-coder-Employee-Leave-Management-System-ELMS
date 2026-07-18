import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Calendar, FileText, Info, AlertTriangle, ArrowLeft } from 'lucide-react';

const ApplyLeave = () => {
  const { user, updateProfileState } = useAuth();
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [halfDay, setHalfDay] = useState(false);
  const [reason, setReason] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [attachment, setAttachment] = useState(null);

  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const navigate = useNavigate();

  // Expose current balance based on selection
  const mapLeaveTypeToKey = (type) => {
    switch (type) {
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

  const balanceKey = mapLeaveTypeToKey(leaveType);
  const currentBalance = user?.leaveBalance?.[balanceKey] ?? 0;

  // Calculate duration in business days on dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      setDuration(0);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      setDuration(0);
      return;
    }

    if (halfDay) {
      setDuration(0.5);
      return;
    }

    let count = 0;
    let cur = new Date(start.getTime());
    cur.setHours(0,0,0,0);
    let limit = new Date(end.getTime());
    limit.setHours(0,0,0,0);

    while (cur <= limit) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // Not Saturday (6) or Sunday (0)
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setDuration(count);
  }, [startDate, endDate, halfDay]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachment(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate || !reason) {
      setError('Please fill in all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date.');
      return;
    }

    if (duration <= 0) {
      setError('Duration must be at least 0.5 days. Note that weekends are automatically excluded.');
      return;
    }

    if (currentBalance < duration) {
      setError(`Insufficient leave balance. You are requesting ${duration} days, but only ${currentBalance} days are available.`);
      return;
    }

    // Since we are uploading a file, we must use FormData
    const formData = new FormData();
    formData.append('leaveType', leaveType);
    formData.append('startDate', startDate);
    formData.append('endDate', endDate);
    formData.append('halfDay', halfDay);
    formData.append('reason', reason);
    formData.append('isEmergency', isEmergency);
    if (attachment) {
      formData.append('attachment', attachment);
    }

    try {
      setLoading(true);
      const res = await API.post('/leaves', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data && res.data.success) {
        setSuccess('Leave request submitted successfully! Redirecting...');
        
        // Refresh profile for latest balance
        const profileRes = await API.get('/users/profile');
        if (profileRes.data && profileRes.data.success) {
          updateProfileState(profileRes.data.data);
        }

        setTimeout(() => {
          navigate('/dashboard');
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit leave request:', err);
      setError(err.response?.data?.message || 'Failed to submit leave request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      {/* Back Header */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={() => navigate('/dashboard')}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <span className="text-sm font-semibold text-slate-500">Back to Dashboard</span>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Submit Leave Request</h3>
          <p className="text-xs text-slate-400">Request formal leave approval. Note that approvals are directed to your manager: {user?.managerId?.name || 'HR Director'}.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
              {success}
            </div>
          )}

          {/* Form Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Leave Type Select */}
            <div>
              <label htmlFor="leaveType" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Leave Type *
              </label>
              <select
                id="leaveType"
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-700 font-medium"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Earned Leave">Earned Leave</option>
                <option value="Work From Home">Work From Home (WFH)</option>
                <option value="Unpaid Leave">Unpaid Leave</option>
                <option value="Maternity Leave">Maternity Leave</option>
                <option value="Paternity Leave">Paternity Leave</option>
              </select>

              {/* Balance Box */}
              <div className="mt-3 p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-center justify-between text-xs">
                <span className="text-sky-700 font-medium">Available Balance:</span>
                <span className="text-sky-900 font-extrabold text-sm">{currentBalance} days</span>
              </div>
            </div>

            {/* Duration details */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 flex flex-col justify-center items-center text-center">
              <Calendar size={32} className="text-slate-400 mb-2" />
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Calculated Leave Duration</span>
              <span className="text-3xl font-extrabold text-slate-800 mt-1">{duration} {duration === 1 ? 'Day' : 'Days'}</span>
              <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                <Info size={10} className="inline mr-1" />
                Excludes Saturday & Sunday
              </span>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Date *
              </label>
              <input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-700"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Date *
              </label>
              <input
                id="endDate"
                type="date"
                required
                disabled={halfDay}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 text-slate-700 disabled:opacity-50"
              />
            </div>

            {/* Half Day Toggles / Emergency */}
            <div className="flex flex-col space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={halfDay}
                  onChange={(e) => {
                    setHalfDay(e.target.checked);
                    if (e.target.checked) {
                      // For half-day, startDate is the same as endDate
                      setEndDate(startDate);
                    }
                  }}
                  className="w-4.5 h-4.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-700 block">Apply for Half Day</span>
                  <span className="text-[10px] text-slate-400 font-medium">Counts as 0.5 days. Start date will equal end date.</span>
                </div>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEmergency}
                  onChange={(e) => setIsEmergency(e.target.checked)}
                  className="w-4.5 h-4.5 text-sky-600 border-slate-300 rounded focus:ring-sky-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-700 block text-red-600">Emergency Leave</span>
                  <span className="text-[10px] text-slate-400 font-medium">Check this if the leave is urgent/unplanned.</span>
                </div>
              </label>
            </div>

            {/* Document upload attachment */}
            <div>
              <label htmlFor="attachment" className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                <span>Upload Supporting Document (Optional)</span>
                <span className="text-[10px] text-slate-400 font-normal">PDF, JPG, PNG (Max 5MB)</span>
              </label>
              <input
                id="attachment"
                type="file"
                accept=".pdf,.jpeg,.jpg,.png"
                onChange={handleFileChange}
                className="w-full px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100 text-slate-500"
              />
            </div>
          </div>

          {/* Reason text */}
          <div>
            <label htmlFor="reason" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Reason for Leave *
            </label>
            <textarea
              id="reason"
              required
              rows="4"
              placeholder="Please describe the detailed reasons for your leave application..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-sky-500 placeholder-slate-400 text-slate-700"
            ></textarea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-bold rounded-xl text-xs transition-colors flex items-center space-x-1.5 shadow-md shadow-sky-600/10"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Submitting request...</span>
                </>
              ) : (
                <span>Submit Leave</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
