import React from 'react';
import { Link } from 'react-router-dom';
import authService from '../services/authService';
import './Home.css';

function Home() {
  const user = authService.getStoredUser();

  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to AgriGuide</h1>
        <p>Your Complete Agricultural Companion for Best Cultivation Results</p>
      </div>

      {user && (
        <div className="card role-dashboard-banner" style={{ background: '#f1f8e9', border: '1px solid #c8e6c9', marginBottom: '2rem', padding: '1.5rem', borderRadius: '8px' }}>
          <h2 style={{ color: '#2e7d32', marginTop: 0 }}>
            🌾 Welcome back, {user.fullName || user.username}! ({user.role} Dashboard)
          </h2>
          {user.role === 'WORKER' ? (
            <div>
              <p style={{ color: '#555', marginBottom: '1rem' }}>
                Manage your agricultural worker profile, publish or update your availability, and set your daily/hourly service rates.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/workers" className="btn btn-primary">📋 View & Manage My Listings</Link>
                <Link to="/add-worker" className="btn btn-secondary">+ Post New Worker Availability</Link>
                <Link to="/profile" className="btn btn-secondary">👤 My Profile</Link>
              </div>
            </div>
          ) : user.role === 'FARMER' ? (
            <div>
              <p style={{ color: '#555', marginBottom: '1rem' }}>
                Discover verified agricultural labor for your farm, explore crop cultivation guides, and browse farm equipment.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/workers" className="btn btn-primary">👷 Find & Contact Workers</Link>
                <Link to="/crops" className="btn btn-secondary">🌱 Browse Suitable Crops</Link>
                <Link to="/equipment" className="btn btn-secondary">🚜 Equipment Rental</Link>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: '#555', marginBottom: '1rem' }}>
                System overview: manage equipment, worker listings, crop information, and community experiences.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link to="/workers" className="btn btn-primary">👷 Worker Listings</Link>
                <Link to="/equipment" className="btn btn-secondary">🚜 Equipment</Link>
                <Link to="/crops" className="btn btn-secondary">🌱 Crops</Link>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="features-grid">
        <div className="feature-card">
          <h2>🌱 Crop Information</h2>
          <p>Get detailed information about crops suitable for your soil type and climate conditions</p>
          <Link to="/crops" className="btn btn-primary">Browse Crops</Link>
        </div>

        <div className="feature-card">
          <h2>📖 Step-by-Step Guide</h2>
          <p>Follow comprehensive growing guides with pesticides and fertilizers recommendations</p>
          <Link to="/search" className="btn btn-primary">Search Crops</Link>
        </div>

        <div className="feature-card">
          <h2>👨‍🌾 Farmer Experiences</h2>
          <p>Learn from verified experienced farmers who share their cultivation wisdom</p>
          <Link to="/experiences" className="btn btn-primary">Read Experiences</Link>
        </div>

        <div className="feature-card">
          <h2>👷 Find Workers</h2>
          <p>Discover available agricultural workers in your region with their rates</p>
          <Link to="/workers" className="btn btn-primary">Find Workers</Link>
        </div>

        <div className="feature-card">
          <h2>🚜 Equipment Rental</h2>
          <p>Find agricultural equipment available for rent in your area</p>
          <Link to="/equipment" className="btn btn-primary">Browse Equipment</Link>
        </div>

        <div className="feature-card">
          <h2>💰 Financial Planning</h2>
          <p>Get investment estimates and expected revenue for different crops</p>
          <Link to="/crops" className="btn btn-primary">View Estimates</Link>
        </div>
      </div>
    </div>
  );
}

export default Home;
