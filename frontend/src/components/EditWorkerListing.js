// src/components/EditWorkerListing.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { workerService } from '../services/api';
import authService from '../services/authService';
import './Forms.css';

function EditWorkerListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = authService.getStoredUser();

  const [formData, setFormData] = useState({
    workerName: '',
    phoneNumber: '',
    skillSet: '',
    experienceYears: 0,
    region: '',
    specificLocation: '',
    availability: 'AVAILABLE',
    dailyRate: '',
    hourlyRate: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Guard: only workers can edit
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'WORKER') {
      navigate('/workers');
      return;
    }
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadListing = async () => {
    try {
      const response = await workerService.getWorkerById(id);
      const listing = response.data;
      setFormData({
        workerName: listing.workerName || '',
        phoneNumber: listing.phoneNumber || '',
        skillSet: listing.skillSet || '',
        experienceYears: listing.experienceYears || 0,
        region: listing.region || '',
        specificLocation: listing.specificLocation || '',
        availability: listing.availability || 'AVAILABLE',
        dailyRate: listing.dailyRate || '',
        hourlyRate: listing.hourlyRate || '',
        description: listing.description || ''
      });
    } catch (err) {
      setError('Failed to load listing. It may not exist.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await workerService.updateWorkerListing(id, formData);
      setSuccess(true);
      setTimeout(() => navigate('/workers'), 1800);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to update listing. Please try again.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading">Loading listing...</div>;

  return (
    <div className="form-container">
      <h1>Edit Worker Listing</h1>

      {success && <div className="success">Listing updated! Redirecting...</div>}
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
              required
            />
          </div>
          <div className="form-group">
            <label>Specific Location</label>
            <input
              type="text"
              name="specificLocation"
              value={formData.specificLocation}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Availability *</label>
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
            <label>Daily Rate (₹)</label>
            <input
              type="number"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleChange}
              min="0"
              step="0.01"
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
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
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

export default EditWorkerListing;
