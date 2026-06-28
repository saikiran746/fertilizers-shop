import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchChatbotSettings, sendChatMessage, fetchChatHistory } from '../../api/chatbot';
import ChatWelcome from './ChatWelcome';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import VoiceInput from './VoiceInput';
import ChatHistory from './ChatHistory';

const generateSessionId = () => 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now().toString(36);
const SERVER_URL = import.meta.env.VITE_SERVER_URL;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState('');
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load Settings
  const { data: settings } = useQuery({
    queryKey: ['chatbotSettings'],
    queryFn: fetchChatbotSettings,
    staleTime: 60000,
  });

  // Initialize Session ID
  useEffect(() => {
    let savedId = localStorage.getItem('agroplus_chat_session');
    if (!savedId) {
      savedId = generateSessionId();
      localStorage.setItem('agroplus_chat_session', savedId);
    }
    setSessionId(savedId);
  }, []);

  // Load Chat History
  useEffect(() => {
    if (sessionId) {
      fetchChatHistory(sessionId)
        .then(data => {
          if (data && data.messages) {
            setMessages(data.messages);
          }
        })
        .catch(err => console.error("Could not load chat history", err));
    }
  }, [sessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const chatMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: (data) => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
          metadata: data.metadata || {}
        }
      ]);
    },
    onError: (error) => {
      console.error("Chat error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          role: 'assistant',
          content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again or contact us directly.",
          timestamp: new Date().toISOString()
        }
      ]);
    }
  });

  const handleSend = (text = inputValue) => {
    if (!text.trim() || chatMutation.isPending) return;

    const newMsg = {
      id: Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    
    // Prepare history for API (last 5 interactions)
    const historyForApi = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content
    }));

    chatMutation.mutate({
      sessionId,
      message: text,
      history: historyForApi
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Check if chatbot is disabled by admin
  if (settings && settings.enabled === false) {
    return null; 
  }

  const showWelcome = messages.length === 0;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 flex items-center justify-center"
          >
            {/* Pulse Ring */}
            <div className="absolute inset-0 bg-brand-green rounded-full chatbot-pulse-ring pointer-events-none"></div>
            
            <button
              onClick={() => setIsOpen(true)}
              className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-brand-dark via-brand-green to-brand-light text-white shadow-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center group focus:outline-none"
              aria-label="Open Chatbot"
            >
              <svg className="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
              </svg>
              
              {/* Badge */}
              {showWelcome && (
                <span className="absolute -top-1 -right-1 bg-brand-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white shadow-sm animate-bounce">
                  AI
                </span>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95, transition: { duration: 0.2 } }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 flex flex-col sm:w-[400px] sm:h-[620px] bg-[#f8fafc] sm:rounded-2xl shadow-2xl overflow-hidden border border-gray-200"
            style={{ transformOrigin: 'bottom right' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-brand-dark via-brand-green to-brand-light p-4 flex items-center justify-between text-white shadow-md z-10">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <span className="text-xl">🌿</span>
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-lg leading-tight tracking-wide">AgroPlus AI</h3>
                  <p className="text-green-100 text-xs font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <ChatHistory messages={messages} />
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors focus:outline-none"
                  aria-label="Minimize"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto chatbot-messages bg-admin-bg/5 p-4 flex flex-col">
              {showWelcome ? (
                <ChatWelcome 
                  welcomeMessage={settings?.welcomeMessage} 
                  quickActions={settings?.quickActions} 
                  onQuickAction={handleSend} 
                />
              ) : (
                <div className="flex flex-col gap-2">
                  {messages.map((msg, index) => (
                    <ChatMessage key={msg.id || index} message={msg} serverUrl={SERVER_URL} />
                  ))}
                  {chatMutation.isPending && <TypingIndicator />}
                  <div ref={messagesEndRef} className="h-2" />
                </div>
              )}
            </div>

            {/* Footer Input */}
            <div className="p-3 sm:p-4 bg-white border-t border-gray-100 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-10">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full pr-1.5 pl-4 py-1.5 focus-within:ring-2 focus-within:ring-brand-green/20 focus-within:border-brand-green transition-all shadow-inner">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask about fertilizers, crops..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-gray-700 text-sm py-2 placeholder-gray-400"
                  disabled={chatMutation.isPending}
                  autoComplete="off"
                />
                
                <VoiceInput 
                  onTranscript={(text) => setInputValue(prev => prev ? `${prev} ${text}` : text)} 
                  disabled={chatMutation.isPending} 
                />
                
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || chatMutation.isPending}
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                    !inputValue.trim() || chatMutation.isPending
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-brand-green text-white hover:bg-brand-dark hover:shadow-md active:scale-95'
                  }`}
                  aria-label="Send"
                >
                  <svg className="w-5 h-5 ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12Zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              <div className="text-center mt-2">
                <p className="text-[10px] text-gray-400">AgroPlus AI can make mistakes. Verify important info.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
