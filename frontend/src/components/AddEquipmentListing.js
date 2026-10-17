import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { equipmentService } from '../services/api';
import './Forms.css';

function AddEquipmentListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    equipmentName: '',
    equipmentType: '',
    brand: '',
    model: '',
    description: '',
    region: '',
    specificLocation: '',
    phoneNumber: '',
    availability: 'AVAILABLE',
    dailyRentalCost: '',
    hourlyRentalCost: '',
    condition: 'GOOD'
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
      const listingData = {
        ...formData,
        user: { id: 1 } // Replace with actual logged-in user ID
      };
      await equipmentService.createEquipmentListing(listingData);
      setSuccess(true);
      setTimeout(() => navigate('/equipment'), 2000);
    } catch (err) {
      setError('Failed to post equipment listing. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Post Equipment for Rent</h1>
      
      {success && <div className="success">Listing posted successfully! Redirecting...</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Equipment Name *</label>
            <input
              type="text"
              name="equipmentName"
              value={formData.equipmentName}
              onChange={handleChange}
              placeholder="e.g., Tractor, Harvester"
              required
            />
          </div>

          <div className="form-group">
            <label>Equipment Type *</label>
            <input
              type="text"
              name="equipmentType"
              value={formData.equipmentType}
              onChange={handleChange}
              placeholder="e.g., Heavy Machinery, Tool"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Brand</label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Condition *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="EXCELLENT">Excellent</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="NEEDS_REPAIR">Needs Repair</option>
            </select>
          </div>

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
            <label>Specific Location *</label>
            <input
              type="text"
              name="specificLocation"
              value={formData.specificLocation}
              onChange={handleChange}
              placeholder="e.g., Ludhiana"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Contact Phone *</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Daily Rental Cost (₹) *</label>
            <input
              type="number"
              name="dailyRentalCost"
              value={formData.dailyRentalCost}
              onChange={handleChange}
              step="0.01"
              required
            />
          </div>

          <div className="form-group">
            <label>Hourly Rental Cost (₹)</label>
            <input
              type="number"
              name="hourlyRentalCost"
              value={formData.hourlyRentalCost}
              onChange={handleChange}
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
            placeholder="Additional details about the equipment..."
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Posting...' : 'Post Equipment'}
          </button>
          <button type="button" onClick={() => navigate('/equipment')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddEquipmentListing;