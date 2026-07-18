import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect path after logging in
  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.message || 'Login failed');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-6 text-center">Sign In to Your Account</h3>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-xs font-medium text-slate-300 mb-1.5">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-sm"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-slate-300">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-4 py-2.5 bg-slate-900/60 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors text-sm"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-sky-600/10 focus:outline-none flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <span>Sign In</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        New employee?{' '}
        <Link to="/register" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
          Create an account
        </Link>
      </div>

      {/* Demo Credentials Helper Box */}
      <div className="mt-8 pt-6 border-t border-slate-700/60 text-slate-400 text-[11px] space-y-2">
        <p className="font-semibold text-slate-300">Demo Accounts (Password: see details):</p>
        <div className="grid grid-cols-1 gap-1 text-slate-400">
          <div>🔑 <span className="font-semibold text-slate-300">Admin:</span> admin@company.com <span className="text-slate-500">(admin123)</span></div>
          <div>🔑 <span className="font-semibold text-slate-300">Manager:</span> manager1@company.com <span className="text-slate-500">(manager123)</span></div>
          <div>🔑 <span className="font-semibold text-slate-300">Employee:</span> employee1@company.com <span className="text-slate-500">(employee123)</span></div>
        </div>
      </div>
    </div>
  );
};

export default Login;
