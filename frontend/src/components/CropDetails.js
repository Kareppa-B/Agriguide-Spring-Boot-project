import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { cropService, experienceService } from '../services/api';
import './CropDetails.css';

function CropDetails() {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [stages, setStages] = useState([]);
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const loadCropDetails = useCallback(async () => {
      try {
        setLoading(true);
        const [cropRes, expRes] = await Promise.all([
          cropService.getCropById(id),
          experienceService.getExperiencesByCrop(id)
        ]);

        setCrop(cropRes.data);
        setStages([]);
        setExperiences(expRes.data);
        setError(null);
      } catch (err) {
        setError('Failed to load crop details.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    }, [id]);

  useEffect(() => {
    loadCropDetails();
  }, [loadCropDetails]);

  const handleMarkHelpful = async (expId) => {
    try {
      await experienceService.markAsHelpful(expId);
      loadCropDetails();
    } catch (err) {
      console.error('Error marking helpful:', err);
    }
  };

  if (loading) return <div className="loading">Loading crop details...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!crop) return <div className="error">Crop not found</div>;

  return (
    <div className="crop-details-container">
      <Link to="/crops" className="back-link">← Back to Crops</Link>
      
      <div className="crop-header">
        <h1>{crop.cropName}</h1>
        <p className="scientific-name">{crop.scientificName}</p>
      </div>

      <div className="details-grid">
        <div className="card">
          <h2>Growing Conditions</h2>
          <div className="info-row">
            <span className="label">Soil Type:</span>
            <span className="value">{crop.soilType}</span>
          </div>
          <div className="info-row">
            <span className="label">Climate:</span>
            <span className="value">{crop.climateCondition}</span>
          </div>
          <div className="info-row">
            <span className="label">Temperature Range:</span>
            <span className="value">{crop.minTemperature}°C - {crop.maxTemperature}°C</span>
          </div>
          <div className="info-row">
            <span className="label">Rainfall:</span>
            <span className="value">{crop.rainfallRequirement}</span>
          </div>
          <div className="info-row">
            <span className="label">Growing Period:</span>
            <span className="value">{crop.growingPeriodDays} days</span>
          </div>
        </div>

        <div className="card">
          <h2>Financial Details</h2>
          <div className="info-row">
            <span className="label">Estimated Investment:</span>
            <span className="value">₹{crop.estimatedInvestment}</span>
          </div>
          <div className="info-row">
            <span className="label">Expected Yield:</span>
            <span className="value">{crop.expectedYieldPerAcre} kg/acre</span>
          </div>
          <div className="info-row">
            <span className="label">Expected Revenue:</span>
            <span className="value">₹{crop.expectedRevenuePerAcre}/acre</span>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Description</h2>
        <p>{crop.description}</p>
      </div>

      <div className="card">
        <h2>Recommended Pesticides</h2>
        <p>{crop.pesticidesRecommended}</p>
      </div>

      <div className="card">
        <h2>Recommended Fertilizers</h2>
        <p>{crop.fertilizersRecommended}</p>
      </div>

      <div className="card">
        <h2>Irrigation Requirements</h2>
        <p>{crop.irrigationRequirement}</p>
      </div>

      <div className="card">
        <h2>Cultivation Steps</h2>
        <p className="cultivation-steps">{crop.cultivationSteps}</p>
      </div>

      {stages.length > 0 && (
        <div className="card">
          <h2>Growing Stages</h2>
          <div className="stages-timeline">
            {stages.map((stage, index) => (
              <div key={stage.id} className="stage-item">
                <div className="stage-number">{stage.stageNumber}</div>
                <div className="stage-content">
                  <h3>{stage.stageName}</h3>
                  <p><strong>Duration:</strong> {stage.durationDays} days</p>
                  <p><strong>Activities:</strong> {stage.activities}</p>
                  {stage.pesticidesUsed && (
                    <p><strong>Pesticides:</strong> {stage.pesticidesUsed}</p>
                  )}
                  {stage.fertilizersUsed && (
                    <p><strong>Fertilizers:</strong> {stage.fertilizersUsed}</p>
                  )}
                  {stage.wateringSchedule && (
                    <p><strong>Watering:</strong> {stage.wateringSchedule}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="card">
          <h2>Farmer Experiences</h2>
          {experiences.map(exp => (
            <div key={exp.id} className="experience-item">
              <h3>{exp.title}</h3>
              <p className="experience-meta">
                {exp.yearsGrowing} years experience • {exp.region} • 
                Average Yield: {exp.averageYield} kg/acre
              </p>
              <p>{exp.experienceText}</p>
              {exp.tipsAndTricks && (
                <div className="tips-section">
                  <strong>Tips & Tricks:</strong>
                  <p>{exp.tipsAndTricks}</p>
                </div>
              )}
              <button 
                onClick={() => handleMarkHelpful(exp.id)}
                className="btn btn-secondary btn-sm"
              >
                👍 Helpful ({exp.helpfulCount})
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CropDetails;
