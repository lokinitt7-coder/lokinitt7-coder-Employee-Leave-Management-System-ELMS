import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on startup if token exists
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get('/users/profile');
        if (res.data && res.data.success) {
          setUser(res.data.data);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error('Initial login check failed:', err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const res = await API.post('/auth/login', { email, password });
      if (res.data && res.data.success) {
        const { token, ...userData } = res.data.data;
        localStorage.setItem('token', token);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: 'Invalid credentials' };
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, message: msg };
    }
  };

  // Register handler (User self-registration)
 const register = async (
  name,
  email,
  password,
  role,
  department,
  designation,
  managerId
) => {
  try {
    const res = await API.post('/auth/register', {
      name,
      email,
      password,
      role,
      department,
      designation,
      managerId
    });

    const { token, ...userData } = res.data.data;
    localStorage.setItem('token', token);
    setUser(userData);

    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message
    };
  }
};
  //     if (res.data && res.data.success) {
  //       const { token, ...userData } = res.data.data;
  //       localStorage.setItem('token', token);
  //       setUser(userData);
  //       return { success: true };
  //     }
  //     return { success: false, message: 'Registration failed' };
  //   } catch (err) {
  //     const msg = err.response?.data?.message || 'Registration failed';
  //     return { success: false, message: msg };
  //   }
  // };

  // Logout handler
  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (err) {
      console.error('Logout API call failed:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  // Change password handler
  const changePassword = async (currentPassword, newPassword) => {
    try {
      const res = await API.post('/auth/change-password', { currentPassword, newPassword });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Password update failed';
      return { success: false, message: msg };
    }
  };

  // Forgot password handler
  const forgotPassword = async (email) => {
    try {
      const res = await API.post('/auth/forgot-password', { email });
      return { success: true, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to trigger password recovery';
      return { success: false, message: msg };
    }
  };

  // Update local profile user state
  const updateProfileState = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        changePassword,
        forgotPassword,
        updateProfileState
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
