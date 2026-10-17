import axios from 'axios';
import authService from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if one is stored
api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Crop Services
export const cropService = {
  getAllCrops: () => api.get('/crops'),
  getCropById: (id) => api.get(`/crops/${id}`),
  createCrop: (crop) => api.post('/crops', crop),
  updateCrop: (id, crop) => api.put(`/crops/${id}`, crop),
  deleteCrop: (id) => api.delete(`/crops/${id}`),
  searchCrops: (name) => api.get(`/crops/search?name=${name}`),
  getCropsBySoil: (soilType) => api.get(`/crops/soil/${soilType}`),
  getCropsByClimate: (climate) => api.get(`/crops/climate/${climate}`),
  getSuitableCrops: (soilType, climate) =>
    api.get(`/crops/suitable?soilType=${soilType}&climate=${climate}`),
};

// User Services
export const userService = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  getUserByUsername: (username) => api.get(`/users/username/${username}`),
  getMyProfile: () => api.get('/users/me'),
  updateMyProfile: (data) => api.put('/users/me', data),
  createUser: (user) => api.post('/users', user),
  updateUser: (id, user) => api.put(`/users/${id}`, user),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getVerifiedFarmers: () => api.get('/users/verified-farmers'),
  getUsersByRegion: (region) => api.get(`/users/region/${region}`),
};

// Farmer Experience Services
export const experienceService = {
  getAllExperiences: () => api.get('/experiences'),
  getExperienceById: (id) => api.get(`/experiences/${id}`),
  getExperiencesByCrop: (cropId) => api.get(`/experiences/crop/${cropId}`),
  getExperiencesByUser: (userId) => api.get(`/experiences/user/${userId}`),
  getMyExperiences: () => api.get('/experiences/my'),
  getTopExperiences: () => api.get('/experiences/top'),
  createExperience: (experience) => api.post('/experiences', experience),
  updateExperience: (id, experience) => api.put(`/experiences/${id}`, experience),
  markAsHelpful: (id) => api.post(`/experiences/${id}/helpful`),
  deleteExperience: (id) => api.delete(`/experiences/${id}`),
};

// Worker Listing Services
export const workerService = {
  getAllWorkers: () => api.get('/workers'),
  getWorkerById: (id) => api.get(`/workers/${id}`),
  getWorkersByRegion: (region) => api.get(`/workers/region/${region}`),
  getAvailableWorkers: (region) => api.get(`/workers/available/${region}`),
  getWorkersByAvailability: (availability) => api.get(`/workers/availability/${availability}`),
  searchWorkers: (skill) => api.get(`/workers/search?skill=${skill}`),
  // Authenticated worker's profile
  getMyProfile: () => api.get('/workers/me'),
  updateMyProfile: (listing) => api.put('/workers/me', listing),
  deleteMyProfile: () => api.delete('/workers/me'),
  updateMyAvailability: (availability) => api.patch(`/workers/me/availability?availability=${availability}`),
  // Authenticated worker's own listings
  getMyListings: () => api.get('/workers/my'),
  // Mutating operations
  createWorkerListing: (listing) => api.post('/workers', listing),
  updateWorkerListing: (id, listing) => api.put(`/workers/${id}`, listing),
  deactivateWorkerListing: (id) => api.patch(`/workers/${id}/deactivate`),
  activateWorkerListing: (id) => api.patch(`/workers/${id}/activate`),
  deleteWorkerListing: (id) => api.delete(`/workers/${id}`),
};

// Equipment Listing Services
export const equipmentService = {
  getAllEquipment: () => api.get('/equipment'),
  getEquipmentById: (id) => api.get(`/equipment/${id}`),
  getMyEquipment: () => api.get('/equipment/my'),
  getEquipmentByRegion: (region) => api.get(`/equipment/region/${region}`),
  getAvailableEquipment: (region) => api.get(`/equipment/available/${region}`),
  searchEquipment: (type) => api.get(`/equipment/search?type=${type}`),
  createEquipmentListing: (listing) => api.post('/equipment', listing),
  updateEquipmentListing: (id, listing) => api.put(`/equipment/${id}`, listing),
  updateAvailability: (id, availability) => api.patch(`/equipment/${id}/availability?availability=${availability}`),
  toggleStatus: (id) => api.patch(`/equipment/${id}/toggle-status`),
  deleteEquipmentListing: (id) => api.delete(`/equipment/${id}`),
};

// Admin Services
export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, user) => api.put(`/admin/users/${id}`, user),
  toggleUserStatus: (id) => api.patch(`/admin/users/${id}/status`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  getFarmers: (status) => api.get('/admin/farmers', { params: status ? { status } : {} }),
  verifyFarmer: (id, status) => api.patch(`/admin/farmers/${id}/verify?status=${status}`),

  getWorkers: () => api.get('/admin/workers'),
  updateWorker: (id, listing) => api.put(`/admin/workers/${id}`, listing),
  toggleWorkerStatus: (id) => api.patch(`/admin/workers/${id}/toggle-status`),
  deleteWorker: (id) => api.delete(`/admin/workers/${id}`),

  getEquipment: () => api.get('/admin/equipment'),
  updateEquipment: (id, listing) => api.put(`/admin/equipment/${id}`, listing),
  toggleEquipmentStatus: (id) => api.patch(`/admin/equipment/${id}/toggle-status`),
  deleteEquipment: (id) => api.delete(`/admin/equipment/${id}`),

  getExperiences: () => api.get('/admin/experiences'),
  verifyExperience: (id, verified) => api.patch(`/admin/experiences/${id}/verify?verified=${verified}`),
  deleteExperience: (id) => api.delete(`/admin/experiences/${id}`),

  createCrop: (crop) => api.post('/crops', crop),
  updateCrop: (id, crop) => api.put(`/crops/${id}`, crop),
  deleteCrop: (id) => api.delete(`/crops/${id}`),
};

export default api;