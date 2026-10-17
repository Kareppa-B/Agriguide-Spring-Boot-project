import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { experienceService } from '../services/api';
import './FarmerExperiences.css';

function FarmerExperiences() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadExperiences();
  }, []);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const response = await experienceService.getAllExperiences();
      // Sort by helpful count and put verified ones first
      const sorted = response.data.sort((a, b) => {
        if (a.isVerified !== b.isVerified) {
          return b.isVerified ? 1 : -1;
        }
        return b.helpfulCount - a.helpfulCount;
      });
      setExperiences(sorted);
      setError(null);
    } catch (err) {
      setError('Failed to load experiences.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async (id) => {
    try {
      await experienceService.markAsHelpful(id);
      loadExperiences();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="loading">Loading experiences...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="experiences-container">
      <div className="header-section">
        <h1>Farmer Experiences</h1>
        <Link to="/add-experience" className="btn btn-primary">Share Your Experience</Link>
      </div>

      <div className="experiences-list">
        {experiences.map(exp => (
          <div key={exp.id} className="card experience-card">
            <div className="experience-header">
              <h2>{exp.title}</h2>
              {exp.isVerified ? (
                <span className="verified-badge">✓ Verified Farmer</span>
              ) : (
                <span className="verified-badge" style={{backgroundColor: '#f0ad4e'}}>⏳ Pending Verification</span>
              )}
            </div>
            
            <div className="experience-meta">
              <span>👨‍🌾 {exp.yearsGrowing} years growing this crop</span>
              <span>📍 {exp.region}</span>
              <span>📊 Average Yield: {exp.averageYield} kg/acre</span>
            </div>

            <p className="experience-text">{exp.experienceText}</p>

            {exp.tipsAndTricks && (
              <div className="tips-box">
                <h3>💡 Tips & Tricks</h3>
                <p>{exp.tipsAndTricks}</p>
              </div>
            )}

            {exp.challengesFaced && (
              <div className="challenges-box">
                <h3>⚠️ Challenges Faced</h3>
                <p>{exp.challengesFaced}</p>
              </div>
            )}

            <div className="experience-footer">
              <button 
                onClick={() => handleMarkHelpful(exp.id)}
                className="btn btn-secondary btn-sm"
              >
                👍 Helpful ({exp.helpfulCount})
              </button>
              <span className="posted-date">
                Posted: {new Date(exp.postedDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default FarmerExperiences;