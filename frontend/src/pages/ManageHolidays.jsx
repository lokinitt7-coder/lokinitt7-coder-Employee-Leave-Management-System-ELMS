import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { CalendarDays, Plus, Trash2, Calendar } from 'lucide-react';

const ManageHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');

  const fetchHolidays = async () => {
    try {
      setLoading(true);
      const res = await API.get('/admin/holidays');
      if (res.data && res.data.success) {
        setHolidays(res.data.data);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch holidays.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title || !date) {
      setError('Please provide a title and date.');
      return;
    }

    try {
      const res = await API.post('/admin/holidays', { title, date });
      if (res.data && res.data.success) {
        setSuccess('Holiday added successfully!');
        setTitle('');
        setDate('');
        await fetchHolidays();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add holiday.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this company holiday?')) {
      return;
    }

    setError('');
    setSuccess('');
    try {
      const res = await API.delete(`/admin/holidays/${id}`);
      if (res.data && res.data.success) {
        setSuccess('Holiday removed successfully.');
        await fetchHolidays();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove holiday.');
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
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">Company Holidays Config</h2>
        <p className="text-slate-500 text-sm">Add and delete official corporate calendar holidays.</p>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Add Holiday Form Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 h-fit">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-1.5">
            <Plus size={16} className="text-sky-600" />
            <span>Add Holiday</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Holiday Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Independence Day"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 text-slate-700 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Holiday Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 text-slate-700"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-600/10 flex items-center justify-center space-x-1.5"
            >
              <Plus size={14} />
              <span>Add to Calendar</span>
            </button>
          </form>
        </div>

        {/* Holidays List Table */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 md:col-span-2">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-1.5">
            <CalendarDays size={16} className="text-slate-400" />
            <span>Holiday Calendar Dates</span>
          </h3>

          {holidays.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No calendar holidays configured yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
              {holidays.map((h) => (
                <div key={h._id} className="py-3.5 flex items-center justify-between group">
                  <div className="flex items-center space-x-3.5">
                    <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-sky-50 group-hover:text-sky-600 transition-colors">
                      <Calendar size={16} />
                    </div>
                    <div>
                      <span className="font-bold text-xs text-slate-800 block">{h.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(h.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(h._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Holiday"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ManageHolidays;
