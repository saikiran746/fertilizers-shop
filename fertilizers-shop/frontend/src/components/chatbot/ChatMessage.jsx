import React, { useState } from 'react';
import { motion } from 'framer-motion';

const formatTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Simple markdown parser for bold and bullet points
const renderMarkdown = (text) => {
  if (!text) return null;
  
  // Split by newlines first
  const lines = text.split('\n');
  
  return lines.map((line, i) => {
    // Empty lines
    if (line.trim() === '') return <br key={i} />;
    
    // Bullet points
    if (line.trim().startsWith('\u2022') || line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.substring(line.indexOf(' ') + 1);
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="text-brand-green mt-0.5">•</span>
          <span>{renderBold(content)}</span>
        </div>
      );
    }
    
    // Numbered lists (e.g. "1. ")
    if (/^\d+\.\s/.test(line.trim())) {
      const match = line.trim().match(/^(\d+\.)\s(.*)/);
      return (
        <div key={i} className="flex gap-2 my-1">
          <span className="text-brand-green font-medium mt-0.5">{match[1]}</span>
          <span>{renderBold(match[2])}</span>
        </div>
      );
    }
    
    // Normal lines with bold
    return <p key={i} className="my-1">{renderBold(line)}</p>;
  });
};

const renderBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-gray-900">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

const ChatMessage = ({ message, serverUrl }) => {
  const isUser = message.role === 'user';
  const [feedback, setFeedback] = useState(message.metadata?.feedbackRating || null);

  const handleFeedback = (rating) => {
    if (feedback) return; // Already rated
    setFeedback(rating);
    // In a real app, we would call the API here to save feedback
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex gap-2 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-green flex items-center justify-center shadow-md self-end mb-1">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
            </svg>
          </div>
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          <div className={`
            p-3.5 shadow-sm
            ${isUser 
              ? 'bg-gradient-to-br from-brand-green to-brand-light text-white rounded-2xl rounded-br-sm' 
              : 'bg-white border border-green-50 text-gray-800 rounded-2xl rounded-bl-sm'}
          `}>
            <div className={`text-sm leading-relaxed ${isUser ? '' : 'prose prose-sm max-w-none'}`}>
              {isUser ? message.content : renderMarkdown(message.content)}
            </div>
            
            {/* Product Recommendations (if any) */}
            {!isUser && message.metadata?.productsReferenced?.length > 0 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {message.metadata.productsReferenced.map((product, idx) => (
                  <a 
                    key={idx}
                    href={`/products/${typeof product === 'string' ? product : product._id}`}
                    className="flex-shrink-0 w-48 bg-green-50 rounded-lg p-2.5 border border-green-100 hover:border-brand-green hover:shadow-md transition-all group flex flex-col"
                  >
                    <div className="h-24 bg-white rounded flex items-center justify-center mb-2 overflow-hidden relative">
                      {product.image ? (
                        <img src={`${serverUrl}${product.image}`} alt={product.name} className="object-cover w-full h-full" />
                      ) : (
                        <span className="text-2xl">🌿</span>
                      )}
                      {product.inStock === false && (
                         <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-sm transform -rotate-12">OUT OF STOCK</span>
                         </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-brand-green mb-0.5">{product.name}</p>
                        <p className="text-[10px] text-gray-500 truncate mb-1.5">{product.category}</p>
                        
                        {product.benefits && (
                          <p className="text-[10px] text-brand-dark line-clamp-2 leading-tight mb-2 opacity-80">
                            ✨ {product.benefits}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto border-t border-green-100 pt-1.5">
                        <span className="text-xs font-bold text-gray-900">
                          {product.price > 0 ? `₹${product.price}` : 'Contact for Price'}
                        </span>
                        {product.inStock !== false && (
                          <span className="text-[10px] text-brand-green font-medium flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-green"></span> In Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
          
          {/* Timestamp and Actions */}
          <div className={`flex items-center mt-1 text-[10px] text-gray-400 ${isUser ? 'justify-end' : 'justify-start ml-1'}`}>
            <span>{formatTime(message.timestamp)}</span>
            
            {!isUser && (
              <div className="flex items-center ml-3 space-x-2">
                <button 
                  onClick={() => handleFeedback(5)}
                  className={`hover:text-brand-green transition-colors ${feedback && feedback >= 4 ? 'text-brand-green' : ''}`}
                  disabled={feedback !== null}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleFeedback(1)}
                  className={`hover:text-red-500 transition-colors ${feedback && feedback < 4 ? 'text-red-500' : ''}`}
                  disabled={feedback !== null}
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
