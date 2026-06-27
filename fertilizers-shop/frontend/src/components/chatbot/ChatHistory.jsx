import React from 'react';

const ChatHistory = ({ messages }) => {
  const downloadChat = () => {
    if (!messages || messages.length === 0) return;

    let textContent = "AGROPLUS AI - CHAT CONVERSATION HISTORY\n";
    textContent += "=======================================\n\n";

    messages.forEach(msg => {
      const date = new Date(msg.timestamp);
      const timeStr = date.toLocaleString();
      const sender = msg.role === 'user' ? 'You' : 'AgroPlus AI';
      
      textContent += `[${timeStr}] ${sender}:\n`;
      textContent += `${msg.content}\n\n`;
      
      if (msg.metadata?.productsReferenced?.length > 0) {
        textContent += `Recommended Products:\n`;
        msg.metadata.productsReferenced.forEach(p => {
          if (typeof p === 'object' && p.name) {
            textContent += `- ${p.name} (${p.category})\n`;
          }
        });
        textContent += `\n`;
      }
      
      textContent += `---------------------------------------\n\n`;
    });

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `agroplus-chat-${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button 
      onClick={downloadChat}
      className="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors focus:outline-none"
      title="Download Chat History"
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
    </button>
  );
};

export default ChatHistory;
