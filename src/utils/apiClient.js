// API client helper that automatically adds authorization token to requests
import { useAuth } from '../context/AuthContext';

export function useApiClient() {
  const { token } = useAuth();

  const apiCall = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authorization header if token exists
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    return response;
  };

  return { apiCall, token };
}

// Standalone function for use outside React components
export const getAuthHeader = () => {
  const token = localStorage.getItem('ocms_token');
  if (token) {
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'Content-Type': 'application/json',
  };
};

// Helper to fetch with auth
export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('ocms_token');
  const headers = {
    ...options.headers,
  };

  // Add authorization header if token exists
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Only set Content-Type if not FormData (FormData sets it automatically)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
