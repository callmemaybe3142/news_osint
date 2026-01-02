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
    RAW_NEWS: `${API_BASE_URL}/news/raw`,
    FAVORITE_NEWS: `${API_BASE_URL}/news/favorites`,
    CHANNELS: `${API_BASE_URL}/news/channels`,
    NEWS_BASE: `${API_BASE_URL}/news`,
};

// Image server configuration
export const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || `${API_BASE_URL}/news/images`;

export default API_BASE_URL;

