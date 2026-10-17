import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { cropService } from '../services/api';
import './CropSearch.css';

function CropSearch() {
  const [searchType, setSearchType] = useState('suitable');
  const [soilType, setSoilType] = useState('');
  const [climate, setClimate] = useState('');
  const [cropName, setCropName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let response;
      if (searchType === 'suitable' && soilType && climate) {
        response = await cropService.getSuitableCrops(soilType, climate);
      } else if (searchType === 'soil' && soilType) {
        response = await cropService.getCropsBySoil(soilType);
      } else if (searchType === 'climate' && climate) {
        response = await cropService.getCropsByClimate(climate);
      } else if (searchType === 'name' && cropName) {
        response = await cropService.searchCrops(cropName);
      }
      setResults(response?.data || []);
    } catch (err) {
      setError('Failed to search crops. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="crop-search-container">
      <h1>Find Suitable Crops</h1>
      
      <div className="card search-form">
        <form onSubmit={handleSearch}>
          <div className="form-group">
            <label>Search By:</label>
            <select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)}
            >
              <option value="suitable">Soil Type & Climate</option>
              <option value="soil">Soil Type Only</option>
              <option value="climate">Climate Only</option>
              <option value="name">Crop Name</option>
            </select>
          </div>

          {(searchType === 'suitable' || searchType === 'soil') && (
            <div className="form-group">
              <label>Soil Type:</label>
              <select value={soilType} onChange={(e) => setSoilType(e.target.value)}>
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
          )}

          {(searchType === 'suitable' || searchType === 'climate') && (
            <div className="form-group">
              <label>Climate Condition:</label>
              <select value={climate} onChange={(e) => setClimate(e.target.value)}>
                <option value="">Select Climate</option>
                <option value="Tropical">Tropical</option>
                <option value="Subtropical">Subtropical</option>
                <option value="Temperate">Temperate</option>
                <option value="Arid">Arid</option>
                <option value="Semi-Arid">Semi-Arid</option>
                <option value="Humid">Humid</option>
              </select>
            </div>
          )}

          {searchType === 'name' && (
            <div className="form-group">
              <label>Crop Name:</label>
              <input
                type="text"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                placeholder="Enter crop name"
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search Crops'}
          </button>
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      {results.length > 0 && (
        <div className="search-results">
          <h2>Found {results.length} Suitable Crops</h2>
          <div className="crops-grid">
            {results.map(crop => (
              <div key={crop.id} className="crop-card">
                <h3>{crop.cropName}</h3>
                <p className="scientific-name">{crop.scientificName}</p>
                <div className="crop-info">
                  <p><strong>Soil:</strong> {crop.soilType}</p>
                  <p><strong>Climate:</strong> {crop.climateCondition}</p>
                  <p><strong>Growing Period:</strong> {crop.growingPeriodDays} days</p>
                  <p><strong>Investment:</strong> ₹{crop.estimatedInvestment}</p>
                  <p><strong>Expected Revenue:</strong> ₹{crop.expectedRevenuePerAcre}/acre</p>
                </div>
                <Link to={`/crops/${crop.id}`} className="btn btn-secondary">View Full Details</Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && results.length === 0 && (
        <div className="no-results">
          <p>No crops found. Try different search criteria.</p>
        </div>
      )}
    </div>
  );
}

export default CropSearch;