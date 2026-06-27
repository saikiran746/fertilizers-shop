import React from 'react';
import { motion } from 'framer-motion';

const ChatWelcome = ({ welcomeMessage, quickActions, onQuickAction }) => {
  return (
    <div className="flex flex-col items-center justify-center py-6 px-4 h-full">
      {/* Avatar & Title */}
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="flex flex-col items-center mb-6 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-dark to-brand-green flex items-center justify-center shadow-lg mb-3 relative chatbot-avatar-glow">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-white rounded-full animate-pulse"></div>
        </div>
        <h3 className="font-heading text-xl font-bold text-gray-800">AgroPlus AI</h3>
        <p className="text-sm text-brand-green font-medium">Your Agricultural Assistant</p>
      </motion.div>

      {/* Welcome Text */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="bg-white rounded-2xl p-4 shadow-sm border border-green-50 mb-6 text-center text-gray-600 text-sm leading-relaxed max-w-sm whitespace-pre-line"
      >
        {welcomeMessage}
      </motion.div>

      {/* Quick Actions Grid */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="w-full max-w-sm"
      >
        <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-3 ml-1">Suggested Questions</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {quickActions?.map((action, idx) => (
            <button
              key={idx}
              onClick={() => onQuickAction(action.prompt)}
              className="flex items-center gap-2 p-3 bg-white border border-gray-100 hover:border-brand-green hover:shadow-md hover:bg-green-50 text-left rounded-xl transition-all group"
            >
              <span className="text-xl flex-shrink-0">{action.emoji}</span>
              <span className="text-sm text-gray-700 font-medium group-hover:text-brand-dark line-clamp-2 leading-tight">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default ChatWelcome;
