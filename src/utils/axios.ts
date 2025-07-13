import axios from "axios";

// Set base URL for all API calls
const isProduction =
  import.meta.env.PROD || process.env.NODE_ENV === "production";
const baseURL = isProduction ? "/api" : "http://localhost:5000/api";

axios.defaults.baseURL = baseURL;

console.log("🔗 Axios base URL:", axios.defaults.baseURL);
console.log("🌍 Environment:", isProduction ? "production" : "development");
console.log("🔧 import.meta.env.PROD:", import.meta.env.PROD);
console.log("🔧 process.env.NODE_ENV:", process.env.NODE_ENV);

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axios;
