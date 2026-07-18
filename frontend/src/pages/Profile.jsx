import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Key, Mail, Shield, Building, Award, Calendar, Camera } from 'lucide-react';

const Profile = () => {
  const { user, changePassword, updateProfileState } = useAuth();
  
  // Profile Photo state
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoError, setPhotoError] = useState('');

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const handlePhotoUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic client check
      if (!file.type.match('image.*')) {
        setPhotoError('Please select a valid image file (JPEG, JPG, PNG).');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError('Image file is too large. Max size is 5MB.');
        return;
      }

      setPhotoError('');
      setPhotoLoading(true);

      const formData = new FormData();
      formData.append('profilePhoto', file);

      try {
        const res = await API.put('/users/profile', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        if (res.data && res.data.success) {
          updateProfileState(res.data.data);
        }
      } catch (err) {
        console.error('Profile photo upload error:', err);
        setPhotoError(err.response?.data?.message || 'Failed to upload image.');
      } finally {
        setPhotoLoading(false);
      }
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwdError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPwdError('New password must be at least 6 characters long.');
      return;
    }

    setPwdLoading(true);
    const result = await changePassword(currentPassword, newPassword);
    setPwdLoading(false);

    if (result.success) {
      setPwdSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPwdError(result.message || 'Password update failed.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Overview Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-800">My Profile</h2>
        <p className="text-slate-500 text-sm">View your personal corporate credentials, profile settings, and modify portal passwords.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side Profile Card */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 text-center flex flex-col items-center">
          
          {/* Profile Photo Wrapper */}
          <div className="relative group mb-4">
            <div className="w-28 h-28 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
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
            
            {/* Upload Label */}
            <label className="absolute bottom-0 right-0 p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all">
              <Camera size={14} />
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
              />
            </label>
          </div>

          {photoLoading && <span className="text-[10px] text-sky-600 font-semibold animate-pulse">Uploading photo...</span>}
          {photoError && <span className="text-[10px] text-red-500 font-medium block mt-1">{photoError}</span>}

          <h3 className="text-lg font-bold text-slate-800 mt-2">{user?.name}</h3>
          <span className="text-xs font-semibold text-slate-400 capitalize bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full mt-1.5">{user?.role}</span>
          
          {/* Joining date */}
          <div className="mt-6 w-full text-left space-y-4 pt-6 border-t border-slate-100 text-slate-600 text-xs">
            <div className="flex items-center space-x-2.5">
              <Mail size={15} className="text-slate-400" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <Shield size={15} className="text-slate-400" />
              <span>Role: <strong className="capitalize text-slate-700">{user?.role}</strong></span>
            </div>
            {user?.joiningDate && (
              <div className="flex items-center space-x-2.5">
                <Calendar size={15} className="text-slate-400" />
                <span>Joined: <strong>{new Date(user.joiningDate).toLocaleDateString()}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Right Side Settings Grid */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Job Details Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Employment Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-slate-600 text-xs">
              <div className="flex items-start space-x-3">
                <Building size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium block">Department</span>
                  <span className="text-slate-800 font-bold text-sm">{user?.department || 'Not Assigned'}</span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Award size={16} className="text-slate-400 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-medium block">Designation</span>
                  <span className="text-slate-800 font-bold text-sm">{user?.designation || 'Not Assigned'}</span>
                </div>
              </div>

              {user?.role === 'employee' && user?.managerId && (
                <div className="flex items-start space-x-3 sm:col-span-2">
                  <User size={16} className="text-slate-400 mt-0.5" />
                  <div>
                    <span className="text-slate-400 font-medium block">Reporting Manager</span>
                    <span className="text-slate-800 font-bold text-sm">
                      {user.managerId.name} <span className="text-xs text-slate-400 font-medium">({user.managerId.email})</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6">
            <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center space-x-2">
              <Key size={16} className="text-slate-400" />
              <span>Change Portal Password</span>
            </h4>

            {pwdError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl">
                {pwdError}
              </div>
            )}

            {pwdSuccess && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl">
                {pwdSuccess}
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Current Password *
                </label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400 text-slate-700"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-sky-500 placeholder-slate-400 text-slate-700"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  disabled={pwdLoading}
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-sky-600/50 text-white font-bold rounded-xl text-xs transition-colors shadow-md shadow-sky-600/10 flex items-center space-x-1.5"
                >
                  {pwdLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Change Password</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
