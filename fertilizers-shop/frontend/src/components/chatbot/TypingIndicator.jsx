import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex w-full mb-4 animate-chatbot-message-in">
      <div className="flex gap-2 max-w-[85%] items-end">
        {/* AI Avatar */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green flex items-center justify-center shadow-md chatbot-avatar-glow">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        </div>
        
        {/* Typing Bubble */}
        <div className="bg-white border border-green-100 rounded-2xl rounded-bl-sm p-4 shadow-sm">
          <div className="flex gap-1.5 items-center h-4">
            <div className="w-2 h-2 rounded-full bg-brand-green chatbot-dot"></div>
            <div className="w-2 h-2 rounded-full bg-brand-green chatbot-dot"></div>
            <div className="w-2 h-2 rounded-full bg-brand-green chatbot-dot"></div>
          </div>
          <div className="text-xs text-gray-400 mt-2">AgroPlus AI is thinking...</div>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
