// src/components/Signup.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import './Auth.css';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    location: '',
    region: '',
    role: 'FARMER',
    yearsOfExperience: 0,
    specialization: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Remove confirmPassword before sending
      const { confirmPassword, ...signupData } = formData;
      
      console.log('Sending signup data:', signupData);
      
      const response = await authService.signup(signupData);
      
      console.log('Signup response:', response.data);
      
      if (response.data && response.data.success) {
        // Auto login after signup
        try {
          const loginResponse = await authService.login({
            username: formData.username,
            password: formData.password
          });
          
          if (loginResponse.data && loginResponse.data.success) {
            const signedUser = loginResponse.data.user;
            authService.storeAuth(loginResponse.data.token, signedUser);
            if (signedUser.role === 'ADMIN') {
              navigate('/admin-dashboard');
            } else if (signedUser.role === 'WORKER') {
              navigate('/worker-dashboard');
            } else if (signedUser.role === 'FARMER') {
              navigate('/farmer-dashboard');
            } else {
              navigate('/');
            }
            window.location.reload();
          } else {
            // Signup successful but login failed, redirect to login page
            alert('Account created! Please login.');
            navigate('/login');
          }
        } catch (loginErr) {
          console.error('Login error after signup:', loginErr);
          alert('Account created! Please login.');
          navigate('/login');
        }
      } else {
        setError(response.data?.message || 'Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Signup error:', err);
      
      if (err.response) {
        // Backend returned an error
        console.error('Backend error:', err.response.data);
        setError(err.response.data.message || 'Signup failed. Please try again.');
      } else if (err.request) {
        // Request made but no response
        console.error('No response from backend:', err.request);
        setError('Cannot connect to server. Please try again in a moment.');
      } else {
        // Other error
        console.error('Error:', err.message);
        setError('Signup failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <h1>🌾 Join AgriGuide</h1>
          <p>Create your account</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label>Username *</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Password *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>

            <div className="form-group">
              <label>Confirm Password *</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength="6"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Role *</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="FARMER">Farmer</option>
                <option value="WORKER">Worker</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Region *</label>
              <input
                type="text"
                name="region"
                value={formData.region}
                onChange={handleChange}
                placeholder="e.g., Punjab"
                required
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City/Village"
              />
            </div>
          </div>

          {formData.role === 'FARMER' && (
            <div className="form-row">
              <div className="form-group">
                <label>Years of Experience</label>
                <input
                  type="number"
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  placeholder="e.g., Rice cultivation"
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Login here</Link></p>
        </div>
      </div>
    </div>
  );
}

export default Signup;