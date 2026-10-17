import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cropService } from '../services/api';
import './Forms.css';

function AddCrop() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    cropName: '',
    scientificName: '',
    category: '',
    description: '',
    soilType: '',
    climateCondition: '',
    minTemperature: '',
    maxTemperature: '',
    rainfallRequirement: '',
    growingPeriodDays: '',
    cultivationSteps: '',
    estimatedInvestment: '',
    expectedYieldPerAcre: '',
    expectedRevenuePerAcre: '',
    pesticidesRecommended: '',
    fertilizersRecommended: '',
    irrigationRequirement: '',
    harvestingSeason: ''
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
      console.log('Submitting crop data:', formData);
      const response = await cropService.createCrop(formData);
      console.log('Crop created successfully:', response.data);
      setSuccess(true);
      setTimeout(() => navigate('/crops'), 2000);
    } catch (err) {
      setError('Failed to add crop. Please try again.');
      console.error('Error creating crop:', err);
      console.error('Error response:', err.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h1>Add New Crop</h1>
      
      {success && <div className="success">Crop added successfully! Redirecting...</div>}
      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="card">
        <div className="form-row">
          <div className="form-group">
            <label>Crop Name *</label>
            <input
              type="text"
              name="cropName"
              value={formData.cropName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Scientific Name</label>
            <input
              type="text"
              name="scientificName"
              value={formData.scientificName}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              placeholder="e.g., Cereal, Vegetable, Fruit"
            />
          </div>

          <div className="form-group">
            <label>Growing Period (Days) *</label>
            <input
              type="number"
              name="growingPeriodDays"
              value={formData.growingPeriodDays}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <h3>Growing Conditions</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Soil Type *</label>
            <select
              name="soilType"
              value={formData.soilType}
              onChange={handleChange}
              required
            >
              <option value="">Select Soil Type</option>
              <option value="Clay">Clay</option>
              <option value="Sandy">Sandy</option>
              <option value="Loamy">Loamy</option>
              <option value="Silt">Silt</option>
              <option value="Black Soil">Black Soil</option>
              <option value="Red Soil">Red Soil</option>
              <option value="Alluvial">Alluvial</option>
            </select>
          </div>

          <div className="form-group">
            <label>Climate Condition *</label>
            <select
              name="climateCondition"
              value={formData.climateCondition}
              onChange={handleChange}
              required
            >
              <option value="">Select Climate</option>
              <option value="Tropical">Tropical</option>
              <option value="Subtropical">Subtropical</option>
              <option value="Temperate">Temperate</option>
              <option value="Arid">Arid</option>
              <option value="Semi-Arid">Semi-Arid</option>
              <option value="Humid">Humid</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Min Temperature (°C)</label>
            <input
              type="number"
              name="minTemperature"
              value={formData.minTemperature}
              onChange={handleChange}
              step="0.1"
            />
          </div>

          <div className="form-group">
            <label>Max Temperature (°C)</label>
            <input
              type="number"
              name="maxTemperature"
              value={formData.maxTemperature}
              onChange={handleChange}
              step="0.1"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Rainfall Requirement</label>
          <input
            type="text"
            name="rainfallRequirement"
            value={formData.rainfallRequirement}
            onChange={handleChange}
            placeholder="e.g., 500-700mm annually"
          />
        </div>

        <h3>Financial Details</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Estimated Investment (₹)</label>
            <input
              type="number"
              name="estimatedInvestment"
              value={formData.estimatedInvestment}
              onChange={handleChange}
              step="0.01"
            />
          </div>

          <div className="form-group">
            <label>Expected Yield Per Acre (kg)</label>
            <input
              type="number"
              name="expectedYieldPerAcre"
              value={formData.expectedYieldPerAcre}
              onChange={handleChange}
              step="0.01"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Expected Revenue Per Acre (₹)</label>
          <input
            type="number"
            name="expectedRevenuePerAcre"
            value={formData.expectedRevenuePerAcre}
            onChange={handleChange}
            step="0.01"
          />
        </div>

        <h3>Cultivation Details</h3>
        <div className="form-group">
          <label>Cultivation Steps</label>
          <textarea
            name="cultivationSteps"
            value={formData.cultivationSteps}
            onChange={handleChange}
            rows="5"
            placeholder="Describe step-by-step cultivation process..."
          />
        </div>

        <div className="form-group">
          <label>Recommended Pesticides</label>
          <textarea
            name="pesticidesRecommended"
            value={formData.pesticidesRecommended}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Recommended Fertilizers</label>
          <textarea
            name="fertilizersRecommended"
            value={formData.fertilizersRecommended}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Irrigation Requirements</label>
          <textarea
            name="irrigationRequirement"
            value={formData.irrigationRequirement}
            onChange={handleChange}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Harvesting Season</label>
          <input
            type="text"
            name="harvestingSeason"
            value={formData.harvestingSeason}
            onChange={handleChange}
            placeholder="e.g., October-November"
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Crop'}
          </button>
          <button type="button" onClick={() => navigate('/crops')} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddCrop;
