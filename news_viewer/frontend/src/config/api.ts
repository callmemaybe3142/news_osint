/**
 * API configuration and endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    ME: `${API_BASE_URL}/auth/me`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
    DASHBOARD_STATS: `${API_BASE_URL}/dashboard/stats`,
};

export default API_BASE_URL;
