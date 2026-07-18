import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('employee');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');
  const [managerId, setManagerId] = useState('');
  
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  
  const navigate = useNavigate();

  // Load managers and departments dynamically on mount
  useEffect(() => {
    const fetchRegData = async () => {
      try {
        const mgrRes = await axios.get('http://localhost:5000/api/auth/managers');
        console.log("Managers API Response:", mgrRes.data);

if (mgrRes.data && mgrRes.data.success) {
    setManagers(mgrRes.data.data);
}
        
        // Fetch departments if any exist. Since registering user doesn't have token,
        // we can fetch departments using a public route or define basic fallbacks.
        // Let's fallback to standard list, but if we can, we load them.
        const deptRes = await axios.get('http://localhost:5000/api/admin/departments'); // This requires protect, so we use fallback first
      } catch (err) {
        console.log('Error loading dynamic dropdowns:', err);
      }
    };
    fetchRegData();
    // Default list of standard departments
    setDepartments(['HR', 'Engineering', 'Sales', 'Marketing', 'Finance']);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !role || !department || !designation) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    const result = await register(
      name,
      email,
      password,
      role,
      department,
      designation,
      role === 'employee' ? managerId : '' // Manager doesn't necessarily have a manager ID during self-reg
    );
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-5 text-center">Create an Account</h3>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alice Smith"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-xs"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-xs"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-medium text-slate-300 mb-1">
            Password (min 6 chars) *
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-xs"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="role" className="block text-xs font-medium text-slate-300 mb-1">
              Portal Role *
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/65 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
            >
              <option value="employee" className="bg-slate-800">Employee</option>
              <option value="manager" className="bg-slate-800">Manager</option>
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-xs font-medium text-slate-300 mb-1">
              Department *
            </label>
            <select
              id="department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900/65 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
            >
              <option value="" className="bg-slate-800">Select Department</option>
              {departments.map(dept => (
                <option key={dept} value={dept} className="bg-slate-800">{dept}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="designation" className="block text-xs font-medium text-slate-300 mb-1">
              Designation *
            </label>
            <input
              id="designation"
              type="text"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              placeholder="e.g. QA Engineer"
              className="w-full px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-xs"
            />
          </div>

          {role === 'employee' && (
            <div>
              <label htmlFor="manager" className="block text-xs font-medium text-slate-300 mb-1">
                Reports To / Manager *
              </label>
              <select
                id="manager"
                required={role === 'employee'}
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/65 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500 transition-colors text-xs"
              >
                <option value="" className="bg-slate-800">Select Manager</option>
                {managers.map(mgr => (
                  <option key={mgr._id} value={mgr._id} className="bg-slate-800">
                    {mgr.name} ({mgr.role})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 mt-2 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-semibold rounded-lg text-xs transition-colors shadow-lg shadow-sky-600/10 focus:outline-none flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating account...</span>
            </>
          ) : (
            <span>Create Account</span>
          )}
        </button>
      </form>

      <div className="mt-5 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
