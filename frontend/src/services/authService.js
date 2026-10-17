// src/services/authService.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8082/api';

const TOKEN_KEY = 'agriguide_token';
const USER_KEY = 'agriguide_user';

const authService = {
  // Signup
  signup: (userData) => axios.post(`${API_BASE_URL}/auth/signup`, userData),

  // Login
  login: (credentials) => axios.post(`${API_BASE_URL}/auth/login`, credentials),

  // Logout — stateless JWT: just remove local data
  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  // Get current user (for profile page, uses stored data)
  getCurrentUser: (userId) => axios.get(`${API_BASE_URL}/auth/user/${userId}`),

  // Change password — sends JWT automatically via interceptor
  changePassword: (userId, oldPassword, newPassword) =>
    axios.post(`${API_BASE_URL}/auth/change-password`, null, {
      params: { userId, oldPassword, newPassword }
    }),

  // Store both token and user object
  storeAuth: (token, user) => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Legacy: store only user (kept for compatibility)
  storeUser: (user) => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  // Get stored user object
  getStoredUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Get stored JWT token
  getToken: () => localStorage.getItem(TOKEN_KEY),

  // Check if user is logged in (token + user both present)
  isLoggedIn: () => {
    return localStorage.getItem(TOKEN_KEY) !== null &&
           localStorage.getItem(USER_KEY) !== null;
  },
};

export default authService;