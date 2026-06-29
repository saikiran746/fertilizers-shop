import api from "./index";

// ── Public ──────────────────────────────────────────────────
export const fetchSiteSettings = () => api.get("/site-settings").then((r) => r.data);
export const submitContactMessage = (data) => api.post("/contact", data).then((r) => r.data);

// ── Admin ────────────────────────────────────────────────────
export const changePassword = (data) => api.put("/admin/change-password", data).then((r) => r.data);
export const adminGetSettings = () => api.get("/admin/settings").then((r) => r.data);
export const adminUpdateSettings = (data) => api.put("/admin/settings", data).then((r) => r.data);
export const adminTestEmail = () => api.post("/admin/test-email").then((r) => r.data);

// Messages
export const adminGetMessages = () => api.get("/admin/messages").then((r) => r.data);
export const adminGetUnreadCount = () => api.get("/admin/messages/unread-count").then((r) => r.data);
export const adminGetUnreadBadges = () => api.get("/admin/unread-badges").then((r) => r.data);
export const adminMarkMessageRead = (id) => api.patch(`/admin/messages/${id}/read`).then((r) => r.data);
export const adminMarkAllRead = () => api.patch("/admin/messages/mark-all-read").then((r) => r.data);
export const adminDeleteMessage = (id) => api.delete(`/admin/messages/${id}`).then((r) => r.data);
export const adminDeleteAllMessages = () => api.delete("/admin/messages/all").then((r) => r.data);
export const adminSendEmailReply = (id, data) => api.post(`/admin/messages/${id}/send-email`, data).then((r) => r.data);
