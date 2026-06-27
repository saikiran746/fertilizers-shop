import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-logout on 401 — ONLY for admin API calls, never for public endpoints
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      const requestUrl = err.config?.url || "";

      // Only clear session if this was an admin-protected API call
      const isAdminRequest =
        requestUrl.includes("/admin/") ||
        requestUrl.startsWith("admin/");

      if (isAdminRequest) {
        localStorage.removeItem("admin_token");
        localStorage.removeItem("admin_username");

        // Only redirect if THIS window/tab is currently on an admin page
        if (
          window.location.pathname.startsWith("/admin") &&
          !window.location.pathname.includes("login")
        ) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;
