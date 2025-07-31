import axios from 'axios';

const instance = axios.create({
  baseURL: 'https://chat-app-backend-0d86.onrender.com/api', // Make sure this matches your backend PORT and API prefix
  timeout: 5000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Optional: Add a request interceptor to include JWT token in headers
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Get token from local storage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`; // Add token to Authorization header
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default instance;