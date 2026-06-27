import api from "./index";

// Public
export const fetchProducts = (params) => api.get("/products", { params }).then((r) => r.data);
export const fetchProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const fetchCategories = () => api.get("/categories").then((r) => r.data);

// Admin
export const adminFetchProducts = () => api.get("/admin/products").then((r) => r.data);
export const adminFetchStats = () => api.get("/admin/stats").then((r) => r.data);

export const adminCreateProduct = (formData) =>
  api.post("/admin/products", formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const adminUpdateProduct = (id, formData) =>
  api.put(`/admin/products/${id}`, formData, { headers: { "Content-Type": "multipart/form-data" } }).then((r) => r.data);

export const adminDeleteProduct = (id) => api.delete(`/admin/products/${id}`).then((r) => r.data);

export const adminToggleVisibility = (id) =>
  api.patch(`/admin/products/${id}/visibility`).then((r) => r.data);

export const adminFetchEnhancedStats = () => api.get("/admin/enhanced-stats").then((r) => r.data);
