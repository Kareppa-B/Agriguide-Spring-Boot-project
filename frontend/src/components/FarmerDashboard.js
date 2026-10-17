// src/components/FarmerDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService, equipmentService, experienceService, cropService, workerService } from '../services/api';
import authService from '../services/authService';
import './FarmerDashboard.css';
import './WorkerDashboard.css'; // Reuses shared modal, grid, and banner styles

function FarmerDashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getStoredUser();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'equipment' | 'experiences' | 'workers'

  // Farmer User Profile State
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    phoneNumber: '',
    region: '',
    location: '',
    yearsOfExperience: 0,
    specialization: ''
  });

  // Password Change State
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordMsg, setPasswordMsg] = useState(null);

  // Equipment State
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

  // Experiences State
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

  // Workers Directory for Hiring
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workerRegion, setWorkerRegion] = useState('');
  const [workerSkill, setWorkerSkill] = useState('');

  // Alerts
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    loadProfile();
    loadEquipment();
    loadExperiences();
    loadCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- PROFILE METHODS ---
  const loadProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await userService.getMyProfile();
      setProfile(res.data);
      setProfileForm({
        fullName: res.data.fullName || '',
        phoneNumber: res.data.phoneNumber || '',
        region: res.data.region || '',
        location: res.data.location || '',
        yearsOfExperience: res.data.yearsOfExperience ?? 0,
        specialization: res.data.specialization || ''
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateMyProfile(profileForm);
      setProfile(res.data);
      showAlert('success', 'Profile updated successfully!');
      setShowEditProfileModal(false);
      // Update stored user if name changed
      const stored = authService.getStoredUser();
      if (stored) {
        authService.storeUser({ ...stored, fullName: res.data.fullName });
      }
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg(null);
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    try {
      const res = await authService.changePassword(
        profile.id,
        passwordData.oldPassword,
        passwordData.newPassword
      );
      if (res.data.success) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordSection(false);
      } else {
        setPasswordMsg({ type: 'error', text: res.data.message });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: 'Failed to change password. Check old password.' });
    }
  };

  // --- EQUIPMENT METHODS ---
  const loadEquipment = async () => {
    setEquipmentLoading(true);
    try {
      const res = await equipmentService.getMyEquipment();
      setMyEquipment(res.data || []);
    } catch (err) {
      console.error('Failed to load equipment:', err);
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
      region: profile?.region || '',
      specificLocation: profile?.location || '',
      phoneNumber: profile?.phoneNumber || '',
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
      showAlert('error', err.response?.data?.message || 'Failed to save equipment.');
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
      showAlert('error', 'Failed to toggle status.');
    }
  };

  const handleDeleteEquipment = async (id) => {
    if (!window.confirm('Delete this equipment listing?')) return;
    try {
      await equipmentService.deleteEquipmentListing(id);
      showAlert('success', 'Equipment listing deleted.');
      loadEquipment();
    } catch (err) {
      showAlert('error', 'Failed to delete equipment.');
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

  // --- WORKERS (HIRE) METHODS ---
  const loadWorkers = async () => {
    setWorkersLoading(true);
    try {
      let res;
      if (workerRegion) {
        res = await workerService.getWorkersByRegion(workerRegion);
      } else if (workerSkill) {
        res = await workerService.searchWorkers(workerSkill);
      } else {
        res = await workerService.getAllWorkers();
      }
      setWorkers(res.data || []);
    } catch (err) {
      console.error('Failed to load workers:', err);
    } finally {
      setWorkersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'workers') {
      loadWorkers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  return (
    <div className="farmer-dashboard-container">
      {/* Farmer Header */}
      <div className="farmer-header">
        <div className="farmer-header-info">
          <div className="farmer-avatar">
            {profile?.fullName?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div className="farmer-title">
            <h1>{profile?.fullName || 'Farmer Dashboard'}</h1>
            <p>@{profile?.username} &bull; {profile?.region || 'Registered Region'}</p>
            {profile && (
              <div>
                {profile.farmerVerificationStatus === 'APPROVED' ? (
                  <span className="verification-badge approved">
                    ✓ Verified Farmer
                  </span>
                ) : profile.farmerVerificationStatus === 'REJECTED' ? (
                  <span className="verification-badge rejected">
                    ✕ Verification Rejected
                  </span>
                ) : (
                  <span className="verification-badge pending">
                    ⏳ Verification Pending
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-chip">
            <span className="stat-value">{myEquipment.length}</span>
            <span className="stat-label">Equipment Items</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{myExperiences.length}</span>
            <span className="stat-label">Experiences</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{profile?.yearsOfExperience || 0}</span>
            <span className="stat-label">Years Farming</span>
          </div>
        </div>
      </div>

      {/* Global Alert */}
      {alertMsg && (
        <div className={`alert-banner ${alertMsg.type}`}>
          <span>{alertMsg.text}</span>
          <button className="close-btn" onClick={() => setAlertMsg(null)}>&times;</button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="farmer-tabs">
        <button
          className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          🌾 Farmer Profile & Verification
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
          className={`tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          👷 Hire Workers
        </button>
      </div>

      {/* ================= TAB 1: FARMER PROFILE ================= */}
      {activeTab === 'profile' && (
        <div>
          {profileLoading ? (
            <div className="loading">Loading profile...</div>
          ) : profile ? (
            <div>
              {/* Verification Callout */}
              {profile.farmerVerificationStatus === 'APPROVED' && (
                <div className="verification-callout approved">
                  <span style={{ fontSize: '1.8rem' }}>🎖️</span>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0' }}>AgriGuide Verified Farmer</h4>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      Your credentials and farming experience have been verified by AgriGuide agronomists.
                    </p>
                  </div>
                </div>
              )}

              {profile.farmerVerificationStatus === 'PENDING' && (
                <div className="verification-callout pending">
                  <span style={{ fontSize: '1.8rem' }}>⏳</span>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0' }}>Verification Under Review</h4>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      Your farming details are pending administrative verification. Verified status helps your posts and equipment gain higher trust.
                    </p>
                  </div>
                </div>
              )}

              {profile.farmerVerificationStatus === 'REJECTED' && (
                <div className="verification-callout rejected">
                  <span style={{ fontSize: '1.8rem' }}>⚠️</span>
                  <div>
                    <h4 style={{ margin: '0 0 0.2rem 0' }}>Verification Not Approved</h4>
                    <p style={{ margin: 0, fontSize: '0.92rem' }}>
                      Your verification request was rejected. Please review and update your experience details or reach out to support.
                    </p>
                  </div>
                </div>
              )}

              <div className="profile-overview-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                  <h3 style={{ margin: 0, color: '#2e7d32' }}>Farming Profile Details</h3>
                  <button className="btn btn-secondary" onClick={() => setShowEditProfileModal(true)}>
                    ✏️ Edit Profile
                  </button>
                </div>

                <div className="profile-details-grid">
                  <div className="profile-field">
                    <label>Full Name</label>
                    <p>{profile.fullName || 'Not provided'}</p>
                  </div>
                  <div className="profile-field">
                    <label>Username</label>
                    <p>@{profile.username}</p>
                  </div>
                  <div className="profile-field">
                    <label>Email Address</label>
                    <p>{profile.email || 'Not provided'}</p>
                  </div>
                  <div className="profile-field">
                    <label>Contact Phone</label>
                    <p>{profile.phoneNumber || 'Not provided'}</p>
                  </div>
                  <div className="profile-field">
                    <label>Region / State</label>
                    <p>{profile.region || 'Not provided'}</p>
                  </div>
                  <div className="profile-field">
                    <label>Location / Village</label>
                    <p>{profile.location || 'Not provided'}</p>
                  </div>
                  <div className="profile-field">
                    <label>Experience</label>
                    <p>{profile.yearsOfExperience || 0} Years</p>
                  </div>
                  <div className="profile-field">
                    <label>Specialization</label>
                    <p>{profile.specialization || 'General Cultivation'}</p>
                  </div>
                </div>
              </div>

              {/* Password Change Card */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0 0 0.3rem 0', color: '#333' }}>Account Security</h3>
                    <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>Update your password to keep your account safe.</p>
                  </div>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowPasswordSection(!showPasswordSection)}
                  >
                    {showPasswordSection ? 'Hide' : 'Change Password'}
                  </button>
                </div>

                {passwordMsg && (
                  <div className={`alert-banner ${passwordMsg.type}`} style={{ marginTop: '1rem' }}>
                    <span>{passwordMsg.text}</span>
                  </div>
                )}

                {showPasswordSection && (
                  <form onSubmit={handleChangePassword} style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                    <div className="form-group">
                      <label>Current Password *</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                        required
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                        <label>New Password * (min 6 chars)</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          required
                          minLength="6"
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password *</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          required
                          minLength="6"
                        />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary">
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Farmer Profile</h3>
              <button className="close-btn" onClick={() => setShowEditProfileModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
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
                    onChange={(e) => setProfileForm({ ...profileForm, phoneNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Years of Experience</label>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={profileForm.yearsOfExperience}
                    onChange={(e) => setProfileForm({ ...profileForm, yearsOfExperience: parseInt(e.target.value) || 0 })}
                    min="0"
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
                    onChange={(e) => setProfileForm({ ...profileForm, region: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Location / Village</label>
                  <input
                    type="text"
                    name="location"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Specialization (e.g. Paddy cultivation, Horticulture)</label>
                <input
                  type="text"
                  name="specialization"
                  value={profileForm.specialization}
                  onChange={(e) => setProfileForm({ ...profileForm, specialization: e.target.value })}
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
              <h2>My Farm Machinery & Equipment</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Manage your equipment, rent out tools to other farmers, and update availability status.
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
              <h3>No Farm Equipment Listed</h3>
              <p>Rent out your tractors, sprayers, harvesters or tillers to neighboring farmers.</p>
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
                      <p><strong>Rent:</strong> ₹{item.dailyRentalCost}/day &bull; ₹{item.hourlyRentalCost}/hr</p>
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

      {/* Equipment Modal */}
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
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type *</label>
                  <input
                    type="text"
                    name="equipmentType"
                    value={equipmentForm.equipmentType}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentType: e.target.value })}
                    required
                    placeholder="e.g. Tractor, Rotavator"
                  />
                </div>
                <div className="form-group">
                  <label>Brand / Model</label>
                  <input
                    type="text"
                    name="brand"
                    value={equipmentForm.brand}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, brand: e.target.value })}
                    placeholder="e.g. Swaraj 744"
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
                <label>Description</label>
                <textarea
                  name="description"
                  value={equipmentForm.description}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, description: e.target.value })}
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
                Share your personal crop advice, soil preparation, pest solutions, and yield outcomes.
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
              <p>Share your agricultural knowledge and field insights with fellow farmers.</p>
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
                        <span className="status-badge available">✓ Verified</span>
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
                          <strong>Challenges:</strong> {item.challengesFaced}
                        </p>
                      )}
                      {item.solutionsApplied && (
                        <p>
                          <strong>Solutions:</strong> {item.solutionsApplied}
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

      {/* Experience Modal */}
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
                <label>Yield Obtained</label>
                <input
                  type="text"
                  name="yieldObtained"
                  value={experienceForm.yieldObtained}
                  onChange={(e) => setExperienceForm({ ...experienceForm, yieldObtained: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Challenges Faced</label>
                <textarea
                  name="challengesFaced"
                  value={experienceForm.challengesFaced}
                  onChange={(e) => setExperienceForm({ ...experienceForm, challengesFaced: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Solutions Applied</label>
                <textarea
                  name="solutionsApplied"
                  value={experienceForm.solutionsApplied}
                  onChange={(e) => setExperienceForm({ ...experienceForm, solutionsApplied: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Lessons Learned / Advice</label>
                <textarea
                  name="lessonsLearned"
                  value={experienceForm.lessonsLearned}
                  onChange={(e) => setExperienceForm({ ...experienceForm, lessonsLearned: e.target.value })}
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

      {/* ================= TAB 4: HIRE WORKERS ================= */}
      {activeTab === 'workers' && (
        <div>
          <div className="section-header">
            <div>
              <h2>Hire Agricultural Workers</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Directly connect with skilled farm laborers, tractor drivers, and harvest teams in your region.
              </p>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Filter by region (e.g. Punjab)..."
                value={workerRegion}
                onChange={(e) => setWorkerRegion(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <input
                type="text"
                placeholder="Search by skill (e.g. Tractor, Harvesting)..."
                value={workerSkill}
                onChange={(e) => setWorkerSkill(e.target.value)}
                style={{ flex: 1, minWidth: '200px', padding: '0.6rem 0.9rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button className="btn btn-primary" onClick={loadWorkers}>
                Filter
              </button>
            </div>
          </div>

          {workersLoading ? (
            <div className="loading">Searching available workers...</div>
          ) : workers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">👷</div>
              <h3>No Workers Found</h3>
              <p>No workers match your filter criteria at this time.</p>
            </div>
          ) : (
            <div className="items-grid">
              {workers.map((w) => (
                <div key={w.id} className="worker-hire-card">
                  <div>
                    <div className="worker-hire-header">
                      <div>
                        <h3>{w.workerName}</h3>
                        <span style={{ fontSize: '0.85rem', color: '#666' }}>
                          📍 {w.specificLocation ? `${w.specificLocation}, ` : ''}{w.region}
                        </span>
                      </div>
                      <span className={`status-badge ${w.availability?.toLowerCase()}`}>
                        {w.availability}
                      </span>
                    </div>

                    <p style={{ margin: '0.4rem 0' }}>
                      <strong>Skills:</strong> {w.skillSet}
                    </p>
                    <p style={{ margin: '0.4rem 0' }}>
                      <strong>Experience:</strong> {w.experienceYears} Years
                    </p>

                    <div className="worker-rates-banner">
                      <span><strong>₹{w.dailyRate || 0}</strong> / day</span>
                      <span><strong>₹{w.hourlyRate || 0}</strong> / hr</span>
                    </div>

                    {w.description && (
                      <p style={{ fontSize: '0.9rem', color: '#555', fontStyle: 'italic', margin: '0.5rem 0' }}>
                        "{w.description}"
                      </p>
                    )}
                  </div>

                  <div className="hire-actions">
                    <a href={`tel:${w.phoneNumber}`} className="phone-btn">
                      📞 Call Worker ({w.phoneNumber})
                    </a>
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

export default FarmerDashboard;
