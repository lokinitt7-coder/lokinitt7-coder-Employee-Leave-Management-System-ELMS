import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please provide an email address');
      return;
    }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setMessage(result.message);
    } else {
      setError(result.message || 'Something went wrong');
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-white mb-4 text-center">Reset Password</h3>
      <p className="text-xs text-slate-400 mb-6 text-center">
        Enter the email address associated with your account, and we will send you a password recovery link.
      </p>

      {error && (
        <div className="mb-4 bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-xs font-medium">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 bg-emerald-900/30 border border-emerald-500/50 text-emerald-200 p-3 rounded-lg text-xs font-medium">
          {message}
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

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-semibold rounded-lg text-sm transition-colors shadow-lg shadow-sky-600/10 focus:outline-none flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Sending link...</span>
            </>
          ) : (
            <span>Send Recovery Link</span>
          )}
        </button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Back to{' '}
        <Link to="/login" className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default ForgotPassword;
