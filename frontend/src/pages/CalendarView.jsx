import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { CalendarDays, ChevronLeft, ChevronRight, Info } from 'lucide-react';

const CalendarView = () => {
  const { user } = useAuth();
  const [holidays, setHolidays] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Month navigation state
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState(null);
  const [selectedDayString, setSelectedDayString] = useState('');

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      // 1. Fetch holidays (all logged-in users have access)
      const holidayRes = await API.get('/admin/holidays');
      if (holidayRes.data && holidayRes.data.success) {
        setHolidays(holidayRes.data.data);
      }

      // 2. Fetch leaves based on user role
      if (user?.role === 'employee') {
        const leaveRes = await API.get('/leaves/my');
        if (leaveRes.data && leaveRes.data.success) {
          setLeaves(leaveRes.data.data);
        }
      } else if (user?.role === 'manager') {
        const leaveRes = await API.get('/manager/leaves');
        if (leaveRes.data && leaveRes.data.success) {
          setLeaves(leaveRes.data.data);
        }
      } else if (user?.role === 'admin') {
        const statsRes = await API.get('/admin/stats');
        if (statsRes.data && statsRes.data.success) {
          setLeaves(statsRes.data.data.allLeaves || []);
        }
      }
    } catch (err) {
      console.error('Failed to fetch calendar assets:', err);
      setError('Failed to fetch calendar information.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, [user]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calendar math
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayEvents(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayEvents(null);
  };

  // Check if a day has leaves or holidays
  const getDayEvents = (day) => {
    const checkDate = new Date(year, month, day);
    checkDate.setHours(0,0,0,0);

    const dayHolidays = holidays.filter(h => {
      const hDate = new Date(h.date);
      hDate.setHours(0,0,0,0);
      return hDate.getTime() === checkDate.getTime();
    });

    const dayLeaves = leaves.filter(l => {
      // Exclude rejected/cancelled leaves from active display
      if (l.status === 'rejected' || l.status === 'cancelled') return false;
      
      const sDate = new Date(l.startDate);
      sDate.setHours(0,0,0,0);
      const eDate = new Date(l.endDate);
      eDate.setHours(0,0,0,0);
      
      return checkDate >= sDate && checkDate <= eDate;
    });

    return {
      holidays: dayHolidays,
      leaves: dayLeaves
    };
  };

  const handleDayClick = (day) => {
    const events = getDayEvents(day);
    const dayStr = `${monthNames[month]} ${day}, ${year}`;
    
    if (events.holidays.length > 0 || events.leaves.length > 0) {
      setSelectedDayEvents(events);
      setSelectedDayString(dayStr);
    } else {
      setSelectedDayEvents(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Generate calendar grid array
  const cells = [];
  for (let i = 0; i < firstDayIndex; i++) {
    cells.push(<div key={`blank-${i}`} className="h-28 border border-slate-100 bg-slate-50/40"></div>);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const events = getDayEvents(day);
    const hasEvents = events.holidays.length > 0 || events.leaves.length > 0;
    
    cells.push(
      <div 
        key={`day-${day}`}
        onClick={() => handleDayClick(day)}
        className={`h-28 border border-slate-200 p-2 flex flex-col justify-between transition-all cursor-pointer hover:bg-slate-50/50 ${hasEvents ? 'bg-slate-50/10' : 'bg-white'}`}
      >
        <span className="text-xs font-bold text-slate-500 block self-start">{day}</span>
        
        {/* Render indicator pills inside calendar cell */}
        <div className="space-y-1 overflow-hidden mt-1 max-h-[80px]">
          {events.holidays.map((h, idx) => (
            <div key={`hol-${idx}`} className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 text-[9px] font-bold truncate" title={h.title}>
              🎉 {h.title}
            </div>
          ))}
          {events.leaves.map((l, idx) => {
            const isPending = l.status === 'pending';
            const name = user?.role === 'employee' ? l.leaveType : l.employeeId?.name || 'Employee';
            return (
              <div 
                key={`leav-${idx}`} 
                className={`px-1.5 py-0.5 rounded text-[9px] font-semibold truncate ${
                  isPending 
                    ? 'bg-amber-100 text-amber-800 border-l-2 border-amber-500' 
                    : 'bg-emerald-100 text-emerald-800 border-l-2 border-emerald-500'
                }`} 
                title={`${name} - ${l.leaveType}`}
              >
                {name}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Fill in trailing blanks
  const totalCellsCount = cells.length;
  const trailingBlanksCount = (7 - (totalCellsCount % 7)) % 7;
  for (let i = 0; i < trailingBlanksCount; i++) {
    cells.push(<div key={`blank-trail-${i}`} className="h-28 border border-slate-100 bg-slate-50/40"></div>);
  }

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Leaves & Holiday Calendar</h2>
          <p className="text-slate-500 text-sm">
            {user?.role === 'employee' 
              ? 'View company holidays and your approved/pending leaves.' 
              : 'Monitor team leaves, coverage, and general holidays.'}
          </p>
        </div>

        {/* Legend */}
        <div className="hidden lg:flex items-center space-x-4 text-xs font-semibold text-slate-500">
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-emerald-100 border-l-2 border-emerald-500"></div>
            <span>Approved Leave</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-amber-100 border-l-2 border-amber-500"></div>
            <span>Pending Approval</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <div className="w-3 h-3 rounded bg-slate-200"></div>
            <span>Company Holiday</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
          {error}
        </div>
      )}

      {/* Calendar view container */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Grid */}
        <div className="xl:col-span-3 bg-white border border-slate-200 shadow-sm rounded-2xl p-5">
          {/* Navigation Month bar */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-800 flex items-center space-x-2">
              <CalendarDays className="text-sky-500" size={22} />
              <span>{monthNames[month]} {year}</span>
            </h3>
            
            <div className="flex items-center space-x-2">
              <button 
                onClick={handlePrevMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            {daysOfWeek.map(day => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 border-t border-l border-slate-200 rounded-xl overflow-hidden shadow-inner">
            {cells}
          </div>
        </div>

        {/* Selected day details panel */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-5 h-fit">
          <h4 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
            Day Events Detail
          </h4>
          
          {!selectedDayEvents ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
              <Info size={28} className="text-slate-300 mb-2" />
              <span>Click a day in the calendar grid to display event details here.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-1 rounded block w-fit">
                {selectedDayString}
              </span>
              
              {/* Holidays list */}
              {selectedDayEvents.holidays.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Company Holidays</span>
                  {selectedDayEvents.holidays.map((h, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <span className="font-bold text-slate-700 block">🎉 {h.title}</span>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Official Company Holiday (Non-working day)</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Leaves list */}
              {selectedDayEvents.leaves.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Leaves</span>
                  {selectedDayEvents.leaves.map((l, idx) => (
                    <div key={idx} className={`p-3 rounded-xl border text-xs ${
                      l.status === 'pending' 
                        ? 'bg-amber-50/50 border-amber-200' 
                        : 'bg-emerald-50/50 border-emerald-200'
                    }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-slate-800 block">
                          {user?.role === 'employee' ? l.leaveType : l.employeeId?.name || 'Employee'}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                          l.status === 'approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {l.status}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Type: {l.leaveType}</span>
                      {user?.role !== 'employee' && (
                        <span className="text-[10px] text-slate-400 block">{l.employeeId?.department} - {l.employeeId?.designation}</span>
                      )}
                      <p className="mt-1.5 text-slate-600 italic">"{l.reason}"</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
