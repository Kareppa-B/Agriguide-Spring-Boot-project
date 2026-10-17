// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService, cropService } from '../services/api';
import authService from '../services/authService';
import './AdminDashboard.css';
import './WorkerDashboard.css'; // Reuses modal and form styles

function AdminDashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getStoredUser();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'farmers' | 'workers' | 'equipment' | 'experiences' | 'crops'

  // Stats
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userForm, setUserForm] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: 'FARMER',
    region: '',
    location: '',
    isActive: true
  });

  // Farmer Verification
  const [farmers, setFarmers] = useState([]);
  const [farmerStatusFilter, setFarmerStatusFilter] = useState('');
  const [farmersLoading, setFarmersLoading] = useState(false);

  // Workers
  const [workers, setWorkers] = useState([]);
  const [workersLoading, setWorkersLoading] = useState(false);
  const [showEditWorkerModal, setShowEditWorkerModal] = useState(false);
  const [editingWorkerId, setEditingWorkerId] = useState(null);
  const [workerForm, setWorkerForm] = useState({
    workerName: '',
    phoneNumber: '',
    skillSet: '',
    experienceYears: '',
    region: '',
    specificLocation: '',
    dailyRate: '',
    hourlyRate: '',
    availability: 'AVAILABLE'
  });

  // Equipment
  const [equipmentList, setEquipmentList] = useState([]);
  const [equipmentLoading, setEquipmentLoading] = useState(false);
  const [showEditEquipmentModal, setShowEditEquipmentModal] = useState(false);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [equipmentForm, setEquipmentForm] = useState({
    equipmentName: '',
    equipmentType: '',
    brand: '',
    dailyRentalCost: '',
    hourlyRentalCost: '',
    region: '',
    availability: 'AVAILABLE',
    condition: 'GOOD'
  });

  // Experiences
  const [experiences, setExperiences] = useState([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);

  // Crops
  const [crops, setCrops] = useState([]);
  const [cropsLoading, setCropsLoading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropForm, setCropForm] = useState({
    cropName: '',
    scientificName: '',
    cropType: '',
    optimalSeason: 'Kharif',
    soilType: 'Loamy',
    waterRequirement: 'Medium',
    climate: 'Tropical',
    temperatureRange: '20-30°C',
    harvestDuration: '120 days',
    description: ''
  });

  // Alerts
  const [alertMsg, setAlertMsg] = useState(null);

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 5000);
  };

  useEffect(() => {
    if (!currentUser || currentUser.role !== 'ADMIN') {
      navigate('/login');
      return;
    }
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'overview') loadStats();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'farmers') loadFarmers();
    if (activeTab === 'workers') loadWorkers();
    if (activeTab === 'equipment') loadEquipment();
    if (activeTab === 'experiences') loadExperiences();
    if (activeTab === 'crops') loadCrops();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // --- STATS ---
  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const res = await adminService.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error loading admin stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  // --- USERS ---
  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const params = {};
      if (userRoleFilter) params.role = userRoleFilter;
      if (userSearchQuery) params.query = userSearchQuery;
      const res = await adminService.getUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleToggleUserStatus = async (id) => {
    try {
      await adminService.toggleUserStatus(id);
      showAlert('success', 'User account status toggled.');
      loadUsers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to toggle user status.');
    }
  };

  const openEditUser = (u) => {
    setEditingUserId(u.id);
    setUserForm({
      fullName: u.fullName || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      role: u.role || 'FARMER',
      region: u.region || '',
      location: u.location || '',
      isActive: u.isActive !== undefined ? u.isActive : true
    });
    setShowEditUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateUser(editingUserId, userForm);
      showAlert('success', 'User details updated.');
      setShowEditUserModal(false);
      loadUsers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;
    try {
      await adminService.deleteUser(id);
      showAlert('success', `User ${username} deleted safely.`);
      loadUsers();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete user.';
      showAlert('error', msg);
    }
  };

  // --- FARMERS VERIFICATION ---
  const loadFarmers = async () => {
    setFarmersLoading(true);
    try {
      const res = await adminService.getFarmers(farmerStatusFilter || null);
      setFarmers(res.data || []);
    } catch (err) {
      console.error('Error loading farmers:', err);
    } finally {
      setFarmersLoading(false);
    }
  };

  const handleVerifyFarmer = async (id, status) => {
    try {
      await adminService.verifyFarmer(id, status);
      showAlert('success', `Farmer verification status set to ${status}.`);
      loadFarmers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update farmer verification.');
    }
  };

  // --- WORKERS MODERATION ---
  const loadWorkers = async () => {
    setWorkersLoading(true);
    try {
      const res = await adminService.getWorkers();
      setWorkers(res.data || []);
    } catch (err) {
      console.error('Error loading workers:', err);
    } finally {
      setWorkersLoading(false);
    }
  };

  const handleToggleWorkerStatus = async (id) => {
    try {
      await adminService.toggleWorkerStatus(id);
      showAlert('success', 'Worker listing active status toggled.');
      loadWorkers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to toggle status.');
    }
  };

  const openEditWorker = (w) => {
    setEditingWorkerId(w.id);
    setWorkerForm({
      workerName: w.workerName || '',
      phoneNumber: w.phoneNumber || '',
      skillSet: w.skillSet || '',
      experienceYears: w.experienceYears ?? '',
      region: w.region || '',
      specificLocation: w.specificLocation || '',
      dailyRate: w.dailyRate ?? '',
      hourlyRate: w.hourlyRate ?? '',
      availability: w.availability || 'AVAILABLE'
    });
    setShowEditWorkerModal(true);
  };

  const handleSaveWorker = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateWorker(editingWorkerId, workerForm);
      showAlert('success', 'Worker listing updated.');
      setShowEditWorkerModal(false);
      loadWorkers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update worker.');
    }
  };

  const handleDeleteWorker = async (id, name) => {
    if (!window.confirm(`Delete worker listing for "${name}"?`)) return;
    try {
      await adminService.deleteWorker(id);
      showAlert('success', 'Worker listing deleted.');
      loadWorkers();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete worker.');
    }
  };

  // --- EQUIPMENT MODERATION ---
  const loadEquipment = async () => {
    setEquipmentLoading(true);
    try {
      const res = await adminService.getEquipment();
      setEquipmentList(res.data || []);
    } catch (err) {
      console.error('Error loading equipment:', err);
    } finally {
      setEquipmentLoading(false);
    }
  };

  const handleToggleEquipmentStatus = async (id) => {
    try {
      await adminService.toggleEquipmentStatus(id);
      showAlert('success', 'Equipment active status toggled.');
      loadEquipment();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to toggle equipment status.');
    }
  };

  const openEditEquipment = (item) => {
    setEditingEquipmentId(item.id);
    setEquipmentForm({
      equipmentName: item.equipmentName || '',
      equipmentType: item.equipmentType || '',
      brand: item.brand || '',
      dailyRentalCost: item.dailyRentalCost ?? '',
      hourlyRentalCost: item.hourlyRentalCost ?? '',
      region: item.region || '',
      availability: item.availability || 'AVAILABLE',
      condition: item.condition || 'GOOD'
    });
    setShowEditEquipmentModal(true);
  };

  const handleSaveEquipment = async (e) => {
    e.preventDefault();
    try {
      await adminService.updateEquipment(editingEquipmentId, equipmentForm);
      showAlert('success', 'Equipment listing updated.');
      setShowEditEquipmentModal(false);
      loadEquipment();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to update equipment.');
    }
  };

  const handleDeleteEquipment = async (id, name) => {
    if (!window.confirm(`Delete equipment listing "${name}"?`)) return;
    try {
      await adminService.deleteEquipment(id);
      showAlert('success', 'Equipment listing deleted.');
      loadEquipment();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  // --- EXPERIENCE MODERATION ---
  const loadExperiences = async () => {
    setExperiencesLoading(true);
    try {
      const res = await adminService.getExperiences();
      setExperiences(res.data || []);
    } catch (err) {
      console.error('Error loading experiences:', err);
    } finally {
      setExperiencesLoading(false);
    }
  };

  const handleToggleVerifyExperience = async (id, currentVerified) => {
    try {
      await adminService.verifyExperience(id, !currentVerified);
      showAlert('success', `Experience verified status changed to ${!currentVerified}.`);
      loadExperiences();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to toggle experience verification.');
    }
  };

  const handleDeleteExperience = async (id, title) => {
    if (!window.confirm(`Delete experience "${title}"?`)) return;
    try {
      await adminService.deleteExperience(id);
      showAlert('success', 'Experience deleted.');
      loadExperiences();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to delete experience.');
    }
  };

  // --- CROPS MANAGEMENT ---
  const loadCrops = async () => {
    setCropsLoading(true);
    try {
      const res = await cropService.getAllCrops();
      setCrops(res.data || []);
    } catch (err) {
      console.error('Error loading crops:', err);
    } finally {
      setCropsLoading(false);
    }
  };

  const openNewCrop = () => {
    setEditingCropId(null);
    setCropForm({
      cropName: '',
      scientificName: '',
      cropType: '',
      optimalSeason: 'Kharif',
      soilType: 'Loamy',
      waterRequirement: 'Medium',
      climate: 'Tropical',
      temperatureRange: '20-30°C',
      harvestDuration: '120 days',
      description: ''
    });
    setShowCropModal(true);
  };

  const openEditCrop = (c) => {
    setEditingCropId(c.id);
    setCropForm({
      cropName: c.cropName || '',
      scientificName: c.scientificName || '',
      cropType: c.cropType || '',
      optimalSeason: c.optimalSeason || 'Kharif',
      soilType: c.soilType || 'Loamy',
      waterRequirement: c.waterRequirement || 'Medium',
      climate: c.climate || 'Tropical',
      temperatureRange: c.temperatureRange || '',
      harvestDuration: c.harvestDuration || '',
      description: c.description || ''
    });
    setShowCropModal(true);
  };

  const handleSaveCrop = async (e) => {
    e.preventDefault();
    try {
      if (editingCropId) {
        await adminService.updateCrop(editingCropId, cropForm);
        showAlert('success', 'Crop updated successfully.');
      } else {
        await adminService.createCrop(cropForm);
        showAlert('success', 'Crop created successfully.');
      }
      setShowCropModal(false);
      loadCrops();
    } catch (err) {
      showAlert('error', err.response?.data?.message || 'Failed to save crop.');
    }
  };

  const handleDeleteCrop = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete crop "${name}"?`)) return;
    try {
      await adminService.deleteCrop(id);
      showAlert('success', `Crop "${name}" deleted.`);
      loadCrops();
    } catch (err) {
      // Handles the check preventing deletion if referenced by experiences
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to delete crop.';
      showAlert('error', msg);
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-info">
          <div className="admin-avatar">🛡️</div>
          <div className="admin-title">
            <h1>Admin Control Center</h1>
            <p>System Moderation, Farmer Verifications, User Roles & Platform Analytics</p>
            <span className="admin-badge">Administrator Privileges</span>
          </div>
        </div>

        <div className="dashboard-stats">
          <div className="stat-chip">
            <span className="stat-value">{stats ? stats.totalUsers : '-'}</span>
            <span className="stat-label">Users</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{stats ? stats.totalFarmers : '-'}</span>
            <span className="stat-label">Farmers</span>
          </div>
          <div className="stat-chip">
            <span className="stat-value">{stats ? stats.totalWorkers : '-'}</span>
            <span className="stat-label">Workers</span>
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

      {/* Admin Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'farmers' ? 'active' : ''}`}
          onClick={() => setActiveTab('farmers')}
        >
          🌾 Farmer Verifications
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'workers' ? 'active' : ''}`}
          onClick={() => setActiveTab('workers')}
        >
          👷 Worker Moderation
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'equipment' ? 'active' : ''}`}
          onClick={() => setActiveTab('equipment')}
        >
          🚜 Equipment Moderation
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          🌱 Experience Moderation
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'crops' ? 'active' : ''}`}
          onClick={() => setActiveTab('crops')}
        >
          🌾 Crops Directory
        </button>
      </div>

      {/* ================= TAB 1: OVERVIEW ================= */}
      {activeTab === 'overview' && (
        <div>
          <div className="section-header">
            <h2>Platform Metrics & Health</h2>
            <button className="btn btn-secondary btn-sm" onClick={loadStats}>
              🔄 Refresh Metrics
            </button>
          </div>

          {statsLoading || !stats ? (
            <div className="loading">Loading metrics...</div>
          ) : (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#1a237e' }}>👥</div>
                <div className="stat-data">
                  <h3>{stats.totalUsers}</h3>
                  <span>Total Users</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#2e7d32' }}>🌾</div>
                <div className="stat-data">
                  <h3>{stats.totalFarmers}</h3>
                  <span>Farmers Registered</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#e65100' }}>👷</div>
                <div className="stat-data">
                  <h3>{stats.totalWorkers}</h3>
                  <span>Workers Registered</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#00838f' }}>🚜</div>
                <div className="stat-data">
                  <h3>{stats.totalEquipment}</h3>
                  <span>Equipment Units</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#6a1b9a' }}>🌱</div>
                <div className="stat-data">
                  <h3>{stats.totalExperiences}</h3>
                  <span>Community Experiences</span>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: '#43a047' }}>🌿</div>
                <div className="stat-data">
                  <h3>{stats.totalCrops}</h3>
                  <span>Crop Catalog</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: USERS ================= */}
      {activeTab === 'users' && (
        <div>
          <div className="section-header">
            <h2>User Account Management</h2>
          </div>

          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search by name, username or email..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                style={{ flex: 1, minWidth: '220px', padding: '0.6rem 0.9rem', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                style={{ minWidth: '150px', padding: '0.6rem 0.9rem', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="">All Roles</option>
                <option value="FARMER">FARMER</option>
                <option value="WORKER">WORKER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button className="btn btn-primary" onClick={loadUsers}>
                Filter
              </button>
            </div>
          </div>

          {usersLoading ? (
            <div className="loading">Loading users...</div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Email</th>
                    <th>Region</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.fullName || 'No Name'}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>@{u.username}</div>
                      </td>
                      <td>
                        <span className={`badge-${u.role?.toLowerCase()}`}>
                          {u.role}
                        </span>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.region || '-'}</td>
                      <td>
                        <span className={u.isActive ? 'badge-active' : 'badge-inactive'}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-sm toggle-btn"
                            style={{
                              background: u.isActive ? '#ffebee' : '#e8f5e9',
                              color: u.isActive ? '#c62828' : '#2e7d32'
                            }}
                            onClick={() => handleToggleUserStatus(u.id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn-sm btn-secondary" onClick={() => openEditUser(u)}>
                            Edit
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteUser(u.id, u.username)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit User Account</h3>
              <button className="close-btn" onClick={() => setShowEditUserModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveUser}>
              <div className="form-group">
                <label>Full Name *</label>
                <input
                  type="text"
                  value={userForm.fullName}
                  onChange={(e) => setUserForm({ ...userForm, fullName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={userForm.phoneNumber}
                    onChange={(e) => setUserForm({ ...userForm, phoneNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  >
                    <option value="FARMER">FARMER</option>
                    <option value="WORKER">WORKER</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <input
                    type="text"
                    value={userForm.region}
                    onChange={(e) => setUserForm({ ...userForm, region: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditUserModal(false)}>
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

      {/* ================= TAB 3: FARMERS VERIFICATION ================= */}
      {activeTab === 'farmers' && (
        <div>
          <div className="section-header">
            <div>
              <h2>Farmer Verification Queue</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Review farmer applications and verify genuine cultivators.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className={`btn-sm toggle-btn ${farmerStatusFilter === 'PENDING' ? 'busy' : ''}`}
                onClick={() => { setFarmerStatusFilter('PENDING'); loadFarmers(); }}
              >
                Pending
              </button>
              <button
                className={`btn-sm toggle-btn ${farmerStatusFilter === 'APPROVED' ? 'available' : ''}`}
                onClick={() => { setFarmerStatusFilter('APPROVED'); loadFarmers(); }}
              >
                Approved
              </button>
              <button
                className={`btn-sm toggle-btn ${farmerStatusFilter === 'REJECTED' ? '' : ''}`}
                onClick={() => { setFarmerStatusFilter('REJECTED'); loadFarmers(); }}
              >
                Rejected
              </button>
              <button
                className={`btn-sm toggle-btn ${farmerStatusFilter === '' ? 'available' : ''}`}
                onClick={() => { setFarmerStatusFilter(''); loadFarmers(); }}
              >
                All Farmers
              </button>
            </div>
          </div>

          {farmersLoading ? (
            <div className="loading">Loading farmer profiles...</div>
          ) : farmers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🌾</div>
              <h3>No Farmers Found</h3>
              <p>No farmer profiles match the selected verification filter.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Region / Location</th>
                    <th>Experience</th>
                    <th>Specialization</th>
                    <th>Verification Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {farmers.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <strong>{f.fullName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>@{f.username} &bull; {f.phoneNumber}</div>
                      </td>
                      <td>{f.location ? `${f.location}, ` : ''}{f.region}</td>
                      <td>{f.yearsOfExperience || 0} Years</td>
                      <td>{f.specialization || 'General Cultivation'}</td>
                      <td>
                        <span className={`verification-badge ${f.farmerVerificationStatus?.toLowerCase()}`}>
                          {f.farmerVerificationStatus}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {f.farmerVerificationStatus !== 'APPROVED' && (
                            <button
                              className="btn-sm btn-primary"
                              onClick={() => handleVerifyFarmer(f.id, 'APPROVED')}
                            >
                              Approve
                            </button>
                          )}
                          {f.farmerVerificationStatus !== 'REJECTED' && (
                            <button
                              className="btn-sm btn-danger"
                              onClick={() => handleVerifyFarmer(f.id, 'REJECTED')}
                            >
                              Reject
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: WORKERS MODERATION ================= */}
      {activeTab === 'workers' && (
        <div>
          <div className="section-header">
            <h2>Worker Listings Moderation</h2>
          </div>

          {workersLoading ? (
            <div className="loading">Loading worker listings...</div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>User Account</th>
                    <th>Region</th>
                    <th>Skills</th>
                    <th>Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.map((w) => (
                    <tr key={w.id}>
                      <td>
                        <strong>{w.workerName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{w.phoneNumber}</div>
                      </td>
                      <td>@{w.user?.username || w.username || 'N/A'}</td>
                      <td>{w.region}</td>
                      <td>{w.skillSet}</td>
                      <td>₹{w.dailyRate}/day</td>
                      <td>
                        <span className={w.isActive ? 'badge-active' : 'badge-inactive'}>
                          {w.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-sm toggle-btn"
                            style={{
                              background: w.isActive ? '#ffebee' : '#e8f5e9',
                              color: w.isActive ? '#c62828' : '#2e7d32'
                            }}
                            onClick={() => handleToggleWorkerStatus(w.id)}
                          >
                            {w.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn-sm btn-secondary" onClick={() => openEditWorker(w)}>
                            Edit
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteWorker(w.id, w.workerName)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Worker Modal */}
      {showEditWorkerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Worker Listing</h3>
              <button className="close-btn" onClick={() => setShowEditWorkerModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveWorker}>
              <div className="form-group">
                <label>Worker Display Name *</label>
                <input
                  type="text"
                  value={workerForm.workerName}
                  onChange={(e) => setWorkerForm({ ...workerForm, workerName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={workerForm.phoneNumber}
                    onChange={(e) => setWorkerForm({ ...workerForm, phoneNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Region</label>
                  <input
                    type="text"
                    value={workerForm.region}
                    onChange={(e) => setWorkerForm({ ...workerForm, region: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Skill Set</label>
                <input
                  type="text"
                  value={workerForm.skillSet}
                  onChange={(e) => setWorkerForm({ ...workerForm, skillSet: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={workerForm.dailyRate}
                    onChange={(e) => setWorkerForm({ ...workerForm, dailyRate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Availability</label>
                  <select
                    value={workerForm.availability}
                    onChange={(e) => setWorkerForm({ ...workerForm, availability: e.target.value })}
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="BUSY">BUSY</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditWorkerModal(false)}>
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

      {/* ================= TAB 5: EQUIPMENT MODERATION ================= */}
      {activeTab === 'equipment' && (
        <div>
          <div className="section-header">
            <h2>Equipment Moderation</h2>
          </div>

          {equipmentLoading ? (
            <div className="loading">Loading equipment listings...</div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Equipment</th>
                    <th>Type / Brand</th>
                    <th>Owner</th>
                    <th>Daily Rate</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {equipmentList.map((eq) => (
                    <tr key={eq.id}>
                      <td>
                        <strong>{eq.equipmentName}</strong>
                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{eq.region}</div>
                      </td>
                      <td>{eq.equipmentType} {eq.brand ? `(${eq.brand})` : ''}</td>
                      <td>@{eq.user?.username || eq.ownerName || 'N/A'}</td>
                      <td>₹{eq.dailyRentalCost}/day</td>
                      <td>
                        <span className={eq.isActive ? 'badge-active' : 'badge-inactive'}>
                          {eq.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-sm toggle-btn"
                            style={{
                              background: eq.isActive ? '#ffebee' : '#e8f5e9',
                              color: eq.isActive ? '#c62828' : '#2e7d32'
                            }}
                            onClick={() => handleToggleEquipmentStatus(eq.id)}
                          >
                            {eq.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button className="btn-sm btn-secondary" onClick={() => openEditEquipment(eq)}>
                            Edit
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteEquipment(eq.id, eq.equipmentName)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Equipment Modal */}
      {showEditEquipmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Edit Equipment Listing</h3>
              <button className="close-btn" onClick={() => setShowEditEquipmentModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveEquipment}>
              <div className="form-group">
                <label>Equipment Name *</label>
                <input
                  type="text"
                  value={equipmentForm.equipmentName}
                  onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentName: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Type</label>
                  <input
                    type="text"
                    value={equipmentForm.equipmentType}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, equipmentType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Daily Rate (₹)</label>
                  <input
                    type="number"
                    value={equipmentForm.dailyRentalCost}
                    onChange={(e) => setEquipmentForm({ ...equipmentForm, dailyRentalCost: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowEditEquipmentModal(false)}>
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

      {/* ================= TAB 6: EXPERIENCE MODERATION ================= */}
      {activeTab === 'experiences' && (
        <div>
          <div className="section-header">
            <h2>Experience Verification & Moderation</h2>
          </div>

          {experiencesLoading ? (
            <div className="loading">Loading experiences...</div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Crop</th>
                    <th>Author</th>
                    <th>Season</th>
                    <th>Helpful</th>
                    <th>Verification</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {experiences.map((exp) => (
                    <tr key={exp.id}>
                      <td><strong>{exp.title}</strong></td>
                      <td>{exp.crop?.cropName || exp.cropName || 'General'}</td>
                      <td>@{exp.user?.username || exp.authorName || 'N/A'}</td>
                      <td>{exp.season}</td>
                      <td>👍 {exp.helpfulCount || 0}</td>
                      <td>
                        <span className={exp.isVerified ? 'badge-active' : 'badge-inactive'}>
                          {exp.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-sm toggle-btn"
                            style={{
                              background: exp.isVerified ? '#fff3e0' : '#e8f5e9',
                              color: exp.isVerified ? '#e65100' : '#2e7d32'
                            }}
                            onClick={() => handleToggleVerifyExperience(exp.id, exp.isVerified)}
                          >
                            {exp.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteExperience(exp.id, exp.title)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 7: CROP MANAGEMENT ================= */}
      {activeTab === 'crops' && (
        <div>
          <div className="section-header">
            <div>
              <h2>Agricultural Crops Directory</h2>
              <p style={{ margin: '0.25rem 0 0', color: '#666', fontSize: '0.9rem' }}>
                Manage crops and scientific parameters. Crops referenced by experiences cannot be deleted until those references are cleared.
              </p>
            </div>
            <button className="btn btn-primary" onClick={openNewCrop}>
              + Add New Crop
            </button>
          </div>

          {cropsLoading ? (
            <div className="loading">Loading crops...</div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Crop Name</th>
                    <th>Scientific Name</th>
                    <th>Type</th>
                    <th>Optimal Season</th>
                    <th>Soil</th>
                    <th>Water</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {crops.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.cropName}</strong></td>
                      <td><em>{c.scientificName}</em></td>
                      <td>{c.cropType}</td>
                      <td>{c.optimalSeason}</td>
                      <td>{c.soilType}</td>
                      <td>{c.waterRequirement}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-sm btn-secondary" onClick={() => openEditCrop(c)}>
                            Edit
                          </button>
                          <button
                            className="btn-sm btn-danger"
                            onClick={() => handleDeleteCrop(c.id, c.cropName)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Crop Add / Edit Modal */}
      {showCropModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingCropId ? 'Edit Crop' : 'Add New Crop to Directory'}</h3>
              <button className="close-btn" onClick={() => setShowCropModal(false)}>&times;</button>
            </div>

            <form onSubmit={handleSaveCrop}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Crop Name *</label>
                  <input
                    type="text"
                    value={cropForm.cropName}
                    onChange={(e) => setCropForm({ ...cropForm, cropName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Scientific Name</label>
                  <input
                    type="text"
                    value={cropForm.scientificName}
                    onChange={(e) => setCropForm({ ...cropForm, scientificName: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Crop Type (e.g. Cereal, Pulse, Cash Crop)</label>
                  <input
                    type="text"
                    value={cropForm.cropType}
                    onChange={(e) => setCropForm({ ...cropForm, cropType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Optimal Season</label>
                  <input
                    type="text"
                    value={cropForm.optimalSeason}
                    onChange={(e) => setCropForm({ ...cropForm, optimalSeason: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label>Soil Type</label>
                  <input
                    type="text"
                    value={cropForm.soilType}
                    onChange={(e) => setCropForm({ ...cropForm, soilType: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Water Requirement</label>
                  <input
                    type="text"
                    value={cropForm.waterRequirement}
                    onChange={(e) => setCropForm({ ...cropForm, waterRequirement: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Climate</label>
                  <input
                    type="text"
                    value={cropForm.climate}
                    onChange={(e) => setCropForm({ ...cropForm, climate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description & Agronomic Guidance</label>
                <textarea
                  value={cropForm.description}
                  onChange={(e) => setCropForm({ ...cropForm, description: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn" onClick={() => setShowCropModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCropId ? 'Save Changes' : 'Create Crop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
