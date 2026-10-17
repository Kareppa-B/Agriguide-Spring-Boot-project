import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerService } from '../services/api';
import './Forms.css';

function AddWorkerListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    workerName: '',
    phoneNumber: '',
    skillSet: '',
    experienceYears: '',
    region: '',
    specificLocation: '',
    availability: 'AVAILABLE',
    dailyRate: '',
    hourlyRate: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Submitting worker listing:', formData);
      const response = await workerService.createWorkerListing(formData);
      console.log('Worker listing created successfully:', response.data);
      setSuccess(true);
      setTimeout(() => navigate('/workers'), 2000);
    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || 'Failed to post worker listing. Please try again.';
      setError(msg);
      console.error('Error creating worker listing:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Post Worker Availability</h1>
      
      {success && <div className="success">Worker listing posted successfully! Redirecting...</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Worker Name *</label>
            <input
              type="text"
              name="workerName"
              value={formData.workerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number *</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+91-9876543210"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Skill Set *</label>
            <input
              type="text"
              name="skillSet"
              value={formData.skillSet}
              onChange={handleChange}
              placeholder="e.g., Tractor Operation, Harvesting, Irrigation"
              required
            />
          </div>

          <div className="form-group">
            <label>Experience (Years) *</label>
            <input
              type="number"
              name="experienceYears"
              value={formData.experienceYears}
              onChange={handleChange}
              min="0"
              required
            />
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
              placeholder="e.g., Punjab, Maharashtra"
              required
            />
          </div>

          <div className="form-group">
            <label>Specific Location *</label>
            <input
              type="text"
              name="specificLocation"
              value={formData.specificLocation}
              onChange={handleChange}
              placeholder="e.g., Ludhiana, Pune"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Availability Status *</label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>

          <div className="form-group">
            <label>Daily Rate (₹) *</label>
            <input
              type="number"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g., 800"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Hourly Rate (₹)</label>
            <input
              type="number"
              name="hourlyRate"
              value={formData.hourlyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="e.g., 100"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Brief description of skills and experience..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Worker Availability'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/workers')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddWorkerListing;