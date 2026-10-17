// src/components/EquipmentListings.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { equipmentService } from '../services/api';
import './EquipmentListings.css';

function EquipmentListings() {
  const [equipment, setEquipment] = useState([]);
  const [region, setRegion] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEquipment();
  }, []);

  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await equipmentService.getAllEquipment();
      console.log('Equipment data:', response.data);
      setEquipment(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load equipment listings.');
      console.error('Error:', err);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegionFilter = async () => {
    if (!region) {
      loadEquipment();
      return;
    }

    try {
      setLoading(true);
      const response = await equipmentService.getEquipmentByRegion(region);
      setEquipment(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to filter equipment.');
      console.error('Error:', err);
      setEquipment([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (availability) => {
    if (!availability) return 'unavailable';
    const status = availability.toLowerCase();
    return status;
  };

  if (loading) return <div className="loading">Loading equipment...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="equipment-container">
      <div className="header-section">
        <h1>Agricultural Equipment Rental</h1>
        <Link to="/add-equipment" className="btn btn-primary">Post Equipment</Link>
      </div>

      <div className="card filter-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Enter region to filter"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="filter-input"
          />
          <button onClick={handleRegionFilter} className="btn btn-secondary">
            Filter by Region
          </button>
          <button onClick={loadEquipment} className="btn btn-secondary">
            Show All
          </button>
        </div>
      </div>

      {!equipment || equipment.length === 0 ? (
        <div className="no-results">
          <p>No equipment listings available.</p>
        </div>
      ) : (
        <div className="equipment-grid">
          {equipment.map(item => {
            if (!item) return null;
            
            return (
              <div key={item.id} className="card equipment-card">
                <div className="equipment-header">
                  <h3>{item.equipmentName || 'Equipment'}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(item.availability)}`}>
                    {item.availability || 'UNAVAILABLE'}
                  </span>
                </div>

                <div className="equipment-details">
                  <p><strong>Type:</strong> {item.equipmentType || 'N/A'}</p>
                  <p><strong>Brand:</strong> {item.brand || 'N/A'}</p>
                  <p><strong>Model:</strong> {item.model || 'N/A'}</p>
                  <p><strong>Condition:</strong> {item.condition || 'N/A'}</p>
                  <p><strong>Location:</strong> {item.specificLocation || 'N/A'}, {item.region || 'N/A'}</p>
                  <p><strong>Contact:</strong> {item.phoneNumber || 'N/A'}</p>
                </div>

                <div className="rates-section">
                  <div className="rate-item">
                    <span className="rate-label">Daily Rate:</span>
                    <span className="rate-value">
                      ₹{item.dailyRentalCost ? Number(item.dailyRentalCost).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="rate-item">
                    <span className="rate-label">Hourly Rate:</span>
                    <span className="rate-value">
                      ₹{item.hourlyRentalCost ? Number(item.hourlyRentalCost).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                {item.description && (
                  <p className="description">{item.description}</p>
                )}

                {item.listedDate && (
                  <div className="listed-date">
                    Listed: {new Date(item.listedDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default EquipmentListings;