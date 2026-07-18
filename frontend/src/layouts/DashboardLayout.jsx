import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  History,
  CheckSquare,
  Users,
  Building,
  CalendarDays,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define menu items based on role
  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['employee', 'manager', 'admin']
    },
    {
      title: 'Apply for Leave',
      path: '/leaves/apply',
      icon: FileText,
      roles: ['employee']
    },
    {
      title: 'Leave History',
      path: '/leaves/history',
      icon: History,
      roles: ['employee']
    },
    {
      title: 'Team Approvals',
      path: '/manager/approvals',
      icon: CheckSquare,
      roles: ['manager', 'admin']
    },
    {
      title: 'Calendar',
      path: '/calendar',
      icon: Calendar,
      roles: ['employee', 'manager', 'admin']
    },
    {
      title: 'Manage Employees',
      path: '/admin/users',
      icon: Users,
      roles: ['admin']
    },
    {
      title: 'Departments',
      path: '/admin/departments',
      icon: Building,
      roles: ['admin']
    },
    {
      title: 'Holidays Config',
      path: '/admin/holidays',
      icon: CalendarDays,
      roles: ['admin']
    },
    {
      title: 'Profile',
      path: '/profile',
      icon: User,
      roles: ['employee', 'manager', 'admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => item.roles.includes(user?.role));

  const getPageTitle = () => {
    const currentItem = menuItems.find(item => item.path === location.pathname);
    return currentItem ? currentItem.title : 'Internal Portal';
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-0'} transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:flex md:flex-col shadow-xl`}>
        {/* Brand Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-sky-500/20">HR</div>
            <span className="font-semibold text-lg tracking-wider text-slate-100">ELMS Portal</span>
          </div>
          <button 
            className="md:hidden ml-auto text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/10' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
                }`}
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logged in User quick info + Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden flex-shrink-0 border border-slate-700">
              {user?.profilePhoto ? (
                <img 
                  src={`http://localhost:5000${user.profilePhoto}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`; }}
                />
              ) : (
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize truncate">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-red-900/40 hover:text-red-200 border border-slate-700 hover:border-red-900/50 rounded-lg text-xs font-semibold text-slate-300 transition-colors"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header/Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-30 shadow-sm">
          <div className="flex items-center space-x-4">
            <button 
              className="md:hidden text-slate-600 hover:text-slate-950 focus:outline-none"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden sm:block">{getPageTitle()}</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Dropdown Container */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  setProfileDropdownOpen(false);
                }}
                className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors focus:outline-none"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-[9px] font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Box */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <span className="font-semibold text-sm text-slate-800">Notifications</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead}
                        className="text-xs text-sky-600 hover:text-sky-800 font-medium"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div 
                          key={notif._id} 
                          onClick={() => !notif.isRead && markRead(notif._id)}
                          className={`p-4 text-xs transition-colors cursor-pointer ${notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-sky-50/50 hover:bg-sky-50'}`}
                        >
                          <p className={`text-slate-700 ${!notif.isRead ? 'font-semibold' : ''}`}>{notif.message}</p>
                          <span className="text-[10px] text-slate-400 block mt-1.5">
                            {new Date(notif.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => {
                  setProfileDropdownOpen(!profileDropdownOpen);
                  setNotifDropdownOpen(false);
                }}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden border border-slate-300 flex-shrink-0">
                  {user?.profilePhoto ? (
                    <img 
                      src={`http://localhost:5000${user.profilePhoto}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`; }}
                    />
                  ) : (
                    <img 
                      src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="hidden md:flex items-center space-x-1">
                  <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]">{user?.name}</span>
                  <ChevronDown size={14} className="text-slate-500" />
                </div>
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1 divide-y divide-slate-100">
                  <div className="px-4 py-2.5">
                    <p className="text-xs text-slate-400 font-medium">Signed in as</p>
                    <p className="text-sm text-slate-700 font-semibold truncate">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link 
                      to="/profile" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link 
                      to="/calendar" 
                      onClick={() => setProfileDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Calendar
                    </Link>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default DashboardLayout;
