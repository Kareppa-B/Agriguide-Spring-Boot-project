// src/components/WorkerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workerService, equipmentService, experienceService, cropService } from '../services/api';
import authService from '../services/authService';
import './WorkerDashboard.css';

function WorkerDashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getStoredUser();

  // Active tab state
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'equipment' | 'experiences' | 'community'

  // Worker Listing state (One listing per worker)
  const [workerProfile, setWorkerProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    workerName: '',
    phoneNumber: '',
    skillSet: '',
    experienceYears: '',
    region: '',
    specificLocation: '',
    dailyRate: '',
    hourlyRate: '',
    availability: 'AVAILABLE',
    description: ''
  });

  // Equipment state
  const [myEquipment, setMyEquipment] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({
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

  // Experience state
  const [myExperiences, setMyExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [cropsList, setCropsList] = useState([]);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState(null);
  const [experienceForm, setExperienceForm] = useState({
    cropId: '',
    title: '',
    challengesFaced: '',
    solutionsApplied: '',
    lessonsLearned: '',
    season: 'KHARIF',
    yieldObtained: ''
  });

  // Community Workers state
  const [communityWorkers, setCommunityWorkers] = useState([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [communityRegion, setCommunityRegion] = useState('');
  const [communitySkill, setCommunitySkill] = useState('');

  // Alerts
  const [alertMsg, setAlertMsg] = useState(null); // { type: 'success' | 'error' | 'info', text: '' }

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadWorkerProfile();
    loadEquipment();
    loadExperiences();
    loadCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- PROFILE / LISTING METHODS ---
  const loadWorkerProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await workerService.getMyProfile();
      if (res.data) {
        setWorkerProfile(res.data);
        setProfileForm({
          workerName: res.data.workerName || '',
          phoneNumber: res.data.phoneNumber || '',
          skillSet: res.data.skillSet || '',
          experienceYears: res.data.experienceYears ?? '',
          region: res.data.region || '',
          specificLocation: res.data.specificLocation || '',
          dailyRate: res.data.dailyRate ?? '',
          hourlyRate: res.data.hourlyRate ?? '',
          availability: res.data.availability || 'AVAILABLE',
          description: res.data.description || ''
        });
      } else {
        setWorkerProfile(null);
      }
    } catch (err) {
      if (err.response && err.response.status === 404) {
        setWorkerProfile(null);
      } else {
        console.error('Failed to load worker profile:', err);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const handleProfileFormChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      if (workerProfile) {
        // Update existing listing
        const res = await workerService.updateMyProfile(profileForm);
        setWorkerProfile(res.data);
        showAlert('success', 'Worker profile listing updated successfully!');
        setShowEditProfileModal(false);
      } else {
        // Create new listing
        const res = await workerService.createWorkerListing(profileForm);
        setWorkerProfile(res.data);
        showAlert('success', 'Worker profile listing created successfully!');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.message || 'Error saving listing';
      showAlert('error', msg);
    }
  };

  const handleToggleAvailability = async () => {
    if (!workerProfile) return;
    const nextStatus = workerProfile.availability === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    try {
      const res = await workerService.updateMyAvailability(nextStatus);
      setWorkerProfile(res.data);
      showAlert('success', `Status updated to ${nextStatus}`);
    } catch (err) {
      showAlert('error', 'Failed to update availability status.');
    }
  };

  const handleDeleteProfile = async () => {
    if (!window.confirm('Are you sure you want to delete your worker listing? This cannot be undone.')) {
      return;
    }
    try {
      await workerService.deleteMyProfile();
      setWorkerProfile(null);
      setProfileForm({
        workerName: '',
        phoneNumber: '',
        skillSet: '',
        experienceYears: '',
        region: '',
        specificLocation: '',
        dailyRate: '',
        hourlyRate: '',
        availability: 'AVAILABLE',
        description: ''
      });
      showAlert('success', 'Worker listing deleted. You may create a new one anytime.');
    } catch (err) {
      showAlert('error', 'Failed to delete worker profile.');
    }
  };

  // --- EQUIPMENT METHODS ---
  const loadEquipment = async () => {
    setEquipmentLoading(true);
    try {
      const res = await equipmentService.getMyEquipment();
      setMyEquipment(res.data || []);
    } catch (err) {
      console.error('Failed to load my equipment:', err);
    } finally {
      setEquipmentLoading(false);
    }
  };

  const openNewEquipmentModal = () => {
    setEditingEquipmentId(null);
    setEquipmentForm({
      equipmentName: '',
      equipmentType: '',
      brand: '',
      model: '',
      description: '',
      region: currentUser?.region || '',
      specificLocation: currentUser?.location || '',
      phoneNumber: currentUser?.phoneNumber || '',
      availability: 'AVAILABLE',
      dailyRentalCost: '',
      hourlyRentalCost: '',
      condition: 'GOOD'
    });
    setShowEquipmentModal(true);
  };

  const openEditEquipmentModal = (item) => {
    setEditingEquipmentId(item.id);
    setEquipmentForm({
      equipmentName: item.equipmentName || '',
      equipmentType: item.equipmentType || '',
      brand: item.brand || '',
      model: item.model || '',
      description: item.description || '',
      region: item.region || '',
      specificLocation: item.specificLocation || '',
      phoneNumber: item.phoneNumber || '',
      availability: item.availability || 'AVAILABLE',
      dailyRentalCost: item.dailyRentalCost ?? '',
      hourlyRentalCost: item.hourlyRentalCost ?? '',
      condition: item.condition || 'GOOD'
    });
    setShowEquipmentModal(true);
  };

  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    try {
      if (editingEquipmentId) {
        await equipmentService.updateEquipmentListing(editingEquipmentId, equipmentForm);
        showAlert('success', 'Equipment listing updated successfully!');
      } else {
        await equipmentService.createEquipmentListing(equipmentForm);
        showAlert('success', 'Equipment listing created successfully!');
      }
      setShowEquipmentModal(false);
      loadEquipment();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save equipment listing.');
    }
  };

  const handleToggleEquipmentAvailability = async (id, currentAvail) => {
    const nextAvail = currentAvail === 'AVAILABLE' ? 'RENTED' : 'AVAILABLE';
    try {
      await equipmentService.updateAvailability(id, nextAvail);
      showAlert('success', `Equipment availability set to ${nextAvail}`);
      loadEquipment();
    } catch (err) {
      showAlert('error', 'Failed to update equipment availability.');
    }
  };

  const handleToggleEquipmentStatus = async (id) => {
    try {
      await equipmentService.toggleStatus(id);
      showAlert('success', 'Equipment status toggled.');
      loadEquipment();
    } catch (err) {
      showAlert('error', 'Failed to toggle equipment status.');
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Delete this equipment listing?')) return;
    try {
      await equipmentService.deleteEquipmentListing(id);
      showAlert('success', 'Equipment listing deleted.');
      loadEquipment();
    } catch (err) {
      showAlert('error', 'Failed to delete equipment listing.');
    }
  };

  // --- EXPERIENCES METHODS ---
  const loadCrops = async () => {
    try {
      const res = await cropService.getAllCrops();
      setCropsList(res.data || []);
    } catch (err) {
      console.error('Failed to load crops:', err);
    }
  };

  const loadExperiences = async () => {
    setExperiencesLoading(true);
    try {
      const res = await experienceService.getMyExperiences();
      setMyExperiences(res.data || []);
    } catch (err) {
      console.error('Failed to load experiences:', err);
    } finally {
      setExperiencesLoading(false);
    }
  };

  const openNewExperienceModal = () => {
    setEditingExperienceId(null);
    setExperienceForm({
      cropId: cropsList.length > 0 ? cropsList[0].id : '',
      title: '',
      challengesFaced: '',
      solutionsApplied: '',
      lessonsLearned: '',
      season: 'KHARIF',
      yieldObtained: ''
    });
    setShowExperienceModal(true);
  };

  const openEditExperienceModal = (item) => {
    setEditingExperienceId(item.id);
    setExperienceForm({
      cropId: item.crop?.id || item.cropId || (cropsList.length > 0 ? cropsList[0].id : ''),
      title: item.title || '',
      challengesFaced: item.challengesFaced || '',
      solutionsApplied: item.solutionsApplied || '',
      lessonsLearned: item.lessonsLearned || '',
      season: item.season || 'KHARIF',
      yieldObtained: item.yieldObtained || ''
    });
    setShowExperienceModal(true);
  };

  const handleSaveExperience = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...experienceForm,
        crop: { id: parseInt(experienceForm.cropId) }
      };
      if (editingExperienceId) {
        await experienceService.updateExperience(editingExperienceId, payload);
        showAlert('success', 'Experience updated successfully!');
      } else {
        await experienceService.createExperience(payload);
        showAlert('success', 'Experience posted successfully!');
      }
      setShowExperienceModal(false);
      loadExperiences();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save experience.');
    }
  };

  const handleDeleteExperience = async (id) => {
    if (!window.confirm('Delete this experience?')) return;
    try {
      await experienceService.deleteExperience(id);
      showAlert('success', 'Experience deleted.');
      loadExperiences();
    } catch (err) {
      showAlert('error', 'Failed to delete experience.');
    }
  };

  // --- COMMUNITY WORKERS ---
  const loadCommunityWorkers = async () => {
    setCommunityLoading(true);
    try {
      let res;
      if (communityRegion) {
        res = await workerService.getWorkersByRegion(communityRegion);
      } else if (communitySkill) {
        res = await workerService.searchWorkers(communitySkill);
      } else {
        res = await workerService.getAllWorkers();
      }
      setCommunityWorkers(res.data || []);
    } catch (err) {
      console.error('Failed to load community workers:', err);
    } finally {
      setCommunityLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'community') {
      loadCommunityWorkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="dashboard-container">
      {/* Header Banner */}
      <div className="dashboard-header">
        <div className="dashboard-header-info">
          <div className="dashboard-avatar">
            {currentUser?.fullName?.charAt(0)?.toUpperCase() || 'W'}
          </div>
          <div className="dashboard-title">
            <h1>{currentUser?.fullName || 'Worker Dashboard'}</h1>
            <p>@{currentUser?.username} &bull; {currentUser?.region || 'Registered Region'}</p>
            <span className="role-tag">Worker Portal</span>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-chip">
            <span className="stat-value">{workerProfile ? '1' : '0'}</span>
            <span className="stat-label">Active Listing</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{myEquipment.length}</span>
            <span className="stat-label">Equipment Items</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{myExperiences.length}</span>
            <span className="stat-label">Experiences</span>
          </div>
        </div>
      </div>

      {/* Global Alerts */}
      {alertMsg && (
        <div className={`alert-banner ${alertMsg.type}`}>
          <span>{alertMsg.text}</span>
          <button className="close-btn" onClick={() => setAlertMsg(null)}>&times;</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          👷 My Worker Profile
        </button>
        <button
          className={`tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          🚜 My Equipment ({myEquipment.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          🌱 My Experiences ({myExperiences.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          🔍 Community Directory
        </button>
      </div>

      {/* ================= TAB 1: WORKER PROFILE ================= */}
      {activeTab === 'profile' && (
        <div>
          <div className="section-header">
            <div>
              <h2>Worker Listing & Public Availability</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Your account is restricted to <strong>one listing</strong> at a time. Farmers view this profile to hire you.
              </p>
            </div>
          </div>

          {profileLoading ? (
            <div className="loading">Loading worker profile...</div>
          ) : workerProfile ? (
            <div className="profile-card-view">
              <div className="profile-card-top">
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#2e7d32' }}>{workerProfile.workerName}</h3>
                  <span style={{ color: '#666', fontSize: '0.9rem' }}>
                    📍 {workerProfile.specificLocation ? `${workerProfile.specificLocation}, ` : ''}{workerProfile.region}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#666' }}>Status:</span>
                  <button
                    className={`toggle-btn ${workerProfile.availability === 'AVAILABLE' ? 'available' : 'busy'}`}
                    onClick={handleToggleAvailability}
                    title="Click to toggle availability"
                  >
                    ● {workerProfile.availability === 'AVAILABLE' ? 'Available for Hire' : 'Currently Busy'}
                  </button>
                </div>
              </div>

              <div className="profile-card-body">
                <div className="info-grid">
                  <div className="info-field">
                    <label>Phone Number</label>
                    <p>{workerProfile.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div className="info-field">
                    <label>Experience</label>
                    <p>{workerProfile.experienceYears} Years</p>
                  </div>
                  <div className="info-field">
                    <label>Skills & Specializations</label>
                    <div className="skills-tags">
                      {workerProfile.skillSet ? (
                        workerProfile.skillSet.split(',').map((skill, i) => (
                          <span key={i} className="skill-tag">{skill.trim()}</span>
                        ))
                      ) : (
                        <span>General Labor</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="rates-box">
                  <div className="rate-col">
                    <span>Daily Rate</span>
                    <strong>₹{workerProfile.dailyRate || 0}</strong> / day
                  </div>
                  <div className="rate-col">
                    <span>Hourly Rate</span>
                    <strong>₹{workerProfile.hourlyRate || 0}</strong> / hour
                  </div>
                </div>

                {workerProfile.description && (
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#777', fontWeight: 700 }}>
                      Bio & Work Description
                    </label>
                    <p style={{ margin: '0.3rem 0 0', color: '#444', lineHeight: 1.6 }}>
                      {workerProfile.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="profile-actions">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowEditProfileModal(true)}
                >
                  ✏️ Edit Profile Listing
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteProfile}
                >
                  🗑️ Delete Listing
                </button>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="empty-state" style={{ margin: '0 0 2rem 0' }}>
                <div className="empty-state-icon">📋</div>
                <h3>Create Your Worker Profile</h3>
                <p>
                  You haven’t posted a worker listing yet. Fill out the form below to become discoverable to farmers seeking agricultural labor.
                </p>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="form-group">
                  <label>Full Display Name *</label>
                  <input
                    type="text"
                    name="workerName"
                    value={profileForm.workerName}
                    onChange={handleProfileFormChange}
                    required
                    placeholder="e.g., Harjit Singh"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Contact Phone Number *</label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={profileForm.phoneNumber}
                      onChange={handleProfileFormChange}
                      required
                      placeholder="e.g., +91 9876543210"
                    />
                  </div>
                  <div className="form-group">
                    <label>Years of Experience *</label>
                    <input
                      type="number"
                      name="experienceYears"
                      value={profileForm.experienceYears}
                      onChange={handleProfileFormChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Region / State *</label>
                    <input
                      type="text"
                      name="region"
                      value={profileForm.region}
                      onChange={handleProfileFormChange}
                      required
                      placeholder="e.g., Punjab"
                    />
                  </div>
                  <div className="form-group">
                    <label>Specific Location / Village</label>
                    <input
                      type="text"
                      name="specificLocation"
                      value={profileForm.specificLocation}
                      onChange={handleProfileFormChange}
                      placeholder="e.g., Ludhiana District"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Skills & Capabilities (comma separated) *</label>
                  <input
                    type="text"
                    name="skillSet"
                    value={profileForm.skillSet}
                    onChange={handleProfileFormChange}
                    required
                    placeholder="e.g., Harvesting, Tractor Driving, Irrigation, Pruning"
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Daily Rate (₹)</label>
                    <input
                      type="number"
                      name="dailyRate"
                      value={profileForm.dailyRate}
                      onChange={handleProfileFormChange}
                      min="0"
                      placeholder="600"
                    />
                  </div>
                  <div className="form-group">
                    <label>Hourly Rate (₹)</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={profileForm.hourlyRate}
                      onChange={handleProfileFormChange}
                      min="0"
                      placeholder="90"
                    />
                  </div>
                  <div className="form-group">
                    <label>Initial Availability</label>
                    <select
                      name="availability"
                      value={profileForm.availability}
                      onChange={handleProfileFormChange}
                    >
                      <option value="AVAILABLE">AVAILABLE</option>
                      <option value="BUSY">BUSY</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Work Description / Bio</label>
                  <textarea
                    name="description"
                    value={profileForm.description}
                    onChange={handleProfileFormChange}
                    placeholder="Describe your farming strengths, availability schedules, equipment handling skills..."
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Create Worker Profile Listing
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Edit Profile Listing Modal */}
      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Worker Profile Listing</h3>
              <button className="close-btn" onClick={() => setShowEditProfileModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label>Display Name *</label>
                <input
                  type="text"
                  name="workerName"
                  value={profileForm.workerName}
                  onChange={handleProfileFormChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={profileForm.phoneNumber}
                    onChange={handleProfileFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Experience (Years)</label>
                  <input
                    type="number"
                    name="experienceYears"
                    value={profileForm.experienceYears}
                    onChange={handleProfileFormChange}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Region *</label>
                  <input
                    type="text"
                    name="region"
                    value={profileForm.region}
                    onChange={handleProfileFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specific Location</label>
                  <input
                    type="text"
                    name="specificLocation"
                    value={profileForm.specificLocation}
                    onChange={handleProfileFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Skill Set (comma separated) *</label>
                <input
                  type="text"
                  name="skillSet"
                  value={profileForm.skillSet}
                  onChange={handleProfileFormChange}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Daily Rate (₹)</label>
                  <input
                    type="number"
                    name="dailyRate"
                    value={profileForm.dailyRate}
                    onChange={handleProfileFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Hourly Rate (₹)</label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={profileForm.hourlyRate}
                    onChange={handleProfileFormChange}
                  />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select
                    name="availability"
                    value={profileForm.availability}
                    onChange={handleProfileFormChange}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={profileForm.description}
                  onChange={handleProfileFormChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditProfileModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: MY EQUIPMENT ================= */}
      {activeTab === 'equipment' && (
        <div>
          <div className="section-header">
            <div>
              <h2>My Equipment Listings</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Rent out your tractors, tillers, pumps, or harvesting gear to generate additional income.
              </p>
            </div>
            <button className="btn btn-primary" onClick={openNewEquipmentModal}>
              + Post Equipment
            </button>
          </div>

          {equipmentLoading ? (
            <div className="loading">Loading equipment...</div>
          ) : myEquipment.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚜</div>
              <h3>No Equipment Listed Yet</h3>
              <p>You haven't posted any equipment for rent yet. Click below to add your first machine or tool.</p>
              <button className="btn btn-primary" onClick={openNewEquipmentModal}>
                Post Equipment Now
              </button>
            </div>
          ) : (
            <div className="items-grid">
              {myEquipment.map((item) => (
                <div key={item.id} className="item-card">
                  <div>
                    <div className="item-card-header">
                      <h4>{item.equipmentName}</h4>
                      <span className={`status-badge ${item.availability?.toLowerCase()}`}>
                        {item.availability}
                      </span>
                    </div>

                    <div className="item-card-body">
                      <p><strong>Type:</strong> {item.equipmentType} {item.brand ? `(${item.brand})` : ''}</p>
                      <p><strong>Location:</strong> {item.specificLocation ? `${item.specificLocation}, ` : ''}{item.region}</p>
                      <p><strong>Condition:</strong> {item.condition}</p>
                      <p><strong>Rate:</strong> ₹{item.dailyRentalCost}/day &bull; ₹{item.hourlyRentalCost}/hr</p>
                      {item.description && <p style={{ fontStyle: 'italic', marginTop: '0.5rem' }}>"{item.description}"</p>}
                    </div>
                  </div>

                  <div className="item-card-footer">
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button
                        className="btn-sm toggle-btn"
                        style={{
                          background: item.availability === 'AVAILABLE' ? '#fff3e0' : '#e8f5e9',
                          color: item.availability === 'AVAILABLE' ? '#e65100' : '#2e7d32'
                        }}
                        onClick={() => handleToggleEquipmentAvailability(item.id, item.availability)}
                      >
                        {item.availability === 'AVAILABLE' ? 'Mark Rented' : 'Mark Available'}
                      </button>
                      <button
                        className="btn-sm toggle-btn"
                        style={{
                          background: item.isActive ? '#ffebee' : '#e8f5e9',
                          color: item.isActive ? '#c62828' : '#2e7d32'
                        }}
                        onClick={() => handleToggleEquipmentStatus(item.id)}
                      >
                        {item.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-sm btn-secondary" onClick={() => openEditEquipmentModal(item)}>
                        Edit
                      </button>
                      <button className="btn-sm btn-danger" onClick={() => handleDeleteEquipment(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Equipment Add/Edit Modal */}
      {showEquipmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingEquipmentId ? 'Edit Equipment' : 'Post Equipment for Rent'}</h3>
              <button className="close-btn" onClick={() => setShowEquipmentModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveEquipment}>
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  name="equipmentName"
                  value={equipmentForm.equipmentName}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentName: e.target.value })}
                  required
                  placeholder="e.g., John Deere 5050D Tractor"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Equipment Type *</label>
                  <input
                    type="text"
                    name="equipmentType"
                    value={equipmentForm.equipmentType}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentType: e.target.value })}
                    required
                    placeholder="e.g., Tractor, Harvester, Seeder"
                  />
                </div>
                <div className="form-group">
                  <label>Brand / Manufacturer</label>
                  <input
                    type="text"
                    name="brand"
                    value={equipmentForm.brand}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, brand: e.target.value })}
                    placeholder="e.g., Mahindra"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Daily Rental Cost (₹) *</label>
                  <input
                    type="number"
                    name="dailyRentalCost"
                    value={equipmentForm.dailyRentalCost}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, dailyRentalCost: e.target.value })}
                    required
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label>Hourly Rental Cost (₹)</label>
                  <input
                    type="number"
                    name="hourlyRentalCost"
                    value={equipmentForm.hourlyRentalCost}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, hourlyRentalCost: e.target.value })}
                    min="0"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Region *</label>
                  <input
                    type="text"
                    name="region"
                    value={equipmentForm.region}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, region: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Condition</label>
                  <select
                    name="condition"
                    value={equipmentForm.condition}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, condition: e.target.value })}
                  >
                    <option value="EXCELLENT">EXCELLENT</option>
                    <option value="GOOD">GOOD</option>
                    <option value="FAIR">FAIR</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description & Features</label>
                <textarea
                  name="description"
                  value={equipmentForm.description}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
                  placeholder="Detail fuel terms, attachments included, transport arrangement..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowEquipmentModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingEquipmentId ? 'Save Changes' : 'Post Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: MY EXPERIENCES ================= */}
      {activeTab === 'experiences' && (
        <div>
          <div className="section-header">
            <div>
              <h2>My Cultivation Experiences</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Share your field observations, techniques, and crop tips with the AgriGuide farming community.
              </p>
            </div>
            <button className="btn btn-primary" onClick={openNewExperienceModal}>
              + Share Experience
            </button>
          </div>

          {experiencesLoading ? (
            <div className="loading">Loading experiences...</div>
          ) : myExperiences.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <h3>No Experiences Shared Yet</h3>
              <p>Contribute to community knowledge by sharing your successes and challenges with various crops.</p>
              <button className="btn btn-primary" onClick={openNewExperienceModal}>
                Share Your First Experience
              </button>
            </div>
          ) : (
            <div className="items-grid">
              {myExperiences.map((item) => (
                <div key={item.id} className="item-card">
                  <div>
                    <div className="item-card-header">
                      <h4>{item.title}</h4>
                      {item.isVerified ? (
                        <span className="status-badge available" title="Verified by Agronomist">✓ Verified</span>
                      ) : (
                        <span className="status-badge busy">Community Post</span>
                      )}
                    </div>

                    <div className="item-card-body">
                      <p><strong>Crop:</strong> {item.crop?.cropName || item.cropName || 'General'}</p>
                      <p><strong>Season:</strong> {item.season}</p>
                      {item.yieldObtained && <p><strong>Yield:</strong> {item.yieldObtained}</p>}
                      <p><strong>Helpful Votes:</strong> 👍 {item.helpfulCount || 0}</p>

                      {item.challengesFaced && (
                        <p style={{ marginTop: '0.5rem' }}>
                          <strong>Challenge:</strong> {item.challengesFaced}
                        </p>
                      )}
                      {item.solutionsApplied && (
                        <p>
                          <strong>Solution:</strong> {item.solutionsApplied}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="item-card-footer">
                    <span style={{ fontSize: '0.8rem', color: '#888' }}>
                      {item.createdDate ? new Date(item.createdDate).toLocaleDateString() : ''}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-sm btn-secondary" onClick={() => openEditExperienceModal(item)}>
                        Edit
                      </button>
                      <button className="btn-sm btn-danger" onClick={() => handleDeleteExperience(item.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience Add/Edit Modal */}
      {showExperienceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingExperienceId ? 'Edit Experience' : 'Share Cultivation Experience'}</h3>
              <button className="close-btn" onClick={() => setShowExperienceModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveExperience}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={experienceForm.title}
                  onChange={(e) => setExperienceForm({ ...experienceForm, title: e.target.value })}
                  required
                  placeholder="e.g., Organic Pest Management in Basmati Rice"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Target Crop *</label>
                  <select
                    name="cropId"
                    value={experienceForm.cropId}
                    onChange={(e) => setExperienceForm({ ...experienceForm, cropId: e.target.value })}
                    required
                  >
                    <option value="">Select a crop</option>
                    {cropsList.map((crop) => (
                      <option key={crop.id} value={crop.id}>
                        {crop.cropName} ({crop.cropType || 'Crop'})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Season</label>
                  <select
                    name="season"
                    value={experienceForm.season}
                    onChange={(e) => setExperienceForm({ ...experienceForm, season: e.target.value })}
                  >
                    <option value="KHARIF">KHARIF</option>
                    <option value="RABI">RABI</option>
                    <option value="ZAID">ZAID</option>
                    <option value="YEAR_ROUND">YEAR ROUND</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Yield Obtained (e.g., 25 Quintals/Acre)</label>
                <input
                  type="text"
                  name="yieldObtained"
                  value={experienceForm.yieldObtained}
                  onChange={(e) => setExperienceForm({ ...experienceForm, yieldObtained: e.target.value })}
                  placeholder="e.g., 28 Quintals/Acre"
                />
              </div>

              <div className="form-group">
                <label>Challenges Faced</label>
                <textarea
                  name="challengesFaced"
                  value={experienceForm.challengesFaced}
                  onChange={(e) => setExperienceForm({ ...experienceForm, challengesFaced: e.target.value })}
                  placeholder="What difficulties did you encounter (pests, water, soil issues)..."
                />
              </div>

              <div className="form-group">
                <label>Solutions Applied</label>
                <textarea
                  name="solutionsApplied"
                  value={experienceForm.solutionsApplied}
                  onChange={(e) => setExperienceForm({ ...experienceForm, solutionsApplied: e.target.value })}
                  placeholder="How did you resolve them..."
                />
              </div>

              <div className="form-group">
                <label>Lessons Learned / Advice to Others</label>
                <textarea
                  name="lessonsLearned"
                  value={experienceForm.lessonsLearned}
                  onChange={(e) => setExperienceForm({ ...experienceForm, lessonsLearned: e.target.value })}
                  placeholder="Key takeaways for other farmers and workers..."
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowExperienceModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingExperienceId ? 'Save Changes' : 'Share Experience'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 4: COMMUNITY WORKERS ================= */}
      {activeTab === 'community' && (
        <div>
          <div className="section-header">
            <div>
              <h2>Agricultural Workers Directory</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Explore listings from other agricultural workers in your area to benchmark rates and skills.
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Filter by region (e.g. Punjab)..."
                value={communityRegion}
                onChange={(e) => setCommunityRegion(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Filter by skill (e.g. Harvesting)..."
                value={communitySkill}
                onChange={(e) => setCommunitySkill(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button className="btn btn-primary" onClick={loadCommunityWorkers}>
                Search
              </button>
            </div>
          </div>

          {communityLoading ? (
            <div className="loading">Searching community workers...</div>
          ) : communityWorkers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👥</div>
              <h3>No Workers Found</h3>
              <p>No other worker listings match the selected search criteria.</p>
            </div>
          ) : (
            <div className="items-grid">
              {communityWorkers.map((w) => (
                <div key={w.id} className="item-card">
                  <div>
                    <div className="item-card-header">
                      <h4>{w.workerName}</h4>
                      <span className={`status-badge ${w.availability?.toLowerCase()}`}>
                        {w.availability}
                      </span>
                    </div>

                    <div className="item-card-body">
                      <p><strong>Region:</strong> {w.specificLocation ? `${w.specificLocation}, ` : ''}{w.region}</p>
                      <p><strong>Skills:</strong> {w.skillSet}</p>
                      <p><strong>Experience:</strong> {w.experienceYears} Years</p>
                      <p><strong>Rates:</strong> ₹{w.dailyRate}/day &bull; ₹{w.hourlyRate}/hr</p>
                    </div>
                  </div>

                  <div className="item-card-footer">
                    <span style={{ color: '#2e7d32', fontWeight: 600 }}>📞 {w.phoneNumber}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WorkerDashboard;
