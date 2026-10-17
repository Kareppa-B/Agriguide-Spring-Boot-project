// src/components/Profile.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './Profile.css';

function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    try {
      const response = await authService.changePassword(
        user.id,
        passwordData.oldPassword,
        passwordData.newPassword
      );

      if (response.data.success) {
        setMessage('Password changed successfully!');
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowChangePassword(false);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError('Failed to change password');
      console.error('Error:', err);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
    window.location.reload();
  };

  if (!user) return <div className="loading">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="card profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <h1>{user.fullName || 'User'}</h1>
          <p className="username">@{user.username}</p>
          {user.role && (
            <span className={`role-badge ${user.role.toLowerCase()}`}>
              {user.role}
            </span>
          )}
        </div>

        {message && <div className="success">{message}</div>}
        {error && <div className="error">{error}</div>}

        <div className="profile-details">
          <div className="detail-item">
            <span className="label">Email:</span>
            <span className="value">{user.email || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Phone:</span>
            <span className="value">{user.phoneNumber || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Region:</span>
            <span className="value">{user.region || 'Not provided'}</span>
          </div>
          <div className="detail-item">
            <span className="label">Location:</span>
            <span className="value">{user.location || 'Not specified'}</span>
          </div>
          {user.yearsOfExperience && user.yearsOfExperience > 0 && (
            <div className="detail-item">
              <span className="label">Experience:</span>
              <span className="value">{user.yearsOfExperience} years</span>
            </div>
          )}
          {user.specialization && (
            <div className="detail-item">
              <span className="label">Specialization:</span>
              <span className="value">{user.specialization}</span>
            </div>
          )}
          {user.isVerifiedFarmer && (
            <div className="detail-item">
              <span className="verified-badge">✓ Verified Farmer</span>
            </div>
          )}
        </div>

        <div className="profile-actions">
          <button 
            className="btn btn-secondary"
            onClick={() => setShowChangePassword(!showChangePassword)}
          >
            Change Password
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        {showChangePassword && (
          <form onSubmit={handleChangePassword} className="password-form">
            <h3>Change Password</h3>
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={passwordData.oldPassword}
                onChange={handlePasswordChange}
                required
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength="6"
                required
              />
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                minLength="6"
                required
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default Profile;