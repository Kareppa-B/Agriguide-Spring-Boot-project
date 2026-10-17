import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { experienceService, cropService } from '../services/api';
import './Forms.css';

function AddExperience() {
  const navigate = useNavigate();
  const [crops, setCrops] = useState([]);
  const [formData, setFormData] = useState({
    cropId: '',
    title: '',
    experienceText: '',
    yearsGrowing: '',
    region: '',
    averageYield: '',
    tipsAndTricks: '',
    challengesFaced: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      const response = await cropService.getAllCrops();
      setCrops(response.data);
    } catch (err) {
      console.error('Error loading crops:', err);
    }
  };

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
      const experienceData = {
        ...formData,
        crop: { id: parseInt(formData.cropId) },
        user: { id: 1 } // Replace with actual logged-in user ID
      };
      await experienceService.createExperience(experienceData);
      setSuccess(true);
      setTimeout(() => navigate('/experiences'), 2000);
    } catch (err) {
      setError('Failed to share experience. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Share Your Farming Experience</h1>
      
      {success && <div className="success">Experience shared successfully! Redirecting...</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-group">
          <label>Select Crop *</label>
          <select
            name="cropId"
            value={formData.cropId}
            onChange={handleChange}
            required
          >
            <option value="">Choose a crop</option>
            {crops.map(crop => (
              <option key={crop.id} value={crop.id}>{crop.cropName}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Brief title for your experience"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Years Growing This Crop *</label>
            <input
              type="number"
              name="yearsGrowing"
              value={formData.yearsGrowing}
              onChange={handleChange}
              required
            />
          </div>

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
        </div>

        <div className="form-group">
          <label>Average Yield (kg/acre)</label>
          <input
            type="number"
            name="averageYield"
            value={formData.averageYield}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <div className="form-group">
          <label>Your Experience *</label>
          <textarea
            name="experienceText"
            value={formData.experienceText}
            onChange={handleChange}
            rows="6"
            placeholder="Share your detailed experience growing this crop..."
            required
          />
        </div>

        <div className="form-group">
          <label>Tips & Tricks</label>
          <textarea
            name="tipsAndTricks"
            value={formData.tipsAndTricks}
            onChange={handleChange}
            rows="4"
            placeholder="Share helpful tips with other farmers..."
          />
        </div>

        <div className="form-group">
          <label>Challenges Faced</label>
          <textarea
            name="challengesFaced"
            value={formData.challengesFaced}
            onChange={handleChange}
            rows="4"
            placeholder="What challenges did you face and how did you overcome them?"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Share Experience'}
          </button>
          <button type="button" onClick={() => navigate('/experiences')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddExperience;