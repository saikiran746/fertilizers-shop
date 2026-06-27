import api from './index';

// Public
export const fetchChatbotSettings = async () => {
  const { data } = await api.get('/chatbot/settings');
  return data;
};

export const sendChatMessage = async ({ sessionId, message, history }) => {
  const { data } = await api.post('/chatbot/message', { sessionId, message, history });
  return data;
};

export const submitChatFeedback = async ({ sessionId, rating, comment }) => {
  const { data } = await api.post('/chatbot/feedback', { sessionId, rating, comment });
  return data;
};

export const fetchChatHistory = async (sessionId) => {
  const { data } = await api.get(`/chatbot/history/${sessionId}`);
  return data;
};

// Admin
export const adminGetChatbotSettings = async () => {
  const { data } = await api.get('/admin/chatbot/settings');
  return data;
};

export const adminUpdateChatbotSettings = async (settings) => {
  const { data } = await api.put('/admin/chatbot/settings', settings);
  return data;
};

export const adminGetChatbotAnalytics = async () => {
  const { data } = await api.get('/admin/chatbot/analytics');
  return data;
};

export const adminGetConversations = async (params) => {
  const { data } = await api.get('/admin/chatbot/conversations', { params });
  return data;
};

export const adminGetConversation = async (id) => {
  const { data } = await api.get(`/admin/chatbot/conversations/${id}`);
  return data;
};

export const adminDeleteConversation = async (id) => {
  const { data } = await api.delete(`/admin/chatbot/conversations/${id}`);
  return data;
};

export const adminClearConversations = async () => {
  const { data } = await api.delete('/admin/chatbot/conversations');
  return data;
};
