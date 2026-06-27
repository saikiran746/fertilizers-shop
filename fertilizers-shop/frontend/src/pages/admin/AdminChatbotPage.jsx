import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import {
  adminGetChatbotSettings,
  adminUpdateChatbotSettings,
  adminGetChatbotAnalytics,
  adminGetConversations,
  adminDeleteConversation,
  adminClearConversations
} from '../../api/chatbot';

const AdminChatbotPage = () => {
  const [activeTab, setActiveTab] = useState('configuration');
  const [page, setPage] = useState(1);
  const [expandedConv, setExpandedConv] = useState(null);
  
  const queryClient = useQueryClient();

  // Queries
  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ['adminChatbotSettings'],
    queryFn: adminGetChatbotSettings,
  });

  const { data: analytics, isLoading: loadingAnalytics } = useQuery({
    queryKey: ['adminChatbotAnalytics'],
    queryFn: adminGetChatbotAnalytics,
  });

  const { data: convData, isLoading: loadingConv } = useQuery({
    queryKey: ['adminChatbotConversations', page],
    queryFn: () => adminGetConversations({ page, limit: 15 }),
  });

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: adminUpdateChatbotSettings,
    onSuccess: () => {
      toast.success('Chatbot settings updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminChatbotSettings'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to update settings')
  });

  const deleteConvMutation = useMutation({
    mutationFn: adminDeleteConversation,
    onSuccess: () => {
      toast.success('Conversation deleted');
      queryClient.invalidateQueries({ queryKey: ['adminChatbotConversations'] });
      queryClient.invalidateQueries({ queryKey: ['adminChatbotAnalytics'] });
    }
  });

  const clearConvMutation = useMutation({
    mutationFn: adminClearConversations,
    onSuccess: () => {
      toast.success('All conversations cleared');
      queryClient.invalidateQueries({ queryKey: ['adminChatbotConversations'] });
      queryClient.invalidateQueries({ queryKey: ['adminChatbotAnalytics'] });
      setPage(1);
    }
  });

  // Render Configuration Tab
  const renderConfiguration = () => {
    if (loadingSettings) return <LoadingSpinner size="lg" />;
    
    // We need local state for form editing
    return <ConfigurationForm initialSettings={settings} onSubmit={(data) => updateSettingsMutation.mutate(data)} isSaving={updateSettingsMutation.isPending} />;
  };

  // Render Conversations Tab
  const renderConversations = () => {
    if (loadingConv) return <LoadingSpinner size="lg" />;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-heading font-semibold text-white">Chat History</h3>
          <button 
            onClick={() => {
              if (window.confirm('Are you sure you want to delete ALL chatbot conversations? This cannot be undone.')) {
                clearConvMutation.mutate();
              }
            }}
            className="btn-outline text-red-400 border-red-500/30 hover:bg-red-500/10 px-4 py-2 text-sm"
          >
            Clear All History
          </button>
        </div>

        {(!convData?.conversations || convData.conversations.length === 0) ? (
          <div className="admin-card p-12 text-center">
            <p className="text-gray-400">No conversations found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {convData.conversations.map(conv => (
              <div key={conv._id} className="admin-card overflow-hidden">
                <div 
                  className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center cursor-pointer hover:bg-white/5 transition-colors"
                  onClick={() => setExpandedConv(expandedConv === conv._id ? null : conv._id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-sm font-mono text-brand-green bg-brand-green/10 px-2 py-0.5 rounded">
                        {conv.sessionId.substring(0, 16)}...
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(conv.lastActivity).toLocaleString()}
                      </span>
                      {conv.userFeedback?.rating && (
                        <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded flex items-center gap-1">
                          ★ {conv.userFeedback.rating}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-300 truncate">
                      <span className="text-gray-500">User:</span> {conv.preview}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{conv.totalMessages} msgs</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this conversation?')) deleteConvMutation.mutate(conv._id);
                      }}
                      className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                    <svg className={`w-5 h-5 transition-transform ${expandedConv === conv._id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>

                {/* Expanded View */}
                <AnimatePresence>
                  {expandedConv === conv._id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/10 bg-black/20"
                    >
                      <div className="p-4 max-h-96 overflow-y-auto space-y-3 custom-scrollbar">
                        <ConversationDetail id={conv._id} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
            
            {/* Pagination */}
            {convData.pages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {Array.from({ length: convData.pages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 rounded-lg text-sm flex items-center justify-center transition-all ${
                      page === i + 1 ? 'bg-brand-green text-white' : 'bg-admin-card text-gray-400 hover:text-white'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Render Analytics Tab
  const renderAnalytics = () => {
    if (loadingAnalytics) return <LoadingSpinner size="lg" />;
    if (!analytics) return <div className="text-gray-400">No analytics data available</div>;

    const maxDaily = Math.max(...(analytics.dailyConversations?.map(d => d.count) || [1]));

    return (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card p-5 border-t-4 border-brand-green bg-gradient-to-br from-admin-card to-brand-green/10">
            <p className="text-gray-400 text-sm mb-1">Total Conversations</p>
            <h3 className="text-3xl font-bold text-white">{analytics.totalConversations || 0}</h3>
          </div>
          <div className="admin-card p-5 border-t-4 border-blue-500 bg-gradient-to-br from-admin-card to-blue-500/10">
            <p className="text-gray-400 text-sm mb-1">Total Messages</p>
            <h3 className="text-3xl font-bold text-white">{analytics.totalMessages || 0}</h3>
          </div>
          <div className="admin-card p-5 border-t-4 border-purple-500 bg-gradient-to-br from-admin-card to-purple-500/10">
            <p className="text-gray-400 text-sm mb-1">Avg Msgs / Chat</p>
            <h3 className="text-3xl font-bold text-white">{analytics.averageMessages || 0}</h3>
          </div>
          <div className="admin-card p-5 border-t-4 border-yellow-500 bg-gradient-to-br from-admin-card to-yellow-500/10">
            <p className="text-gray-400 text-sm mb-1">User Satisfaction</p>
            <h3 className="text-3xl font-bold text-white flex items-baseline gap-2">
              {analytics.satisfaction?.average || 'N/A'} <span className="text-sm font-normal text-yellow-500">★</span>
            </h3>
            <p className="text-xs text-gray-500 mt-1">{analytics.satisfaction?.totalFeedback || 0} ratings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-heading font-semibold text-white mb-6">Activity (Last 30 Days)</h3>
            <div className="h-48 flex items-end gap-2">
              {analytics.dailyConversations?.length > 0 ? (
                analytics.dailyConversations.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                    {/* Tooltip */}
                    <div className="absolute -top-8 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                      {day._id}: {day.count} chats
                    </div>
                    {/* Bar */}
                    <div 
                      className="w-full bg-brand-green/80 rounded-t-sm hover:bg-brand-light transition-colors chatbot-bar"
                      style={{ height: `${Math.max((day.count / maxDaily) * 100, 4)}%` }}
                    ></div>
                  </div>
                ))
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-500">No activity yet</div>
              )}
            </div>
          </div>

          {/* Top Quick Actions */}
          <div className="admin-card p-6">
            <h3 className="text-lg font-heading font-semibold text-white mb-6">Top Quick Actions Used</h3>
            {analytics.topQuickActions?.length > 0 ? (
              <div className="space-y-4">
                {analytics.topQuickActions.map((action, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-400 text-sm font-bold">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-200 truncate">{action.label}</p>
                    </div>
                    <div className="text-brand-green font-mono bg-brand-green/10 px-3 py-1 rounded-full text-sm">
                      {action.count}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data yet</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-heading font-bold text-white">AI Chatbot Management</h2>
          <p className="text-gray-400 mt-1">Configure and monitor your AgroPlus AI assistant</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-admin-card p-1 rounded-xl">
        {['configuration', 'conversations', 'analytics'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${
              activeTab === tab 
                ? 'bg-brand-green text-white shadow-md' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'configuration' && renderConfiguration()}
        {activeTab === 'conversations' && renderConversations()}
        {activeTab === 'analytics' && renderAnalytics()}
      </motion.div>
    </div>
  );
};

// Helper component for loading single conversation messages
import { adminGetConversation } from '../../api/chatbot';
const ConversationDetail = ({ id }) => {
  const { data, isLoading } = useQuery({
    queryKey: ['adminConversation', id],
    queryFn: () => adminGetConversation(id)
  });

  if (isLoading) return <LoadingSpinner size="sm" />;
  if (!data?.messages) return null;

  return (
    <div className="flex flex-col gap-3 pb-2">
      {data.messages.map((msg, i) => {
        if (msg.role === 'system') return null;
        const isUser = msg.role === 'user';
        return (
          <div key={i} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
            <span className="text-[10px] text-gray-500 mb-0.5 ml-1">{new Date(msg.timestamp).toLocaleTimeString()} - {isUser ? 'User' : 'AI'}</span>
            <div className={`p-3 rounded-xl max-w-[80%] text-sm ${
              isUser ? 'bg-brand-green/20 text-green-100 rounded-tr-sm' : 'bg-white/10 text-gray-200 rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.metadata?.quickAction && (
                <div className="mt-2 text-xs text-brand-green/80 italic">Action used: {msg.metadata.quickAction}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// Helper component for the complex form state
const ConfigurationForm = ({ initialSettings, onSubmit, isSaving }) => {
  const [formData, setFormData] = useState(initialSettings || {
    enabled: true,
    welcomeMessage: '',
    systemPrompt: '',
    modelName: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    quickActions: []
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateQuickAction = (index, field, value) => {
    const newActions = [...formData.quickActions];
    newActions[index] = { ...newActions[index], [field]: value };
    updateField('quickActions', newActions);
  };

  const removeQuickAction = (index) => {
    const newActions = [...formData.quickActions];
    newActions.splice(index, 1);
    updateField('quickActions', newActions);
  };

  const addQuickAction = () => {
    updateField('quickActions', [...formData.quickActions, { emoji: '❓', label: 'New Question', prompt: 'Answer my question' }]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="admin-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-heading font-semibold text-white">General Settings</h3>
            <p className="text-sm text-gray-400">Core behavior of the chatbot</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-medium ${formData.enabled ? 'text-brand-green' : 'text-gray-400'}`}>
              {formData.enabled ? 'Active' : 'Disabled'}
            </span>
            <button
              type="button"
              onClick={() => updateField('enabled', !formData.enabled)}
              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${formData.enabled ? 'bg-brand-green' : 'bg-gray-600'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${formData.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label text-gray-300">Welcome Message</label>
            <textarea
              rows="3"
              value={formData.welcomeMessage}
              onChange={(e) => updateField('welcomeMessage', e.target.value)}
              className="admin-input"
              placeholder="👋 Welcome to AgroPlus AI!..."
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">Shown to users when they first open the chat.</p>
          </div>
          
          <div>
            <label className="label text-gray-300">Custom System Instructions (Optional)</label>
            <textarea
              rows="4"
              value={formData.systemPrompt}
              onChange={(e) => updateField('systemPrompt', e.target.value)}
              className="admin-input"
              placeholder="Additional instructions for the AI behavior..."
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">The AI already knows about your products and contact info. Add specific tone or behavior rules here.</p>
          </div>
        </div>
      </div>

      <div className="admin-card p-6">
        <h3 className="text-lg font-heading font-semibold text-white mb-2">Quick Actions</h3>
        <p className="text-sm text-gray-400 mb-6">Suggested questions shown on the welcome screen.</p>
        
        <div className="space-y-4">
          {formData.quickActions.map((action, i) => (
            <div key={i} className="flex flex-col sm:flex-row gap-3 p-4 bg-black/20 rounded-xl border border-white/5 relative group">
              <button 
                type="button" 
                onClick={() => removeQuickAction(i)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
              >
                ×
              </button>
              <div className="w-full sm:w-20">
                <label className="text-xs text-gray-500 mb-1 block">Emoji</label>
                <input type="text" value={action.emoji} onChange={(e) => updateQuickAction(i, 'emoji', e.target.value)} className="admin-input text-center" />
              </div>
              <div className="w-full sm:w-1/3">
                <label className="text-xs text-gray-500 mb-1 block">Button Label</label>
                <input type="text" value={action.label} onChange={(e) => updateQuickAction(i, 'label', e.target.value)} className="admin-input" />
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">Prompt sent to AI</label>
                <input type="text" value={action.prompt} onChange={(e) => updateQuickAction(i, 'prompt', e.target.value)} className="admin-input" />
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addQuickAction}
            className="w-full py-3 border border-dashed border-gray-600 rounded-xl text-gray-400 hover:text-brand-green hover:border-brand-green transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span> Add Quick Action
          </button>
        </div>
      </div>

      <div className="admin-card p-6">
        <h3 className="text-lg font-heading font-semibold text-white mb-6">AI Model Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="label text-gray-300">Model Name</label>
            <input 
              type="text" 
              value={formData.modelName} 
              onChange={(e) => updateField('modelName', e.target.value)} 
              className="admin-input" 
            />
          </div>
          <div>
            <label className="label text-gray-300">Temperature ({formData.temperature})</label>
            <input 
              type="range" 
              min="0" max="1" step="0.1" 
              value={formData.temperature} 
              onChange={(e) => updateField('temperature', parseFloat(e.target.value))} 
              className="w-full mt-3 accent-brand-green" 
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise</span>
              <span>Creative</span>
            </div>
          </div>
          <div>
            <label className="label text-gray-300">Max Tokens</label>
            <input 
              type="number" 
              value={formData.maxTokens} 
              onChange={(e) => updateField('maxTokens', parseInt(e.target.value))} 
              className="admin-input" 
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={isSaving} className="admin-btn flex items-center gap-2">
          {isSaving ? <LoadingSpinner size="sm" /> : (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          )}
          Save Configuration
        </button>
      </div>
    </form>
  );
};

export default AdminChatbotPage;
