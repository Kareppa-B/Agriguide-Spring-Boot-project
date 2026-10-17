import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cropService } from '../services/api';
import './CropList.css';

function CropList() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCrops();
  }, []);

  const loadCrops = async () => {
    try {
      setLoading(true);
      const response = await cropService.getAllCrops();

      // Check if response.data is an array; if not, try to extract crops array
      const cropsArray = Array.isArray(response.data)
        ? response.data
        : Array.isArray(response.data?.crops)
        ? response.data.crops
        : [];

      setCrops(cropsArray);
      setError(null);
    } catch (err) {
      setError('Failed to load crops. Please try again.');
      console.error('Error loading crops:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading crops...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="crop-list-container">
      <div className="header-section">
        <h1>All Crops</h1>
        <Link to="/add-crop" className="btn btn-primary">Add New Crop</Link>
      </div>

      <div className="crops-grid">
        {crops.length > 0 ? (
          crops.map(crop => (
            <div key={crop.id} className="crop-card">
              <h3>{crop.cropName}</h3>
              <p className="scientific-name">{crop.scientificName}</p>
              <div className="crop-info">
                <p><strong>Soil Type:</strong> {crop.soilType}</p>
                <p><strong>Climate:</strong> {crop.climateCondition}</p>
                <p><strong>Growing Period:</strong> {crop.growingPeriodDays} days</p>
                <p><strong>Investment:</strong> ₹{crop.estimatedInvestment}</p>
              </div>
              <Link to={`/crops/${crop.id}`} className="btn btn-secondary">View Details</Link>
            </div>
          ))
        ) : (
          <div>No crops available.</div>
        )}
      </div>
    </div>
  );
}

export default CropList;
