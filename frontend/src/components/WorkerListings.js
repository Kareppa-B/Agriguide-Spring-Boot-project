// src/components/WorkerListings.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { workerService } from '../services/api';
import authService from '../services/authService';
import './WorkerListings.css';

function WorkerListings() {
  const navigate = useNavigate();
  const [workers, setWorkers] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [region, setRegion] = useState('');
  const [skill, setSkill] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  const currentUser = authService.getStoredUser();
  const userRole = currentUser ? currentUser.role : null;
  const isWorker = userRole === 'WORKER';

  useEffect(() => {
    loadWorkers();
    if (isWorker) {
      loadMyListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      const response = await workerService.getAllWorkers();
      setWorkers(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load worker listings.');
      console.error('Error:', err);
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMyListings = async () => {
    try {
      const response = await workerService.getMyListings();
      setMyListings(response.data || []);
    } catch (err) {
      console.error('Error loading my listings:', err);
    }
  };

  const handleRegionFilter = async () => {
    if (!region) { loadWorkers(); return; }
    try {
      setLoading(true);
      const response = await workerService.getWorkersByRegion(region);
      setWorkers(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to filter by region.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillSearch = async () => {
    if (!skill) { loadWorkers(); return; }
    try {
      setLoading(true);
      const response = await workerService.searchWorkers(skill);
      setWorkers(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to search workers.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAvailabilityFilter = async (status) => {
    setAvailabilityFilter(status);
    if (!status) { loadWorkers(); return; }
    try {
      setLoading(true);
      const response = await workerService.getWorkersByAvailability(status);
      setWorkers(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to filter by availability.');
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  };

  const resetAllFilters = () => {
    setRegion('');
    setSkill('');
    setAvailabilityFilter('');
    loadWorkers();
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this listing? It will be hidden from public search.')) return;
    try {
      await workerService.deactivateWorkerListing(id);
      setActionMessage('Listing deactivated.');
      loadMyListings();
      loadWorkers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to deactivate listing.';
      setActionMessage(`Error: ${msg}`);
    }
  };

  const handleActivate = async (id) => {
    try {
      await workerService.activateWorkerListing(id);
      setActionMessage('Listing activated successfully.');
      loadMyListings();
      loadWorkers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to activate listing.';
      setActionMessage(`Error: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this listing?')) return;
    try {
      await workerService.deleteWorkerListing(id);
      setActionMessage('Listing deleted.');
      loadMyListings();
      loadWorkers();
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete listing.';
      setActionMessage(`Error: ${msg}`);
    }
  };

  const getStatusBadgeClass = (availability) => {
    if (!availability) return 'unavailable';
    return availability.toLowerCase();
  };

  if (loading) return <div className="loading">Loading workers...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="workers-container">

      {/* ── Header ── */}
      <div className="header-section">
        <h1>Find Agricultural Workers</h1>
        {isWorker && (
          <Link to="/add-worker" className="btn btn-primary">
            + Post Your Availability
          </Link>
        )}
      </div>

      {actionMessage && (
        <div className={actionMessage.startsWith('Error') ? 'error' : 'success-msg'}>
          {actionMessage}
        </div>
      )}

      {/* ── Worker Dashboard: My Listings ── */}
      {isWorker && (
        <div className="my-listings-section card">
          <h2>📋 My Listings</h2>
          {myListings.length === 0 ? (
            <p className="no-results-inline">
              You have no listings.{' '}
              <Link to="/add-worker">Post your availability now.</Link>
            </p>
          ) : (
            <div className="workers-grid">
              {myListings.map(listing => (
                <div key={listing.id} className="card worker-card my-listing-card">
                  <div className="worker-header">
                    <h3>{listing.workerName}</h3>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <span className={`status-badge ${getStatusBadgeClass(listing.availability)}`}>
                        {listing.availability}
                      </span>
                      <span className={`status-badge ${listing.isActive ? 'available' : 'unavailable'}`}>
                        {listing.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </div>
                  </div>
                  <div className="worker-info">
                    <p><strong>Skills:</strong> {listing.skillSet}</p>
                    <p><strong>Region:</strong> {listing.region}</p>
                    <p><strong>Daily Rate:</strong> ₹{listing.dailyRate ? Number(listing.dailyRate).toFixed(2) : '—'}</p>
                  </div>
                  <div className="my-listing-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => navigate(`/edit-worker/${listing.id}`)}
                    >
                      ✏️ Edit
                    </button>
                    {listing.isActive ? (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => handleDeactivate(listing.id)}
                      >
                        ⏸ Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleActivate(listing.id)}
                      >
                        ▶ Activate
                      </button>
                    )}
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(listing.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Search / Filter (available to all) ── */}
      <div className="card filter-section">
        <h3 style={{ marginTop: 0 }}>Search & Filter</h3>
        <div className="filter-group">
          <input
            type="text"
            placeholder="Filter by region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="filter-input"
          />
          <button onClick={handleRegionFilter} className="btn btn-secondary">
            Filter Region
          </button>
          <input
            type="text"
            placeholder="Search by skill"
            value={skill}
            onChange={(e) => setSkill(e.target.value)}
            className="filter-input"
          />
          <button onClick={handleSkillSearch} className="btn btn-secondary">
            Search Skill
          </button>
          <select
            value={availabilityFilter}
            onChange={(e) => handleAvailabilityFilter(e.target.value)}
            className="filter-input"
          >
            <option value="">All Availability</option>
            <option value="AVAILABLE">Available</option>
            <option value="BUSY">Busy</option>
            <option value="UNAVAILABLE">Unavailable</option>
          </select>
          <button onClick={resetAllFilters} className="btn btn-secondary">
            Show All
          </button>
        </div>
      </div>

      {/* ── Public Listings ── */}
      {!workers || workers.length === 0 ? (
        <div className="no-results">
          <p>No worker listings found for your search.</p>
        </div>
      ) : (
        <div className="workers-grid">
          {workers.map(worker => {
            if (!worker) return null;
            return (
              <div key={worker.id} className="card worker-card">
                <div className="worker-header">
                  <h3>{worker.workerName || 'Worker'}</h3>
                  <span className={`status-badge ${getStatusBadgeClass(worker.availability)}`}>
                    {worker.availability || 'UNAVAILABLE'}
                  </span>
                </div>

                <div className="worker-info">
                  <p><strong>Skills:</strong> {worker.skillSet || 'N/A'}</p>
                  <p><strong>Experience:</strong> {worker.experienceYears || 0} years</p>
                  <p><strong>Location:</strong> {worker.specificLocation || 'N/A'}, {worker.region || 'N/A'}</p>
                  {/* Phone is shown to all authenticated users; public visitors see a placeholder */}
                  {currentUser ? (
                    <p><strong>Phone:</strong> {worker.phoneNumber || 'N/A'}</p>
                  ) : (
                    <p><strong>Phone:</strong> <em><Link to="/login">Login to view</Link></em></p>
                  )}
                </div>

                <div className="rates-section">
                  <div className="rate-item">
                    <span className="rate-label">Daily Rate:</span>
                    <span className="rate-value">
                      ₹{worker.dailyRate ? Number(worker.dailyRate).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <div className="rate-item">
                    <span className="rate-label">Hourly Rate:</span>
                    <span className="rate-value">
                      ₹{worker.hourlyRate ? Number(worker.hourlyRate).toFixed(2) : '0.00'}
                    </span>
                  </div>
                </div>

                {worker.description && (
                  <p className="description">{worker.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default WorkerListings;